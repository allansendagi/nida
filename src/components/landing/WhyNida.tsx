const benefits = [
  {
    audience: 'Consumers',
    title: 'Verified providers only',
    description: 'Every business is vetted before receiving a single lead. Work with confidence.',
  },
  {
    audience: 'Consumers',
    title: 'No spam, no endless calls',
    description: 'Your info stays private. Only the matched provider for your specific request can reach you.',
  },
  {
    audience: 'Businesses',
    title: '90% lower acquisition costs',
    description: 'Pay only for leads that match your capabilities. No broad advertising waste.',
  },
  {
    audience: 'Businesses',
    title: 'Zero-waste matching',
    description: 'Leads fit your service zones, pricing, and expertise exactly. No irrelevant inquiries.',
  },
];

export function WhyNida() {
  return (
    <section id="why-nida" className="py-20 md:py-28 border-t">
      <div className="container mx-auto px-4">

        {/* Header */}
        <div className="mb-16 md:mb-20">
          <p className="mb-3 text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground/60">
            Why Nida
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Built for both sides.
          </h2>
        </div>

        {/* Clean grid — no icons, no cards, just editorial text blocks */}
        <div className="grid gap-x-16 gap-y-12 sm:grid-cols-2">
          {benefits.map((b) => (
            <div key={b.title} className="border-t pt-8">
              <p className={`mb-3 text-xs font-semibold tracking-[0.15em] uppercase ${
                b.audience === 'Consumers' ? 'text-blue-500/70' : 'text-green-500/70'
              }`}>
                {b.audience}
              </p>
              <h3 className="text-lg font-semibold mb-2">{b.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{b.description}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
