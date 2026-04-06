/**
 * Seed Service Categories into Supabase
 *
 * Populates the service_categories table with all categories defined in
 * migration 008_service_categories.sql.
 *
 * Safe to run multiple times — uses upsert on id.
 *
 * Usage:
 *   npx tsx scripts/seed-categories.ts
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

// ─── ALL CATEGORIES ────────────────────────────────────────────────────────────
// Mirrors exactly what's in supabase/migrations/008_service_categories.sql

const TOP_LEVEL = [
  { id: 'home_services',    parent_id: null, name: 'Home Services',       description: 'Home maintenance and repair services',         display_order: 1 },
  { id: 'automotive',       parent_id: null, name: 'Automotive',          description: 'Car and vehicle services',                     display_order: 2 },
  { id: 'personal_services',parent_id: null, name: 'Personal Services',   description: 'Personal care and lifestyle services',         display_order: 3 },
  { id: 'relocation',       parent_id: null, name: 'Relocation Services', description: 'Moving, housing, and relocation assistance',   display_order: 4 },
];

const MID_LEVEL = [
  { id: 'home_services.hvac',             parent_id: 'home_services', name: 'HVAC',             description: 'Air conditioning and heating services',      display_order: 1 },
  { id: 'home_services.plumbing',         parent_id: 'home_services', name: 'Plumbing',         description: 'Plumbing repair and installation',            display_order: 2 },
  { id: 'home_services.electrical',       parent_id: 'home_services', name: 'Electrical',       description: 'Electrical repair and installation',          display_order: 3 },
  { id: 'home_services.cleaning',         parent_id: 'home_services', name: 'Cleaning',         description: 'Cleaning services',                          display_order: 4 },
  { id: 'home_services.pest_control',     parent_id: 'home_services', name: 'Pest Control',     description: 'Pest removal and prevention',                 display_order: 5 },
  { id: 'home_services.appliance_repair', parent_id: 'home_services', name: 'Appliance Repair', description: 'Home appliance repair services',              display_order: 6 },
  { id: 'relocation.rental',   parent_id: 'relocation', name: 'Rental',    description: 'Finding rental properties',    display_order: 1 },
  { id: 'relocation.moving',   parent_id: 'relocation', name: 'Moving',    description: 'Moving and transport services', display_order: 2 },
  { id: 'relocation.storage',  parent_id: 'relocation', name: 'Storage',   description: 'Storage solutions',            display_order: 3 },
  { id: 'relocation.settling', parent_id: 'relocation', name: 'Settling In', description: 'Help settling into Qatar',  display_order: 4 },
];

const LEAF_CATEGORIES = [
  // HVAC
  { id: 'home_services.hvac.repair', parent_id: 'home_services.hvac', name: 'AC Repair',
    description: 'Fix AC not cooling, leaks, clicking noises, gas refill',
    keywords: ['ac','aircon','air conditioning','cooling','split','window unit','مكيف','تكييف'],
    common_phrases: ['my ac broke','ac not cooling','ac making noise','ac leaking','ac stopped working'],
    specifics_to_collect: ['unit_type','symptom','brand'] },

  { id: 'home_services.hvac.installation', parent_id: 'home_services.hvac', name: 'AC Installation',
    description: 'New AC unit installation, replacement units',
    keywords: ['install','new ac','ac setup','تركيب مكيف'],
    common_phrases: ['install new ac','need new ac unit','replace my ac'],
    specifics_to_collect: ['unit_type','room_count','budget'] },

  { id: 'home_services.hvac.maintenance', parent_id: 'home_services.hvac', name: 'AC Maintenance',
    description: 'Regular AC maintenance, servicing, checkups',
    keywords: ['service','maintain','checkup','صيانة'],
    common_phrases: ['ac service','ac maintenance','regular checkup'],
    specifics_to_collect: ['unit_count','last_service_date'] },

  { id: 'home_services.hvac.cleaning', parent_id: 'home_services.hvac', name: 'AC Cleaning',
    description: 'AC cleaning, filter replacement, duct cleaning',
    keywords: ['clean','filter','duct','تنظيف'],
    common_phrases: ['clean my ac','ac filter','dusty ac'],
    specifics_to_collect: ['unit_count','last_cleaned'] },

  // PLUMBING
  { id: 'home_services.plumbing.repair', parent_id: 'home_services.plumbing', name: 'Plumbing Repair',
    description: 'Leaky faucets, broken pipes, toilet issues',
    keywords: ['leak','pipe','faucet','toilet','tap','سباكة'],
    common_phrases: ['leaky faucet','pipe broken','toilet not working','water leak'],
    specifics_to_collect: ['issue_type','location_in_home'] },

  { id: 'home_services.plumbing.installation', parent_id: 'home_services.plumbing', name: 'Plumbing Installation',
    description: 'New fixtures, water heaters, pipe installation',
    keywords: ['install','heater','fixture','تركيب'],
    common_phrases: ['install water heater','new bathroom fixtures'],
    specifics_to_collect: ['fixture_type','brand_preference'] },

  { id: 'home_services.plumbing.emergency', parent_id: 'home_services.plumbing', name: 'Emergency Plumbing',
    description: 'Flooding, burst pipes, urgent plumbing issues',
    keywords: ['flood','burst','emergency','urgent','طوارئ'],
    common_phrases: ['pipe burst','flooding','water everywhere','emergency plumber'],
    specifics_to_collect: ['issue_description','water_shut_off'] },

  { id: 'home_services.plumbing.drain_cleaning', parent_id: 'home_services.plumbing', name: 'Drain Cleaning',
    description: 'Clogged drains, slow drainage, blocked pipes',
    keywords: ['clog','drain','blocked','slow','انسداد'],
    common_phrases: ['clogged drain','slow drain','blocked sink','water not draining'],
    specifics_to_collect: ['drain_location','severity'] },

  // ELECTRICAL
  { id: 'home_services.electrical.repair', parent_id: 'home_services.electrical', name: 'Electrical Repair',
    description: 'Outlets not working, flickering lights, electrical issues',
    keywords: ['outlet','light','switch','كهربائي'],
    common_phrases: ['outlet not working','lights flickering','no power'],
    specifics_to_collect: ['issue_type','affected_area'] },

  { id: 'home_services.electrical.installation', parent_id: 'home_services.electrical', name: 'Electrical Installation',
    description: 'New outlets, fixtures, fans, lighting',
    keywords: ['install','fan','fixture','تركيب'],
    common_phrases: ['install ceiling fan','add new outlet','install lights'],
    specifics_to_collect: ['installation_type','quantity'] },

  { id: 'home_services.electrical.wiring', parent_id: 'home_services.electrical', name: 'Electrical Wiring',
    description: 'Rewiring, electrical panels, major electrical work',
    keywords: ['wire','panel','rewire','أسلاك'],
    common_phrases: ['rewire house','electrical panel','old wiring'],
    specifics_to_collect: ['scope','building_age'] },

  { id: 'home_services.electrical.emergency', parent_id: 'home_services.electrical', name: 'Emergency Electrical',
    description: 'Power outages, sparking, urgent electrical issues',
    keywords: ['spark','outage','emergency','urgent','طوارئ'],
    common_phrases: ['sparks','no power','electrical emergency','smell burning'],
    specifics_to_collect: ['issue_description','safety_concern'] },

  // CLEANING
  { id: 'home_services.cleaning.deep_cleaning', parent_id: 'home_services.cleaning', name: 'Deep Cleaning',
    description: 'Thorough cleaning, spring cleaning, move-out cleaning',
    keywords: ['deep','thorough','spring','تنظيف عميق'],
    common_phrases: ['deep clean','thorough cleaning','spring cleaning'],
    specifics_to_collect: ['home_size','rooms','last_cleaned'] },

  { id: 'home_services.cleaning.regular', parent_id: 'home_services.cleaning', name: 'Regular Cleaning',
    description: 'Recurring housekeeping, weekly/monthly cleaning',
    keywords: ['regular','weekly','monthly','housekeeping','تنظيف منتظم'],
    common_phrases: ['regular cleaning','weekly cleaner','housekeeping service'],
    specifics_to_collect: ['frequency','home_size','special_requirements'] },

  { id: 'home_services.cleaning.move_in_out', parent_id: 'home_services.cleaning', name: 'Move-in/Move-out Cleaning',
    description: 'Cleaning for moving in or out of property',
    keywords: ['move','moving','vacate','انتقال'],
    common_phrases: ['moving out clean','move in cleaning','end of tenancy'],
    specifics_to_collect: ['property_size','move_date','furnished'] },

  { id: 'home_services.cleaning.carpet', parent_id: 'home_services.cleaning', name: 'Carpet Cleaning',
    description: 'Carpet and upholstery cleaning, stain removal',
    keywords: ['carpet','upholstery','rug','stain','سجاد'],
    common_phrases: ['clean carpet','stain removal','sofa cleaning'],
    specifics_to_collect: ['item_type','size','stain_type'] },

  // PEST CONTROL
  { id: 'home_services.pest_control.general', parent_id: 'home_services.pest_control', name: 'General Pest Control',
    description: 'General pest inspection and treatment',
    keywords: ['pest','bug','insect','مكافحة حشرات'],
    common_phrases: ['have pests','bug problem','need pest control'],
    specifics_to_collect: ['pest_type','severity','property_size'] },

  { id: 'home_services.pest_control.termites', parent_id: 'home_services.pest_control', name: 'Termite Control',
    description: 'Termite inspection and treatment',
    keywords: ['termite','wood','نمل أبيض'],
    common_phrases: ['termite problem','wood damage','termite inspection'],
    specifics_to_collect: ['property_type','visible_damage'] },

  { id: 'home_services.pest_control.rodents', parent_id: 'home_services.pest_control', name: 'Rodent Control',
    description: 'Rat and mouse removal, prevention',
    keywords: ['rat','mouse','rodent','فئران'],
    common_phrases: ['have rats','mouse problem','rodent infestation'],
    specifics_to_collect: ['sighting_frequency','entry_points'] },

  { id: 'home_services.pest_control.insects', parent_id: 'home_services.pest_control', name: 'Insect Control',
    description: 'Ants, roaches, bedbugs, other insects',
    keywords: ['ant','roach','cockroach','bedbug','صراصير'],
    common_phrases: ['roach problem','ant infestation','bedbugs','cockroaches'],
    specifics_to_collect: ['insect_type','affected_areas'] },

  // APPLIANCE REPAIR
  { id: 'home_services.appliance_repair.washing_machine', parent_id: 'home_services.appliance_repair', name: 'Washing Machine Repair',
    description: 'Washer repair, not spinning, leaking, not draining',
    keywords: ['washer','washing machine','laundry','غسالة'],
    common_phrases: ['washer broken','washing machine not working','washer leaking'],
    specifics_to_collect: ['brand','symptom','age'] },

  { id: 'home_services.appliance_repair.refrigerator', parent_id: 'home_services.appliance_repair', name: 'Refrigerator Repair',
    description: 'Fridge repair, not cooling, making noise',
    keywords: ['fridge','refrigerator','freezer','ثلاجة'],
    common_phrases: ['fridge not cooling','refrigerator broken','freezer not working'],
    specifics_to_collect: ['brand','symptom','type'] },

  { id: 'home_services.appliance_repair.oven', parent_id: 'home_services.appliance_repair', name: 'Oven/Stove Repair',
    description: 'Oven repair, stove not heating, gas issues',
    keywords: ['oven','stove','cooker','range','فرن'],
    common_phrases: ['oven not heating','stove broken','gas smell'],
    specifics_to_collect: ['type','brand','symptom'] },

  { id: 'home_services.appliance_repair.dishwasher', parent_id: 'home_services.appliance_repair', name: 'Dishwasher Repair',
    description: 'Dishwasher repair, not cleaning, not draining',
    keywords: ['dishwasher','dishes','غسالة صحون'],
    common_phrases: ['dishwasher not working','dishes not clean','dishwasher leaking'],
    specifics_to_collect: ['brand','symptom'] },

  // RELOCATION — Rental
  { id: 'relocation.rental.apartment_search', parent_id: 'relocation.rental', name: 'Apartment Search',
    description: 'Finding apartments and flats for rent',
    keywords: ['apartment','flat','rent','lease','studio','1br','2br','3br','شقة','إيجار'],
    common_phrases: ['looking for apartment','need a flat','searching for rental','apartment pearl','rent in lusail'],
    specifics_to_collect: ['bedrooms','budget','move_date','furnished','preferred_area'] },

  { id: 'relocation.rental.villa_search', parent_id: 'relocation.rental', name: 'Villa Search',
    description: 'Finding villas and compounds for rent',
    keywords: ['villa','compound','house','standalone','فيلا'],
    common_phrases: ['looking for villa','need a house','compound rental','villa with pool'],
    specifics_to_collect: ['bedrooms','budget','move_date','compound_preferred','pool_required'] },

  { id: 'relocation.rental.commercial', parent_id: 'relocation.rental', name: 'Commercial Space',
    description: 'Office and commercial property rental',
    keywords: ['office','commercial','shop','retail','مكتب','محل'],
    common_phrases: ['need office space','looking for shop','commercial rental'],
    specifics_to_collect: ['space_type','size_sqm','budget','location_preference'] },

  // RELOCATION — Moving
  { id: 'relocation.moving.full_service', parent_id: 'relocation.moving', name: 'Full Moving Service',
    description: 'Complete packing, transport, and unpacking',
    keywords: ['mover','moving','relocate','shift','packing','نقل','انتقال'],
    common_phrases: ['need movers','moving house','shifting','relocating','full service move'],
    specifics_to_collect: ['move_date','current_location','destination','home_size','floors'] },

  { id: 'relocation.moving.transport_only', parent_id: 'relocation.moving', name: 'Transport Only',
    description: 'Vehicle and transport for moving items',
    keywords: ['transport','truck','pickup','delivery','شاحنة'],
    common_phrases: ['need pickup truck','transport furniture','delivery service'],
    specifics_to_collect: ['item_description','pickup_location','dropoff_location','date'] },

  { id: 'relocation.moving.international', parent_id: 'relocation.moving', name: 'International Moving',
    description: 'International relocation and shipping',
    keywords: ['international','overseas','shipping','container','شحن دولي'],
    common_phrases: ['moving overseas','international shipping','relocating abroad','moving from abroad'],
    specifics_to_collect: ['origin_country','destination_country','volume','timeline'] },

  // RELOCATION — Storage
  { id: 'relocation.storage.self_storage', parent_id: 'relocation.storage', name: 'Self Storage',
    description: 'Self-storage units for personal items',
    keywords: ['storage','store','unit','تخزين'],
    common_phrases: ['need storage','store my stuff','storage unit'],
    specifics_to_collect: ['size_needed','duration','climate_controlled'] },

  { id: 'relocation.storage.furniture_storage', parent_id: 'relocation.storage', name: 'Furniture Storage',
    description: 'Furniture and large item storage',
    keywords: ['furniture','warehouse','أثاث'],
    common_phrases: ['store furniture','furniture warehouse','long term storage'],
    specifics_to_collect: ['items_description','duration','pickup_needed'] },

  // RELOCATION — Settling In
  { id: 'relocation.settling.visa_assistance', parent_id: 'relocation.settling', name: 'Visa Assistance',
    description: 'Help with visa and residence permit',
    keywords: ['visa','residence','permit','RP','إقامة','تأشيرة'],
    common_phrases: ['need visa help','residence permit','visa assistance'],
    specifics_to_collect: ['visa_type','nationality','employment_status'] },

  { id: 'relocation.settling.utilities_setup', parent_id: 'relocation.settling', name: 'Utilities Setup',
    description: 'Help setting up electricity, water, internet',
    keywords: ['electricity','water','internet','kahramaa','كهرماء'],
    common_phrases: ['setup utilities','need kahramaa','internet connection'],
    specifics_to_collect: ['property_type','services_needed'] },
];

async function upsertBatch(table: string, rows: object[]) {
  const { error } = await supabase.from(table).upsert(rows, { onConflict: 'id' });
  if (error) throw new Error(`${table} upsert failed: ${error.message}`);
}

async function main() {
  console.log('Seeding service_categories...\n');

  // Insert in dependency order: top-level → mid-level → leaf
  await upsertBatch('service_categories', TOP_LEVEL);
  console.log(`✓ ${TOP_LEVEL.length} top-level categories`);

  await upsertBatch('service_categories', MID_LEVEL);
  console.log(`✓ ${MID_LEVEL.length} mid-level categories`);

  await upsertBatch('service_categories', LEAF_CATEGORIES);
  console.log(`✓ ${LEAF_CATEGORIES.length} leaf categories`);

  const total = TOP_LEVEL.length + MID_LEVEL.length + LEAF_CATEGORIES.length;
  console.log(`\n✅ Done — ${total} categories seeded`);
  console.log('The AI intake will now use dynamic categories from the database.');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
