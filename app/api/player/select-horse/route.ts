import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const { playerId, suit, sessionCode } = await req.json();
    if (!['S', 'H', 'D', 'C'].includes(suit)) return NextResponse.json({ error: 'Invalid suit' }, { status: 400 });

    const supabase = createAdminClient();
    const { data: player } = await supabase.from('players').select('*').eq('id', playerId).maybeSingle();
    if (!player) return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    if (player.ready) return NextResponse.json({ error: 'Already ready' }, { status: 400 });

    await supabase.from('players').update({ selected_suit: suit }).eq('id', playerId);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
