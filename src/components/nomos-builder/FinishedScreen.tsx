'use client';

import { buildContract, type BuilderState } from '@/lib/nomos/build-contract';

interface Props {
  state: BuilderState;
  onEdit: () => void;
}

export function FinishedScreen({ state, onEdit }: Props) {
  const filename = `${state.displayName.toLowerCase().replace(/\s+/g, '_')}.nomos`;

  function handleDownload() {
    const contract = buildContract(state);
    const blob = new Blob([JSON.stringify(contract, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleCopy() {
    const contract = buildContract(state);
    navigator.clipboard.writeText(JSON.stringify(contract, null, 2));
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      {/* Mark */}
      <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-6">
        <span className="text-3xl">✓</span>
      </div>

      {/* Heading */}
      <h2 className="text-2xl font-bold text-white mb-2">Your contract is ready.</h2>
      <p className="text-sm text-white/40 mb-8 max-w-sm leading-relaxed">
        Download your <code className="text-emerald-400/70 font-mono">.nomos</code> file and upload it to any NOMOS-compatible platform — including Nida.
      </p>

      {/* Filename pill */}
      <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-3 mb-8">
        <span className="text-sm font-mono text-white/60">{filename}</span>
      </div>

      {/* Primary actions */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        <button
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 text-sm font-semibold text-white hover:bg-emerald-400 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download {filename}
        </button>
        <button
          onClick={handleCopy}
          className="flex items-center justify-center gap-2 rounded-xl bg-white/8 border border-white/10 px-4 py-3.5 text-sm font-medium text-white/70 hover:bg-white/12 transition-colors"
        >
          Copy JSON
        </button>
      </div>

      {/* Nida CTA */}
      <div className="mt-10 w-full max-w-sm rounded-xl border border-white/8 bg-white/3 p-5 text-left">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-2">Use on Nida</p>
        <p className="text-sm text-white/50 leading-relaxed mb-4">
          Upload this file during business registration to get matched with leads from day one.
        </p>
        <a
          href="/dashboard/onboarding"
          className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-100 transition-colors"
        >
          Register on Nida →
        </a>
      </div>

      {/* Edit link */}
      <button
        onClick={onEdit}
        className="mt-6 text-xs text-white/25 hover:text-white/50 transition-colors underline underline-offset-4"
      >
        Go back and edit
      </button>
    </div>
  );
}
