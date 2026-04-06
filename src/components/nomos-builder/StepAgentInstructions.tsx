import type { BuilderState } from '@/lib/nomos/build-contract';
import { ESCALATION_TRIGGER_LABELS, ESCALATION_TRIGGER_DESCRIPTIONS, type EscalationTrigger } from '@/types/nomos';

const ALL_TRIGGERS = Object.keys(ESCALATION_TRIGGER_LABELS) as EscalationTrigger[];

interface Props {
  state: BuilderState;
  onChange: (patch: Partial<BuilderState>) => void;
}

export function StepAgentInstructions({ state, onChange }: Props) {
  function toggleTrigger(trigger: string) {
    const current = state.escalationTriggers;
    onChange({
      escalationTriggers: current.includes(trigger)
        ? current.filter((t) => t !== trigger)
        : [...current, trigger],
    });
  }

  return (
    <div className="space-y-8">

      {/* Auto-accept */}
      <div className="rounded-xl border border-white/10 bg-white/3 p-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-white">Auto-accept leads</p>
            <p className="text-xs text-white/40 mt-1 leading-relaxed">
              When enabled, your AI agent accepts matching leads automatically — no action needed from you.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onChange({ autoAcceptEnabled: !state.autoAcceptEnabled })}
            className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 mt-0.5 ${
              state.autoAcceptEnabled ? 'bg-emerald-500/70' : 'bg-white/10'
            }`}
          >
            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
              state.autoAcceptEnabled ? 'left-[1.375rem]' : 'left-1'
            }`} />
          </button>
        </div>

        {state.autoAcceptEnabled && (
          <div className="space-y-3 pt-2 border-t border-white/8">
            <p className="text-xs font-medium text-white/50">Auto-accept conditions</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-white/40 mb-1.5">Min lead time (hours)</label>
                <div className="flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-3 py-2 focus-within:border-white/25">
                  <input
                    type="number"
                    min={0}
                    value={state.autoAcceptMinLeadTime}
                    onChange={(e) => onChange({ autoAcceptMinLeadTime: parseInt(e.target.value) || 0 })}
                    className="w-full bg-transparent text-white text-sm focus:outline-none"
                  />
                  <span className="text-white/25 text-xs">hrs</span>
                </div>
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1.5">Min job value (QAR)</label>
                <div className="flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-3 py-2 focus-within:border-white/25">
                  <input
                    type="number"
                    min={0}
                    value={state.autoAcceptMinPrice}
                    onChange={(e) => onChange({ autoAcceptMinPrice: parseInt(e.target.value) || 0 })}
                    className="w-full bg-transparent text-white text-sm focus:outline-none"
                  />
                  <span className="text-white/25 text-xs">QAR</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Escalation triggers */}
      <div>
        <p className="text-sm font-semibold text-white mb-1">Escalation triggers</p>
        <p className="text-xs text-white/40 mb-4 leading-relaxed">
          Your AI agent will notify you and pause before accepting when any of these conditions are met.
        </p>
        <div className="space-y-2">
          {ALL_TRIGGERS.map((trigger) => {
            const selected = state.escalationTriggers.includes(trigger);
            return (
              <button
                key={trigger}
                type="button"
                onClick={() => toggleTrigger(trigger)}
                className={`w-full flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                  selected
                    ? 'border-amber-500/40 bg-amber-500/8'
                    : 'border-white/8 bg-white/2 hover:border-white/15'
                }`}
              >
                <span className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center text-xs transition-colors ${
                  selected ? 'bg-amber-500/70 border-amber-500/70 text-white' : 'border-white/20'
                }`}>
                  {selected && '✓'}
                </span>
                <div>
                  <p className={`text-sm font-medium leading-tight ${selected ? 'text-amber-200' : 'text-white/60'}`}>
                    {ESCALATION_TRIGGER_LABELS[trigger]}
                  </p>
                  <p className="text-xs text-white/30 mt-0.5 leading-relaxed">
                    {ESCALATION_TRIGGER_DESCRIPTIONS[trigger]}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Max rounds */}
      <div className="rounded-xl border border-white/10 bg-white/3 p-5">
        <p className="text-sm font-semibold text-white mb-1">Max negotiation rounds</p>
        <p className="text-xs text-white/40 mb-4 leading-relaxed">
          How many counter-offers can your AI agent exchange before escalating to you?
        </p>
        <div className="flex gap-3">
          {[1, 2, 3, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange({ maxNegotiationRounds: n })}
              className={`w-12 h-12 rounded-xl text-sm font-bold border transition-all ${
                state.maxNegotiationRounds === n
                  ? 'border-emerald-500/60 bg-emerald-500/15 text-emerald-300'
                  : 'border-white/10 bg-white/3 text-white/40 hover:border-white/25'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
