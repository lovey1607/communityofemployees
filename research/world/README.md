# World harvest — 16–17 Nov 2026

**Method.** For each city, Firecrawl read `meetup.com/find/?location=<code>&source=EVENTS`
(the "events near you" list) and returned the groups that had a dated upcoming event.
I kept up to ~12–18 per city, chosen for variety, and wrote them to `batch*.txt`
(one line per group: city | group slug | name | category | next event | date | mode | what it does).
`node scripts/build-world-communities.mjs` validates every line (known city, known category,
the weekday matches the 2026 date, no duplicates) and generates `data/communities-world.ts`.

**Result.** 594 groups in 59 cities across North America, Europe, the Middle East,
Asia-Pacific, Latin America and Africa. Every row's `activitySignal` is the event Meetup
showed, and `source.url` is the find page it came from.

**Left out on purpose.** Self-help / "healing" / relationship-coaching funnels, religious,
prayer or spiritual groups, astrology, MLM, sales funnels, investing / crypto / forex /
real-estate, bar-crawl and nightlife promoters, commercial tour operators, university-only
student chapters, and online-only groups dressed up as local (Lagos keeps two, marked online).

**Pages that showed the wrong city (discarded, not used).** `de--Munich` (showed Delaware),
`it--Milan` (Milan, Michigan), `it--Rome` (Rome, NY), `gb--Manchester` (Manchester, CT).
Munich and Milan were re-read with `de--München` and `it--Milano`; Rome and Manchester are not listed.

**Limits — be aware.** Meetup is one platform. In some cities the real scene lives on
WhatsApp, WeChat (mainland China), LINE (Japan/Taiwan), KakaoTalk (Korea) or Telegram;
those aren't covered yet. Meetup's find page shows no prices, so pricing is "Ask organiser".
Next-event dates go stale — re-run the harvest monthly.
