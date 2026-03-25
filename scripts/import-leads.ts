/**
 * Import Scraped Google Places Data into Sales Leads
 *
 * Usage: npx tsx scripts/import-leads.ts
 *
 * Reads JSON files from the Allan folder and imports relevant
 * home service businesses into the sales_leads table.
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Category mapping from Google Places to Nida categories
const CATEGORY_MAPPING: Record<string, string> = {
  // Pest Control
  'pest control service': 'home_services.pest_control',

  // Cleaning
  'cleaning service': 'home_services.cleaning',
  'house cleaning service': 'home_services.cleaning',
  'maid service': 'home_services.cleaning',
  'janitorial service': 'home_services.cleaning',
  'carpet cleaning service': 'home_services.cleaning',
  'window cleaning service': 'home_services.cleaning',

  // Handyman / Property Maintenance
  'property maintenance': 'home_services.handyman',
  'handyman': 'home_services.handyman',
  'home improvement store': 'home_services.handyman',

  // Appliance Repair
  'appliance repair service': 'home_services.appliance_repair',
  'electronics repair shop': 'home_services.appliance_repair',
  'home appliance repair service': 'home_services.appliance_repair',
  'washing machine repair service': 'home_services.appliance_repair',
  'refrigerator repair service': 'home_services.appliance_repair',
  'air conditioning repair service': 'home_services.appliance_repair',

  // Painting
  'painting': 'home_services.painting',
  'painter': 'home_services.painting',
  'house painter': 'home_services.painting',

  // Landscaping
  'landscaping': 'home_services.landscaping',
  'landscaper': 'home_services.landscaping',
  'plant nursery': 'home_services.landscaping',
  'garden center': 'home_services.landscaping',
  'lawn care service': 'home_services.landscaping',
  'tree service': 'home_services.landscaping',
  'gardener': 'home_services.landscaping',

  // HVAC (for future manual outreach)
  'hvac contractor': 'home_services.hvac',
  'air conditioning contractor': 'home_services.hvac',
  'heating contractor': 'home_services.hvac',

  // Plumbing (for future manual outreach)
  'plumber': 'home_services.plumbing',
  'plumbing service': 'home_services.plumbing',

  // Electrical (for future manual outreach)
  'electrician': 'home_services.electrical',
  'electrical contractor': 'home_services.electrical',
};

// Files to process (in priority order)
const FILES_TO_PROCESS = [
  'kids - pest applicance etc.json',
  'Handyman Services.json',
  'Painting & Renovation.json',
  'Landscaping & Gardening.json',
];

interface GooglePlacesEntry {
  title: string;
  placeId: string;
  cid?: string;
  categoryName?: string;
  categories?: string[];
  phone?: string;
  phoneUnformatted?: string;
  website?: string;
  address?: string;
  city?: string;
  neighborhood?: string;
  location?: { lat: number; lng: number };
  totalScore?: number;
  reviewsCount?: number;
  openingHours?: Array<{ day: string; hours: string }>;
  scrapedAt?: string;
  permanentlyClosed?: boolean;
  temporarilyClosed?: boolean;
}

interface SalesLead {
  place_id: string;
  google_cid: string | null;
  title: string;
  category_name: string | null;
  categories: string[] | null;
  phone: string | null;
  phone_unformatted: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  neighborhood: string | null;
  lat: number | null;
  lng: number | null;
  total_score: number | null;
  reviews_count: number;
  opening_hours: Array<{ day: string; hours: string }> | null;
  nida_category: string | null;
  source_file: string;
  scraped_at: string | null;
}

function mapToNidaCategory(categories: string[] | undefined): string | null {
  if (!categories || categories.length === 0) return null;

  // Check each category against our mapping
  for (const cat of categories) {
    const normalized = cat.toLowerCase().trim();
    if (CATEGORY_MAPPING[normalized]) {
      return CATEGORY_MAPPING[normalized];
    }
  }

  // Also check partial matches
  for (const cat of categories) {
    const normalized = cat.toLowerCase().trim();
    for (const [key, value] of Object.entries(CATEGORY_MAPPING)) {
      if (normalized.includes(key) || key.includes(normalized)) {
        return value;
      }
    }
  }

  return null;
}

function isRelevantBusiness(entry: GooglePlacesEntry): boolean {
  // Skip closed businesses
  if (entry.permanentlyClosed || entry.temporarilyClosed) {
    return false;
  }

  // Must have a valid placeId
  if (!entry.placeId) {
    return false;
  }

  // Check if any category maps to a Nida category
  const nidaCategory = mapToNidaCategory(entry.categories);
  if (!nidaCategory) {
    // Also check categoryName
    if (entry.categoryName) {
      const normalized = entry.categoryName.toLowerCase().trim();
      if (!CATEGORY_MAPPING[normalized]) {
        return false;
      }
    } else {
      return false;
    }
  }

  return true;
}

function transformEntry(entry: GooglePlacesEntry, sourceFile: string): SalesLead {
  let nidaCategory = mapToNidaCategory(entry.categories);

  // Fallback to categoryName if categories didn't match
  if (!nidaCategory && entry.categoryName) {
    const normalized = entry.categoryName.toLowerCase().trim();
    nidaCategory = CATEGORY_MAPPING[normalized] || null;
  }

  return {
    place_id: entry.placeId,
    google_cid: entry.cid || null,
    title: entry.title,
    category_name: entry.categoryName || null,
    categories: entry.categories || null,
    phone: entry.phone || null,
    phone_unformatted: entry.phoneUnformatted || null,
    website: entry.website || null,
    address: entry.address || null,
    city: entry.city || null,
    neighborhood: entry.neighborhood || null,
    lat: entry.location?.lat || null,
    lng: entry.location?.lng || null,
    total_score: entry.totalScore || null,
    reviews_count: entry.reviewsCount || 0,
    opening_hours: entry.openingHours || null,
    nida_category: nidaCategory,
    source_file: sourceFile,
    scraped_at: entry.scrapedAt || null,
  };
}

async function main() {
  // Validate environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing environment variables:');
    console.error('- NEXT_PUBLIC_SUPABASE_URL');
    console.error('- SUPABASE_SERVICE_ROLE_KEY');
    console.error('\nMake sure you have a .env.local file with these values.');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const allanDir = path.join(process.cwd(), 'Allan');

  if (!fs.existsSync(allanDir)) {
    console.error(`Allan directory not found at: ${allanDir}`);
    process.exit(1);
  }

  let totalProcessed = 0;
  let totalInserted = 0;
  let totalSkipped = 0;
  let totalDuplicates = 0;
  const categoryStats: Record<string, number> = {};

  console.log('Starting import of sales leads...\n');

  for (const fileName of FILES_TO_PROCESS) {
    const filePath = path.join(allanDir, fileName);

    if (!fs.existsSync(filePath)) {
      console.log(`Skipping ${fileName} - file not found`);
      continue;
    }

    console.log(`Processing: ${fileName}`);

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    let entries: GooglePlacesEntry[];

    try {
      entries = JSON.parse(fileContent);
    } catch (error) {
      console.error(`  Error parsing ${fileName}:`, error);
      continue;
    }

    console.log(`  Found ${entries.length} entries`);

    const relevantEntries = entries.filter(isRelevantBusiness);
    console.log(`  Relevant home services: ${relevantEntries.length}`);

    const leads = relevantEntries.map((entry) => transformEntry(entry, fileName));

    // Track categories
    for (const lead of leads) {
      if (lead.nida_category) {
        categoryStats[lead.nida_category] = (categoryStats[lead.nida_category] || 0) + 1;
      }
    }

    // Insert in batches of 100
    const batchSize = 100;
    for (let i = 0; i < leads.length; i += batchSize) {
      const batch = leads.slice(i, i + batchSize);

      const { data, error } = await supabase
        .from('sales_leads')
        .upsert(batch, {
          onConflict: 'place_id',
          ignoreDuplicates: true,
        })
        .select('id');

      if (error) {
        console.error(`  Error inserting batch:`, error.message);
        totalSkipped += batch.length;
      } else {
        const insertedCount = data?.length || 0;
        totalInserted += insertedCount;
        totalDuplicates += batch.length - insertedCount;
      }
    }

    totalProcessed += relevantEntries.length;
    console.log(`  Completed\n`);
  }

  console.log('='.repeat(50));
  console.log('Import Summary:');
  console.log(`  Total processed: ${totalProcessed}`);
  console.log(`  Inserted: ${totalInserted}`);
  console.log(`  Duplicates skipped: ${totalDuplicates}`);
  console.log(`  Errors: ${totalSkipped}`);
  console.log('\nBy Category:');
  for (const [category, count] of Object.entries(categoryStats).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${category}: ${count}`);
  }
}

main().catch(console.error);
