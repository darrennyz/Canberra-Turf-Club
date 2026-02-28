'use client';
import { Card } from '@/lib/types';
import CardDisplay from './CardDisplay';

interface Props {
  gateCards: Array<Card | null>;
  gateRevealed: boolean[];
  gateThresholds: number[];
  highlightIndex?: number;
}

export default function GateCardsDisplay({ gateCards, gateRevealed, gateThresholds, highlightIndex }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-xs text-purple-400 text-center mb-1 pixel-text">⚠ GATE CARDS ⚠</div>
      <div className="flex gap-2 justify-center flex-wrap">
        {[0, 1, 2, 3, 4].map(i => (
          <div
            key={i}
            className={`flex flex-col items-center gap-1 ${highlightIndex === i ? 'ring-2 ring-yellow-400 rounded' : ''}`}
          >
            <CardDisplay
              card={gateRevealed[i] ? gateCards[i] : null}
              faceDown={!gateRevealed[i]}
              small
            />
            <div className="text-xs text-purple-400">
              ≥{gateThresholds[i]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
