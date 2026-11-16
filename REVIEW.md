# REVIEW — Community of People listing marketplace (branch `feature/community-listings`)

**Status: built, tested, committed locally. NOT pushed. Nothing touched `main`, Vercel or the DB.**

## v10 — backend: admin manager + group-lead requests

**Needs the new tables first:** `npm run db:migrate` (adds `drizzle/0003_communities.sql`:
`communities`, `community_submissions`). Run it on your local DB now. For production (Neon),
run it only after you've reviewed this — it only ADDS two empty tables, nothing else changes.
No seed needed: the researched listings stay in `data/*.ts`; the DB is an overlay on top.

- **`/admin/communities`** (admin login; also linked from the admin top bar as "Communities")
  - Listings tab: search + filters (category, free/paid/per-event/membership, platform, city,
    status, source = researched/edited/added), 50 per page.
  - Edit (drawer form), Hide / Unhide, Revert (drop your edit, back to the researched version),
    Delete (only for listings added here — researched ones can be hidden, not deleted),
    "+ Add community".
  - Requests tab: what group leads sent, with old → new diff. Approve & publish /
    Edit then approve (new listings) / Reject with a note. Nothing goes live until approved.
- **`/communities/submit`** (public, for group leads) — three tabs: List a new community /
  Update my listing / Remove a listing. Update pre-fills the current details and only sends
  the fields they changed. Every detail page now has "Run this group? Update · Remove" links.
  Rate-limited (6/hour per IP), honeypot, same-origin check.
- Public pages read `getAllCommunities()` = static + DB overlay, cached 5 min and busted
  instantly on every admin write. If the DB is unreachable the site falls back to the static list.
- Every admin action is in the audit log (`community.create/update/hide/unhide/revert/delete`,
  `community_submission.approve/reject`).
- Tests: `scripts/communities-api-test.mjs` (28 checks — run against a LOCAL server + DB:
  `BASE=http://localhost:3000 ADMIN_EMAIL=… ADMIN_PASSWORD=… node scripts/communities-api-test.mjs`;
  it cleans up its own listings), e2e 48 checks, unit 15 checks.

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
- `data/communities.ts` + `data/communities-india.ts` (+ v7 `communities-discovered.ts`, `communities-updates.ts`) — **294 listings** (v7 counts below; v6 numbers here: 273 across 39 cities)
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

## v7 — Firecrawl pass: verified data, new categories, new filters (15 Nov 2026)

**Data** (all evidence in `research/firecrawl-verify-2026-11-15.md` + `research/firecrawl-discovery-2026-11-15.md`)
- **294 listings, 205 approved / 89 unverified.** Before this pass: 273, 166 / 107.
- `data/communities-updates.ts` is a new override layer applied in `lib/communities`, so the diff shows exactly what the scrape changed.
  - Verification: 20 rows promoted to approved, with corrected schedules, venues, join links and pricing.
  - Removed 5 dead or wrong rows: delhi-book-lovers, jaipur-cycling-club, great-hyderabad-adventure-club, hyderabad-book-club, cloka-club-chennai.
  - Moved 2 rows to Mumbai: step-out, open-mics-by-kasa-kai.
- `data/communities-discovered.ts` adds 25 rows:
  - Singles: Offline by Happy Hour ×3, Let's Socialise ×3.
  - Gen Z: Viral Talkiies. Plus Clock It.
  - 50+: Marzi ×2.
  - Pickleball: Gurugram Pickleball Club, Konnect.
  - Women: SWAG, HEN, plus 2 unverified.
  - Men: SIFF.
  - Civic & consumer: LocalCircles, plus the Ola complaints FB group (unverified).
  - Paid/premium: TiE Delhi-NCR, SaaSBoomi.
  - Online: a 50k-member Discord, 3 Reddit meet-up subs.
  - Pets: 1 row.
- **Online rows**: `city: 'Online'`, no map pin. They show in **every** city view, labelled "Online · pan-India" or "Online + city chapters".

**Taxonomy and filters**
- New categories: **Singles** (`dating`), **Women**, **Men**, **Civic & consumer**. Pets/Parents/Language now show as chips when they have rows.
- New fields: `mode` (offline/online/hybrid) and `ageBand` (genz/millennial/50plus). `ageBand` is set only where the organiser says so.
- Filters panel additions (all in the URL: `mode=`, `age=`, `price=membership`, `join=discord|reddit|facebook`):
  - **Age focus**: Gen Z, 50+
  - **Where**: in person, online/hybrid
  - **Membership / premium** pricing
  - **Join via**: now includes Discord, Reddit, Facebook and Link/form
- Tests: unit 11 → 15 checks; e2e 33 → 37 checks. All pass.

**Not built from the pasted MASTER BUILD PROMPT (needs backend / your decision):**
- DB tables, the admin review dashboard, the scheduled re-verification job.
- Telegram, X and LinkedIn connectors.
- Per-member counts from closed platforms.

The data shape maps 1:1 to those tables when you're ready.

**Judgement calls to check:**
- Listing SIFF (men's-rights NGO) under "Men" uses its own wording.
- Reddit subs are member-run, not organiser-run; the card says so.

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
