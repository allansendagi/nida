import {
  Navbar,
  Hero,
  StatsBar,
  HowItWorks,
  WhyNida,
  NomosProtocol,
  FAQ,
  FinalCTA,
  Footer,
} from '@/components/landing';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <Hero />
        <StatsBar />
        <HowItWorks />
        <WhyNida />
        <NomosProtocol />
        <FAQ />
        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
}
