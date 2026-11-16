// ============================================================
// data/communities-updates.ts — Firecrawl verification pass, 15 Nov 2026.
//
// Overrides applied on top of the seed rows (lib/communities applies
// them). Kept as a separate layer so the review diff shows exactly what
// the scrape changed; maps 1:1 to a future `community_verifications`
// table. Evidence for every line: research/firecrawl-verify-2026-11-15.md
//
// Rule used: last public post within ~90 days → approved. Older → stays
// unverified. Dead (>12 months) or wrong match → removed.
// ============================================================
import type { Community } from './communities';

export const VERIFIED_ON = '2026-11-15';

type Patch = Omit<Partial<Community>, 'source'> & { activitySignal: string };

const p = (activitySignal: string, rest: Omit<Patch, 'activitySignal'> = {}): Patch => ({ activitySignal, status: 'approved', ...rest });

export const UPDATES: Record<string, Patch> = {
  'gurgaon-reads': p('Edition 37 posted 4 Nov 2026 on Instagram', {
    description: 'Gurgaon’s silent-reading meetup, now indoors: Sundays 11:30am at Chapters Bookstore, Unitech Cyber Park. Bring any book, read alongside strangers, chat after if you like. Free, no sign-up. Edition 37 was on 4 Nov 2026.',
    tags: ['silent reading', 'sunday', 'free', 'beginner-friendly', 'bookstore'], location: { lat: 28.4416, lng: 77.0563, label: 'Unitech Cyber Park, Sector 39', precision: 'area' },
    area: 'Unitech Cyber Park', tagline: 'Silent reading together — Sunday late mornings at Chapters Bookstore.',
    meets: { cadence: 'weekly', summary: 'Sundays 11:30am at Chapters Bookstore, Unitech Cyber Park' },
  }),
  'camellia-artisanal': p('Instagram post 15 Nov 2026', { tagline: 'Artisanal food experiences — mostly Kolkata pop-ups now, with Delhi NCR delivery.' }),
  'run-with-me-club': p('Instagram post 9 Nov 2026 (Trail Running Series)', { tags: ['trail running', 'Bandhwari', 'Mangar', 'Panikot'] }),
  'sere-supper-club': p('Instagram post 6 Oct 2026 — bio says “on a break till Jan”', {
    meets: { cadence: 'irregular', summary: 'Supper clubs in Gurgaon & Chandigarh — on a break till January' },
  }),
  'unmukt-open-mic': p('Instagram post 14 Nov 2026 announcing the 21 Nov Delhi open mic'),
  'pages-of-panvel': p('Instagram post 24 Oct 2026', {
    meets: { cadence: 'weekly', summary: 'Sundays 4:30–6:30pm' },
    join: { url: 'https://forms.gle/1DpWvJhAysYdfiSUA', platform: 'other', cta: 'Fill the join form' },
  }),
  'urban-sketchers-bengaluru': p('Instagram post 15 Nov 2026', { meets: { cadence: 'weekly', summary: 'Saturday-morning sketchmeets, rotating venue' } }),
  'joshh-run-club': p('Instagram post 14 Nov 2026 (Heritage Runs)'),
  'the-jaipur-book-club': p('Instagram post 27 Oct 2026', { meets: { cadence: 'monthly', summary: 'Monthly meetups + author-interview series' } }),
  'the-jaipur-hiking-club': p('Instagram post 13 Nov 2026', {
    pricing: { type: 'paid', note: 'Registered trip operator — hikes, camping and trips are priced per trip' },
    size: { bucket: '1000+', note: 'Instagram bio claims 10,000+ members' },
    join: { url: 'https://chat.whatsapp.com/GK2ZtETrdDD7mIZtLx6xip', platform: 'whatsapp', cta: 'Join WhatsApp group' },
  }),
  'pink-city-runners': p('Instagram post 14 Nov 2026 (Rise and Run programme)', {
    pricing: { type: 'membership', note: 'Paid membership; “Rise and Run” beginner programme' },
    links: { facebook: 'https://www.facebook.com/groups/519429341780302' },
  }),
  'board-game-meetups-pune': p('Meetup posted 24 Oct 2026 on Instagram', {
    join: { url: 'https://chat.whatsapp.com/L9OtJbu4L0b6JiBOVugqF1', platform: 'whatsapp', cta: 'Join WhatsApp group' },
    tags: ['board games', 'beginner-friendly', 'solo-friendly'],
  }),
  'meet-by-fate-pune': p('Instagram post 16 Oct 2026', {
    pricing: { type: 'pay-per-event', note: 'Ticket per meetup' },
    join: { url: 'https://linktr.ee/Meet_By_Fate', platform: 'other', cta: 'See upcoming meetups' },
  }),
  'bookoholics-book-club-pune': p('Instagram post 31 Oct 2026', { mode: 'hybrid', meets: { cadence: 'monthly', summary: 'Monthly reading challenges online; occasional in-person meets' } }),
  'the-bikerni-pune': p('Breakfast ride posted 14 Nov 2026', { audience: { gender: 'women', ageNote: null, level: 'all' } }),
  'friends-of-figma-pune': p('Social Club event 14 Nov 2026', { pricing: { type: 'free', note: null } }),
  'pune-heritage-walks': p('Instagram post 11 Nov 2026', {
    pricing: { type: 'paid', note: 'Ticketed walks by Deccan Drifts' },
    join: { url: 'https://chat.whatsapp.com/KcbEBRtk9Ah2h00EebtSIP', platform: 'whatsapp', cta: 'Join WhatsApp group' },
  }),
  'urban-sketchers-hyderabad': p('Sketchmeet #394 posted Oct 2026', {
    join: { url: 'https://forms.gle/1MoS3sDcPBEDoVYw6', platform: 'other', cta: 'Fill the join form' },
  }),
  'kochi-book-reading-club': p('181st edition posted 15 Nov 2026', {
    area: 'Panampilly Nagar', meets: { cadence: 'weekly', summary: 'Saturdays 5pm at Granthapura library, Panampilly Nagar' },
  }),
  'rajasthan-road-riders-jaipur': p('Instagram post 9 Oct 2026'),
  'link-and-chill-pune': p('Instagram “No Phone Social Meetup” reminder 14 Nov 2026', {
    category: 'social', tagline: 'Strangers-to-friends meetups, house parties, treks and trips.',
    size: { bucket: '1000+', note: '4,487 members on Meetup (4.7★, 37 reviews)' },
    links: { instagram: 'https://www.instagram.com/linkandchill/', website: 'https://www.linkandchill.com', meetup: 'https://www.meetup.com/link-chill-pune/' },
  }),

  // Still unverified, but facts corrected.
  'step-out': { activitySignal: 'Last Instagram post 15 Mar 2026', status: 'unverified', city: 'Mumbai' },
  'open-mics-by-kasa-kai': { activitySignal: 'Last open-mic post May 2026 (now Mumbai)', status: 'unverified', city: 'Mumbai' },
};

/** Removed after the 15 Nov 2026 pass (dead or wrong match). */
export const REMOVED = new Set([
  'delhi-book-lovers',            // last IG post Jun 2016
  'jaipur-cycling-club',          // last IG post Sep 2025
  'great-hyderabad-adventure-club', // last IG post Aug 2024
  'hyderabad-book-club',          // last IG post Oct 2022
  'cloka-club-chennai',           // @cloka.in is a clothing brand
]);
