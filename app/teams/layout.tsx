// app/teams/layout.tsx — the Community of Employees landing page lives here now
// that Community of People serves "/". The page itself is a client component,
// so its metadata is declared here.
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Community of Employees — post once, verified venues bid',
  description:
    'Post what your team needs — sports, parties, dining, offsites, gifts — and verified venues across Delhi NCR bid against each other. You compare itemised quotes and pick.',
  keywords: 'corporate events, team outings, reverse bidding, venue booking, Gurgaon, Delhi NCR',
  openGraph: {
    title: 'Community of Employees — post once, verified venues bid',
    description: 'Post for your team. Let venues fight for it.',
    type: 'website',
  },
};

export default function TeamsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
