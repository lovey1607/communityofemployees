# REVIEW — Community of People listing marketplace (branch `feature/community-listings`)

**Status: built, tested, committed locally. NOT pushed. Nothing touched `main`, Vercel or the DB.**

## Run it

    npm install
    npm run dev            # → http://localhost:3000/communities

No env vars, no database needed for these routes. Also try:
`/communities/gurgaon/running`, `/communities/mumbai`, `/communities/the-bhag`,
`/communities/cubbon-reads`, `/communities/submit`.

## What's here

- `app/communities/` — marketplace (`/communities`), city + category views
  (`/communities/[city]`, `/communities/[city]/[category]`), listing detail
  (`/communities/[slug]`), and a front-end-only submit form.
- `components/communities/` — `Marketplace` (filters, URL state, geolocation,
  bottom sheet / side panel, keyless OSM map), `CommunityCard`, `DetailView`, `Mark`
  (generated identity), `CopNav`.
- `lib/communities/index.ts` — pure filtering/sorting/distance/URL helpers (unit-tested).
- `data/communities.ts` — **139 listings** (Gurgaon 70 · Delhi 25 · Noida 3 · Faridabad 1
  · Ghaziabad 1 · Mumbai area 15 · Bengaluru 20 · Jaipur 8). 104 `approved`,
  35 `unverified` (badged in the UI). Every row has a source URL + date.
- `data/communities.README.md`, `research/communities-log.md`,
  `research/design-notes.md`, `research/screenshots/` (12 shots, desktop + 390px).
- One tasteful link added to the COE landing footer ("Communities near you →").
  No other COE page changed.

## Verified

- `tsc --noEmit` clean · `npm run build` clean (292 static pages, incl. all slugs)
- `npm run test:communities` — 10 unit checks (data integrity, distance, filters,
  URL round-trip, marks)
- `BASE=http://localhost:3000 npm run test:communities:e2e` — 23 browser checks:
  ≥60 cards by default, Running chip filters + updates URL, area pick sorts by distance,
  map toggle, Escape closes panel, empty state, join link opens organiser URL in a new
  tab with `noopener`, save toggle, OG tags on detail, pre-filtered city/category routes,
  404 on unknown slug, geolocation granted *and* denied paths, mobile has no horizontal
  scroll, bottom-sheet filters, sticky join bar, reduced-motion render, zero page errors.
- Existing COE suites were not run here (they need Postgres); the only shared file
  touched is `app/page.tsx` (one `<li>`), so risk is minimal — but run `npm run test:e2e`
  locally before merging anyway.

## Creative calls you may want to overrule

1. **Accent teal `#0F766E`** (not COE saffron) — one CSS variable.
2. **NCR is one market**: Gurgaon shows Delhi/Noida clubs sorted by distance. See
   `CITY_GROUPS`.
3. **Geolocation only after intent** (category pick or "Near me"), never on load.
4. **Unverified rows are shown with a badge**, not hidden. There's a "Verified only" filter.
5. **Featured picks** (`featured: true`, 10 rows) — I chose the most iconic/active;
   Gurgaon Reads is featured despite being `unverified` because it's exactly the kind of
   listing the product is for. Re-curate freely.
6. **Misfits clubs** are listed with "Listed on Misfits' Gurgaon page; details in the
   group" because Misfits publishes no schedules — the join link is their WhatsApp invite.
7. **Submit form** opens a prefilled `mailto:` and keeps a localStorage draft. Marked TODO
   for the real `/api/communities/submit`.

## Couldn't verify (be aware)

- Instagram is unreachable from the research tools. Anything IG-only is `unverified`
  (e.g. Gurgaon Reads, Jaipur Cycling Club). A 20-minute pass in a logged-in browser
  would promote most of them — see `research/communities-log.md` for the list.
- Misfits pages for cities other than Gurgaon, `pedalyatri.in`, `thegoodsoleclub.com`
  and `capitaltrails.in` were blocked; rows kept with the best available source.
- Map tiles and Google Fonts couldn't load in the sandbox, so screenshots use system
  fallback fonts and blank map frames. In a browser both render.

## Git

    git log --oneline feature/community-listings ^main   # the commits
    git push -u origin feature/community-listings        # ← only when you say go

Vercel deploys on merge to `main` only, so pushing the branch alone is safe; open a PR
from it when you're happy.
