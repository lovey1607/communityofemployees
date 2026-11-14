// app/communities/page.tsx — the marketplace. Filter state comes from the
// URL so any filtered view is shareable.
import { Suspense } from 'react';
import { Marketplace } from '@/components/communities/Marketplace';
import { paramsToFilters } from '@/lib/communities';

export default async function CommunitiesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const initial = paramsToFilters(sp);
  return (
    <Suspense fallback={<div className="wrap" style={{ padding: '3rem 0' }}><div className="cop-skel" /></div>}>
      <Marketplace initial={initial} />
    </Suspense>
  );
}
