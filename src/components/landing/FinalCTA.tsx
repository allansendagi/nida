import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const WHATSAPP_URL = process.env.NEXT_PUBLIC_WHATSAPP_URL || 'https://wa.me/97412345678';
const TELEGRAM_URL = process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL || 'https://t.me/NidaQABot';

export function FinalCTA() {
  return (
    <section className="py-16 md:py-24 bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="grid gap-6 lg:grid-cols-2 max-w-5xl mx-auto">
          {/* Consumer CTA */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#075E54] to-[#128C7E] p-8 md:p-10">
            <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5" />
            <div className="relative">
              <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-white/10">
                <Image src="/logos/whatsapp.png" alt="WhatsApp" width={32} height={32} className="rounded-lg" />
              </div>
              <h3 className="text-2xl font-bold text-white">Need a service?</h3>
              <p className="mt-2 text-white/70 text-sm leading-relaxed">
                Just send a message. Nida handles matching, confirmation, and contact exchange — in under 15 minutes.
              </p>
              <div className="mt-6 flex flex-col gap-2">
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-semibold text-white hover:bg-[#20bb5a] transition-colors"
                >
                  <Image src="/logos/whatsapp.png" alt="" width={18} height={18} className="rounded-sm" />
                  Open WhatsApp
                </a>
                <a
                  href={TELEGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
                >
                  <Image src="/logos/telegram.png" alt="" width={18} height={18} className="rounded-sm" />
                  Open Telegram
                </a>
              </div>
            </div>
          </div>

          {/* Business CTA */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 p-8 md:p-10">
            <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5" />
            <div className="relative">
              <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-white/10">
                <span className="text-3xl">🏢</span>
              </div>
              <h3 className="text-2xl font-bold text-white">Running a service business?</h3>
              <p className="mt-2 text-white/50 text-sm leading-relaxed">
                Join Nida&apos;s provider network. Get pre-qualified leads delivered to WhatsApp or Telegram with one-tap accept.
              </p>
              <div className="mt-6 flex flex-col gap-2">
                <Link
                  href="/auth/login"
                  className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  Register Your Business
                  <ArrowRight className="size-4" />
                </Link>
                <a
                  href="mailto:hello@nida.qa"
                  className="flex items-center justify-center gap-2 rounded-xl bg-white/10 px-5 py-3 text-sm font-semibold text-white/70 hover:bg-white/15 transition-colors"
                >
                  Talk to us first
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
