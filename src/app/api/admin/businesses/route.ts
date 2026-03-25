import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { requireAdminApi } from '@/lib/auth/admin';
import type { NomosContract } from '@/types/nomos';
import { NOMOS_VERSION } from '@/types/nomos';

export async function POST(request: Request) {
  // Require admin access
  const adminCheck = await requireAdminApi();
  if (adminCheck.error) {
    return NextResponse.json(
      { error: adminCheck.error.message },
      { status: adminCheck.error.status }
    );
  }

  try {
    const body = await request.json();
    const {
      displayName,
      phone,
      email,
      category,
      capabilities,
      zones,
      pricing,
      leadTimeHours,
      warrantyDays,
    } = body;

    // Validate required fields
    if (!displayName || !phone || !category || !capabilities?.length || !zones?.length) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const entityId = crypto.randomUUID();

    // Build the NOMOS contract
    const nomosContract: NomosContract = {
      nomos_version: NOMOS_VERSION,
      contract_type: 'service_offering',
      issuer: {
        entity_id: entityId,
        display_name: displayName,
        trust_score: 50,
        verified: false,
      },
      service: {
        category: `${category}.${capabilities[0]}`,
        capabilities,
        constraints: {},
      },
      pricing: {
        model: 'tiered',
        currency: 'QAR',
        rules: capabilities.map((cap: string) => ({
          capability: cap,
          base: pricing.base,
          range: [pricing.min, pricing.max] as [number, number],
          negotiable: true,
        })),
        urgency_multiplier: {
          same_day: 1.5,
          next_day: 1.2,
        },
      },
      availability: {
        operating_hours: {
          sunday: { open: '08:00', close: '18:00' },
          monday: { open: '08:00', close: '18:00' },
          tuesday: { open: '08:00', close: '18:00' },
          wednesday: { open: '08:00', close: '18:00' },
          thursday: { open: '08:00', close: '18:00' },
          friday: 'closed',
          saturday: { open: '08:00', close: '14:00' },
        },
        lead_time_hours: leadTimeHours,
        capacity: {
          max_daily_jobs: 5,
          current_load: 0.2,
        },
      },
      service_area: {
        zones,
        surcharge_zones: [],
      },
      terms: {
        warranty_days: warrantyDays,
        cancellation_policy: {
          free_cancellation_hours: 24,
          fee_percentage: 20,
        },
      },
      agent_instructions: {
        auto_accept: {
          enabled: false,
        },
        escalate_to_human: {
          triggers: ['price_below_min', 'custom_request'],
        },
        max_negotiation_rounds: 3,
      },
      metadata: {
        published_at: new Date().toISOString(),
        version: 1,
        schema_ref: 'https://nomos.protocol/schema/v0.1.0/service_offering',
      },
    };

    // Build categories array from main category + capabilities
    const categories = capabilities.map((cap: string) => `${category}.${cap}`);

    const { data, error } = await supabase
      .from('businesses')
      .insert({
        nomos_contract: nomosContract,
        phone,
        email,
        display_name: displayName,
        categories,
        service_zones: zones,
        subscription_tier: 'trial',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating business:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ business: data });
  } catch (error) {
    console.error('Error in POST /api/admin/businesses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Require admin access
  const adminCheck = await requireAdminApi();
  if (adminCheck.error) {
    return NextResponse.json(
      { error: adminCheck.error.message },
      { status: adminCheck.error.status }
    );
  }

  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ businesses: data });
  } catch (error) {
    console.error('Error in GET /api/admin/businesses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
