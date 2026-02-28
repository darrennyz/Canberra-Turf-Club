import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const { sessionCode, playerId } = await req.json();
    const supabase = createAdminClient();

    const { data: session } = await supabase.from('sessions').select('*').eq('code', sessionCode).maybeSingle();
    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    if (session.master_player_id !== playerId) return NextResponse.json({ error: 'Not master' }, { status: 403 });

    await supabase.from('players')
      .update({ ready: false, ready_timestamp: null, selected_suit: null })
      .eq('session_id', session.id);

    await supabase.from('sessions').update({ state: 'LOBBY' }).eq('id', session.id);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
