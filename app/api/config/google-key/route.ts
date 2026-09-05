// ============================================================
// app/api/config/google-key/route.ts
// Reports whether a Google Maps key is configured. Read-only.
//
// SECURITY NOTE — what used to be here:
// This route also accepted an unauthenticated POST that took an arbitrary
// string from the request body and OVERWROTE .env.local with it. Anyone who
// could reach the server could rewrite its environment file — and after the
// backend migration that file also holds DATABASE_URL and AUTH_SECRET, so
// the same request would have destroyed the app's database and session
// config. The write path is gone; the key comes from the environment only.
// ============================================================

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const key = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  const isConfigured = Boolean(key && !key.includes('YOUR_API_KEY') && key !== 'undefined');
  return NextResponse.json({
    isConfigured,
    // A masked fingerprint only — enough to tell two keys apart in the UI,
    // not enough to use.
    maskedKey: isConfigured ? `${key.slice(0, 6)}…${key.slice(-4)}` : null,
    howToConfigure: isConfigured
      ? undefined
      : 'Set GOOGLE_MAPS_API_KEY in your environment (see .env.example) and restart the server.',
  });
}
