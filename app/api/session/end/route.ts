import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabaseAdmin';
import { calculateSettlement } from '@/lib/settlement';

export async function POST(req: NextRequest) {
  try {
    const { sessionCode, playerId } = await req.json();
    const supabase = createAdminClient();

    const { data: session } = await supabase.from('sessions').select('*').eq('code', sessionCode).maybeSingle();
    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    if (session.master_player_id !== playerId) return NextResponse.json({ error: 'Not master' }, { status: 403 });

    const { data: players } = await supabase.from('players').select('*').eq('session_id', session.id);
    if (!players) return NextResponse.json({ error: 'No players' }, { status: 500 });

    const netPoints: Record<string, { name: string; net: number }> = {};
    players.forEach(p => { netPoints[p.id] = { name: p.name, net: p.net_points }; });

    const transfers = calculateSettlement(netPoints);
    const settlement = {
      netPoints,
      transfers,
      totalPointsPlayed: session.total_points_played,
    };

    await supabase.from('sessions').update({ state: 'ENDED', settlement_data: settlement }).eq('id', session.id);

    return NextResponse.json({ settlement });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
