// ============================================================
// app/api/places/details/route.ts
// Server-side proxy for Google Places Details (keeps the key off the client).
//
// INTEGRITY NOTE — what used to be here:
// This route shipped a large table of invented "Google reviews" — five-star
// write-ups signed with made-up names at real companies ("… (American
// Express)", "… (McKinsey & Co)") — and served them whenever the Google key
// was missing or Google returned an error. The UI rendered them as genuine
// Google reviews behind a trust badge. Those are gone. When live review data
// is unavailable the response says so, and the widget says so too.
//
// What remains as a fallback is the venue's own directory record from
// data/venues.ts: name, address and coordinates. Facts about a place, not
// testimony about it.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { GURUGRAM_PRESEEDED_VENUES } from '@/data/venues';

export const dynamic = 'force-dynamic';

interface PlaceFacts {
  name: string;
  formatted_address?: string;
  place_id: string;
  geometry?: { location: { lat: number; lng: number } };
}

/** Directory facts only — no rating, no review count, no reviews. */
function directoryFactsFor(placeId: string): PlaceFacts | null {
  const venue = GURUGRAM_PRESEEDED_VENUES.find((v) => v.place_id === placeId);
  if (!venue) return null;
  return {
    name: venue.name,
    formatted_address: venue.address,
    place_id: placeId,
    geometry: { location: { lat: venue.lat, lng: venue.lng } },
  };
}

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

    // Server configuration only. A client-supplied key header used to be
    // honoured here, which let any caller make this server spend a key of
    // their choosing.
    const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const keyConfigured = Boolean(apiKey && !apiKey.includes('YOUR_API_KEY') && apiKey !== 'undefined');

    if (keyConfigured) {
      const url =
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}` +
        `&fields=name,rating,user_ratings_total,reviews,formatted_address,geometry&key=${apiKey}`;

      const response = await fetch(url, {
        headers: { Accept: 'application/json' },
        next: { revalidate: 3600 },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'OK' && data.result) {
          return NextResponse.json({
            success: true,
            place: { ...data.result, place_id: placeId },
            source: 'google_live',
          });
        }
        if (data.status === 'NOT_FOUND' || data.status === 'ZERO_RESULTS') {
          return NextResponse.json(
            { success: false, error: 'No Google listing found for this place.', status: data.status },
            { status: 404 }
          );
        }
        console.warn('[places/details] Google returned', data.status, data.error_message);
      } else {
        console.warn('[places/details] Google returned HTTP', response.status);
      }
      // Fall through to the directory facts below rather than inventing data.
    }

    const facts = directoryFactsFor(placeId);
    return NextResponse.json({
      success: true,
      // No `rating`, `user_ratings_total` or `reviews`: the client must render
      // "reviews unavailable", never a fabricated score.
      place: facts ?? { name: 'Vendor', place_id: placeId },
      reviewsAvailable: false,
      source: facts ? 'coe_directory' : 'unknown_place',
      reason: keyConfigured
        ? 'Google Places did not return review data for this place.'
        : 'Live Google reviews are not connected on this deployment.',
    });
  } catch (error) {
    console.error('[api/places/details] error', error);
    return NextResponse.json(
      { success: false, error: 'Could not load place details.' },
      { status: 500 }
    );
  }
}
