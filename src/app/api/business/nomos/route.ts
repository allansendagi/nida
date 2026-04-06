import { createClient } from '@/lib/supabase/server';
import { validateNomosContract } from '@/lib/nomos/validate';
import { NextResponse } from 'next/server';

/**
 * GET /api/business/nomos
 * Download the current business's .nomos contract as a file
 */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: business } = await supabase
    .from('businesses')
    .select('display_name, nomos_contract')
    .eq('user_id', user.id)
    .single();

  if (!business) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 });
  }

  if (!business.nomos_contract) {
    return NextResponse.json({ error: 'No NOMOS contract on file' }, { status: 404 });
  }

  const filename = `${business.display_name.toLowerCase().replace(/\s+/g, '_')}.nomos`;
  const body = JSON.stringify(business.nomos_contract, null, 2);

  return new Response(body, {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}

/**
 * POST /api/business/nomos
 * Upload a .nomos file to update the business contract
 * Accepts: multipart/form-data with field "file", OR application/json body
 */
export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!business) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 });
  }

  let contractData: unknown;

  const contentType = req.headers.get('content-type') || '';

  if (contentType.includes('multipart/form-data')) {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const text = await file.text();
    try {
      contractData = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON in .nomos file' }, { status: 400 });
    }
  } else {
    // Accept raw JSON body
    try {
      contractData = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
  }

  // Validate the contract
  const validation = validateNomosContract(contractData);
  if (!validation.valid) {
    return NextResponse.json(
      { error: 'Invalid NOMOS contract', errors: validation.errors },
      { status: 422 }
    );
  }

  // Store to businesses.nomos_contract
  const { error } = await supabase
    .from('businesses')
    .update({ nomos_contract: contractData })
    .eq('id', business.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
