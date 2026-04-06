import type { BuilderState } from '@/lib/nomos/build-contract';

const CATEGORIES = [
  { key: 'home_services.hvac',            emoji: '❄️',  label: 'HVAC / AC',        desc: 'Repair, installation, maintenance' },
  { key: 'home_services.plumbing',        emoji: '🔧',  label: 'Plumbing',          desc: 'Pipes, leaks, drainage' },
  { key: 'home_services.electrical',      emoji: '⚡',  label: 'Electrical',        desc: 'Wiring, repair, installation' },
  { key: 'home_services.cleaning',        emoji: '🧹',  label: 'Cleaning',          desc: 'Deep clean, regular, move-in/out' },
  { key: 'home_services.pest_control',    emoji: '🐜',  label: 'Pest Control',      desc: 'Insects, rodents, termites' },
  { key: 'home_services.appliance_repair',emoji: '🔨',  label: 'Appliance Repair',  desc: 'AC, fridge, washer, oven' },
];

interface Props {
  state: BuilderState;
  onChange: (patch: Partial<BuilderState>) => void;
}

export function StepIdentity({ state, onChange }: Props) {
  return (
    <div className="space-y-8">
      {/* Business name */}
      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">
          Business name
        </label>
        <input
          type="text"
          value={state.displayName}
          onChange={(e) => onChange({ displayName: e.target.value })}
          placeholder="e.g. Al Falah AC Services"
          className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-white/25 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-colors"
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-white/70 mb-3">
          What type of service do you provide?
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => onChange({ categoryKey: cat.key, capabilities: [] })}
              className={`rounded-xl border p-4 text-left transition-all ${
                state.categoryKey === cat.key
                  ? 'border-emerald-500/60 bg-emerald-500/10 ring-1 ring-emerald-500/30'
                  : 'border-white/10 bg-white/3 hover:border-white/20 hover:bg-white/5'
              }`}
            >
              <span className="text-2xl block mb-2">{cat.emoji}</span>
              <p className="text-sm font-semibold text-white leading-tight">{cat.label}</p>
              <p className="text-xs text-white/35 mt-1 leading-relaxed">{cat.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
