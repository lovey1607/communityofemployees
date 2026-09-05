'use client';
// ============================================================
// components/maps/NearbyVendors.tsx
//
// "What's near me" for the public vendor directory.
//
// Two things worth knowing about how this behaves:
//
//  1. Location is never requested on page load. The browser prompt only
//     appears after the visitor presses the button, and the button says what
//     the coordinates are used for. That is the consent step.
//  2. Every fallback still works. No location → the list renders unsorted.
//     No browser Maps key → the map is replaced by the same list. A denied
//     prompt is a normal outcome, not an error state.
// ============================================================

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { GoogleMap, MarkerF, InfoWindowF, useJsApiLoader } from '@react-google-maps/api';
import { MapPin, Navigation, Search, Star, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '@/lib/apiClient';
import type { CategoryType } from '@/lib/types';
import { CATEGORY_LABELS } from '@/lib/themes';

interface DirectoryVendor {
  id: string;
  companyName: string;
  category: CategoryType;
  city: string;
  locality?: string;
  address: string;
  lat?: number;
  lng?: number;
  rating?: number;
  user_ratings_total?: number;
  avgCostPerPerson?: number;
  amenities?: string[];
  portfolioSummary?: string;
  distanceFromYouKm: number | null;
}

// Cyber Hub — the pilot's centre of gravity, and the map's default view.
const CYBER_HUB = { lat: 28.4949, lng: 77.0895 };

const CATEGORY_OPTIONS: { value: CategoryType | 'all'; label: string }[] = [
  { value: 'all', label: 'All categories' },
  { value: 'sports', label: 'Sports' },
  { value: 'food', label: 'Food & venues' },
  { value: 'trips', label: 'Trips & offsites' },
  { value: 'gifts', label: 'Gifting' },
  { value: 'dress', label: 'Merchandise' },
];

const MAP_STYLE: React.CSSProperties = { width: '100%', height: '100%' };

export function NearbyVendors() {
  const browserKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY ?? '';
  const { isLoaded: mapReady, loadError } = useJsApiLoader({
    id: 'coe-google-maps',
    googleMapsApiKey: browserKey,
    // Guard against calling the loader with an empty key.
    preventGoogleFontsLoading: true,
  });

  const [vendors, setVendors] = useState<DirectoryVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<CategoryType | 'all'>('all');
  const [query, setQuery] = useState('');
  const [origin, setOrigin] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationNote, setLocationNote] = useState<string | null>(null);
  const [maxDistance, setMaxDistance] = useState<number>(0); // 0 = no limit
  const [activeMarker, setActiveMarker] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '60' });
      if (category !== 'all') params.set('category', category);
      if (query.trim()) params.set('q', query.trim());
      if (origin) {
        params.set('lat', String(origin.lat));
        params.set('lng', String(origin.lng));
      }
      const data = await api.get<{ vendors: DirectoryVendor[] }>(`/api/vendors?${params}`);
      setVendors(data.vendors);
    } catch {
      setVendors([]);
    } finally {
      setLoading(false);
    }
  }, [category, query, origin]);

  useEffect(() => {
    const timer = setTimeout(() => void load(), query ? 350 : 0);
    return () => clearTimeout(timer);
  }, [load, query]);

  const requestLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocationNote('This browser cannot share a location. Search by area instead.');
      return;
    }
    setLocating(true);
    setLocationNote(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setOrigin({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLocating(false);
        setLocationNote('Sorted by distance from you.');
      },
      (error) => {
        setLocating(false);
        setLocationNote(
          error.code === error.PERMISSION_DENIED
            ? 'No problem — showing everyone instead. You can filter by area below.'
            : 'Could not get a location fix. Showing everyone instead.'
        );
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300_000 }
    );
  };

  const visible = useMemo(() => {
    if (!origin || maxDistance === 0) return vendors;
    return vendors.filter((v) => v.distanceFromYouKm !== null && v.distanceFromYouKm <= maxDistance);
  }, [vendors, origin, maxDistance]);

  const mapped = visible.filter((v) => v.lat != null && v.lng != null);
  const center = origin ?? (mapped[0]?.lat != null ? { lat: mapped[0].lat!, lng: mapped[0].lng! } : CYBER_HUB);
  const showMap = Boolean(browserKey) && mapReady && !loadError;

  const card: React.CSSProperties = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: 14,
    padding: 14,
  };
  const control: React.CSSProperties = {
    padding: '10px 12px',
    borderRadius: 11,
    border: '1px solid rgba(255,255,255,0.14)',
    background: 'rgba(255,255,255,0.04)',
    color: '#e8ecf5',
    fontSize: 13.5,
  };

  return (
    <div>
      {/* ── Controls ── */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: 12, color: '#8b95ab' }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or locality — Cyber Hub, Sohna Road…"
            style={{ ...control, width: '100%', paddingLeft: 34 }}
          />
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as CategoryType | 'all')}
          style={{ ...control, flex: '0 1 190px' }}
        >
          {CATEGORY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <button
          type="button"
          onClick={requestLocation}
          disabled={locating}
          style={{
            ...control,
            cursor: locating ? 'wait' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            fontWeight: 600,
            color: origin ? '#34d399' : '#e8ecf5',
            borderColor: origin ? 'rgba(52,211,153,0.4)' : 'rgba(255,255,255,0.14)',
          }}
        >
          {locating ? <Loader2 size={15} className="spin" /> : <Navigation size={15} />}
          {origin ? 'Using your location' : 'Find what’s near me'}
        </button>
      </div>

      <p style={{ margin: '0 0 14px', fontSize: 12, color: '#8b95ab', lineHeight: 1.55 }}>
        {locationNote ??
          'We only ask your browser for a location when you press that button, and we use it to sort this list. It is not stored or sent anywhere else.'}
      </p>

      {origin && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {[0, 3, 5, 10, 25].map((km) => (
            <button
              key={km}
              type="button"
              onClick={() => setMaxDistance(km)}
              style={{
                padding: '5px 12px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                border: maxDistance === km ? '1px solid #f97316' : '1px solid rgba(255,255,255,0.14)',
                background: maxDistance === km ? 'rgba(249,115,22,0.14)' : 'transparent',
                color: maxDistance === km ? '#f97316' : '#8b95ab',
              }}
            >
              {km === 0 ? 'Any distance' : `Within ${km} km`}
            </button>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: showMap ? 'minmax(0,1fr) minmax(0,1fr)' : '1fr', gap: 16 }}>
        {/* ── Map ── */}
        {showMap && (
          <div style={{ ...card, padding: 0, overflow: 'hidden', minHeight: 420, height: '100%' }}>
            <GoogleMap
              mapContainerStyle={MAP_STYLE}
              center={center}
              zoom={origin ? 12 : 11}
              options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: false }}
            >
              {origin && (
                <MarkerF
                  position={origin}
                  title="You are here"
                  icon={{
                    path: (typeof google !== 'undefined' && google.maps.SymbolPath.CIRCLE) as never,
                    scale: 8,
                    fillColor: '#38bdf8',
                    fillOpacity: 1,
                    strokeColor: '#0B0F17',
                    strokeWeight: 2,
                  }}
                />
              )}
              {mapped.map((v) => (
                <MarkerF
                  key={v.id}
                  position={{ lat: v.lat!, lng: v.lng! }}
                  title={v.companyName}
                  onClick={() => setActiveMarker(v.id)}
                >
                  {activeMarker === v.id && (
                    <InfoWindowF onCloseClick={() => setActiveMarker(null)}>
                      <div style={{ color: '#111827', maxWidth: 210 }}>
                        <strong style={{ display: 'block', fontSize: 13 }}>{v.companyName}</strong>
                        <span style={{ fontSize: 12 }}>{v.locality ?? v.city}</span>
                        {v.distanceFromYouKm !== null && (
                          <span style={{ display: 'block', fontSize: 12, marginTop: 3 }}>
                            {v.distanceFromYouKm} km away
                          </span>
                        )}
                      </div>
                    </InfoWindowF>
                  )}
                </MarkerF>
              ))}
            </GoogleMap>
          </div>
        )}

        {/* ── List ── */}
        <div style={{ display: 'grid', gap: 10, maxHeight: showMap ? 640 : undefined, overflowY: showMap ? 'auto' : undefined }}>
          {!browserKey && (
            <div style={{ ...card, display: 'flex', gap: 9, alignItems: 'flex-start', color: '#fbbf24', fontSize: 12.5 }}>
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>
                The map needs a browser Maps key (<code>NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY</code>). The
                distance list below works without it.
              </span>
            </div>
          )}

          {loading ? (
            <div style={{ ...card, color: '#8b95ab', fontSize: 13.5 }}>Loading vendors…</div>
          ) : visible.length === 0 ? (
            <div style={{ ...card, color: '#8b95ab', fontSize: 13.5 }}>
              Nothing matches that yet. Try a wider distance or another category.
            </div>
          ) : (
            visible.map((v) => (
              <div key={v.id} style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ margin: '0 0 3px', fontSize: 14.5, fontWeight: 700, color: '#fff' }}>
                      {v.companyName}
                    </h3>
                    <p style={{ margin: 0, fontSize: 12.5, color: '#8b95ab', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <MapPin size={12} /> {v.locality ?? v.city}
                    </p>
                  </div>
                  {v.distanceFromYouKm !== null && (
                    <span
                      style={{
                        flexShrink: 0, padding: '3px 9px', borderRadius: 999, fontSize: 11.5,
                        fontWeight: 700, background: 'rgba(56,189,248,0.14)', color: '#38bdf8',
                      }}
                    >
                      {v.distanceFromYouKm} km
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 9, fontSize: 11.5, color: '#8b95ab' }}>
                  <span
                    style={{
                      padding: '2px 8px', borderRadius: 999, background: 'rgba(249,115,22,0.14)',
                      color: '#f97316', fontWeight: 700,
                    }}
                  >
                    {CATEGORY_LABELS[v.category]}
                  </span>
                  {v.rating !== undefined && v.rating !== null ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Star size={11} fill="#facc15" color="#facc15" />
                      {v.rating.toFixed(1)}
                      {v.user_ratings_total ? ` (${v.user_ratings_total})` : ''}
                    </span>
                  ) : (
                    <span>Not rated yet</span>
                  )}
                  {v.avgCostPerPerson ? <span>≈ ₹{v.avgCostPerPerson.toLocaleString('en-IN')}/person</span> : null}
                </div>

                {v.portfolioSummary && (
                  <p style={{ margin: '9px 0 0', fontSize: 12.5, color: 'rgba(255,255,255,0.62)', lineHeight: 1.55 }}>
                    {v.portfolioSummary.length > 160 ? `${v.portfolioSummary.slice(0, 160)}…` : v.portfolioSummary}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
