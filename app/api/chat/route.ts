import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabaseAdmin';

const rateLimits = new Map<string, number[]>();

export async function POST(req: NextRequest) {
  try {
    const { sessionCode, playerId, playerName, message } = await req.json();
    if (!message || message.trim().length === 0) return NextResponse.json({ error: 'Empty message' }, { status: 400 });
    if (message.length > 200) return NextResponse.json({ error: 'Too long' }, { status: 400 });

    const now = Date.now();
    const key = `${sessionCode}:${playerId}`;
    const times = (rateLimits.get(key) || []).filter(t => now - t < 1000);
    if (times.length >= 3) {
      return NextResponse.json({ error: 'Too fast' }, { status: 429 });
    }
    times.push(now);
    rateLimits.set(key, times);

    const supabase = createAdminClient();
    const { data: session } = await supabase.from('sessions').select('id').eq('code', sessionCode).maybeSingle();
    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

    await supabase.from('chat_messages').insert({
      session_id: session.id,
      session_code: sessionCode,
      player_id: playerId,
      player_name: playerName,
      message: message.trim(),
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
