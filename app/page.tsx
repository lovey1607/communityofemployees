// app/page.tsx — Community of People is the front door of the site.
// The marketplace that used to live at /communities now serves "/", wrapped in
// the same CoP chrome; the Community of Employees landing page moved to /teams.
import { Suspense } from 'react';
import { Marketplace } from '@/components/communities/Marketplace';
import { paramsToFilters } from '@/lib/communities';
import { getAllCommunities } from '@/lib/communities/store';
import CommunitiesLayout, { metadata as copMetadata } from './communities/layout';

export const metadata = copMetadata;

export default async function HomePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const initial = paramsToFilters(sp);
  const all = await getAllCommunities();
  return (
    <CommunitiesLayout>
      <Suspense fallback={<div className="wrap" style={{ padding: '3rem 0' }}><div className="cop-skel" /></div>}>
        <Marketplace initial={initial} all={all} />
      </Suspense>
    </CommunitiesLayout>
  );
}
