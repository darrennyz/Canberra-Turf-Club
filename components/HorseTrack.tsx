'use client';
import { Suit } from '@/lib/types';
import { SUIT_SYMBOLS, SUIT_NAMES } from '@/lib/gameLogic';

interface Props {
  positions: Record<Suit, number>;
  tracks: number;
  winningSuit?: Suit | null;
  movingHorse?: Suit | null;
  myHorseSuit?: Suit | null;
}

const SUIT_ORDER: Suit[] = ['S', 'H', 'D', 'C'];

export default function HorseTrack({ positions, tracks, winningSuit, movingHorse, myHorseSuit }: Props) {
  return (
    <div className="w-full h-full flex flex-col gap-1">
      {SUIT_ORDER.map(suit => {
        const pos = positions[suit] ?? 0;
        const pct = Math.min((pos / tracks) * 100, 100);
        const isWinner = winningSuit === suit;
        const isMoving = movingHorse === suit;
        const isMyHorse = myHorseSuit === suit;
        const isRed = suit === 'H' || suit === 'D';

        return (
          <div
            key={suit}
            className="flex-1 rounded-lg overflow-hidden relative"
            style={{
              background: 'linear-gradient(90deg, #1b4332 0%, #2d6a4f 50%, #1b4332 100%)',
              border: isMyHorse
                ? '3px solid #c9a627'
                : isWinner
                ? '2px solid #86efac'
                : '2px solid #52b788',
              boxShadow: isMyHorse ? '0 0 10px rgba(201,166,39,0.5)' : undefined,
            }}
          >
            <div className="flex items-center h-full px-2">
              {/* Lane label */}
              <div className="w-14 flex items-center gap-1 shrink-0">
                <span style={{ color: isRed ? '#ff9999' : '#e8e8e8', fontSize: 18 }}>
                  {SUIT_SYMBOLS[suit]}
                </span>
                {isMyHorse && (
                  <span className="text-xs font-bold" style={{ color: '#c9a627' }}>YOU</span>
                )}
              </div>

              {/* Track area */}
              <div className="flex-1 relative mx-1" style={{ height: 40 }}>
                {/* Track dividers */}
                <div className="absolute inset-0 flex">
                  {Array.from({ length: tracks }, (_, i) => (
                    <div
                      key={i}
                      className="border-r border-white/15"
                      style={{ width: `${100 / tracks}%` }}
                    />
                  ))}
                </div>

                {/* Horse emoji — flipped to face right */}
                <div
                  className="absolute"
                  style={{
                    left: `${pct}%`,
                    transform: 'translateX(-50%)',
                    top: '50%',
                    marginTop: '-16px',
                    transition: isMoving ? 'left 0.5s ease-out' : undefined,
                  }}
                >
                  <span
                    className={`select-none ${isMoving ? 'horse-galloping' : ''} ${isWinner ? 'celebrating' : ''}`}
                    style={{
                      fontSize: 28,
                      lineHeight: 1,
                      display: 'inline-block',
                      transform: 'scaleX(-1)', /* flip to face right */
                      filter: isMyHorse ? 'drop-shadow(0 0 4px #c9a627)' : undefined,
                    }}
                  >
                    🏇
                  </span>
                </div>
              </div>

              {/* Finish */}
              <div className="w-7 text-center shrink-0">
                {isWinner
                  ? <span className="text-lg">🏆</span>
                  : <span className="text-base opacity-40">🏁</span>
                }
              </div>
            </div>

            {/* MY HORSE banner on the right edge */}
            {isMyHorse && (
              <div
                className="absolute top-0 right-0 px-1 text-xs font-bold rounded-bl"
                style={{ background: '#c9a627', color: '#1b4332', fontSize: 9, lineHeight: '16px' }}
              >
                MY BET
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
