// app/communities/layout.tsx — Community of People surface.
import type { Metadata } from 'next';
import { CopNav, CopFooter } from '@/components/communities/CopNav';
import './communities.css';

export const metadata: Metadata = {
  title: 'Community of People — find run clubs, sports groups, book clubs & more near you',
  description: 'A listing marketplace of real, active communities in Gurgaon, Delhi NCR, Mumbai, Bengaluru and Jaipur — with a direct link to join each one.',
  openGraph: { title: 'Community of People — find your people', description: 'Run clubs, sports, reading, founders, board games. Real communities, one tap to join.', type: 'website' },
};

export default function CommunitiesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="cop">
      <CopNav />
      {children}
      <CopFooter />
    </div>
  );
}
