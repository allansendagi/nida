import { ShieldCheck, BellOff, TrendingDown, Target } from 'lucide-react';

const benefits = [
  {
    icon: ShieldCheck,
    audience: 'consumers' as const,
    title: 'Verified providers only',
    description: 'Every business on Nida is vetted before receiving a single lead. Work with confidence.',
  },
  {
    icon: BellOff,
    audience: 'consumers' as const,
    title: 'No spam, no endless calls',
    description: 'Your info stays private. Only the matched provider for your specific request can reach you.',
  },
  {
    icon: TrendingDown,
    audience: 'businesses' as const,
    title: '90% lower acquisition costs',
    description: 'Stop burning money on broad advertising. Pay only for leads that match your exact capabilities.',
  },
  {
    icon: Target,
    audience: 'businesses' as const,
    title: 'Zero-waste matching',
    description: 'Receive leads that fit your service zones, pricing, and expertise. No irrelevant inquiries.',
  },
];

export function WhyNida() {
  return (
    <section id="why-nida" className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center mb-12 md:mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Why Nida</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Built for both sides of the marketplace. Everyone wins with intelligent matching.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b) => {
            const Icon = b.icon;
            const isConsumer = b.audience === 'consumers';
            return (
              <div
                key={b.title}
                className="group relative rounded-xl border bg-card p-6 transition-all hover:shadow-md"
              >
                <div
                  className={`mb-4 inline-flex size-12 items-center justify-center rounded-lg ${
                    isConsumer ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-green-50 dark:bg-green-900/20'
                  }`}
                >
                  <Icon
                    className={`size-6 ${
                      isConsumer
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-green-600 dark:text-green-400'
                    }`}
                  />
                </div>
                <div
                  className={`mb-3 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    isConsumer
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                      : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                  }`}
                >
                  {isConsumer ? 'Consumers' : 'Businesses'}
                </div>
                <h3 className="font-semibold mb-2">{b.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{b.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
