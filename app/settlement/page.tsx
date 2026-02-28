'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SettlementData } from '@/lib/types';

export default function SettlementPage() {
  const router = useRouter();
  const [data, setData] = useState<SettlementData | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('ctc_settlement');
    if (!stored) { router.push('/'); return; }
    setData(JSON.parse(stored));
  }, []);

  if (!data) return <div className="min-h-screen flex items-center justify-center"><div className="text-yellow-400 pixel-text">Loading...</div></div>;

  const entries = Object.entries(data.netPoints).sort((a, b) => b[1].net - a[1].net);

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto">
      <div className="text-center mb-8 pt-4">
        <div className="text-5xl mb-3">🏁</div>
        <h1 className="text-3xl font-bold text-yellow-400 pixel-text mb-1">SESSION OVER</h1>
        <p className="text-purple-300">Final Settlement</p>
      </div>

      {/* Total played */}
      <div className="bg-purple-900/40 border border-purple-600 rounded-xl p-4 mb-4 text-center">
        <div className="text-purple-300 text-sm">Total Points Played in Session</div>
        <div className="text-white text-3xl font-bold font-mono">{data.totalPointsPlayed}</div>
      </div>

      {/* Net results */}
      <div className="bg-purple-900/30 border border-purple-700 rounded-xl p-4 mb-4">
        <h2 className="text-purple-300 font-bold pixel-text mb-3">PLAYER NET</h2>
        {entries.map(([id, { name, net }]) => (
          <div key={id} className="flex items-center justify-between py-2 border-b border-purple-800 last:border-0">
            <span className="text-white font-bold">{name}</span>
            <div className="flex items-center gap-2">
              <span className={`font-bold font-mono text-lg ${net > 0 ? 'net-positive' : net < 0 ? 'net-negative' : 'net-zero'}`}>
                {net > 0 ? '+' : ''}{net} pts
              </span>
              <span className="text-xs text-gray-400">
                {net > 0 ? 'owed to them' : net < 0 ? 'owes' : 'even'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Transfers */}
      <div className="bg-yellow-900/20 border border-yellow-700 rounded-xl p-4 mb-6">
        <h2 className="text-yellow-400 font-bold pixel-text mb-3">SETTLEMENT TRANSFERS</h2>
        {data.transfers.length === 0 ? (
          <p className="text-gray-400 text-sm text-center">All square! No transfers needed.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {data.transfers.map((t, i) => (
              <div key={i} className="bg-yellow-900/30 rounded-lg px-4 py-3 flex items-center gap-2 flex-wrap">
                <span className="text-red-300 font-bold">{t.fromName}</span>
                <span className="text-gray-400">pays</span>
                <span className="text-green-300 font-bold">{t.toName}</span>
                <span className="text-yellow-400 font-bold ml-auto">{t.amount} pts</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => { localStorage.removeItem('ctc_settlement'); router.push('/'); }}
        className="w-full bg-purple-700 hover:bg-purple-600 text-white font-bold py-4 rounded-xl text-lg pixel-text transition-all border border-purple-500"
      >
        EXIT TO HOME
      </button>
    </div>
  );
}
