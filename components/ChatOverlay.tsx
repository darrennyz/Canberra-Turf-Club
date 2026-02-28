'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase';

interface ChatMsg {
  id: string;
  player_name: string;
  message: string;
  created_at: string;
}

interface Props {
  sessionCode: string;
  playerId: string;
  playerName: string;
}

export default function ChatOverlay({ sessionCode, playerId, playerName }: Props) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const lastSendTimes = useRef<number[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel(`chat:${sessionCode}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `session_code=eq.${sessionCode}`,
      }, payload => {
        const msg = payload.new as ChatMsg;
        setMessages(prev => {
          const next = [...prev, { ...msg, displayId: Date.now() + Math.random() } as any];
          return next.slice(-20);
        });
        // Auto-remove after 3s
        setTimeout(() => {
          setMessages(prev => prev.filter(m => m.id !== msg.id));
        }, 3000);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [sessionCode]);

  const sendMessage = useCallback(async () => {
    const msg = input.trim();
    if (!msg) return;

    // Client-side rate limit: 3/sec
    const now = Date.now();
    lastSendTimes.current = lastSendTimes.current.filter(t => now - t < 1000);
    if (lastSendTimes.current.length >= 3) {
      setInput('');
      return;
    }
    lastSendTimes.current.push(now);
    setInput('');

    await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionCode, playerId, playerName, message: msg }),
    });
  }, [input, sessionCode, playerId, playerName]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Floating messages */}
      <div className="absolute inset-0 overflow-hidden">
        {messages.map((msg, i) => (
          <div
            key={msg.id}
            className="chat-message-float absolute bg-black/70 text-white text-sm px-3 py-1 rounded-full border border-purple-500/50 whitespace-nowrap"
            style={{
              right: 0,
              top: `${15 + (i % 8) * 10}%`,
              pointerEvents: 'none',
            }}
          >
            <span className="text-purple-300 font-bold">{msg.player_name}:</span> {msg.message}
          </div>
        ))}
      </div>

      {/* Input area */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-auto flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value.slice(0, 80))}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Chat..."
          className="bg-black/70 border border-purple-600 rounded-full px-4 py-2 text-white text-sm w-48 focus:outline-none focus:border-yellow-400"
        />
        <button
          onClick={sendMessage}
          className="bg-purple-700/80 hover:bg-purple-600 text-white text-sm px-4 py-2 rounded-full border border-purple-500"
        >
          Send
        </button>
      </div>
    </div>
  );
}
