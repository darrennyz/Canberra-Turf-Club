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
    <div className="bg-white border-2 border-green-700 rounded-xl p-6 w-full max-w-sm shadow-md">
      <h2 className="text-xl font-bold pixel-text mb-4" style={{ color: '#1b4332' }}>{title}</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-green-800 text-sm block mb-1">Display Name (3–16 chars)</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={16}
            className="w-full bg-white border border-green-600 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-yellow-600 focus:ring-1 focus:ring-yellow-600"
            placeholder="e.g. HorseGuru"
          />
        </div>
        <div>
          <label className="text-green-800 text-sm block mb-1">PIN (4–6 digits)</label>
          <input
            type="password"
            inputMode="numeric"
            value={pin}
            onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="w-full bg-white border border-green-600 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-yellow-600 focus:ring-1 focus:ring-yellow-600"
            placeholder="••••"
          />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          type="submit"
          className="font-bold py-3 rounded-lg pixel-text transition-all hover:opacity-90"
          style={{ background: '#1b4332', color: '#fff' }}
        >
          CONTINUE →
        </button>
      </form>
    </div>
  );
}
