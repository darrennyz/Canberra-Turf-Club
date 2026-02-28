'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [hasPlayer, setHasPlayer] = useState(false);

  useEffect(() => {
    const p = localStorage.getItem('ctc_player');
    if (p) setHasPlayer(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="text-center mb-12">
        <div className="text-6xl mb-4">🏇</div>
        <h1 className="text-5xl font-bold text-yellow-400 pixel-text tracking-widest mb-2">
          CANBERRA
        </h1>
        <h2 className="text-3xl font-bold text-yellow-300 pixel-text tracking-widest mb-4">
          TURF CLUB
        </h2>
        <p className="text-purple-300 text-sm tracking-wider">MULTIPLAYER HORSE RACING CARD GAME</p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button
          onClick={() => router.push('/create')}
          className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 px-8 rounded-lg text-xl pixel-text tracking-wider transition-all transform hover:scale-105 shadow-lg shadow-yellow-500/30"
        >
          CREATE SESSION
        </button>
        <button
          onClick={() => router.push('/join')}
          className="bg-purple-700 hover:bg-purple-600 text-white font-bold py-4 px-8 rounded-lg text-xl pixel-text tracking-wider transition-all transform hover:scale-105 shadow-lg shadow-purple-500/30 border border-purple-500"
        >
          JOIN SESSION
        </button>
      </div>

      <div className="mt-12 text-center text-purple-400 text-xs pixel-text">
        <p>Pick a horse. Place your bet. Watch the race.</p>
      </div>
    </div>
  );
}
