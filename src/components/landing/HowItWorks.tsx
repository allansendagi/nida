import { MessageSquare, Sparkles, CheckCircle, FileText, Target, Handshake } from 'lucide-react';

const consumerSteps = [
  {
    icon: MessageSquare,
    title: 'Tell us what you need',
    description: 'Describe your service needs in plain language. No forms, no categories to navigate.',
  },
  {
    icon: Sparkles,
    title: 'AI finds the perfect match',
    description: 'Our AI analyzes your request and matches you with the most qualified providers.',
  },
  {
    icon: CheckCircle,
    title: 'Get connected with verified providers',
    description: 'Receive quotes from pre-vetted businesses ready to serve you.',
  },
];

const businessSteps = [
  {
    icon: FileText,
    title: 'Create your NOMOS contract',
    description: 'Define your capabilities, service zones, and pricing in a machine-readable format.',
  },
  {
    icon: Target,
    title: 'Receive pre-qualified leads',
    description: 'Get leads that match your exact capabilities. No more wasted time on irrelevant inquiries.',
  },
  {
    icon: Handshake,
    title: 'Accept and serve customers',
    description: 'Review matched leads, accept jobs, and grow your business efficiently.',
  },
];

function StepCard({ step, index }: { step: typeof consumerSteps[0]; index: number }) {
  const Icon = step.icon;
  return (
    <div className="relative flex gap-4">
      {/* Step number connector */}
      <div className="flex flex-col items-center">
        <div className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
          {index + 1}
        </div>
        {index < 2 && (
          <div className="w-0.5 flex-1 bg-border mt-2" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
            <Icon className="size-5 text-muted-foreground" />
          </div>
          <h3 className="font-semibold">{step.title}</h3>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {step.description}
        </p>
      </div>
    </div>
  );
}

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center mb-12 md:mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Whether you need a service or provide one, Nida makes the connection seamless.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Consumer perspective */}
          <div>
            <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-blue-100 dark:bg-blue-900/30 px-4 py-1.5 text-sm font-medium text-blue-700 dark:text-blue-300">
              For Consumers
            </div>
            <div className="space-y-0">
              {consumerSteps.map((step, index) => (
                <StepCard key={step.title} step={step} index={index} />
              ))}
            </div>
          </div>

          {/* Business perspective */}
          <div>
            <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-green-100 dark:bg-green-900/30 px-4 py-1.5 text-sm font-medium text-green-700 dark:text-green-300">
              For Businesses
            </div>
            <div className="space-y-0">
              {businessSteps.map((step, index) => (
                <StepCard key={step.title} step={step} index={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
