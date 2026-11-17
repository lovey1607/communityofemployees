// app/communities/page.tsx — the marketplace moved to "/". Shared and indexed
// /communities links (filters included) keep working by redirecting there.
import { redirect } from 'next/navigation';

export default async function CommunitiesIndex({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(sp)) {
    if (Array.isArray(value)) value.forEach((v) => qs.append(key, v));
    else if (value !== undefined) qs.set(key, value);
  }
  const query = qs.toString();
  redirect(query ? `/?${query}` : '/');
}
