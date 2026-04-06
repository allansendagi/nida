import type { NomosContract } from '@/types/nomos';
import { NOMOS_VERSION } from '@/types/nomos';

export interface BuilderState {
  // Step 1
  displayName: string;
  categoryKey: string;
  // Step 2
  capabilities: string[];
  // Step 3
  zones: string[];
  surchargeZones: string[];
  // Step 4
  pricingModel: 'fixed' | 'hourly' | 'tiered' | 'quote';
  priceBase: number;
  minPrice: number;
  maxPrice: number;
  urgencySameDay: number;
  urgencyNextDay: number;
  // Step 5
  operatingHours: Record<string, { open: string; close: string } | 'closed'>;
  leadTimeHours: number;
  maxDailyJobs: number;
  // Step 6
  warrantyDays: number;
  freeCancellationHours: number;
  cancellationFeePercent: number;
  // Step 7
  autoAcceptEnabled: boolean;
  autoAcceptMinPrice: number;
  autoAcceptMinLeadTime: number;
  escalationTriggers: string[];
  maxNegotiationRounds: number;
}

export const DEFAULT_STATE: BuilderState = {
  displayName: '',
  categoryKey: '',
  capabilities: [],
  zones: [],
  surchargeZones: [],
  pricingModel: 'tiered',
  priceBase: 350,
  minPrice: 200,
  maxPrice: 600,
  urgencySameDay: 1.5,
  urgencyNextDay: 1.2,
  operatingHours: {
    sunday:    { open: '08:00', close: '18:00' },
    monday:    { open: '08:00', close: '18:00' },
    tuesday:   { open: '08:00', close: '18:00' },
    wednesday: { open: '08:00', close: '18:00' },
    thursday:  { open: '08:00', close: '18:00' },
    friday:    'closed',
    saturday:  { open: '08:00', close: '14:00' },
  },
  leadTimeHours: 2,
  maxDailyJobs: 5,
  warrantyDays: 30,
  freeCancellationHours: 24,
  cancellationFeePercent: 20,
  autoAcceptEnabled: false,
  autoAcceptMinPrice: 0,
  autoAcceptMinLeadTime: 0,
  escalationTriggers: ['price_below_min', 'custom_request'],
  maxNegotiationRounds: 3,
};

export function buildContract(s: BuilderState): NomosContract {
  const entityId = crypto.randomUUID();
  const primaryCategory = s.capabilities.length > 0
    ? `${s.categoryKey}.${s.capabilities[0]}`
    : s.categoryKey;

  return {
    nomos_version: NOMOS_VERSION,
    contract_type: 'service_offering',
    issuer: {
      entity_id: entityId,
      display_name: s.displayName,
      trust_score: 50,
      verified: false,
    },
    service: {
      category: primaryCategory,
      capabilities: s.capabilities,
      constraints: {},
    },
    pricing: {
      model: s.pricingModel,
      currency: 'QAR',
      rules: s.capabilities.map((cap) => ({
        capability: cap,
        base: s.priceBase,
        range: [s.minPrice, s.maxPrice] as [number, number],
        negotiable: true,
      })),
      urgency_multiplier: {
        same_day: s.urgencySameDay,
        next_day: s.urgencyNextDay,
        this_week: 1.0,
      },
    },
    availability: {
      operating_hours: s.operatingHours,
      lead_time_hours: s.leadTimeHours,
      capacity: {
        max_daily_jobs: s.maxDailyJobs,
        current_load: 0.2,
      },
    },
    service_area: {
      zones: s.zones,
      surcharge_zones: s.surchargeZones.map((zone) => ({
        zone,
        percentage: 15,
      })),
    },
    terms: {
      warranty_days: s.warrantyDays,
      cancellation_policy: {
        free_cancellation_hours: s.freeCancellationHours,
        fee_percentage: s.cancellationFeePercent,
      },
    },
    agent_instructions: {
      auto_accept: {
        enabled: s.autoAcceptEnabled,
        conditions: s.autoAcceptEnabled ? {
          max_price: s.autoAcceptMinPrice > 0 ? undefined : undefined,
          min_lead_time_hours: s.autoAcceptMinLeadTime > 0 ? s.autoAcceptMinLeadTime : undefined,
          zones: s.zones,
        } : undefined,
      },
      escalate_to_human: {
        triggers: s.escalationTriggers,
      },
      max_negotiation_rounds: s.maxNegotiationRounds,
    },
    metadata: {
      published_at: new Date().toISOString(),
      version: 1,
      schema_ref: 'https://nomos.protocol/schema/v0.1.0/service_offering',
    },
  };
}
