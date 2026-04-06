import Image from 'next/image';
import Link from 'next/link';

const WHATSAPP_URL = process.env.NEXT_PUBLIC_WHATSAPP_URL || 'https://wa.me/97412345678';
const TELEGRAM_URL = process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL || 'https://t.me/nida_assistant_bot';

export function FinalCTA() {
  return (
    <section className="py-20 md:py-28 bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="grid gap-px lg:grid-cols-2 rounded-2xl overflow-hidden border border-white/[0.08]">

          {/* Consumer */}
          <div className="bg-gray-900 p-10 md:p-12">
            <p className="mb-4 text-xs font-semibold tracking-[0.15em] uppercase text-blue-400/60">
              For Consumers
            </p>
            <h3 className="text-2xl font-bold text-white leading-snug">
              Need something done?
            </h3>
            <p className="mt-3 text-sm text-white/45 leading-relaxed max-w-sm">
              Just send a message. Nida handles matching, confirmation, and contact exchange — in under 15 minutes.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-semibold text-white hover:bg-[#20bb5a] transition-colors"
              >
                <Image src="/logos/whatsapp.png" alt="" width={16} height={16} className="rounded-sm flex-shrink-0" />
                WhatsApp
              </a>
              <a
                href={TELEGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 rounded-xl bg-white/8 border border-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/12 transition-colors"
              >
                <Image src="/logos/telegram.png" alt="" width={16} height={16} className="rounded-sm flex-shrink-0" />
                Telegram
              </a>
            </div>
          </div>

          {/* Business */}
          <div className="bg-gray-900/60 p-10 md:p-12">
            <p className="mb-4 text-xs font-semibold tracking-[0.15em] uppercase text-green-400/60">
              For Businesses
            </p>
            <h3 className="text-2xl font-bold text-white leading-snug">
              Running a service business?
            </h3>
            <p className="mt-3 text-sm text-white/45 leading-relaxed max-w-sm">
              Join Nida&apos;s provider network. Get pre-qualified leads on WhatsApp or Telegram with one-tap accept.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/auth/login"
                className="flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-100 transition-colors"
              >
                Register your business
              </Link>
              <a
                href="mailto:hello@nida.qa"
                className="flex items-center justify-center rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-white/50 hover:text-white/70 hover:border-white/20 transition-colors"
              >
                Talk to us first
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
