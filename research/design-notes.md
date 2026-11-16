# Design notes — Community of People marketplace

## What Hiive (hiive.club) does well, and what we took

Hiive reads as *community-first*: generous type, one calm accent, cards that feel like
invitations rather than database rows, hover states that lift instead of flash, and a
mobile layout that doesn't collapse into a list of grey boxes. The discipline we kept:
one accent, lots of air, a strict type scale (display face for headings only), motion
that is felt more than seen. What we did *not* copy: Hiive's social/feed framing.
Ours is a directory — the grid and the filter bar carry the page, and there is no
content between the visitor and the join button.

## One lesson each from the references

- **Airbnb** — the filter bar is *always* visible and sticky; the map is a toggle, not
  the default. We did both, and kept the result count live in the bar.
- **Luma** — restraint. A single display face at a few sizes, muted meta text, no icons
  louder than the words. Our card facts row is Luma-sized.
- **Meetup** — what to avoid: three clicks and a login before you reach a group. Every
  card here has one external join button, `target=_blank`, no account.
- **Misfits** — Indian context and category energy. Our category chips carry counts and
  the Misfits WhatsApp clubs are first-class listings, not an afterthought.
- **Strava clubs** — activity signals matter more than member counts. Each listing
  carries a "last checked" date and an activity sentence, and sorting "Most active"
  uses cadence + verification before size.
- **Product Hunt / Read.cv / Are.na** — calm listing grids and *generated* avatars. Our
  marks are deterministic from the slug (hue by category, shape by hash), so the grid
  looks designed without storing anyone's logo.
- **Linear** — motion respects `prefers-reduced-motion`; stagger ≤ 35 ms per card,
  ≤ 300 ms total; layout animations via Framer `layout`, which is already a dependency.

## Palette (v2 — vibrant)

Lovey asked for Zepto/Zomato energy, so v2 is **black + red + a purple pop** on white:
`--black #0E0C0B` for nav, hero band, join box and footer; `--accent #E6232B` red for every
primary action (join, "Near me", "Change"), card hover glow and the city word in the hero;
`--pop #6C2BD9` (Zepto purple) for the "unverified" badge and the logo gradient so the second
colour never competes with the red CTA. Ground is pure white, not COE's cream, so the two
products are visibly siblings-not-twins. Contrast: red on white passes AA for 14px+ bold;
small red text uses `--accent-ink #9E0F16`. All tokens live at the top of
`app/communities/communities.css` — the earlier calm-teal version is one git commit back if
the vibrancy is too much.

## Category hues

Running 18 · Food 10 · Fitness 350 · Creative 320 · Social 290 · Startup 265 · Games 245
· Tech 225 · Professional 210 · Cycling 200 · Cause 160 · Sports 145 · Outdoors 100 ·
Wellbeing 70 · Books 40. Chosen so adjacent chips in the bar don't share a hue family.

## Decisions Lovey may want to overrule

- Default city **Gurgaon**, and NCR is one market (Gurgaon search shows Delhi/Noida
  clubs with distance). Flip `CITY_GROUPS` in `lib/communities/index.ts`.
- Geolocation is requested only after the visitor picks a category or taps "Near me".
- "Start here" strip shows ≤ 8 `featured` rows and hides as soon as any filter is on.
- Unverified rows are shown (with a badge) rather than hidden; "Verified only" is a filter.
- No invented social-proof counters anywhere; the only numbers are listing counts.
