'use client';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'linear-gradient(160deg, #1b4332 0%, #2d6a4f 55%, #1a5028 100%)' }}>
      <div className="text-center mb-12">
        <div className="text-6xl mb-4">🏇</div>
        <h1 className="text-5xl font-bold text-white pixel-text tracking-widest mb-2">
          CANBERRA
        </h1>
        <h2 className="text-3xl font-bold pixel-text tracking-widest mb-4" style={{ color: '#c9a627' }}>
          TURF CLUB
        </h2>
        <p className="text-green-100 text-sm tracking-widest" style={{ fontFamily: 'Georgia, serif' }}>
          MULTIPLAYER HORSE RACING CARD GAME
        </p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button
          onClick={() => router.push('/create')}
          className="font-bold py-4 px-8 rounded-lg text-xl pixel-text tracking-wider transition-all transform hover:scale-105 shadow-lg"
          style={{ background: '#c9a627', color: '#1b4332' }}
        >
          CREATE SESSION
        </button>
        <button
          onClick={() => router.push('/join')}
          className="bg-white hover:bg-green-50 font-bold py-4 px-8 rounded-lg text-xl pixel-text tracking-wider transition-all transform hover:scale-105 shadow-lg border-2 border-white"
          style={{ color: '#1b4332' }}
        >
          JOIN SESSION
        </button>
      </div>

      <div className="mt-12 text-center text-green-200 text-xs pixel-text">
        <p>Pick a horse. Place your bet. Watch the race.</p>
      </div>
    </div>
  );
}
