// ============================================================
// data/communities-discovered.ts — new listings from the Firecrawl
// discovery pass, 15 Nov 2026 (singles, Gen Z socials, 50+, pickleball,
// men's & women's networks, civic/consumer, online communities).
//
// Same rules as data/communities.ts: every row was opened via Firecrawl
// on 15 Nov 2026; join links are the organiser's own published channel;
// counts/prices only where a public page states them. Rows we could not
// date to the last ~90 days are `unverified`.
// Evidence log: research/firecrawl-discovery-2026-11-15.md
//
// city 'Online' = pan-India / internet-first. These show in every city
// view (lib/communities applyFilters) and carry location: null.
// ============================================================
import { c, ig, wa, type Community } from './communities';

const D = '2026-11-15';
const src = (url: string, activitySignal: string) => ({ url, verifiedOn: D, activitySignal });

const HAPPY = 'https://www.thehappyhour.in/';
const happyHour = (city: string): Community => c({
  slug: `offline-by-happy-hour-${city.toLowerCase()}`, name: 'Offline by Happy Hour', category: 'dating', city,
  tagline: 'Hosted mixers and trips for verified singles. No swiping.',
  description: 'Curated offline events and group trips for singles, run by hosts. Members are verified before attending; events are age-banded. As seen on Shark Tank India. Pick a date and book on their site.',
  tags: ['singles', 'mixers', 'verified', 'trips', 'age-banded'],
  meets: { cadence: 'irregular', summary: 'Multiple city events a month — dates on their site' },
  audience: { gender: 'all', ageNote: 'Events are age-banded', level: 'all' },
  pricing: { type: 'pay-per-event', note: 'Ticketed per event' },
  size: { bucket: '1000+', note: '50K+ verified members (site, Oct 2026)' },
  join: { url: HAPPY, platform: 'website', cta: 'See upcoming events' },
  links: { website: HAPPY },
  source: src(HAPPY, 'Site live with Nov–Dec 2026 city events and 2026 trips'),
  featured: true, createdAt: D,
});

const LS = 'https://www.linktr.ee/letssocialiseapp';
const letsSocialise = (city: string, signal: string): Community => c({
  slug: `lets-socialise-${city.toLowerCase()}`, name: 'Let’s Socialise', category: 'dating', city,
  tagline: 'Meet people, not profiles. Guest-list mixers for singles.',
  description: 'Hosted evenings for singles: request an invite on the app, get accepted, show up. Early-bird pricing doubles on the event date, per their posts.',
  tags: ['singles', 'mixers', 'networking', 'guest list'],
  meets: { cadence: 'irregular', summary: 'City mixers announced on Instagram & the app' },
  pricing: { type: 'pay-per-event', note: 'Early-bird cheaper; price doubles on event day' },
  join: { url: LS, platform: 'other', cta: 'Request an invite' },
  links: { instagram: ig('letssocialiseofficial') },
  source: src(ig('letssocialiseofficial'), signal), createdAt: D,
});

const reddit = (slug: string, name: string, sub: string, city: string, signal: string): Community => c({
  slug, name, category: 'social', city,
  tagline: `r/${sub} — where the city plans meet-ups in public.`,
  description: `Open subreddit. Meet-up posts are written by members, not one organiser — check the latest thread, meet in public places, and use your judgement.`,
  tags: ['reddit', 'meet-ups', 'free', 'online'],
  mode: 'hybrid',
  pricing: { type: 'free', note: null },
  join: { url: `https://www.reddit.com/r/${sub}/`, platform: 'reddit', cta: 'Open subreddit' },
  source: src(`https://www.reddit.com/r/${sub}/`, signal), createdAt: D,
});

export const COMMUNITIES_DISCOVERED: Community[] = [
  // ───────── SINGLES / DATING ─────────
  happyHour('Delhi'), happyHour('Mumbai'), happyHour('Bengaluru'),
  letsSocialise('Bengaluru', 'Mixer announced for 15 Nov 2026; posts daily'),
  letsSocialise('Gurgaon', 'Instagram active 15 Nov 2026'),
  letsSocialise('Mumbai', 'Instagram active 15 Nov 2026'),

  // ───────── GEN Z / STRANGER SOCIALS ─────────
  c({
    slug: 'viral-talkiies-delhi', name: 'Viral Talkiies', category: 'social', city: 'Delhi',
    tagline: 'Delhi’s Gen-Z strangers meetup. Games, clay, sports, Sundays.',
    description: 'Stranger meetups, creative sessions (clay, art) and sports, built for Delhi’s Gen-Z crowd. Sunday plans are posted on Instagram; the WhatsApp group in their bio is how you get in.',
    tags: ['gen z', 'strangers', 'mafia', 'games', 'art', 'sunday'],
    ageBand: 'genz',
    meets: { cadence: 'irregular', summary: 'Mostly Sunday meetups — dates on Instagram' },
    join: { url: wa('F3Hqt9q5l0gKmbxHBHSYKC'), platform: 'whatsapp', cta: 'Join WhatsApp group' },
    links: { instagram: ig('viraltalkiies') },
    size: { bucket: 'unknown', note: '2,552 Instagram followers' },
    source: src(ig('viraltalkiies'), 'Instagram post 13 Nov 2026'), createdAt: D,
  }),
  c({
    slug: 'clock-it-delhi', name: 'Clock It', category: 'social', city: 'Delhi',
    tagline: 'Bar hops, board-game cafés and themed parties for strangers.',
    description: 'Turning strangers into friends: bar crawls, board-game-and-coffee mornings, Diwali and Halloween nights. Also runs in Bangalore. Event sign-ups via the link in their bio.',
    tags: ['bar crawl', 'board games', 'parties', 'strangers'],
    join: { url: 'https://www.beacons.ai/clockit', platform: 'other', cta: 'See upcoming socials' },
    links: { instagram: ig('clockit.delhi') },
    source: src(ig('clockit.delhi'), 'Instagram post 14 Nov 2026'), createdAt: D,
  }),
  c({
    slug: 'marzi-bengaluru', name: 'Marzi', category: 'social', city: 'Bengaluru',
    tagline: 'For the young-spirited 50+. Pickleball, Mahjong, sundowners.',
    description: 'A community for people over 50: pickleball socials (not coaching), beginner Mahjong, singalongs, walks and sundowners. Runs in Bangalore and Mumbai; events listed on marzi.life.',
    tags: ['50+', 'pickleball', 'mahjong', 'sundowner', 'walks'],
    ageBand: '50plus',
    meets: { cadence: 'irregular', summary: 'Several events a month — see marzi.life/events' },
    join: { url: 'https://www.marzi.life/events', platform: 'website', cta: 'See events' },
    links: { instagram: ig('marzibyprimus'), website: 'https://www.marzi.life' },
    size: { bucket: 'unknown', note: '15,746 Instagram followers' },
    source: src(ig('marzimeetups'), 'Instagram posts 11–15 Nov 2026 (Mahjong intro, Mumbai singalong)'), createdAt: D,
  }),
  c({
    slug: 'marzi-mumbai', name: 'Marzi', category: 'social', city: 'Mumbai',
    tagline: 'For the young-spirited 50+. Singalongs, sundowners, Mahjong.',
    description: 'Mumbai chapter of the 50+ community: singalong nights, sundowners and new-format events. Events listed on marzi.life.',
    tags: ['50+', 'singalong', 'sundowner', 'mahjong'],
    ageBand: '50plus',
    join: { url: 'https://www.marzi.life/events', platform: 'website', cta: 'See events' },
    links: { instagram: ig('marzimeetups'), website: 'https://www.marzi.life' },
    source: src(ig('marzimeetups'), 'Mumbai singalong posted 13 Nov 2026'), createdAt: D,
  }),

  // ───────── PICKLEBALL ─────────
  c({
    slug: 'gurugram-pickleball-club', name: 'Gurugram Pickleball Club', category: 'sports', city: 'Gurgaon',
    tagline: 'Weekly pickleball — intermediate socials to DUPR games.',
    description: 'GPC runs weekly games from intermediate socials to competitive DUPR-rated sessions. Book sessions on Reclub; chat on WhatsApp.',
    tags: ['pickleball', 'DUPR', 'intermediate', 'weekly'],
    meets: { cadence: 'weekly', summary: 'Weekly games — sessions listed on Reclub' },
    size: { bucket: '50–200', note: '77 members on Reclub' },
    join: { url: wa('KDogQYkINi80nJugYdUsJS'), platform: 'whatsapp', cta: 'Join WhatsApp group' },
    links: { website: 'https://reclub.co/clubs/@gurugram-pickleball-club' },
    source: src('https://reclub.co/clubs/@gurugram-pickleball-club', 'Reclub page live 15 Nov 2026 (11 activities); session dates not public'),
    status: 'unverified', createdAt: D,
  }),
  c({
    slug: 'konnect-pickleball-hyderabad', name: 'Konnect Pickleball Community', category: 'sports', city: 'Hyderabad',
    tagline: 'Hyderabad + Telangana/AP pickleball WhatsApp community. Free.',
    description: 'A WhatsApp community with sub-groups for Hyderabad, Telangana and Andhra Pradesh pickleballers — leagues, tournaments, clinics and court news. Free to join; run by gear seller Konnect Pickleball.',
    tags: ['pickleball', 'leagues', 'tournaments', 'free'],
    pricing: { type: 'free', note: 'Joining is free' },
    join: { url: wa('GCiKNzG3lbk2ZdQSL8cVa8'), platform: 'whatsapp', cta: 'Join WhatsApp community' },
    links: { website: 'https://konnectpickleball.com/pages/community' },
    source: src('https://konnectpickleball.com/pages/community', 'Community page live 15 Nov 2026; no dated activity seen'),
    status: 'unverified', createdAt: D,
  }),

  // ───────── WOMEN ─────────
  c({
    slug: 'sweat-like-a-girl-swag', name: 'Sweat Like a Girl (SWAG)', category: 'women', city: 'Gurgaon',
    tagline: 'Women-only sports parties — pickleball, badminton, pilates.',
    description: '“India’s women-only sports party”: weekend sports meetups (pickleball, badminton, frisbee), pilates mornings, run-day cheer squads and women-only socials across Delhi NCR. Registration via the link in bio.',
    tags: ['women only', 'pickleball', 'badminton', 'pilates', 'beginner-friendly'],
    audience: { gender: 'women', ageNote: null, level: 'beginner' },
    meets: { cadence: 'weekly', summary: 'SWAG weekends — registration link in bio' },
    join: { url: 'https://www.linktr.ee/sweatlikeagirl', platform: 'other', cta: 'Register for the next one' },
    links: { instagram: ig('sweatlikeagirl') },
    size: { bucket: 'unknown', note: '23,814 Instagram followers' },
    source: src(ig('sweatlikeagirl'), 'Instagram post 14 Nov 2026 (“SWAG weekends are back”)'), createdAt: D,
  }),
  c({
    slug: 'hen-india', name: 'HEN — Her Entrepreneurial Network', category: 'women', city: 'Online',
    tagline: 'Women entrepreneurs: office hours, founder rooms, city chapters.',
    description: 'A networking community for women entrepreneurs — city office hours, founder rooms, virtual meets and workshops (marketing, MSME schemes). Chapters across Indian cities plus online.',
    tags: ['women founders', 'networking', 'workshops', 'chapters'],
    mode: 'hybrid',
    audience: { gender: 'women', ageNote: null, level: 'all' },
    join: { url: 'https://henindia.com/', platform: 'website', cta: 'Visit HEN' },
    links: { website: 'https://henindia.com/', facebook: 'https://www.facebook.com/groups/henindia' },
    source: src('https://henindia.com/', 'Events listed for 19 Nov (Hyderabad, virtual) and 21 Nov 2026 (Mumbai)'), createdAt: D,
  }),
  c({
    slug: 'women-inspiring-network', name: 'Women Inspiring Network', category: 'women', city: 'Online',
    tagline: 'Online network for women professionals and founders.',
    description: 'Membership network for women with an app-based community. Activity not independently dated in this pass.',
    tags: ['women', 'networking', 'online'],
    mode: 'online', audience: { gender: 'women', ageNote: null, level: 'all' },
    join: { url: 'https://womeninspiringnetwork.app/login', platform: 'website', cta: 'Join on their app' },
    links: { website: 'https://womeninspiringnetwork.com/' },
    source: src('https://womeninspiringnetwork.com/', 'Found via search 15 Nov 2026; activity not dated'),
    status: 'unverified', createdAt: D,
  }),
  c({
    slug: 'delhi-ncr-women-in-tech', name: 'Delhi NCR Women in Tech Innovators', category: 'women', city: 'Delhi',
    tagline: 'Women in Tech Network’s Delhi NCR group.',
    description: 'Local group of the global Women in Tech Network. Free to join online; events vary.',
    tags: ['women in tech', 'networking', 'free'],
    mode: 'hybrid', audience: { gender: 'women', ageNote: null, level: 'all' },
    pricing: { type: 'free', note: null },
    join: { url: 'https://www.womentech.net/group/187', platform: 'website', cta: 'Join the group' },
    source: src('https://www.womentech.net/group/187', 'Found via search 15 Nov 2026; activity not dated'),
    status: 'unverified', createdAt: D,
  }),

  // ───────── MEN ─────────
  c({
    slug: 'save-indian-family-foundation', name: 'Save Indian Family Foundation (SIFF)', category: 'men', city: 'Online',
    tagline: 'Men’s support network — helpline and weekly support meetings.',
    description: 'A men’s rights NGO (its own description) running a helpline, weekly support meetings, legal-awareness sessions and quarterly networking events, with branches across India. Free to join; donations and subscriptions optional.',
    tags: ['men', 'support group', 'helpline', 'legal awareness', 'weekly meetings'],
    mode: 'hybrid',
    audience: { gender: 'men', ageNote: null, level: 'all' },
    meets: { cadence: 'weekly', summary: 'Weekly support meetings (per their site)' },
    pricing: { type: 'free', note: 'Optional donation / subscription' },
    size: { bucket: '1000+', note: '7k+ volunteers, 118 branches (site)' },
    join: { url: wa('LNwsxNm4h9QLYS8aIBJjni'), platform: 'whatsapp', cta: 'Join WhatsApp group' },
    links: { website: 'https://www.saveindianfamily.org/' },
    source: src('https://www.saveindianfamily.org/', 'Site article dated 13 Nov 2026'), createdAt: D,
  }),

  // ───────── CIVIC / CONSUMER ─────────
  c({
    slug: 'localcircles', name: 'LocalCircles', category: 'civic', city: 'Online',
    tagline: 'Citizen circles that raise civic + consumer issues together.',
    description: 'Community platform where citizens join circles for their locality, city or issue (cabs, e-commerce, banking, civic services), raise complaints collectively and take national surveys that regulators and media cite.',
    tags: ['consumer complaints', 'civic', 'surveys', 'cabs', 'free'],
    mode: 'online', pricing: { type: 'free', note: null },
    size: { bucket: '1000+', note: 'Surveys get 20k–1 lakh+ responses' },
    join: { url: 'https://www.localcircles.com/a/index?action=signup', platform: 'website', cta: 'Sign up' },
    links: { website: 'https://www.localcircles.com/' },
    source: src('https://www.cnbctv18.com/personal-finance/dhanteras-2026-how-indians-plan-to-buy-gold-this-year-survey-shows-20028492.htm', 'Dhanteras survey (42,000+ responses) reported Nov 2026'), createdAt: D,
  }),
  c({
    slug: 'ola-india-complaints-group', name: 'Ola India Complaints', category: 'civic', city: 'Online',
    tagline: 'Facebook group where riders post Ola issues.',
    description: 'A public Facebook group for Ola rider complaints and experiences. Not run by Ola. We could not check recent activity (Facebook blocks automated reads) — have a look before relying on it.',
    tags: ['consumer complaints', 'cabs', 'ola', 'facebook'],
    mode: 'online', pricing: { type: 'free', note: null },
    join: { url: 'https://www.facebook.com/groups/922661321417441', platform: 'facebook', cta: 'Open Facebook group' },
    source: src('https://www.facebook.com/groups/922661321417441', 'Found via search 15 Nov 2026; activity not checkable'),
    status: 'unverified', createdAt: D,
  }),

  // ───────── PROFESSIONAL / FOUNDERS (paid & premium) ─────────
  c({
    slug: 'tie-delhi-ncr', name: 'TiE Delhi-NCR', category: 'startup', city: 'Delhi',
    tagline: 'Founder mentoring, TiEcon and a paid membership network.',
    description: 'Delhi-NCR chapter of TiE: mentoring, networking, incubation and investing, plus TiEcon Delhi-NCR and a women-entrepreneurship programme. Membership is paid.',
    tags: ['founders', 'mentoring', 'TiEcon', 'investors', 'premium'],
    mode: 'hybrid',
    pricing: { type: 'membership', note: 'Paid membership' },
    join: { url: 'https://delhi.tie.org/', platform: 'website', cta: 'Become a member' },
    links: { website: 'https://delhi.tie.org/' },
    source: src('https://delhi.tie.org/', 'Site features TiEcon Delhi-NCR 2026'), createdAt: D,
  }),
  c({
    slug: 'saasboomi-online', name: 'SaaSBoomi Online (now AIBoomi)', category: 'startup', city: 'Online',
    tagline: 'Application-only community for Indian B2B SaaS founders.',
    description: 'Hands-on online community for Indian SaaS founders who meet eligibility criteria (live product, founder ownership). Apply; replies take 6–8 business days. Now rebranding as AIBoomi.',
    tags: ['saas', 'founders', 'application only', 'premium'],
    mode: 'online',
    join: { url: 'https://saasboomi.org/join-the-community/', platform: 'website', cta: 'Apply to join' },
    source: src('https://saasboomi.org/join-the-community/', 'Join page live 15 Nov 2026; page last updated Sep 2025'),
    status: 'unverified', createdAt: D,
  }),

  // ───────── ONLINE / GAMING ─────────
  c({
    slug: 'indian-gaming-community-discord', name: 'Indian Gaming Community', category: 'games', city: 'Online',
    tagline: '50k-member Discord running online game events.',
    description: 'A large Indian Discord server that organises online events across different games. Free.',
    tags: ['discord', 'gaming', 'online events', 'free'],
    mode: 'online', pricing: { type: 'free', note: null },
    size: { bucket: '1000+', note: '50,613 members, 527 online (15 Nov 2026)' },
    join: { url: 'https://discord.com/invite/Q8UYMRfR5s', platform: 'discord', cta: 'Join Discord' },
    source: src('https://discord.com/invite/Q8UYMRfR5s', '527 members online at check, 15 Nov 2026'), createdAt: D,
  }),

  // ───────── REDDIT MEET-UP HUBS ─────────
  reddit('r-gurgaon-meetups', 'r/gurgaon meet-ups', 'gurgaon', 'Gurgaon', 'Event/Meet-Up flair posts in the last month (search, 15 Nov 2026)'),
  reddit('r-bangaloremeetups', 'r/BangaloreMeetups', 'BangaloreMeetups', 'Bengaluru', 'Recent meet-up posts (search, 15 Nov 2026)'),
  reddit('r-mumbaimeetups', 'r/mumbaimeetups', 'mumbaimeetups', 'Mumbai', 'Meet-up post ~27 days old (search, 15 Nov 2026)'),

  // ───────── PETS ─────────
  c({
    slug: 'pune-pet-owners-meetup', name: 'Pune Pet Owner’s Meetup', category: 'pets', city: 'Pune',
    tagline: 'Monthly dog-and-owner meetups in parks and pet-friendly cafés.',
    description: 'Small Meetup group (29 members) for pet owners — mostly dogs — meeting once a month at parks or restaurants to let pets play and swap care tips.',
    tags: ['dogs', 'pet parents', 'monthly'],
    meets: { cadence: 'monthly', summary: 'Once a month, park or pet-friendly restaurant' },
    size: { bucket: '<50', note: '29 members on Meetup' },
    join: { url: 'https://www.meetup.com/pune-pets-owners-meetup/', platform: 'meetup', cta: 'Join on Meetup' },
    source: src('https://www.meetup.com/pune-pets-owners-meetup/', 'Meetup page live 15 Nov 2026; next event not shown'),
    status: 'unverified', createdAt: D,
  }),
  // ───────── MORE PICKLEBALL (Reclub India directory) ─────────
  c({
    slug: 'east-coast-pickleball-club', name: 'East Coast Pickleball Club', category: 'sports', city: 'Chennai',
    tagline: 'ECR pickleball club — open play and mixed-team tournaments.',
    description: 'Pickleball club at Cholamandal Artists Village, Injambakkam (ECR). Runs open play and tournaments; book sessions on Reclub.',
    tags: ['pickleball', 'ECR', 'tournaments'], area: 'Injambakkam, ECR',
    size: { bucket: '50–200', note: '99 members on Reclub' },
    join: { url: 'https://reclub.co/clubs/@east-coast-pickleball-club', platform: 'website', cta: 'Join on Reclub' },
    source: src('https://reclub.co/communities/in', 'Listed on Reclub India with 99 members and a tournament page; session dates not public'),
    status: 'unverified', createdAt: D,
  }),
  c({
    slug: 'gurgaon-picklers', name: 'Gurgaon Picklers', category: 'sports', city: 'Gurgaon',
    tagline: 'Casual pickleball games around Gurgaon.',
    description: 'A Reclub pickleball group for Gurgaon players. Games are posted on the club page.',
    tags: ['pickleball', 'casual'],
    size: { bucket: '<50', note: '36 members on Reclub' },
    join: { url: 'https://reclub.co/clubs/@gurgaon-picklers', platform: 'website', cta: 'Join on Reclub' },
    source: src('https://reclub.co/communities/in', 'Listed on Reclub India, 15 Nov 2026'),
    status: 'unverified', createdAt: D,
  }),
  c({
    slug: 'breach-candy-pickleball', name: 'Breach Candy Pickleball', category: 'sports', city: 'Mumbai',
    tagline: 'South Mumbai pickleball group.',
    description: 'A Reclub pickleball group around Breach Candy. Games are posted on the club page.',
    tags: ['pickleball', 'south mumbai'], area: 'Breach Candy',
    size: { bucket: '<50', note: '24 members on Reclub' },
    join: { url: 'https://reclub.co/clubs/@breach-candy-pickle-ball', platform: 'website', cta: 'Join on Reclub' },
    source: src('https://reclub.co/communities/in', 'Listed on Reclub India, 15 Nov 2026'),
    status: 'unverified', createdAt: D,
  }),
];

