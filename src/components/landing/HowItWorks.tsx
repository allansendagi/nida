import Image from 'next/image';
import { Sparkles, CheckCircle, FileText, Target, Handshake } from 'lucide-react';

const consumerSteps = [
  {
    icon: null, // replaced by channel logos
    channelLogos: true,
    title: 'Open WhatsApp or Telegram',
    description: 'No app downloads. No sign-up. Just message Nida on the app you already use.',
  },
  {
    icon: Sparkles,
    channelLogos: false,
    title: 'Describe what you need',
    description: 'Tell Nida in plain language — "leaking pipe in West Bay, need someone today." That\'s it.',
  },
  {
    icon: CheckCircle,
    channelLogos: false,
    title: 'Provider confirmed in minutes',
    description: 'Nida matches, notifies, and confirms a verified provider. You get their contact when they accept.',
  },
];

const businessSteps = [
  {
    icon: FileText,
    title: 'Create your profile',
    description: 'Set your service categories, zones, and pricing. Or upload a .nomos contract for precise AI matching.',
  },
  {
    icon: Target,
    title: 'Receive pre-qualified leads',
    description: 'Get leads that match your exact capabilities — on WhatsApp or Telegram the moment they\'re matched.',
  },
  {
    icon: Handshake,
    title: 'Accept with one tap',
    description: 'Hit Accept in Telegram or WhatsApp. Consumer gets your contact instantly. Job confirmed.',
  },
];

function StepCard({
  step,
  index,
  total,
}: {
  step: typeof consumerSteps[0];
  index: number;
  total: number;
}) {
  const Icon = step.icon;
  return (
    <div className="relative flex gap-4">
      <div className="flex flex-col items-center">
        <div className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold flex-shrink-0">
          {index + 1}
        </div>
        {index < total - 1 && <div className="w-0.5 flex-1 bg-border mt-2" />}
      </div>

      <div className="flex-1 pb-8">
        <div className="flex items-center gap-3 mb-2">
          {step.channelLogos ? (
            <div className="flex items-center gap-1.5">
              <Image src="/logos/whatsapp.png" alt="WhatsApp" width={28} height={28} className="rounded-md" />
              <Image src="/logos/telegram.png" alt="Telegram" width={28} height={28} className="rounded-md" />
            </div>
          ) : Icon ? (
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
              <Icon className="size-5 text-muted-foreground" />
            </div>
          ) : null}
          <h3 className="font-semibold">{step.title}</h3>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
      </div>
    </div>
  );
}

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center mb-12 md:mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How It Works</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Whether you need a service or provide one, Nida makes the connection seamless.
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-blue-100 dark:bg-blue-900/30 px-4 py-1.5 text-sm font-medium text-blue-700 dark:text-blue-300">
              For Consumers
            </div>
            <div className="space-y-0">
              {consumerSteps.map((step, index) => (
                <StepCard key={step.title} step={step} index={index} total={consumerSteps.length} />
              ))}
            </div>
          </div>

          <div>
            <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-green-100 dark:bg-green-900/30 px-4 py-1.5 text-sm font-medium text-green-700 dark:text-green-300">
              For Businesses
            </div>
            <div className="space-y-0">
              {businessSteps.map((step, index) => (
                <StepCard
                  key={step.title}
                  step={{ ...step, channelLogos: false }}
                  index={index}
                  total={businessSteps.length}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
