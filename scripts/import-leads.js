const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const CATEGORY_MAPPING = {
  // Home Services
  'pest control service': 'home_services.pest_control',
  'cleaning service': 'home_services.cleaning',
  'house cleaning service': 'home_services.cleaning',
  'maid service': 'home_services.cleaning',
  'janitorial service': 'home_services.cleaning',
  'property maintenance': 'home_services.handyman',
  'handyman': 'home_services.handyman',
  'appliance repair service': 'home_services.appliance_repair',
  'home appliance repair service': 'home_services.appliance_repair',
  'air conditioning repair service': 'home_services.appliance_repair',
  'painting': 'home_services.painting',
  'painter': 'home_services.painting',
  'landscaping': 'home_services.landscaping',
  'landscaper': 'home_services.landscaping',
  'plant nursery': 'home_services.landscaping',
  'garden center': 'home_services.landscaping',
  'lawn care service': 'home_services.landscaping',
  // Relocation Services
  'real estate rental agency': 'relocation.rental',
  'apartment rental agency': 'relocation.rental',
  'vacation home rental agency': 'relocation.rental',
  'condominium rental agency': 'relocation.rental',
  'short term apartment rental agency': 'relocation.rental',
  'moving and storage service': 'relocation.moving',
  'mover': 'relocation.moving',
  'property management company': 'relocation.property_management',
};

const FILES = [
  'kids - pest applicance etc.json',
  'Handyman Services.json',
  'Painting & Renovation.json',
  'Landscaping & Gardening.json',
  'Home Rental and Moving Companies.json',
];

function mapToNidaCategory(categories) {
  if (!categories || categories.length === 0) return null;

  for (const cat of categories) {
    const normalized = cat.toLowerCase().trim();
    if (CATEGORY_MAPPING[normalized]) {
      return CATEGORY_MAPPING[normalized];
    }
  }
  return null;
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing environment variables:');
    console.error('- NEXT_PUBLIC_SUPABASE_URL');
    console.error('- SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  let totalInserted = 0;
  let totalProcessed = 0;

  console.log('Starting import of sales leads...\n');

  for (const file of FILES) {
    const filePath = path.join(__dirname, '..', 'Allan', file);

    if (!fs.existsSync(filePath)) {
      console.log(`Skipping ${file} - file not found`);
      continue;
    }

    console.log(`Processing: ${file}`);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    console.log(`  Found ${data.length} entries`);

    const leads = data
      .filter(e => {
        // Must have placeId and not be closed
        if (!e.placeId || e.permanentlyClosed || e.temporarilyClosed) return false;

        // Must map to a Nida category
        const nidaCategory = mapToNidaCategory(e.categories);
        if (!nidaCategory) {
          // Also check categoryName
          if (e.categoryName) {
            const normalized = e.categoryName.toLowerCase().trim();
            if (!CATEGORY_MAPPING[normalized]) return false;
          } else {
            return false;
          }
        }
        return true;
      })
      .map(e => {
        let nidaCategory = mapToNidaCategory(e.categories);
        if (!nidaCategory && e.categoryName) {
          const normalized = e.categoryName.toLowerCase().trim();
          nidaCategory = CATEGORY_MAPPING[normalized] || null;
        }

        return {
          place_id: e.placeId,
          google_cid: e.cid || null,
          title: e.title,
          category_name: e.categoryName || null,
          categories: e.categories || null,
          phone: e.phone || null,
          phone_unformatted: e.phoneUnformatted || null,
          website: e.website || null,
          address: e.address || null,
          city: e.city || null,
          neighborhood: e.neighborhood || null,
          lat: e.location?.lat || null,
          lng: e.location?.lng || null,
          total_score: e.totalScore || null,
          reviews_count: e.reviewsCount || 0,
          opening_hours: e.openingHours || null,
          nida_category: nidaCategory,
          source_file: file,
          scraped_at: e.scrapedAt || null,
        };
      });

    console.log(`  Relevant home services: ${leads.length}`);

    if (leads.length > 0) {
      // Insert in batches of 100
      const batchSize = 100;
      for (let i = 0; i < leads.length; i += batchSize) {
        const batch = leads.slice(i, i + batchSize);
        const { data: inserted, error } = await supabase
          .from('sales_leads')
          .upsert(batch, { onConflict: 'place_id', ignoreDuplicates: false })
          .select('id');

        if (error) {
          console.error(`  Error inserting batch:`, error.message);
        } else {
          totalInserted += inserted?.length || 0;
        }
      }
    }

    totalProcessed += leads.length;
    console.log(`  Completed\n`);
  }

  console.log('='.repeat(50));
  console.log('Import Summary:');
  console.log(`  Total processed: ${totalProcessed}`);
  console.log(`  Total inserted/updated: ${totalInserted}`);
}

main().catch(console.error);
