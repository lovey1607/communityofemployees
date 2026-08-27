# scripts/generate_venues.py
import re
import json

raw_party_text = """
The Clock Tower - Golf Course Road - Classic British-style microbrewery with excellent craft beer and lively DJ nights.
Whisky Samba - Golf Course Road - Upscale bar with Gurgaon's largest whiskey selection and premium party vibes.
Cyber Hub Social - Cyber Hub - High-energy industrial-chic pub, famous for quirky cocktails and all-night dancing.
Molecule Air Bar - Sector 29 - WWII-themed rooftop microbrewery with molecular gastronomy and huge party spaces.
Soi 7 Pub & Brewery - Cyber Hub - Pan-Asian brewery with a boxing ring, live bands, and an energetic rooftop.
Manhattan Bar & Brewery - Golf Course Road - Vintage-themed microbrewery featuring Xbox gaming, bowling, and comedy nights.
REFLEX Bar, Brewery & Dining - Sector 66 - Ultra-premium luxury brewery with a 30-foot bar and professional DJ sets.
Imperfecto - Cyber Hub - Quirky, rustic Mediterranean bar with incredible live music and outdoor seating.
Prankster - Sector 29 - India's first college-themed brewery with nostalgia-inducing decor and spacious party zones.
Downtown - Diners & Living Beer Cafe - Sector 29 - One of Gurgaon's oldest and most reliable microbreweries with retro vibes.
The Drunken Botanist - Cyber Hub - Biophilic greenhouse-themed pub offering eccentric cocktails and great music.
Sutra Gastropub - Cyber Hub - Massive wooden rustic interiors with a huge outdoor area, known for crazy weekend parties.
Raasta - Cyber Hub - Caribbean lounge with reggae music, karaoke nights, and an open terrace.
Vapour Bar Exchange - Sector 29 - Stock market-themed bar where drink prices fluctuate based on demand.
Striker Skybar - Golf Course Road - Massive rooftop brewery with excellent craft beer and panoramic city views.
Romeo Lane - Sector 58 - Aesthetic botanical interiors with sunset views, artisanal cocktails, and a chic crowd.
Diablo - Cyber Hub - Gothic-themed luxury bar and club offering modern Mediterranean food and high-energy nights.
one8 Commune - Sector 66 - Virat Kohli's signature lounge, known for premium aesthetics and weekend DJ parties.
Warehouse Cafe - Sector 29 - Huge industrial-themed pub with a sprawling terrace, great for large group parties.
Hard Rock Cafe - Cyber Hub - Iconic rock-themed American bar with legendary live performances and huge burgers.
Farzi Cafe - Cyber Hub - Modern Indian bistro that turns into a high-energy bar post 9 PM.
The Piano Man Jazz Club - 32nd Avenue - Elegant live music venue focusing on jazz, blues, and an upscale drinking experience.
Quaff Brewing Co. - Cyber Hub - Classic American-style taproom with award-winning craft beers.
Factory by Sutra - Sector 29 - Three-story pub with a rooftop, co-working space, and an underground party vibe.
7 Degrees Brauhaus - South Point Mall (Golf Course Road) - Authentic Bavarian microbrewery with chestnut wood decor and German beers.
Friction The Drinkery - Sector 29 - Futuristic pub with liquid nitrogen cocktails and vibrant neon party lights.
Feel Alive - Sector 29 - Huge lounge offering private karaoke rooms, making it perfect for birthday parties.
Big Boyz Lounge - Sector 29 - Massive terrace lounge with a large dance floor and commercial Bollywood nights.
Ministry of Beer - Sector 29 - Steampunk-themed brewery with a futuristic vibe and sprawling seating.
Batli 29 - Sector 29 - Fun and quirky microbrewery specializing in experimental craft beers.
Ryu Bar - 32nd Avenue - Pan-Asian themed rooftop lounge with gorgeous umbrella decor and a lively bar.
Viet:Nom - Cyber Hub - Authentic Vietnamese restaurant that transforms into a bustling bar in the evening.
Michigan Taps - Golf Course Road - Classic arcade-style taproom with great beers and a relaxed party atmosphere.
Toy Room - Aerocity (Border) - Ultra-luxurious hip-hop club featuring the famous Frank the Bear mascot.
Bo-Tai Switch - Shangri-La (Border) - High-end Thai bar with theatrical cocktails and a posh party crowd.
Dragonfly Experience - Aerocity (Border) - Bug-themed luxury club by Badshah with massive ceilings and premium DJ events.
Dear Donna - Qutub (Border) - Extremely popular high-end club blending Victorian aesthetics with wild weekend parties.
Story Club and Lounge - Westin, MG Road - Elite 5-star nightclub featuring an open-air cigar lounge and heavy bass.
Club BW - Suryaa (Border) - Sleek black-and-white themed late-night club known for VIP partying.
Phantom - MGF Metropolitan (MG Road) - Old-school classic nightclub for hardcore dancing and late-night parties.
Odyssey - Sahara Mall (MG Road) - Budget-friendly, high-energy local club popular with youngsters.
Open Tap - Sector 29 - Casual microbrewery perfect for after-work parties and corporate team outings.
My Bar Headquarters - Sector 29 - Massive, affordable party venue known for loud music and cheap drinks.
The Hook Brewbay - Sector 29 - Seafood specialty brewery with a beach-shack vibe and rooftop seating.
Walking Street by Soi 7 - Sector 29 - Multi-level brewery with pool tables, gaming zones, and live sports screening.
Torgauer Brewpub - Raheja Mall (Sohna Road) - Hidden gem brewery offering German brews and a relaxed pub vibe.
Cervesia - Sector 29 - Beautiful terrace brewery known for good food and soothing live music.
The Beer Cafe - Cyber Hub - India's largest beer chain offering global brews in a casual hangout setting.
CAD Tech Bar - 32nd Avenue - Technology-themed bar with touchscreen tables and an interactive ordering system.
COMO Pizzeria & Tapas - 32nd Avenue - Chic European-style eatery with an excellent wine and cocktail menu.
Houz Cafe Bar - Sector 15 - Cozy, aesthetic lounge perfect for intimate parties and date nights.
Iridium - Sector 53 - Vibrant club and lounge offering premium hookahs and electronic dance music.
Under The Neem - Karma Lakelands - Scenic, upscale venue perfect for lavish outdoor brunches and day parties.
Gush Airbar & Brewery - Sector 29 - Trendy new rooftop brewery with neon aesthetics and commercial music.
3rd Eye Cafe - Sector 29 - Casual lounge known for its relaxed vibe and affordable party packages.
Brew Buddy - Sector 29 - Tap-on-table concept where you can pour your own beer straight from the keg.
Agent Jack's Bidding Bar - Sector 29 - Interactive bar where you can bid for the price of your drinks via an app.
Local - Sector 29 - Huge party venue with retro-industrial decor, ideal for massive college/corporate groups.
Chidya Ghar - Roseate House (Border) - Elite old-school bar offering the finest spirits for a sophisticated gathering.
The Irish House - Sector 66 - Classic pub with wooden interiors, massive screens, and a great beer selection.
Brewer Street - ILD Trade Centre (Sohna Road) - Large open-air microbrewery known for its relaxed ambiance and wheat beer.
Vapour Pub & Brewery - MGF Mega City (MG Road) - One of the oldest breweries in Gurgaon with consistent quality.
Tease - Taj City Centre (Sector 44) - Elegant 5-star lounge with a vibrant terrace and signature cocktails.
Rubicon Bar & Cigar Lounge - Leela Ambience - Extremely premium venue for elite networking and quiet, luxurious parties.
Sandhouse Cafe - 32nd Avenue - Artisanal burgers and craft beer spot with a highly Instagrammable interior.
Escape Terrace Bar & Kitchen - Sector 29 - Known for its beautiful al fresco seating and great live band performances.
Gravity Spacebar - Sector 29 - Space-themed microbrewery with unique aesthetics and a vibrant dance floor.
The Classroom - Sector 29 - School-themed pub offering a nostalgic vibe and great comfort food.
Bikanervala Boutique - Sector 29 - High-end vegetarian banquet space for family parties and functions.
Lemon Tree Hotel Banquets - Sector 60 - Professional corporate and family party halls accommodating up to 750 guests.
V Club - Sector 48 (Sohna Road) - Premium lifestyle club with massive party halls and pool-side venues.
Club Florence - Sector 56 - Elegant country club offering banquet halls, lawns, and sports facilities for parties.
Karma Lakelands - Sector 80 - Eco-friendly golf resort offering breathtaking lawns for luxury destination parties.
Sunday Resort and Banquet - Manesar - Sprawling venue tailored for massive weddings, pool parties, and corporate offsites.
Vishalgarh Farms - Sohna Road - Adventure farmhouse destination hosting up to 10,000 pax for mega daytime events.
Mango People Farm - Gurgaon - Rustic farmhouse offering an intimate, private setting for parties up to 100 pax.
Green Orchid Farm - Sohna Road - Beautifully landscaped farmhouse for large outdoor parties up to 800 pax.
Melody Farm - Sector 77 - Private farmhouse setup featuring bonfires and open-air catering for up to 200 guests.
South Patio - South City 2 - Elegant neighborhood club with banquets and lawns for residential parties.
Amour Convention - Sohna Road - Massive luxury banquet and lawn accommodating up to 1000 guests.
Bliss Premiere - Sector 17 - Giant event space and banquet hall capable of hosting 3000 guests.
The Colors Banquet - Sector 23 - Mid-sized venue with a lush lawn for family and corporate celebrations.
Radisson Hotel Banquets - Sohna Road - 5-star luxury banqueting for sophisticated indoor parties.
Circle Restaurant by Radisson - Sector 29 - Premium dine-in and private party venue for high-end gatherings.
Soca Brew Lounge - Sector 30 - Neighborhood brew lounge perfect for relaxed, casual get-togethers.
Klub Hermis - Sector 60 - Dedicated party destination for late-night music and dancing.
Aadat Hotel & Luxurio - Sector 52 - Convenient hotel venue offering end-to-end banquet party solutions.
Essel Prime - MG Road - Classic banquet hall well-suited for wedding receptions and big bashes.
Sky Luxuria Banquet - Sector 38 - Compact and elegant hall ideal for birthdays and anniversaries (20-100 pax).
BK Studio and Banquet - Sector 45 - Boutique space tailored for very small, intimate gatherings (25-60 pax).
Hotel Iris - Sector 15 - Boutique hotel offering well-managed banqueting for up to 250 guests.
Fortune Park Orange Hotel - Sidhrawali - Massive resort-style venue capable of handling 3750 guests for grand events.
Hotel 91 - Sector 43 - Premium budget-friendly hall for quick, hassle-free party planning.
Zahee - DLF Phase 3 - Neighborhood restaurant and banquet space for local family gatherings.
Anglow Bar Xchange - Gurgaon - Concept bar accommodating up to 400 pax with great food and drinks.
SYNX Hyper Sensory Bar - Sector 100 (Dwarka Expressway) - Innovative multi-sensory dining and party lounge.
Hydrama - Sohna Road - Intimate restaurant setting designed for small private parties of 10-80 pax.
Decode Lounge & Bar - Golf Course Road - Stylish lounge blending great mixology with a chic party atmosphere.
Aliste Hotels - Sector 43 - Boutique hotel space for customized, small-scale parties.
Saltstayz Premier - Sector 27 - Comfortable hotel venue for medium-sized gatherings up to 250 capacity.
"""

def sanitize(name):
    clean = re.sub(r'[^a-zA-Z0-9]', '', name).lower()
    return clean

# Read current sports venues from data/venues.ts
with open('data/venues.ts', 'r') as f:
    current_content = f.read()

# Extract the sports venues array portion
sports_start = current_content.find('// CATEGORY A: SPORTS & TOURNAMENTS')
sports_end = current_content.find('// CATEGORY B: FOOD, NIGHTCLUBS & LOUNGES')
sports_code = current_content[sports_start:sports_end].strip()

# Parse party venues
party_lines = [l.strip() for l in raw_party_text.strip().split('\n') if l.strip() and '-' in l]

party_venues = []
for idx, line in enumerate(party_lines, 1):
    parts = [p.strip() for p in line.split(' - ')]
    if len(parts) >= 3:
        name = parts[0]
        locality = parts[1]
        desc = ' - '.join(parts[2:])
    elif len(parts) == 2:
        name = parts[0]
        locality = 'Gurugram'
        desc = parts[1]
    else:
        continue
    
    s_key = sanitize(name)
    venue_id = f"venue_food_{idx:02d}"
    email = f"{s_key}123@coe.com"
    phone = f"+91 98112 {20000 + idx:05d}"
    comp_phone = f"+91 0124 42{idx:04d}"
    gst = f"07{s_key[:5].upper():<5}9988Z{idx%10}".replace(' ', 'A')
    
    # Amenities based on description
    amenities = ['Full Bar Setup', 'DJ & Audio Console', 'Private Dining Area', 'Corporate Invoicing']
    if 'brewery' in desc.lower() or 'beer' in desc.lower() or 'tap' in desc.lower():
        amenities = ['In-House Microbrewery', 'Craft Beer Taps', 'Rooftop / Indoor Seating', 'Live DJ Nights', 'Corporate Buffet']
    elif 'farmhouse' in desc.lower() or 'lawn' in desc.lower() or 'resort' in desc.lower():
        amenities = ['Sprawling Outdoor Lawns', 'Bonfire & BBQ Setup', 'Large Group Staging', 'Catering Kitchen', 'Valet Parking']
    elif 'club' in desc.lower() or 'nightclub' in desc.lower() or 'dance' in desc.lower():
        amenities = ['High-Tech Dance Floor', 'VIP Bottle Service', 'Electronic Sound System', 'Private Cabanas', 'Late Night License']
    elif 'banquet' in desc.lower() or 'hotel' in desc.lower():
        amenities = ['Air Conditioned Banquet Hall', 'Projector & AV Rig', 'Live Buffet Counters', 'Valet Parking', 'Green Room']
    elif 'jazz' in desc.lower() or 'music' in desc.lower() or 'acoustic' in desc.lower():
        amenities = ['Live Music Stage', 'Acoustic Sound Engineering', 'Artisanal Cocktails', 'Fine Dining Menu']

    rating = round(4.4 + (idx % 6) * 0.1, 1)
    user_ratings = 800 + (idx * 47) % 3200
    avg_cost = 1400 + (idx * 90) % 1800
    
    party_venues.append({
        'id': venue_id,
        'sanitizedKey': s_key,
        'name': name,
        'category': 'food',
        'rating': rating,
        'user_ratings_total': user_ratings,
        'timings': '12:00 PM - 12:30 AM' if 'club' not in desc.lower() else '8:00 PM - 3:00 AM',
        'locality': locality,
        'address': f"{name}, {locality}, Gurugram, Delhi NCR 122002",
        'city': 'Gurugram' if 'Noida' not in locality and 'Delhi' not in locality else locality.split()[0],
        'distanceKm': round(1.5 + (idx % 12) * 0.7, 1),
        'email': email,
        'defaultPassword': 'gurgaon123',
        'phone': phone,
        'companyPhone': comp_phone,
        'gstNumber': gst,
        'avgCostPerPerson': avg_cost,
        'amenities': amenities,
        'description': desc,
        'corporateSuitability': f"Tailored for {name} corporate mixers, team parties, annual dinners, and celebration bashes.",
        'entityType': 'Pvt Ltd' if idx % 3 != 0 else 'Partnership',
        'pastClients': ['Google India', 'Microsoft', 'Zomato', 'Deloitte', 'KPMG', 'Paytm', 'Airtel'][idx % 4 : (idx % 4) + 4],
        'place_id': f"ChIJ_{s_key}_delhi_ncr",
        'lat': round(28.4500 + (idx % 20) * 0.005, 4),
        'lng': round(77.0500 + (idx % 20) * 0.004, 4),
        'reviews': [
            {
                'author_name': f"Priya Sharma ({['Google', 'Microsoft', 'Deloitte', 'KPMG', 'Airtel'][idx % 5]} HR)",
                'rating': 5,
                'relative_time_description': '1 week ago',
                'text': f"Hosted our department bash at {name}. Impeccable hospitality, swift bar service, and transparent itemized billing."
            }
        ]
    })

# Format TypeScript output
header = """// ============================================================
// data/venues.ts — Pre-Seeded Verified Delhi NCR Venues Database
// Internal persistent mock directory for Sports complexes and Party places.
// Every venue has dedicated pre-configured credentials (default password: gurgaon123)
// ============================================================

import { CategoryType, User, VendorProfile } from '@/lib/types';

export interface GurugramVenueReview {
  author_name: string;
  rating: number;
  relative_time_description: string;
  text: string;
}

export interface GurugramVenue {
  id: string;
  sanitizedKey: string;
  name: string;
  category: CategoryType;
  rating: number;
  user_ratings_total: number;
  timings: string;
  locality: string;
  address: string;
  city: string;
  distanceKm: number;
  email: string;
  defaultPassword?: string;
  phone: string;
  companyPhone: string;
  gstNumber: string;
  avgCostPerPerson: number;
  amenities: string[];
  description: string;
  corporateSuitability: string;
  entityType?: 'Pvt Ltd' | 'Partnership' | 'Proprietorship' | 'LLP';
  pastClients?: string[];
  place_id: string;
  lat: number;
  lng: number;
  reviews?: GurugramVenueReview[];
}

export const GURUGRAM_PRESEEDED_VENUES: GurugramVenue[] = [
"""

party_ts_items = []
for v in party_venues:
    amenities_str = json.dumps(v['amenities'])
    past_clients_str = json.dumps(v['pastClients'])
    reviews_str = json.dumps(v['reviews'], indent=6)
    safe_name = v['name'].replace("'", "\\'")
    safe_locality = v['locality'].replace("'", "\\'")
    safe_address = v['address'].replace("'", "\\'")
    safe_city = v['city'].replace("'", "\\'")
    safe_desc = v['description'].replace("'", "\\'")
    safe_suit = v['corporateSuitability'].replace("'", "\\'")
    
    item = f"""  {{
    id: '{v['id']}',
    sanitizedKey: '{v['sanitizedKey']}',
    name: '{safe_name}',
    category: 'food',
    rating: {v['rating']},
    user_ratings_total: {v['user_ratings_total']},
    timings: '{v['timings']}',
    locality: '{safe_locality}',
    address: '{safe_address}',
    city: '{safe_city}',
    distanceKm: {v['distanceKm']},
    email: '{v['email']}',
    defaultPassword: 'gurgaon123',
    phone: '{v['phone']}',
    companyPhone: '{v['companyPhone']}',
    gstNumber: '{v['gstNumber']}',
    avgCostPerPerson: {v['avgCostPerPerson']},
    amenities: {amenities_str},
    description: '{safe_desc}',
    corporateSuitability: '{safe_suit}',
    entityType: '{v['entityType']}',
    pastClients: {past_clients_str},
    place_id: '{v['place_id']}',
    lat: {v['lat']},
    lng: {v['lng']},
    reviews: {reviews_str},
  }},"""
    party_ts_items.append(item)

party_block = f"""  // ══════════════════════════════════════════════════════════════
  // CATEGORY B: FOOD, NIGHTCLUBS & LOUNGES ({len(party_venues)} Venues)
  // ══════════════════════════════════════════════════════════════
""" + '\n'.join(party_ts_items)

footer = """
];

// ─── Helper Functions ──────────────────────────────────────────

/**
 * Generate User accounts for all pre-seeded venues
 */
export function generatePreseededUsers(): User[] {
  return GURUGRAM_PRESEEDED_VENUES.map((venue, idx) => ({
    id: `user_venue_${venue.sanitizedKey}`,
    email: venue.email.toLowerCase(),
    role: 'vendor',
    createdAt: '2026-07-20T10:00:00Z',
    isSuspended: false,
  }));
}

/**
 * Generate VendorProfile records for all pre-seeded venues
 */
export function generatePreseededVendorProfiles(): VendorProfile[] {
  return GURUGRAM_PRESEEDED_VENUES.map((venue, idx) => ({
    id: `vp_venue_${venue.sanitizedKey}`,
    userId: `user_venue_${venue.sanitizedKey}`,
    category: venue.category,
    vendorName: `${venue.name} Representative`,
    companyName: venue.name,
    mobile: venue.phone,
    companyMobile: venue.companyPhone,
    address: venue.address,
    city: venue.city,
    locality: venue.locality,
    distanceKm: venue.distanceKm,
    entityType: venue.entityType || 'Pvt Ltd',
    gstNumber: venue.gstNumber,
    gstVerified: true,
    portfolioSummary: venue.description,
    corporateSuitability: venue.corporateSuitability,
    pastClients: venue.pastClients || [],
    status: 'approved',
    isCompleted: true,
    submittedAt: '2026-07-20T10:00:00Z',
    verifiedAt: '2026-07-20T12:00:00Z',
    place_id: venue.place_id,
    formatted_address: venue.address,
    placeName: venue.name,
    lat: venue.lat,
    lng: venue.lng,
    rating: venue.rating,
    user_ratings_total: venue.user_ratings_total,
    timings: venue.timings,
    amenities: venue.amenities,
    avgCostPerPerson: venue.avgCostPerPerson,
  }));
}
"""

full_content = header + "  " + sports_code + "\n\n" + party_block + "\n" + footer

with open('data/venues.ts', 'w') as f:
    f.write(full_content)

print(f"Successfully generated data/venues.ts with {len(party_venues)} party venues and full credentials!")
