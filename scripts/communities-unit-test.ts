// scripts/communities-unit-test.ts — pure-function checks for the communities
// marketplace. Run: npx tsx scripts/communities-unit-test.ts
import assert from 'node:assert/strict';
import { COMMUNITIES } from '../lib/communities/data';
import { applyFilters, DEFAULT_FILTERS, distanceKm, filtersToParams, paramsToFilters, markFor, nearestCity, matchesQuery } from '../lib/communities';

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
  for (const c of COMMUNITIES) {
    if (c.city === 'Online') { assert.equal(c.location, null, `${c.slug}: online rows carry no pin`); continue; }
    assert.ok(c.location && c.location.lat !== 0, `${c.slug} has no coordinates (city missing from CITY_CENTRE?)`);
  }
});
t('data: every row has source url, verifiedOn, activity signal; slugs unique', () => {
  const seen = new Set<string>();
  for (const c of COMMUNITIES) {
    assert.ok(!seen.has(c.slug), `duplicate slug ${c.slug}`); seen.add(c.slug);
    assert.ok(/^https?:\/\//.test(c.source.url) && c.source.verifiedOn && c.source.activitySignal, `${c.slug} source incomplete`);
    assert.ok(/^https?:\/\//.test(c.join.url), `${c.slug} join url`);
  }
});
t('updates: 15 Nov pass applied — removals gone, promotions + corrections in', () => {
  for (const s of ['delhi-book-lovers', 'jaipur-cycling-club', 'great-hyderabad-adventure-club', 'hyderabad-book-club', 'cloka-club-chennai']) assert.ok(!COMMUNITIES.some((c) => c.slug === s), s);
  const gr = COMMUNITIES.find((c) => c.slug === 'gurgaon-reads')!;
  assert.equal(gr.status, 'approved'); assert.equal(gr.source.verifiedOn, '2026-11-15'); assert.match(gr.meets.summary ?? '', /Chapters/);
  const so = COMMUNITIES.find((c) => c.slug === 'step-out')!;
  assert.equal(so.city, 'Mumbai'); assert.equal(so.status, 'unverified'); assert.equal(so.location?.label, 'Mumbai');
});
t('filters: online rows show in every city; mode filter splits them', () => {
  const blr = applyFilters(COMMUNITIES, { ...DEFAULT_FILTERS, city: 'Bengaluru' }, null);
  const jai = applyFilters(COMMUNITIES, { ...DEFAULT_FILTERS, city: 'Jaipur' }, null);
  assert.ok(blr.some((c) => c.slug === 'localcircles') && jai.some((c) => c.slug === 'localcircles'));
  const inPerson = applyFilters(COMMUNITIES, { ...DEFAULT_FILTERS, mode: 'inperson' }, null);
  assert.ok(inPerson.every((c) => c.mode !== 'online'));
  const online = applyFilters(COMMUNITIES, { ...DEFAULT_FILTERS, mode: 'online' }, null);
  assert.ok(online.length > 0 && online.every((c) => c.mode !== 'offline'));
});
t('filters: new categories, age focus, membership, discord join', () => {
  for (const cat of ['dating', 'women', 'men', 'civic'] as const) assert.ok(applyFilters(COMMUNITIES, { ...DEFAULT_FILTERS, category: cat }, null).length > 0, cat);
  const gz = applyFilters(COMMUNITIES, { ...DEFAULT_FILTERS, city: 'Delhi', age: 'genz' }, null);
  assert.ok(gz.length > 0 && gz.every((c) => c.ageBand === 'genz'));
  const mem = applyFilters(COMMUNITIES, { ...DEFAULT_FILTERS, price: 'membership' }, null);
  assert.ok(mem.length > 0 && mem.every((c) => c.pricing.type === 'membership'));
  assert.ok(applyFilters(COMMUNITIES, { ...DEFAULT_FILTERS, join: 'discord' }, null).length > 0);
  const f = { ...DEFAULT_FILTERS, mode: 'online' as const, age: '50plus' as const, price: 'membership' as const, join: 'reddit' as const };
  assert.deepEqual(paramsToFilters(filtersToParams(f)), f);
});
t('mark: deterministic', () => { assert.deepEqual(markFor(COMMUNITIES[0]), markFor(COMMUNITIES[0])); assert.equal(markFor({ slug: 'a', name: 'The Bhag', category: 'running' }).initials, 'TB'); });
console.log(`\n${n} checks passed`);
