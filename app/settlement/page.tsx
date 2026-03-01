'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { SettlementData } from '@/lib/types';

export default function SettlementPage() {
  const router = useRouter();
  const [data, setData] = useState<SettlementData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      // Master player: settlement saved in localStorage
      const stored = localStorage.getItem('ctc_settlement');
      if (stored) {
        localStorage.removeItem('ctc_settlement');
        setData(JSON.parse(stored));
        setLoading(false);
        return;
      }

      // All other players: fetch from DB using ?code= param
      const code = new URLSearchParams(window.location.search).get('code');
      if (!code) { router.push('/'); return; }

      const supabase = createClient();
      const fetchSettlement = async () => {
        const { data: sessionData } = await supabase
          .from('sessions')
          .select('settlement_data')
          .eq('code', code)
          .maybeSingle();
        return sessionData?.settlement_data as SettlementData | null;
      };

      let settlement = await fetchSettlement();
      if (!settlement) {
        // DB write may be slightly delayed — retry once after 1.5s
        await new Promise(r => setTimeout(r, 1500));
        settlement = await fetchSettlement();
      }

      if (settlement) {
        setData(settlement);
      } else {
        router.push('/');
      }
      setLoading(false);
    };

    load();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-xl pixel-text" style={{ color: '#1b4332' }}>Loading settlement...</div>
    </div>
  );

  if (!data) return null;

  const entries = Object.entries(data.netPoints).sort((a, b) => b[1].net - a[1].net);

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto">
      <div className="text-center mb-8 pt-4">
        <div className="text-5xl mb-3">🏁</div>
        <h1 className="text-3xl font-bold pixel-text mb-1" style={{ color: '#1b4332' }}>SESSION OVER</h1>
        <p className="text-green-700">Final Settlement</p>
      </div>

      {/* Total played */}
      <div className="bg-white border-2 border-green-600 rounded-xl p-4 mb-4 text-center shadow-sm">
        <div className="text-green-700 text-sm">Total Points Played in Session</div>
        <div className="text-gray-900 text-3xl font-bold font-mono">{data.totalPointsPlayed}</div>
      </div>

      {/* Net results */}
      <div className="bg-white border border-green-300 rounded-xl p-4 mb-4 shadow-sm">
        <h2 className="text-green-800 font-bold pixel-text mb-3">PLAYER NET</h2>
        {entries.map(([id, { name, net }]) => (
          <div key={id} className="flex items-center justify-between py-2 border-b border-green-100 last:border-0">
            <span className="text-gray-900 font-bold">{name}</span>
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
      <div className="bg-green-50 border-2 border-green-600 rounded-xl p-4 mb-6 shadow-sm">
        <h2 className="font-bold pixel-text mb-3" style={{ color: '#c9a627', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>SETTLEMENT TRANSFERS</h2>
        {data.transfers.length === 0 ? (
          <p className="text-gray-500 text-sm text-center">All square! No transfers needed.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {data.transfers.map((t, i) => (
              <div key={i} className="bg-white rounded-lg px-4 py-3 flex items-center gap-2 flex-wrap border border-green-200">
                <span className="text-red-600 font-bold">{t.fromName}</span>
                <span className="text-gray-500">pays</span>
                <span className="font-bold" style={{ color: '#15803d' }}>{t.toName}</span>
                <span className="font-bold ml-auto" style={{ color: '#c9a627' }}>{t.amount} pts</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => router.push('/')}
        className="w-full text-white font-bold py-4 rounded-xl text-lg pixel-text transition-all hover:opacity-90 border border-green-600"
        style={{ background: '#1b4332' }}
      >
        EXIT TO HOME
      </button>
    </div>
  );
}
