// app/communities/[cityOrSlug]/page.tsx
// One dynamic segment serves two shapes:
//   /communities/gurgaon       → the marketplace pre-filtered to a city
//   /communities/<slug>        → a listing's detail page
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Marketplace } from '@/components/communities/Marketplace';
import { DetailView } from '@/components/communities/DetailView';
import { CITY_SLUGS, paramsToFilters, DEFAULT_FILTERS, CATEGORY_META, cityLabel, cityPoolOf, slugForCity } from '@/lib/communities';
import { getAllCommunities, getCityPayload, getCommunity } from '@/lib/communities/store';

// New listings added in the admin get pages on demand.
export const dynamicParams = true;

type Params = { cityOrSlug: string };

// City pages are pre-rendered; listing pages (1,000+) render on first visit and are cached.
export function generateStaticParams(): Params[] {
  return [...new Set(Object.values(CITY_SLUGS))].map((c) => ({ cityOrSlug: slugForCity(c) }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { cityOrSlug } = await params;
  const city = CITY_SLUGS[decodeURIComponent(cityOrSlug).toLowerCase()];
  if (city) return { title: `Communities in ${cityLabel(city)} — Community of People`, description: `Run clubs, sports groups, book clubs, language exchanges and more in ${cityLabel(city)}, with a direct link to join each one.` };
  const c = await getCommunity(cityOrSlug);
  if (!c) return {};
  const title = `${c.name} — ${CATEGORY_META[c.category].label} in ${c.area ?? c.city}`;
  return {
    title: `${title} · Community of People`,
    description: c.tagline,
    openGraph: { title, description: c.tagline, type: 'website', siteName: 'Community of People' },
    twitter: { card: 'summary', title, description: c.tagline },
  };
}

export default async function CityOrSlugPage({ params, searchParams }: { params: Promise<Params>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { cityOrSlug } = await params;
  const city = CITY_SLUGS[decodeURIComponent(cityOrSlug).toLowerCase()];
  if (city) {
    const sp = await searchParams;
    const initial = paramsToFilters(sp, { ...DEFAULT_FILTERS, city });
    return <Marketplace key={city} initial={{ ...initial, city }} lockCity {...await getCityPayload(city)} />;
  }
  const all = await getAllCommunities();
  const c = all.find((x) => x.slug === cityOrSlug);
  if (!c) notFound();
  return <DetailView c={c} all={cityPoolOf(all, c.city)} />;
}
