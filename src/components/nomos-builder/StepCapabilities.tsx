import type { BuilderState } from '@/lib/nomos/build-contract';

const CAPABILITIES: Record<string, { key: string; label: string }[]> = {
  'home_services.hvac': [
    { key: 'repair',        label: 'Repair' },
    { key: 'installation',  label: 'Installation' },
    { key: 'maintenance',   label: 'Maintenance' },
    { key: 'cleaning',      label: 'Cleaning' },
  ],
  'home_services.plumbing': [
    { key: 'repair',         label: 'Repair' },
    { key: 'installation',   label: 'Installation' },
    { key: 'emergency',      label: 'Emergency' },
    { key: 'drain_cleaning', label: 'Drain Cleaning' },
  ],
  'home_services.electrical': [
    { key: 'repair',        label: 'Repair' },
    { key: 'installation',  label: 'Installation' },
    { key: 'wiring',        label: 'Wiring' },
    { key: 'emergency',     label: 'Emergency' },
  ],
  'home_services.cleaning': [
    { key: 'deep_cleaning', label: 'Deep Cleaning' },
    { key: 'regular',       label: 'Regular' },
    { key: 'move_in_out',   label: 'Move In/Out' },
    { key: 'carpet',        label: 'Carpet Cleaning' },
  ],
  'home_services.pest_control': [
    { key: 'general',   label: 'General' },
    { key: 'termites',  label: 'Termites' },
    { key: 'rodents',   label: 'Rodents' },
    { key: 'insects',   label: 'Insects' },
  ],
  'home_services.appliance_repair': [
    { key: 'washing_machine', label: 'Washing Machine' },
    { key: 'refrigerator',    label: 'Refrigerator' },
    { key: 'oven',            label: 'Oven' },
    { key: 'dishwasher',      label: 'Dishwasher' },
  ],
};

interface Props {
  state: BuilderState;
  onChange: (patch: Partial<BuilderState>) => void;
}

export function StepCapabilities({ state, onChange }: Props) {
  const options = CAPABILITIES[state.categoryKey] || [];

  function toggle(key: string) {
    const current = state.capabilities;
    onChange({
      capabilities: current.includes(key)
        ? current.filter((c) => c !== key)
        : [...current, key],
    });
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-white/50 leading-relaxed">
        Select every service you can deliver. Your AI agent will only accept leads that match these capabilities.
      </p>

      <div className="flex flex-wrap gap-3">
        {options.map((opt) => {
          const selected = state.capabilities.includes(opt.key);
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => toggle(opt.key)}
              className={`rounded-xl px-5 py-3 text-sm font-medium border transition-all ${
                selected
                  ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 ring-1 ring-emerald-500/30'
                  : 'bg-white/3 border-white/10 text-white/60 hover:border-white/25 hover:text-white/80'
              }`}
            >
              {selected && <span className="mr-1.5">✓</span>}
              {opt.label}
            </button>
          );
        })}
      </div>

      {state.capabilities.length > 0 && (
        <p className="text-xs text-white/30">
          {state.capabilities.length} capability{state.capabilities.length > 1 ? 's' : ''} selected
        </p>
      )}
    </div>
  );
}
