'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PlayerSetup from '@/components/PlayerSetup';

export default function CreatePage() {
  const router = useRouter();
  const [step, setStep] = useState<'player' | 'settings'>('player');
  const [playerData, setPlayerData] = useState<{ name: string; pin: string } | null>(null);
  const [betAmount, setBetAmount] = useState(100);
  const [numDecks, setNumDecks] = useState(1);
  const [tracks, setTracks] = useState(12);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('ctc_player');
    if (saved) {
      const p = JSON.parse(saved);
      setPlayerData({ name: p.name, pin: p.pin });
      setStep('settings');
    }
  }, []);

  const handlePlayerSetup = (name: string, pin: string) => {
    setPlayerData({ name, pin });
    setStep('settings');
  };

  const handleCreate = async () => {
    if (!playerData) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/session/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: playerData.name,
          pin: playerData.pin,
          betAmountPoints: betAmount,
          numDecks,
          tracks,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create session');
      localStorage.setItem('ctc_player', JSON.stringify({
        id: data.playerId,
        name: playerData.name,
        pin: playerData.pin,
        sessionCode: data.code,
      }));
      router.push(`/lobby/${data.code}`);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (step === 'player') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <button onClick={() => router.push('/')} className="text-green-700 text-sm mb-6 hover:text-green-900">← Back</button>
        <h1 className="text-2xl font-bold pixel-text mb-6" style={{ color: '#1b4332' }}>WHO ARE YOU?</h1>
        <PlayerSetup onComplete={handlePlayerSetup} title="Create Your Profile" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <button onClick={() => router.push('/')} className="text-green-700 text-sm mb-6 hover:text-green-900">← Back</button>
      <h1 className="text-2xl font-bold pixel-text mb-6" style={{ color: '#1b4332' }}>CREATE SESSION</h1>

      <div className="bg-white border-2 border-green-700 rounded-xl p-6 w-full max-w-sm shadow-md">
        <p className="text-green-700 text-sm mb-4">Playing as: <span className="text-gray-900 font-bold">{playerData?.name}</span></p>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-green-800 text-sm block mb-1">Bet Amount per Round (points)</label>
            <input
              type="number"
              value={betAmount}
              onChange={e => setBetAmount(Math.max(1, Math.min(999999, parseInt(e.target.value) || 1)))}
              className="w-full bg-white border border-green-600 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-yellow-600 focus:ring-1 focus:ring-yellow-600"
              min={1} max={999999}
            />
          </div>

          <div>
            <label className="text-green-800 text-sm block mb-1">Number of Decks</label>
            <select
              value={numDecks}
              onChange={e => setNumDecks(parseInt(e.target.value))}
              className="w-full bg-white border border-green-600 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-yellow-600"
            >
              {[1, 2, 3].map(n => <option key={n} value={n}>{n} Deck{n > 1 ? 's' : ''}</option>)}
            </select>
          </div>

          <div>
            <label className="text-green-800 text-sm block mb-1">Track Length (steps to win)</label>
            <select
              value={tracks}
              onChange={e => setTracks(parseInt(e.target.value))}
              className="w-full bg-white border border-green-600 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-yellow-600"
            >
              {[8, 12, 16, 20, 24].map(t => <option key={t} value={t}>{t} steps</option>)}
            </select>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            onClick={handleCreate}
            disabled={loading}
            className="font-bold py-3 rounded-lg pixel-text transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: '#1b4332', color: '#fff' }}
          >
            {loading ? 'CREATING...' : 'CREATE SESSION'}
          </button>
        </div>
      </div>
    </div>
  );
}
