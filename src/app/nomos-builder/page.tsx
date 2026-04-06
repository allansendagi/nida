'use client';

import { useState } from 'react';
import { DEFAULT_STATE, type BuilderState } from '@/lib/nomos/build-contract';
import { StepIdentity } from '@/components/nomos-builder/StepIdentity';
import { StepCapabilities } from '@/components/nomos-builder/StepCapabilities';
import { StepZones } from '@/components/nomos-builder/StepZones';
import { StepPricing } from '@/components/nomos-builder/StepPricing';
import { StepAvailability } from '@/components/nomos-builder/StepAvailability';
import { StepTerms } from '@/components/nomos-builder/StepTerms';
import { StepAgentInstructions } from '@/components/nomos-builder/StepAgentInstructions';
import { LivePreview } from '@/components/nomos-builder/LivePreview';
import { FinishedScreen } from '@/components/nomos-builder/FinishedScreen';

const STEPS = [
  { id: 1, label: 'Identity',      short: '01' },
  { id: 2, label: 'Capabilities',  short: '02' },
  { id: 3, label: 'Zones',         short: '03' },
  { id: 4, label: 'Pricing',       short: '04' },
  { id: 5, label: 'Availability',  short: '05' },
  { id: 6, label: 'Terms',         short: '06' },
  { id: 7, label: 'Agent Rules',   short: '07' },
];

function canAdvance(step: number, s: BuilderState): boolean {
  if (step === 1) return s.displayName.trim().length > 0 && s.categoryKey !== '';
  if (step === 2) return s.capabilities.length > 0;
  if (step === 3) return s.zones.length > 0;
  return true;
}

export default function NomosBuilderPage() {
  const [state, setState] = useState<BuilderState>(DEFAULT_STATE);
  const [step, setStep] = useState(1);
  const [finished, setFinished] = useState(false);

  function patch(update: Partial<BuilderState>) {
    setState((prev) => ({ ...prev, ...update }));
  }

  if (finished) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <FinishedScreen state={state} onEdit={() => setFinished(false)} />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-57px)]">

      {/* Left: Form */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Step progress */}
        <div className="border-b border-white/[0.06] px-6 py-4">
          <div className="flex items-center gap-1">
            {STEPS.map((s, i) => {
              const isActive = s.id === step;
              const isDone = s.id < step;
              return (
                <div key={s.id} className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => s.id < step && setStep(s.id)}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-white/10 text-white'
                        : isDone
                        ? 'text-white/40 hover:text-white/60 cursor-pointer'
                        : 'text-white/15 cursor-default'
                    }`}
                  >
                    <span className={`font-mono text-[10px] ${isActive ? 'text-emerald-400' : ''}`}>
                      {s.short}
                    </span>
                    <span className="hidden sm:inline">{s.label}</span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <span className={`w-3 h-px ${isDone ? 'bg-white/20' : 'bg-white/6'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step content */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-xl">
            {/* Step heading */}
            <div className="mb-8">
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-white/25 mb-2">
                Step {step} of {STEPS.length}
              </p>
              <h1 className="text-2xl font-bold text-white">
                {step === 1 && 'Who are you?'}
                {step === 2 && 'What can you do?'}
                {step === 3 && 'Where do you work?'}
                {step === 4 && 'What do you charge?'}
                {step === 5 && 'When are you available?'}
                {step === 6 && 'What are your terms?'}
                {step === 7 && 'Configure your AI agent.'}
              </h1>
              {step === 7 && (
                <p className="mt-2 text-sm text-white/40 leading-relaxed">
                  These are the rules your AI agent operates by on your behalf.
                </p>
              )}
            </div>

            {/* Render current step */}
            {step === 1 && <StepIdentity state={state} onChange={patch} />}
            {step === 2 && <StepCapabilities state={state} onChange={patch} />}
            {step === 3 && <StepZones state={state} onChange={patch} />}
            {step === 4 && <StepPricing state={state} onChange={patch} />}
            {step === 5 && <StepAvailability state={state} onChange={patch} />}
            {step === 6 && <StepTerms state={state} onChange={patch} />}
            {step === 7 && <StepAgentInstructions state={state} onChange={patch} />}
          </div>
        </div>

        {/* Navigation */}
        <div className="border-t border-white/[0.06] px-6 py-4 flex items-center justify-between flex-shrink-0">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
            className="px-4 py-2 rounded-xl text-sm font-medium text-white/40 hover:text-white/70 disabled:opacity-0 transition-colors"
          >
            ← Back
          </button>

          {step < STEPS.length ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              disabled={!canAdvance(step, state)}
              className="px-6 py-2.5 rounded-xl bg-white text-gray-900 text-sm font-semibold hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Continue →
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setFinished(true)}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-400 transition-colors"
            >
              Build contract →
            </button>
          )}
        </div>
      </div>

      {/* Right: Live preview — hidden on mobile */}
      <div className="hidden lg:flex w-[360px] flex-col border-l border-white/[0.06] bg-gray-900/50">
        <LivePreview state={state} />
      </div>

    </div>
  );
}
