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
        <button onClick={() => router.push('/')} className="text-purple-400 text-sm mb-6 hover:text-purple-300">← Back</button>
        <h1 className="text-2xl font-bold text-yellow-400 pixel-text mb-6">WHO ARE YOU?</h1>
        <PlayerSetup onComplete={handlePlayerSetup} title="Create Your Profile" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <button onClick={() => router.push('/')} className="text-purple-400 text-sm mb-6 hover:text-purple-300">← Back</button>
      <h1 className="text-2xl font-bold text-yellow-400 pixel-text mb-6">CREATE SESSION</h1>

      <div className="bg-purple-900/50 border border-purple-500 rounded-xl p-6 w-full max-w-sm">
        <p className="text-purple-300 text-sm mb-4">Playing as: <span className="text-white font-bold">{playerData?.name}</span></p>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-purple-300 text-sm block mb-1">Bet Amount per Round (points)</label>
            <input
              type="number"
              value={betAmount}
              onChange={e => setBetAmount(Math.max(1, Math.min(999999, parseInt(e.target.value) || 1)))}
              className="w-full bg-purple-950 border border-purple-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-400"
              min={1} max={999999}
            />
          </div>

          <div>
            <label className="text-purple-300 text-sm block mb-1">Number of Decks</label>
            <select
              value={numDecks}
              onChange={e => setNumDecks(parseInt(e.target.value))}
              className="w-full bg-purple-950 border border-purple-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-400"
            >
              {[1, 2, 3].map(n => <option key={n} value={n}>{n} Deck{n > 1 ? 's' : ''}</option>)}
            </select>
          </div>

          <div>
            <label className="text-purple-300 text-sm block mb-1">Track Length (steps to win)</label>
            <select
              value={tracks}
              onChange={e => setTracks(parseInt(e.target.value))}
              className="w-full bg-purple-950 border border-purple-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-400"
            >
              {[8, 12, 16, 20, 24].map(t => <option key={t} value={t}>{t} steps</option>)}
            </select>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            onClick={handleCreate}
            disabled={loading}
            className="bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-black font-bold py-3 rounded-lg pixel-text transition-all"
          >
            {loading ? 'CREATING...' : 'CREATE SESSION'}
          </button>
        </div>
      </div>
    </div>
  );
}
