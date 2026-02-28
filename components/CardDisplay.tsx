'use client';
import { Card } from '@/lib/types';

interface Props {
  card: Card | null;
  faceDown?: boolean;
  small?: boolean;
  flipping?: boolean;
}

const RANK_DISPLAY: Record<string, string> = {
  '10': '10', 'J': 'J', 'Q': 'Q', 'K': 'K',
  '2': '2', '3': '3', '4': '4', '5': '5',
  '6': '6', '7': '7', '8': '8', '9': '9',
};

export default function CardDisplay({ card, faceDown = false, small = false, flipping = false }: Props) {
  const w = small ? 40 : 80;
  const h = small ? 56 : 112;
  const isRed = card && (card.suit === 'H' || card.suit === 'D');
  const suitChar = card ? { S: '♠', H: '♥', D: '♦', C: '♣' }[card.suit] : '';

  return (
    <div className="card-flip" style={{ width: w, height: h }}>
      <div className={`card-flip-inner ${!faceDown && card ? 'flipped' : ''}`} style={{ width: w, height: h }}>
        {/* Back side */}
        <div className="card-face" style={{ width: w, height: h, borderRadius: 6, background: 'linear-gradient(135deg, #4a1a8c, #6b21a8)', border: '2px solid #9b59b6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: small ? 12 : 24, color: 'rgba(255,255,255,0.3)' }}>🃏</div>
        </div>
        {/* Front side */}
        <div className="card-back" style={{ width: w, height: h, borderRadius: 6, background: '#fff', border: '2px solid #ddd', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 4 }}>
          {card && (
            <>
              <div style={{ fontSize: small ? 10 : 20, fontWeight: 'bold', color: isRed ? '#e74c3c' : '#1a1a2e', lineHeight: 1 }}>
                {RANK_DISPLAY[card.rank]}
              </div>
              <div style={{ fontSize: small ? 16 : 32, color: isRed ? '#e74c3c' : '#1a1a2e', lineHeight: 1 }}>
                {suitChar}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
