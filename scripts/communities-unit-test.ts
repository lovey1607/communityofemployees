// scripts/communities-unit-test.ts — pure-function checks for the communities
// marketplace. Run: npx tsx scripts/communities-unit-test.ts
import assert from 'node:assert/strict';
import { COMMUNITIES, applyFilters, DEFAULT_FILTERS, distanceKm, filtersToParams, paramsToFilters, markFor, nearestCity, matchesQuery } from '../lib/communities';

let n = 0; const t = (name: string, fn: () => void) => { fn(); n++; console.log('✓', name); };

t('data: slugs unique, every row has source url + verifiedOn + join url', () => {
  const slugs = new Set<string>();
  for (const c of COMMUNITIES) {
    assert.ok(!slugs.has(c.slug), `duplicate slug ${c.slug}`); slugs.add(c.slug);
    assert.match(c.source.url, /^https?:\/\//, c.slug);
    assert.match(c.source.verifiedOn, /^\d{4}-\d{2}-\d{2}$/, c.slug);
    assert.match(c.join.url, /^(https?:\/\/|mailto:)/, c.slug);
    assert.ok(c.tagline.length > 0 && c.tagline.length <= 120, `${c.slug} tagline length`);
    assert.ok(['approved', 'unverified'].includes(c.status));
  }
});
t('data: at least 60 Gurgaon-area listings', () => {
  const ncr = COMMUNITIES.filter((c) => ['Gurgaon', 'Delhi', 'Noida', 'Faridabad', 'Ghaziabad'].includes(c.city));
  assert.ok(ncr.length >= 60, `got ${ncr.length}`);
  assert.ok(COMMUNITIES.filter((c) => c.city === 'Gurgaon').length >= 40);
});
t('distance: Cyber City → Nehru Park ≈ 15 km', () => {
  const km = distanceKm(28.495, 77.089, 28.589, 77.195);
  assert.ok(km > 13 && km < 17, String(km));
});
t('nearestCity picks Gurgaon for Sohna Road', () => { assert.equal(nearestCity(28.418, 77.04).city, 'Gurgaon'); });
t('filters: running in Gurgaon group excludes Mumbai', () => {
  const r = applyFilters(COMMUNITIES, { ...DEFAULT_FILTERS, category: 'running' }, null);
  assert.ok(r.length >= 10);
  assert.ok(r.every((c) => c.category === 'running' && c.city !== 'Mumbai'));
});
t('filters: nearest sort puts area-precision rows before city-precision rows', () => {
  const r = applyFilters(COMMUNITIES, { ...DEFAULT_FILTERS, category: 'running', sort: 'nearest' }, { lat: 28.495, lng: 77.089, label: 'x' });
  assert.equal(r[0].slug, '5am-social-run-club-gurugram');
  const firstCity = r.findIndex((c) => c.location?.precision === 'city');
  const lastArea = r.map((c) => c.location?.precision).lastIndexOf('area');
  assert.ok(firstCity === -1 || lastArea < firstCity);
});
t('filters: women-only + free + verified narrows correctly', () => {
  const r = applyFilters(COMMUNITIES, { ...DEFAULT_FILTERS, gender: 'women', verified: true }, null);
  assert.ok(r.every((c) => c.audience.gender === 'women' && c.status === 'approved'));
});
t('query: matches tags and area, tolerant of case', () => {
  const c = COMMUNITIES.find((x) => x.slug === 'young-leaders-pickleball-club')!;
  assert.ok(matchesQuery(c, 'PICKLEBALL balola'));
  assert.ok(!matchesQuery(c, 'salsa'));
});
t('url: filters round-trip and defaults are omitted', () => {
  const f = { ...DEFAULT_FILTERS, category: 'books' as const, gender: 'women' as const, beginner: true, q: 'park' };
  const p = filtersToParams(f);
  assert.equal(p.get('city'), null);
  assert.deepEqual(paramsToFilters(p), f);
  assert.deepEqual(paramsToFilters(new URLSearchParams('category=bogus&gender=x')), DEFAULT_FILTERS);
});
t('data: pan-India — at least 20 cities with listings, 250+ rows', () => {
  const cities = new Set(COMMUNITIES.map((c) => c.city));
  assert.ok(cities.size >= 20, `cities ${cities.size}`);
  assert.ok(COMMUNITIES.length >= 250, `rows ${COMMUNITIES.length}`);
  for (const c of COMMUNITIES) assert.ok(c.location && c.location.lat !== 0, `${c.slug} has no coordinates (city missing from CITY_CENTRE?)`);
});
t('mark: deterministic', () => { assert.deepEqual(markFor(COMMUNITIES[0]), markFor(COMMUNITIES[0])); assert.equal(markFor({ slug: 'a', name: 'The Bhag', category: 'running' }).initials, 'TB'); });
console.log(`\n${n} checks passed`);
