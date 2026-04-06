import Image from 'next/image';

const consumerSteps = [
  {
    title: 'Open WhatsApp or Telegram',
    description: 'No downloads. No sign-up. Message Nida on the app you already use.',
    channelLogos: true,
  },
  {
    title: 'Describe what you need',
    description: 'Plain language works fine — "leaking pipe in West Bay, need someone today."',
    channelLogos: false,
  },
  {
    title: 'Provider confirmed',
    description: 'Nida matches, notifies, and confirms a verified provider. You get their contact when they accept.',
    channelLogos: false,
  },
];

const businessSteps = [
  {
    title: 'Create your profile',
    description: 'Set your service zones, categories, and pricing. Upload a .nomos contract for precision matching.',
  },
  {
    title: 'Receive pre-qualified leads',
    description: 'Leads arrive on WhatsApp or Telegram — matched to your exact capabilities, not broadcast to everyone.',
  },
  {
    title: 'Accept with one tap',
    description: 'Hit Accept. Consumer gets your contact instantly. Job confirmed.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-28">
      <div className="container mx-auto px-4">

        {/* Header */}
        <div className="mb-16 md:mb-20">
          <p className="mb-3 text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground/60">
            The process
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            How it works
          </h2>
        </div>

        {/* Two columns */}
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">

          {/* Consumer */}
          <div>
            <p className="mb-10 text-xs font-semibold tracking-[0.15em] uppercase text-blue-500/70">
              For Consumers
            </p>
            <ol className="space-y-10">
              {consumerSteps.map((step, i) => (
                <li key={step.title} className="grid grid-cols-[2rem_1fr] gap-4">
                  {/* Step number */}
                  <span className="mt-0.5 text-sm font-medium text-muted-foreground/40 tabular-nums">
                    0{i + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <h3 className="font-semibold text-foreground">{step.title}</h3>
                      {step.channelLogos && (
                        <span className="flex items-center gap-1 ml-1">
                          <Image src="/logos/whatsapp.png" alt="WhatsApp" width={16} height={16} className="rounded-sm opacity-80" />
                          <Image src="/logos/telegram.png" alt="Telegram" width={16} height={16} className="rounded-sm opacity-80" />
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Business */}
          <div>
            <p className="mb-10 text-xs font-semibold tracking-[0.15em] uppercase text-green-500/70">
              For Businesses
            </p>
            <ol className="space-y-10">
              {businessSteps.map((step, i) => (
                <li key={step.title} className="grid grid-cols-[2rem_1fr] gap-4">
                  <span className="mt-0.5 text-sm font-medium text-muted-foreground/40 tabular-nums">
                    0{i + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1.5">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

        </div>
      </div>
    </section>
  );
}
