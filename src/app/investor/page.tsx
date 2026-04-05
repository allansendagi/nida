import type { Metadata } from 'next';
import InvestorContent from './InvestorContent';

export const metadata: Metadata = {
  title: 'NIDA Investor Report - AI-Powered Intent Marketplace',
  description: 'Comprehensive investor analysis: AI-powered intent marketplace replacing Meta ads. Pre-qualified leads at 90% lower cost. NOMOS Protocol for autonomous agent-to-agent commerce.',
};

export default function InvestorPage() {
  return <InvestorContent />;
}
