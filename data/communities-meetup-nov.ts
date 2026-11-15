// ============================================================
// data/communities-meetup-nov.ts — Meetup groups with a dated upcoming
// event, harvested via Firecrawl from meetup.com/find (EVENTS view) for
// Bengaluru, Delhi, Gurgaon, Mumbai, Hyderabad, Chennai and Pune on
// 15 Nov 2026. Every row's activitySignal is the next event Meetup showed.
//
// Left out on purpose: groups based abroad (Dubai, Bangkok, Nepal…),
// Scientology fronts, astrology/“channelling”, religion-specific
// matrimony, poker, college-only AWS student groups, pure sales funnels
// (Primewise, “Global Startups Club”, MAANG-in-4-months) and duplicates
// of rows already listed. Evidence log: research/meetup-harvest-2026-11-15.md
// ============================================================
import { c, type Community } from './communities';

const D = '2026-11-15';
const FIND = (city: string) => `https://www.meetup.com/find/?location=in--${city}&source=EVENTS`;
const CITY_Q: Record<string, string> = { Bengaluru: 'Bangalore', Delhi: 'Delhi', Gurgaon: 'Gurgaon', Mumbai: 'Mumbai', Hyderabad: 'Hyderabad', Chennai: 'Chennai', Pune: 'Pune', Online: 'Mumbai' };

type X = Partial<Community> & { weekly?: boolean };
function mu(path: string, name: string, city: string, category: Community['category'], tagline: string, next: string, x: X = {}): Community {
  const url = `https://www.meetup.com/${path}/`;
  const { weekly, ...extra } = x;
  return c({
    slug: `mu-${path.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`.slice(0, 60),
    name, city, category, tagline,
    description: `${tagline} Runs on Meetup — the next event, venue and any fee are on the group page; RSVP there.`,
    tags: ['meetup'],
    meets: { cadence: weekly ? 'weekly' : 'irregular', summary: `Next: ${next}` },
    join: { url, platform: 'meetup', cta: 'RSVP on Meetup' },
    links: { meetup: url },
    source: { url: FIND(CITY_Q[city] ?? city), verifiedOn: D, activitySignal: `Upcoming on Meetup: ${next}` },
    createdAt: D,
    ...(city === 'Online' ? { mode: 'online' as const } : {}),
    ...extra,
  });
}

export const COMMUNITIES_MEETUP_NOV: Community[] = [
  // ───────── BENGALURU ─────────
  mu('bangalore-get-togethers', 'WeBesocial South India', 'Bengaluru', 'social', 'Pub meetups every other Saturday, plus online singles calls.', 'Pub Meetup Bengaluru, Sat 28 Nov 2026', { meets: { cadence: 'fortnightly', summary: 'Every other Saturday, 7pm' } }),
  mu('hsrmeetups', 'HSRMeetups: House of Sober Rounds', 'Bengaluru', 'social', 'Sober social nights in HSR — games, Traitors & Werewolves, Sunday hangs.', 'House of Sober Rounds, Fri 20 Nov 2026', { weekly: true, tags: ['sober', 'games', 'HSR Layout', 'werewolf'] }),
  mu('playhouseblr', 'PlayHouse Bengaluru', 'Bengaluru', 'social', 'Late-night Fridays and Secret Identity Saturdays with strangers.', 'Secret Identity Saturday, Sat 21 Nov 2026', { weekly: true, tags: ['games', 'late night', 'strangers'] }),
  mu('lets-connect-hangout-on-weekends', 'Bangalore Weekend Hangout', 'Bengaluru', 'social', 'Saturday board games and Friday house parties.', 'Saturday Boardgaming, Sat 21 Nov 2026', { weekly: true, tags: ['board games', 'house party', 'weekend'] }),
  mu('dazflo', 'Dazflo — Run For Change', 'Bengaluru', 'running', 'Saturday 7am community run.', 'Run For Change, Sat 21 Nov 2026 7am', { weekly: true, tags: ['saturday', '7am'] }),
  mu('indo-japan-kai', 'Indo-Japan Kai', 'Bengaluru', 'language', 'Japanese conversation practice online + in-person meets.', 'In-person meet, Sun 13 Dec 2026', { mode: 'hybrid', tags: ['japanese', 'language exchange'] }),
  mu('newacropolisindia', 'New Acropolis (India)', 'Bengaluru', 'wellbeing', 'Practical-philosophy talks and courses.', 'Know Yourself: Life Beyond the Daily Grind, Sat 28 Nov 2026', { tags: ['philosophy', 'talks'] }),
  mu('whfl-bangalore', 'WHFL — Wealth, Health, Friendships, Lifestyle', 'Bengaluru', 'social', 'Free online speed-friending and networking.', 'Speed Friending, Fri 27 Nov 2026', { mode: 'online', pricing: { type: 'free', note: null } }),
  mu('bangalore-adhd-neurodivergent-meetup-group', 'Bangalore ADHD / Neurodivergent Meetup', 'Bengaluru', 'wellbeing', 'Peer meetups for neurodivergent adults.', 'India online meetup, Tue 17 Nov 2026', { mode: 'hybrid', tags: ['adhd', 'neurodivergent', 'peer support'] }),
  mu('a-journey-from-social-anxiety-to-social-ease-bangalore', 'Social Anxiety to Social Ease', 'Bengaluru', 'wellbeing', 'A gentle weekly circle for people working on social anxiety.', 'Let us Connect, Sat 21 Nov 2026', { weekly: true, mode: 'online' }),
  mu('futureofdata-bangalore', 'Future of Data: Bangalore', 'Bengaluru', 'tech', 'Data + AI engineering talks.', 'LLMOps in Production, Sat 21 Nov 2026'),
  mu('ai-xchange', 'AI XCHANGE', 'Bengaluru', 'tech', 'Cloud-native + AI community meetups.', 'KSUG.AI India #12 @ HPE, Sat 21 Nov 2026'),
  mu('agentic-ai-community-bengaluru', 'Agentic AI Community Bengaluru', 'Bengaluru', 'tech', 'Builders of AI agents — talks and community days.', 'Agent Builders Community Day, Sat 21 Nov 2026'),
  mu('bangalore-kafka-data-ai', 'Bangalore Apache Kafka, Data & AI', 'Bengaluru', 'tech', 'Streaming-data meetup.', 'Kafka Meetup Bangalore, Sat 21 Nov 2026'),
  mu('collabnix', 'Collabnix', 'Bengaluru', 'tech', 'DevOps, cloud-native and agentic AI community.', 'Open Possibilities Unlocked @HPE, Sat 21 Nov 2026'),
  mu('bangpypers', 'BangPypers — Bangalore Python Users', 'Bengaluru', 'tech', 'The city’s long-running monthly Python meetup.', 'BangPypers × Pathfinder, Sat 21 Nov 2026', { meets: { cadence: 'monthly', summary: 'Monthly, Saturdays' }, pricing: { type: 'free', note: null } }),
  mu('lspe-in', 'Large Scale Production Engineering India', 'Bengaluru', 'tech', 'SRE / production-engineering meetup.', 'LSPE meetup, Sat 12 Dec 2026'),
  mu('confidential-computing-bangalore-community', 'Confidential Computing Bangalore', 'Bengaluru', 'tech', 'Security + confidential-computing talks.', 'The Zero-Trust Enclave, Sat 5 Dec 2026'),
  mu('awsugblr', 'AWS User Group Bengaluru', 'Bengaluru', 'tech', 'Community-run AWS meetups.', 'Architecting Resilient Agents, Sat 21 Nov 2026'),
  mu('bangalorejug', 'Bangalore Java User Group', 'Bengaluru', 'tech', 'Monthly Java meetup.', 'Java November Meetup, Sat 28 Nov 2026'),
  mu('experttalks-bengaluru', 'Expert Talks Bengaluru', 'Bengaluru', 'tech', 'Practitioner talks on AI and engineering.', 'AI Model Upgrades & Agentic Commerce, Sat 28 Nov 2026'),
  mu('techinsider-bangalore', 'Tech Insider Community Bengaluru', 'Bengaluru', 'tech', 'Web, cloud and DevOps meetups.', 'CartTalk 4.0, Fri 20 Nov 2026'),
  mu('bangalore-dbt-meetup', 'Bangalore dbt Meetup', 'Bengaluru', 'tech', 'Analytics-engineering meetup.', 'Bangalore dbt Meetup, Thu 10 Dec 2026'),
  mu('graphdb-bengaluru', 'Graph Database Bengaluru', 'Bengaluru', 'tech', 'Graph-data meetups.', 'WeAreDevelopers PreDay Meetup, Tue 24 Nov 2026'),
  mu('deeptechstars', 'AI Meetups by Deep Tech Stars', 'Bengaluru', 'tech', 'AI security and strategy meetups.', 'AI Security, Sat 5 Dec 2026'),
  mu('dotnetblr', 'Dot Net Bangalore', 'Bengaluru', 'tech', '.NET, Azure and Microsoft-stack meetup.', '27th Dot Net Bangalore Meetup, Sat 12 Dec 2026'),
  mu('bengaluruwordpress', 'Bengaluru WordPress', 'Bengaluru', 'tech', 'WordPress community — runs WordCamp Bengaluru.', 'WordCamp Bengaluru, Sun 22 Nov 2026'),
  mu('sustainability-in-it', 'Sustainability in IT', 'Bengaluru', 'cause', 'Green-software and sustainable-tech conversations.', 'The Conversation Continues, Sat 28 Nov 2026'),
  mu('startupbangalore', 'eChai Bangalore Startup Network', 'Bengaluru', 'startup', 'Neighbourhood startup meetups — HSR, Koramangala and more.', 'Bengaluru Startup Meetup: HSR Edition, Sat 21 Nov 2026'),
  mu('cedat-nexus-students-entrepreneurs-professionals', 'CEDAT — Startups & Ecosystems', 'Bengaluru', 'startup', 'Founder stories, pitches and investor meets.', 'Startup Stories by Bengaluru Founders, Thu 26 Nov 2026'),
  mu('buildwithnoclue_', 'buildwithnoClue_', 'Bengaluru', 'startup', 'Reality-check sessions for people building things.', 'Reality Check: Bangalore Edition, Fri 27 Nov 2026'),

  // ───────── DELHI ─────────
  mu('websocialate', 'WeBesocial India — Delhi', 'Delhi', 'social', 'Saturday-night pub meets in Delhi.', 'Pub Delhi Meets, Sat 21 Nov 2026', { weekly: true }),
  mu('come-chill', 'Come & Chill', 'Delhi', 'social', 'Stranger trips and hangouts out of Delhi.', 'Mussoorie Stranger’s Trip, Fri 27 Nov 2026', { pricing: { type: 'pay-per-event', note: 'Trips are paid' }, tags: ['strangers', 'trips'] }),
  mu('delhi-expats-meetup-group', 'Delhi Expats Meetup Group', 'Delhi', 'social', 'Expats + locals meetups in Hauz Khas, Chanakyapuri and Gurgaon.', 'Hauz Khas International Expats Meetup, Wed 18 Nov 2026', { tags: ['expats', 'international'] }),
  mu('travel-meetup-tribe', 'Travel & Meetup Tribe', 'Delhi', 'outdoors', 'Group trips and travel meetups.', 'Northeast Unplugged — Hornbill Edition, Tue 1 Dec 2026', { pricing: { type: 'paid', note: 'Trips are paid' } }),
  mu('travelingsoulsdotorg', 'TravelingSouls.org', 'Delhi', 'outdoors', 'Cost-share budget trips — fairs, festivals, mountains.', 'Pushkar Camel Fair trip, Sat 21 Nov 2026', { pricing: { type: 'pay-per-event', note: 'Cost-share basis' }, tags: ['budget travel', 'cost share'] }),
  mu('safarnama-the-retreat-for-women', 'Safarnama — Retreats for Women', 'Delhi', 'women', 'Women-only retreats and trips.', '4-day retreat at Jim Corbett, Thu 19 Nov 2026', { audience: { gender: 'women', ageNote: null, level: 'all' }, pricing: { type: 'paid', note: 'Retreats are paid' } }),
  mu('muskarate-chehare-meetup-group', 'Muskarate Chehare', 'Delhi', 'creative', 'Folk-dance evenings and cultural meetups.', 'Hungarian folk dance, Mon 23 Nov 2026', { tags: ['dance', 'folk'] }),
  mu('west-delhi-cycling-club', 'West Delhi Cycling Club', 'Delhi', 'cycling', 'Monthly early-morning weekend rides.', 'Weekend ka Wow ride, Sun 6 Dec 2026 5am', { meets: { cadence: 'monthly', summary: 'Monthly Sunday, 5am' } }),
  mu('delhionetoastmasters', 'Delhi One Toastmasters', 'Delhi', 'professional', 'Weekly public-speaking practice.', 'Club meeting, Sat 21 Nov 2026 5pm', { weekly: true, tags: ['public speaking'] }),
  mu('central-delhi-toastmasters-club-cdtm', 'Central Delhi Toastmasters', 'Delhi', 'professional', 'Tuesday-evening public-speaking club.', 'Club meeting, Tue 17 Nov 2026 6:30pm', { weekly: true, tags: ['public speaking'] }),
  mu('delhi-educational-meetup-group', 'Delhi Educators Meetup', 'Delhi', 'professional', 'Teachers, professors and edupreneurs network.', 'Educators Meetup, Sat 21 Nov 2026'),
  mu('ilugdelhi', 'India Linux Users Group Delhi', 'Delhi', 'tech', 'Free and open-source software meetups since forever.', 'ILUG-D meetup, Sat 12 Dec 2026', { pricing: { type: 'free', note: null } }),
  mu('delhi-elastic-fantastics', 'Elastic Delhi User Group', 'Delhi', 'tech', 'Search, observability and AI meetups.', 'AI Connect: New Delhi, Sat 21 Nov 2026'),
  mu('bizowl-best-startup-meetups', 'Bizowl Startup Meetups', 'Delhi', 'startup', 'Founder speed-networking.', 'Delhi Founders Speed Networking, Sat 21 Nov 2026', { pricing: { type: 'pay-per-event', note: 'Some events paid' } }),
  mu('business4-0', 'Business 4.0', 'Delhi', 'startup', 'Fortnightly business-owner meetups.', 'Business4.0 Meetup, Sat 28 Nov 2026', { meets: { cadence: 'fortnightly', summary: 'Every other Saturday, 11am' }, pricing: { type: 'pay-per-event', note: 'Entry fee applies' } }),

  // ───────── GURGAON ─────────
  mu('strangers-ncr-party-club', 'Strangers NCR Party & Meetup Club', 'Gurgaon', 'social', 'Parties and meetups for people new to NCR.', 'Sunday Funday, Sun 15 Nov 2026', { tags: ['parties', 'strangers'] }),
  mu('gurugram-toddler-parents-1-3-year-old', 'Gurugram Toddler Parents (1–3 yrs)', 'Gurgaon', 'parents', 'Parents of toddlers — playdates and parents’ nights.', 'Parents’ dinner, Fri 20 Nov 2026', { tags: ['toddlers', 'playdates'] }),
  mu('foundersnagri', 'Founders & Business Owners Network', 'Online', 'startup', 'Online founder roundtables by sector.', 'Sales Roundtable for Software/AI, Tue 17 Nov 2026'),

  // ───────── MUMBAI ─────────
  mu('isinglemumbai', 'iSingle Mumbai', 'Mumbai', 'dating', 'Singles meetups and getaways.', 'Bollywood Nights trip to Igatpuri, Sat 21 Nov 2026', { pricing: { type: 'pay-per-event', note: 'Trips are paid' }, tags: ['singles', 'trips'] }),
  mu('mumbaihangouts', 'Mumbai Hangouts', 'Mumbai', 'social', 'Plays, plans and outings with new people.', 'Prithvi Theatre play, Fri 20 Nov 2026', { tags: ['theatre', 'outings'] }),
  mu('mumbai-weekend-events', 'Mumbai Weekend Events — Midnight Cycling', 'Mumbai', 'cycling', 'Friday midnight rides through the city.', 'Mumbai Midnight Cycling, Fri 20 Nov 2026 10:30pm', { weekly: true, tags: ['night ride'] }),
  mu('junkie', 'Mumbai’s Active Adventure Travel Junkies', 'Mumbai', 'outdoors', 'Adventure trips — cycling tours, treks.', 'Luang Prabang cycling tour, Mon 16 Nov 2026', { pricing: { type: 'paid', note: 'Trips are paid' } }),
  mu('indian-travellers-explorers', 'Indian Travellers & Explorers', 'Mumbai', 'outdoors', 'Small-group discovery trips across India.', 'Mizoram Discovery Trails, Sat 21 Nov 2026', { pricing: { type: 'paid', note: 'Trips are paid' } }),
  mu('acropolis', 'Mumbai Philosophers (New Acropolis)', 'Mumbai', 'wellbeing', 'Living-philosophy talks — Seneca, Stoics and more.', 'On the Shortness of Life, Sat 12 Dec 2026', { tags: ['philosophy'] }),
  mu('oshoglimpsemumbai', 'Osho Glimpse Mumbai', 'Mumbai', 'wellbeing', 'Meditation days and sessions.', 'Osho Meditation Day, Sun 29 Nov 2026', { tags: ['meditation'] }),
  mu('mumbai-ai', 'MumbAI AI', 'Mumbai', 'tech', 'Saturday AI build sessions at BKC.', 'MumbAI AI Saturdays, Sat 21 Nov 2026', { weekly: true }),
  mu('startupmumbai', 'eChai Mumbai Startup Network', 'Mumbai', 'startup', 'Startup and product-growth meetups.', 'Product Growth Meetup, Sat 21 Nov 2026'),
  mu('money-market-mindset-leadership-mmml', 'Money, Market, Mindset & Leadership', 'Mumbai', 'professional', 'Finance and leadership meetups.', 'MMML Mumbai #8, Sat 5 Dec 2026'),
  mu('whispers-of-the-soul-a-poetry-circle', 'Whispers of the Soul — Poetry Circle', 'Online', 'creative', 'Sunday-evening online poetry circle.', 'Debate time!, Sun 22 Nov 2026', { weekly: true }),
  mu('https-chat-whatsapp-com-hkjfxkrzf5p62dhmukyone', 'Empowered Women Hub (women only)', 'Online', 'women', 'Monday-night networking and heart-to-heart circle for women.', 'Networking Mixer, Mon 16 Nov 2026', { weekly: true, audience: { gender: 'women', ageNote: null, level: 'all' } }),
  mu('totalrandoms', 'Total Randoms', 'Online', 'social', 'Thursday online bingo + find-your-tribe nights.', 'Randoms Bingo, Thu 19 Nov 2026', { weekly: true }),
  mu('cinestagefilms', 'CineStage Films — Filmmaking Meetup', 'Online', 'creative', 'Fortnightly Q&A for indie filmmakers.', 'Movie Makers’ Q&A, Sun 22 Nov 2026', { meets: { cadence: 'fortnightly', summary: 'Every other Sunday, 9pm' } }),
  mu('bitshala', 'Bitshala', 'Online', 'tech', 'Bitcoin developer education cohorts.', 'Mastering Lightning S5 orientation, Wed 18 Nov 2026'),
  mu('free-online-english-classes-india', 'Free Online English Classes — India', 'Online', 'language', 'Volunteer-run English practice classes.', 'Choose-your-own class, Sat 5 Dec 2026', { pricing: { type: 'free', note: null } }),
  mu('dataanalyticgroup', 'Data Analytic Group', 'Online', 'tech', 'Power BI / Fabric study groups.', 'DAG Connect, Sat 28 Nov 2026'),

  // ───────── HYDERABAD ─────────
  mu('unmuteself-me', 'Unmute Self', 'Hyderabad', 'wellbeing', 'Day-long self-reflection workshops.', 'UNTIE — A Day at the Loom of Self, Sun 22 Nov 2026'),
  mu('unchartedroutes', 'Uncharted Routes', 'Hyderabad', 'outdoors', 'Mystery day trips out of the city.', 'The Unmarked Route mystery trip, Sun 22 Nov 2026', { pricing: { type: 'pay-per-event', note: null } }),
  mu('theclimbon', 'ClimbOn Adventure Club', 'Hyderabad', 'outdoors', 'IMF-affiliated climbing and adventure club.', 'Blanket Donation Drive, Sat 21 Nov 2026', { tags: ['climbing', 'adventure'] }),
  mu('edgeadventureclub', 'Edge Adventure Club', 'Hyderabad', 'outdoors', 'Weekend trips — Wayanad, Coorg and beyond.', '3D/2N Wayanad, Thu 19 Nov 2026', { pricing: { type: 'paid', note: 'Trips are paid' } }),
  mu('photowalkshyderabad', 'Photowalks Hyderabad', 'Hyderabad', 'creative', 'Photowalks and landscape photo tours.', 'Startrails tour to Maredumilli, Sat 12 Dec 2026', { tags: ['photography'] }),
  mu('hyderabad-volunteering-meetup', 'Gachibowli Volunteering Meetup', 'Hyderabad', 'cause', 'Saturday volunteering at a government school.', 'Government school visit, Sat 21 Nov 2026', { weekly: true, pricing: { type: 'free', note: null }, area: 'Gachibowli' }),
  mu('swechafsmi', 'Swecha', 'Hyderabad', 'cause', 'Telangana free-software community — also runs free medical camps.', 'Free medical camp volunteering, Sun 6 Dec 2026', { meets: { cadence: 'monthly', summary: 'Monthly volunteering' }, pricing: { type: 'free', note: null } }),
  mu('aiyatra', 'AIYatra', 'Hyderabad', 'tech', 'AI and frontend community events.', 'LLM Observability, Sat 28 Nov 2026'),
  mu('india-microsoft-fabric-user-group', 'India Microsoft Fabric User Group', 'Hyderabad', 'tech', 'Data-platform user group.', 'Ignite Keynote Replay, Fri 20 Nov 2026'),
  mu('ai-hyd', 'AI.Bharath.CLUB Hyderabad', 'Hyderabad', 'tech', 'Monthly AI mixers.', 'Agentic AI Monthly Mixer, Wed 18 Nov 2026', { mode: 'hybrid', meets: { cadence: 'monthly', summary: 'Monthly' } }),

  // ───────── CHENNAI ─────────
  mu('live-mortal-mindfulness-fun-conversations', 'Live Mortal', 'Chennai', 'social', 'Mindfulness walks, fun and honest conversations.', 'A Date with the Rain, Sun 22 Nov 2026'),
  mu('ronda-night-mystery-dating-event', 'Ronda Night', 'Chennai', 'dating', 'Monthly mystery game-night for singles.', 'Ronda Game Night, Sat 12 Dec 2026', { meets: { cadence: 'monthly', summary: 'Monthly Saturday' } }),
  mu('chennai-weekend-mix-business-fun', 'Chennai — The Chill Boardroom', 'Chennai', 'startup', 'Startup connects that don’t feel like work.', 'Startup Connect Chennai, Sat 21 Nov 2026'),
  mu('longevia-meetups-longevity-wellness-healthy-ageing', 'Longevia', 'Chennai', 'wellbeing', 'Longevity and healthy-ageing meetups.', 'Beyond Training — Understanding Recovery, Sun 22 Nov 2026'),
  mu('chennai-backpackers-n-city-freaks', 'Chennai Backpackers & City Freaks', 'Chennai', 'outdoors', 'Weekly backpacking trips from Chennai.', 'Ooty & Coonoor, Thu 19 Nov 2026', { pricing: { type: 'paid', note: 'Trips are paid' } }),
  mu('chennai-microsoft-azure-user-group', 'Microsoft Azure User Group Chennai', 'Chennai', 'tech', 'Azure and AI-engineering workshops.', 'Become a Senior AI Engineer, Sat 28 Nov 2026'),
  mu('azure-developer-community-chennai', 'Azure Developer Community Tamil Nadu', 'Chennai', 'tech', 'Developer and tech-leadership forums.', 'Technology Leadership Forum, Thu 3 Dec 2026'),

  // ───────── PUNE ─────────
  mu('pfc-2-0', 'PFC 2.0 — Football', 'Pune', 'sports', 'Monday-night 5-a-side; RSVP opens Saturday 4pm.', 'Monday Game at Agnels, Mon 16 Nov 2026 8:30pm', { weekly: true, tags: ['football', 'turf'] }),
  mu('pune-footballers-club', 'Pune Footballers Club', 'Pune', 'sports', 'Friday-night football.', 'Friday Game, Fri 20 Nov 2026 8:30pm', { weekly: true, tags: ['football'] }),
  mu('pune-bodyweight-fitness-meetup', 'Pune Bodyweight Fitness', 'Pune', 'fitness', 'Sunday hill sprints and calisthenics.', 'Hill sprint, Sun 22 Nov 2026 6:10am', { weekly: true, pricing: { type: 'free', note: null } }),
  mu('pune-roleplaying-games-rpgs-meetup-group', 'Pune Roleplaying Games', 'Pune', 'games', 'Tabletop RPG sessions.', 'Roleplaying Games, Sat 28 Nov 2026', { tags: ['D&D', 'tabletop'] }),
  mu('pune-writers-group', 'Pune Writers’ Group', 'Pune', 'creative', 'Write-together sessions, Thursdays + alternate Saturdays.', 'Thursday Writing Session, Thu 19 Nov 2026', { weekly: true, tags: ['writing'] }),
  mu('pune-book-lovers-philosophers', 'Pune Book Lovers & Philosophers', 'Pune', 'books', 'Philosophy and book talks (New Acropolis).', 'Khalil Gibran — Yearning for Inner Freedom, Sat 21 Nov 2026'),
  mu('the-art-of-forest-bathing-pune', 'The Art of Forest Bathing — Pune', 'Pune', 'wellbeing', 'Guided nature-immersion walks.', 'Awaken Your Senses, Sun 22 Nov 2026'),
  mu('pune-spirituality-and-meditation-group', 'Pune Inner Well Being', 'Pune', 'wellbeing', 'Meditation and well-being circle.', 'Meditation circle, Sat 28 Nov 2026'),
  mu('toastmasters-for-pune-entrepreneurs', 'Toastmasters for Pune Entrepreneurs', 'Pune', 'professional', 'Public speaking for founders — 500 meetings in.', 'TFPE @ 500, Sun 6 Dec 2026'),
  mu('t4b-community-pune', 'T4B Community Pune', 'Pune', 'professional', 'Business breakfasts across Balewadi, Kharadi and PCMC.', 'Business Meeting & Breakfast, Sat 21 Nov 2026', { weekly: true }),
  mu('pune-startups-and-entrepreneurs', 'Pune Startups & Entrepreneurs', 'Pune', 'startup', 'Free offline founder networking.', 'Founders & Entrepreneurs Meetup, Sat 28 Nov 2026', { pricing: { type: 'free', note: null } }),
  mu('practical-ai-engineering', 'Z4 Connect: Chaats & Chatbots', 'Pune', 'tech', 'Practical AI engineering, with chaat.', 'Copilot Studio to Production, Sat 21 Nov 2026'),
  mu('pune-kafka', 'Pune Apache Kafka Meetup', 'Pune', 'tech', 'Streaming-data meetup.', 'Kafka Meetup Pune, Sat 28 Nov 2026'),
  mu('pune-drupal-group', 'Drupalers Association Pune', 'Pune', 'tech', 'Drupal community meetup.', 'Drupal Pune Meetup, Sat 21 Nov 2026'),
  mu('pune-atlassian-community-events', 'Pune Atlassian Community', 'Pune', 'tech', 'Community-led Atlassian conference and meetups.', 'Community conference, Sat 5 Dec 2026'),
  // ───────── MORE SOCIAL (Bengaluru social filter) ─────────
  mu('bangalore-eventshub', 'BLR Events Hub', 'Bengaluru', 'social', 'Saturday social mixers, board games and house parties.', 'Social Mixer, Sat 21 Nov 2026 3pm', { weekly: true, tags: ['mixer', 'board games', 'house party'] }),
  mu('nri-social-club', 'NRI Social Club', 'Bengaluru', 'social', 'For NRIs and returnees settling back in — brunches and socials.', 'Books & Brunch, Sat 12 Dec 2026', { tags: ['NRI', 'returnees', 'brunch'] }),
  mu('happytribe', 'Happy Tribe (Divorced & Separated)', 'Online', 'social', 'A friendly circle for divorced and separated people — tambola, music evenings.', 'Online Tambola, Fri 20 Nov 2026', { weekly: true }),

  // ───────── AHMEDABAD · JAIPUR ─────────
  mu('ahmedabad-amazon-aws-cloud-meetup', 'AWS Community Ahmedabad', 'Ahmedabad', 'tech', 'Monthly AWS community meetup.', 'Monthly Meetup, Sat 28 Nov 2026', { meets: { cadence: 'monthly', summary: 'Monthly Saturday' } }),
  mu('m365ahmedabad', 'M365 Ahmedabad User Group', 'Ahmedabad', 'tech', 'Microsoft-stack user group.', '.NET Conf 2026 Ahmedabad, Sat 28 Nov 2026'),
  mu('gujarat-elastic-fantastics', 'Elastic Gujarat User Group', 'Ahmedabad', 'tech', 'Search and AI meetup.', 'AI Connect: Ahmedabad, Sat 21 Nov 2026'),
  mu('jaipur-toastmasters-club', 'Jaipur Toastmasters Club', 'Jaipur', 'professional', 'Sunday-morning public-speaking club.', 'Club meeting, Sun 22 Nov 2026 10:15am', { weekly: true, tags: ['public speaking'] }),
  mu('jaipur-girls-and-guys-having-fun-meetup-group', 'The Thinking Circle — Jaipur', 'Jaipur', 'books', 'Book-lovers’ gatherings and conversation circles.', 'Beyond the Pages, Sun 29 Nov 2026'),
];

