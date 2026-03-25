import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { requireAdminApi } from '@/lib/auth/admin';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Require admin access
  const adminCheck = await requireAdminApi();
  if (adminCheck.error) {
    return NextResponse.json(
      { error: adminCheck.error.message },
      { status: adminCheck.error.status }
    );
  }

  try {
    const { id } = await params;
    const { user } = adminCheck;

    const serviceClient = createServiceClient();

    // Verify business exists
    const { data: business } = await serviceClient
      .from('businesses')
      .select('id, cr_number, cr_verified')
      .eq('id', id)
      .single();

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    if (!business.cr_number) {
      return NextResponse.json(
        { error: 'Business has no CR number to verify' },
        { status: 400 }
      );
    }

    if (business.cr_verified) {
      return NextResponse.json(
        { error: 'CR number is already verified' },
        { status: 400 }
      );
    }

    // Mark CR as verified
    const { data, error } = await serviceClient
      .from('businesses')
      .update({
        cr_verified: true,
        cr_verified_at: new Date().toISOString(),
        cr_verified_by: user.id,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error verifying CR:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ business: data });
  } catch (error) {
    console.error('Error in POST /api/admin/businesses/[id]/verify-cr:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
