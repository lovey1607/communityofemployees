// app/communities/[city]/[category]/page.tsx — e.g. /communities/gurgaon/running
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Marketplace } from '@/components/communities/Marketplace';
import { getCityPayload } from '@/lib/communities/store';
import { CITY_SLUGS, CATEGORY_META, CATEGORY_ORDER, METRO_CITIES, paramsToFilters, DEFAULT_FILTERS, cityLabel, slugForCity, type CommunityCategory } from '@/lib/communities';

type Params = { cityOrSlug: string; category: string };

export function generateStaticParams(): Params[] {
  const out: Params[] = [];
  // Indian metros pre-rendered; every other city × category renders on first visit.
  for (const city of METRO_CITIES) for (const cat of CATEGORY_ORDER) if (cat !== 'all') out.push({ cityOrSlug: slugForCity(city), category: cat });
  return out;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { cityOrSlug, category } = await params;
  const city = CITY_SLUGS[decodeURIComponent(cityOrSlug).toLowerCase()];
  const meta = CATEGORY_META[category as CommunityCategory];
  if (!city || !meta) return {};
  return { title: `${meta.label} communities in ${cityLabel(city)} — Community of People`, description: `${meta.label} groups in ${cityLabel(city)} you can join today, sorted by distance from you.` };
}

export default async function CityCategoryPage({ params, searchParams }: { params: Promise<Params>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { cityOrSlug, category } = await params;
  const city = CITY_SLUGS[decodeURIComponent(cityOrSlug).toLowerCase()];
  if (!city || !(category in CATEGORY_META)) notFound();
  const sp = await searchParams;
  const initial = paramsToFilters(sp, { ...DEFAULT_FILTERS, city, category: category as CommunityCategory });
  return <Marketplace key={`${city}-${category}`} initial={{ ...initial, city, category: category as CommunityCategory }} lockCity {...await getCityPayload(city)} />;
}
