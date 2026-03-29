import { getAnthropicClient } from './client';
import {
  INTAKE_SYSTEM_PROMPT,
  buildIntakePrompt,
  formatConversationForIntake,
} from './intake-prompt';
import type { AIIntakeResult, IntentDataForIntake } from '@/types/intent';
import { createServiceClient } from '@/lib/supabase/server';
import type { ServiceCategory } from '@/types/database';

interface ConversationMessage {
  role: 'consumer' | 'assistant';
  content: string;
}

// Fetch categories from database
async function fetchCategories(): Promise<ServiceCategory[]> {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('service_categories')
      .select('*')
      .eq('is_active', true)
      .not('parent_id', 'is', null)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }

    // Filter to leaf categories (those with specifics_to_collect)
    return (data as ServiceCategory[]).filter(
      (c) => c.specifics_to_collect && c.specifics_to_collect.length > 0
    );
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export async function processIntake(
  messages: ConversationMessage[]
): Promise<AIIntakeResult> {
  const client = getAnthropicClient();

  // Fetch categories dynamically
  const categories = await fetchCategories();

  // Layer 2: Log category loading status for debugging
  console.log(`[Intake] Loaded ${categories.length} categories from database`);
  if (categories.length === 0) {
    console.warn('[Intake] WARNING: No categories loaded, using fallback prompt');
  } else {
    console.log(`[Intake] Categories: ${categories.map(c => c.name).slice(0, 5).join(', ')}...`);
  }

  // Use dynamic prompt if categories available, otherwise fall back to static
  const systemPrompt =
    categories.length > 0
      ? buildIntakePrompt(categories)
      : INTAKE_SYSTEM_PROMPT;

  const conversationHistory = formatConversationForIntake(messages);

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: `Process this conversation and extract service intent:\n\n${conversationHistory}\n\nRespond with JSON only.`,
      },
    ],
  });

  // Extract text content from response
  const textContent = response.content.find((block) => block.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text response from AI');
  }

  // Parse JSON from response
  const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No valid JSON in AI response');
  }

  try {
    const result = JSON.parse(jsonMatch[0]) as AIIntakeResult;

    // Log the AI's categorization for debugging
    console.log(`[Intake] AI categorized as: ${result.intent_data?.category || 'unknown'}`);
    console.log(`[Intake] AI confidence: ${result.confidence || 'not specified'}`);
    console.log(`[Intake] Complete: ${result.complete}`);

    // Layer 3: Add confidence-based clarification
    // If AI confidence is low and not complete, force a clarifying question
    if (result.confidence !== undefined && result.confidence < 0.7 && !result.complete) {
      const categoryName = result.intent_data?.category?.split('.').pop() || 'this service';
      result.clarifying_question = result.clarifying_question ||
        `Just to make sure - are you looking for ${categoryName} services?`;
      console.log(`[Intake] Low confidence (${result.confidence}), added clarifying question`);
    }

    return result;
  } catch {
    throw new Error('Failed to parse AI response as JSON');
  }
}

export async function generateClarifyingResponse(
  messages: ConversationMessage[],
  question: string
): Promise<string> {
  const client = getAnthropicClient();

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 256,
    system: `You are Nida, a friendly AI assistant helping people find services in Qatar. Keep responses brief and natural.`,
    messages: [
      {
        role: 'user',
        content: `Generate a friendly clarifying response. Previous conversation:\n${formatConversationForIntake(messages)}\n\nNext question to ask: ${question}\n\nGenerate a natural, brief message that asks this question.`,
      },
    ],
  });

  const textContent = response.content.find((block) => block.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    return question;
  }

  return textContent.text.trim();
}

export function validateIntentData(data: Partial<IntentDataForIntake>): {
  valid: boolean;
  missing: string[];
} {
  const missing: string[] = [];

  if (!data.category) missing.push('category');
  if (!data.location?.zone) missing.push('location');
  if (!data.urgency) missing.push('urgency');

  return {
    valid: missing.length === 0,
    missing,
  };
}
