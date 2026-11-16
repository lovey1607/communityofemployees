// GET /api/communities/lookup?slug=… — a public listing as form input, so a
// group lead can start their "update my listing" request from what's live.
import { jsonOk, notFound, route } from '@/lib/server/http';
import { getCommunity } from '@/lib/communities/store';
import { toInput } from '@/lib/communities/input';

export const dynamic = 'force-dynamic';

export const GET = route(async (request) => {
  const slug = new URL(request.url).searchParams.get('slug') ?? '';
  const c = await getCommunity(slug);
  if (!c) throw notFound('No listing with that name.');
  const { status: _s, featured: _f, ...input } = toInput(c);
  return jsonOk({ input, name: c.name, city: c.city });
});
