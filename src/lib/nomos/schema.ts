import { z } from 'zod';
import { NOMOS_VERSION } from '@/types/nomos';

// Zod schemas for NOMOS contract validation

export const NomosIssuerSchema = z.object({
  entity_id: z.string().uuid(),
  display_name: z.string().min(1),
  trust_score: z.number().min(0).max(100),
  verified: z.boolean(),
});

export const NomosServiceSchema = z.object({
  category: z.string().min(1),
  capabilities: z.array(z.string()).min(1),
  constraints: z.record(z.string(), z.unknown()).optional(),
});

export const NomosPricingRuleSchema = z.object({
  capability: z.string(),
  base: z.number().positive(),
  range: z.tuple([z.number(), z.number()]),
  negotiable: z.boolean(),
});

export const NomosPricingSchema = z.object({
  model: z.enum(['fixed', 'tiered', 'hourly', 'quote']),
  currency: z.string().length(3),
  rules: z.array(NomosPricingRuleSchema),
  urgency_multiplier: z.object({
    same_day: z.number().optional(),
    next_day: z.number().optional(),
    this_week: z.number().optional(),
  }).optional(),
});

export const NomosAvailabilitySchema = z.object({
  operating_hours: z.record(
    z.string(),
    z.union([
      z.object({ open: z.string(), close: z.string() }),
      z.literal('closed'),
    ])
  ),
  lead_time_hours: z.number().min(0),
  capacity: z.object({
    max_daily_jobs: z.number().positive(),
    current_load: z.number().min(0).max(1),
  }),
});

export const NomosServiceAreaSchema = z.object({
  zones: z.array(z.string()).min(1),
  surcharge_zones: z.array(
    z.object({
      zone: z.string(),
      percentage: z.number(),
    })
  ).optional(),
});

export const NomosTermsSchema = z.object({
  warranty_days: z.number().min(0),
  cancellation_policy: z.object({
    free_cancellation_hours: z.number().min(0),
    fee_percentage: z.number().min(0).max(100),
  }),
});

export const NomosAgentInstructionsSchema = z.object({
  auto_accept: z.object({
    enabled: z.boolean(),
    conditions: z.object({
      max_price: z.number().optional(),
      min_lead_time_hours: z.number().optional(),
      zones: z.array(z.string()).optional(),
    }).optional(),
  }),
  escalate_to_human: z.object({
    triggers: z.array(z.string()),
  }),
  max_negotiation_rounds: z.number().optional(),
});

export const NomosMetadataSchema = z.object({
  published_at: z.string().datetime(),
  version: z.number().int().positive(),
  schema_ref: z.string(),
});

export const NomosContractSchema = z.object({
  nomos_version: z.literal(NOMOS_VERSION),
  contract_type: z.literal('service_offering'),
  issuer: NomosIssuerSchema,
  service: NomosServiceSchema,
  pricing: NomosPricingSchema,
  availability: NomosAvailabilitySchema,
  service_area: NomosServiceAreaSchema,
  terms: NomosTermsSchema,
  agent_instructions: NomosAgentInstructionsSchema,
  metadata: NomosMetadataSchema,
});

export type ValidatedNomosContract = z.infer<typeof NomosContractSchema>;

export function validateNomosContract(contract: unknown): {
  success: boolean;
  data?: ValidatedNomosContract;
  errors?: z.ZodError;
} {
  const result = NomosContractSchema.safeParse(contract);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}
