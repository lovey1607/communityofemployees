'use client';
// ============================================================
// components/maps/GoogleMapsApiKeyWarning.tsx
// Dark-themed failsafe warning when Google Maps API Key is missing.
// ============================================================

import React from 'react';
import { AlertTriangle, MapPin, Key, ExternalLink } from 'lucide-react';

interface GoogleMapsApiKeyWarningProps {
  compact?: boolean;
  featureName?: string;
}

export function GoogleMapsApiKeyWarning({
  compact = false,
  featureName = 'Google Maps Autocomplete & Places Reviews',
}: GoogleMapsApiKeyWarningProps) {
  if (compact) {
    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 12px',
          borderRadius: 8,
          background: 'rgba(234, 179, 8, 0.12)',
          border: '1px solid rgba(234, 179, 8, 0.35)',
          color: '#fbbf24',
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        <AlertTriangle size={14} className="flex-shrink-0 text-amber-400" />
        <span>⚠️ Google Maps API Key Missing. Please add <code style={{ fontFamily: 'monospace', color: '#ffffff' }}>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to your environment variables.</span>
      </div>
    );
  }

  return (
    <div
      style={{
        borderRadius: 14,
        padding: '16px 18px',
        background: 'rgba(234, 179, 8, 0.08)',
        border: '1px solid rgba(234, 179, 8, 0.3)',
        color: '#ffffff',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'rgba(234, 179, 8, 0.2)',
            border: '1px solid rgba(234, 179, 8, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fbbf24',
            flexShrink: 0,
          }}
        >
          <AlertTriangle size={18} />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: '#fef08a', marginBottom: 4 }}>
            ⚠️ Google Maps API Key Missing. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables.
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.65)', lineHeight: 1.5 }}>
            To enable live Google Places Autocomplete and verified Google Business reviews in Gurugram, configure your Google Maps API key in <code style={{ fontFamily: 'monospace', color: '#6ee7b7', background: 'rgba(0,0,0,0.3)', padding: '1px 6px', borderRadius: 4 }}>.env.local</code>.
          </div>
          <div
            style={{
              marginTop: 10,
              padding: '8px 12px',
              borderRadius: 8,
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              fontFamily: 'monospace',
              fontSize: 11.5,
              color: '#93c5fd',
            }}
          >
            NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy...
          </div>
        </div>
      </div>
    </div>
  );
}
