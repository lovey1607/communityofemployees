// ============================================================
// data/communities.ts — seed listings for the Community of People
// marketplace (/communities).
//
// RULES (read data/communities.README.md before adding a row):
//   · Every row has a `source.url` a human actually opened and a
//     `source.verifiedOn` date. No row exists because it "probably" exists.
//   · Nothing is invented. Member counts, prices and schedules appear only
//     when a public page states them, and the UI renders "ask organiser"
//     for unknowns. `status: 'unverified'` means the listing is real but
//     we could not confirm activity in roughly the last 90 days.
//   · `join.url` is always the organiser's own channel (their WhatsApp,
//     Instagram, Meetup, website). We never create channels for them.
//   · No organiser photos/logos are stored. Visual marks are generated
//     from the slug (lib/communities/mark.ts); `imageUrl` stays null until
//     an organiser supplies one.
//
// This file is a stop-gap for the front-end-only phase. The shape is a
// straight mapping to a future `communities` table.
// ============================================================

export type CommunityCategory =
  | 'running' | 'cycling' | 'sports' | 'fitness' | 'outdoors'
  | 'tech' | 'startup' | 'creative' | 'books' | 'food' | 'social'
  | 'language' | 'cause' | 'wellbeing' | 'parents' | 'pets'
  | 'professional' | 'games' | 'dating' | 'men' | 'women' | 'civic' | 'other';

export type JoinPlatform =
  | 'whatsapp' | 'instagram' | 'meetup' | 'luma' | 'misfits' | 'strava'
  | 'website' | 'telegram' | 'hangout' | 'discord' | 'reddit' | 'facebook' | 'other';

export type Community = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: CommunityCategory;
  tags: string[];
  city: string;
  area: string | null;
  location: { lat: number; lng: number; label: string; precision: 'exact' | 'area' | 'city' } | null;
  meets: { cadence: 'weekly' | 'fortnightly' | 'monthly' | 'irregular' | 'unknown'; summary: string | null };
  audience: { gender: 'all' | 'women' | 'men' | 'unknown'; ageNote: string | null; level: 'beginner' | 'all' | 'advanced' | 'unknown' };
  pricing: { type: 'free' | 'paid' | 'pay-per-event' | 'membership' | 'unknown'; note: string | null };
  size: { bucket: '<50' | '50–200' | '200–1000' | '1000+' | 'unknown'; note: string | null };
  hasEvents: boolean;
  /** Where it happens. 'online' rows (city 'Online') show in every city. */
  mode: 'offline' | 'online' | 'hybrid';
  /** Only set when the organiser states an age focus. */
  ageBand: 'genz' | 'millennial' | '50plus' | null;
  join: { url: string; platform: JoinPlatform; cta: string };
  links: { instagram?: string; website?: string; meetup?: string; strava?: string; luma?: string; whatsapp?: string; facebook?: string };
  source: { url: string; verifiedOn: string; activitySignal: string };
  status: 'approved' | 'unverified';
  featured?: boolean;
  imageUrl: string | null;
  createdAt: string;
};

// ─── helpers (keep rows short) ───────────────────────────────
export const V = '2026-11-14';
export type Partial_ = Omit<Partial<Community>, 'name' | 'slug' | 'category' | 'city' | 'join' | 'source'> &
  Pick<Community, 'name' | 'slug' | 'category' | 'city' | 'join' | 'source'>;

export const CITY_CENTRE: Record<string, [number, number]> = {
  Gurgaon: [28.4595, 77.0266], Delhi: [28.6139, 77.209], Noida: [28.5355, 77.391],
  Faridabad: [28.4089, 77.3178], Ghaziabad: [28.6692, 77.4538],
  Mumbai: [19.076, 72.8777], 'Navi Mumbai': [19.033, 73.0297], Thane: [19.2183, 72.9781],
  Bengaluru: [12.9716, 77.5946], Jaipur: [26.9124, 75.7873],
  Pune: [18.5204, 73.8567], Hyderabad: [17.385, 78.4867], Chennai: [13.0827, 80.2707], Kolkata: [22.5726, 88.3639],
  Ahmedabad: [23.0225, 72.5714], Gandhinagar: [23.2156, 72.6369], Chandigarh: [30.7333, 76.7794], Mohali: [30.7046, 76.7179],
  Kochi: [9.9312, 76.2673], Indore: [22.7196, 75.8577], Lucknow: [26.8467, 80.9462], Goa: [15.4909, 73.8278],
  Surat: [21.1702, 72.8311], Nagpur: [21.1458, 79.0882], Coimbatore: [11.0168, 76.9558], Dehradun: [30.3165, 78.0322],
  Bhopal: [23.2599, 77.4126], Vadodara: [22.3072, 73.1812], Kanpur: [26.4499, 80.3319], Nashik: [19.9975, 73.7898],
  Bhubaneswar: [20.2961, 85.8245], Guwahati: [26.1445, 91.7362], Patna: [25.5941, 85.1376], Raipur: [21.2514, 81.6296],
  Mysuru: [12.2958, 76.6394], Visakhapatnam: [17.6868, 83.2185], Thiruvananthapuram: [8.5241, 76.9366], Ludhiana: [30.901, 75.8573],
  Jodhpur: [26.2389, 73.0243], Gwalior: [26.2183, 78.1828], Bikaner: [28.0229, 73.3119], Kozhikode: [11.2588, 75.7804],
  Madurai: [9.9252, 78.1198], Rohtak: [28.8955, 76.6066], Meerut: [28.9845, 77.7064], Haridwar: [29.9457, 78.1642],
  // ─── around the world (v11) ───
  'San Francisco': [37.7749, -122.4194], 'New York': [40.7128, -74.006], 'Los Angeles': [34.0522, -118.2437],
  Seattle: [47.6062, -122.3321], Austin: [30.2672, -97.7431], Boston: [42.3601, -71.0589], Chicago: [41.8781, -87.6298],
  'Washington DC': [38.9072, -77.0369], Miami: [25.7617, -80.1918], Denver: [39.7392, -104.9903], Atlanta: [33.749, -84.388],
  'San Diego': [32.7157, -117.1611], Toronto: [43.6532, -79.3832], Vancouver: [49.2827, -123.1207],
  'Mexico City': [19.4326, -99.1332], 'São Paulo': [-23.5505, -46.6333], 'Buenos Aires': [-34.6037, -58.3816],
  London: [51.5074, -0.1278], Edinburgh: [55.9533, -3.1883], Dublin: [53.3498, -6.2603], Paris: [48.8566, 2.3522],
  Berlin: [52.52, 13.405], Munich: [48.1351, 11.582], Amsterdam: [52.3676, 4.9041], Barcelona: [41.3874, 2.1686],
  Madrid: [40.4168, -3.7038], Lisbon: [38.7223, -9.1393], Milan: [45.4642, 9.19], Zurich: [47.3769, 8.5417],
  Vienna: [48.2082, 16.3738], Prague: [50.0755, 14.4378], Warsaw: [52.2297, 21.0122], Copenhagen: [55.6761, 12.5683],
  Stockholm: [59.3293, 18.0686], Istanbul: [41.0082, 28.9784],
  Dubai: [25.2048, 55.2708], 'Abu Dhabi': [24.4539, 54.3773], Doha: [25.2854, 51.531], Riyadh: [24.7136, 46.6753], 'Tel Aviv': [32.0853, 34.7818],
  'Cape Town': [-33.9249, 18.4241], Nairobi: [-1.2921, 36.8219], Lagos: [6.5244, 3.3792],
  Singapore: [1.3521, 103.8198], 'Hong Kong': [22.3193, 114.1694], Tokyo: [35.6762, 139.6503], Seoul: [37.5665, 126.978],
  Shanghai: [31.2304, 121.4737], Beijing: [39.9042, 116.4074], Taipei: [25.033, 121.5654], Bangkok: [13.7563, 100.5018],
  'Kuala Lumpur': [3.139, 101.6869], Jakarta: [-6.2088, 106.8456], Manila: [14.5995, 120.9842], 'Ho Chi Minh City': [10.8231, 106.6297],
  Kathmandu: [27.7172, 85.324], Sydney: [-33.8688, 151.2093], Melbourne: [-37.8136, 144.9631], Auckland: [-36.8485, 174.7633],
};

/** Cities outside India, by region (display order). Anything not listed here is in India. */
export const WORLD_REGIONS: Record<string, string[]> = {
  'Middle East': ['Dubai', 'Abu Dhabi', 'Doha', 'Riyadh', 'Tel Aviv', 'Istanbul'],
  'Asia-Pacific': ['Singapore', 'Hong Kong', 'Tokyo', 'Seoul', 'Shanghai', 'Beijing', 'Taipei', 'Bangkok', 'Kuala Lumpur', 'Jakarta', 'Manila', 'Ho Chi Minh City', 'Kathmandu', 'Sydney', 'Melbourne', 'Auckland'],
  'North America': ['San Francisco', 'New York', 'Los Angeles', 'Seattle', 'Austin', 'Boston', 'Chicago', 'Washington DC', 'Miami', 'Denver', 'Atlanta', 'San Diego', 'Toronto', 'Vancouver'],
  Europe: ['London', 'Paris', 'Berlin', 'Amsterdam', 'Dublin', 'Barcelona', 'Madrid', 'Lisbon', 'Munich', 'Milan', 'Zurich', 'Vienna', 'Prague', 'Warsaw', 'Copenhagen', 'Stockholm', 'Edinburgh'],
  'Latin America': ['Mexico City', 'São Paulo', 'Buenos Aires'],
  Africa: ['Cape Town', 'Nairobi', 'Lagos'],
};

/** Country for every non-Indian city (India is the default). */
export const CITY_COUNTRY: Record<string, string> = {
  'San Francisco': 'USA', 'New York': 'USA', 'Los Angeles': 'USA', Seattle: 'USA', Austin: 'USA', Boston: 'USA', Chicago: 'USA',
  'Washington DC': 'USA', Miami: 'USA', Denver: 'USA', Atlanta: 'USA', 'San Diego': 'USA', Toronto: 'Canada', Vancouver: 'Canada',
  'Mexico City': 'Mexico', 'São Paulo': 'Brazil', 'Buenos Aires': 'Argentina', London: 'UK', Edinburgh: 'UK', Dublin: 'Ireland',
  Paris: 'France', Berlin: 'Germany', Munich: 'Germany', Amsterdam: 'Netherlands', Barcelona: 'Spain', Madrid: 'Spain',
  Lisbon: 'Portugal', Milan: 'Italy', Zurich: 'Switzerland', Vienna: 'Austria', Prague: 'Czechia', Warsaw: 'Poland',
  Copenhagen: 'Denmark', Stockholm: 'Sweden', Istanbul: 'Türkiye', Dubai: 'UAE', 'Abu Dhabi': 'UAE', Doha: 'Qatar',
  Riyadh: 'Saudi Arabia', 'Tel Aviv': 'Israel', 'Cape Town': 'South Africa', Nairobi: 'Kenya', Lagos: 'Nigeria',
  Singapore: 'Singapore', 'Hong Kong': 'Hong Kong', Tokyo: 'Japan', Seoul: 'South Korea', Shanghai: 'China', Beijing: 'China',
  Taipei: 'Taiwan', Bangkok: 'Thailand', 'Kuala Lumpur': 'Malaysia', Jakarta: 'Indonesia', Manila: 'Philippines',
  'Ho Chi Minh City': 'Vietnam', Kathmandu: 'Nepal', Sydney: 'Australia', Melbourne: 'Australia', Auckland: 'New Zealand',
};

export function c(raw: Partial_): Community {
  const p = Object.fromEntries(Object.entries(raw).filter(([, v]) => v !== undefined)) as Partial_;
  const centre = CITY_CENTRE[p.city];
  return {
    id: p.slug,
    tagline: '',
    description: '',
    tags: [],
    area: null,
    location: p.location !== undefined ? p.location : centre ? { lat: centre[0], lng: centre[1], label: p.city, precision: 'city' } : null,
    meets: { cadence: 'unknown', summary: null },
    audience: { gender: 'all', ageNote: null, level: 'all' },
    pricing: { type: 'unknown', note: null },
    size: { bucket: 'unknown', note: null },
    hasEvents: true,
    mode: 'offline',
    ageBand: null,
    links: {},
    status: 'approved',
    imageUrl: null,
    createdAt: V,
    ...p,
  } as Community;
}
export const at = (lat: number, lng: number, label: string, precision: 'exact' | 'area' = 'area') => ({ lat, lng, label, precision });
export const ig = (h: string) => `https://www.instagram.com/${h}/`;
export const wa = (code: string) => `https://chat.whatsapp.com/${code}`;
export const CATEGORY_META: Record<CommunityCategory, { label: string; hue: number }> = {
  running:      { label: 'Running',       hue: 18 },
  cycling:      { label: 'Cycling',       hue: 200 },
  sports:       { label: 'Sports',        hue: 145 },
  fitness:      { label: 'Fitness',       hue: 350 },
  outdoors:     { label: 'Outdoors',      hue: 100 },
  tech:         { label: 'Tech',          hue: 225 },
  startup:      { label: 'Startup',       hue: 265 },
  creative:     { label: 'Creative',      hue: 320 },
  books:        { label: 'Books',         hue: 40 },
  food:         { label: 'Food',          hue: 10 },
  social:       { label: 'Social',        hue: 290 },
  language:     { label: 'Language',      hue: 180 },
  cause:        { label: 'Cause',         hue: 160 },
  wellbeing:    { label: 'Wellbeing',     hue: 70 },
  parents:      { label: 'Parents',       hue: 30 },
  pets:         { label: 'Pets',          hue: 55 },
  professional: { label: 'Professional',  hue: 210 },
  games:        { label: 'Games',         hue: 245 },
  dating:       { label: 'Singles',       hue: 335 },
  men:          { label: 'Men',           hue: 205 },
  women:        { label: 'Women',         hue: 305 },
  civic:        { label: 'Civic & consumer', hue: 120 },
  other:        { label: 'Other',         hue: 0 },
};
