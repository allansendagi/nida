// NOMOS Protocol Types - Version 0.1.0

export const NOMOS_VERSION = '0.1.0' as const;

// =============================================================================
// NOMOS Service Contract (.nomos)
// =============================================================================

export interface NomosIssuer {
  entity_id: string;
  display_name: string;
  trust_score: number;
  verified: boolean;
}

export interface NomosServiceConstraints {
  unit_types?: string[];
  max_area_sqm?: number;
  equipment_brands?: string[];
  [key: string]: unknown;
}

export interface NomosService {
  category: string; // e.g., "home_services.hvac.repair"
  capabilities: string[];
  constraints?: NomosServiceConstraints;
}

export interface NomosPricingRule {
  capability: string;
  base: number;
  range: [number, number];
  negotiable: boolean;
}

export interface NomosUrgencyMultiplier {
  same_day?: number;
  next_day?: number;
  this_week?: number;
}

export interface NomosPricing {
  model: 'fixed' | 'tiered' | 'hourly' | 'quote';
  currency: string;
  rules: NomosPricingRule[];
  urgency_multiplier?: NomosUrgencyMultiplier;
}

export interface NomosOperatingHours {
  [day: string]: { open: string; close: string } | 'closed';
}

export interface NomosCapacity {
  max_daily_jobs: number;
  current_load: number; // 0-1 percentage
}

export interface NomosAvailability {
  operating_hours: NomosOperatingHours;
  lead_time_hours: number;
  capacity: NomosCapacity;
}

export interface NomosServiceArea {
  zones: string[];
  surcharge_zones?: { zone: string; percentage: number }[];
}

export interface NomosCancellationPolicy {
  free_cancellation_hours: number;
  fee_percentage: number;
}

export interface NomosTerms {
  warranty_days: number;
  cancellation_policy: NomosCancellationPolicy;
}

export interface NomosAutoAcceptConditions {
  max_price?: number;
  min_lead_time_hours?: number;
  zones?: string[];
}

export interface NomosAgentInstructions {
  auto_accept: {
    enabled: boolean;
    conditions?: NomosAutoAcceptConditions;
  };
  escalate_to_human: {
    triggers: string[];
  };
  max_negotiation_rounds?: number;
}

export interface NomosMetadata {
  published_at: string;
  version: number;
  schema_ref: string;
}

export interface NomosContract {
  nomos_version: typeof NOMOS_VERSION;
  contract_type: 'service_offering';
  issuer: NomosIssuer;
  service: NomosService;
  pricing: NomosPricing;
  availability: NomosAvailability;
  service_area: NomosServiceArea;
  terms: NomosTerms;
  agent_instructions: NomosAgentInstructions;
  metadata: NomosMetadata;
}

// =============================================================================
// Agent Protocol Message Types
// =============================================================================

export type ProtocolMessageType =
  | 'DISCOVER'
  | 'PROPOSE'
  | 'COUNTER'
  | 'ACCEPT'
  | 'ESCALATE';

export type NegotiationState =
  | 'discovered'
  | 'proposed'
  | 'negotiating'
  | 'accepted'
  | 'executing'
  | 'settled'
  | 'escalated';

export interface DiscoverMessageData {
  score: number;
  rank: number;
  score_breakdown: ScoreBreakdown;
}

export interface ProposeMessageData {
  price: number;
  date: string;
  notes?: string;
}

export interface CounterMessageData {
  price: number;
  reason: string;
  round: number;
}

export interface AcceptMessageData {
  execution_id: string;
  agreed_terms: AgreedTerms;
}

export interface EscalateMessageData {
  trigger: string;
  context: Record<string, unknown>;
}

// =============================================================================
// Escalation Triggers (Beta)
// =============================================================================

export type EscalationTrigger =
  | 'price_below_min'
  | 'custom_request'
  | 'dispute'
  | 'out_of_zone'
  | 'high_value'
  | 'first_time_customer'
  | 'max_rounds_exceeded';

export const ESCALATION_TRIGGER_LABELS: Record<EscalationTrigger, string> = {
  price_below_min: 'Price below my minimum',
  custom_request: 'Custom/special requests',
  dispute: 'Dispute raised',
  out_of_zone: 'Out of primary zone',
  high_value: 'High value jobs (>1000 QAR)',
  first_time_customer: 'First-time customer',
  max_rounds_exceeded: 'Max negotiation rounds exceeded',
};

export const ESCALATION_TRIGGER_DESCRIPTIONS: Record<EscalationTrigger, string> = {
  price_below_min: "Consumer's budget is below your minimum price",
  custom_request: "Intent has specific requirements outside standard capabilities",
  dispute: 'A dispute has been raised during negotiation',
  out_of_zone: 'Location is in your surcharge zones, not primary zones',
  high_value: 'Job price exceeds 1000 QAR threshold',
  first_time_customer: 'Consumer has no previous completed jobs',
  max_rounds_exceeded: 'Too many counter-offers without resolution',
};

export type ProtocolMessageData =
  | DiscoverMessageData
  | ProposeMessageData
  | CounterMessageData
  | AcceptMessageData
  | EscalateMessageData;

export interface ProtocolMessage<T extends ProtocolMessageData = ProtocolMessageData> {
  type: ProtocolMessageType;
  timestamp: string;
  data: T;
}

// =============================================================================
// Scoring
// =============================================================================

export interface ScoreBreakdown {
  category_match: number;
  zone_match: number;
  price_fit: number;
  capacity: number;
  trust_score: number;
}

export const SCORE_WEIGHTS = {
  category_match: 0.30,
  zone_match: 0.25,
  price_fit: 0.15,
  capacity: 0.15,
  trust_score: 0.15,
} as const;

// =============================================================================
// Agreed Terms & Execution
// =============================================================================

export interface AgreedTerms {
  price: number;
  currency: string;
  date: string;
  warranty_days: number;
  payment_method: string;
  cancellation?: {
    free_until: string;
    fee: number;
  };
}

export interface ConsumerContact {
  phone: string;
  name: string;
}

// =============================================================================
// Intent
// =============================================================================

export interface IntentLocation {
  zone: string;
  text?: string;
  coordinates?: { lat: number; lng: number };
}

export interface IntentBudget {
  min?: number;
  max?: number;
}

export type IntentUrgency = 'asap' | 'same_day' | 'next_day' | 'this_week' | 'flexible';

export interface IntentData {
  category: string;
  location: IntentLocation;
  budget?: IntentBudget;
  urgency: IntentUrgency;
  specifics?: Record<string, unknown>;
}

export type IntentStatus =
  | 'intake'
  | 'structured'
  | 'matching'
  | 'negotiating'
  | 'executing'
  | 'settled'
  | 'no_providers'
  | 'cancelled';

// =============================================================================
// Service Categories
// =============================================================================
// Categories are now stored in the database (service_categories table).
// Fetch them via the /api/categories endpoint.
// This allows dynamic category management without code changes.
//
// Category format: "top_level.subcategory.service"
// Examples:
//   - home_services.hvac.repair
//   - relocation.rental.apartment_search
//   - personal_services.beauty.haircut
