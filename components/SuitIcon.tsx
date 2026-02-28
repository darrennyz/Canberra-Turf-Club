import { Suit } from '@/lib/types';
import { SUIT_SYMBOLS, SUIT_COLORS } from '@/lib/gameLogic';

interface Props {
  suit: Suit;
  size?: number;
  className?: string;
}

export default function SuitIcon({ suit, size = 24, className = '' }: Props) {
  const color = suit === 'H' || suit === 'D' ? '#e74c3c' : '#e8e8e8';
  return (
    <span
      style={{ fontSize: size, color, lineHeight: 1 }}
      className={`inline-block ${className}`}
    >
      {SUIT_SYMBOLS[suit]}
    </span>
  );
}
