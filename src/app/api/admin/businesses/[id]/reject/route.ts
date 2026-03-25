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

    const body = await request.json();
    const { notes } = body;

    if (!notes?.trim()) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      );
    }

    const serviceClient = createServiceClient();

    // Verify business exists and is pending
    const { data: business } = await serviceClient
      .from('businesses')
      .select('id, approval_status, user_id, email, display_name')
      .eq('id', id)
      .single();

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    if (business.approval_status !== 'pending') {
      return NextResponse.json(
        { error: 'Business is not pending approval' },
        { status: 400 }
      );
    }

    // Update business to rejected
    const { data, error } = await serviceClient
      .from('businesses')
      .update({
        approval_status: 'rejected',
        approval_notes: notes,
        approved_by: user.id,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error rejecting business:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // TODO: Send email notification to business owner with rejection reason
    // if (business.email) {
    //   await sendRejectionEmail(business.email, business.display_name, notes);
    // }

    return NextResponse.json({ business: data });
  } catch (error) {
    console.error('Error in POST /api/admin/businesses/[id]/reject:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
