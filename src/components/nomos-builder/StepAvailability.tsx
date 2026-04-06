import type { BuilderState } from '@/lib/nomos/build-contract';

const DAYS = [
  { key: 'sunday',    label: 'Sun' },
  { key: 'monday',    label: 'Mon' },
  { key: 'tuesday',   label: 'Tue' },
  { key: 'wednesday', label: 'Wed' },
  { key: 'thursday',  label: 'Thu' },
  { key: 'friday',    label: 'Fri' },
  { key: 'saturday',  label: 'Sat' },
];

interface Props {
  state: BuilderState;
  onChange: (patch: Partial<BuilderState>) => void;
}

export function StepAvailability({ state, onChange }: Props) {
  function toggleDay(key: string) {
    const current = state.operatingHours[key];
    const isClosed = current === 'closed';
    onChange({
      operatingHours: {
        ...state.operatingHours,
        [key]: isClosed ? { open: '08:00', close: '18:00' } : 'closed',
      },
    });
  }

  function setHour(day: string, field: 'open' | 'close', value: string) {
    const current = state.operatingHours[day];
    if (current === 'closed') return;
    onChange({
      operatingHours: {
        ...state.operatingHours,
        [day]: { ...current, [field]: value },
      },
    });
  }

  return (
    <div className="space-y-8">
      {/* Weekly grid */}
      <div>
        <p className="text-sm font-medium text-white/70 mb-4">Operating hours</p>
        <div className="space-y-2">
          {DAYS.map(({ key, label }) => {
            const entry = state.operatingHours[key];
            const isClosed = entry === 'closed';
            return (
              <div key={key} className={`flex items-center gap-3 rounded-xl px-4 py-3 border transition-colors ${
                isClosed ? 'border-white/5 bg-white/2' : 'border-white/10 bg-white/4'
              }`}>
                {/* Day label */}
                <span className={`w-8 text-xs font-semibold flex-shrink-0 ${isClosed ? 'text-white/20' : 'text-white/60'}`}>
                  {label}
                </span>

                {/* Hours or Closed */}
                {isClosed ? (
                  <span className="flex-1 text-xs text-white/20">Closed</span>
                ) : (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="time"
                      value={(entry as { open: string; close: string }).open}
                      onChange={(e) => setHour(key, 'open', e.target.value)}
                      className="bg-transparent text-white/70 text-xs focus:outline-none focus:text-white"
                    />
                    <span className="text-white/20 text-xs">→</span>
                    <input
                      type="time"
                      value={(entry as { open: string; close: string }).close}
                      onChange={(e) => setHour(key, 'close', e.target.value)}
                      className="bg-transparent text-white/70 text-xs focus:outline-none focus:text-white"
                    />
                  </div>
                )}

                {/* Toggle */}
                <button
                  type="button"
                  onClick={() => toggleDay(key)}
                  className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${
                    isClosed ? 'bg-white/10' : 'bg-emerald-500/70'
                  }`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    isClosed ? 'left-0.5' : 'left-[1.125rem]'
                  }`} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lead time + capacity */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-white/50 mb-1.5">
            Minimum lead time
          </label>
          <div className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3 py-2.5">
            <input
              type="number"
              min={0}
              value={state.leadTimeHours}
              onChange={(e) => onChange({ leadTimeHours: parseInt(e.target.value) || 0 })}
              className="w-full bg-transparent text-white text-sm focus:outline-none"
            />
            <span className="text-white/30 text-xs">hours</span>
          </div>
          <p className="text-xs text-white/25 mt-1">Minimum notice before a job can start</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-white/50 mb-1.5">
            Daily capacity
          </label>
          <div className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3 py-2.5">
            <input
              type="number"
              min={1}
              value={state.maxDailyJobs}
              onChange={(e) => onChange({ maxDailyJobs: parseInt(e.target.value) || 1 })}
              className="w-full bg-transparent text-white text-sm focus:outline-none"
            />
            <span className="text-white/30 text-xs">jobs/day</span>
          </div>
          <p className="text-xs text-white/25 mt-1">AI stops accepting leads when limit is reached</p>
        </div>
      </div>
    </div>
  );
}
