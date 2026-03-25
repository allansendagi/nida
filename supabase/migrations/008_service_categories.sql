-- Migration: Dynamic Service Categories
-- This migration creates a service_categories table to replace hardcoded categories
-- Categories are now managed via database, allowing dynamic updates without redeployment

-- Create the service_categories table
CREATE TABLE service_categories (
  id TEXT PRIMARY KEY,                              -- e.g., 'relocation.rental.apartment_search'
  parent_id TEXT REFERENCES service_categories(id), -- Hierarchical structure
  name TEXT NOT NULL,                               -- Display name: 'Apartment Search'
  description TEXT NOT NULL,                        -- For AI: 'Finding apartments and flats for rent'
  keywords TEXT[] DEFAULT '{}',                     -- Synonyms: ['apartment', 'flat', 'rent']
  common_phrases TEXT[] DEFAULT '{}',               -- User phrases: ['looking for apartment', 'need a flat']
  specifics_to_collect TEXT[] DEFAULT '{}',         -- What to ask: ['bedrooms', 'budget', 'move_date']
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_service_categories_parent ON service_categories(parent_id);
CREATE INDEX idx_service_categories_active ON service_categories(is_active);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_service_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_service_categories_updated_at
  BEFORE UPDATE ON service_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_service_categories_updated_at();

-- Seed data: Top-level categories
INSERT INTO service_categories (id, parent_id, name, description, display_order) VALUES
  ('home_services', NULL, 'Home Services', 'Home maintenance and repair services', 1),
  ('automotive', NULL, 'Automotive', 'Car and vehicle services', 2),
  ('personal_services', NULL, 'Personal Services', 'Personal care and lifestyle services', 3),
  ('relocation', NULL, 'Relocation Services', 'Moving, housing, and relocation assistance', 4);

-- Home Services - Subcategories
INSERT INTO service_categories (id, parent_id, name, description, display_order) VALUES
  ('home_services.hvac', 'home_services', 'HVAC', 'Air conditioning and heating services', 1),
  ('home_services.plumbing', 'home_services', 'Plumbing', 'Plumbing repair and installation', 2),
  ('home_services.electrical', 'home_services', 'Electrical', 'Electrical repair and installation', 3),
  ('home_services.cleaning', 'home_services', 'Cleaning', 'Cleaning services', 4),
  ('home_services.pest_control', 'home_services', 'Pest Control', 'Pest removal and prevention', 5),
  ('home_services.appliance_repair', 'home_services', 'Appliance Repair', 'Home appliance repair services', 6);

-- Home Services - HVAC Services (leaf nodes)
INSERT INTO service_categories (id, parent_id, name, description, keywords, common_phrases, specifics_to_collect) VALUES
  ('home_services.hvac.repair', 'home_services.hvac', 'AC Repair',
   'Fix AC not cooling, leaks, clicking noises, gas refill',
   ARRAY['ac', 'aircon', 'air conditioning', 'cooling', 'split', 'window unit', 'مكيف', 'تكييف'],
   ARRAY['my ac broke', 'ac not cooling', 'ac making noise', 'ac leaking', 'ac stopped working'],
   ARRAY['unit_type', 'symptom', 'brand']),

  ('home_services.hvac.installation', 'home_services.hvac', 'AC Installation',
   'New AC unit installation, replacement units',
   ARRAY['install', 'new ac', 'ac setup', 'تركيب مكيف'],
   ARRAY['install new ac', 'need new ac unit', 'replace my ac'],
   ARRAY['unit_type', 'room_count', 'budget']),

  ('home_services.hvac.maintenance', 'home_services.hvac', 'AC Maintenance',
   'Regular AC maintenance, servicing, checkups',
   ARRAY['service', 'maintain', 'checkup', 'صيانة'],
   ARRAY['ac service', 'ac maintenance', 'regular checkup'],
   ARRAY['unit_count', 'last_service_date']),

  ('home_services.hvac.cleaning', 'home_services.hvac', 'AC Cleaning',
   'AC cleaning, filter replacement, duct cleaning',
   ARRAY['clean', 'filter', 'duct', 'تنظيف'],
   ARRAY['clean my ac', 'ac filter', 'dusty ac'],
   ARRAY['unit_count', 'last_cleaned']);

-- Home Services - Plumbing Services
INSERT INTO service_categories (id, parent_id, name, description, keywords, common_phrases, specifics_to_collect) VALUES
  ('home_services.plumbing.repair', 'home_services.plumbing', 'Plumbing Repair',
   'Leaky faucets, broken pipes, toilet issues',
   ARRAY['leak', 'pipe', 'faucet', 'toilet', 'tap', 'سباكة'],
   ARRAY['leaky faucet', 'pipe broken', 'toilet not working', 'water leak'],
   ARRAY['issue_type', 'location_in_home']),

  ('home_services.plumbing.installation', 'home_services.plumbing', 'Plumbing Installation',
   'New fixtures, water heaters, pipe installation',
   ARRAY['install', 'heater', 'fixture', 'تركيب'],
   ARRAY['install water heater', 'new bathroom fixtures'],
   ARRAY['fixture_type', 'brand_preference']),

  ('home_services.plumbing.emergency', 'home_services.plumbing', 'Emergency Plumbing',
   'Flooding, burst pipes, urgent plumbing issues',
   ARRAY['flood', 'burst', 'emergency', 'urgent', 'طوارئ'],
   ARRAY['pipe burst', 'flooding', 'water everywhere', 'emergency plumber'],
   ARRAY['issue_description', 'water_shut_off']),

  ('home_services.plumbing.drain_cleaning', 'home_services.plumbing', 'Drain Cleaning',
   'Clogged drains, slow drainage, blocked pipes',
   ARRAY['clog', 'drain', 'blocked', 'slow', 'انسداد'],
   ARRAY['clogged drain', 'slow drain', 'blocked sink', 'water not draining'],
   ARRAY['drain_location', 'severity']);

-- Home Services - Electrical Services
INSERT INTO service_categories (id, parent_id, name, description, keywords, common_phrases, specifics_to_collect) VALUES
  ('home_services.electrical.repair', 'home_services.electrical', 'Electrical Repair',
   'Outlets not working, flickering lights, electrical issues',
   ARRAY['outlet', 'light', 'switch', 'كهربائي'],
   ARRAY['outlet not working', 'lights flickering', 'no power'],
   ARRAY['issue_type', 'affected_area']),

  ('home_services.electrical.installation', 'home_services.electrical', 'Electrical Installation',
   'New outlets, fixtures, fans, lighting',
   ARRAY['install', 'fan', 'fixture', 'تركيب'],
   ARRAY['install ceiling fan', 'add new outlet', 'install lights'],
   ARRAY['installation_type', 'quantity']),

  ('home_services.electrical.wiring', 'home_services.electrical', 'Electrical Wiring',
   'Rewiring, electrical panels, major electrical work',
   ARRAY['wire', 'panel', 'rewire', 'أسلاك'],
   ARRAY['rewire house', 'electrical panel', 'old wiring'],
   ARRAY['scope', 'building_age']),

  ('home_services.electrical.emergency', 'home_services.electrical', 'Emergency Electrical',
   'Power outages, sparking, urgent electrical issues',
   ARRAY['spark', 'outage', 'emergency', 'urgent', 'طوارئ'],
   ARRAY['sparks', 'no power', 'electrical emergency', 'smell burning'],
   ARRAY['issue_description', 'safety_concern']);

-- Home Services - Cleaning Services
INSERT INTO service_categories (id, parent_id, name, description, keywords, common_phrases, specifics_to_collect) VALUES
  ('home_services.cleaning.deep_cleaning', 'home_services.cleaning', 'Deep Cleaning',
   'Thorough cleaning, spring cleaning, move-out cleaning',
   ARRAY['deep', 'thorough', 'spring', 'تنظيف عميق'],
   ARRAY['deep clean', 'thorough cleaning', 'spring cleaning'],
   ARRAY['home_size', 'rooms', 'last_cleaned']),

  ('home_services.cleaning.regular', 'home_services.cleaning', 'Regular Cleaning',
   'Recurring housekeeping, weekly/monthly cleaning',
   ARRAY['regular', 'weekly', 'monthly', 'housekeeping', 'تنظيف منتظم'],
   ARRAY['regular cleaning', 'weekly cleaner', 'housekeeping service'],
   ARRAY['frequency', 'home_size', 'special_requirements']),

  ('home_services.cleaning.move_in_out', 'home_services.cleaning', 'Move-in/Move-out Cleaning',
   'Cleaning for moving in or out of property',
   ARRAY['move', 'moving', 'vacate', 'انتقال'],
   ARRAY['moving out clean', 'move in cleaning', 'end of tenancy'],
   ARRAY['property_size', 'move_date', 'furnished']),

  ('home_services.cleaning.carpet', 'home_services.cleaning', 'Carpet Cleaning',
   'Carpet and upholstery cleaning, stain removal',
   ARRAY['carpet', 'upholstery', 'rug', 'stain', 'سجاد'],
   ARRAY['clean carpet', 'stain removal', 'sofa cleaning'],
   ARRAY['item_type', 'size', 'stain_type']);

-- Home Services - Pest Control
INSERT INTO service_categories (id, parent_id, name, description, keywords, common_phrases, specifics_to_collect) VALUES
  ('home_services.pest_control.general', 'home_services.pest_control', 'General Pest Control',
   'General pest inspection and treatment',
   ARRAY['pest', 'bug', 'insect', 'مكافحة حشرات'],
   ARRAY['have pests', 'bug problem', 'need pest control'],
   ARRAY['pest_type', 'severity', 'property_size']),

  ('home_services.pest_control.termites', 'home_services.pest_control', 'Termite Control',
   'Termite inspection and treatment',
   ARRAY['termite', 'wood', 'نمل أبيض'],
   ARRAY['termite problem', 'wood damage', 'termite inspection'],
   ARRAY['property_type', 'visible_damage']),

  ('home_services.pest_control.rodents', 'home_services.pest_control', 'Rodent Control',
   'Rat and mouse removal, prevention',
   ARRAY['rat', 'mouse', 'rodent', 'فئران'],
   ARRAY['have rats', 'mouse problem', 'rodent infestation'],
   ARRAY['sighting_frequency', 'entry_points']),

  ('home_services.pest_control.insects', 'home_services.pest_control', 'Insect Control',
   'Ants, roaches, bedbugs, other insects',
   ARRAY['ant', 'roach', 'cockroach', 'bedbug', 'صراصير'],
   ARRAY['roach problem', 'ant infestation', 'bedbugs', 'cockroaches'],
   ARRAY['insect_type', 'affected_areas']);

-- Home Services - Appliance Repair
INSERT INTO service_categories (id, parent_id, name, description, keywords, common_phrases, specifics_to_collect) VALUES
  ('home_services.appliance_repair.washing_machine', 'home_services.appliance_repair', 'Washing Machine Repair',
   'Washer repair, not spinning, leaking, not draining',
   ARRAY['washer', 'washing machine', 'laundry', 'غسالة'],
   ARRAY['washer broken', 'washing machine not working', 'washer leaking'],
   ARRAY['brand', 'symptom', 'age']),

  ('home_services.appliance_repair.refrigerator', 'home_services.appliance_repair', 'Refrigerator Repair',
   'Fridge repair, not cooling, making noise',
   ARRAY['fridge', 'refrigerator', 'freezer', 'ثلاجة'],
   ARRAY['fridge not cooling', 'refrigerator broken', 'freezer not working'],
   ARRAY['brand', 'symptom', 'type']),

  ('home_services.appliance_repair.oven', 'home_services.appliance_repair', 'Oven/Stove Repair',
   'Oven repair, stove not heating, gas issues',
   ARRAY['oven', 'stove', 'cooker', 'range', 'فرن'],
   ARRAY['oven not heating', 'stove broken', 'gas smell'],
   ARRAY['type', 'brand', 'symptom']),

  ('home_services.appliance_repair.dishwasher', 'home_services.appliance_repair', 'Dishwasher Repair',
   'Dishwasher repair, not cleaning, not draining',
   ARRAY['dishwasher', 'dishes', 'غسالة صحون'],
   ARRAY['dishwasher not working', 'dishes not clean', 'dishwasher leaking'],
   ARRAY['brand', 'symptom']);

-- Relocation Services - Subcategories
INSERT INTO service_categories (id, parent_id, name, description, display_order) VALUES
  ('relocation.rental', 'relocation', 'Rental', 'Finding rental properties', 1),
  ('relocation.moving', 'relocation', 'Moving', 'Moving and transport services', 2),
  ('relocation.storage', 'relocation', 'Storage', 'Storage solutions', 3),
  ('relocation.settling', 'relocation', 'Settling In', 'Help settling into Qatar', 4);

-- Relocation - Rental Services (leaf nodes)
INSERT INTO service_categories (id, parent_id, name, description, keywords, common_phrases, specifics_to_collect) VALUES
  ('relocation.rental.apartment_search', 'relocation.rental', 'Apartment Search',
   'Finding apartments and flats for rent',
   ARRAY['apartment', 'flat', 'rent', 'lease', 'studio', '1br', '2br', '3br', 'شقة', 'إيجار'],
   ARRAY['looking for apartment', 'need a flat', 'searching for rental', 'apartment pearl', 'rent in lusail'],
   ARRAY['bedrooms', 'budget', 'move_date', 'furnished', 'preferred_area']),

  ('relocation.rental.villa_search', 'relocation.rental', 'Villa Search',
   'Finding villas and compounds for rent',
   ARRAY['villa', 'compound', 'house', 'standalone', 'فيلا'],
   ARRAY['looking for villa', 'need a house', 'compound rental', 'villa with pool'],
   ARRAY['bedrooms', 'budget', 'move_date', 'compound_preferred', 'pool_required']),

  ('relocation.rental.commercial', 'relocation.rental', 'Commercial Space',
   'Office and commercial property rental',
   ARRAY['office', 'commercial', 'shop', 'retail', 'مكتب', 'محل'],
   ARRAY['need office space', 'looking for shop', 'commercial rental'],
   ARRAY['space_type', 'size_sqm', 'budget', 'location_preference']);

-- Relocation - Moving Services
INSERT INTO service_categories (id, parent_id, name, description, keywords, common_phrases, specifics_to_collect) VALUES
  ('relocation.moving.full_service', 'relocation.moving', 'Full Moving Service',
   'Complete packing, transport, and unpacking',
   ARRAY['mover', 'moving', 'relocate', 'shift', 'packing', 'نقل', 'انتقال'],
   ARRAY['need movers', 'moving house', 'shifting', 'relocating', 'full service move'],
   ARRAY['move_date', 'current_location', 'destination', 'home_size', 'floors']),

  ('relocation.moving.transport_only', 'relocation.moving', 'Transport Only',
   'Vehicle and transport for moving items',
   ARRAY['transport', 'truck', 'pickup', 'delivery', 'شاحنة'],
   ARRAY['need pickup truck', 'transport furniture', 'delivery service'],
   ARRAY['item_description', 'pickup_location', 'dropoff_location', 'date']),

  ('relocation.moving.international', 'relocation.moving', 'International Moving',
   'International relocation and shipping',
   ARRAY['international', 'overseas', 'shipping', 'container', 'شحن دولي'],
   ARRAY['moving overseas', 'international shipping', 'relocating abroad', 'moving from abroad'],
   ARRAY['origin_country', 'destination_country', 'volume', 'timeline']);

-- Relocation - Storage Services
INSERT INTO service_categories (id, parent_id, name, description, keywords, common_phrases, specifics_to_collect) VALUES
  ('relocation.storage.self_storage', 'relocation.storage', 'Self Storage',
   'Self-storage units for personal items',
   ARRAY['storage', 'store', 'unit', 'تخزين'],
   ARRAY['need storage', 'store my stuff', 'storage unit'],
   ARRAY['size_needed', 'duration', 'climate_controlled']),

  ('relocation.storage.furniture_storage', 'relocation.storage', 'Furniture Storage',
   'Furniture and large item storage',
   ARRAY['furniture', 'warehouse', 'أثاث'],
   ARRAY['store furniture', 'furniture warehouse', 'long term storage'],
   ARRAY['items_description', 'duration', 'pickup_needed']);

-- Relocation - Settling In Services
INSERT INTO service_categories (id, parent_id, name, description, keywords, common_phrases, specifics_to_collect) VALUES
  ('relocation.settling.visa_assistance', 'relocation.settling', 'Visa Assistance',
   'Help with visa and residence permit',
   ARRAY['visa', 'residence', 'permit', 'RP', 'إقامة', 'تأشيرة'],
   ARRAY['need visa help', 'residence permit', 'visa assistance'],
   ARRAY['visa_type', 'nationality', 'employment_status']),

  ('relocation.settling.utilities_setup', 'relocation.settling', 'Utilities Setup',
   'Help setting up electricity, water, internet',
   ARRAY['electricity', 'water', 'internet', 'kahramaa', 'كهرماء'],
   ARRAY['setup utilities', 'need kahramaa', 'internet connection'],
   ARRAY['property_type', 'services_needed']);

-- Enable Row Level Security
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Service categories are viewable by everyone"
  ON service_categories
  FOR SELECT
  USING (true);

-- Create policy for admin write access (using service role)
-- Admins can insert, update, delete
CREATE POLICY "Admins can manage service categories"
  ON service_categories
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
