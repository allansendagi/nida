import { createServiceClient } from '@/lib/supabase/server';
import { dispatchNotifications } from './dispatcher';
import { TEMPLATES } from './templates';
import { createEscalateMessage, appendMessage } from '@/lib/nomos/protocol';
import type { Business, Intent, Negotiation } from '@/types/database';
import type { IntentData, EscalationTrigger, ProtocolMessage } from '@/types/nomos';

// =============================================================================
// Escalation Notification Flow (Beta Feature)
// =============================================================================

export interface EscalationOptions {
  triggers: EscalationTrigger[];
  reason: string;
  context?: Record<string, unknown>;
}

export interface EscalationFlowResult {
  success: boolean;
  error?: string;
}

/**
 * Sends an escalation notification to the business owner.
 *
 * This function:
 * 1. Creates an ESCALATE protocol message with trigger info
 * 2. Updates negotiation state to 'escalated'
 * 3. Adds the ESCALATE message to the messages array
 * 4. Sends priority notification to business owner
 *
 * Auto-accept is blocked when escalation triggers fire.
 */
export async function sendEscalationNotification(
  negotiationId: string,
  options: EscalationOptions
): Promise<EscalationFlowResult> {
  const supabase = createServiceClient();
  const { triggers, reason, context = {} } = options;

  // Get negotiation with business and intent
  const { data: negotiation, error: negError } = await supabase
    .from('negotiations')
    .select(`
      *,
      business:businesses(*),
      intent:intents(*, consumer:consumers(*))
    `)
    .eq('id', negotiationId)
    .single();

  if (negError || !negotiation) {
    return { success: false, error: 'Negotiation not found' };
  }

  const business = negotiation.business as Business;
  const intent = negotiation.intent as Intent;

  // Create ESCALATE protocol message
  const escalateMessage = createEscalateMessage(
    triggers.join(','),
    {
      ...context,
      triggers,
      reason,
      timestamp: new Date().toISOString(),
    }
  );

  // Append to existing messages
  const currentMessages = (negotiation.messages || []) as ProtocolMessage[];
  const updatedMessages = appendMessage(currentMessages, escalateMessage);

  // Update negotiation state to 'escalated' and add message
  const { error: updateError } = await supabase
    .from('negotiations')
    .update({
      state: 'escalated',
      messages: updatedMessages,
      escalation_triggers: triggers, // Store for analytics if column exists
    })
    .eq('id', negotiationId);

  if (updateError) {
    console.error('Failed to update negotiation for escalation:', updateError);
    // Continue with notification even if update fails
  }

  // Send priority notification to business
  const intentData = intent.intent_data as IntentData;
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

  const result = await dispatchNotifications(
    [{
      negotiation: negotiation as Negotiation,
      business,
      intent,
    }],
    {
      template: TEMPLATES.ESCALATION,
    }
  );

  console.log(
    `Escalation notification sent for negotiation ${negotiationId}: ` +
    `triggers=[${triggers.join(', ')}], reason="${reason}"`
  );

  return { success: result.sent > 0 };
}

/**
 * Send auto-accepted notification to business.
 * Called after an offer is automatically accepted.
 */
export async function sendAutoAcceptedNotification(
  negotiationId: string
): Promise<EscalationFlowResult> {
  const supabase = createServiceClient();

  // Get negotiation with business and intent
  const { data: negotiation, error: negError } = await supabase
    .from('negotiations')
    .select(`
      *,
      business:businesses(*),
      intent:intents(*, consumer:consumers(*))
    `)
    .eq('id', negotiationId)
    .single();

  if (negError || !negotiation) {
    return { success: false, error: 'Negotiation not found' };
  }

  const result = await dispatchNotifications(
    [{
      negotiation: negotiation as Negotiation,
      business: negotiation.business as Business,
      intent: negotiation.intent as Intent,
    }],
    {
      template: TEMPLATES.AUTO_ACCEPTED,
    }
  );

  console.log(`Auto-accepted notification sent for negotiation ${negotiationId}`);

  return { success: result.sent > 0 };
}

/**
 * Check if escalation should block auto-accept.
 * Escalation always takes priority over auto-accept.
 */
export function escalationBlocksAutoAccept(
  triggers: EscalationTrigger[]
): boolean {
  // Any escalation trigger blocks auto-accept
  return triggers.length > 0;
}
