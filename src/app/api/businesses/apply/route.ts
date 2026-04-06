import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import type { NomosContract } from '@/types/nomos';
import { NOMOS_VERSION } from '@/types/nomos';

export async function POST(request: Request) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      displayName,
      phone,
      email,
      crNumber,
      category,
      capabilities,
      zones,
      pricing,
      leadTimeHours,
      warrantyDays,
      nomosContract: uploadedContract,
    } = body;

    // Validate shared required fields
    if (!displayName || !phone || !crNumber) {
      return NextResponse.json(
        { error: 'Missing required fields: displayName, phone, crNumber' },
        { status: 400 }
      );
    }

    // Check if user already has a business
    const serviceClient = createServiceClient();
    const { data: existingBusiness } = await serviceClient
      .from('businesses')
      .select('id, approval_status')
      .eq('user_id', user.id)
      .single();

    if (existingBusiness) {
      return NextResponse.json(
        { error: 'You already have a business registered. Please use PUT to update.' },
        { status: 400 }
      );
    }

    // --- Path B: uploaded .nomos contract ---
    if (uploadedContract) {
      const c = uploadedContract as Record<string, unknown>;
      const serviceArea = c.service_area as Record<string, unknown> | undefined;
      const service = c.service as Record<string, unknown> | undefined;

      const contractZones = (serviceArea?.zones as string[]) || [];
      const contractCategory = (service?.category as string) || '';
      const contractCapabilities = (service?.capabilities as string[]) || [];

      // Derive flat categories array (e.g. ["home_services.hvac.repair"])
      const derivedCategories = contractCapabilities.length > 0
        ? contractCapabilities.map((cap) => `${contractCategory.split('.').slice(0, 2).join('.')}.${cap}`)
        : [contractCategory];

      const { data, error } = await serviceClient
        .from('businesses')
        .insert({
          user_id: user.id,
          nomos_contract: uploadedContract,
          phone,
          email: email || null,
          cr_number: crNumber,
          display_name: displayName,
          categories: derivedCategories,
          service_zones: contractZones,
          subscription_tier: 'trial',
          approval_status: 'pending',
          submitted_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating business (nomos upload):', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ business: data });
    }

    // --- Path A: form-based contract build ---
    if (!category || !capabilities?.length || !zones?.length) {
      return NextResponse.json(
        { error: 'Missing required fields: category, capabilities, zones' },
        { status: 400 }
      );
    }

    const entityId = crypto.randomUUID();

    // Build the NOMOS contract from form fields
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

    const { data, error } = await serviceClient
      .from('businesses')
      .insert({
        user_id: user.id,
        nomos_contract: nomosContract,
        phone,
        email,
        cr_number: crNumber,
        display_name: displayName,
        categories,
        service_zones: zones,
        subscription_tier: 'trial',
        approval_status: 'pending',
        submitted_at: new Date().toISOString(),
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
    console.error('Error in POST /api/businesses/apply:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      businessId,
      displayName,
      phone,
      email,
      crNumber,
      category,
      capabilities,
      zones,
      pricing,
      leadTimeHours,
      warrantyDays,
    } = body;

    // Validate required fields
    if (!displayName || !phone || !crNumber || !category || !capabilities?.length || !zones?.length) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const serviceClient = createServiceClient();

    // Verify the business belongs to this user and was rejected
    const { data: existingBusiness } = await serviceClient
      .from('businesses')
      .select('id, approval_status, user_id')
      .eq('id', businessId)
      .single();

    if (!existingBusiness) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    if (existingBusiness.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    if (existingBusiness.approval_status !== 'rejected') {
      return NextResponse.json(
        { error: 'Only rejected applications can be resubmitted' },
        { status: 400 }
      );
    }

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

    const { data, error } = await serviceClient
      .from('businesses')
      .update({
        nomos_contract: nomosContract,
        phone,
        email,
        cr_number: crNumber,
        display_name: displayName,
        categories,
        service_zones: zones,
        approval_status: 'pending',
        approval_notes: null,
        submitted_at: new Date().toISOString(),
      })
      .eq('id', businessId)
      .select()
      .single();

    if (error) {
      console.error('Error updating business:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ business: data });
  } catch (error) {
    console.error('Error in PUT /api/businesses/apply:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
