'use client';

import { useMemo } from 'react';
import { buildContract, type BuilderState } from '@/lib/nomos/build-contract';

interface Props {
  state: BuilderState;
}

function highlight(json: string): string {
  return json
    .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
      if (/^"/.test(match)) {
        if (/:$/.test(match)) return `<span class="text-blue-300/80">${match}</span>`;
        return `<span class="text-emerald-300/80">${match}</span>`;
      }
      if (/true|false/.test(match)) return `<span class="text-amber-300/80">${match}</span>`;
      if (/null/.test(match)) return `<span class="text-red-300/60">${match}</span>`;
      return `<span class="text-purple-300/80">${match}</span>`;
    });
}

export function LivePreview({ state }: Props) {
  const json = useMemo(() => {
    if (!state.displayName && !state.categoryKey) {
      return JSON.stringify({ nomos_version: '0.1.0', contract_type: 'service_offering', '...': 'fill in the form to build your contract' }, null, 2);
    }
    try {
      return JSON.stringify(buildContract(state), null, 2);
    } catch {
      return '{}';
    }
  }, [state]);

  const highlighted = useMemo(() => highlight(json), [json]);
  const lineCount = json.split('\n').length;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/8 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
          <span className="ml-2 text-xs text-white/30 font-mono">
            {state.displayName
              ? `${state.displayName.toLowerCase().replace(/\s+/g, '_')}.nomos`
              : 'contract.nomos'}
          </span>
        </div>
        <span className="text-xs text-white/20">{lineCount} lines</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <pre
          className="text-xs font-mono leading-relaxed p-4 text-white/50"
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </div>
    </div>
  );
}
