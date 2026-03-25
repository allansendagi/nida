import type { Business } from '@/types/database';
import type { IntentData, NomosContract, ScoreBreakdown, SCORE_WEIGHTS } from '@/types/nomos';

interface MatchResult {
  business: Business;
  score: number;
  breakdown: ScoreBreakdown;
  rank: number;
}

const WEIGHTS: typeof SCORE_WEIGHTS = {
  category_match: 0.30,
  zone_match: 0.25,
  price_fit: 0.15,
  capacity: 0.15,
  trust_score: 0.15,
};

export function matchBusinessesToIntent(
  businesses: Business[],
  intent: IntentData,
  limit: number = 5
): MatchResult[] {
  const results: Omit<MatchResult, 'rank'>[] = [];

  for (const business of businesses) {
    const contract = business.nomos_contract as NomosContract;
    const breakdown = calculateScoreBreakdown(contract, intent, business);

    // Must match category and zone
    if (breakdown.category_match === 0 || breakdown.zone_match === 0) {
      continue;
    }

    const score = calculateCompositeScore(breakdown);

    results.push({
      business,
      score: Math.round(score * 100),
      breakdown: {
        category_match: Math.round(breakdown.category_match * 100),
        zone_match: Math.round(breakdown.zone_match * 100),
        price_fit: Math.round(breakdown.price_fit * 100),
        capacity: Math.round(breakdown.capacity * 100),
        trust_score: Math.round(breakdown.trust_score * 100),
      },
    });
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  // Add ranks and limit
  return results.slice(0, limit).map((result, index) => ({
    ...result,
    rank: index + 1,
  }));
}

function calculateScoreBreakdown(
  contract: NomosContract,
  intent: IntentData,
  business: Business
): ScoreBreakdown {
  return {
    category_match: scoreCategoryMatch(contract, intent.category),
    zone_match: scoreZoneMatch(contract, intent.location.zone),
    price_fit: scorePriceFit(contract, intent.budget),
    capacity: scoreCapacity(contract),
    trust_score: scoreTrustScore(business.trust_score),
  };
}

function calculateCompositeScore(breakdown: ScoreBreakdown): number {
  return (
    breakdown.category_match * WEIGHTS.category_match +
    breakdown.zone_match * WEIGHTS.zone_match +
    breakdown.price_fit * WEIGHTS.price_fit +
    breakdown.capacity * WEIGHTS.capacity +
    breakdown.trust_score * WEIGHTS.trust_score
  );
}

function scoreCategoryMatch(contract: NomosContract, intentCategory: string): number {
  const contractCategory = contract.service.category;
  const intentParts = intentCategory.split('.');
  const contractParts = contractCategory.split('.');

  // Exact match
  if (contractCategory === intentCategory) {
    return 1.0;
  }

  // Check if intent category is within contract's capabilities
  // e.g., contract: home_services.hvac.repair, intent: home_services.hvac.repair
  // or contract serves broader category

  // Match up to the specificity level of the contract
  let matchLevel = 0;
  for (let i = 0; i < Math.min(intentParts.length, contractParts.length); i++) {
    if (intentParts[i] === contractParts[i]) {
      matchLevel = i + 1;
    } else {
      break;
    }
  }

  // At least need to match main category (e.g., home_services.hvac)
  if (matchLevel >= 2) {
    // Check if intent service is in capabilities
    const intentService = intentParts[intentParts.length - 1];
    if (contract.service.capabilities.includes(intentService)) {
      return 1.0;
    }
    // Partial match
    return 0.7;
  }

  return 0;
}

function scoreZoneMatch(contract: NomosContract, intentZone: string): number {
  const { zones, surcharge_zones } = contract.service_area;

  if (zones.includes(intentZone)) {
    // Check if it's a surcharge zone
    const surcharge = surcharge_zones?.find((sz) => sz.zone === intentZone);
    if (surcharge) {
      // Still a match but slightly lower score due to surcharge
      return 0.9;
    }
    return 1.0;
  }

  return 0;
}

function scorePriceFit(
  contract: NomosContract,
  budget?: { min?: number; max?: number }
): number {
  if (!budget || (!budget.min && !budget.max)) {
    // No budget specified, neutral score
    return 0.5;
  }

  const rules = contract.pricing.rules;
  if (rules.length === 0) {
    return 0.5;
  }

  // Get the typical price range from contract
  const avgBase = rules.reduce((sum, r) => sum + r.base, 0) / rules.length;
  const minPrice = Math.min(...rules.map((r) => r.range[0]));
  const maxPrice = Math.max(...rules.map((r) => r.range[1]));

  // Check if budget overlaps with price range
  const budgetMin = budget.min || 0;
  const budgetMax = budget.max || Infinity;

  if (budgetMax < minPrice) {
    // Budget is below minimum - poor fit
    return 0.2;
  }

  if (budgetMin > maxPrice) {
    // Budget is above maximum - still okay, business can quote lower
    return 0.7;
  }

  // Calculate overlap
  const overlapStart = Math.max(budgetMin, minPrice);
  const overlapEnd = Math.min(budgetMax, maxPrice);
  const overlapSize = overlapEnd - overlapStart;
  const rangeSize = maxPrice - minPrice;

  if (rangeSize === 0) {
    return avgBase >= budgetMin && avgBase <= budgetMax ? 1.0 : 0.3;
  }

  return Math.min(1.0, 0.5 + (overlapSize / rangeSize) * 0.5);
}

function scoreCapacity(contract: NomosContract): number {
  const { current_load } = contract.availability.capacity;
  // Higher score when less loaded
  return 1.0 - current_load;
}

function scoreTrustScore(trustScore: number): number {
  // Normalize trust score (0-100) to 0-1
  return trustScore / 100;
}

export function filterByLeadTime(
  matches: MatchResult[],
  urgency: string
): MatchResult[] {
  const urgencyHours: Record<string, number> = {
    asap: 0,
    same_day: 4,
    next_day: 24,
    this_week: 72,
    flexible: 168,
  };

  const maxHours = urgencyHours[urgency] ?? 72;

  return matches.filter((match) => {
    const contract = match.business.nomos_contract as NomosContract;
    return contract.availability.lead_time_hours <= maxHours;
  });
}
