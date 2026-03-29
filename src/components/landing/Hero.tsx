import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, Briefcase, Sparkles } from 'lucide-react';

function HeroIllustration() {
  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Abstract matching flow illustration */}
      <div className="relative flex items-center justify-between gap-4 py-8">
        {/* Consumer */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex size-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
            <Users className="size-8 text-blue-600 dark:text-blue-400" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">Consumer</span>
        </div>

        {/* Flow lines + AI */}
        <div className="flex-1 flex items-center justify-center relative">
          {/* Animated dots/lines */}
          <div className="absolute inset-0 flex items-center">
            <div className="w-full h-0.5 bg-gradient-to-r from-blue-200 via-purple-300 to-green-200 dark:from-blue-800 dark:via-purple-700 dark:to-green-800" />
          </div>
          {/* AI Center */}
          <div className="relative z-10 flex size-20 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30 ring-4 ring-purple-50 dark:ring-purple-900/20">
            <Sparkles className="size-10 text-purple-600 dark:text-purple-400" />
          </div>
        </div>

        {/* Business */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex size-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <Briefcase className="size-8 text-green-600 dark:text-green-400" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">Business</span>
        </div>
      </div>

      {/* Floating labels */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium">
        AI Matching
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 via-transparent to-transparent dark:from-blue-950/20" />

      <div className="container relative mx-auto px-4 py-16 md:py-24 lg:py-32">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background px-4 py-1.5 text-sm">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-green-500" />
            </span>
            Now serving Qatar
          </div>

          {/* Headline */}
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Home Services,{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Intelligently Matched
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Consumers find trusted providers. Businesses get qualified leads.
            AI makes it seamless.
          </p>

          {/* Illustration */}
          <div className="mt-10 md:mt-14">
            <HeroIllustration />
          </div>

          {/* Dual CTAs */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="gap-2 min-w-[180px]">
                I Need a Service
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" className="gap-2 min-w-[180px]">
                I&apos;m a Business
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <p className="mt-8 text-sm text-muted-foreground">
            90% lower acquisition costs &bull; Verified providers &bull; AI-powered matching
          </p>
        </div>
      </div>
    </section>
  );
}
