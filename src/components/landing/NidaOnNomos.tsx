export function NidaOnNomos() {
  return (
    <section className="py-20 md:py-28 border-t bg-gray-950 text-white">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-5xl">

          {/* Header */}
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-start mb-12">
            <div>
              <p className="mb-3 text-xs font-semibold tracking-[0.2em] uppercase text-white/30">
                Governing Infrastructure
              </p>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">
                Nida runs on&nbsp;.nomos&nbsp;too.
              </h2>
            </div>
            <div className="flex flex-col gap-4 justify-center">
              <p className="text-white/50 leading-relaxed">
                We didn&apos;t just build a governance standard for AI agents — we were the first to run
                on it. Every AI decision Nida makes is bounded by a formally declared contract.
                Not a system prompt. Not a policy doc. A{' '}
                <code className="text-xs bg-white/10 px-1.5 py-0.5 rounded font-mono text-amber-300/80">.nomos</code>{' '}
                file — versioned, auditable, machine-executable.
              </p>
              <p className="text-white/30 text-sm leading-relaxed">
                When regulators ask how Nida governs its AI, we hand them{' '}
                <span className="font-mono text-white/50">NOMOS-NIDA-PLATFORM-001</span>.
                Not a PDF. An artifact.
              </p>
            </div>
          </div>

          {/* Main panel */}
          <div className="grid gap-px lg:grid-cols-[1fr_340px] rounded-2xl overflow-hidden border border-white/[0.08] bg-white/[0.03]">

            {/* Left: nida.nomos.json */}
            <div className="bg-gray-950 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500/50" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <span className="w-3 h-3 rounded-full bg-green-500/50" />
                  <span className="ml-2 text-xs text-white/30 font-mono">nida.nomos.json</span>
                </div>
                <span className="text-[10px] text-white/20 font-mono">NOMOS-NIDA-PLATFORM-001 v1</span>
              </div>

              <pre className="overflow-x-auto p-5 text-xs font-mono leading-relaxed text-white/40"
                dangerouslySetInnerHTML={{ __html: `{
  <span class="text-blue-300/60">"artifact_id"</span>: <span class="text-emerald-300/60">"NOMOS-NIDA-PLATFORM-001"</span>,
  <span class="text-blue-300/60">"contract_type"</span>: <span class="text-emerald-300/60">"platform_operator"</span>,
  <span class="text-blue-300/60">"jurisdiction"</span>: { <span class="text-blue-300/60">"country"</span>: <span class="text-emerald-300/60">"QA"</span>, <span class="text-blue-300/60">"currency"</span>: <span class="text-emerald-300/60">"QAR"</span> },

  <span class="text-blue-300/60">"agent_instructions"</span>: {
    <span class="text-blue-300/60">"role"</span>: <span class="text-emerald-300/60">"service_intake_agent"</span>,
    <span class="text-blue-300/60">"allowed_actions"</span>: [
      <span class="text-emerald-300/60">"collect_consumer_intent"</span>,
      <span class="text-emerald-300/60">"ask_clarifying_questions"</span>,
      <span class="text-emerald-300/60">"report_current_request_status"</span>,
      <span class="text-emerald-300/60">"acknowledge_cancellation_request"</span>
    ],

    <span class="text-amber-200/90 font-semibold">/* ↓ Hard constraints — no prompt can override these */</span>
    <span class="text-red-300/80">"restricted_actions"</span>: [
      <span class="text-red-300/60">"promise_specific_eta_or_arrival_time"</span>,
      <span class="text-red-300/60">"contact_provider_directly"</span>,
      <span class="text-red-300/60">"claim_to_escalate_manually"</span>,
      <span class="text-red-300/60">"guarantee_price_or_availability"</span>,
      <span class="text-red-300/60">"create_intent_when_consumer_has_active_one"</span>,
      <span class="text-red-300/60">"share_consumer_contact_before_acceptance"</span>
    ]
  },

  <span class="text-blue-300/60">"consumer_rights"</span>: {
    <span class="text-blue-300/60">"cancel_anytime_before_execution"</span>: <span class="text-purple-300/70">true</span>,
    <span class="text-blue-300/60">"cancel_after_provider_acceptance"</span>: <span class="text-purple-300/70">true</span>,
    <span class="text-blue-300/60">"contact_not_shared_before_acceptance"</span>: <span class="text-purple-300/70">true</span>
  }
}` }}
              />
            </div>

            {/* Right: what this means */}
            <div className="bg-gray-900/80 p-6 flex flex-col gap-5 border-l border-white/[0.06]">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-red-400/60 mb-1">
                  Constraint violation
                </p>
                <p className="text-xs text-white/40">What happens when AI oversteps</p>
              </div>

              {/* Without .nomos */}
              <div className="rounded-xl bg-red-950/30 border border-red-500/20 p-3">
                <p className="text-[10px] uppercase tracking-wider text-red-400/50 mb-2">Without .nomos</p>
                <p className="text-xs text-white/50 italic leading-relaxed">
                  &ldquo;I&apos;m escalating your request right now — you&apos;ll hear back within 15–30 minutes.&rdquo;
                </p>
                <p className="text-[10px] text-red-400/50 mt-2">
                  ✗ Hallucinated. AI cannot contact providers. Made a promise it cannot keep.
                </p>
              </div>

              {/* With .nomos */}
              <div className="rounded-xl bg-emerald-950/30 border border-emerald-500/20 p-3">
                <p className="text-[10px] uppercase tracking-wider text-emerald-400/50 mb-2">With .nomos</p>
                <p className="text-xs text-white/50 italic leading-relaxed">
                  &ldquo;We&apos;re still searching for a provider — sit tight. Type cancel if you&apos;d like to cancel.&rdquo;
                </p>
                <p className="text-[10px] text-emerald-400/50 mt-2">
                  ✓ Governed. Constrained to allowed_actions. No false promises.
                </p>
              </div>

              {/* Constraint response */}
              <div className="rounded-xl bg-white/[0.04] border border-white/[0.08] p-3">
                <p className="text-[10px] uppercase tracking-wider text-white/30 mb-2">On constraint violation</p>
                <p className="text-xs font-mono text-amber-300/60 leading-relaxed">
                  ERROR_NOMOS_CONSTRAINT_VIOLATION<br />
                  action: claim_to_escalate_manually<br />
                  → fallback to allowed response
                </p>
              </div>

              <p className="text-[10px] text-white/20 leading-relaxed mt-auto">
                Every AI response Nida sends is bounded by{' '}
                <span className="font-mono text-white/35">NOMOS-NIDA-PLATFORM-001</span>.
                Not a guideline. Infrastructure.
              </p>
            </div>
          </div>

          {/* Three implications */}
          <div className="mt-4 grid gap-px sm:grid-cols-3 rounded-xl overflow-hidden border border-white/[0.08]">
            {[
              {
                label: 'For Regulators',
                title: 'Auditable by design',
                desc: 'AI governance is not a policy document — it\'s a versioned artifact. Show regulators exactly what constraints were in place at any point in time.',
              },
              {
                label: 'For Enterprises',
                title: 'Logic as infrastructure',
                desc: 'When your AI stack grows to hundreds of agents, .nomos is the governance layer that scales with it — not a prompt that breaks with every model update.',
              },
              {
                label: 'For the Industry',
                title: 'A new standard',
                desc: 'Prompts describe behavior. .nomos enforces it. The autonomous era needs a formal layer between intelligence and action — this is it.',
              },
            ].map((item) => (
              <div key={item.title} className="bg-white/[0.03] px-6 py-5 border-t border-white/[0.06]">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-2">{item.label}</p>
                <p className="font-semibold mb-1 text-white/80">{item.title}</p>
                <p className="text-sm text-white/40 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
