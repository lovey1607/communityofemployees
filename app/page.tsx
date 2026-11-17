// app/page.tsx — Community of People is the front door of the site.
// The marketplace that used to live at /communities now serves "/", wrapped in
// the same CoP chrome; the Community of Employees landing page moved to /teams.
// With no ?city= it opens on the visitor's last city (cookie), else the default.
// Only that city's listings are sent to the browser.
import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { Marketplace, CITY_COOKIE } from '@/components/communities/Marketplace';
import { CITY_CENTRES, paramsToFilters } from '@/lib/communities';
import { getCityPayload } from '@/lib/communities/store';
import CommunitiesLayout, { metadata as copMetadata } from './communities/layout';

export const metadata = copMetadata;

export default async function HomePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const initial = paramsToFilters(sp);
  if (!sp.city) {
    const last = decodeURIComponent((await cookies()).get(CITY_COOKIE)?.value ?? '');
    if (last && CITY_CENTRES[last]) initial.city = last;
  }
  const payload = await getCityPayload(initial.city);
  return (
    <CommunitiesLayout>
      <Suspense fallback={<div className="wrap" style={{ padding: '3rem 0' }}><div className="cop-skel" /></div>}>
        <Marketplace key={initial.city} initial={initial} {...payload} />
      </Suspense>
    </CommunitiesLayout>
  );
}
