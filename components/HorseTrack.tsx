'use client';
import { Suit } from '@/lib/types';
import PixelHorse from './PixelHorse';
import { SUIT_SYMBOLS, SUIT_NAMES } from '@/lib/gameLogic';

interface Props {
  positions: Record<Suit, number>;
  tracks: number;
  winningSuit?: Suit | null;
  movingHorse?: Suit | null;
}

const SUIT_ORDER: Suit[] = ['S', 'H', 'D', 'C'];
const LANE_COLORS: Record<Suit, string> = {
  S: 'rgba(30,58,95,0.4)',
  H: 'rgba(107,26,26,0.4)',
  D: 'rgba(26,92,42,0.4)',
  C: 'rgba(59,26,92,0.4)',
};

export default function HorseTrack({ positions, tracks, winningSuit, movingHorse }: Props) {
  return (
    <div className="w-full">
      {/* Track header */}
      <div className="flex items-center mb-2 px-2">
        <div className="w-20 text-xs text-purple-400">Horse</div>
        <div className="flex-1 flex justify-between text-xs text-purple-400 px-1">
          {Array.from({ length: tracks + 1 }, (_, i) => (
            <span key={i} style={{ width: `${100 / (tracks + 1)}%`, textAlign: 'center' }}>
              {i % 4 === 0 ? i : ''}
            </span>
          ))}
        </div>
        <div className="w-8 text-xs text-yellow-400 text-right">🏁</div>
      </div>

      {SUIT_ORDER.map(suit => {
        const pos = positions[suit] ?? 0;
        const pct = Math.min((pos / tracks) * 100, 100);
        const isWinner = winningSuit === suit;
        const isMoving = movingHorse === suit;

        return (
          <div
            key={suit}
            className="mb-3 rounded-lg overflow-hidden track-lane"
            style={{ background: LANE_COLORS[suit], border: `2px solid ${isWinner ? '#ffd700' : 'rgba(74,154,53,0.5)'}` }}
          >
            <div className="flex items-center h-16 px-2">
              {/* Label */}
              <div className="w-20 flex items-center gap-1 shrink-0">
                <span style={{ color: suit === 'H' || suit === 'D' ? '#e74c3c' : '#e8e8e8', fontSize: 20 }}>
                  {SUIT_SYMBOLS[suit]}
                </span>
                <span className="text-xs text-gray-300 hidden sm:inline">{SUIT_NAMES[suit]}</span>
              </div>

              {/* Track */}
              <div className="flex-1 relative h-10 mx-2">
                {/* Track marks */}
                <div className="absolute inset-0 flex">
                  {Array.from({ length: tracks }, (_, i) => (
                    <div
                      key={i}
                      className="border-r border-white/10"
                      style={{ width: `${100 / tracks}%` }}
                    />
                  ))}
                </div>

                {/* Horse */}
                <div
                  className="absolute top-0 flex items-center justify-center"
                  style={{
                    left: `${pct}%`,
                    transform: 'translateX(-50%)',
                    transition: isMoving ? 'left 0.5s ease-out' : undefined,
                    top: '50%',
                  }}
                >
                  <PixelHorse
                    suit={suit}
                    size={36}
                    galloping={isMoving}
                    celebrating={isWinner}
                  />
                </div>
              </div>

              {/* Finish line */}
              <div className="w-8 text-center">
                {isWinner ? <span className="text-xl animate-bounce">🏆</span> : <span className="text-lg opacity-30">🏁</span>}
              </div>
            </div>

            {/* Position indicator */}
            <div className="text-xs text-right px-2 pb-1 text-purple-300">
              {pos}/{tracks}
            </div>
          </div>
        );
      })}
    </div>
  );
}
