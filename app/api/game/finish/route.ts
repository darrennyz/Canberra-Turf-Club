import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabaseAdmin';

// Called by client when RACE_FINISHED event fires — transitions session to VICTORY
export async function POST(req: NextRequest) {
  try {
    const { sessionCode } = await req.json();
    const supabase = createAdminClient();

    const { data: session } = await supabase
      .from('sessions')
      .select('*')
      .eq('code', sessionCode)
      .maybeSingle();

    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

    // Idempotent: only update if still RACING
    if (session.state === 'RACING') {
      await supabase
        .from('sessions')
        .update({ state: 'VICTORY' })
        .eq('id', session.id)
        .eq('state', 'RACING'); // Extra guard against race conditions
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
