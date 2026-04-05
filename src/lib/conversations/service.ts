import { createServiceClient } from '@/lib/supabase/server';
import { processIntake, generateClarifyingResponse } from '@/lib/ai/intake';
import { matchBusinessesToIntent, filterByLeadTime } from '@/lib/nomos/discover';
import { createDiscoverMessage } from '@/lib/nomos/protocol';
import { startSequentialDispatch } from '@/lib/notifications';
import type { Conversation, ConversationMessage, Consumer, Intent } from '@/types/database';
import type { IntentData } from '@/types/nomos';
import type { IntentDataForIntake } from '@/types/intent';

export interface ProcessMessageResult {
  response: string;
  intentCreated: boolean;
  intentId?: string;
  conversationId: string;
  error?: string;
}

/**
 * Get or create a consumer by phone number or Telegram identifier
 * For Telegram users (tg:xxx format), stores the chat ID in telegram_chat_id field
 */
export async function getOrCreateConsumer(identifier: string): Promise<Consumer> {
  const supabase = createServiceClient();

  // Check if this is a Telegram identifier (tg:chatId format)
  if (identifier.startsWith('tg:')) {
    const chatId = identifier.slice(3);

    // Look for existing consumer by telegram_chat_id
    const { data: existing } = await supabase
      .from('consumers')
      .select('*')
      .eq('telegram_chat_id', chatId)
      .single();

    if (existing) {
      return existing as Consumer;
    }

    // Create new consumer with telegram_chat_id
    // Phone is set to tg:chatId temporarily until they provide their real phone
    const { data: newConsumer, error } = await supabase
      .from('consumers')
      .insert({
        telegram_chat_id: chatId,
        phone: identifier, // Temporary placeholder, will be updated when user shares contact
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create consumer: ${error.message}`);
    }

    return newConsumer as Consumer;
  }

  // Regular phone number flow (WhatsApp, etc.)
  // Try to find existing consumer by phone
  const { data: existing } = await supabase
    .from('consumers')
    .select('*')
    .eq('phone', identifier)
    .single();

  if (existing) {
    return existing as Consumer;
  }

  // Create new consumer with phone
  const { data: newConsumer, error } = await supabase
    .from('consumers')
    .insert({ phone: identifier })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create consumer: ${error.message}`);
  }

  return newConsumer as Consumer;
}

/**
 * Get active (non-complete) conversation for a phone number
 * Creates a new one if none exists
 */
export async function getOrCreateConversation(phone: string): Promise<Conversation> {
  const supabase = createServiceClient();

  // Get or create consumer first
  const consumer = await getOrCreateConsumer(phone);

  // Look for active conversation (not complete)
  const { data: existing } = await supabase
    .from('conversations')
    .select('*')
    .eq('phone', phone)
    .neq('state', 'complete')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (existing) {
    return existing as Conversation;
  }

  // Create new conversation
  const { data: newConversation, error } = await supabase
    .from('conversations')
    .insert({
      consumer_id: consumer.id,
      phone,
      state: 'greeting',
      partial_intent: {},
      messages: [],
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create conversation: ${error.message}`);
  }

  return newConversation as Conversation;
}

/**
 * Add a message to the conversation history
 */
export async function addMessageToConversation(
  conversationId: string,
  role: 'consumer' | 'assistant',
  content: string
): Promise<void> {
  const supabase = createServiceClient();

  const { data: conversation } = await supabase
    .from('conversations')
    .select('messages')
    .eq('id', conversationId)
    .single();

  if (!conversation) {
    throw new Error('Conversation not found');
  }

  const messages = (conversation.messages as ConversationMessage[]) || [];
  const newMessage: ConversationMessage = {
    role,
    content,
    timestamp: new Date().toISOString(),
  };

  await supabase
    .from('conversations')
    .update({
      messages: [...messages, newMessage],
    })
    .eq('id', conversationId);
}

/**
 * Main function to process an incoming message
 * Handles the full flow: AI intake → clarifying questions OR intent creation
 */
export async function processMessage(
  phone: string,
  messageText: string
): Promise<ProcessMessageResult> {
  const supabase = createServiceClient();

  try {
    // Get or create conversation
    const conversation = await getOrCreateConversation(phone);

    // Add consumer message to history
    await addMessageToConversation(conversation.id, 'consumer', messageText);

    // Get updated conversation with new message
    const { data: updatedConv } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversation.id)
      .single();

    if (!updatedConv) {
      throw new Error('Failed to get updated conversation');
    }

    const messages = (updatedConv.messages as ConversationMessage[]) || [];

    // Process through AI intake
    const aiMessages = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const intakeResult = await processIntake(aiMessages);

    // Check if AI has enough info to create intent
    if (intakeResult.complete && intakeResult.intent_data) {
      // Create the intent and start matching
      const { intent, response } = await completeConversation(
        conversation.id,
        updatedConv.consumer_id,
        intakeResult.intent_data as IntentDataForIntake
      );

      // Add assistant response to conversation
      await addMessageToConversation(conversation.id, 'assistant', response);

      return {
        response,
        intentCreated: true,
        intentId: intent.id,
        conversationId: conversation.id,
      };
    }

    // AI needs more info - generate clarifying response
    let clarifyingResponse: string;

    if (intakeResult.clarifying_question) {
      clarifyingResponse = await generateClarifyingResponse(
        aiMessages,
        intakeResult.clarifying_question
      );
    } else {
      // Fallback generic question
      clarifyingResponse = "I'd be happy to help you find a service provider. Could you tell me a bit more about what you need?";
    }

    // Update conversation state
    await supabase
      .from('conversations')
      .update({
        state: 'clarifying',
        partial_intent: intakeResult.intent_data || {},
      })
      .eq('id', conversation.id);

    // Add assistant response to conversation
    await addMessageToConversation(conversation.id, 'assistant', clarifyingResponse);

    return {
      response: clarifyingResponse,
      intentCreated: false,
      conversationId: conversation.id,
    };
  } catch (error) {
    console.error('Error processing message:', error);
    const errorMessage = "I'm sorry, I encountered an issue processing your request. Please try again.";

    return {
      response: errorMessage,
      intentCreated: false,
      conversationId: '',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Complete a conversation and create an intent
 * Runs business matching and starts sequential dispatch
 */
async function completeConversation(
  conversationId: string,
  consumerId: string,
  intentData: IntentDataForIntake
): Promise<{ intent: Intent; response: string }> {
  const supabase = createServiceClient();

  // Build full intent data
  const fullIntentData: IntentData = {
    category: intentData.category,
    location: {
      zone: intentData.location.zone,
      text: intentData.location.text,
    },
    budget: intentData.budget,
    urgency: intentData.urgency || 'this_week',
    specifics: intentData.specifics,
  };

  // Create intent
  const { data: intent, error: intentError } = await supabase
    .from('intents')
    .insert({
      consumer_id: consumerId,
      status: 'structured',
      intent_data: fullIntentData,
    })
    .select()
    .single();

  if (intentError) {
    throw new Error(`Failed to create intent: ${intentError.message}`);
  }

  // Mark conversation as complete and link intent
  await supabase
    .from('conversations')
    .update({
      state: 'complete',
      intent_id: intent.id,
    })
    .eq('id', conversationId);

  // Run business matching (DISCOVER phase)
  const { data: businesses } = await supabase
    .from('businesses')
    .select('*')
    .eq('approval_status', 'approved');

  let matches = matchBusinessesToIntent(businesses || [], fullIntentData, 5);
  matches = filterByLeadTime(matches, fullIntentData.urgency);

  // Create negotiation records for matches
  const negotiations = [];

  for (const match of matches) {
    const discoverMessage = createDiscoverMessage(
      match.score,
      match.rank,
      match.breakdown
    );

    const { data: negotiation, error: negError } = await supabase
      .from('negotiations')
      .insert({
        intent_id: intent.id,
        business_id: match.business.id,
        state: 'discovered',
        messages: [discoverMessage],
        match_score: match.score,
        score_breakdown: match.breakdown,
        match_rank: match.rank,
        offer_state: 'pending',
      })
      .select()
      .single();

    if (!negError && negotiation) {
      negotiations.push(negotiation);
    }
  }

  // Update intent status
  await supabase
    .from('intents')
    .update({ status: matches.length > 0 ? 'matching' : 'structured' })
    .eq('id', intent.id);

  // Start sequential dispatch (notifies rank #1)
  let dispatchMessage = '';
  if (negotiations.length > 0) {
    const dispatchResult = await startSequentialDispatch(intent.id);
    console.log(`Sequential dispatch started: offered to ${dispatchResult.offeredTo || 'none'}`);
    dispatchMessage = `We've found ${matches.length} service providers that match your needs. They're being notified now and will respond shortly.`;
  } else {
    dispatchMessage = "I've recorded your request, but we couldn't find matching service providers in your area right now. We'll notify you when someone becomes available.";
  }

  return {
    intent: intent as Intent,
    response: dispatchMessage,
  };
}

/**
 * Get conversation history for a phone number
 */
export async function getConversationHistory(phone: string): Promise<Conversation[]> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('phone', phone)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to get conversation history: ${error.message}`);
  }

  return (data || []) as Conversation[];
}
