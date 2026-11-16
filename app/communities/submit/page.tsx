// app/communities/submit/page.tsx — group leads: list a new community,
// update an existing listing, or ask for one to be removed. Requests go to
// the admin queue (/admin/communities → Requests); nothing is live until approved.
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getAllCommunities } from '@/lib/communities/store';
import { SubmitClient } from './SubmitClient';

export const metadata: Metadata = {
  title: 'List or update your community — Community of People',
  description: 'Run a group? List it for free, update its details, or ask us to take it down.',
};

export default async function SubmitPage() {
  const all = await getAllCommunities();
  const options = all.map((c) => ({ slug: c.slug, name: c.name, city: c.city })).sort((a, b) => a.name.localeCompare(b.name));
  return (
    <Suspense>
      <SubmitClient options={options} />
    </Suspense>
  );
}
