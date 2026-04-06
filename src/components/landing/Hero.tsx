import Image from 'next/image';
import { ChatDemo } from './ChatDemo';

const WHATSAPP_URL = process.env.NEXT_PUBLIC_WHATSAPP_URL || 'https://wa.me/97412345678';
const TELEGRAM_URL = process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL || 'https://t.me/NidaQABot';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Subtle mesh gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4 py-16 md:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left: Copy */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-white/70">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-green-500" />
              </span>
              Now live in Qatar 🇶🇦
            </div>

            {/* Headline */}
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
              Home Services,{' '}
              <span className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
                Matched in Minutes
              </span>
            </h1>

            {/* Subheadline */}
            <p className="mx-auto lg:mx-0 mt-6 max-w-lg text-lg text-white/60">
              Just message on WhatsApp or Telegram. Nida finds the right provider,
              gets you a quote, and confirms the job — all without filling a single form.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col items-center lg:items-start gap-3 sm:flex-row">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 rounded-xl bg-[#25D366] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-green-500/25 hover:bg-[#20bb5a] transition-colors min-w-[190px]"
              >
                <Image
                  src="/logos/whatsapp.png"
                  alt="WhatsApp"
                  width={20}
                  height={20}
                  className="rounded-sm"
                />
                Chat on WhatsApp
              </a>
              <a
                href={TELEGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 rounded-xl bg-[#229ED9] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:bg-[#1a8fc4] transition-colors min-w-[190px]"
              >
                <Image
                  src="/logos/telegram.png"
                  alt="Telegram"
                  width={20}
                  height={20}
                  className="rounded-sm"
                />
                Chat on Telegram
              </a>
            </div>

            {/* Trust line */}
            <p className="mt-6 text-sm text-white/40">
              Free for consumers &bull; Verified providers &bull; AI-powered matching
            </p>
          </div>

          {/* Right: Phone mockup with live chat demo */}
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
            <ChatDemo />
          </div>
        </div>
      </div>
    </section>
  );
}
