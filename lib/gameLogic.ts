import { Card, Suit, Rank, RaceEvent, RemainderInfo } from './types';

const SUITS: Suit[] = ['S', 'H', 'D', 'C'];
const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export function createShuffledDeck(numDecks: number): Card[] {
  const deck: Card[] = [];
  for (let d = 0; d < numDecks; d++) {
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        deck.push({ suit, rank });
      }
    }
  }
  return fisherYatesShuffle(deck);
}

function fisherYatesShuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function computeGateThresholds(tracks: number): number[] {
  return [1, 2, 3, 4, 5].map(i => Math.ceil(tracks * i / 5));
}

export interface RaceResult {
  events: RaceEvent[];
  winningSuit: Suit;
  finalPositions: Record<Suit, number>;
  gateCards: Card[];
  deckOrder: Card[];
}

export function computeFullRace(numDecks: number, tracks: number): RaceResult {
  const deckOrder = createShuffledDeck(numDecks);
  const gateCards = deckOrder.slice(0, 5);
  const gateThresholds = computeGateThresholds(tracks);

  const positions: Record<Suit, number> = { S: 0, H: 0, D: 0, C: 0 };
  const gateRevealed = [false, false, false, false, false];
  let drawIndex = 5;
  let t = 0;
  const events: RaceEvent[] = [];

  while (drawIndex < deckOrder.length) {
    const card = deckOrder[drawIndex++];

    // Reveal card (1.0s)
    events.push({ type: 'TURN_REVEAL_CARD', tOffset: t, card });
    t += 1000;

    // Move horse forward (0.5s)
    positions[card.suit]++;
    events.push({ type: 'TURN_MOVE_FORWARD', tOffset: t, suit: card.suit, newPos: positions[card.suit] });
    t += 500;

    // Check win
    if (positions[card.suit] >= tracks) {
      events.push({
        type: 'RACE_FINISHED',
        tOffset: t,
        winningSuit: card.suit,
        finalPositions: { ...positions }
      });
      return { events, winningSuit: card.suit, finalPositions: { ...positions }, gateCards, deckOrder };
    }

    // Check gates (in order)
    for (let gi = 0; gi < 5; gi++) {
      if (!gateRevealed[gi]) {
        const allPassed = SUITS.every(s => positions[s] >= gateThresholds[gi]);
        if (allPassed) {
          gateRevealed[gi] = true;
          const gateCard = gateCards[gi];
          events.push({ type: 'GATE_REVEAL', tOffset: t, gateIndex: gi, card: gateCard });
          positions[gateCard.suit] = Math.max(0, positions[gateCard.suit] - 1);
          events.push({ type: 'GATE_MOVE_BACK', tOffset: t, suit: gateCard.suit, newPos: positions[gateCard.suit] });
          t += 500;
        }
      }
    }
  }

  // Deck exhausted - find leader
  const maxPos = Math.max(...Object.values(positions));
  const winner = SUITS.find(s => positions[s] === maxPos) || 'S';
  events.push({ type: 'RACE_FINISHED', tOffset: t, winningSuit: winner, finalPositions: { ...positions } });
  return { events, winningSuit: winner, finalPositions: { ...positions }, gateCards, deckOrder };
}

export interface PayoutResult {
  payouts: Record<string, number>;
  remainderInfo: RemainderInfo;
  totalPool: number;
}

export function calculatePayouts(
  readyPlayers: Array<{ id: string; name: string; suit: Suit; readyTimestamp: number }>,
  winningSuit: Suit,
  betAmount: number
): PayoutResult {
  const totalPool = readyPlayers.length * betAmount;
  const winners = readyPlayers
    .filter(p => p.suit === winningSuit)
    .sort((a, b) => a.readyTimestamp - b.readyTimestamp);

  const payouts: Record<string, number> = {};
  // All ready players lose stake first
  readyPlayers.forEach(p => { payouts[p.id] = -betAmount; });

  let remainderInfo: RemainderInfo;

  if (winners.length === 0) {
    // No winners: refund equally
    const refundBase = Math.floor(totalPool / readyPlayers.length);
    const refundRemainder = totalPool % readyPlayers.length;
    readyPlayers.forEach(p => { payouts[p.id] += refundBase; });
    // Bonus to earliest-ready players
    const sorted = [...readyPlayers].sort((a, b) => a.readyTimestamp - b.readyTimestamp);
    const bonusRecipients = sorted.slice(0, refundRemainder).map(p => ({ playerId: p.id, playerName: p.name }));
    bonusRecipients.forEach(r => { payouts[r.playerId] += 1; });
    remainderInfo = { remainder: refundRemainder, bonusRecipients };
  } else {
    const payoutBase = Math.floor(totalPool / winners.length);
    const remainder = totalPool % winners.length;
    winners.forEach(w => { payouts[w.id] += payoutBase; });
    const bonusRecipients = winners.slice(0, remainder).map(w => ({ playerId: w.id, playerName: w.name }));
    bonusRecipients.forEach(r => { payouts[r.playerId] += 1; });
    remainderInfo = { remainder, bonusRecipients };
  }

  return { payouts, remainderInfo, totalPool };
}

export function hashPin(pin: string): string {
  // Simple hash for casual use
  let hash = 0;
  for (let i = 0; i < pin.length; i++) {
    const char = pin.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

export function generateSessionCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export const SUIT_NAMES: Record<Suit, string> = {
  S: 'Spades',
  H: 'Hearts',
  D: 'Diamonds',
  C: 'Clubs',
};

export const SUIT_SYMBOLS: Record<Suit, string> = {
  S: '♠',
  H: '♥',
  D: '♦',
  C: '♣',
};

export const SUIT_COLORS: Record<Suit, string> = {
  S: '#1a1a2e',
  H: '#e74c3c',
  D: '#e74c3c',
  C: '#1a1a2e',
};
