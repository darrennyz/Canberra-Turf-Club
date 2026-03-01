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
            className="chat-message-float absolute text-sm px-3 py-1 rounded-full whitespace-nowrap"
            style={{
              background: 'rgba(27, 67, 50, 0.88)',
              border: '1px solid rgba(82, 183, 136, 0.6)',
              color: '#fff',
              right: 0,
              top: `${15 + (i % 8) * 10}%`,
              pointerEvents: 'none',
            }}
          >
            <span className="font-bold" style={{ color: '#86efac' }}>{msg.player_name}:</span> {msg.message}
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
          className="rounded-full px-4 py-2 text-white text-sm w-48 focus:outline-none"
          style={{
            background: 'rgba(27, 67, 50, 0.9)',
            border: '1px solid #52b788',
          }}
        />
        <button
          onClick={sendMessage}
          className="text-white text-sm px-4 py-2 rounded-full hover:opacity-80 transition-opacity"
          style={{ background: 'rgba(27, 67, 50, 0.9)', border: '1px solid #52b788' }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
