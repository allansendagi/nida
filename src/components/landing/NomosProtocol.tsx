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
                is a machine-readable contract that tells AI agents exactly what you offer, where, at what price,
                and when to act autonomously on your behalf. Unlike a database entry locked inside one platform,
                it&apos;s a portable file you own — upload it to any NOMOS-compatible marketplace.
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

          {/* Code block — updated to real schema */}
          <div className="rounded-2xl bg-gray-950 border border-white/[0.06] overflow-hidden">
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
            <pre className="overflow-x-auto p-5 text-xs font-mono leading-relaxed text-white/50">
{`{
  <span class="text-blue-300/70">"nomos_version"</span>: <span class="text-emerald-300/70">"0.1.0"</span>,
  <span class="text-blue-300/70">"service"</span>: {
    <span class="text-blue-300/70">"category"</span>: <span class="text-emerald-300/70">"home_services.hvac.repair"</span>,
    <span class="text-blue-300/70">"capabilities"</span>: [<span class="text-emerald-300/70">"repair"</span>, <span class="text-emerald-300/70">"installation"</span>, <span class="text-emerald-300/70">"maintenance"</span>]
  },
  <span class="text-blue-300/70">"service_area"</span>: { <span class="text-blue-300/70">"zones"</span>: [<span class="text-emerald-300/70">"west_bay"</span>, <span class="text-emerald-300/70">"the_pearl"</span>, <span class="text-emerald-300/70">"lusail"</span>] },
  <span class="text-blue-300/70">"pricing"</span>: { <span class="text-blue-300/70">"model"</span>: <span class="text-emerald-300/70">"tiered"</span>, <span class="text-blue-300/70">"urgency_multiplier"</span>: { <span class="text-blue-300/70">"same_day"</span>: <span class="text-purple-300/70">1.5</span> } },
  <span class="text-blue-300/70">"availability"</span>: { <span class="text-blue-300/70">"lead_time_hours"</span>: <span class="text-purple-300/70">2</span>, <span class="text-blue-300/70">"capacity"</span>: { <span class="text-blue-300/70">"max_daily_jobs"</span>: <span class="text-purple-300/70">5</span> } },
  <span class="text-blue-300/70">"agent_instructions"</span>: {
    <span class="text-blue-300/70">"auto_accept"</span>: { <span class="text-blue-300/70">"enabled"</span>: <span class="text-amber-300/70">true</span>, <span class="text-blue-300/70">"conditions"</span>: { <span class="text-blue-300/70">"min_lead_time_hours"</span>: <span class="text-purple-300/70">2</span> } },
    <span class="text-blue-300/70">"escalate_to_human"</span>: { <span class="text-blue-300/70">"triggers"</span>: [<span class="text-emerald-300/70">"high_value"</span>, <span class="text-emerald-300/70">"first_time_customer"</span>] },
    <span class="text-blue-300/70">"max_negotiation_rounds"</span>: <span class="text-purple-300/70">3</span>
  }
}`}
            </pre>
          </div>

          {/* Three points — no icons, clean */}
          <div className="mt-10 grid gap-px sm:grid-cols-3 rounded-xl overflow-hidden border border-border">
            {[
              {
                title: 'Portable',
                desc: 'Your contract belongs to you. Upload the same file to any NOMOS-compatible platform.',
              },
              {
                title: 'Autonomous',
                desc: 'Define exactly when your AI agent acts — and when it asks you first.',
              },
              {
                title: 'Precise',
                desc: 'No guesswork matching. AI reads the contract and scores your fit exactly.',
              },
            ].map((item) => (
              <div key={item.title} className="bg-muted/30 px-6 py-5">
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
