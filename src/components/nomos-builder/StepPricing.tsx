import type { BuilderState } from '@/lib/nomos/build-contract';

const MODELS = [
  { key: 'tiered',  label: 'Tiered',  desc: 'Different price per service type' },
  { key: 'fixed',   label: 'Fixed',   desc: 'One flat rate for all jobs' },
  { key: 'hourly',  label: 'Hourly',  desc: 'Charge by the hour' },
  { key: 'quote',   label: 'Quote',   desc: 'Price determined per job' },
] as const;

interface Props {
  state: BuilderState;
  onChange: (patch: Partial<BuilderState>) => void;
}

function NumberInput({ label, value, onChange, suffix, step, min }: {
  label: string; value: number; onChange: (v: number) => void;
  suffix?: string; step?: number; min?: number;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-white/50 mb-1.5">{label}</label>
      <div className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 focus-within:border-white/25 transition-colors">
        <input
          type="number"
          value={value}
          min={min ?? 0}
          step={step ?? 1}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-full bg-transparent text-white text-sm focus:outline-none"
        />
        {suffix && <span className="text-white/30 text-xs flex-shrink-0">{suffix}</span>}
      </div>
    </div>
  );
}

export function StepPricing({ state, onChange }: Props) {
  return (
    <div className="space-y-8">
      {/* Model picker */}
      <div>
        <p className="text-sm font-medium text-white/70 mb-3">Pricing model</p>
        <div className="grid grid-cols-2 gap-2">
          {MODELS.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => onChange({ pricingModel: m.key })}
              className={`rounded-xl border p-3 text-left transition-all ${
                state.pricingModel === m.key
                  ? 'border-emerald-500/60 bg-emerald-500/10 ring-1 ring-emerald-500/30'
                  : 'border-white/10 bg-white/3 hover:border-white/20'
              }`}
            >
              <p className="text-sm font-semibold text-white">{m.label}</p>
              <p className="text-xs text-white/35 mt-0.5">{m.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <p className="text-sm font-medium text-white/70 mb-3">Price range (QAR)</p>
        <div className="grid grid-cols-3 gap-3">
          <NumberInput label="Base price" value={state.priceBase} onChange={(v) => onChange({ priceBase: v })} suffix="QAR" />
          <NumberInput label="Minimum" value={state.minPrice} onChange={(v) => onChange({ minPrice: v })} suffix="QAR" />
          <NumberInput label="Maximum" value={state.maxPrice} onChange={(v) => onChange({ maxPrice: v })} suffix="QAR" />
        </div>
      </div>

      {/* Urgency multipliers */}
      <div>
        <p className="text-sm font-medium text-white/70 mb-1">Urgency multipliers</p>
        <p className="text-xs text-white/35 mb-3">
          Your AI agent automatically applies these to urgent jobs. 1.5× means 50% premium.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <NumberInput
            label="Same-day rate"
            value={state.urgencySameDay}
            onChange={(v) => onChange({ urgencySameDay: v })}
            suffix="×"
            step={0.1}
            min={1}
          />
          <NumberInput
            label="Next-day rate"
            value={state.urgencyNextDay}
            onChange={(v) => onChange({ urgencyNextDay: v })}
            suffix="×"
            step={0.1}
            min={1}
          />
        </div>
      </div>
    </div>
  );
}
