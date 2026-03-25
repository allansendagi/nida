import type { Metadata } from 'next';
import InvestorContent from './InvestorContent';

export const metadata: Metadata = {
  title: 'Nida - The Intent Marketplace That Replaces Meta Ads',
  description: 'Autonomous AI Agents. Machine-Readable Contracts. Zero-Waste Matching. Pre-qualified leads at 90% lower cost.',
};

export default function InvestorPage() {
  return <InvestorContent />;
}
