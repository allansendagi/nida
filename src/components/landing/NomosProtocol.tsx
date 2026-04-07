import Link from 'next/link';

export function NomosProtocol() {
  return (
    <section id="nomos" className="py-20 md:py-28 border-t">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-5xl">

          {/* Header */}
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-start mb-12">
            <div>
              <p className="mb-3 text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground/60">
                The Protocol
              </p>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                NOMOS — your service contract for the AI era.
              </h2>
            </div>
            <div className="flex flex-col gap-4 justify-center">
              <p className="text-muted-foreground leading-relaxed">
                A <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">.nomos</code> file
                is a machine-readable contract that tells AI agents exactly what you offer, where, at what
                price, and <strong className="text-foreground font-medium">when to act autonomously on your behalf</strong>.
                Unlike a profile locked inside one platform, it&apos;s a portable file you own.
              </p>
              <Link
                href="/nomos-builder"
                className="inline-flex items-center gap-2 self-start rounded-xl bg-foreground px-5 py-3 text-sm font-semibold text-background hover:opacity-90 transition-opacity"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Build your .nomos contract
              </Link>
            </div>
          </div>

          {/* Main showcase: code + agent trace side by side */}
          <div className="grid gap-px lg:grid-cols-[1fr_380px] rounded-2xl overflow-hidden border border-white/[0.08] bg-white/[0.03]">

            {/* Left: Contract file */}
            <div className="bg-gray-950 overflow-hidden">
              {/* Toolbar */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500/50" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <span className="w-3 h-3 rounded-full bg-green-500/50" />
                  <span className="ml-2 text-xs text-white/30 font-mono">al_falah_ac.nomos</span>
                </div>
                <Link
                  href="/nomos-builder"
                  className="text-xs text-white/30 hover:text-white/60 transition-colors"
                >
                  Build yours →
                </Link>
              </div>

              {/* Code */}
              <pre className="overflow-x-auto p-5 text-xs font-mono leading-relaxed text-white/50"
                dangerouslySetInnerHTML={{ __html: `{
  <span class="text-blue-300/70">"nomos_version"</span>: <span class="text-emerald-300/70">"0.1.0"</span>,
  <span class="text-blue-300/70">"service"</span>: {
    <span class="text-blue-300/70">"category"</span>: <span class="text-emerald-300/70">"home_services.hvac.repair"</span>,
    <span class="text-blue-300/70">"capabilities"</span>: [<span class="text-emerald-300/70">"repair"</span>, <span class="text-emerald-300/70">"installation"</span>, <span class="text-emerald-300/70">"maintenance"</span>]
  },
  <span class="text-blue-300/70">"service_area"</span>: { <span class="text-blue-300/70">"zones"</span>: [<span class="text-emerald-300/70">"west_bay"</span>, <span class="text-emerald-300/70">"the_pearl"</span>, <span class="text-emerald-300/70">"lusail"</span>] },
  <span class="text-blue-300/70">"pricing"</span>: { <span class="text-blue-300/70">"model"</span>: <span class="text-emerald-300/70">"tiered"</span>, <span class="text-blue-300/70">"urgency_multiplier"</span>: { <span class="text-blue-300/70">"same_day"</span>: <span class="text-purple-300/70">1.5</span> } },
  <span class="text-blue-300/70">"availability"</span>: { <span class="text-blue-300/70">"lead_time_hours"</span>: <span class="text-purple-300/70">2</span>, <span class="text-blue-300/70">"capacity"</span>: { <span class="text-blue-300/70">"max_daily_jobs"</span>: <span class="text-purple-300/70">5</span> } },

  <span class="text-amber-200/90 font-semibold">/* ↓ No other marketplace has this */</span>
  <span class="text-amber-300/80">"agent_instructions"</span>: {
    <span class="text-amber-300/60">"auto_accept"</span>: { <span class="text-amber-300/60">"enabled"</span>: <span class="text-emerald-300/80">true</span>, <span class="text-amber-300/60">"conditions"</span>: { <span class="text-amber-300/60">"min_lead_time_hours"</span>: <span class="text-purple-300/70">2</span> } },
    <span class="text-amber-300/60">"escalate_to_human"</span>: { <span class="text-amber-300/60">"triggers"</span>: [<span class="text-emerald-300/60">"high_value"</span>, <span class="text-emerald-300/60">"first_time_customer"</span>] },
    <span class="text-amber-300/60">"max_negotiation_rounds"</span>: <span class="text-purple-300/70">3</span>
  }
}` }}
              />
            </div>

            {/* Right: Agent decision trace */}
            <div className="bg-gray-900/80 p-6 flex flex-col gap-5 border-l border-white/[0.06]">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-amber-400/60 mb-1">
                  Live agent decision
                </p>
                <p className="text-xs text-white/40">What happens when a request arrives</p>
              </div>

              {/* Consumer request */}
              <div className="rounded-xl bg-white/5 border border-white/[0.08] p-3">
                <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1.5">Consumer request</p>
                <p className="text-sm text-white/70 leading-snug">
                  "Need AC repair in West Bay today — it's broken"
                </p>
              </div>

              {/* Agent steps */}
              <div className="flex flex-col gap-2.5">
                {[
                  {
                    icon: '🔍',
                    label: 'Category match',
                    value: 'home_services.hvac.repair ✓',
                    color: 'text-emerald-400/70',
                  },
                  {
                    icon: '📍',
                    label: 'Zone check',
                    value: 'west_bay — covered ✓',
                    color: 'text-emerald-400/70',
                  },
                  {
                    icon: '⏱',
                    label: 'Lead time',
                    value: '2h required — available ✓',
                    color: 'text-emerald-400/70',
                  },
                  {
                    icon: '💰',
                    label: 'Pricing',
                    value: 'Same-day × 1.5 applied',
                    color: 'text-purple-400/70',
                  },
                  {
                    icon: '🤖',
                    label: 'Agent rule check',
                    value: 'lead_time ≥ 2h → auto_accept',
                    color: 'text-amber-400/70',
                  },
                ].map((step) => (
                  <div key={step.label} className="flex items-start gap-2.5">
                    <span className="text-sm mt-0.5 flex-shrink-0">{step.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-white/30 uppercase tracking-wider">{step.label}</p>
                      <p className={`text-xs font-mono truncate ${step.color}`}>{step.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Decision */}
              <div className="mt-auto rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3">
                <p className="text-[10px] uppercase tracking-wider text-emerald-400/60 mb-1">Decision</p>
                <p className="text-sm font-semibold text-emerald-300">
                  ✅ Auto-accepted — no human needed
                </p>
                <p className="text-xs text-white/35 mt-1">
                  Provider notified instantly. Consumer confirmation sent.
                </p>
              </div>

              <p className="text-[10px] text-white/20 leading-relaxed">
                This entire flow ran without the business owner lifting a finger — because they defined their rules once in <span className="font-mono">agent_instructions</span>.
              </p>
            </div>
          </div>

          {/* Three points */}
          <div className="mt-4 grid gap-px sm:grid-cols-3 rounded-xl overflow-hidden border border-border">
            {[
              {
                label: 'For Businesses',
                title: 'Portable',
                desc: 'Your contract belongs to you — not the platform. Upload the same .nomos file to any compatible AI marketplace.',
              },
              {
                label: 'For AI Agents',
                title: 'Autonomous',
                desc: 'The agent_instructions block is your governance layer. Define exactly when your AI acts — and when it escalates to you.',
              },
              {
                label: 'For Consumers',
                title: 'Precise',
                desc: 'No guesswork. The AI reads the contract and scores fit exactly — zone, price, timing, capacity — before making contact.',
              },
            ].map((item) => (
              <div key={item.title} className="bg-muted/30 px-6 py-5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50 mb-2">{item.label}</p>
                <p className="font-semibold mb-1">{item.title}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
