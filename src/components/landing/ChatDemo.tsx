'use client';

import { useEffect, useState } from 'react';

interface Message {
  from: 'user' | 'nida';
  text: string;
  delay: number; // ms from start to appear
}

const MESSAGES: Message[] = [
  { from: 'user', text: 'I need a plumber in West Bay today, leaking pipe 🚨', delay: 600 },
  { from: 'nida', text: '🔍 Got it — searching for plumbers near West Bay...', delay: 1800 },
  { from: 'nida', text: '✅ Found 3 verified plumbers! Al Falah Maintenance is ranked #1 (98% match). They\'ve been notified and have 15 min to accept.', delay: 3600 },
  { from: 'user', text: 'Wow that was fast!', delay: 5000 },
  { from: 'nida', text: '⚡ Al Falah accepted! They\'ll arrive within 2 hours. Here\'s their contact: +974 5551 2233', delay: 6200 },
];

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]" />
      <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.15s]" />
      <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
    </div>
  );
}

export function ChatDemo() {
  const [visibleCount, setVisibleCount] = useState(0);
  const [showTyping, setShowTyping] = useState(false);

  useEffect(() => {
    if (visibleCount >= MESSAGES.length) {
      // Restart after 3 seconds pause
      const restart = setTimeout(() => setVisibleCount(0), 3000);
      return () => clearTimeout(restart);
    }

    const next = MESSAGES[visibleCount];

    // Show typing indicator before nida messages
    let typingTimer: ReturnType<typeof setTimeout> | null = null;
    if (next.from === 'nida') {
      typingTimer = setTimeout(() => setShowTyping(true), next.delay - 700);
    }

    const revealTimer = setTimeout(() => {
      setShowTyping(false);
      setVisibleCount((c) => c + 1);
    }, next.delay);

    return () => {
      clearTimeout(revealTimer);
      if (typingTimer) clearTimeout(typingTimer);
    };
  }, [visibleCount]);

  const shown = MESSAGES.slice(0, visibleCount);

  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* Phone shell */}
      <div className="relative rounded-[2.5rem] border-[6px] border-gray-800 bg-gray-800 shadow-2xl overflow-hidden">
        {/* Status bar */}
        <div className="bg-gray-900 px-6 py-1 flex items-center justify-between">
          <span className="text-white text-xs font-medium">9:41</span>
          <div className="w-20 h-4 bg-gray-800 rounded-full mx-auto absolute left-1/2 -translate-x-1/2" />
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M1.5 8.5C5.5 4.5 10.5 2.5 12 2.5s6.5 2 10.5 6l-1.5 1.5C17.5 6.5 14.5 5 12 5S6.5 6.5 3 10L1.5 8.5z"/>
              <path d="M4.5 11.5C7.5 8.5 10 7.5 12 7.5s4.5 1 7.5 4l-1.5 1.5C15.5 10.5 14 9.5 12 9.5s-3.5 1-6 3.5L4.5 11.5z"/>
              <circle cx="12" cy="17" r="2"/>
            </svg>
            <svg className="w-3 h-3 text-white fill-current" viewBox="0 0 24 24">
              <rect x="2" y="7" width="4" height="10" rx="1"/>
              <rect x="8" y="4" width="4" height="13" rx="1"/>
              <rect x="14" y="2" width="4" height="15" rx="1"/>
              <rect x="20" y="1" width="2" height="16" rx="1" opacity=".3"/>
            </svg>
          </div>
        </div>

        {/* Chat header */}
        <div className="bg-[#075E54] px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#25D366] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            N
          </div>
          <div>
            <p className="text-white text-sm font-semibold leading-none">Nida</p>
            <p className="text-[#ACE5C9] text-xs mt-0.5">online</p>
          </div>
        </div>

        {/* Messages area */}
        <div
          className="bg-[#ECE5DD] px-3 py-4 space-y-2 min-h-[300px] overflow-hidden"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Crect width='60' height='60' fill='%23e5ddd5'/%3E%3Cpath d='M0 30 L60 30 M30 0 L30 60' stroke='%23d4c9c0' stroke-width='0.5'/%3E%3C/svg%3E")`,
          }}
        >
          {shown.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 shadow-sm text-xs leading-relaxed ${
                  msg.from === 'user'
                    ? 'bg-[#DCF8C6] text-gray-800 rounded-tr-none'
                    : 'bg-white text-gray-800 rounded-tl-none'
                }`}
                style={{ animation: 'fadeIn 0.25s ease-out' }}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {showTyping && (
            <div className="flex justify-start">
              <div className="bg-white rounded-lg rounded-tl-none shadow-sm">
                <TypingDots />
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
