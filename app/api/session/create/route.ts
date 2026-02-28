import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabaseAdmin';
import { generateSessionCode, hashPin } from '@/lib/gameLogic';

export async function POST(req: NextRequest) {
  try {
    const { name, pin, betAmountPoints, numDecks, tracks } = await req.json();

    if (!name || name.length < 3 || name.length > 16) return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
    if (!pin || pin.length < 4 || pin.length > 6) return NextResponse.json({ error: 'Invalid PIN' }, { status: 400 });
    if (!betAmountPoints || betAmountPoints < 1 || betAmountPoints > 999999) return NextResponse.json({ error: 'Invalid bet amount' }, { status: 400 });
    if (![1, 2, 3].includes(numDecks)) return NextResponse.json({ error: 'Invalid numDecks' }, { status: 400 });
    if (![8, 12, 16, 20, 24].includes(tracks)) return NextResponse.json({ error: 'Invalid tracks' }, { status: 400 });

    const supabase = createAdminClient();

    let code = '';
    let tries = 0;
    while (tries < 10) {
      code = generateSessionCode();
      const { data } = await supabase.from('sessions').select('id').eq('code', code).maybeSingle();
      if (!data) break;
      tries++;
    }
    if (!code) return NextResponse.json({ error: 'Could not generate unique code' }, { status: 500 });

    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .insert({ code, bet_amount_points: betAmountPoints, num_decks: numDecks, tracks })
      .select()
      .single();
    if (sessionError) throw sessionError;

    const { data: player, error: playerError } = await supabase
      .from('players')
      .insert({ session_id: session.id, name, pin_hash: hashPin(pin), is_master: true })
      .select()
      .single();
    if (playerError) throw playerError;

    await supabase.from('sessions').update({ master_player_id: player.id }).eq('id', session.id);

    return NextResponse.json({ code, sessionId: session.id, playerId: player.id });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
