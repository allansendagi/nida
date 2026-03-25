import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Nida</h1>
          <Link href="/auth/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-2xl px-4">
          <h2 className="text-4xl font-bold mb-4">
            NOMOS Protocol
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            An intent marketplace where consumers declare needs, AI structures intent,
            and businesses publish machine-readable service contracts.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/auth/login">
              <Button size="lg">Business Dashboard</Button>
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>NOMOS Protocol v0.1.0 - Qatar Home Services</p>
        </div>
      </footer>
    </div>
  );
}
