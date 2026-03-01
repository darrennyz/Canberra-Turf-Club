'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Round, Session, Suit, Player } from '@/lib/types';
import { SUIT_NAMES, SUIT_SYMBOLS } from '@/lib/gameLogic';

export default function VictoryPage() {
  const params = useParams();
  const code = (params.code as string).toUpperCase();
  const router = useRouter();
  const supabase = createClient();

  const [myPlayer, setMyPlayer] = useState<{ id: string; name: string } | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [round, setRound] = useState<Round | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [returning, setReturning] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('ctc_player');
    if (!stored) { router.push('/'); return; }
    setMyPlayer(JSON.parse(stored));
  }, []);

  useEffect(() => {
    const load = async () => {
      const { data: sessionData } = await supabase.from('sessions').select('*').eq('code', code).single();
      if (!sessionData) { router.push('/'); return; }
      setSession(sessionData);

      if (sessionData.current_round_id) {
        const { data: roundData } = await supabase.from('rounds').select('*').eq('id', sessionData.current_round_id).single();
        setRound(roundData);
      }

      const { data: playersData } = await supabase.from('players').select('*').eq('session_id', sessionData.id).eq('connected', true).order('joined_at');
      setPlayers(playersData || []);
      setLoading(false);
    };
    load();

    const sessionSub = supabase
      .channel(`victory-session:${code}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'sessions' }, payload => {
        const updated = payload.new as Session;
        if (updated.state === 'LOBBY') router.push(`/lobby/${code}`);
        if (updated.state === 'ENDED') router.push(`/settlement?code=${code}`);
      })
      .subscribe();

    return () => { supabase.removeChannel(sessionSub); };
  }, [code]);

  const handleBackToLobby = async () => {
    if (!myPlayer || !session || session.master_player_id !== myPlayer.id) return;
    setReturning(true);
    await fetch('/api/game/back-to-lobby', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionCode: code, playerId: myPlayer.id }),
    });
    setReturning(false);
  };

  const handleEndSession = async () => {
    if (!myPlayer) return;
    if (!confirm('End the session? This will show final settlement.')) return;
    const res = await fetch('/api/session/end', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionCode: code, playerId: myPlayer.id }),
    });
    if (res.ok) {
      router.push(`/settlement?code=${code}`);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-xl pixel-text" style={{ color: '#1b4332' }}>Loading...</div>
    </div>
  );

  const isMaster = session?.master_player_id === myPlayer?.id;
  const winningSuit = round?.winning_suit_final as Suit | null;
  const totalPool = round?.total_pool ?? 0;
  const payouts = round?.payouts ?? {};
  const remainderInfo = round?.remainder_info;

  const winnerPlayers = players.filter(p => payouts[p.id] !== undefined && payouts[p.id] > 0);

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto">
      {/* Winner announcement */}
      <div className="text-center mb-6 pt-4">
        {winningSuit && (
          <>
            <div className="flex justify-center mb-2">
              <span
                className="celebrating inline-block select-none"
                style={{ fontSize: 80, lineHeight: 1 }}
              >
                🏇
              </span>
            </div>
            <h1 className="text-4xl font-bold pixel-text mb-1" style={{ color: '#1b4332' }}>
              {SUIT_SYMBOLS[winningSuit]} {SUIT_NAMES[winningSuit].toUpperCase()} WINS!
            </h1>
          </>
        )}
        <div className="text-green-700 text-lg">Total Pool: <span className="text-gray-900 font-bold">{totalPool} pts</span></div>
      </div>

      {/* Winners */}
      <div className="bg-white border-2 border-green-600 rounded-xl p-4 mb-4 shadow-sm">
        <h2 className="font-bold pixel-text mb-3" style={{ color: '#1b4332' }}>WINNERS</h2>
        {winnerPlayers.length === 0 ? (
          <p className="text-gray-500 text-sm">No winners — pool refunded equally</p>
        ) : (
          <div className="flex flex-col gap-2">
            {winnerPlayers.map(p => {
              const payout = payouts[p.id];
              const gotBonus = remainderInfo?.bonusRecipients?.some(r => r.playerId === p.id);
              return (
                <div key={p.id} className="flex items-center justify-between bg-green-50 rounded-lg px-3 py-2">
                  <span className="text-gray-900 font-bold">{p.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold net-positive">+{payout} pts</span>
                    {gotBonus && <span className="text-yellow-600 text-xs">(+1 bonus)</span>}
                  </div>
                </div>
              );
            })}
            {remainderInfo && remainderInfo.remainder > 0 && (
              <p className="text-xs text-yellow-700 mt-1">
                Remainder of {remainderInfo.remainder} pt(s) distributed to earliest-ready winners
              </p>
            )}
          </div>
        )}
      </div>

      {/* All players & net */}
      <div className="bg-white border border-green-300 rounded-xl p-4 mb-4 shadow-sm">
        <h2 className="text-green-800 font-bold pixel-text mb-3">SESSION NET</h2>
        {players.map(p => {
          const net = p.net_points;
          return (
            <div key={p.id} className="flex items-center justify-between py-1">
              <span className="text-gray-900">{p.name}</span>
              <span className={`font-bold font-mono ${net > 0 ? 'net-positive' : net < 0 ? 'net-negative' : 'net-zero'}`}>
                {net > 0 ? '+' : ''}{net}
              </span>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      {isMaster ? (
        <div className="flex flex-col gap-3">
          <button
            onClick={handleBackToLobby}
            disabled={returning}
            className="w-full font-bold py-4 rounded-xl text-lg pixel-text transition-all disabled:opacity-50 hover:opacity-90"
            style={{ background: '#c9a627', color: '#1b4332' }}
          >
            {returning ? '⏳ RETURNING...' : 'BACK TO LOBBY'}
          </button>
          <button
            onClick={handleEndSession}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl pixel-text transition-all border border-red-400"
          >
            END SESSION & SETTLE
          </button>
        </div>
      ) : (
        <p className="text-center text-green-700 pixel-text">Waiting for host to continue...</p>
      )}
    </div>
  );
}
