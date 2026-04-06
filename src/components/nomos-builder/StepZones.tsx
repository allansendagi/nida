import { QATAR_ZONES, ZONE_DISPLAY_NAMES } from '@/types/intent';
import type { BuilderState } from '@/lib/nomos/build-contract';

interface Props {
  state: BuilderState;
  onChange: (patch: Partial<BuilderState>) => void;
}

export function StepZones({ state, onChange }: Props) {
  function cycleZone(zone: string) {
    const isPrimary = state.zones.includes(zone);
    const isSurcharge = state.surchargeZones.includes(zone);

    if (!isPrimary && !isSurcharge) {
      // Off → Primary
      onChange({ zones: [...state.zones, zone] });
    } else if (isPrimary && !isSurcharge) {
      // Primary → Surcharge
      onChange({
        zones: state.zones.filter((z) => z !== zone),
        surchargeZones: [...state.surchargeZones, zone],
      });
    } else {
      // Surcharge → Off
      onChange({
        surchargeZones: state.surchargeZones.filter((z) => z !== zone),
      });
    }
  }

  const totalSelected = state.zones.length + state.surchargeZones.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-6 text-xs text-white/40">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-emerald-500/70" />
          Primary zone (standard rate)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-amber-500/70" />
          Surcharge zone (+15%)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-white/10" />
          Not served
        </span>
      </div>

      <p className="text-xs text-white/35">
        Click once for primary, click again for surcharge, click again to deselect.
      </p>

      <div className="grid grid-cols-3 gap-2">
        {QATAR_ZONES.map((zone) => {
          const isPrimary = state.zones.includes(zone);
          const isSurcharge = state.surchargeZones.includes(zone);
          return (
            <button
              key={zone}
              type="button"
              onClick={() => cycleZone(zone)}
              className={`rounded-xl px-3 py-2.5 text-xs font-medium border transition-all text-center ${
                isPrimary
                  ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300'
                  : isSurcharge
                  ? 'bg-amber-500/15 border-amber-500/50 text-amber-300'
                  : 'bg-white/3 border-white/10 text-white/40 hover:border-white/20 hover:text-white/60'
              }`}
            >
              {ZONE_DISPLAY_NAMES[zone]}
            </button>
          );
        })}
      </div>

      {totalSelected > 0 && (
        <p className="text-xs text-white/30">
          {state.zones.length} primary · {state.surchargeZones.length} surcharge
        </p>
      )}
    </div>
  );
}
