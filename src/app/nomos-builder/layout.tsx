import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NOMOS Contract Builder',
  description: 'Build a machine-readable service contract for AI-powered matching.',
};

export default function NomosBuilderLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Minimal nav */}
      <header className="border-b border-white/[0.06] px-6 py-4 flex items-center justify-between">
        <a href="/" className="flex items-baseline gap-2 group">
          <span className="text-xl font-light text-white/30 group-hover:text-white/50 transition-colors" dir="rtl" lang="ar">نداء</span>
          <span className="text-xs font-bold tracking-[0.3em] uppercase text-white/20 group-hover:text-white/40 transition-colors">NIDA</span>
        </a>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/20">NOMOS Contract Builder</span>
        </div>
      </header>
      {children}
    </div>
  );
}
