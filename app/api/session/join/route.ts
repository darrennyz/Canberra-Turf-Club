import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabaseAdmin';
import { hashPin } from '@/lib/gameLogic';

export async function POST(req: NextRequest) {
  try {
    const { name, pin, sessionCode } = await req.json();

    if (!name || name.length < 3 || name.length > 16) return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
    if (!pin || pin.length < 4 || pin.length > 6) return NextResponse.json({ error: 'Invalid PIN' }, { status: 400 });

    const supabase = createAdminClient();
    const { data: session } = await supabase.from('sessions').select('*').eq('code', sessionCode.toUpperCase()).maybeSingle();

    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    if (session.state === 'ENDED') return NextResponse.json({ error: 'Session has ended' }, { status: 400 });
    if (session.state === 'RACING') return NextResponse.json({ error: 'Race in progress' }, { status: 400 });

    const { data: existing } = await supabase
      .from('players')
      .select('*')
      .eq('session_id', session.id)
      .eq('name', name)
      .eq('pin_hash', hashPin(pin))
      .maybeSingle();

    if (existing) {
      await supabase.from('players').update({ connected: true }).eq('id', existing.id);
      return NextResponse.json({ sessionId: session.id, playerId: existing.id });
    }

    const { data: player, error } = await supabase
      .from('players')
      .insert({ session_id: session.id, name, pin_hash: hashPin(pin), is_master: false })
      .select()
      .single();
    if (error) throw error;

    return NextResponse.json({ sessionId: session.id, playerId: player.id });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
