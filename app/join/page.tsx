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
        <button onClick={() => router.push('/')} className="text-green-700 text-sm mb-6 hover:text-green-900">← Back</button>
        <h1 className="text-2xl font-bold pixel-text mb-6" style={{ color: '#1b4332' }}>WHO ARE YOU?</h1>
        <PlayerSetup onComplete={handlePlayerSetup} title="Create Your Profile" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <button onClick={() => router.push('/')} className="text-green-700 text-sm mb-6 hover:text-green-900">← Back</button>
      <h1 className="text-2xl font-bold pixel-text mb-6" style={{ color: '#1b4332' }}>JOIN SESSION</h1>

      <div className="bg-white border-2 border-green-700 rounded-xl p-6 w-full max-w-sm shadow-md">
        <p className="text-green-700 text-sm mb-4">Playing as: <span className="text-gray-900 font-bold">{playerData?.name}</span></p>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-green-800 text-sm block mb-1">Session Code</label>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
              className="w-full bg-white border border-green-600 rounded-lg px-4 py-3 text-gray-900 text-2xl text-center tracking-widest font-bold focus:outline-none focus:border-yellow-600 focus:ring-1 focus:ring-yellow-600"
              placeholder="XXXXXX"
              maxLength={6}
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            onClick={handleJoin}
            disabled={loading || code.length !== 6}
            className="font-bold py-3 rounded-lg pixel-text transition-all hover:opacity-90 disabled:opacity-40"
            style={{ background: '#1b4332', color: '#fff' }}
          >
            {loading ? 'JOINING...' : 'JOIN SESSION'}
          </button>
        </div>
      </div>
    </div>
  );
}
