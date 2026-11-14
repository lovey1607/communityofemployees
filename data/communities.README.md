# data/communities.ts — how listings get in, and the rules

The communities marketplace (`/communities`) is front-end only for now. Listings are
rows in `data/communities.ts`, typed as `Community`. The shape maps one-to-one onto a
future `communities` table (`id`, `slug`, `status`, `source.*`, `createdAt` are all
there from day one) — moving it to Postgres is a mechanical job.

## Rules for every row

1. **Real, with a receipt.** `source.url` is a page a human actually opened and
   `source.verifiedOn` is the date. `source.activitySignal` says what was seen
   ("Event Sat 28 Nov 2026 on Meetup"). No row exists because a club "probably" exists.
2. **`status`**: `approved` = activity seen within roughly the last 90 days.
   `unverified` = the community is real but we could not confirm recent activity
   (old article, Instagram not reachable, no dated post). The UI badges these.
   Older than ~12 months with no signal → leave it out.
3. **Nothing invented.** Member counts (`size.note`), prices (`pricing.note`) and
   schedules (`meets.summary`) appear only when a public page states them, and the
   note says where the number came from. Unknown → `unknown` / `null`; the UI shows
   "Ask organiser" / "See their page".
4. **Join link = organiser's own channel.** WhatsApp invite, Instagram, Meetup,
   website. We never create a group, Linktree or form on their behalf. If the only
   path is "DM on Instagram", the join URL is the profile and the CTA says so.
5. **Public info only.** No personal phone numbers or emails unless published as the
   community's official contact. No organiser photos or logos in the repo — marks are
   generated from the slug (`lib/communities/markFor`); `imageUrl` stays `null`
   until an organiser supplies one.
6. **Location precision is honest.** `precision: 'area'` for a stated meeting point
   or neighbourhood, `'city'` when the venue varies. Nearest-first sorting ranks
   `area` rows above `city` rows so a city-centre placeholder never beats a real spot.

## Adding a listing

Copy a nearby row, fill every field you can *source*, set `status`, run
`npm run test:communities` (checks slugs, sources, counts) and
`BASE=http://localhost:3000 npm run test:communities:e2e` with the dev server up.

## Sources swept for the seed (14 Nov 2026)

| Source | What it gave | Rows |
|---|---|---|
| misfits.net.in/city/gurgaon (+ homepage) | 39 Gurgaon WhatsApp hobby/sports clubs, 7 with schedules | 29 |
| meetup.com/find/in--gurgaon (networking, startups, hobbies, sports, find) | Groups with Nov–Dec 2026 events, member counts | 22 |
| endorfin.run (Gurgaon, Delhi, Noida, Mumbai, Bengaluru, /clubs) | Run clubs with member counts, Nov event cards | ~45 |
| event-flo.com/run-clubs (Gurgaon, Delhi, Mumbai, Jaipur) | Schedules, areas, Instagram handles, "last checked" dates | — |
| timeout.com/delhi (2 Sept 2026) | 5AM Social, Bhag, CapitalTrails, Gurgaon Walkers, Delhi Outdoors, PHAB | 6 |
| so.city community clubs (13 Mar 2026) | Lodhi Reads, Seré, Step Out, Half Walks, Camellia, Delhi Movie Club | 6 |
| hangout.in (Bengaluru directory + sports category) | Bengaluru communities with follower counts | 13 |
| bengaluruprayana.com (updated Feb 2026) | Cubbon Paints/Folds, Urban Sketchers, Let's Trek | 4 |
| theideaslab.com reading clubs; thebetterindia (Apr 2026) | Gurgaon Reads, Delhi Book Lovers, BYOB, Noida Reads, Pages of Panvel | 5 |
| lbb.in / magicpin (Apr 2026) hobby clubs | Pedal Yatri, Gurgaon Trekking Club, Novel Ideas, Coffee Meetup, Photography Club | 5 |
| toastmasters.org, linktr.ee (YL Pickleball), gdg.community.dev, robinhoodarmy.com, salsavida.com, mytribe.in, unmukt.co.in, myhoc.in, shutterholictv.com | One-off official pages | 9 |

| event-flo + endorfin city pages (Pune, Hyderabad, Chennai, Kolkata, Ahmedabad) | Schedules, areas, handles, Nov 2026 events | ~35 |
| endorfin.run /clubs national directory | Run clubs in 25 smaller cities (name + member count only → `unverified`) | ~35 |
| meetup.com city pages (Pune, Hyderabad, Chennai, Kolkata, Ahmedabad) | Groups with Nov–Dec 2026 events | ~35 |
| reads.city, LBB Chennai/Pune, Knocksense, South First, DT Next, Bombay Circle Press, Telangana Today | Silent-reading chapters and book clubs in 8 cities | ~18 |
| omobikes + unventured cycling directories, hashtagmagazine (Hyderabad) | Cycling clubs, Hyderabad hobby communities | ~12 |

Pan-India rows live in `data/communities-india.ts` (same helpers, same rules).

Instagram pages could not be opened from the research tools (robots/permission), so
anything whose *only* source is an Instagram profile is `unverified`. The full audit,
including rejected candidates, is in `research/communities-log.md`.
