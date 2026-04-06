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
  console.log(`[DISCOVER] ========== MATCHING START ==========`);
  console.log(`[DISCOVER] Intent category: ${intent.category}`);
  console.log(`[DISCOVER] Intent zone: ${intent.location.zone}`);
  console.log(`[DISCOVER] Total businesses to check: ${businesses.length}`);

  const results: Omit<MatchResult, 'rank'>[] = [];

  for (const business of businesses) {
    console.log(`[DISCOVER] --- Checking business: "${business.display_name}" ---`);
    console.log(`[DISCOVER]   Categories: ${JSON.stringify(business.categories)}`);
    console.log(`[DISCOVER]   Service zones: ${JSON.stringify(business.service_zones)}`);

    const contract = business.nomos_contract as NomosContract | null;

    // Businesses without NOMOS contracts are matched using basic fields only
    if (!contract) {
      const categoryScore = scoreCategoryMatchBasic(intent.category, business);
      const zoneScore = scoreZoneMatchBasic(intent.location.zone, business);

      if (categoryScore === 0 || zoneScore === 0) {
        console.log(`[DISCOVER]   ✗ Skipped (no contract, category=${categoryScore}, zone=${zoneScore})`);
        continue;
      }

      const breakdown: ScoreBreakdown = {
        category_match: Math.round(categoryScore * 100),
        zone_match: Math.round(zoneScore * 100),
        price_fit: 50, // neutral when no pricing data
        capacity: 70,  // assume available when no capacity data
        trust_score: Math.round(scoreTrustScore(business.trust_score) * 100),
      };
      const score = Math.round((
        categoryScore * WEIGHTS.category_match +
        zoneScore * WEIGHTS.zone_match +
        0.5 * WEIGHTS.price_fit +
        0.7 * WEIGHTS.capacity +
        scoreTrustScore(business.trust_score) * WEIGHTS.trust_score
      ) * 100);

      results.push({ business, score, breakdown });
      console.log(`[DISCOVER]   ✓ Matched (no contract) with score: ${score}`);
      continue;
    }

    const breakdown = calculateScoreBreakdown(contract, intent, business);

    console.log(`[DISCOVER]   Scores: category=${breakdown.category_match.toFixed(2)}, zone=${breakdown.zone_match.toFixed(2)}`);

    // Must match category and zone
    if (breakdown.category_match === 0 || breakdown.zone_match === 0) {
      console.log(`[DISCOVER]   ✗ Skipped (category=${breakdown.category_match}, zone=${breakdown.zone_match})`);
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
    console.log(`[DISCOVER]   ✓ Matched with score: ${Math.round(score * 100)}`);
  }

  // If no exact matches, try parent category fallback
  if (results.length === 0 && intent.category.includes('.')) {
    console.log(`[DISCOVER] No exact matches found, trying parent category fallback...`);
    const parentCategory = intent.category.split('.').slice(0, 2).join('.');
    console.log(`[DISCOVER] Parent category: ${parentCategory}`);

    for (const business of businesses) {
      const contract = business.nomos_contract as NomosContract | null;
      const businessCategories = business.categories || [];

      // Check if any business category shares the parent
      const hasParentMatch = businessCategories.some(cat => cat.startsWith(parentCategory));
      const zoneScore = contract
        ? scoreZoneMatch(contract, intent.location.zone)
        : scoreZoneMatchBasic(intent.location.zone, business);

      if (hasParentMatch && zoneScore > 0) {
        console.log(`[DISCOVER]   ✓ Parent fallback match: "${business.display_name}"`);
        const breakdown: ScoreBreakdown = {
          category_match: 0.6, // Lower score for fallback match
          zone_match: zoneScore,
          price_fit: contract ? scorePriceFit(contract, intent.budget) : 0.5,
          capacity: contract ? scoreCapacity(contract) : 0.7,
          trust_score: scoreTrustScore(business.trust_score),
        };
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
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  console.log(`[DISCOVER] ========== MATCHING COMPLETE ==========`);
  console.log(`[DISCOVER] Total matches: ${results.length}`);
  results.slice(0, limit).forEach((r, i) => {
    console.log(`[DISCOVER]   #${i + 1}: "${r.business.display_name}" (score: ${r.score})`);
  });

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
    category_match: scoreCategoryMatch(contract, intent.category, business),
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

function scoreCategoryMatch(contract: NomosContract, intentCategory: string, business: Business): number {
  // Layer 1: Check business.categories[] array first (primary source)
  const businessCategories = business.categories || [];
  const intentParts = intentCategory.split('.');
  const intentParent = intentParts.slice(0, -1).join('.'); // e.g., "home_services.plumbing"

  console.log(`[DISCOVER] Scoring category match for business "${business.display_name}"`);
  console.log(`[DISCOVER]   Intent category: ${intentCategory}`);
  console.log(`[DISCOVER]   Business categories: ${JSON.stringify(businessCategories)}`);

  // Exact match in categories array
  if (businessCategories.includes(intentCategory)) {
    console.log(`[DISCOVER]   ✓ Exact match in business.categories`);
    return 1.0;
  }

  // Parent category match (e.g., intent: plumbing.repair, business has plumbing.emergency)
  for (const bizCat of businessCategories) {
    // Check if business category starts with intent parent
    if (intentParent && bizCat.startsWith(intentParent + '.')) {
      console.log(`[DISCOVER]   ✓ Parent category match: ${bizCat} shares parent ${intentParent}`);
      return 0.8;
    }
    // Check if intent category starts with business category (business serves broader category)
    if (intentCategory.startsWith(bizCat + '.')) {
      console.log(`[DISCOVER]   ✓ Business serves broader category: ${bizCat}`);
      return 0.85;
    }
    // Check partial match at 2 levels (e.g., home_services.plumbing)
    const bizParts = bizCat.split('.');
    if (bizParts.length >= 2 && intentParts.length >= 2) {
      if (bizParts[0] === intentParts[0] && bizParts[1] === intentParts[1]) {
        console.log(`[DISCOVER]   ✓ Same sub-category match: ${bizParts[0]}.${bizParts[1]}`);
        return 0.75;
      }
    }
  }

  // Layer 2: Fallback to contract.service.category (legacy)
  const contractCategory = contract.service.category;
  const contractParts = contractCategory.split('.');

  // Exact match with contract category
  if (contractCategory === intentCategory) {
    console.log(`[DISCOVER]   ✓ Exact match in contract.service.category`);
    return 1.0;
  }

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
      console.log(`[DISCOVER]   ✓ Capability match: ${intentService}`);
      return 1.0;
    }
    // Partial match
    console.log(`[DISCOVER]   ~ Partial contract match at level ${matchLevel}`);
    return 0.7;
  }

  console.log(`[DISCOVER]   ✗ No category match found`);
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
    const contract = match.business.nomos_contract as NomosContract | null;
    // Businesses without contracts are assumed available (no lead time constraint)
    if (!contract) return true;
    return contract.availability.lead_time_hours <= maxHours;
  });
}

/**
 * Category match using business.categories[] only (no NOMOS contract needed)
 */
function scoreCategoryMatchBasic(intentCategory: string, business: Business): number {
  const categories = business.categories || [];
  if (categories.length === 0) return 0;

  const intentParts = intentCategory.split('.');
  const intentParent = intentParts.slice(0, -1).join('.');

  if (categories.includes(intentCategory)) return 1.0;

  for (const cat of categories) {
    if (intentParent && cat.startsWith(intentParent + '.')) return 0.8;
    if (intentCategory.startsWith(cat + '.')) return 0.85;
    const catParts = cat.split('.');
    if (catParts.length >= 2 && intentParts.length >= 2 &&
        catParts[0] === intentParts[0] && catParts[1] === intentParts[1]) return 0.75;
  }
  return 0;
}

/**
 * Zone match using business.service_zones[] only (no NOMOS contract needed)
 */
function scoreZoneMatchBasic(intentZone: string, business: Business): number {
  const zones = business.service_zones || [];
  return zones.includes(intentZone) ? 1.0 : 0;
}
