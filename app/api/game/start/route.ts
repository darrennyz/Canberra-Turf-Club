import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabaseAdmin';
import { computeFullRace, computeGateThresholds, calculatePayouts } from '@/lib/gameLogic';
import { Suit } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const { sessionCode, playerId } = await req.json();
    const supabase = createAdminClient();

    const { data: session } = await supabase.from('sessions').select('*').eq('code', sessionCode).maybeSingle();
    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    if (session.master_player_id !== playerId) return NextResponse.json({ error: 'Not master' }, { status: 403 });
    if (session.state !== 'LOBBY' && session.state !== 'VICTORY') return NextResponse.json({ error: 'Cannot start now' }, { status: 400 });

    const { data: players } = await supabase
      .from('players')
      .select('*')
      .eq('session_id', session.id)
      .eq('connected', true)
      .eq('ready', true);

    if (!players || players.length < 2) return NextResponse.json({ error: 'Need at least 2 ready players' }, { status: 400 });

    const raceResult = computeFullRace(session.num_decks, session.tracks);
    const gateThresholds = computeGateThresholds(session.tracks);

    const raceStartAt = Date.now() + 3000;

    const readyPlayerList = players.map(p => ({
      id: p.id,
      name: p.name,
      suit: p.selected_suit as Suit,
      readyTimestamp: p.ready_timestamp || Date.now(),
    }));

    const { payouts, remainderInfo, totalPool } = calculatePayouts(
      readyPlayerList,
      raceResult.winningSuit,
      session.bet_amount_points
    );

    const readyPlayersMap: Record<string, { suit: Suit; readyTimestamp: number }> = {};
    players.forEach(p => {
      readyPlayersMap[p.id] = { suit: p.selected_suit as Suit, readyTimestamp: p.ready_timestamp || Date.now() };
    });

    const { data: round, error: roundError } = await supabase.from('rounds').insert({
      session_id: session.id,
      total_pool: totalPool,
      winning_suit: raceResult.winningSuit,
      winning_suit_final: raceResult.winningSuit,
      deck_order: raceResult.deckOrder,
      draw_index: 5,
      gate_cards: raceResult.gateCards,
      gate_thresholds: gateThresholds,
      gate_revealed: [false, false, false, false, false],
      horse_positions: { S: 0, H: 0, D: 0, C: 0 },
      ready_players: readyPlayersMap,
      payouts,
      remainder_info: remainderInfo,
      race_events: raceResult.events,
      race_start_at: raceStartAt,
      state: 'RACING',
    }).select().single();

    if (roundError) throw roundError;

    await supabase.from('sessions').update({
      state: 'RACING',
      current_round_id: round.id,
      total_points_played: (session.total_points_played || 0) + totalPool,
    }).eq('id', session.id);

    for (const [pid, payout] of Object.entries(payouts)) {
      const { data: player } = await supabase.from('players').select('net_points').eq('id', pid).single();
      if (player) {
        await supabase.from('players').update({ net_points: (player.net_points || 0) + payout }).eq('id', pid);
      }
    }

    return NextResponse.json({ ok: true, roundId: round.id, raceStartAt });
  } catch (e: any) {
    console.error('Game start error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
