import { getAnthropicClient } from './client';
import { INTAKE_SYSTEM_PROMPT, formatConversationForIntake } from './intake-prompt';
import type { AIIntakeResult, IntentDataForIntake } from '@/types/intent';

interface ConversationMessage {
  role: 'consumer' | 'assistant';
  content: string;
}

export async function processIntake(
  messages: ConversationMessage[]
): Promise<AIIntakeResult> {
  const client = getAnthropicClient();

  const conversationHistory = formatConversationForIntake(messages);

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: INTAKE_SYSTEM_PROMPT,
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
    system: `You are Nida, a friendly AI assistant helping people find home services in Qatar. Keep responses brief and natural.`,
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
