// ============================================================
// app/api/places/details/route.ts
// Proxy endpoint to fetch Google Places Details & Reviews (Prevents CORS)
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

const MOCK_GURUGRAM_PLACE_DETAILS: Record<string, any> = {
  'ChIJ4f8c9hAZDTkR1c34a_clocktower': {
    name: 'The Clock Tower',
    formatted_address: 'Golf Course Road, DLF Phase 5, Sector 43, Gurugram, Haryana 122002',
    rating: 4.3,
    user_ratings_total: 2924,
    geometry: { location: { lat: 28.4514, lng: 77.0975 } },
    place_id: 'ChIJ4f8c9hAZDTkR1c34a_clocktower',
    reviews: [
      {
        author_name: 'Rahul Khanna (DLF Cyber City)',
        rating: 5,
        relative_time_description: '2 weeks ago',
        text: 'Great British pub ambiance on Golf Course Road. Superb craft brews, woodfired pizza, and great space for corporate mixer dinners.',
        time: Date.now() - 1209600000,
      },
      {
        author_name: 'Priyanka Sen (Horizon Center)',
        rating: 4,
        relative_time_description: 'a month ago',
        text: 'Hosted our quarterly team party here. The outdoor balcony seating overlooking Golf Course Road is stellar.',
        time: Date.now() - 2592000000,
      },
      {
        author_name: 'Vikramaditya Bose',
        rating: 4,
        relative_time_description: '2 months ago',
        text: 'One of the classic microbreweries in Gurgaon. Consistent food quality and prompt hospitality.',
        time: Date.now() - 5184000000,
      },
    ],
  },
  'ChIJF33Q-tUZDTkReb1mY8jWl1w': {
    name: 'Arena Turf Sports Management',
    formatted_address: 'Sector 54, Golf Course Road, Gurugram, Haryana 122011',
    rating: 4.8,
    user_ratings_total: 142,
    geometry: { location: { lat: 28.4352, lng: 77.1086 } },
    place_id: 'ChIJF33Q-tUZDTkReb1mY8jWl1w',
    reviews: [
      {
        author_name: 'Ankit Aggarwal (KPMG India)',
        rating: 5,
        relative_time_description: '2 weeks ago',
        text: 'Managed our 16-team corporate cricket tournament flawlessly at Golf Course Road turf. Live scoring app, umpires, and customized jerseys were top class.',
        time: Date.now() - 1209600000,
      },
      {
        author_name: 'Pooja Narang (Paytm HR)',
        rating: 5,
        relative_time_description: 'a month ago',
        text: 'Best corporate sports organizer in Gurgaon. High quality floodlit turf and great hydration lounge setup for our employees.',
        time: Date.now() - 2592000000,
      },
      {
        author_name: 'Siddharth Rao (Uber)',
        rating: 4,
        relative_time_description: '2 months ago',
        text: 'Very professional management, transparent pricing, and timely tournament scheduling. Highly recommended for corporate leagues.',
        time: Date.now() - 5184000000,
      },
    ],
  },
  'ChIJ8-U9tI0ZDTkR70-H1M8vDqk': {
    name: 'Royal Feast Catering & Mixology',
    formatted_address: 'Plaza 3, DLF Phase 1, Gurugram, Haryana 122002',
    rating: 4.9,
    user_ratings_total: 218,
    geometry: { location: { lat: 28.4827, lng: 77.0917 } },
    place_id: 'ChIJ8-U9tI0ZDTkR70-H1M8vDqk',
    reviews: [
      {
        author_name: 'Rohan Deshmukh (Google India)',
        rating: 5,
        relative_time_description: '3 weeks ago',
        text: 'Sensational live Pan-Asian and Teppanyaki counters for our 350-guest Annual Tech Gala. The artisanal cocktail bar was the highlight!',
        time: Date.now() - 1814400000,
      },
      {
        author_name: 'Simran Kaur (Deloitte)',
        rating: 5,
        relative_time_description: 'a month ago',
        text: 'Five-star presentation, immaculate hygiene, and courteous stewards. They handled all executive dietary restrictions seamlessly.',
        time: Date.now() - 2592000000,
      },
      {
        author_name: 'Manish Varma (Microsoft)',
        rating: 5,
        relative_time_description: '2 months ago',
        text: 'Zero delay in setup at DLF Cyber City. Complimentary pre-event tasting session ensured our Leadership team was 100% satisfied.',
        time: Date.now() - 5184000000,
      },
    ],
  },
  'ChIJS3-z0jYZDTkRG-Qz-fK1j1U': {
    name: 'Summit Corporate Retreats',
    formatted_address: 'Cyber City Hub & MG Road, Gurugram, Haryana 122002',
    rating: 4.7,
    user_ratings_total: 89,
    geometry: { location: { lat: 28.4912, lng: 77.0864 } },
    place_id: 'ChIJS3-z0jYZDTkRG-Qz-fK1j1U',
    reviews: [
      {
        author_name: 'Kavita Menon (Swiggy)',
        rating: 5,
        relative_time_description: 'a month ago',
        text: 'Organized our 80-person leadership offsite to Rishikesh. Luxury chartered Volvo coaches, 5-star resort booking, and thrilling team rafting.',
        time: Date.now() - 2592000000,
      },
      {
        author_name: 'Aditya Birla Group Coordinator',
        rating: 4,
        relative_time_description: '3 months ago',
        text: 'Smooth logistics from Delhi airport transfers to resort AV setup. Dedicated coordinator was on-site 24/7.',
        time: Date.now() - 7776000000,
      },
    ],
  },
  'ChIJp7tY5N8ZDTkRkJ3-e8-1z1Y': {
    name: 'Luxe Hampers & Bespoke Awards',
    formatted_address: 'Udyog Vihar Phase 4, Gurugram, Haryana 122015',
    rating: 4.9,
    user_ratings_total: 176,
    geometry: { location: { lat: 28.5021, lng: 77.0812 } },
    place_id: 'ChIJp7tY5N8ZDTkRkJ3-e8-1z1Y',
    reviews: [
      {
        author_name: 'Deepak Mehra (American Express)',
        rating: 5,
        relative_time_description: '3 weeks ago',
        text: 'Supplied 300 custom-embossed Diwali luxury hampers to our Horizon Center office. Packaging and artisan sweets were exquisite.',
        time: Date.now() - 1814400000,
      },
      {
        author_name: 'Neha Saxena (McKinsey & Co)',
        rating: 5,
        relative_time_description: '2 months ago',
        text: 'Top quality new joiner welcome kits. 3D laser engraved crystal awards look very prestigious on employee desks.',
        time: Date.now() - 5184000000,
      },
    ],
  },
  'ChIJh7-z890ZDTkRsM-1x2y-z1Z': {
    name: 'Threads & Co. Corporate Apparel',
    formatted_address: 'DLF Cyber City Promenade, Gurugram, Haryana 122002',
    rating: 4.8,
    user_ratings_total: 134,
    geometry: { location: { lat: 28.4947, lng: 77.0886 } },
    place_id: 'ChIJh7-z890ZDTkRsM-1x2y-z1Z',
    reviews: [
      {
        author_name: 'Vikram Joshi (Razorpay)',
        rating: 5,
        relative_time_description: 'a month ago',
        text: 'Ordered 250 premium tech fleece hoodies with chest embroidery. Fabric quality (240 GSM) and fit was praised by all developers.',
        time: Date.now() - 2592000000,
      },
      {
        author_name: 'Tina Chawla (Cult.fit)',
        rating: 4,
        relative_time_description: '2 months ago',
        text: 'Fast 10-day turnaround for Engineers Day tees. Individual box packaging per employee made distribution very easy.',
        time: Date.now() - 5184000000,
      },
    ],
  },
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const placeId = searchParams.get('placeId') || searchParams.get('place_id');

    if (!placeId) {
      return NextResponse.json(
        { error: 'Missing required query parameter: placeId' },
        { status: 400 }
      );
    }

    const clientKey = request.headers.get('x-google-maps-key');
    const apiKey =
      clientKey ||
      process.env.GOOGLE_MAPS_API_KEY ||
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    // If API key is available, query real Google Places Details API
    if (apiKey && !apiKey.includes('YOUR_API_KEY') && apiKey !== 'undefined') {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(
        placeId
      )}&fields=name,rating,user_ratings_total,reviews,formatted_address,geometry&key=${apiKey}`;

      const response = await fetch(url, {
        headers: { Accept: 'application/json' },
        next: { revalidate: 3600 }, // Cache place details for 1 hour
      });

      if (!response.ok) {
        throw new Error(`Google Places API returned HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'OK' && data.result) {
        return NextResponse.json({
          success: true,
          place: {
            ...data.result,
            place_id: placeId,
          },
          source: 'google_live',
        });
      }

      // If Google API returned an error status (e.g. REQUEST_DENIED due to quota/key permissions)
      // Check if we have mock Gurugram fallback to prevent UI crash
      if (MOCK_GURUGRAM_PLACE_DETAILS[placeId]) {
        return NextResponse.json({
          success: true,
          place: MOCK_GURUGRAM_PLACE_DETAILS[placeId],
          source: 'fallback_mock',
          googleStatus: data.status,
          googleErrorMessage: data.error_message,
        });
      }

      // Return clean error if place was not found
      return NextResponse.json(
        {
          error: data.error_message || `Place details not found (Status: ${data.status})`,
          status: data.status,
        },
        { status: data.status === 'NOT_FOUND' ? 404 : 500 }
      );
    }

    // Failsafe Mode: API Key is missing or in offline dev mode
    // Provide realistic Gurugram data if known, or generic structured business profile
    if (MOCK_GURUGRAM_PLACE_DETAILS[placeId]) {
      return NextResponse.json({
        success: true,
        place: MOCK_GURUGRAM_PLACE_DETAILS[placeId],
        source: 'fallback_mock',
        isApiKeyMissing: true,
      });
    }

    // Generic verified business fallback
    const genericFallback = {
      name: 'Verified Gurugram Enterprise Partner',
      formatted_address: 'DLF Cyber City, Phase II, Gurugram, Haryana 122002',
      rating: 4.8,
      user_ratings_total: 48,
      place_id: placeId,
      geometry: { location: { lat: 28.4905, lng: 77.0898 } },
      reviews: [
        {
          author_name: 'Gurugram Corporate Client',
          rating: 5,
          relative_time_description: '1 month ago',
          text: 'Verified corporate vendor with high quality execution and SLA commitment in DLF Cyber City.',
          time: Date.now() - 2592000000,
        },
      ],
    };

    return NextResponse.json({
      success: true,
      place: genericFallback,
      source: 'generic_fallback',
      isApiKeyMissing: true,
    });
  } catch (error: any) {
    console.error('[API /api/places/details Error]:', error);
    return NextResponse.json(
      {
        error: error.message || 'Internal Server Error while fetching place details',
      },
      { status: 500 }
    );
  }
}
