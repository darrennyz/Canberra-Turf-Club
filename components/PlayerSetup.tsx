'use client';
import { useState } from 'react';

interface Props {
  onComplete: (name: string, pin: string) => void;
  title: string;
}

export default function PlayerSetup({ onComplete, title }: Props) {
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (name.trim().length < 3 || name.trim().length > 16) {
      setError('Name must be 3–16 characters');
      return;
    }
    if (pin.length < 4 || pin.length > 6 || !/^\d+$/.test(pin)) {
      setError('PIN must be 4–6 digits');
      return;
    }
    onComplete(name.trim(), pin);
  };

  return (
    <div className="bg-purple-900/50 border border-purple-500 rounded-xl p-6 w-full max-w-sm">
      <h2 className="text-xl font-bold text-yellow-400 pixel-text mb-4">{title}</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-purple-300 text-sm block mb-1">Display Name (3–16 chars)</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={16}
            className="w-full bg-purple-950 border border-purple-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-400"
            placeholder="e.g. HorseGuru"
          />
        </div>
        <div>
          <label className="text-purple-300 text-sm block mb-1">PIN (4–6 digits)</label>
          <input
            type="password"
            inputMode="numeric"
            value={pin}
            onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="w-full bg-purple-950 border border-purple-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-400"
            placeholder="••••"
          />
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-lg pixel-text transition-all"
        >
          CONTINUE →
        </button>
      </form>
    </div>
  );
}
