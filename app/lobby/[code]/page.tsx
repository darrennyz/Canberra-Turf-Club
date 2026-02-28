'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Player, Session } from '@/lib/types';
import { Suit } from '@/lib/types';
import { SUIT_SYMBOLS, SUIT_NAMES } from '@/lib/gameLogic';

const SUITS: Suit[] = ['S', 'H', 'D', 'C'];

export default function LobbyPage() {
  const params = useParams();
  const code = (params.code as string).toUpperCase();
  const router = useRouter();
  const supabase = createClient();

  const [myPlayer, setMyPlayer] = useState<{ id: string; name: string } | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [starting, setStarting] = useState(false);

  // Load local player
  useEffect(() => {
    const stored = localStorage.getItem('ctc_player');
    if (!stored) { router.push('/'); return; }
    const p = JSON.parse(stored);
    setMyPlayer({ id: p.id, name: p.name });
  }, []);

  // Load session + players
  const loadSession = useCallback(async () => {
    const { data: sessionData } = await supabase
      .from('sessions')
      .select('*')
      .eq('code', code)
      .single();
    if (!sessionData) { setError('Session not found'); setLoading(false); return; }
    if (sessionData.state === 'ENDED') { router.push('/'); return; }
    setSession(sessionData);

    const { data: playersData } = await supabase
      .from('players')
      .select('*')
      .eq('session_id', sessionData.id)
      .eq('connected', true)
      .order('joined_at');
    setPlayers(playersData || []);
    setLoading(false);

    // Redirect if racing
    if (sessionData.state === 'RACING') router.push(`/race/${code}`);
    if (sessionData.state === 'VICTORY') router.push(`/victory/${code}`);
  }, [code]);

  useEffect(() => { loadSession(); }, [loadSession]);

  // Realtime subscriptions
  useEffect(() => {
    if (!session) return;

    const playerChannel = supabase
      .channel(`lobby-players:${code}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players', filter: `session_id=eq.${session.id}` }, () => {
        loadSession();
      })
      .subscribe();

    const sessionChannel = supabase
      .channel(`lobby-session:${code}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'sessions', filter: `id=eq.${session.id}` }, payload => {
        const updated = payload.new as Session;
        setSession(updated);
        if (updated.state === 'RACING') router.push(`/race/${code}`);
        if (updated.state === 'ENDED') router.push('/');
      })
      .subscribe();

    return () => {
      supabase.removeChannel(playerChannel);
      supabase.removeChannel(sessionChannel);
    };
  }, [session?.id, code]);

  const selectHorse = async (suit: Suit) => {
    if (!myPlayer) return;
    await fetch('/api/player/select-horse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId: myPlayer.id, suit, sessionCode: code }),
    });
  };

  const toggleReady = async () => {
    if (!myPlayer) return;
    const me = players.find(p => p.id === myPlayer.id);
    if (!me) return;
    if (!me.ready && !me.selected_suit) { setError('Select a horse first!'); return; }
    setError('');
    await fetch('/api/player/ready', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId: myPlayer.id, ready: !me.ready, sessionCode: code }),
    });
  };

  const startGame = async () => {
    if (!myPlayer) return;
    setStarting(true);
    setError('');
    try {
      const res = await fetch('/api/game/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionCode: code, playerId: myPlayer.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setStarting(false);
    }
  };

  const endSession = async () => {
    if (!myPlayer || !session) return;
    if (!confirm('End the session? This will show final settlement.')) return;
    const res = await fetch('/api/session/end', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionCode: code, playerId: myPlayer.id }),
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('ctc_settlement', JSON.stringify(data.settlement));
      router.push('/settlement');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-yellow-400 text-xl pixel-text">Loading lobby...</div>
    </div>
  );

  if (error && !session) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-red-400 text-xl">{error}</div>
    </div>
  );

  const me = players.find(p => p.id === myPlayer?.id);
  const isMaster = session?.master_player_id === myPlayer?.id;
  const allReady = players.length >= 2 && players.every(p => p.ready);

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-yellow-400 pixel-text">CANBERRA TURF CLUB</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-purple-300 text-sm">Code:</span>
            <span className="text-white font-bold text-xl tracking-widest bg-purple-900/50 px-3 py-1 rounded border border-purple-600">{code}</span>
          </div>
        </div>
        {isMaster && (
          <button onClick={endSession} className="text-red-400 hover:text-red-300 text-xs border border-red-800 px-3 py-1 rounded">
            END SESSION
          </button>
        )}
      </div>

      {/* Settings */}
      <div className="bg-purple-900/30 border border-purple-700 rounded-lg p-3 mb-4 flex gap-6 text-sm">
        <span className="text-purple-300">Bet: <span className="text-white font-bold">{session?.bet_amount_points} pts</span></span>
        <span className="text-purple-300">Decks: <span className="text-white font-bold">{session?.num_decks}</span></span>
        <span className="text-purple-300">Track: <span className="text-white font-bold">{session?.tracks} steps</span></span>
      </div>

      {/* Horse Selection */}
      <div className="mb-4">
        <h2 className="text-sm text-purple-300 mb-2 pixel-text">PICK YOUR HORSE</h2>
        <div className="grid grid-cols-4 gap-2">
          {SUITS.map(suit => {
            const isRed = suit === 'H' || suit === 'D';
            const isMine = me?.selected_suit === suit;
            const playersOnSuit = players.filter(p => p.selected_suit === suit);
            return (
              <button
                key={suit}
                onClick={() => !me?.ready && selectHorse(suit)}
                disabled={me?.ready}
                className={`suit-btn rounded-xl p-3 flex flex-col items-center gap-1 border-2 transition-all ${
                  isMine
                    ? 'border-yellow-400 bg-yellow-400/20'
                    : 'border-purple-600 bg-purple-900/40 hover:border-purple-400'
                } ${me?.ready ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                style={{ color: isRed ? '#e74c3c' : '#e8e8e8' }}
              >
                <span className="text-3xl">{SUIT_SYMBOLS[suit]}</span>
                <span className="text-xs text-gray-400">{SUIT_NAMES[suit]}</span>
                {playersOnSuit.length > 0 && (
                  <div className="flex flex-wrap gap-1 justify-center">
                    {playersOnSuit.map(p => (
                      <span key={p.id} className="text-xs bg-purple-700/60 px-1 rounded" style={{ color: isRed ? '#fca5a5' : '#c4b5fd' }}>
                        {p.name.slice(0, 4)}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Ready button */}
      {me && (
        <div className="mb-4">
          <button
            onClick={toggleReady}
            className={`w-full py-3 rounded-lg font-bold pixel-text text-lg transition-all ${
              me.ready
                ? 'bg-green-600 hover:bg-green-500 text-white border border-green-400'
                : 'bg-purple-700 hover:bg-purple-600 text-white border border-purple-500'
            }`}
          >
            {me.ready ? '✅ READY (click to unready)' : 'CLICK TO READY UP'}
          </button>
          {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
        </div>
      )}

      {/* Player list */}
      <div className="bg-purple-900/30 border border-purple-700 rounded-lg p-3 mb-4">
        <h2 className="text-sm text-purple-300 mb-3 pixel-text">PLAYERS ({players.length})</h2>
        <div className="flex flex-col gap-2">
          {players.map(p => {
            const isRedSuit = p.selected_suit === 'H' || p.selected_suit === 'D';
            const net = p.net_points;
            return (
              <div key={p.id} className="flex items-center gap-3 bg-purple-950/50 rounded-lg px-3 py-2">
                <div className="flex-1">
                  <span className="text-white font-bold">{p.name}</span>
                  {session?.master_player_id === p.id && <span className="ml-1 text-yellow-400 text-xs">👑</span>}
                  {p.id === myPlayer?.id && <span className="ml-1 text-purple-400 text-xs">(you)</span>}
                </div>
                <div className="flex items-center gap-2">
                  {p.selected_suit ? (
                    <span style={{ color: isRedSuit ? '#e74c3c' : '#e8e8e8', fontSize: 20 }}>
                      {SUIT_SYMBOLS[p.selected_suit as Suit]}
                    </span>
                  ) : (
                    <span className="text-gray-500 text-xs">No pick</span>
                  )}
                  <span className={`text-xs font-bold ${p.ready ? 'text-green-400' : 'text-gray-500'}`}>
                    {p.ready ? '✅ Ready' : '⏳ Waiting'}
                  </span>
                  <span className={`text-xs font-mono ${net > 0 ? 'net-positive' : net < 0 ? 'net-negative' : 'net-zero'}`}>
                    {net > 0 ? '+' : ''}{net}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Master controls */}
      {isMaster && (
        <div>
          {players.length < 2 && (
            <p className="text-purple-400 text-sm text-center mb-2">Need at least 2 players to start</p>
          )}
          {players.length >= 2 && !allReady && (
            <p className="text-yellow-400 text-sm text-center mb-2">Waiting for all players to ready up...</p>
          )}
          <button
            onClick={startGame}
            disabled={!allReady || starting}
            className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl text-xl pixel-text transition-all"
          >
            {starting ? '⏳ STARTING...' : 'START RACE'}
          </button>
        </div>
      )}
      {!isMaster && allReady && (
        <p className="text-center text-green-400 text-sm pixel-text animate-pulse">All ready! Waiting for host to start...</p>
      )}
    </div>
  );
}
