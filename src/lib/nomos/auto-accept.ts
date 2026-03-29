import type { NomosContract, IntentData, NomosAutoAcceptConditions } from '@/types/nomos';

// =============================================================================
// Auto-Accept Evaluation (Beta Feature)
// =============================================================================

export interface AutoAcceptResult {
  shouldAutoAccept: boolean;
  reason?: string;
  failedConditions?: string[];
}

interface AutoAcceptContext {
  contract: NomosContract;
  intent: IntentData;
  calculatedPrice: number;
}

/**
 * Evaluates whether an offer should be auto-accepted based on
 * the business's NOMOS contract agent instructions.
 *
 * All conditions must pass (AND logic):
 * - max_price: calculatedPrice ≤ conditions.max_price
 * - min_lead_time_hours: intent schedule is far enough out
 * - zones: intent.location.zone is in conditions.zones array
 */
export function evaluateAutoAccept(ctx: AutoAcceptContext): AutoAcceptResult {
  const { contract, intent, calculatedPrice } = ctx;
  const autoAccept = contract.agent_instructions.auto_accept;

  // Check if auto-accept is enabled
  if (!autoAccept.enabled) {
    return {
      shouldAutoAccept: false,
      reason: 'Auto-accept is not enabled',
    };
  }

  const conditions = autoAccept.conditions;

  // If no conditions specified, auto-accept all
  if (!conditions) {
    return {
      shouldAutoAccept: true,
      reason: 'Auto-accept enabled with no conditions',
    };
  }

  const failedConditions: string[] = [];

  // Check max_price condition
  if (conditions.max_price !== undefined) {
    if (calculatedPrice > conditions.max_price) {
      failedConditions.push(
        `Price ${calculatedPrice} QAR exceeds max ${conditions.max_price} QAR`
      );
    }
  }

  // Check min_lead_time_hours condition
  if (conditions.min_lead_time_hours !== undefined) {
    const leadTimeHours = calculateLeadTimeHours(intent);
    if (leadTimeHours < conditions.min_lead_time_hours) {
      failedConditions.push(
        `Lead time ${leadTimeHours}h is less than required ${conditions.min_lead_time_hours}h`
      );
    }
  }

  // Check zones condition
  if (conditions.zones && conditions.zones.length > 0) {
    if (!conditions.zones.includes(intent.location.zone)) {
      failedConditions.push(
        `Zone "${intent.location.zone}" is not in auto-accept zones`
      );
    }
  }

  if (failedConditions.length > 0) {
    return {
      shouldAutoAccept: false,
      reason: 'Some conditions not met',
      failedConditions,
    };
  }

  return {
    shouldAutoAccept: true,
    reason: 'All auto-accept conditions met',
  };
}

/**
 * Calculate the lead time in hours from now until the intent's scheduled time.
 * Uses urgency as a proxy if no specific schedule is provided.
 */
function calculateLeadTimeHours(intent: IntentData): number {
  // If intent has specific schedule info, use that
  if (intent.specifics?.scheduled_date) {
    const scheduledDate = new Date(intent.specifics.scheduled_date as string);
    const now = new Date();
    const diffMs = scheduledDate.getTime() - now.getTime();
    return Math.max(0, diffMs / (1000 * 60 * 60));
  }

  // Otherwise, use urgency as a proxy
  const urgencyHours: Record<string, number> = {
    asap: 1,
    same_day: 4,
    next_day: 24,
    this_week: 72,
    flexible: 168,
  };

  return urgencyHours[intent.urgency] ?? 24;
}

/**
 * Calculate the price for an intent based on the business contract.
 * This is used when evaluating auto-accept before a PROPOSE message.
 */
export function calculateIntentPrice(
  contract: NomosContract,
  intent: IntentData
): number {
  const pricing = contract.pricing;

  // Find matching pricing rule based on intent category
  const intentService = intent.category.split('.').pop() || '';
  const matchingRule = pricing.rules.find(
    (rule) => rule.capability === intentService
  );

  // Use the matching rule's base price, or the first rule's base as fallback
  const basePrice = matchingRule?.base ?? pricing.rules[0]?.base ?? 0;

  // Apply urgency multiplier if available
  let multiplier = 1.0;
  if (pricing.urgency_multiplier) {
    const urgencyKey = intent.urgency as keyof typeof pricing.urgency_multiplier;
    multiplier = pricing.urgency_multiplier[urgencyKey] ?? 1.0;
  }

  // Apply zone surcharge if applicable
  let zoneMultiplier = 1.0;
  const surchargeZone = contract.service_area.surcharge_zones?.find(
    (sz) => sz.zone === intent.location.zone
  );
  if (surchargeZone) {
    zoneMultiplier = 1 + surchargeZone.percentage / 100;
  }

  return Math.round(basePrice * multiplier * zoneMultiplier);
}

/**
 * Checks if auto-accept conditions match for a negotiation.
 * Convenience wrapper for the full evaluation.
 */
export function shouldAutoAcceptOffer(
  contract: NomosContract,
  intent: IntentData
): AutoAcceptResult {
  const calculatedPrice = calculateIntentPrice(contract, intent);
  return evaluateAutoAccept({ contract, intent, calculatedPrice });
}
