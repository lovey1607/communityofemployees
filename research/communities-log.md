# Communities research log — 14 Nov 2026

Everything looked at while seeding `data/communities.ts`, including what was left out
and why. Method: web search → fetch aggregator/directory pages → fetch each club's own
page where reachable. Instagram blocks automated fetches, so IG-only communities are
either `unverified` or excluded.

## Included (139 rows)

Gurgaon 70 · Delhi 25 · Noida 3 · Faridabad 1 · Ghaziabad 1 · Mumbai/Navi Mumbai/Thane 15
· Bengaluru 20 · Jaipur 8. Status: 104 approved, 35 unverified.

## Looked at and rejected

| Candidate | Source | Why excluded |
|---|---|---|
| Gurgaon Fun Riders, Cyclesutra, SpinLife, Delhi Randonneurs, V4A, Cyclo Fit, South West Riders | so.city cycling list, 25 Mar 2016 | Ten-year-old article, no newer signal |
| Delhi Cyclists Club, Delhi Heritage Photography Club, Delhi Photography Club, Backpackers Club of Delhi | magicpin (orig. 2018) | Facebook-only, no dated activity; Delhi not Gurgaon priority |
| Gurgaon Foodie / Food Freak / Shopping Guide / Startups (FB groups) | lbb.in "free communities" | Facebook groups with no join link in source; not meetup communities |
| Terrain Tigers (off-roading), Aero Modelers Association | lbb.in | Niche/paid-membership associations; no recent signal |
| Sttudio 292 | lbb.in | A venue, not a community |
| Leopard Trail Gurgaon | own site | Commercial camping venue, not a community |
| The Horizon Club, Swagr, Beyond8, The Red Herring, Stories of Hope, The Gati Club, Wobbly Knees Club, Rally Gully, Gurgaon Poets Collective | misfits.net.in/city/gurgaon | Purpose not inferable from name (or join link was a Canva file); kept out rather than guess a category |
| Mighty Cricket Club, Terrible Artists Union Club | misfits homepage | Named on homepage but not on the Gurgaon page; no join link |
| Delhi Scientology Events, Scientology Creating a Better World | meetup.com Gurgaon | Organisation-run recruitment events, not peer communities |
| UAE Western Riding community, Amazing Adventures (Odisha), Business Networking Community (Mohali), Founders & Business Owners Network (online), Delhi Startups Club (online) | meetup.com Gurgaon | Not actually in NCR / online-only |
| Uttar Pradesh Power BI Club, IBM WatsonLabs India, AWS SBG at DPG / BML / DITM | meetup.com Gurgaon | Vendor/college groups with thin presence; kept one AWS SBG as representative |
| TravelingSouls.org, Party Out Delhi | meetup.com Gurgaon | Commercial tour / party operators |
| Gurgaon Photography group (slug says sci-fi writing) | meetup.com | Event in the past; group identity unclear |
| Endorfin Run Club (10 members), Flare Run Club (8), Noida's exclusive Run-Club (32), TheCartelCommunity (8) | endorfin.run | Too small/new to list without a direct channel |
| Delhi Runners Group, East Delhi Run Club, Garmin Run Club India, New Delhi Road Runners, lace'd run club, SOLE RUN CREW | endorfin/event-flo Delhi | Delhi list already deep; add later |
| Mumbai long tail (Striders Miles, Aditus, Mumbai Road Runners, runplusone, momentum, Run of Champions, The Why Run Club, jaagopowai, …) | endorfin.run Mumbai | No schedule/area/handle available; add once a channel is confirmed |
| Bengaluru long tail (Main Mission, दौड़ RunClub, The 56 Run Club (invite-only), New Balance RC, theavgrunclub, PaceX, Marathon Runners Club, Namma, Kaizen, …) | endorfin.run Bengaluru | Same — no confirmed channel yet |
| Pune / Hyderabad / Chennai / other-city run clubs | endorfin.run /clubs | Out of scope for this phase |
| Jaipur Road Runners, Joshilay Runners, Royal Rajasthan Runners | shutterholictv (2021) | Stale; IG unverifiable |
| Pink City Runners | shutterholictv (2021) | Kept as unverified (organises a December half marathon) |
| Alliance Française, Ranga Shankara, Trove Experiences, Atta Galatta | lbb Bangalore / Better India | Venues/curators, not communities |
| West Block Blues, Soul Jams, Pork Lovers Club, Wine in a Million, Thindi Capital | lbb Bangalore | IG-only, unverifiable; good candidates once IG can be checked |
| GDG on Campus SVSU Palwal | gdg.community.dev | Palwal, student chapter |

## Sources that failed to load

- instagram.com/* (all handles) — robots / permission block
- misfits.net.in/city/{mumbai,bangalore,jaipur,delhi,noida} — permission block
- thegoodsoleclub.com, pedalyatri.in, capitaltrails.in — permission block (rows kept as `unverified` / Time Out-sourced)
- endorfin.run/run-clubs/jaipur, event-flo.com/run-clubs/bengaluru — permission block
- delhipedia.com — robots
- meetup.com/find/in--gurgaon/{outdoors-adventure,language-culture} — client error

## Next research passes (recommended)

1. Open every Instagram handle in a logged-in browser and promote/demote `unverified` rows.
2. Misfits city pages for Mumbai/Bengaluru/Jaipur/Delhi/Noida — likely +80 rows.
3. Luma (lu.ma) city calendars for Gurgaon/Delhi tech & founder events.
4. Strava clubs search for NCR cycling (Pedal Yatri, Gurgaon Cycling Club).
5. Women-only and parents/pets categories are thin — targeted search needed.
