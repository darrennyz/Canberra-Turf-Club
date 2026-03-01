'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Round, Session, RaceEvent, Suit, Card } from '@/lib/types';
import HorseTrack from '@/components/HorseTrack';
import CardDisplay from '@/components/CardDisplay';
import GateCardsDisplay from '@/components/GateCardsDisplay';
import ChatOverlay from '@/components/ChatOverlay';
import { SUIT_SYMBOLS, SUIT_NAMES } from '@/lib/gameLogic';

export default function RacePage() {
  const params = useParams();
  const code = (params.code as string).toUpperCase();
  const router = useRouter();
  const supabase = createClient();

  const [myPlayer, setMyPlayer] = useState<{ id: string; name: string } | null>(null);
  const [round, setRound] = useState<Round | null>(null);
  const [positions, setPositions] = useState<Record<Suit, number>>({ S: 0, H: 0, D: 0, C: 0 });
  const [gateRevealed, setGateRevealed] = useState<boolean[]>([false, false, false, false, false]);
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [showCard, setShowCard] = useState(false);
  const [movingHorse, setMovingHorse] = useState<Suit | null>(null);
  const [highlightGate, setHighlightGate] = useState<number | null>(null);
  const [winner, setWinner] = useState<Suit | null>(null);
  const [raceStatus, setRaceStatus] = useState('Race starting...');
  const [sessionTracks, setSessionTracks] = useState(12);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('ctc_player');
    if (!stored) { router.push('/'); return; }
    setMyPlayer(JSON.parse(stored));
  }, []);

  const scheduleEvents = useCallback((events: RaceEvent[], raceStartAt: number) => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];

    const now = Date.now();

    events.forEach(event => {
      const delay = raceStartAt + event.tOffset - now;
      if (delay < -5000) return;

      const t = setTimeout(() => {
        switch (event.type) {
          case 'TURN_REVEAL_CARD':
            setCurrentCard(event.card!);
            setShowCard(true);
            setMovingHorse(null);
            setRaceStatus(`Drawing: ${event.card!.rank}${SUIT_SYMBOLS[event.card!.suit]}`);
            break;
          case 'TURN_MOVE_FORWARD':
            setMovingHorse(event.suit!);
            setPositions(prev => ({ ...prev, [event.suit!]: event.newPos! }));
            setRaceStatus(`${SUIT_NAMES[event.suit!]} moves to ${event.newPos!}`);
            break;
          case 'GATE_REVEAL':
            setGateRevealed(prev => {
              const next = [...prev];
              next[event.gateIndex!] = true;
              return next;
            });
            setHighlightGate(event.gateIndex!);
            setRaceStatus(`Gate ${event.gateIndex! + 1} reveals: ${event.card!.rank}${SUIT_SYMBOLS[event.card!.suit]}`);
            setTimeout(() => setHighlightGate(null), 1500);
            break;
          case 'GATE_MOVE_BACK':
            setMovingHorse(event.suit!);
            setPositions(prev => ({ ...prev, [event.suit!]: event.newPos! }));
            setRaceStatus(`${SUIT_NAMES[event.suit!]} moves BACK to ${event.newPos!}`);
            break;
          case 'RACE_FINISHED':
            setWinner(event.winningSuit!);
            if (event.finalPositions) {
              setPositions(event.finalPositions as Record<Suit, number>);
            }
            setRaceStatus(`🏆 ${SUIT_NAMES[event.winningSuit!]} WINS!`);
            setMovingHorse(null);
            // Mark session as VICTORY on server (idempotent — any client can call)
            fetch('/api/game/finish', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sessionCode: code }),
            }).catch(() => {});
            setTimeout(() => router.push(`/victory/${code}`), 3000);
            break;
        }
      }, Math.max(0, delay));

      timersRef.current.push(t);
    });
  }, [code, router]);

  useEffect(() => {
    const load = async () => {
      const { data: sessionData } = await supabase.from('sessions').select('*').eq('code', code).single();
      if (!sessionData || sessionData.state === 'ENDED') { router.push('/'); return; }
      if (sessionData.state === 'LOBBY') { router.push(`/lobby/${code}`); return; }
      if (!sessionData.current_round_id) return;

      setSessionTracks(sessionData.tracks);

      const { data: roundData } = await supabase
        .from('rounds')
        .select('*')
        .eq('id', sessionData.current_round_id)
        .single();

      if (!roundData) return;
      setRound(roundData);
      setPositions(roundData.horse_positions);
      setGateRevealed(roundData.gate_revealed);

      if (roundData.race_events && roundData.race_start_at) {
        scheduleEvents(roundData.race_events, roundData.race_start_at);
      }
    };
    load();

    const sessionSub = supabase
      .channel(`race-session:${code}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'sessions',
      }, payload => {
        const updated = payload.new as Session;
        if (updated.state === 'VICTORY') router.push(`/victory/${code}`);
        if (updated.state === 'ENDED') router.push(`/settlement?code=${code}`);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(sessionSub);
      timersRef.current.forEach(t => clearTimeout(t));
    };
  }, [code, scheduleEvents]);

  const gateThresholds = round ? round.gate_thresholds : [];

  return (
    <div className="min-h-screen p-4 max-w-3xl mx-auto relative">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold pixel-text" style={{ color: '#1b4332' }}>RACE</h1>
        {winner && (
          <div className="font-bold pixel-text text-lg animate-pulse" style={{ color: '#c9a627' }}>
            {SUIT_NAMES[winner]} WINS!
          </div>
        )}
      </div>

      {/* Status */}
      <div className="bg-green-50 border border-green-400 rounded-lg px-4 py-2 mb-4 text-center text-green-800 text-sm pixel-text">
        {raceStatus}
      </div>

      {/* Card reveal */}
      <div className="flex justify-center mb-4">
        <div className="flex flex-col items-center gap-2">
          <div className="text-xs text-green-700 pixel-text">CURRENT DRAW</div>
          <CardDisplay card={showCard ? currentCard : null} faceDown={!showCard || !currentCard} />
        </div>
      </div>

      {/* Gate cards */}
      {round && (
        <div className="mb-4">
          <GateCardsDisplay
            gateCards={round.gate_cards}
            gateRevealed={gateRevealed}
            gateThresholds={gateThresholds}
            highlightIndex={highlightGate ?? undefined}
          />
        </div>
      )}

      {/* Horse track */}
      <HorseTrack
        positions={positions}
        tracks={sessionTracks}
        winningSuit={winner}
        movingHorse={movingHorse}
      />

      {/* Chat */}
      {myPlayer && (
        <ChatOverlay
          sessionCode={code}
          playerId={myPlayer.id}
          playerName={myPlayer.name}
        />
      )}
    </div>
  );
}
