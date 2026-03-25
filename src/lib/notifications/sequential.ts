import { createServiceClient } from '@/lib/supabase/server';
import { dispatchNotifications } from './dispatcher';
import type { Business, Intent, Negotiation } from '@/types/database';
import type { IntentUrgency } from '@/types/nomos';

// =============================================================================
// Configuration
// =============================================================================

export interface DispatchConfig {
  timeoutMinutes: number;
  maxRank: number;
}

const DEFAULT_CONFIG: DispatchConfig = {
  timeoutMinutes: parseInt(process.env.OFFER_TIMEOUT_MINUTES || '15', 10),
  maxRank: parseInt(process.env.MAX_DISPATCH_RANK || '5', 10),
};

// Tiered timeouts based on urgency
const URGENCY_TIMEOUTS: Record<IntentUrgency, number> = {
  asap: 5,
  same_day: 10,
  next_day: 15,
  this_week: 15,
  flexible: 30,
};

function getTimeoutForUrgency(urgency: IntentUrgency, config: DispatchConfig): number {
  return URGENCY_TIMEOUTS[urgency] || config.timeoutMinutes;
}

// =============================================================================
// Start Sequential Dispatch
// =============================================================================

/**
 * Starts the sequential dispatch process for an intent.
 * Only notifies the #1 ranked provider initially.
 * Other providers remain in 'pending' state until escalation.
 */
export async function startSequentialDispatch(
  intentId: string,
  config: Partial<DispatchConfig> = {}
): Promise<{ success: boolean; offeredTo?: string; error?: string }> {
  const supabase = createServiceClient();
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // Get intent with urgency for timeout calculation
  const { data: intent, error: intentError } = await supabase
    .from('intents')
    .select('*, consumer:consumers(*)')
    .eq('id', intentId)
    .single();

  if (intentError || !intent) {
    return { success: false, error: 'Intent not found' };
  }

  const urgency = intent.intent_data?.urgency as IntentUrgency || 'this_week';
  const timeoutMinutes = getTimeoutForUrgency(urgency, finalConfig);

  // Get all negotiations for this intent, ordered by rank
  const { data: negotiations, error: negError } = await supabase
    .from('negotiations')
    .select('*, business:businesses(*)')
    .eq('intent_id', intentId)
    .order('match_rank', { ascending: true });

  if (negError || !negotiations || negotiations.length === 0) {
    return { success: false, error: 'No negotiations found' };
  }

  // Find the rank #1 negotiation
  const topNegotiation = negotiations.find(n => n.match_rank === 1);
  if (!topNegotiation) {
    return { success: false, error: 'No rank 1 negotiation found' };
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + timeoutMinutes * 60 * 1000);

  // Update intent with dispatch tracking
  const { error: updateIntentError } = await supabase
    .from('intents')
    .update({
      current_offer_rank: 1,
      offer_expires_at: expiresAt.toISOString(),
      dispatch_started_at: now.toISOString(),
    })
    .eq('id', intentId);

  if (updateIntentError) {
    return { success: false, error: `Failed to update intent: ${updateIntentError.message}` };
  }

  // Mark rank #1 as 'offered', others remain 'pending'
  const { error: updateNegError } = await supabase
    .from('negotiations')
    .update({
      offer_state: 'offered',
      offered_at: now.toISOString(),
    })
    .eq('id', topNegotiation.id);

  if (updateNegError) {
    return { success: false, error: `Failed to update negotiation: ${updateNegError.message}` };
  }

  // Dispatch notification to rank #1 only
  const result = await dispatchNotifications([{
    negotiation: topNegotiation as Negotiation,
    business: topNegotiation.business as Business,
    intent: intent as Intent,
  }]);

  console.log(`Sequential dispatch started for intent ${intentId}: offered to rank #1 (${topNegotiation.business.display_name}), expires at ${expiresAt.toISOString()}`);

  return {
    success: result.sent > 0,
    offeredTo: topNegotiation.business.display_name,
  };
}

// =============================================================================
// Accept Offer
// =============================================================================

/**
 * Accepts an offer - creates execution and cancels all other negotiations.
 */
export async function acceptOffer(
  negotiationId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServiceClient();

  // Get the negotiation with intent
  const { data: negotiation, error: negError } = await supabase
    .from('negotiations')
    .select('*, intent:intents(*)')
    .eq('id', negotiationId)
    .single();

  if (negError || !negotiation) {
    return { success: false, error: 'Negotiation not found' };
  }

  // Validate offer state
  if (negotiation.offer_state !== 'offered') {
    return { success: false, error: `Cannot accept: offer_state is '${negotiation.offer_state}'` };
  }

  // Check if expired
  const intent = negotiation.intent;
  if (intent.offer_expires_at && new Date(intent.offer_expires_at) < new Date()) {
    return { success: false, error: 'Offer has expired' };
  }

  const now = new Date().toISOString();

  // Update this negotiation to accepted
  const { error: updateError } = await supabase
    .from('negotiations')
    .update({
      offer_state: 'accepted',
      responded_at: now,
    })
    .eq('id', negotiationId);

  if (updateError) {
    return { success: false, error: `Failed to accept: ${updateError.message}` };
  }

  // Cancel all other negotiations for this intent
  const { error: cancelError } = await supabase
    .from('negotiations')
    .update({
      offer_state: 'cancelled',
    })
    .eq('intent_id', negotiation.intent_id)
    .neq('id', negotiationId);

  if (cancelError) {
    console.error('Failed to cancel other negotiations:', cancelError);
  }

  // Clear intent offer tracking
  const { error: intentError } = await supabase
    .from('intents')
    .update({
      current_offer_rank: null,
      offer_expires_at: null,
    })
    .eq('id', negotiation.intent_id);

  if (intentError) {
    console.error('Failed to clear intent offer tracking:', intentError);
  }

  console.log(`Offer accepted for negotiation ${negotiationId}`);

  return { success: true };
}

// =============================================================================
// Reject Offer
// =============================================================================

/**
 * Rejects an offer and escalates to the next provider.
 */
export async function rejectOffer(
  negotiationId: string,
  reason?: string
): Promise<{ success: boolean; escalatedTo?: string; error?: string }> {
  const supabase = createServiceClient();

  // Get the negotiation
  const { data: negotiation, error: negError } = await supabase
    .from('negotiations')
    .select('*')
    .eq('id', negotiationId)
    .single();

  if (negError || !negotiation) {
    return { success: false, error: 'Negotiation not found' };
  }

  // Validate offer state
  if (negotiation.offer_state !== 'offered') {
    return { success: false, error: `Cannot reject: offer_state is '${negotiation.offer_state}'` };
  }

  const now = new Date().toISOString();

  // Update this negotiation to rejected
  const { error: updateError } = await supabase
    .from('negotiations')
    .update({
      offer_state: 'rejected',
      responded_at: now,
      rejection_reason: reason || null,
    })
    .eq('id', negotiationId);

  if (updateError) {
    return { success: false, error: `Failed to reject: ${updateError.message}` };
  }

  console.log(`Offer rejected for negotiation ${negotiationId}${reason ? `: ${reason}` : ''}`);

  // Escalate to next provider
  return escalateToNextProvider(negotiation.intent_id);
}

// =============================================================================
// Escalate to Next Provider
// =============================================================================

/**
 * Escalates the offer to the next ranked provider.
 * Called after rejection or timeout.
 */
export async function escalateToNextProvider(
  intentId: string,
  config: Partial<DispatchConfig> = {}
): Promise<{ success: boolean; escalatedTo?: string; error?: string }> {
  const supabase = createServiceClient();
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // Get intent
  const { data: intent, error: intentError } = await supabase
    .from('intents')
    .select('*, consumer:consumers(*)')
    .eq('id', intentId)
    .single();

  if (intentError || !intent) {
    return { success: false, error: 'Intent not found' };
  }

  const currentRank = intent.current_offer_rank || 1;
  const nextRank = currentRank + 1;

  // Check if we've exhausted all providers
  if (nextRank > finalConfig.maxRank) {
    // Mark intent as no_providers
    await supabase
      .from('intents')
      .update({
        status: 'no_providers',
        current_offer_rank: null,
        offer_expires_at: null,
      })
      .eq('id', intentId);

    console.log(`All providers exhausted for intent ${intentId}, marked as no_providers`);
    return { success: false, error: 'All providers have been exhausted' };
  }

  // Find the next pending negotiation by rank
  const { data: nextNegotiation, error: nextNegError } = await supabase
    .from('negotiations')
    .select('*, business:businesses(*)')
    .eq('intent_id', intentId)
    .eq('offer_state', 'pending')
    .eq('match_rank', nextRank)
    .single();

  if (nextNegError || !nextNegotiation) {
    // No more pending negotiations at this rank, try the next one recursively
    // Update the intent rank first
    await supabase
      .from('intents')
      .update({ current_offer_rank: nextRank })
      .eq('id', intentId);

    return escalateToNextProvider(intentId, config);
  }

  const urgency = intent.intent_data?.urgency as IntentUrgency || 'this_week';
  const timeoutMinutes = getTimeoutForUrgency(urgency, finalConfig);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + timeoutMinutes * 60 * 1000);

  // Update intent with new rank and expiry
  const { error: updateIntentError } = await supabase
    .from('intents')
    .update({
      current_offer_rank: nextRank,
      offer_expires_at: expiresAt.toISOString(),
    })
    .eq('id', intentId);

  if (updateIntentError) {
    return { success: false, error: `Failed to update intent: ${updateIntentError.message}` };
  }

  // Mark next negotiation as offered
  const { error: updateNegError } = await supabase
    .from('negotiations')
    .update({
      offer_state: 'offered',
      offered_at: now.toISOString(),
    })
    .eq('id', nextNegotiation.id);

  if (updateNegError) {
    return { success: false, error: `Failed to update negotiation: ${updateNegError.message}` };
  }

  // Dispatch notification to next provider
  const result = await dispatchNotifications([{
    negotiation: nextNegotiation as Negotiation,
    business: nextNegotiation.business as Business,
    intent: intent as Intent,
  }]);

  console.log(`Escalated to rank #${nextRank} (${nextNegotiation.business.display_name}) for intent ${intentId}, expires at ${expiresAt.toISOString()}`);

  return {
    success: result.sent > 0,
    escalatedTo: nextNegotiation.business.display_name,
  };
}

// =============================================================================
// Process Expired Offers (Cron Job)
// =============================================================================

/**
 * Finds all expired offers and escalates them to the next provider.
 * Should be called by cron job every few minutes.
 */
export async function processExpiredOffers(
  config: Partial<DispatchConfig> = {}
): Promise<{ processed: number; escalated: number }> {
  const supabase = createServiceClient();
  const now = new Date().toISOString();

  // Find intents with expired offers
  const { data: expiredIntents, error } = await supabase
    .from('intents')
    .select('id, current_offer_rank')
    .eq('status', 'matching')
    .not('offer_expires_at', 'is', null)
    .lt('offer_expires_at', now);

  if (error || !expiredIntents) {
    console.error('Error fetching expired intents:', error);
    return { processed: 0, escalated: 0 };
  }

  let processed = 0;
  let escalated = 0;

  for (const intent of expiredIntents) {
    processed++;

    // Mark the current offer as expired
    const { error: expireError } = await supabase
      .from('negotiations')
      .update({ offer_state: 'expired' })
      .eq('intent_id', intent.id)
      .eq('offer_state', 'offered');

    if (expireError) {
      console.error(`Failed to expire negotiation for intent ${intent.id}:`, expireError);
      continue;
    }

    // Escalate to next provider
    const result = await escalateToNextProvider(intent.id, config);
    if (result.success) {
      escalated++;
    }
  }

  if (processed > 0) {
    console.log(`Processed ${processed} expired offers, escalated ${escalated}`);
  }

  return { processed, escalated };
}
