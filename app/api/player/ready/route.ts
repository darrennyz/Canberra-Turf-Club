import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const { playerId, ready, sessionCode } = await req.json();
    const supabase = createAdminClient();

    const { data: player } = await supabase.from('players').select('*').eq('id', playerId).maybeSingle();
    if (!player) return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    if (ready && !player.selected_suit) return NextResponse.json({ error: 'Select a horse first' }, { status: 400 });

    await supabase.from('players').update({
      ready,
      ready_timestamp: ready ? Date.now() : null,
    }).eq('id', playerId);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
