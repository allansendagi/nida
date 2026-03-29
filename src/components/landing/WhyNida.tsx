import {
  ShieldCheck,
  BellOff,
  DollarSign,
  Brain,
  TrendingDown,
  Target,
  Scale,
  FileCode
} from 'lucide-react';

const consumerBenefits = [
  {
    icon: ShieldCheck,
    title: 'Verified, trusted providers',
    description: 'Every business on Nida is vetted. Work with confidence knowing you have quality providers.',
  },
  {
    icon: BellOff,
    title: 'No spam, no endless calls',
    description: 'Your information stays private. Only matched providers can contact you about your specific request.',
  },
  {
    icon: DollarSign,
    title: 'Fair, transparent pricing',
    description: 'See upfront pricing from providers. No hidden fees or surprise costs.',
  },
  {
    icon: Brain,
    title: 'AI understands your exact needs',
    description: 'Our AI parses your natural language request to find truly relevant matches.',
  },
];

const businessBenefits = [
  {
    icon: TrendingDown,
    title: '90% lower acquisition costs',
    description: 'Stop wasting money on broad advertising. Pay only for leads that match your capabilities.',
  },
  {
    icon: Target,
    title: 'Zero-waste matching',
    description: 'Receive only leads that fit your service areas, pricing, and expertise. No more irrelevant inquiries.',
  },
  {
    icon: Scale,
    title: 'Fair sequential dispatch',
    description: 'Leads are distributed fairly among qualified providers. Quality service, not speed, determines success.',
  },
  {
    icon: FileCode,
    title: 'Machine-readable contracts',
    description: 'Your NOMOS contract clearly defines what you offer, enabling precise AI matching.',
  },
];

function BenefitCard({ benefit }: { benefit: typeof consumerBenefits[0] }) {
  const Icon = benefit.icon;
  return (
    <div className="group relative rounded-xl border bg-card p-6 transition-all hover:shadow-md">
      <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
        <Icon className="size-6 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
      <h3 className="font-semibold mb-2">{benefit.title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {benefit.description}
      </p>
    </div>
  );
}

export function WhyNida() {
  return (
    <section id="why-nida" className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center mb-12 md:mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Why Choose Nida
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Built for both sides of the marketplace. Everyone wins with intelligent matching.
          </p>
        </div>

        {/* Two-column benefits */}
        <div className="grid gap-12 lg:gap-16">
          {/* Consumer benefits */}
          <div>
            <div className="mb-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 dark:bg-blue-900/30 px-4 py-1.5 text-sm font-medium text-blue-700 dark:text-blue-300">
                For Consumers
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {consumerBenefits.map((benefit) => (
                <BenefitCard key={benefit.title} benefit={benefit} />
              ))}
            </div>
          </div>

          {/* Business benefits */}
          <div>
            <div className="mb-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="inline-flex items-center gap-2 rounded-full bg-green-100 dark:bg-green-900/30 px-4 py-1.5 text-sm font-medium text-green-700 dark:text-green-300">
                For Businesses
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {businessBenefits.map((benefit) => (
                <BenefitCard key={benefit.title} benefit={benefit} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
