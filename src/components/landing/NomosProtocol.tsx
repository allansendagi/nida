import { FileCode, Cpu, ArrowRight, CheckCircle2 } from 'lucide-react';

export function NomosProtocol() {
  return (
    <section id="nomos" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-5xl">
          {/* Section header */}
          <div className="text-center mb-12 md:mb-16">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-background px-4 py-1.5 text-sm font-medium">
              <FileCode className="size-4" />
              Technical Differentiator
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              The NOMOS Protocol
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Machine-readable service contracts that enable true AI-powered matching.
            </p>
          </div>

          {/* Visual flow */}
          <div className="relative rounded-2xl border bg-card p-6 md:p-10">
            {/* Flow diagram */}
            <div className="grid gap-6 md:grid-cols-3 md:gap-4">
              {/* Step 1: Contract */}
              <div className="relative flex flex-col items-center text-center">
                <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary/10">
                  <FileCode className="size-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Service Contract</h3>
                <p className="text-sm text-muted-foreground">
                  Businesses define capabilities, zones, and pricing in structured NOMOS format
                </p>
                {/* Arrow for desktop */}
                <div className="hidden md:flex absolute right-0 top-8 translate-x-1/2">
                  <ArrowRight className="size-6 text-muted-foreground/50" />
                </div>
              </div>

              {/* Step 2: AI Matching */}
              <div className="relative flex flex-col items-center text-center">
                <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-900/30">
                  <Cpu className="size-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold mb-2">AI Matching Engine</h3>
                <p className="text-sm text-muted-foreground">
                  Consumer intents are parsed and matched against provider contracts in real-time
                </p>
                {/* Arrow for desktop */}
                <div className="hidden md:flex absolute right-0 top-8 translate-x-1/2">
                  <ArrowRight className="size-6 text-muted-foreground/50" />
                </div>
              </div>

              {/* Step 3: Execution */}
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-green-100 dark:bg-green-900/30">
                  <CheckCircle2 className="size-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold mb-2">Service Execution</h3>
                <p className="text-sm text-muted-foreground">
                  Matched providers receive leads, accept jobs, and deliver services
                </p>
              </div>
            </div>

            {/* Code preview */}
            <div className="mt-10 rounded-lg bg-foreground/5 p-4 md:p-6 overflow-x-auto">
              <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                <div className="flex gap-1.5">
                  <div className="size-3 rounded-full bg-red-500/50" />
                  <div className="size-3 rounded-full bg-yellow-500/50" />
                  <div className="size-3 rounded-full bg-green-500/50" />
                </div>
                <span className="font-mono">nomos-contract.json</span>
              </div>
              <pre className="text-xs md:text-sm font-mono text-muted-foreground">
{`{
  "version": "0.1.0",
  "provider": {
    "name": "Premium AC Services",
    "categories": ["AC_REPAIR", "AC_MAINTENANCE"],
    "zones": ["doha_west", "al_rayyan"],
    "pricing": {
      "inspection": { "min": 150, "max": 200, "currency": "QAR" },
      "repair": { "min": 300, "max": 800, "currency": "QAR" }
    },
    "availability": "24_7"
  }
}`}
              </pre>
            </div>
          </div>

          {/* Benefits list */}
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="size-5 text-green-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Precise Matching</p>
                <p className="text-sm text-muted-foreground">No guesswork. AI knows exactly what each provider offers.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="size-5 text-green-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Transparent Pricing</p>
                <p className="text-sm text-muted-foreground">Price ranges defined upfront. No surprises for consumers.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="size-5 text-green-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Scalable Infrastructure</p>
                <p className="text-sm text-muted-foreground">Built for growth. Add new categories and markets easily.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
