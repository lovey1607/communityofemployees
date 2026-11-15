# Meetup + Reclub harvest — 15 Nov 2026

Source pages, scraped with Firecrawl. `query` extraction, 5 credits each:
- `meetup.com/find/?location=in--<City>&source=EVENTS` for Bangalore, Delhi, Gurgaon, Mumbai, Hyderabad, Chennai, Pune, Kolkata, Ahmedabad and Jaipur.
- The same page for Bangalore with `categoryId=652` (social).
- `reclub.co/communities/in` for pickleball.

**Result:** 106 Meetup groups plus 3 Reclub clubs were added (`data/communities-meetup-nov.ts`, `data/communities-discovered.ts`). Total listings went from 294 to 403.

**Meetup rows:** `approved`. Each one's `activitySignal` is the dated upcoming event Meetup showed on 15 Nov 2026.

**Reclub rows:** `unverified`, because their session dates aren't public.

**Excluded:**
- groups based abroad (Dubai, Bangkok, Singapore, Nepal, Pakistan, Malaysia)
- Scientology and its fronts ("Increase Mind's Potential", "Delhi Knowledge Seekers", "How to Improve Relationships")
- astrology and "automatic writing / channelling"
- religion-specific matrimony
- poker
- college-only AWS student groups
- sales funnels (Primewise Founders Club, "Global Startups Club", MAANG-in-4-months, AgileWoW paid trainings)
- vendor-only groups
- groups already listed
