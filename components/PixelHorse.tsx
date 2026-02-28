'use client';
import { Suit } from '@/lib/types';

interface Props {
  suit: Suit;
  size?: number;
  galloping?: boolean;
  celebrating?: boolean;
}

const SUIT_BG: Record<Suit, string> = {
  S: '#1e3a5f',
  H: '#6b1a1a',
  D: '#1a5c2a',
  C: '#3b1a5c',
};

const SUIT_LABEL: Record<Suit, string> = {
  S: '♠',
  H: '♥',
  D: '♦',
  C: '♣',
};

// 16x16 pixel art horse (simplified pixel array)
const HORSE_PIXELS = [
  [0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0],
  [0,0,0,2,2,1,1,1,0,0,0,0,0,0,0,0],
  [0,0,2,2,1,1,1,1,1,0,0,0,0,0,0,0],
  [0,0,2,1,1,1,1,1,1,1,0,0,0,0,0,0],
  [0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0],
  [0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0],
  [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
  [0,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0],
  [0,0,0,0,0,1,1,1,1,1,1,1,1,1,0,0],
  [0,2,2,0,0,1,1,1,1,1,1,1,0,0,0,0],
  [0,0,2,2,1,1,1,1,1,1,0,0,0,0,0,0],
  [0,0,0,0,3,0,3,0,0,3,0,3,0,0,0,0],
  [0,0,0,3,3,0,3,3,0,3,3,0,3,0,0,0],
  [0,0,0,3,0,0,3,0,0,3,0,0,3,0,0,0],
  [0,0,0,3,0,0,3,0,0,3,0,0,3,0,0,0],
];

export default function PixelHorse({ suit, size = 48, galloping = false, celebrating = false }: Props) {
  const pixelSize = size / 16;
  const bg = SUIT_BG[suit];
  const label = SUIT_LABEL[suit];
  const isRed = suit === 'H' || suit === 'D';

  return (
    <div
      style={{ width: size, height: size + 8, position: 'relative' }}
      className={`inline-block pixel-horse ${galloping ? 'horse-galloping' : ''} ${celebrating ? 'celebrating' : ''}`}
    >
      {/* Pixel grid */}
      <div style={{ width: size, height: size, position: 'relative', imageRendering: 'pixelated' }}>
        {HORSE_PIXELS.map((row, ri) =>
          row.map((pixel, ci) => {
            if (pixel === 0) return null;
            let color = '#c8a97a'; // body
            if (pixel === 2) color = isRed ? '#8b4513' : '#555'; // mane
            if (pixel === 3) color = '#8b6914'; // legs
            return (
              <div
                key={`${ri}-${ci}`}
                style={{
                  position: 'absolute',
                  top: ri * pixelSize,
                  left: ci * pixelSize,
                  width: pixelSize,
                  height: pixelSize,
                  background: color,
                }}
              />
            );
          })
        )}
      </div>
      {/* Suit badge */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          background: bg,
          borderRadius: '50%',
          width: size * 0.5,
          height: size * 0.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: size * 0.28,
          color: isRed ? '#ff6b6b' : '#eee',
          border: `${pixelSize}px solid rgba(255,255,255,0.3)`,
          fontWeight: 'bold',
        }}
      >
        {label}
      </div>
    </div>
  );
}
