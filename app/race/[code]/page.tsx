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

  const [myPlayer, setMyPlayer] = useState<{ id: string; name: string; selectedSuit?: Suit } | null>(null);
  const [round, setRound] = useState<Round | null>(null);
  const [positions, setPositions] = useState<Record<Suit, number>>({ S: 0, H: 0, D: 0, C: 0 });
  const [gateRevealed, setGateRevealed] = useState<boolean[]>([false, false, false, false, false]);
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [showCard, setShowCard] = useState(false);
  const [movingHorse, setMovingHorse] = useState<Suit | null>(null);   // forward
  const [backingHorse, setBackingHorse] = useState<Suit | null>(null); // backward
  const [highlightGate, setHighlightGate] = useState<number | null>(null);
  const [winner, setWinner] = useState<Suit | null>(null);
  const [raceStatus, setRaceStatus] = useState('Race starting...');
  const [sessionTracks, setSessionTracks] = useState(12);

  const timersRef = useRef<NodeJS.Timeout[]>([]);

  // ── Music ──────────────────────────────────────────────────────────────────
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio('/race-music.mp3');
    audio.loop = true;
    audio.volume = 0.6;
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  const startMusic = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(() => {/* autoplay may be blocked until user gesture */});
  }, []);

  const stopMusic = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
  }, []);
  // ───────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const stored = localStorage.getItem('ctc_player');
    if (!stored) { router.push('/'); return; }
    const p = JSON.parse(stored);
    setMyPlayer(p);
  }, []);

  const scheduleEvents = useCallback((events: RaceEvent[], raceStartAt: number) => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];

    const now = Date.now();

    // Find the first event in the future to trigger music start
    const firstFutureDelay = Math.max(0, raceStartAt - now);
    const musicTimer = setTimeout(startMusic, firstFutureDelay);
    timersRef.current.push(musicTimer);

    events.forEach(event => {
      const delay = raceStartAt + event.tOffset - now;
      if (delay < -5000) return;

      const t = setTimeout(() => {
        switch (event.type) {
          case 'TURN_REVEAL_CARD':
            setCurrentCard(event.card!);
            setShowCard(true);
            setMovingHorse(null);
            setBackingHorse(null);
            setRaceStatus(`Drawing: ${event.card!.rank}${SUIT_SYMBOLS[event.card!.suit]}`);
            break;

          case 'TURN_MOVE_FORWARD':
            setBackingHorse(null);
            setMovingHorse(event.suit!);
            setPositions(prev => ({ ...prev, [event.suit!]: event.newPos! }));
            setRaceStatus(`${SUIT_NAMES[event.suit!]} advances → ${event.newPos!}`);
            // Clear forward indicator after transition
            setTimeout(() => setMovingHorse(s => s === event.suit! ? null : s), 600);
            break;

          case 'GATE_REVEAL':
            setGateRevealed(prev => {
              const next = [...prev];
              next[event.gateIndex!] = true;
              return next;
            });
            setHighlightGate(event.gateIndex!);
            setRaceStatus(`Gate ${event.gateIndex! + 1}: ${event.card!.rank}${SUIT_SYMBOLS[event.card!.suit]}`);
            setTimeout(() => setHighlightGate(null), 1500);
            break;

          case 'GATE_MOVE_BACK':
            setMovingHorse(null);
            setBackingHorse(event.suit!);
            setPositions(prev => ({ ...prev, [event.suit!]: event.newPos! }));
            setRaceStatus(`${SUIT_NAMES[event.suit!]} ← back to ${event.newPos!}`);
            // Clear backing indicator after transition
            setTimeout(() => setBackingHorse(s => s === event.suit! ? null : s), 700);
            break;

          case 'RACE_FINISHED':
            setWinner(event.winningSuit!);
            if (event.finalPositions) {
              setPositions(event.finalPositions as Record<Suit, number>);
            }
            setRaceStatus(`🏆 ${SUIT_NAMES[event.winningSuit!]} WINS!`);
            setMovingHorse(null);
            setBackingHorse(null);
            stopMusic(); // ← stop music when race ends
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
  }, [code, router, startMusic, stopMusic]);

  useEffect(() => {
    const load = async () => {
      const { data: sessionData } = await supabase.from('sessions').select('*').eq('code', code).single();
      if (!sessionData || sessionData.state === 'ENDED') { router.push('/'); return; }
      if (sessionData.state === 'LOBBY') { router.push(`/lobby/${code}`); return; }
      if (!sessionData.current_round_id) return;

      setSessionTracks(sessionData.tracks);

      // Fetch current player's selected suit
      const stored = localStorage.getItem('ctc_player');
      if (stored) {
        const p = JSON.parse(stored);
        const { data: playerData } = await supabase
          .from('players')
          .select('selected_suit')
          .eq('id', p.id)
          .maybeSingle();
        if (playerData?.selected_suit) {
          setMyPlayer(prev => prev ? { ...prev, selectedSuit: playerData.selected_suit as Suit } : prev);
        }
      }

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
      stopMusic();
    };
  }, [code, scheduleEvents, stopMusic]);

  const gateThresholds = round ? round.gate_thresholds : [];

  return (
    <div
      className="flex flex-col overflow-hidden w-full"
      style={{ height: '100dvh', maxWidth: 600, margin: '0 auto' }}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-3 pt-2 pb-1 shrink-0">
        <h1 className="text-base font-bold pixel-text" style={{ color: '#1b4332' }}>🏇 RACE</h1>
        {winner && (
          <div className="font-bold pixel-text text-sm animate-pulse" style={{ color: '#c9a627' }}>
            {SUIT_NAMES[winner]} WINS! 🏆
          </div>
        )}
      </div>

      {/* ── Status bar ── */}
      <div className="px-3 pb-2 shrink-0">
        <div
          className="rounded-lg px-3 py-1.5 text-center text-xs pixel-text"
          style={{ background: '#e8f5ea', border: '1px solid #52b788', color: '#1b4332' }}
        >
          {raceStatus}
        </div>
      </div>

      {/* ── Card + Gate Cards (side by side) ── */}
      <div className="flex items-center gap-3 px-3 pb-2 shrink-0">
        <div className="flex flex-col items-center gap-0.5 shrink-0">
          <div className="text-green-700 text-center" style={{ fontSize: 9 }}>DRAW</div>
          <CardDisplay card={showCard ? currentCard : null} faceDown={!showCard || !currentCard} small />
        </div>

        <div className="w-px self-stretch" style={{ background: '#52b788', opacity: 0.4 }} />

        {round && (
          <div className="flex-1">
            <div className="text-green-700 mb-0.5 text-center" style={{ fontSize: 9 }}>GATE CARDS</div>
            <GateCardsDisplay
              gateCards={round.gate_cards}
              gateRevealed={gateRevealed}
              gateThresholds={gateThresholds}
              highlightIndex={highlightGate ?? undefined}
            />
          </div>
        )}
      </div>

      {/* ── Horse Track ── */}
      <div className="flex-1 min-h-0 px-3 pb-2">
        <HorseTrack
          positions={positions}
          tracks={sessionTracks}
          winningSuit={winner}
          movingHorse={movingHorse}
          backingHorse={backingHorse}
          myHorseSuit={myPlayer?.selectedSuit ?? null}
        />
      </div>

      {/* Spacer so chat doesn't cover last lane */}
      <div className="shrink-0" style={{ height: 56 }} />

      {/* ── Chat ── */}
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
