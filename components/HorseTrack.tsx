'use client';
import { Suit } from '@/lib/types';
import { SUIT_SYMBOLS, SUIT_NAMES } from '@/lib/gameLogic';

interface Props {
  positions: Record<Suit, number>;
  tracks: number;
  winningSuit?: Suit | null;
  movingHorse?: Suit | null;
}

const SUIT_ORDER: Suit[] = ['S', 'H', 'D', 'C'];

const LANE_COLORS: Record<Suit, string> = {
  S: 'rgba(30, 58, 150, 0.12)',
  H: 'rgba(180, 20, 20, 0.10)',
  D: 'rgba(20, 120, 50, 0.12)',
  C: 'rgba(80, 20, 140, 0.10)',
};

export default function HorseTrack({ positions, tracks, winningSuit, movingHorse }: Props) {
  return (
    <div className="w-full">
      {/* Track header */}
      <div className="flex items-center mb-2 px-2">
        <div className="w-20 text-xs text-green-700">Horse</div>
        <div className="flex-1 flex justify-between text-xs text-green-700 px-1">
          {Array.from({ length: tracks + 1 }, (_, i) => (
            <span key={i} style={{ width: `${100 / (tracks + 1)}%`, textAlign: 'center' }}>
              {i % 4 === 0 ? i : ''}
            </span>
          ))}
        </div>
        <div className="w-8 text-xs text-right" style={{ color: '#c9a627' }}>🏁</div>
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
            style={{
              background: isWinner
                ? 'linear-gradient(90deg, #1b4332 0%, #2d6a4f 50%, #1b4332 100%)'
                : `linear-gradient(90deg, #1b4332 0%, #2d6a4f 50%, #1b4332 100%)`,
              border: `2px solid ${isWinner ? '#c9a627' : '#52b788'}`,
            }}
          >
            <div className="flex items-center h-16 px-2">
              {/* Label */}
              <div className="w-20 flex items-center gap-1 shrink-0">
                <span style={{ color: suit === 'H' || suit === 'D' ? '#ff6b6b' : '#e8e8e8', fontSize: 20 }}>
                  {SUIT_SYMBOLS[suit]}
                </span>
                <span className="text-xs text-green-100 hidden sm:inline">{SUIT_NAMES[suit]}</span>
              </div>

              {/* Track */}
              <div className="flex-1 relative h-10 mx-2">
                {/* Track marks */}
                <div className="absolute inset-0 flex">
                  {Array.from({ length: tracks }, (_, i) => (
                    <div
                      key={i}
                      className="border-r border-white/20"
                      style={{ width: `${100 / tracks}%` }}
                    />
                  ))}
                </div>

                {/* Horse emoji */}
                <div
                  className="absolute flex items-center justify-center"
                  style={{
                    left: `${pct}%`,
                    transform: 'translateX(-50%)',
                    transition: isMoving ? 'left 0.5s ease-out' : undefined,
                    top: '50%',
                    marginTop: '-18px',
                  }}
                >
                  <span
                    className={`select-none ${isMoving ? 'horse-galloping' : ''} ${isWinner ? 'celebrating' : ''}`}
                    style={{ fontSize: 32, lineHeight: 1, display: 'inline-block' }}
                  >
                    🏇
                  </span>
                </div>
              </div>

              {/* Finish line */}
              <div className="w-8 text-center">
                {isWinner
                  ? <span className="text-xl animate-bounce">🏆</span>
                  : <span className="text-lg opacity-40">🏁</span>
                }
              </div>
            </div>

            {/* Position indicator */}
            <div className="text-xs text-right px-2 pb-1 text-green-200">
              {pos}/{tracks}
            </div>
          </div>
        );
      })}
    </div>
  );
}
