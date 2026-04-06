/**
 * Seed Test Businesses for NIDA Development
 *
 * Creates realistic test providers covering key Qatar zones and service categories.
 * These simulate real businesses so the matching pipeline has data to work with.
 *
 * Usage:
 *   npx tsx scripts/seed-businesses.ts
 *
 * Options:
 *   --clear   Delete existing seed businesses before inserting (safe — only removes seeded ones)
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// All Qatar zones used in matching
const ALL_ZONES = [
  'the_pearl', 'west_bay', 'lusail', 'al_sadd', 'al_wakra',
  'al_khor', 'dafna', 'bin_mahmoud', 'musheireb', 'old_airport',
  'industrial_area', 'al_rayyan', 'al_gharrafa', 'umm_salal', 'al_duhail',
];

function makeContract(category: string, capabilities: string[], zones: string[], priceBase: number) {
  return {
    nomos_version: '0.1.0',
    contract_type: 'service_offering',
    issuer: {
      entity_id: crypto.randomUUID(),
      display_name: 'Seed Business',
      trust_score: 70,
      verified: false,
    },
    service: {
      category,
      capabilities,
      constraints: {},
    },
    pricing: {
      model: 'tiered',
      currency: 'QAR',
      rules: capabilities.map(cap => ({
        capability: cap,
        base: priceBase,
        range: [Math.round(priceBase * 0.6), Math.round(priceBase * 1.8)],
        negotiable: true,
      })),
      urgency_multiplier: { same_day: 1.3, asap: 1.6 },
    },
    availability: {
      operating_hours: {
        monday: { open: '08:00', close: '20:00' },
        tuesday: { open: '08:00', close: '20:00' },
        wednesday: { open: '08:00', close: '20:00' },
        thursday: { open: '08:00', close: '20:00' },
        friday: 'closed',
        saturday: { open: '08:00', close: '16:00' },
        sunday: { open: '08:00', close: '18:00' },
      },
      lead_time_hours: 2,
      capacity: { max_daily_jobs: 5, current_load: 0.3 },
    },
    service_area: {
      zones,
      surcharge_zones: [],
    },
    terms: {
      warranty_days: 30,
      cancellation_policy: { free_cancellation_hours: 2, fee_percentage: 20 },
    },
    agent_instructions: {
      auto_accept: { enabled: false },
      escalate_to_human: { triggers: ['price_below_min', 'custom_request'] },
      max_negotiation_rounds: 3,
    },
    metadata: {
      published_at: new Date().toISOString(),
      version: 1,
      schema_ref: 'https://nomos.protocol/schema/v0.1.0/service_offering',
    },
  };
}

interface SeedBusiness {
  display_name: string;
  phone: string;
  email: string;
  categories: string[];
  service_zones: string[];
  trust_score: number;
  subscription_tier: string;
  approval_status: string;
  nomos_contract: object;
  notification_preferences: object;
  _seed_marker: string; // for cleanup
}

const SEED_BUSINESSES: Omit<SeedBusiness, 'nomos_contract'>[] = [
  // ── PLUMBING ───────────────────────────────────────────────────────────────
  {
    display_name: 'Al Amal Plumbing Services',
    phone: '+97430012001',
    email: 'alamal.plumbing@test.nida.qa',
    categories: ['home_services.plumbing.repair', 'home_services.plumbing.emergency', 'home_services.plumbing.drain_cleaning'],
    service_zones: ['west_bay', 'the_pearl', 'dafna', 'bin_mahmoud', 'musheireb'],
    trust_score: 82,
    subscription_tier: 'trial',
    approval_status: 'approved',
    notification_preferences: { channels: ['whatsapp', 'telegram'], instant_alerts: true },
    _seed_marker: 'seed_v1',
  },
  {
    display_name: 'Gulf Flow Plumbing',
    phone: '+97430012002',
    email: 'gulfflow@test.nida.qa',
    categories: ['home_services.plumbing.repair', 'home_services.plumbing.installation', 'home_services.plumbing.drain_cleaning'],
    service_zones: ['lusail', 'al_sadd', 'al_gharrafa', 'al_duhail', 'al_rayyan'],
    trust_score: 75,
    subscription_tier: 'trial',
    approval_status: 'approved',
    notification_preferences: { channels: ['whatsapp'], instant_alerts: true },
    _seed_marker: 'seed_v1',
  },
  {
    display_name: 'Doha Emergency Plumbers',
    phone: '+97430012003',
    email: 'doha.emergency.plumbing@test.nida.qa',
    categories: ['home_services.plumbing.emergency', 'home_services.plumbing.repair'],
    service_zones: ALL_ZONES,
    trust_score: 88,
    subscription_tier: 'trial',
    approval_status: 'approved',
    notification_preferences: { channels: ['whatsapp', 'telegram'], instant_alerts: true },
    _seed_marker: 'seed_v1',
  },

  // ── HVAC / AC ──────────────────────────────────────────────────────────────
  {
    display_name: 'CoolTech AC Services',
    phone: '+97430013001',
    email: 'cooltech@test.nida.qa',
    categories: ['home_services.hvac.repair', 'home_services.hvac.maintenance', 'home_services.hvac.installation'],
    service_zones: ['west_bay', 'the_pearl', 'dafna', 'lusail', 'al_sadd'],
    trust_score: 79,
    subscription_tier: 'trial',
    approval_status: 'approved',
    notification_preferences: { channels: ['whatsapp', 'telegram'], instant_alerts: true },
    _seed_marker: 'seed_v1',
  },
  {
    display_name: 'Arctic Air Qatar',
    phone: '+97430013002',
    email: 'arctic.air@test.nida.qa',
    categories: ['home_services.hvac.repair', 'home_services.hvac.cleaning', 'home_services.hvac.installation'],
    service_zones: ['al_wakra', 'al_khor', 'old_airport', 'industrial_area', 'umm_salal', 'al_rayyan'],
    trust_score: 71,
    subscription_tier: 'trial',
    approval_status: 'approved',
    notification_preferences: { channels: ['whatsapp'], instant_alerts: true },
    _seed_marker: 'seed_v1',
  },

  // ── ELECTRICAL ─────────────────────────────────────────────────────────────
  {
    display_name: 'Spark Electric Qatar',
    phone: '+97430014001',
    email: 'spark.electric@test.nida.qa',
    categories: ['home_services.electrical.repair', 'home_services.electrical.installation', 'home_services.electrical.emergency'],
    service_zones: ['west_bay', 'the_pearl', 'dafna', 'bin_mahmoud', 'musheireb', 'al_sadd'],
    trust_score: 83,
    subscription_tier: 'trial',
    approval_status: 'approved',
    notification_preferences: { channels: ['whatsapp', 'telegram'], instant_alerts: true },
    _seed_marker: 'seed_v1',
  },
  {
    display_name: 'Power Pro Electricians',
    phone: '+97430014002',
    email: 'powerpro@test.nida.qa',
    categories: ['home_services.electrical.repair', 'home_services.electrical.wiring'],
    service_zones: ['lusail', 'al_gharrafa', 'al_duhail', 'al_rayyan', 'umm_salal'],
    trust_score: 69,
    subscription_tier: 'trial',
    approval_status: 'approved',
    notification_preferences: { channels: ['whatsapp'], instant_alerts: true },
    _seed_marker: 'seed_v1',
  },

  // ── CLEANING ───────────────────────────────────────────────────────────────
  {
    display_name: 'Pearl Clean Home Services',
    phone: '+97430015001',
    email: 'pearlclean@test.nida.qa',
    categories: ['home_services.cleaning.deep_cleaning', 'home_services.cleaning.regular', 'home_services.cleaning.move_in_out'],
    service_zones: ['the_pearl', 'west_bay', 'dafna', 'lusail', 'musheireb'],
    trust_score: 91,
    subscription_tier: 'trial',
    approval_status: 'approved',
    notification_preferences: { channels: ['whatsapp', 'telegram'], instant_alerts: true },
    _seed_marker: 'seed_v1',
  },
  {
    display_name: 'Maid Easy Qatar',
    phone: '+97430015002',
    email: 'maideasy@test.nida.qa',
    categories: ['home_services.cleaning.regular', 'home_services.cleaning.deep_cleaning'],
    service_zones: ALL_ZONES,
    trust_score: 77,
    subscription_tier: 'trial',
    approval_status: 'approved',
    notification_preferences: { channels: ['whatsapp'], instant_alerts: true },
    _seed_marker: 'seed_v1',
  },

  // ── APPLIANCE REPAIR ───────────────────────────────────────────────────────
  {
    display_name: 'FixIt Appliance Repair',
    phone: '+97430016001',
    email: 'fixit.appliance@test.nida.qa',
    categories: [
      'home_services.appliance_repair.washing_machine',
      'home_services.appliance_repair.refrigerator',
      'home_services.appliance_repair.oven',
    ],
    service_zones: ['west_bay', 'the_pearl', 'al_sadd', 'dafna', 'bin_mahmoud', 'musheireb'],
    trust_score: 74,
    subscription_tier: 'trial',
    approval_status: 'approved',
    notification_preferences: { channels: ['whatsapp', 'telegram'], instant_alerts: true },
    _seed_marker: 'seed_v1',
  },

  // ── PEST CONTROL ───────────────────────────────────────────────────────────
  {
    display_name: 'Gulf Shield Pest Control',
    phone: '+97430017001',
    email: 'gulfshield.pest@test.nida.qa',
    categories: ['home_services.pest_control.general', 'home_services.pest_control.insects', 'home_services.pest_control.rodents'],
    service_zones: ALL_ZONES,
    trust_score: 86,
    subscription_tier: 'trial',
    approval_status: 'approved',
    notification_preferences: { channels: ['whatsapp', 'telegram'], instant_alerts: true },
    _seed_marker: 'seed_v1',
  },

  // ── MOVING / RELOCATION ────────────────────────────────────────────────────
  {
    display_name: 'Qatar Movers Pro',
    phone: '+97430018001',
    email: 'qatarmovers@test.nida.qa',
    categories: ['relocation.moving.full_service', 'relocation.moving.transport_only'],
    service_zones: ALL_ZONES,
    trust_score: 80,
    subscription_tier: 'trial',
    approval_status: 'approved',
    notification_preferences: { channels: ['whatsapp'], instant_alerts: true },
    _seed_marker: 'seed_v1',
  },
];

const CATEGORY_PRICING: Record<string, { base: number; capabilities: string[] }> = {
  'home_services.plumbing': { base: 250, capabilities: ['repair', 'installation', 'emergency', 'drain_cleaning'] },
  'home_services.hvac': { base: 350, capabilities: ['repair', 'maintenance', 'installation', 'cleaning'] },
  'home_services.electrical': { base: 200, capabilities: ['repair', 'installation', 'wiring', 'emergency'] },
  'home_services.cleaning': { base: 150, capabilities: ['deep_cleaning', 'regular', 'move_in_out', 'carpet'] },
  'home_services.appliance_repair': { base: 180, capabilities: ['repair', 'diagnosis', 'parts_replacement'] },
  'home_services.pest_control': { base: 300, capabilities: ['general', 'insects', 'rodents', 'termites'] },
  'relocation.moving': { base: 800, capabilities: ['full_service', 'transport_only', 'packing'] },
};

function getPricingForCategories(categories: string[]) {
  for (const cat of categories) {
    const prefix = cat.split('.').slice(0, 2).join('.');
    if (CATEGORY_PRICING[prefix]) return CATEGORY_PRICING[prefix];
  }
  return { base: 200, capabilities: ['general'] };
}

async function main() {
  const shouldClear = process.argv.includes('--clear');

  if (shouldClear) {
    console.log('Clearing existing seed businesses...');
    const { error } = await supabase
      .from('businesses')
      .delete()
      .like('email', '%@test.nida.qa');

    if (error) {
      console.error('Failed to clear seed businesses:', error.message);
    } else {
      console.log('Cleared.\n');
    }
  }

  console.log(`Seeding ${SEED_BUSINESSES.length} test businesses...\n`);
  let inserted = 0;
  let skipped = 0;

  for (const biz of SEED_BUSINESSES) {
    const pricing = getPricingForCategories(biz.categories);
    const primaryCategory = biz.categories[0].split('.').slice(0, 2).join('.');

    const contract = makeContract(
      biz.categories[0],
      pricing.capabilities,
      biz.service_zones,
      pricing.base
    );

    const record = {
      display_name: biz.display_name,
      phone: biz.phone,
      email: biz.email,
      categories: biz.categories,
      service_zones: biz.service_zones,
      trust_score: biz.trust_score,
      subscription_tier: biz.subscription_tier,
      approval_status: biz.approval_status,
      nomos_contract: contract,
      notification_preferences: biz.notification_preferences,
    };

    const { error } = await supabase
      .from('businesses')
      .upsert(record, { onConflict: 'phone' });

    if (error) {
      console.error(`  ✗ ${biz.display_name}: ${error.message}`);
      skipped++;
    } else {
      console.log(`  ✓ ${biz.display_name} [${primaryCategory}] — ${biz.service_zones.length} zones`);
      inserted++;
    }
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`Seeded: ${inserted} businesses`);
  if (skipped > 0) console.log(`Skipped: ${skipped} (already exist or error)`);
  console.log(`\nRun your test now — all major categories and zones are covered.`);
}

main().catch(console.error);
