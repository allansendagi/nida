'use client';

import { useState } from 'react';

interface TelegramConnectProps {
  alreadyLinked: boolean;
}

export function TelegramConnect({ alreadyLinked }: TelegramConnectProps) {
  const [code, setCode] = useState<string | null>(null);
  const [deepLink, setDeepLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expiresIn, setExpiresIn] = useState<number | null>(null);

  async function generateCode() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/business/telegram-link', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate code');
      setCode(data.code);
      setDeepLink(data.deepLink);
      setExpiresIn(data.expiresInSeconds);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  if (alreadyLinked && !code) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
        <span>✅</span>
        <span>Telegram is connected — you&apos;ll receive leads there.</span>
        <button
          onClick={generateCode}
          className="ml-auto text-green-800 underline hover:no-underline text-xs"
        >
          Re-link
        </button>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="flex items-start gap-3">
        <span className="text-2xl">💬</span>
        <div>
          <p className="font-medium text-gray-900">Connect Telegram for instant lead alerts</p>
          <p className="text-sm text-gray-500 mt-0.5">
            Receive new leads with one-tap Accept/Decline buttons directly in Telegram.
          </p>
        </div>
      </div>

      {!code ? (
        <button
          onClick={generateCode}
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Generating...' : 'Get connection code'}
        </button>
      ) : (
        <div className="space-y-3">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500 mb-1">Your one-time code</p>
            <p className="text-3xl font-mono font-bold tracking-widest text-gray-900">{code}</p>
            {expiresIn && (
              <p className="text-xs text-gray-400 mt-1">Expires in {Math.floor(expiresIn / 60)} minutes</p>
            )}
          </div>

          <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
            <li>Open the Nida bot in Telegram</li>
            <li>
              Send: <code className="bg-gray-100 px-1 rounded">/link {code}</code>
            </li>
            <li>Done — leads will start arriving there</li>
          </ol>

          {deepLink && (
            <a
              href={deepLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-2 px-4 bg-[#229ED9] text-white text-sm font-medium rounded-lg text-center hover:bg-[#1a8fc4] transition-colors"
            >
              Open Nida in Telegram →
            </a>
          )}

          <button
            onClick={generateCode}
            disabled={loading}
            className="w-full py-1.5 text-xs text-gray-500 hover:text-gray-700"
          >
            Generate new code
          </button>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
