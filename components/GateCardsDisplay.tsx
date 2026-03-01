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
    <div className="flex items-end gap-1.5 justify-center">
      {[0, 1, 2, 3, 4].map(i => (
        <div
          key={i}
          className={`flex flex-col items-center gap-0.5 ${highlightIndex === i ? 'ring-2 ring-yellow-500 rounded' : ''}`}
        >
          <CardDisplay
            card={gateRevealed[i] ? gateCards[i] : null}
            faceDown={!gateRevealed[i]}
            small
          />
          <div className="text-xs" style={{ color: '#52b788', fontSize: 9, lineHeight: 1 }}>
            ≥{gateThresholds[i]}
          </div>
        </div>
      ))}
    </div>
  );
}
