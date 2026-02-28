export type Suit = 'S' | 'H' | 'D' | 'C';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  suit: Suit;
  rank: Rank;
}

export interface Player {
  id: string;
  session_id: string;
  name: string;
  pin_hash?: string;
  is_master: boolean;
  selected_suit: Suit | null;
  ready: boolean;
  ready_timestamp: number | null;
  net_points: number;
  connected: boolean;
  joined_at: string;
}

export interface Session {
  id: string;
  code: string;
  created_at: string;
  master_player_id: string;
  bet_amount_points: number;
  num_decks: number;
  tracks: number;
  state: 'LOBBY' | 'RACING' | 'VICTORY' | 'ENDED';
  current_round_id: string | null;
  total_points_played: number;
  settlement_data: SettlementData | null;
}

export interface Round {
  id: string;
  session_id: string;
  started_at: string;
  total_pool: number;
  winning_suit: Suit | null;
  deck_order: Card[];
  draw_index: number;
  gate_cards: Card[];
  gate_thresholds: number[];
  gate_revealed: boolean[];
  horse_positions: Record<Suit, number>;
  ready_players: Record<string, { suit: Suit; readyTimestamp: number }>;
  payouts: Record<string, number>;
  remainder_info: RemainderInfo | null;
  race_events: RaceEvent[];
  race_start_at: number | null;
  winning_suit_final: Suit | null;
  state: 'RACING' | 'FINISHED';
}

export type RaceEventType =
  | 'TURN_REVEAL_CARD'
  | 'TURN_MOVE_FORWARD'
  | 'GATE_REVEAL'
  | 'GATE_MOVE_BACK'
  | 'RACE_FINISHED';

export interface RaceEvent {
  type: RaceEventType;
  tOffset: number;
  card?: Card;
  suit?: Suit;
  newPos?: number;
  gateIndex?: number;
  winningSuit?: Suit;
  finalPositions?: Record<Suit, number>;
}

export interface RemainderInfo {
  remainder: number;
  bonusRecipients: Array<{ playerId: string; playerName: string }>;
}

export interface SettlementData {
  netPoints: Record<string, { name: string; net: number }>;
  transfers: Array<{ fromId: string; fromName: string; toId: string; toName: string; amount: number }>;
  totalPointsPlayed: number;
}

export interface LocalPlayer {
  id: string;
  name: string;
  pin: string;
  sessionCode?: string;
}
