import type {
  NomosContract,
  IntentData,
  ProtocolMessage,
  EscalationTrigger,
} from '@/types/nomos';
import type { Negotiation, Execution } from '@/types/database';

// =============================================================================
// Escalation Evaluation (Beta Feature)
// =============================================================================

export interface EscalationResult {
  shouldEscalate: boolean;
  triggers: EscalationTrigger[];
  reason: string;
}

interface EscalationContext {
  contract: NomosContract;
  intent: IntentData;
  negotiation?: Negotiation;
  calculatedPrice?: number;
  consumerExecutionCount?: number;
}

// High value threshold in QAR
const HIGH_VALUE_THRESHOLD = 1000;

/**
 * Evaluates whether a negotiation should be escalated to human review
 * based on the business's configured triggers.
 *
 * Trigger logic:
 * - price_below_min: Consumer's max budget < business's minimum price
 * - custom_request: Intent has specifics that don't match standard capabilities
 * - out_of_zone: Intent zone is in surcharge zones (not primary)
 * - dispute: Negotiation state involves a dispute flag
 * - high_value: Price exceeds HIGH_VALUE_THRESHOLD
 * - first_time_customer: Consumer has no previous executions
 */
export function evaluateEscalation(ctx: EscalationContext): EscalationResult {
  const { contract, intent, negotiation, calculatedPrice, consumerExecutionCount } = ctx;
  const configuredTriggers = contract.agent_instructions.escalate_to_human.triggers;

  // If no triggers configured, don't escalate
  if (!configuredTriggers || configuredTriggers.length === 0) {
    return {
      shouldEscalate: false,
      triggers: [],
      reason: 'No escalation triggers configured',
    };
  }

  const triggeredList: EscalationTrigger[] = [];

  // Check each configured trigger
  for (const trigger of configuredTriggers) {
    const isTriggered = checkTrigger(
      trigger as EscalationTrigger,
      ctx
    );
    if (isTriggered) {
      triggeredList.push(trigger as EscalationTrigger);
    }
  }

  if (triggeredList.length > 0) {
    return {
      shouldEscalate: true,
      triggers: triggeredList,
      reason: `Escalation triggered: ${triggeredList.join(', ')}`,
    };
  }

  return {
    shouldEscalate: false,
    triggers: [],
    reason: 'No escalation triggers matched',
  };
}

/**
 * Check if a specific trigger condition is met.
 */
function checkTrigger(
  trigger: EscalationTrigger,
  ctx: EscalationContext
): boolean {
  const { contract, intent, negotiation, calculatedPrice, consumerExecutionCount } = ctx;

  switch (trigger) {
    case 'price_below_min': {
      // Consumer's max budget < business's minimum price
      const consumerMax = intent.budget?.max;
      if (consumerMax === undefined) return false;

      const minPrice = getMinimumPrice(contract);
      return consumerMax < minPrice;
    }

    case 'custom_request': {
      // Intent has specifics that suggest custom work
      return hasCustomRequirements(intent, contract);
    }

    case 'out_of_zone': {
      // Intent zone is in surcharge zones (not primary)
      const surchargeZones = contract.service_area.surcharge_zones || [];
      const primaryZones = contract.service_area.zones;
      const intentZone = intent.location.zone;

      // Out of zone if it's in surcharge list but not in primary list
      const isInSurcharge = surchargeZones.some((sz) => sz.zone === intentZone);
      const isInPrimary = primaryZones.includes(intentZone);

      return isInSurcharge && !isInPrimary;
    }

    case 'dispute': {
      // Check if negotiation has a dispute flag
      if (!negotiation) return false;

      // Check messages for dispute indicators
      const messages = negotiation.messages || [];
      return messages.some(
        (msg) =>
          msg.type === 'ESCALATE' &&
          (msg.data as { trigger?: string })?.trigger === 'dispute'
      );
    }

    case 'high_value': {
      // Price exceeds threshold
      if (calculatedPrice === undefined) return false;
      return calculatedPrice > HIGH_VALUE_THRESHOLD;
    }

    case 'first_time_customer': {
      // Consumer has no previous executions
      if (consumerExecutionCount === undefined) return false;
      return consumerExecutionCount === 0;
    }

    case 'max_rounds_exceeded': {
      // This is checked separately in the negotiation flow
      return false;
    }

    default:
      return false;
  }
}

/**
 * Get the minimum price from the contract's pricing rules.
 */
function getMinimumPrice(contract: NomosContract): number {
  const rules = contract.pricing.rules;
  if (rules.length === 0) return 0;

  return Math.min(...rules.map((r) => r.range[0]));
}

/**
 * Check if the intent has custom requirements outside standard capabilities.
 */
function hasCustomRequirements(
  intent: IntentData,
  contract: NomosContract
): boolean {
  const specifics = intent.specifics;
  if (!specifics) return false;

  // Check for explicit custom request flag
  if (specifics.is_custom === true) return true;
  if (specifics.custom_request === true) return true;

  // Check for specific requirements that don't match capabilities
  const capabilities = contract.service.capabilities;
  const constraints = contract.service.constraints;

  // Check if requested equipment/brand is not in supported list
  if (specifics.equipment_brand && constraints?.equipment_brands) {
    const requestedBrand = specifics.equipment_brand as string;
    if (!constraints.equipment_brands.includes(requestedBrand)) {
      return true;
    }
  }

  // Check if requested unit type is not in supported list
  if (specifics.unit_type && constraints?.unit_types) {
    const requestedType = specifics.unit_type as string;
    if (!constraints.unit_types.includes(requestedType)) {
      return true;
    }
  }

  // Check if area exceeds max
  if (specifics.area_sqm && constraints?.max_area_sqm) {
    const requestedArea = specifics.area_sqm as number;
    if (requestedArea > constraints.max_area_sqm) {
      return true;
    }
  }

  // Check for special instructions
  if (specifics.special_instructions || specifics.notes) {
    return true;
  }

  return false;
}

/**
 * Count COUNTER messages to check max rounds.
 */
export function countNegotiationRounds(messages: ProtocolMessage[]): number {
  return messages.filter((m) => m.type === 'COUNTER').length;
}

/**
 * Check if max negotiation rounds have been exceeded.
 */
export function checkMaxRoundsExceeded(
  messages: ProtocolMessage[],
  maxRounds?: number
): boolean {
  if (maxRounds === undefined) return false;

  const currentRounds = countNegotiationRounds(messages);
  return currentRounds >= maxRounds;
}
