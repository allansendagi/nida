import Image from 'next/image';
import { ChatDemo } from './ChatDemo';

const WHATSAPP_URL = process.env.NEXT_PUBLIC_WHATSAPP_URL || 'https://wa.me/97412345678';
const TELEGRAM_URL = process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL || 'https://t.me/NidaQABot';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-green-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/8 rounded-full blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4 py-20 md:py-28">
        <div className="grid gap-16 lg:grid-cols-2 items-center">

          {/* Left: Copy */}
          <div className="text-center lg:text-left order-2 lg:order-1">

            {/* Location line — clean, typographic */}
            <p className="mb-5 text-xs font-semibold tracking-[0.2em] uppercase text-white/30">
              Now live in Qatar &nbsp;·&nbsp; 2026
            </p>

            {/* Headline */}
            <h1 className="text-[2.75rem] font-bold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl">
              <span className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">Urgent</span>{' '}home services,{' '}
              <br className="hidden sm:block" />
              matched in minutes.
            </h1>

            {/* Subheadline */}
            <p className="mt-6 max-w-md text-base text-white/50 leading-relaxed lg:mx-0 mx-auto">
              Message on WhatsApp or Telegram. Nida finds the right provider,
              confirms the job, and shares their contact — without a single form.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col items-center lg:items-start gap-3 sm:flex-row">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 rounded-xl bg-[#25D366] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-green-500/20 hover:bg-[#20bb5a] transition-colors min-w-[190px]"
              >
                <Image src="/logos/whatsapp.png" alt="" width={18} height={18} className="rounded-sm flex-shrink-0" />
                Chat on WhatsApp
              </a>
              <a
                href={TELEGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 rounded-xl bg-white/8 border border-white/10 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/12 transition-colors min-w-[190px]"
              >
                <Image src="/logos/telegram.png" alt="" width={18} height={18} className="rounded-sm flex-shrink-0" />
                Chat on Telegram
              </a>
            </div>

            {/* Micro trust line */}
            <p className="mt-6 text-xs text-white/25 tracking-wide">
              Free for consumers &nbsp;·&nbsp; Verified providers &nbsp;·&nbsp; No app download needed
            </p>
          </div>

          {/* Right: Phone mockup */}
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
            <ChatDemo />
          </div>
        </div>
      </div>
    </section>
  );
}
