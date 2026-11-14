// ============================================================
// data/communities-india.ts — listings beyond Delhi NCR / Mumbai /
// Bengaluru / Jaipur. Same rules as data/communities.README.md: every row
// has a source URL and date; nothing invented; unknowns stay unknown.
// Sources swept 14 Nov 2026: event-flo.com and endorfin.run city pages,
// meetup.com city discovery pages (events dated Nov–Dec 2026), reads.city,
// LBB / Knocksense / South First / DT Next / Bombay Circle Press articles,
// omobikes + unventured cycling directories, hashtagmagazine (Hyderabad).
// ============================================================

import { c, at, ig, V, type Community } from './communities';

const EF = (city: string) => `https://www.event-flo.com/run-clubs/${city}`;
const EN = (city: string) => `https://www.endorfin.run/run-clubs/${city}`;
const EN_ALL = 'https://www.endorfin.run/clubs';
const MU = (city: string) => `https://www.meetup.com/find/in--${city}/`;
const LBB_PUNE = 'https://lbb.in/pune/communities-in-pune/';
const LBB_PUNE2 = 'https://lbb.in/pune/meeting-new-people-pune/';
const HASHTAG = 'https://hashtagmagazine.in/social-communities-that-share-your-passion/';
const BCP_KOL = 'https://thebombaycirclepress.com/book-clubs-to-join-in-kolkata/';
const LBB_CHE_READS = 'https://lbb.in/chennai/silent-reading-in-chennai/';
const LBB_CHE_HOBBY = 'https://lbb.in/chennai/hobby-clubs-chennai/';
const OMO = 'https://omobikes.com/pages/india-bicycle-community-rides-calendar';
const UNV = 'https://unventured.com/local-bicycling-clubs-communities-in-india/';
const READS = 'https://reads.city/';

/** Run club known only from an endorfin directory row (name + member count). */
function endorfinOnly(slug: string, name: string, city: string, members: string, src: string, extra: Partial<Community> = {}): Community {
  return c({
    slug, name, city, category: 'running', tags: ['run club'],
    tagline: `${city}'s run club on endorfin — ${members} members.`,
    description: `Community run club listed on endorfin.run's ${city} directory with ${members} members. Schedule and meeting point are on their own channels; we haven't confirmed a recent run yet.`,
    size: { bucket: /K/.test(members) || parseInt(members) >= 1000 ? '1000+' : parseInt(members) >= 200 ? '200–1000' : '50–200', note: `${members} members on endorfin.run` },
    join: { url: src, platform: 'other', cta: 'Find them on endorfin' },
    links: { website: src },
    source: { url: src, verifiedOn: V, activitySignal: 'Listed on endorfin directory 14 Nov 2026; no dated run seen' },
    status: 'unverified',
    ...extra,
  });
}

/** Meetup group with a dated event in Nov–Dec 2026 — approved. */
function meetup(slug: string, name: string, city: string, category: Community['category'], tagline: string, url: string, when: string, extra: Partial<Community> = {}): Community {
  return c({
    slug, name, city, category, tagline,
    description: `${tagline} Organised on Meetup; RSVP per event.`,
    join: { url, platform: 'meetup', cta: 'RSVP on Meetup' },
    links: { meetup: url },
    source: { url: MU(city.toLowerCase()), verifiedOn: V, activitySignal: when },
    ...extra,
  });
}

/** Silent-reading chapter — the format is the same everywhere. */
function reads(slug: string, name: string, city: string, venue: string | null, when: string | null, handle: string | null, src: string, signal: string, loc?: { lat: number; lng: number }, extra: Partial<Community> = {}): Community {
  return c({
    slug, name, city, category: 'books',
    tagline: `Silent reading in the park${venue ? ` — ${venue}` : ''}. Bring a book.`,
    description: `${city}'s silent-reading meetup${venue ? ` at ${venue}` : ''}: show up with any book, read alongside strangers for a couple of hours, chat after if you like. No sign-up, no fee.`,
    tags: ['silent reading', 'park', 'free', 'beginner-friendly', 'weekend'],
    area: venue, location: loc && venue ? at(loc.lat, loc.lng, venue) : undefined,
    meets: { cadence: 'weekly', summary: when },
    pricing: { type: 'free', note: null },
    join: handle ? { url: ig(handle), platform: 'instagram', cta: 'Follow for this week’s spot' } : { url: src, platform: 'other', cta: 'See listing' },
    links: handle ? { instagram: ig(handle) } : {},
    source: { url: src, verifiedOn: V, activitySignal: signal },
    ...extra,
  });
}

export const COMMUNITIES_INDIA: Community[] = [
  // ───────────────────────── PUNE ────────────────────────────────────────
  c({
    slug: 'alpha-run-club-pune', name: 'Alpha Run Club', category: 'running', city: 'Pune',
    tagline: 'Sunday 7am, 3K/5K — KP, Balewadi High Street, Baner. 28K strong.',
    description: 'Pune’s biggest run club: Sunday 7am social runs of 3 or 5 km, rotating between Koregaon Park, Balewadi High Street and Baner.',
    tags: ['sunday', '5k', 'beginner-friendly', 'koregaon park', 'baner'],
    area: 'KP / Balewadi / Baner (rotates)', location: at(18.54, 73.83, 'Pune west (rotates)'),
    meets: { cadence: 'weekly', summary: 'Sundays 7am' }, audience: { gender: 'all', ageNote: null, level: 'beginner' },
    size: { bucket: '1000+', note: '28.3K members on endorfin.run' },
    join: { url: 'https://alpha-runclub.in/', platform: 'website', cta: 'Open their website' }, links: { website: 'https://alpha-runclub.in/' },
    source: { url: EF('pune'), verifiedOn: V, activitySignal: 'event-flo Pune checked 13 Nov 2026' }, featured: true,
  }),
  c({
    slug: 'gati-crew-pune', name: 'गति Crew (Gati Crew)', category: 'running', city: 'Pune',
    tagline: 'Sunday runs + coffee raves across Baner, Viman Nagar, KP.',
    description: 'Sunday social runs with a rotating venue (Baner, Viman Nagar, Koregaon Park) and regular 5K “coffee rave” events.',
    tags: ['sunday', '5k', 'coffee rave', 'social run'],
    meets: { cadence: 'weekly', summary: 'Sundays (venue rotates)' },
    size: { bucket: '1000+', note: '13.7K members on endorfin.run' },
    join: { url: ig('gati.crew'), platform: 'instagram', cta: 'Follow on Instagram' }, links: { instagram: ig('gati.crew') },
    source: { url: EN('pune'), verifiedOn: V, activitySignal: 'Coffee Rave 5K, 15 Nov 2026 on endorfin' },
  }),
  c({
    slug: 'unbound-run-club-pune', name: 'Unbound Run Club', category: 'running', city: 'Pune',
    tagline: 'PCMC’s Sunday run club — 2K to 10K from Ravet.',
    description: 'Sunday runs from Ravet, PCMC with 2–10 km options.',
    tags: ['sunday', 'pcmc', 'ravet', 'beginner-friendly'], area: 'Ravet, PCMC', location: at(18.65, 73.74, 'Ravet'),
    meets: { cadence: 'weekly', summary: 'Sundays' },
    join: { url: 'https://unboundrunclub.in/', platform: 'website', cta: 'Open their website' }, links: { website: 'https://unboundrunclub.in/' },
    source: { url: EF('pune'), verifiedOn: V, activitySignal: 'event-flo Pune checked 13 Nov 2026' },
  }),
  c({
    slug: 'western-ghats-running', name: 'Western Ghats Running', category: 'outdoors', city: 'Pune',
    tagline: 'Trail runs and ultras in the Sahyadris.',
    description: 'Trail-running community organising trail and ultra events in the Western Ghats around Pune; several events 29 Nov – 12 Dec.',
    tags: ['trail', 'ultra', 'sahyadri', 'weekend'], audience: { gender: 'all', ageNote: null, level: 'advanced' },
    pricing: { type: 'pay-per-event', note: 'Event entries are ticketed' },
    size: { bucket: '1000+', note: '9.3K members on endorfin.run' },
    join: { url: 'https://www.endorfin.run/clubs/westernghatsrunning', platform: 'other', cta: 'See events on endorfin' }, links: { website: 'https://www.endorfin.run/clubs/westernghatsrunning' },
    source: { url: EN('pune'), verifiedOn: V, activitySignal: 'Events listed 29 Nov – 12 Dec 2026' },
  }),
  endorfinOnly('wepersist-pune', 'wepersist', 'Pune', '25.3K', EN('pune')),
  endorfinOnly('stridetribe-pune', 'stridetribe', 'Pune', '1.7K', EN('pune'), { status: 'approved', source: { url: EN('pune'), verifiedOn: V, activitySignal: 'Shakeout run 4.3K, 14 Nov 2026 on endorfin' } }),
  endorfinOnly('veloxx-club-pune', 'Veloxx Club', 'Pune', '1.7K', EN('pune'), { status: 'approved', source: { url: EN('pune'), verifiedOn: V, activitySignal: 'Run & rave event 14 Nov 2026 on endorfin' } }),
  reads('pune-reads', 'Pune Reads', 'Pune', 'Kamala Nehru Park, Deccan', 'Saturdays 8 – 11am', 'pune.reads', LBB_PUNE, 'LBB (Nov 2025) + reads.city live 14 Nov 2026', { lat: 18.515, lng: 73.84 }, { featured: true }),
  c({
    slug: 'board-game-meetups-pune', name: 'Board Game Meetups Pune', category: 'games', city: 'Pune',
    tagline: 'Open board-game meetups; a new game starts every 15 minutes.',
    description: 'Regular open board-game meetups in Pune. Join the WhatsApp group for the next date and venue.',
    tags: ['board games', 'beginner-friendly', 'weekend'],
    join: { url: 'https://chat.whatsapp.com/IYir2RVjLGp0cWFVQ5dJGp', platform: 'whatsapp', cta: 'Join WhatsApp group' }, links: { instagram: ig('boardgame_meetups_pune') },
    source: { url: LBB_PUNE, verifiedOn: V, activitySignal: 'LBB community round-up (Nov 2025)' }, status: 'unverified',
  }),
  c({
    slug: 'meet-by-fate-pune', name: 'Meet By Fate', category: 'social', city: 'Pune',
    tagline: 'Strangers’ meetups every weekend, rotating venues.',
    description: 'Weekend meetups for people who want to meet new people; venues rotate and go up in the WhatsApp group.',
    tags: ['new in town', 'weekend', 'beginner-friendly'], meets: { cadence: 'weekly', summary: 'Every weekend' },
    join: { url: 'https://chat.whatsapp.com/HLbLaRUY6WiKgU6S7h9OGm', platform: 'whatsapp', cta: 'Join WhatsApp group' }, links: { instagram: ig('meetbyfate') },
    source: { url: LBB_PUNE, verifiedOn: V, activitySignal: 'LBB community round-up (Nov 2025)' }, status: 'unverified',
  }),
  c({
    slug: 'bookoholics-book-club-pune', name: 'Bookoholics Book Club', category: 'books', city: 'Pune',
    tagline: 'Pune book club, no fixed venue.', description: 'Book discussion club in Pune; meets at rotating venues announced on Instagram.',
    tags: ['book club'], join: { url: ig('bookoholicsbookclub'), platform: 'instagram', cta: 'Follow on Instagram' }, links: { instagram: ig('bookoholicsbookclub') },
    source: { url: LBB_PUNE, verifiedOn: V, activitySignal: 'LBB community round-up (Nov 2025)' }, status: 'unverified',
  }),
  c({
    slug: 'the-bikerni-pune', name: 'The Bikerni — Pune Chapter', category: 'outdoors', city: 'Pune',
    tagline: 'Women-only motorcycling collective.', description: 'Pune chapter of The Bikerni, India’s women-only motorcycling collective: rides, meets and breakfast runs.',
    tags: ['women-only', 'motorcycling', 'rides'], audience: { gender: 'women', ageNote: null, level: 'all' },
    join: { url: ig('punebikerni'), platform: 'instagram', cta: 'Follow on Instagram' }, links: { instagram: ig('punebikerni'), facebook: 'https://www.facebook.com/TheBikerni/' },
    source: { url: LBB_PUNE, verifiedOn: V, activitySignal: 'LBB community round-up (Nov 2025)' }, status: 'unverified',
  }),
  c({
    slug: 'friends-of-figma-pune', name: 'Friends of Figma Pune', category: 'tech', city: 'Pune',
    tagline: 'Design community meetups, run by Figma volunteers.', description: 'Pune chapter of Friends of Figma: design talks, workshops and meetups.',
    tags: ['design', 'ux', 'free'], pricing: { type: 'free', note: null },
    join: { url: 'https://friends.figma.com/pune/', platform: 'website', cta: 'Join the chapter' }, links: { website: 'https://friends.figma.com/pune/', instagram: ig('fof.pune') },
    source: { url: LBB_PUNE, verifiedOn: V, activitySignal: 'LBB community round-up (Nov 2025)' }, status: 'unverified',
  }),
  c({
    slug: 'open-mics-by-kasa-kai', name: 'Open Mics by Kasa Kai', category: 'creative', city: 'Pune',
    tagline: 'Fortnightly open mic — poetry, stories, music, comedy. From ₹250.',
    description: 'Open mic every other week, 6–9pm: poetry, storytelling, music and comedy. Entry from ₹250.',
    tags: ['open mic', 'poetry', 'comedy', 'fortnightly'], meets: { cadence: 'fortnightly', summary: 'Every other week, 6 – 9pm' },
    pricing: { type: 'pay-per-event', note: 'From ₹250' },
    join: { url: ig('openmicsbykasakai'), platform: 'instagram', cta: 'Follow on Instagram' }, links: { instagram: ig('openmicsbykasakai') },
    source: { url: LBB_PUNE2, verifiedOn: V, activitySignal: 'LBB “meet new people in Pune” article' }, status: 'unverified',
  }),
  c({
    slug: 'pune-heritage-walks', name: 'Pune Heritage Walks', category: 'outdoors', city: 'Pune',
    tagline: 'Weekend morning heritage walks through old Pune. From ₹500.',
    description: 'Guided heritage walks on Saturday and Sunday mornings, 9am–12pm.',
    tags: ['heritage', 'walks', 'weekend'], meets: { cadence: 'weekly', summary: 'Sat & Sun, 9am – 12pm' }, pricing: { type: 'pay-per-event', note: 'From ₹500' },
    join: { url: ig('puneheritagestory'), platform: 'instagram', cta: 'Follow on Instagram' }, links: { instagram: ig('puneheritagestory') },
    source: { url: LBB_PUNE2, verifiedOn: V, activitySignal: 'LBB “meet new people in Pune” article' }, status: 'unverified',
  }),
  c({
    slug: 'pune-strategy-board-games', name: 'Pune Strategy Board Games Meetup', category: 'games', city: 'Pune',
    tagline: 'Free weekend strategy-game sessions, Baner/Aundh side.',
    description: 'Free strategy board-game meetups, typically weekends around Baner/Aundh. RSVP on Meetup.',
    tags: ['board games', 'strategy', 'free', 'weekend'], area: 'Baner / Aundh', location: at(18.56, 73.79, 'Baner'),
    pricing: { type: 'free', note: 'RSVP required' },
    join: { url: 'https://www.meetup.com/pune-strategy-board-games', platform: 'meetup', cta: 'RSVP on Meetup' }, links: { meetup: 'https://www.meetup.com/pune-strategy-board-games' },
    source: { url: 'https://sanketnainani.com/board-game-nights-pune-2026/', verifiedOn: V, activitySignal: 'Round-up updated Jun 2026' }, status: 'unverified',
  }),
  meetup('echai-pune-startup-network', 'eChai Pune Startup Network', 'Pune', 'startup', 'Founder meetups and demo days — 32K members, Pune’s largest.', 'https://www.meetup.com/startuppune/', 'AI × Startup Open House Sat 21 Nov; Demo Day Sat 28 Nov 2026', { size: { bucket: '1000+', note: '32,368 members on Meetup' }, featured: true }),
  meetup('pune-tech-community', 'Pune Tech Community', 'Pune', 'tech', 'Developer community, 22K members; .NET Conf Pune in Nov.', 'https://www.meetup.com/pune-tech-community/', '.NET Conf 2026 Pune, Sat 28 Nov 2026', { size: { bucket: '1000+', note: '21,990 members on Meetup' } }),
  meetup('ksug-ai-india', 'KSUG.AI India', 'Pune', 'tech', 'Cloud-native & AI user group, hybrid monthly sessions.', 'https://www.meetup.com/ksug-in/', '#12 Cloud Native & AI, Sat 21 Nov 2026', { size: { bucket: '1000+', note: '9,549 members on Meetup' } }),
  meetup('pune-user-group', 'Pune User Group (PUG)', 'Pune', 'tech', 'Microsoft-stack developer community; Pune DevCon in Dec.', 'https://www.meetup.com/puneusergroup/', 'Pune DevCon 2026, Sat 12 Dec 2026', { size: { bucket: '1000+', note: '7,275 members on Meetup' } }),
  meetup('afterthat-events-pune', 'AfterThat Events', 'Pune', 'social', 'Meet-strangers games, art workshops and socials most Saturdays.', 'https://www.meetup.com/afterthatevents/', 'Three events Sat 21 Nov 2026', { size: { bucket: '1000+', note: '2,188 members on Meetup' }, tags: ['new in town', 'saturday', 'beginner-friendly'] }),
  meetup('pune-social-animals', 'Pune Social Animals', 'Pune', 'social', 'Coffee meetups and socials for new-in-Pune folks.', 'https://www.meetup.com/pune-social-animals-group/', 'Coffee meetup Sat 28 Nov; anniversary Sun 22 Nov 2026', { tags: ['coffee', 'new in town'] }),
  meetup('circl-kharadi', 'Circl. (Xircl) Kharadi', 'Pune', 'social', 'Antakshari, skill swaps and PowerPoint karaoke in Kharadi. ₹199.', 'https://www.meetup.com/circlkharadi/', 'Events 21, 28 & 29 Nov 2026', { area: 'Kharadi', location: at(18.55, 73.94, 'Kharadi'), pricing: { type: 'pay-per-event', note: '₹99 – ₹199 per event' } }),
  meetup('music-jammin-pune', 'Music Jammin Pune', 'Pune', 'creative', 'Open jam sessions — #72 and counting.', 'https://www.meetup.com/musicjamminpune/', 'LET’S JAM #72, Sat 21 Nov 2026', { tags: ['jam', 'music', 'beginner-friendly'] }),
  meetup('pune-socrates-meetup', 'Pune Socrates Meetup', 'Pune', 'social', 'Philosophy discussion circle. ₹200 a session.', 'https://www.meetup.com/pune-socrates-meetup-group/', 'Plato’s Cave, Sun 15 Nov 2026', { pricing: { type: 'pay-per-event', note: '₹200' }, tags: ['philosophy', 'discussion'] }),
  meetup('toastmasters-pune-central', 'Toastmasters Club of Pune-Central', 'Pune', 'professional', 'Public-speaking practice, Sunday afternoons.', 'https://www.meetup.com/tmcpcentral/', 'Meeting Sun 15 Nov 2026, 4pm', { tags: ['public speaking', 'sunday'], pricing: { type: 'membership', note: 'Guests free' } }),
  meetup('link-and-chill-pune', 'Link & Chill Pune', 'Pune', 'outdoors', 'Camping trips and casual game nights.', 'https://www.meetup.com/link-chill-pune/', 'Pawna camping Sat 21 Nov 2026', { tags: ['camping', 'weekend'], pricing: { type: 'pay-per-event', note: null } }),

  // ───────────────────────── HYDERABAD ───────────────────────────────────
  c({
    slug: 'hyderabad-runners-society', name: 'Hyderabad Runners Society', category: 'running', city: 'Hyderabad',
    tagline: 'Sunday Long Run, 5:30am at Gachibowli Stadium. Free. 8–18K.',
    description: 'The city’s original running society. Sunday Long Run assembles 5:30am at Gachibowli Stadium gate, 5:45 start, 8–18 km. Free; also organises the Hyderabad Marathon.',
    tags: ['sunday', 'long run', 'gachibowli', 'free', 'marathon training'], area: 'Gachibowli', location: at(17.44, 78.35, 'Gachibowli Stadium'),
    meets: { cadence: 'weekly', summary: 'Sundays 5:30am assembly' }, pricing: { type: 'free', note: null },
    join: { url: ig('hyderabadrunnerssociety'), platform: 'instagram', cta: 'Follow on Instagram' }, links: { instagram: ig('hyderabadrunnerssociety') },
    source: { url: EF('hyderabad'), verifiedOn: V, activitySignal: 'event-flo Hyderabad checked 24 Aug 2026' }, featured: true,
  }),
  c({
    slug: 'run-n-rave-hyderabad', name: 'Run’Rave', category: 'running', city: 'Hyderabad',
    tagline: 'Sunday 6am around Durgam Cheruvu — 5.9K members.',
    description: 'Sunday 6am social runs around Durgam Cheruvu and Sainikpuri; exact spot shared after RSVP.',
    tags: ['sunday', 'durgam cheruvu', 'social run'], area: 'Durgam Cheruvu', location: at(17.43, 78.39, 'Durgam Cheruvu'),
    meets: { cadence: 'weekly', summary: 'Sundays 6am' }, size: { bucket: '1000+', note: '5.9K members on endorfin.run' },
    join: { url: ig('runnrave.hyd'), platform: 'instagram', cta: 'Follow on Instagram' }, links: { instagram: ig('runnrave.hyd') },
    source: { url: EF('hyderabad'), verifiedOn: V, activitySignal: 'event-flo checked 24 Aug 2026; endorfin listing live' },
  }),
  c({
    slug: '365-run-club-hyderabad', name: '365 Run Club', category: 'running', city: 'Hyderabad',
    tagline: 'Weekend café runs, 5–15K, venue after RSVP.',
    description: 'Saturday and Sunday runs from rotating cafés, 5–15 km.',
    tags: ['weekend', 'café run', '10k'], meets: { cadence: 'weekly', summary: 'Sat & Sun' }, size: { bucket: '1000+', note: '5.1K members on endorfin.run' },
    join: { url: ig('365runclub_'), platform: 'instagram', cta: 'Follow on Instagram' }, links: { instagram: ig('365runclub_') },
    source: { url: EN('hyderabad'), verifiedOn: V, activitySignal: 'ENE Day Run 5K, 14 Nov 2026 on endorfin' },
  }),
  c({
    slug: 'the-circle-hyderabad', name: 'The Circle', category: 'running', city: 'Hyderabad',
    tagline: 'KBR Park & Durgam Cheruvu runs, 5–15K.', description: 'Run crew meeting at KBR Park and Durgam Cheruvu; 5–15 km; spot shared after RSVP.',
    tags: ['kbr park', 'social run'], area: 'KBR Park / Jubilee Hills', location: at(17.42, 78.42, 'KBR Park'), size: { bucket: '1000+', note: '2.7K members on endorfin.run' },
    join: { url: ig('thecircle.hydd'), platform: 'instagram', cta: 'Follow on Instagram' }, links: { instagram: ig('thecircle.hydd') },
    source: { url: EF('hyderabad'), verifiedOn: V, activitySignal: 'event-flo checked 24 Aug 2026' },
  }),
  c({
    slug: 'lb-nagar-runners', name: 'LB Nagar / Uppal Runners', category: 'running', city: 'Hyderabad',
    tagline: 'East Hyderabad Sunday Long Run from Nagole Metro.', description: 'Sunday Long Run from HMDA Layout Walkers Park near Nagole Metro, 5:30am assembly, 8–17 km.',
    tags: ['sunday', 'long run', 'uppal', 'nagole'], area: 'Nagole / Uppal', location: at(17.37, 78.56, 'Nagole'), meets: { cadence: 'weekly', summary: 'Sundays 5:30am' },
    join: { url: 'https://www.facebook.com/uppalrunners/', platform: 'other', cta: 'Open Facebook page' }, links: { facebook: 'https://www.facebook.com/uppalrunners/' },
    source: { url: EF('hyderabad'), verifiedOn: V, activitySignal: 'event-flo checked 24 Aug 2026' },
  }),
  c({
    slug: 'hyderabad-hash-house-harriers', name: 'Hyderabad Hash House Harriers', category: 'running', city: 'Hyderabad',
    tagline: 'Run, walk or stroll a new trail every Sunday — then socialise.', description: 'The Hyderabad chapter of the global Hash: a different trail each Sunday, run or walk, followed by the social bit.',
    tags: ['sunday', 'trail', 'social', 'beginner-friendly'], meets: { cadence: 'weekly', summary: 'Sundays' },
    join: { url: 'https://hyderabadhash.com/', platform: 'website', cta: 'Open their website' }, links: { website: 'https://hyderabadhash.com/' },
    source: { url: EF('hyderabad'), verifiedOn: V, activitySignal: 'event-flo checked 24 Aug 2026' },
  }),
  c({
    slug: 'hydrn', name: 'Hydrn', category: 'running', city: 'Hyderabad', tagline: 'Sunday runs around Jubilee Hills & KBR — apply to join.',
    description: 'Sunday runs around Jubilee Hills / KBR Park; membership by application on their site.', tags: ['sunday', 'jubilee hills'], area: 'Jubilee Hills', location: at(17.43, 78.41, 'Jubilee Hills'),
    meets: { cadence: 'weekly', summary: 'Sundays' }, join: { url: 'https://www.hydrn.in/', platform: 'website', cta: 'Apply on their site' }, links: { website: 'https://www.hydrn.in/' },
    source: { url: EF('hyderabad'), verifiedOn: V, activitySignal: 'event-flo checked 24 Aug 2026' },
  }),
  reads('hyderabad-reads', 'Hyderabad Reads', 'Hyderabad', 'KBR Park', 'Weekly (see Instagram)', 'hyderabadreads', READS, 'reads.city live 14 Nov 2026; Telangana Today Apr 2024', { lat: 17.42, lng: 78.42 }, { featured: true }),
  reads('secunderabad-reads', 'Secunderabad Reads', 'Hyderabad', 'AS Rao Nagar Park', 'Weekly', null, 'https://telanganatoday.com/discover-social-circles-meet-like-minded-people-in-city', 'Telangana Today, 8 Apr 2024; no direct channel found', { lat: 17.48, lng: 78.55 }, { status: 'unverified' }),
  meetup('hyderabad-board-gamers-club', 'Hyderabad Board Gamers’ Club', 'Hyderabad', 'games', 'Board-gaming meetup #467 — yes, 467. ₹500 a session.', 'https://www.meetup.com/hydbgc/', 'Meet-up #467, Sun 15 Nov 2026', { pricing: { type: 'pay-per-event', note: '₹500' }, tags: ['board games', 'sunday'], links: { meetup: 'https://www.meetup.com/hydbgc/', instagram: ig('hydbgclub') }, featured: true }),
  meetup('hyderabad-wanderers-club', 'Hyderabad Wanderers Club', 'Hyderabad', 'outdoors', 'Travel meetups, book evenings and group trips. 7.4K members.', 'https://www.meetup.com/hyderabad-wanderers-club/', 'Events 15, 22 & 28 Nov 2026', { size: { bucket: '1000+', note: '7,452 members on Meetup' }, pricing: { type: 'pay-per-event', note: 'From ₹299' } }),
  meetup('producttank-hyderabad', 'ProductTank Hyderabad', 'Hyderabad', 'professional', 'Product managers’ meetup, 3.9K members.', 'https://www.meetup.com/producttank-hyderabad/', 'From Product to Portfolio, Sat 21 Nov 2026', { size: { bucket: '1000+', note: '3,895 members on Meetup' }, tags: ['product management'] }),
  meetup('coffee-and-conversations-hyderabad', 'Coffee & Conversations: The Round Table', 'Hyderabad', 'social', 'Sunday-morning conversation table, 3.3K members.', 'https://www.meetup.com/thecoffeeconversations/', 'The Travelling Table, Sun 22 Nov 2026', { size: { bucket: '1000+', note: '3,324 members on Meetup' }, tags: ['coffee', 'conversation', 'sunday'] }),
  meetup('vision-toastmasters-hyderabad', 'Vision Toastmasters of Hyderabad', 'Hyderabad', 'professional', 'Sunday-morning Toastmasters, meeting #487.', 'https://www.meetup.com/visiontm/', 'Meeting #487, Sun 15 Nov 2026', { tags: ['public speaking', 'sunday'], pricing: { type: 'membership', note: 'Guests free' } }),
  meetup('lich-hyderabad', 'LICH — Literary, Intellectual & Cultural Hub', 'Hyderabad', 'creative', 'Literary salons and cultural potpourri sessions.', 'https://www.meetup.com/lich-hyd/', 'Cauldron: Potpourri, Sun 15 Nov 2026', { tags: ['literature', 'poetry', 'discussion'] }),
  meetup('hyderabad-womens-club', 'Hyderabad Women’s Club', 'Hyderabad', 'social', 'Women-only socials and nights out.', 'https://www.meetup.com/hyderabad-womens-club/', 'Ladies night out, Wed 18 Nov 2026', { audience: { gender: 'women', ageNote: null, level: 'all' }, tags: ['women-only', 'social'] }),
  meetup('clan-fall-hyderabad', 'CLAN FALL', 'Hyderabad', 'games', 'Board-game nights at Get On Board Café (also runs in Chennai).', 'https://www.meetup.com/clanfall/', 'Game night Thu 19 Nov 2026', { tags: ['board games', 'weeknight'] }),
  meetup('indian-data-club', 'Indian Data Club', 'Hyderabad', 'tech', 'Data & AI community talks — Beyond RAG next.', 'https://www.meetup.com/indian-data-club/', 'Beyond RAG, Sat 21 Nov 2026', { tags: ['ai', 'data', 'talks'] }),
  c({
    slug: 'great-hyderabad-adventure-club', name: 'Great Hyderabad Adventure Club (GHAC)', category: 'outdoors', city: 'Hyderabad',
    tagline: 'Treks, climbs and outdoor weekends — Hyderabad’s big adventure club.', description: 'Long-running outdoor community organising treks, climbing and adventure weekends around Hyderabad and beyond.',
    tags: ['trekking', 'climbing', 'weekend'], join: { url: 'https://www.meetup.com/great-hyderabad-adventure-club', platform: 'meetup', cta: 'Join on Meetup' }, links: { meetup: 'https://www.meetup.com/great-hyderabad-adventure-club', instagram: ig('ghac.in') },
    source: { url: HASHTAG, verifiedOn: V, activitySignal: 'Hashtag Magazine (updated May 2025); Meetup page not opened' }, status: 'unverified',
  }),
  c({
    slug: 'urban-sketchers-hyderabad', name: 'Urban Sketchers Hyderabad', category: 'creative', city: 'Hyderabad', tagline: 'Weekend on-location sketching meetups.',
    description: 'Hyderabad chapter of Urban Sketchers; weekend sketch-outs around the city.', tags: ['sketching', 'drawing', 'weekend', 'beginner-friendly'],
    join: { url: ig('uskhyderabad'), platform: 'instagram', cta: 'Follow on Instagram' }, links: { instagram: ig('uskhyderabad') },
    source: { url: HASHTAG, verifiedOn: V, activitySignal: 'Hashtag Magazine (updated May 2025)' }, status: 'unverified',
  }),
  c({
    slug: 'hyderabad-book-club', name: 'Hyderabad Book Club', category: 'books', city: 'Hyderabad', tagline: 'Book discussions, organised on Meetup.',
    description: 'Hyderabad’s book club; monthly discussions announced on Meetup and Instagram.', tags: ['book club'],
    join: { url: 'https://www.meetup.com/hyderabad-book-club', platform: 'meetup', cta: 'Join on Meetup' }, links: { meetup: 'https://www.meetup.com/hyderabad-book-club', instagram: ig('hyderabadbook') },
    source: { url: HASHTAG, verifiedOn: V, activitySignal: 'Hashtag Magazine (updated May 2025)' }, status: 'unverified',
  }),
  c({
    slug: 'hyderabad-bicycling-club', name: 'Hyderabad Bicycling Club', category: 'cycling', city: 'Hyderabad', tagline: 'Community and charity rides across the city.',
    description: 'One of India’s oldest cycling communities; group rides, charity rides and events.', tags: ['cycling', 'group rides', 'charity rides'],
    join: { url: 'https://www.facebook.com/groups/hyderabadbicyclingclub', platform: 'other', cta: 'Open Facebook group' }, links: { facebook: 'https://www.facebook.com/groups/hyderabadbicyclingclub' },
    source: { url: UNV, verifiedOn: V, activitySignal: 'Unventured directory (updated Apr 2024)' }, status: 'unverified',
  }),

  // ───────────────────────── CHENNAI ─────────────────────────────────────
  c({
    slug: 'chennai-runners-bessie-flyers', name: 'Chennai Runners — Bessie Flyers', category: 'running', city: 'Chennai',
    tagline: 'Tue/Thu/Sun 5:15am from Elliot’s Beach. Chennai Runners’ beach chapter.',
    description: 'Besant Nagar chapter of Chennai Runners: Tuesday, Thursday and Sunday 5:15am from Elliot’s Beach. Chennai Runners has chapters across the city (Pillar Pacers in Ashok Nagar, T. Nagar Trendsetters and more).',
    tags: ['early morning', 'beach', 'besant nagar', 'weekday runs'], area: 'Besant Nagar / Elliot’s Beach', location: at(13.0, 80.27, 'Elliot’s Beach'),
    meets: { cadence: 'weekly', summary: 'Tue, Thu & Sun, 5:15am' }, pricing: { type: 'free', note: null },
    join: { url: 'https://chennairunners.in/chapters/', platform: 'website', cta: 'Find your chapter' }, links: { website: 'https://chennairunners.in/chapters/', instagram: ig('pillar_pacers') },
    source: { url: EF('chennai'), verifiedOn: V, activitySignal: 'event-flo Chennai checked 26 Aug 2026' }, featured: true,
  }),
  c({
    slug: 'vamos-run-club-chennai', name: 'VAMOS Run Club', category: 'running', city: 'Chennai', tagline: 'Weekend beach-loop runs + night runs. 7K members.',
    description: 'Weekend runs on the Besant Nagar beach loop and in Anna Nagar, with occasional night runs and carnival events.', tags: ['weekend', 'night run', 'beach'],
    meets: { cadence: 'weekly', summary: 'Weekends (3 runs/month per endorfin)' }, size: { bucket: '1000+', note: '7.1K members on endorfin.run' },
    join: { url: ig('vamos_run_club'), platform: 'instagram', cta: 'Follow on Instagram' }, links: { instagram: ig('vamos_run_club') },
    source: { url: EF('chennai'), verifiedOn: V, activitySignal: 'event-flo checked 26 Aug 2026; endorfin event 31 Oct' },
  }),
  c({
    slug: 'bat-club-chennai', name: 'Bat Club', category: 'running', city: 'Chennai', tagline: 'Sunday runs — Anna Nagar, Kilpauk, the beach. 5.5K members.',
    description: 'Sunday run club rotating between Anna Nagar, Kilpauk and the beachfront.', tags: ['sunday', 'anna nagar'], meets: { cadence: 'weekly', summary: 'Sundays' },
    size: { bucket: '1000+', note: '5.5K members on endorfin.run' }, join: { url: 'https://instagram.com/batclub.in', platform: 'instagram', cta: 'Follow on Instagram' }, links: { instagram: 'https://instagram.com/batclub.in' },
    source: { url: EF('chennai'), verifiedOn: V, activitySignal: 'event-flo checked 26 Aug 2026' },
  }),
  c({
    slug: 'corso-chennai', name: 'CORSO', category: 'running', city: 'Chennai', tagline: 'Sunday 3K on the beachfront — the easy one.',
    description: 'Short Sunday 3 km beachfront runs; good first run club.', tags: ['sunday', '3k', 'beginner-friendly', 'beach'], meets: { cadence: 'weekly', summary: 'Sundays' },
    audience: { gender: 'all', ageNote: null, level: 'beginner' }, join: { url: 'https://instagram.com/_corsoclub', platform: 'instagram', cta: 'Follow on Instagram' }, links: { instagram: 'https://instagram.com/_corsoclub' },
    source: { url: EF('chennai'), verifiedOn: V, activitySignal: 'event-flo checked 26 Aug 2026' },
  }),
  endorfinOnly('cloka-club-chennai', 'Cloka Club', 'Chennai', '18.2K', EN('chennai'), { links: { instagram: ig('cloka.in'), website: EN('chennai') }, join: { url: ig('cloka.in'), platform: 'instagram', cta: 'Follow on Instagram' } }),
  reads('bessy-reads', 'Bessy Reads', 'Chennai', 'Besant Nagar Beach', 'Sundays 6 – 9am', null, LBB_CHE_READS, 'LBB silent-reading round-up; no handle published', { lat: 13.0, lng: 80.27 }, { status: 'unverified' }),
  reads('chennai-reads', 'Chennai Reads', 'Chennai', 'Gandhi Mandapam', 'Sundays 4 – 6pm', null, LBB_CHE_READS, 'LBB silent-reading round-up; no handle published', { lat: 13.01, lng: 80.24 }, { status: 'unverified' }),
  reads('madras-reads', 'Madras Reads', 'Chennai', null, null, null, READS, 'Listed on reads.city 14 Nov 2026', undefined, { status: 'unverified', join: { url: 'https://reads.city/chennai/madras-reads', platform: 'website', cta: 'Open on reads.city' } }),
  reads('tower-reads-chennai', 'Tower Reads', 'Chennai', null, 'Saturday mornings', null, 'https://www.dtnext.in/news/chennai/reading-between-the-lines', 'DT Next, 27 Jul 2026; reads.city listing', undefined, { join: { url: 'https://reads.city/chennai/tower-reads', platform: 'website', cta: 'Open on reads.city' } }),
  c({
    slug: 'the-quiet-chapter-chennai', name: 'The Quiet Chapter', category: 'books', city: 'Chennai', tagline: 'Two silent hours every Sunday. No fees, just bring a book.',
    description: 'Sunday silent-reading sessions, two hours, no shared title and no membership fee.', tags: ['silent reading', 'sunday', 'free'], meets: { cadence: 'weekly', summary: 'Sundays, 2 hours' }, pricing: { type: 'free', note: null },
    join: { url: 'https://www.instagram.com/the.quiet.chapter/', platform: 'instagram', cta: 'Follow on Instagram' }, links: { instagram: 'https://www.instagram.com/the.quiet.chapter/' },
    source: { url: 'https://www.dtnext.in/news/chennai/reading-between-the-lines', verifiedOn: V, activitySignal: 'DT Next, 27 Jul 2026; The Better India Apr 2026' },
  }),
  c({
    slug: 'chennai-trekking-club', name: 'Chennai Trekking Club (CTC)', category: 'outdoors', city: 'Chennai', tagline: 'Weekend treks, cycling, cleanups — 40,000+ members.',
    description: 'Volunteer-run outdoor community: weekend treks, cycling, camping and cleanup drives. One of India’s largest.', tags: ['trekking', 'weekend', 'volunteering', 'beginner-friendly'],
    meets: { cadence: 'weekly', summary: 'Weekends' }, size: { bucket: '1000+', note: '40,000+ per LBB' },
    join: { url: 'https://chennaitrekkers.org', platform: 'website', cta: 'Open their website' }, links: { website: 'https://chennaitrekkers.org' },
    source: { url: LBB_CHE_HOBBY, verifiedOn: V, activitySignal: 'LBB hobby-clubs round-up; site not opened' }, status: 'unverified',
  }),
  c({
    slug: 'wccg-chennai-cyclists', name: 'WCCG — Chennai Cyclists', category: 'cycling', city: 'Chennai', tagline: 'Weekend rides from chapters across Chennai.',
    description: 'We Chennai Cycling Group: almost every weekend, rides from neighbourhood chapters (Marina, Anna Nagar, OMR, Porur and more).', tags: ['cycling', 'weekend', 'chapters'],
    meets: { cadence: 'weekly', summary: 'Almost every weekend' }, join: { url: 'https://chennaicyclists.com/', platform: 'website', cta: 'Open their website' }, links: { website: 'https://chennaicyclists.com/' },
    source: { url: LBB_CHE_HOBBY, verifiedOn: V, activitySignal: 'LBB hobby-clubs round-up; omobikes lists 20 chapters' }, status: 'unverified',
  }),
  c({
    slug: 'quiz-foundation-of-india-chennai', name: 'Quiz Foundation of India — Chennai', category: 'games', city: 'Chennai', tagline: 'Fortnightly quizzes in Mylapore.',
    description: 'Fortnightly open quizzes in Mylapore run by QFI.', tags: ['quiz', 'fortnightly', 'mylapore'], area: 'Mylapore', location: at(13.03, 80.27, 'Mylapore'),
    meets: { cadence: 'fortnightly', summary: 'Fortnightly' }, pricing: { type: 'membership', note: 'Minimal optional membership' },
    join: { url: 'https://quizfoundation.com', platform: 'website', cta: 'Open their website' }, links: { website: 'https://quizfoundation.com' },
    source: { url: LBB_CHE_HOBBY, verifiedOn: V, activitySignal: 'LBB hobby-clubs round-up' }, status: 'unverified',
  }),
  c({
    slug: 'chennai-weekend-artists', name: 'Chennai Weekend Artists', category: 'creative', city: 'Chennai', tagline: 'Sunday on-location sketching.',
    description: 'Sunday sketching meetups on location around Chennai.', tags: ['sketching', 'sunday', 'beginner-friendly'], meets: { cadence: 'weekly', summary: 'Sundays' },
    join: { url: 'https://www.facebook.com/ChennaiWeekendArtists', platform: 'other', cta: 'Open Facebook page' }, links: { facebook: 'https://www.facebook.com/ChennaiWeekendArtists' },
    source: { url: LBB_CHE_HOBBY, verifiedOn: V, activitySignal: 'LBB hobby-clubs round-up' }, status: 'unverified',
  }),
  meetup('technexus-community-chennai', 'TechNexus Community', 'Chennai', 'tech', 'AI & tech meetups, 20K members.', 'https://www.meetup.com/technexus-community/', 'Nexus AI Exchange, Sat 28 Nov 2026', { size: { bucket: '1000+', note: '20,301 members on Meetup' } }),
  meetup('chennaipy', 'Chennaipy', 'Chennai', 'tech', 'Chennai’s Python user group, monthly Saturday meetups.', 'https://www.meetup.com/chennaipy/', 'November meetup, Sat 28 Nov 2026', { tags: ['python', 'monthly', 'free'], meets: { cadence: 'monthly', summary: 'Monthly, Saturdays' }, pricing: { type: 'free', note: null } }),
  meetup('grafana-and-friends-chennai', 'Grafana & Friends Chennai', 'Chennai', 'tech', 'Observability meetup, 1.5K members.', 'https://www.meetup.com/grafana-and-friends-chennai/', 'In-person meetup Sat 21 Nov 2026', { size: { bucket: '1000+', note: '1,539 members on Meetup' } }),
  meetup('gpen-chennai', 'Global Platform Engineers Network (GPEN)', 'Chennai', 'tech', 'Cloud & platform engineering talks.', 'https://www.meetup.com/global-platform-engineers-network-gpen/', 'The Autonomous Cloud Era, Sat 21 Nov 2026', { size: { bucket: '1000+', note: '2,240 members on Meetup' } }),
  meetup('makers-tribe-chennai', 'Makers Tribe', 'Chennai', 'professional', 'Freelancers and indie creators — workshops and meetups.', 'https://www.meetup.com/makers-tribe/', 'Freelance Blueprint, Sat 28 Nov 2026', { tags: ['freelancing', 'creators'] }),

  // ───────────────────────── KOLKATA ─────────────────────────────────────
  c({
    slug: 'calcutta-run-club', name: 'Calcutta Run Club', category: 'running', city: 'Kolkata', tagline: 'Saturday 6:30am 5K at Rabindra Sarovar. 14K members.',
    description: 'Saturday-morning 5 km runs from Rabindra Sarovar; two runs a month plus events.', tags: ['saturday', '5k', 'rabindra sarovar', 'beginner-friendly'],
    area: 'Rabindra Sarovar', location: at(22.51, 88.36, 'Rabindra Sarovar'), meets: { cadence: 'fortnightly', summary: 'Saturdays 6:30am (2 runs/month)' }, size: { bucket: '1000+', note: '14.3K members on endorfin.run' },
    join: { url: 'https://calcuttarun.club/', platform: 'website', cta: 'Open their website' }, links: { website: 'https://calcuttarun.club/' },
    source: { url: EF('kolkata'), verifiedOn: V, activitySignal: 'event-flo Kolkata checked 25 Sept 2026' }, featured: true,
  }),
  c({
    slug: 'runraw-kolkata', name: 'Runraw', category: 'running', city: 'Kolkata', tagline: 'Sunday 5–7K at Eco Park or Lake Gardens.',
    description: 'Sunday runs of 5–7 km alternating between Eco Park (New Town) and Lake Gardens.', tags: ['sunday', 'eco park', 'new town'], meets: { cadence: 'weekly', summary: 'Sundays' },
    size: { bucket: '1000+', note: '4.4K members on endorfin.run' }, join: { url: ig('runrawclub'), platform: 'instagram', cta: 'Follow on Instagram' }, links: { instagram: ig('runrawclub') },
    source: { url: EF('kolkata'), verifiedOn: V, activitySignal: 'event-flo Kolkata checked 25 Sept 2026' },
  }),
  c({
    slug: '365-represent-kolkata', name: '365 Represent', category: 'running', city: 'Kolkata', tagline: 'Sunday 5:30am, Rabindra Sarovar or Elliot Park.',
    description: 'Early Sunday runs from Rabindra Sarovar or Elliot Park.', tags: ['sunday', 'early morning'], meets: { cadence: 'weekly', summary: 'Sundays 5:30am' }, size: { bucket: '1000+', note: '1.1K members on endorfin.run' },
    join: { url: ig('365represent'), platform: 'instagram', cta: 'Follow on Instagram' }, links: { instagram: ig('365represent') },
    source: { url: EF('kolkata'), verifiedOn: V, activitySignal: 'event-flo Kolkata checked 25 Sept 2026' },
  }),
  c({
    slug: 'newtown-runners-kolkata', name: 'Newtown Runners', category: 'running', city: 'Kolkata', tagline: 'New Town’s neighbourhood run group.', description: 'Run group based in New Town, Kolkata.', tags: ['new town', 'run club'],
    area: 'New Town', location: at(22.58, 88.47, 'New Town'), join: { url: ig('newtown_runners_kolkata'), platform: 'instagram', cta: 'Follow on Instagram' }, links: { instagram: ig('newtown_runners_kolkata') },
    source: { url: EF('kolkata'), verifiedOn: V, activitySignal: 'event-flo Kolkata checked 25 Sept 2026' },
  }),
  reads('kolkata-reads', 'Kolkata Reads', 'Kolkata', 'Rabindra Sarovar', 'Sundays from 9:30am', 'kolkatareads', BCP_KOL, 'Bombay Circle Press, 3 Jul 2026', { lat: 22.51, lng: 88.36 }, { featured: true }),
  c({
    slug: 'kolkata-bookworms', name: 'Kolkata Bookworms', category: 'books', city: 'Kolkata', tagline: 'Book club with events at Storyteller Bookstore.', description: 'Kolkata book club; recent meetups at Storyteller Bookstore.', tags: ['book club'],
    join: { url: ig('kolkatabookworms'), platform: 'instagram', cta: 'Follow on Instagram' }, links: { instagram: ig('kolkatabookworms') },
    source: { url: BCP_KOL, verifiedOn: V, activitySignal: 'Bombay Circle Press, 3 Jul 2026' },
  }),
  c({
    slug: 'the-kolkata-book-club', name: 'The Kolkata Book Club', category: 'books', city: 'Kolkata', tagline: 'Weekly tea-and-books meetups.', description: 'Weekly book meetups over tea.', tags: ['book club', 'weekly'], meets: { cadence: 'weekly', summary: 'Weekly' },
    join: { url: ig('thekolkatabookclub'), platform: 'instagram', cta: 'Follow on Instagram' }, links: { instagram: ig('thekolkatabookclub') },
    source: { url: BCP_KOL, verifiedOn: V, activitySignal: 'Bombay Circle Press, 3 Jul 2026' },
  }),
  meetup('kolkata-wordpress-meetup', 'Kolkata WordPress Meetup', 'Kolkata', 'tech', 'Monthly WordPress & web meetup, 2.1K members.', 'https://www.meetup.com/KolkataWordPressMeetups/', 'November meetup Sat 28 Nov 2026', { size: { bucket: '1000+', note: '2,165 members on Meetup' }, meets: { cadence: 'monthly', summary: 'Monthly' } }),
  meetup('gsc-kolkata', 'GSC Kolkata — Global Startups Club', 'Kolkata', 'startup', 'Startup networking, 2.1K members.', 'https://www.meetup.com/kolkata-startups-and-business-meetups/', 'Startup Networking Kolkata, Sat 28 Nov 2026', { size: { bucket: '1000+', note: '2,123 members on Meetup' } }),
  meetup('kolkata-salsa-meetup', 'Kolkata Salsa Meetup', 'Kolkata', 'social', 'Hot Latin Thursdays — salsa social night.', 'https://www.meetup.com/kolkata-salsa-meetup/', 'Hot Latin Thursday, 19 Nov 2026', { tags: ['salsa', 'dance social', 'thursday', 'beginner-friendly'], meets: { cadence: 'weekly', summary: 'Thursdays 7pm' } }),
  meetup('afterthat-events-kolkata', 'AfterThat Events — Kolkata', 'Kolkata', 'social', 'Meet-strangers socials on Saturdays.', 'https://www.meetup.com/afterthatevents/', 'Meet Strangers in Kolkata, Sat 28 Nov 2026', { tags: ['new in town', 'saturday'] }),
  c({
    slug: 'discover-on-wheels-kolkata', name: 'Discover on Wheels', category: 'cycling', city: 'Kolkata', tagline: 'Sunday group rides and cycling events.', description: 'Kolkata cycling community with Sunday group rides, events and school workshops.', tags: ['cycling', 'sunday', 'group rides'],
    meets: { cadence: 'weekly', summary: 'Sunday rides' }, join: { url: 'https://www.facebook.com/groups/discoveronwheels', platform: 'other', cta: 'Open Facebook group' }, links: { facebook: 'https://www.facebook.com/groups/discoveronwheels' },
    source: { url: UNV, verifiedOn: V, activitySignal: 'Unventured + omobikes directories' }, status: 'unverified',
  }),

  // ───────────────────────── AHMEDABAD / GUJARAT ────────────────────────
  c({
    slug: 'run-and-roast-ahmedabad', name: 'Run & Roast', category: 'running', city: 'Ahmedabad', tagline: 'Weekend 6:30am 1–5K social runs, then coffee. Free. 17K members.',
    description: 'Weekend social runs (1–5 km) across Ahmedabad and Gandhinagar; meet 6:30am, start 6:50, roast after. Free.', tags: ['weekend', 'coffee', 'beginner-friendly', 'free', '5k'],
    meets: { cadence: 'weekly', summary: 'Weekends 6:30am meet' }, pricing: { type: 'free', note: null }, audience: { gender: 'all', ageNote: null, level: 'beginner' }, size: { bucket: '1000+', note: '17.0K members on endorfin.run' },
    join: { url: 'https://runandroast.in/', platform: 'website', cta: 'RSVP on their site' }, links: { website: 'https://runandroast.in/' },
    source: { url: EF('ahmedabad'), verifiedOn: V, activitySignal: 'event-flo Ahmedabad checked 26 Aug 2026' }, featured: true,
  }),
  c({
    slug: 'run-crew-ahmedabad', name: 'Run Crew', category: 'running', city: 'Ahmedabad', tagline: '6am runs, 12K members.', description: 'Early-morning social runs in Ahmedabad; details on Instagram.', tags: ['early morning', 'run club'],
    size: { bucket: '1000+', note: '11.9K members on endorfin.run' }, join: { url: ig('runcrew.in'), platform: 'instagram', cta: 'Follow on Instagram' }, links: { instagram: ig('runcrew.in') },
    source: { url: EF('ahmedabad'), verifiedOn: V, activitySignal: 'event-flo checked 26 Aug 2026' },
  }),
  c({
    slug: 'brews-and-shoes-run-club', name: 'Brews & Shoes Run Club', category: 'running', city: 'Ahmedabad', tagline: 'Sunday runs that end at a café.', description: 'Sunday run club; time posted per run on Instagram.', tags: ['sunday', 'coffee'], meets: { cadence: 'weekly', summary: 'Sundays' },
    join: { url: ig('brewsandshoesrunclub'), platform: 'instagram', cta: 'Follow on Instagram' }, links: { instagram: ig('brewsandshoesrunclub') },
    source: { url: EF('ahmedabad'), verifiedOn: V, activitySignal: 'event-flo checked 26 Aug 2026' },
  }),
  c({
    slug: 'riverfront-run-club-ahmedabad', name: 'Riverfront Run Club', category: 'running', city: 'Ahmedabad', tagline: 'Sabarmati Riverfront runs, on Strava.', description: 'Run club on the Sabarmati Riverfront, organised through a Strava club.', tags: ['riverfront', 'strava'],
    area: 'Sabarmati Riverfront', location: at(23.03, 72.57, 'Sabarmati Riverfront'), join: { url: 'https://www.strava.com/clubs/294023', platform: 'strava', cta: 'Join on Strava' }, links: { strava: 'https://www.strava.com/clubs/294023' },
    source: { url: EF('ahmedabad'), verifiedOn: V, activitySignal: 'event-flo checked 26 Aug 2026' },
  }),
  reads('ahmedabad-reads', 'Ahmedabad Reads', 'Ahmedabad', 'Parimal Garden', 'Weekend mornings ~7:30 – 10:30am', 'ahmedabadreads', 'https://www.knocksense.com/ahmedabad/discover-the-joy-of-reading-together-join-ahmedabad-reads-a-silent-reading-community', 'Knocksense Jan 2024; reads.city lists Ahmedabad live', { lat: 23.02, lng: 72.55 }, { status: 'unverified' }),
  meetup('echai-ahmedabad-startup-network', 'eChai Ahmedabad Startup Network', 'Ahmedabad', 'startup', 'Founder meetups and demo days, 9.7K members.', 'https://www.meetup.com/startupahmedabad/', 'Demo Day 29 Oct 2026 (last listed)', { size: { bucket: '1000+', note: '9,718 members on Meetup' }, status: 'unverified' }),
  meetup('ahmedabad-wordpress-meetup', 'Ahmedabad WordPress Meetup', 'Ahmedabad', 'tech', 'WordPress & web community, 5.9K members.', 'https://www.meetup.com/ahmedabad-wp-meetup/', 'Listed among popular groups; no dated event', { size: { bucket: '1000+', note: '5,920 members on Meetup' }, status: 'unverified' }),
  endorfinOnly('aavjo-ahmedabad', 'AAVJO', 'Ahmedabad', '1.0K', EN('ahmedabad')),
  endorfinOnly('hydra-run-club-surat', 'Hydra.Run.Club', 'Surat', '1.7K', EN_ALL),
  endorfinOnly('frc-surat', 'FRC Surat', 'Surat', '1.6K', EN_ALL),
  endorfinOnly('awaken-circle-surat', 'Awaken Circle', 'Surat', '20.0K', EN_ALL),
  endorfinOnly('open-road-run-club-vadodara', 'Open Road Run Club', 'Vadodara', '1.6K', EN_ALL),
  endorfinOnly('coffee-run-vadodara', 'Coffee.Run.', 'Vadodara', '1.3K', EN_ALL),

  // ───────────────────────── CHANDIGARH / NORTH ─────────────────────────
  c({
    slug: 'chandigarh-cycling-club', name: 'Chandigarh Cycling Club', category: 'cycling', city: 'Chandigarh', tagline: 'City, MTB and social rides around the tricity.',
    description: 'Chandigarh’s cycling community: city rides, MTB and social rides. Organised through a Facebook group.', tags: ['cycling', 'mtb', 'group rides'],
    join: { url: 'https://www.facebook.com/groups/ChandigarhCyclingClub', platform: 'other', cta: 'Open Facebook group' }, links: { facebook: 'https://www.facebook.com/groups/ChandigarhCyclingClub' },
    source: { url: UNV, verifiedOn: V, activitySignal: 'Unventured directory (updated Apr 2024)' }, status: 'unverified',
  }),
  endorfinOnly('oye-runner-mohali', 'Oye Runner', 'Chandigarh', '440', EN_ALL, { area: 'Mohali' }),
  endorfinOnly('dkarve-run-club-ludhiana', 'D’KARVE Run Club', 'Ludhiana', '602', EN_ALL),
  endorfinOnly('zen-run-dehradun', 'Zen Run', 'Dehradun', '11.4K', EN_ALL),
  endorfinOnly('hillusion-run-club-dehradun', 'Hillusion Run Club', 'Dehradun', '403', EN_ALL),
  endorfinOnly('og-run-club-rohtak', 'OG Run Club', 'Rohtak', '2.4K', EN_ALL),
  endorfinOnly('social-run-club-kanpur', 'Social Run Club Kanpur', 'Kanpur', '4.4K', EN_ALL),
  c({
    slug: 'lucknow-cycling-club', name: 'Lucknow Cycling Club', category: 'cycling', city: 'Lucknow', tagline: 'Lucknow’s cycling group.', description: 'Community cycling group in Lucknow listed on the omobikes rides directory; contact via the directory.', tags: ['cycling'],
    join: { url: OMO, platform: 'other', cta: 'See directory listing' }, links: {}, source: { url: OMO, verifiedOn: V, activitySignal: 'omobikes directory; no dated ride seen' }, status: 'unverified',
  }),

  // ───────────────────────── CENTRAL / WEST ─────────────────────────────
  endorfinOnly('aura-run-club-indore', 'Aura Run Club', 'Indore', '138', EN_ALL),
  endorfinOnly('gen-run-club-bhopal', 'Gen Run Club', 'Bhopal', '14.6K', EN_ALL),
  endorfinOnly('raftaar-run-club-nagpur', 'Raftaar Run Club', 'Nagpur', '10.9K', EN_ALL),
  endorfinOnly('daud-le-run-club-nagpur', 'DAUD LE RUN CLUB', 'Nagpur', '2.6K', EN_ALL),
  endorfinOnly('anabolic-club-nashik', 'Anabolic Club', 'Nashik', '6.5K', EN_ALL),
  endorfinOnly('dare-to-be-more-nashik', 'Dare To Be More', 'Nashik', '2.8K', EN_ALL),
  endorfinOnly('7am-club-raipur', '7AM Club', 'Raipur', '20.2K', EN_ALL),
  endorfinOnly('the-pace-project-goa', 'The Pace Project Goa', 'Goa', '1.5K', EN_ALL),
  c({
    slug: 'goa-cycling-club', name: 'Goa Cycling Club', category: 'cycling', city: 'Goa', tagline: 'Off-road and tarmac club rides across Goa.', description: 'Regular club rides, off-road and road, organised through a Facebook group.', tags: ['cycling', 'mtb', 'group rides'],
    join: { url: 'https://www.facebook.com/groups/69707669104', platform: 'other', cta: 'Open Facebook group' }, links: { facebook: 'https://www.facebook.com/groups/69707669104' },
    source: { url: UNV, verifiedOn: V, activitySignal: 'Unventured directory (updated Apr 2024)' }, status: 'unverified',
  }),
  endorfinOnly('gwalior-run-club', 'Gwalior Run Club (GRC)', 'Gwalior', '3.0K', EN_ALL),
  endorfinOnly('bikaner-run-club', 'Bikaner Run Club', 'Bikaner', '9.5K', EN_ALL),

  // ───────────────────────── SOUTH ───────────────────────────────────────
  reads('kochi-reads', 'Kochi Reads', 'Kochi', 'Panampilly Nagar Central Park', 'Weekly, 3:30 – 6pm', 'kochireads', 'https://thesouthfirst.com/featured/tranquil-weekends-at-panampilly-park-book-lovers-haven/', 'South First Aug 2023; reads.city lists Kochi Reads live 14 Nov 2026', { lat: 9.96, lng: 76.3 }),
  c({
    slug: 'kochi-book-reading-club', name: 'Kochi Book Reading Club', category: 'books', city: 'Kochi', tagline: 'Saturday 4:30pm reading + 20-minute discussion, Panampilly park.',
    description: 'Saturday silent reading at Panampilly Nagar Central Park with a short discussion at the end.', tags: ['silent reading', 'saturday', 'free', 'discussion'], area: 'Panampilly Nagar', location: at(9.96, 76.3, 'Panampilly Nagar Central Park'),
    meets: { cadence: 'weekly', summary: 'Saturdays 4:30 – 6:30pm' }, pricing: { type: 'free', note: null }, size: { bucket: '<50', note: '~25–35 per session per South First' },
    join: { url: ig('kochibookreadingclub'), platform: 'instagram', cta: 'Follow on Instagram' }, links: { instagram: ig('kochibookreadingclub') },
    source: { url: 'https://thesouthfirst.com/featured/tranquil-weekends-at-panampilly-park-book-lovers-haven/', verifiedOn: V, activitySignal: 'South First, 28 Aug 2023' }, status: 'unverified',
  }),
  endorfinOnly('dawnage-run-club-kochi', 'Dawnage Run Club', 'Kochi', '10.1K', EN_ALL),
  endorfinOnly('soles-of-cochin', 'SOLES of COCHIN', 'Kochi', '6.0K', EN_ALL),
  endorfinOnly('kochi-run-club', 'Kochi Run Club', 'Kochi', '1.4K', EN_ALL),
  endorfinOnly('brew-burn-run-club-calicut', 'Brew Burn Run Club', 'Kozhikode', '4.5K', EN_ALL),
  endorfinOnly('paceher-run-club-coimbatore', 'paceHer Run Club', 'Coimbatore', '7.5K', EN_ALL, { audience: { gender: 'women', ageNote: null, level: 'all' }, tags: ['run club', 'women-only'] }),
  endorfinOnly('crc-coimbatore', 'CRC Coimbatore', 'Coimbatore', '2.4K', EN_ALL),
  endorfinOnly('tez-run-club-coimbatore', 'Tez Run Club', 'Coimbatore', '1.5K', EN_ALL),
  c({
    slug: 'unventured-weekend-rides-mysuru', name: 'Unventured Weekend Rides — Mysuru', category: 'cycling', city: 'Mysuru', tagline: 'Open WhatsApp group for 30–100 km weekend rides.', description: 'Weekend group rides from 30 to 100 km around Mysuru, coordinated in an open WhatsApp group.', tags: ['cycling', 'weekend', 'long rides'],
    join: { url: 'https://chat.whatsapp.com/B8KDqpMbdtk8kNfpsoQzGF', platform: 'whatsapp', cta: 'Join WhatsApp group' }, links: {}, source: { url: UNV, verifiedOn: V, activitySignal: 'Unventured (updated Apr 2024)' }, status: 'unverified',
  }),
  endorfinOnly('the-cyc-o-club-vijayawada', 'THE CYC ’O’ CLUB', 'Visakhapatnam', '901', EN_ALL, { city: 'Visakhapatnam', tagline: 'Andhra run club on endorfin (listed as Vijayawada).' }),

  // ───────────────────────── EAST / NORTH-EAST ──────────────────────────
  endorfinOnly('before-anything-else-bhubaneswar', 'Before Anything Else', 'Bhubaneswar', '5.7K', EN_ALL),
  endorfinOnly('gym-girls-club-guwahati', 'Gym Girls Club', 'Guwahati', '29.4K', EN_ALL, { category: 'fitness', audience: { gender: 'women', ageNote: null, level: 'all' }, tags: ['women-only', 'lifting', 'gym'], tagline: '“India’s first women-only lifting community” — 29K members.' }),
  endorfinOnly('roadkin-running-club-guwahati', 'ROADKIN Running Club', 'Guwahati', '5.3K', EN_ALL),
  endorfinOnly('onlyruns-patna', 'OnlyRuns — The Run Club, Patna', 'Patna', '7.0K', EN_ALL),

  // ───────────────────────── MORE MUMBAI / BENGALURU / JAIPUR ───────────
  reads('bandra-reads', 'Bandra Reads', 'Mumbai', null, null, null, READS, 'Listed on reads.city 14 Nov 2026', undefined, { status: 'unverified', join: { url: 'https://reads.city/mumbai/bandra-reads', platform: 'website', cta: 'Open on reads.city' }, area: 'Bandra', location: at(19.06, 72.83, 'Bandra') }),
  reads('lower-parel-reads', 'Lower Parel Reads', 'Mumbai', null, null, null, READS, 'Listed on reads.city 14 Nov 2026', undefined, { status: 'unverified', join: { url: 'https://reads.city/mumbai/lower-parel-reads', platform: 'website', cta: 'Open on reads.city' }, area: 'Lower Parel', location: at(19.0, 72.83, 'Lower Parel') }),
  reads('hsr-reads', 'HSR Reads', 'Bengaluru', null, null, null, READS, 'Listed on reads.city 14 Nov 2026', undefined, { status: 'unverified', join: { url: 'https://reads.city/bengaluru/hsr-reads', platform: 'website', cta: 'Open on reads.city' }, area: 'HSR Layout', location: at(12.91, 77.64, 'HSR Layout') }),
  reads('koramangala-reads', 'Koramangala Reads', 'Bengaluru', null, null, null, READS, 'Listed on reads.city 14 Nov 2026', undefined, { status: 'unverified', join: { url: 'https://reads.city/bengaluru/koramangala-reads', platform: 'website', cta: 'Open on reads.city' }, area: 'Koramangala', location: at(12.93, 77.62, 'Koramangala') }),
  c({
    slug: 'mumbai-cycling-enthusiasts', name: 'Mumbai Cycling Enthusiasts', category: 'cycling', city: 'Mumbai', tagline: '18K-member cycling community — rides, routes, events.', description: 'Large Facebook-based cycling community for Mumbai: ride announcements, routes and events.', tags: ['cycling', 'group rides'],
    size: { bucket: '1000+', note: '18k+ per Unventured' }, join: { url: 'https://www.facebook.com/groups/mumbaicyclists', platform: 'other', cta: 'Open Facebook group' }, links: { facebook: 'https://www.facebook.com/groups/mumbaicyclists' },
    source: { url: UNV, verifiedOn: V, activitySignal: 'Unventured (updated Apr 2024)' }, status: 'unverified',
  }),
  c({
    slug: 'unventured-weekend-rides-bengaluru', name: 'Unventured Weekend Rides — Bengaluru', category: 'cycling', city: 'Bengaluru', tagline: 'Open WhatsApp group for 30–100 km weekend rides.', description: 'Weekend group rides from 30 to 100 km around Bengaluru, coordinated in an open WhatsApp group.', tags: ['cycling', 'weekend', 'long rides'],
    join: { url: 'https://chat.whatsapp.com/HQfXGqlYlVh2yhes8AVbI0', platform: 'whatsapp', cta: 'Join WhatsApp group' }, links: {}, source: { url: UNV, verifiedOn: V, activitySignal: 'Unventured (updated Apr 2024)' }, status: 'unverified',
  }),
  c({
    slug: 'rajasthan-road-riders-jaipur', name: 'Rajasthan Road Riders', category: 'cycling', city: 'Jaipur', tagline: 'Jaipur road-cycling crew.', description: 'Road cycling group in Jaipur; rides announced on Instagram.', tags: ['cycling', 'road'],
    join: { url: ig('teamrajasthanroadriders'), platform: 'instagram', cta: 'Follow on Instagram' }, links: { instagram: ig('teamrajasthanroadriders') }, source: { url: OMO, verifiedOn: V, activitySignal: 'omobikes directory' }, status: 'unverified',
  }),
];
