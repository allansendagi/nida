import type { BuilderState } from '@/lib/nomos/build-contract';

interface Props {
  state: BuilderState;
  onChange: (patch: Partial<BuilderState>) => void;
}

function Field({ label, hint, value, onChange, suffix }: {
  label: string; hint: string; value: number;
  onChange: (v: number) => void; suffix: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/3 p-5">
      <label className="block text-sm font-semibold text-white mb-1">{label}</label>
      <p className="text-xs text-white/35 mb-4 leading-relaxed">{hint}</p>
      <div className="flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-3 py-2.5 focus-within:border-white/25 transition-colors">
        <input
          type="number"
          min={0}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value) || 0)}
          className="w-full bg-transparent text-white text-sm focus:outline-none"
        />
        <span className="text-white/30 text-xs flex-shrink-0">{suffix}</span>
      </div>
    </div>
  );
}

export function StepTerms({ state, onChange }: Props) {
  return (
    <div className="space-y-4">
      <Field
        label="Warranty period"
        hint="How long after the job do you cover any issues or callbacks at no extra charge?"
        value={state.warrantyDays}
        onChange={(v) => onChange({ warrantyDays: v })}
        suffix="days"
      />
      <Field
        label="Free cancellation window"
        hint="Consumers can cancel without charge if they do so at least this many hours before the job."
        value={state.freeCancellationHours}
        onChange={(v) => onChange({ freeCancellationHours: v })}
        suffix="hours"
      />
      <Field
        label="Late cancellation fee"
        hint="If the consumer cancels after the free window, this percentage of the job value is charged."
        value={state.cancellationFeePercent}
        onChange={(v) => onChange({ cancellationFeePercent: v })}
        suffix="%"
      />
    </div>
  );
}
