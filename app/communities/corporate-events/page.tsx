// app/communities/corporate-events/page.tsx — COE's corporate-events offer,
// living on the Community of People site.
import type { Metadata } from 'next';
import { CorporateEvents } from '@/components/communities/CorporateEvents';

export const metadata: Metadata = {
  title: 'Corporate events & team outings — post once, venues bid | Community of People',
  description: 'Office parties, sports days, team lunches and offsites in Gurgaon & Delhi NCR. Post your team’s requirement once; verified venues send itemised, GST-ready quotes.',
  openGraph: { title: 'Plan the office party in one post', description: 'Verified venues near your office bid line by line. You pick, the price is locked.', type: 'website' },
};

export default function Page() {
  return <CorporateEvents />;
}
