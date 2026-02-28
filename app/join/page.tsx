'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PlayerSetup from '@/components/PlayerSetup';

export default function JoinPage() {
  const router = useRouter();
  const [step, setStep] = useState<'player' | 'code'>('player');
  const [playerData, setPlayerData] = useState<{ name: string; pin: string } | null>(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('ctc_player');
    if (saved) {
      const p = JSON.parse(saved);
      setPlayerData({ name: p.name, pin: p.pin });
      setStep('code');
    }
  }, []);

  const handlePlayerSetup = (name: string, pin: string) => {
    setPlayerData({ name, pin });
    setStep('code');
  };

  const handleJoin = async () => {
    if (!playerData || code.trim().length !== 6) {
      setError('Please enter a valid 6-character code');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/session/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: playerData.name,
          pin: playerData.pin,
          sessionCode: code.toUpperCase(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to join session');
      localStorage.setItem('ctc_player', JSON.stringify({
        id: data.playerId,
        name: playerData.name,
        pin: playerData.pin,
        sessionCode: code.toUpperCase(),
      }));
      router.push(`/lobby/${code.toUpperCase()}`);
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
      <h1 className="text-2xl font-bold text-yellow-400 pixel-text mb-6">JOIN SESSION</h1>

      <div className="bg-purple-900/50 border border-purple-500 rounded-xl p-6 w-full max-w-sm">
        <p className="text-purple-300 text-sm mb-4">Playing as: <span className="text-white font-bold">{playerData?.name}</span></p>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-purple-300 text-sm block mb-1">Session Code</label>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
              className="w-full bg-purple-950 border border-purple-600 rounded-lg px-4 py-3 text-white text-2xl text-center tracking-widest font-bold focus:outline-none focus:border-yellow-400"
              placeholder="XXXXXX"
              maxLength={6}
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            onClick={handleJoin}
            disabled={loading || code.length !== 6}
            className="bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-black font-bold py-3 rounded-lg pixel-text transition-all"
          >
            {loading ? 'JOINING...' : 'JOIN SESSION'}
          </button>
        </div>
      </div>
    </div>
  );
}
