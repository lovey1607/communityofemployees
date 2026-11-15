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
- `data/communities.ts` + `data/communities-india.ts` — **273 listings across 39 cities**
  (Gurgaon 69 · Pune 27 · Delhi 23 · Bengaluru 22 · Hyderabad 22 · Chennai 19 · Mumbai area 18
  · Kolkata 12 · Jaipur 9 · Ahmedabad 8 · Kochi 5 · 28 smaller cities with 1–3 each).
  166 `approved`, 107 `unverified` (badged). Every row has a source URL + date. The smaller
  cities are mostly run clubs known only from endorfin's national directory — real, but
  thin; that's what the badge is for.
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
- City picker is searchable (metros as chips, the rest as a grid with counts); city slugs
  include aliases (`/communities/bangalore`, `/madras`, `/calcutta`, `/gurugram`).
- Existing COE suites were not run here (they need Postgres); the only shared file
  touched is `app/page.tsx` (one `<li>`), so risk is minimal — but run `npm run test:e2e`
  locally before merging anyway.

## v6 — "Midnight Neon" theme + dynamic mobile titles

- **Theme:** deep indigo-black (`#0B0A1A`), electric-violet → magenta → hot-pink gradient
  on every action button, acid-lime highlights (city name, kicker, active-chip icon, nav
  underline), soft lavender page ground. Spotify Wrapped / Discord / Bumble energy. The
  whole theme is one block at the end of `app/communities/communities.css` — delete it to
  get the v5 red/black look back.
- **Dynamic titles on mobile:** until a category is picked, the headline and animated
  scene cycle through the top 3 categories for the city ("Find your squad in Gurgaon." →
  "Find your creatives in Gurgaon." …) with a soft blur-swap. Desktop stays still. Off when
  the visitor prefers reduced motion.
- **Mobile chips:** only All + the 2 biggest categories show, then a gradient "More +N"
  chip opens a "Pick a vibe" sheet with every category as a tile. Chips are now ordered
  by how many listings they have.
- Browser checks: 33.

## v5 — Tinder-style swipe deck

- Picking any category drops you into a **swipe deck** (`components/communities/SwipeDeck.tsx`):
  drag right = save, left = skip, with SAVE/SKIP stamps that fade in as you drag, a
  stacked-card look, and round action buttons (undo · skip · open join link · save).
  Keyboard: ← skip, → save, Enter opens the join link, Backspace undoes.
- Saved cards collect in a "Your picks" row under the deck (stored on the device only).
- A **Swipe / Grid** toggle sits in the filter bar; Map is grid-only.
- Fixed the unreadable "Start here" strip by removing it (it was also the noisiest block).
  The filter row is down to location · Women only · Free · Filters; the rest live in the panel.
- On phones the filter bar scrolls away in swipe mode, so one card plus its buttons fit
  on one screen. Picking a category auto-scrolls to the deck.
- References: Tinder (stamps, button row), Bumble BFF (one decision per card), Hinge
  (big readable type on white), Zepto (black/red/purple palette).
- Browser checks: 30 (adds drag-save, skip, undo, keyboard, grid toggle, mobile deck).

## v4 — animated hero + location ask

- `components/communities/HeroScene.tsx`: an inline-SVG scene per category (map with
  dropping pins + a walking figure by default; runner, cyclist, bouncing ball, dumbbell,
  mountain hiker, rocket, terminal cursor, paint strokes, flipping book, steaming cup,
  chat bubbles, rolling dice). Picking a chip springs a new scene in and swaps the
  headline ("Find your run crew in Gurgaon.") and a Gen-Z kicker ("5am club, no excuses").
  All CSS keyframes; honours reduced motion.
- Hero now *asks* for location in a chat-style bubble ("Where are you right now?") with
  Use my location / Pick area, and shows "Showing what's near X · Change" once set.
- Cards trimmed: category pill, share button and third fact hidden on small screens;
  one-line taglines.

## Creative calls you may want to overrule

1. **Palette: Midnight Neon** (indigo-black + violet→pink gradient + lime). Override block at the end of `communities.css`; the red/black v5 look returns if you delete it, and the calm teal v1 is commit `bcc9f44`.
2. **NCR is one market** (also Mumbai+Navi Mumbai+Thane, Ahmedabad+Gandhinagar,
   Chandigarh+Mohali): see `CITY_GROUPS`. Default city is still Gurgaon; geolocation
   switches to the nearest listed city within 80 km.
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
