// GET /api/rfp-templates?category=… — starter templates for the posting form.

import { jsonOk, route } from '@/lib/server/http';
import { templatesForCategory } from '@/lib/rfpTemplates';
import type { CategoryType } from '@/lib/types';

export const GET = route(async (request) => {
  const category = new URL(request.url).searchParams.get('category') as CategoryType | null;
  return jsonOk({ templates: templatesForCategory(category ?? undefined) });
});
