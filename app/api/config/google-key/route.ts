// ============================================================
// app/api/config/google-key/route.ts
// Live Google Maps API Key configuration endpoint.
// Allows user to connect their live Google Cloud API key directly from UI.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json();
    const cleanKey = (apiKey || '').trim();

    if (!cleanKey) {
      return NextResponse.json({ error: 'API key is required' }, { status: 400 });
    }

    // Set in runtime process.env
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = cleanKey;
    process.env.GOOGLE_MAPS_API_KEY = cleanKey;

    // Save to .env.local file
    const envPath = path.join(process.cwd(), '.env.local');
    const envContent = `# Google Maps API Key configured via COE Portal UI\nNEXT_PUBLIC_GOOGLE_MAPS_API_KEY=${cleanKey}\nGOOGLE_MAPS_API_KEY=${cleanKey}\n`;
    fs.writeFileSync(envPath, envContent, 'utf8');

    return NextResponse.json({
      success: true,
      message: 'Google Maps API Key successfully connected!',
      isLive: true,
    });
  } catch (error: any) {
    console.error('[Save Google API Key Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to save API key' }, { status: 500 });
  }
}

export async function GET() {
  const key = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  const isConfigured = Boolean(key && !key.includes('YOUR_API_KEY') && key !== 'undefined');
  return NextResponse.json({
    isConfigured,
    maskedKey: isConfigured ? `${key.substring(0, 6)}...${key.substring(key.length - 4)}` : null,
  });
}
