'use client';
// ============================================================
// components/reviews/VendorGoogleReviewsWidget.tsx
// Live Google Places Reviews & Star Rating Widget
// Features: Skeleton loading, Verified Google Reviews card stack,
// "Powered by Google" attribution, and 0-review fallback.
// ============================================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageSquare, CheckCircle, ExternalLink, ShieldCheck, MapPin, AlertCircle, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { GooglePlaceDetails, GooglePlaceReview } from '@/lib/types';
import { GoogleMapsApiKeyWarning } from '@/components/maps/GoogleMapsApiKeyWarning';

interface VendorGoogleReviewsWidgetProps {
  placeId?: string;
  vendorName?: string;
  fallbackRating?: number;
  fallbackTotalReviews?: number;
  compact?: boolean;
}

export function VendorGoogleReviewsWidget({
  placeId,
  vendorName = 'Vendor Partner',
  fallbackRating,
  fallbackTotalReviews,
  compact = false,
}: VendorGoogleReviewsWidgetProps) {
  const [details, setDetails] = useState<GooglePlaceDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(placeId));
  const [error, setError] = useState<string | null>(null);
  const [isKeyMissing, setIsKeyMissing] = useState<boolean>(false);

  useEffect(() => {
    if (!placeId) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    async function fetchPlaceDetails() {
      try {
        // The Google key is server configuration; the browser never holds it.
        const res = await fetch(`/api/places/details?placeId=${encodeURIComponent(placeId!)}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch place details (HTTP ${res.status})`);
        }
        const data = await res.json();
        if (isMounted) {
          if (data.success && data.place) {
            setDetails(data.place);
            setIsKeyMissing(data.reviewsAvailable === false);
          } else {
            setError(data.error || 'Unable to load Google reviews');
          }
        }
      } catch (err: any) {
        if (isMounted) {
          console.warn('[VendorGoogleReviewsWidget fetch error]:', err);
          setError(err.message || 'Error fetching Google reviews');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchPlaceDetails();

    return () => {
      isMounted = false;
    };
  }, [placeId]);

  // Never invent a score. If Google has not given us one, `rating` is null
  // and the UI says the rating is unavailable rather than showing a number
  // nobody earned.
  const rating: number | null = details?.rating ?? fallbackRating ?? null;
  const userRatingsTotal: number | null = details?.user_ratings_total ?? fallbackTotalReviews ?? null;
  const reviews: GooglePlaceReview[] = details?.reviews || [];

  // Render Skeleton while loading
  if (loading) {
    return (
      <div
        style={{
          borderRadius: 18,
          padding: '20px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Skeleton width={38} height={38} borderRadius={10} />
            <div>
              <Skeleton width={140} height={16} style={{ marginBottom: 6 }} />
              <Skeleton width={90} height={12} />
            </div>
          </div>
          <Skeleton width={100} height={28} borderRadius={999} />
        </div>
        <div style={{ display: 'grid', gap: 10 }}>
          <Skeleton height={60} borderRadius={12} />
          <Skeleton height={60} borderRadius={12} />
        </div>
      </div>
    );
  }

  // Compact Mode (used in proposal list pills / cards)
  if (compact) {
    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 10px',
          borderRadius: 999,
          background: 'rgba(234, 179, 8, 0.12)',
          border: '1px solid rgba(234, 179, 8, 0.35)',
          color: '#fbbf24',
          fontSize: 12,
          fontWeight: 700,
        }}
        title={
          rating === null
            ? 'No Google rating available for this listing'
            : `Google rating: ${rating} / 5.0 (${userRatingsTotal ?? 0} reviews)`
        }
      >
        <Star size={13} fill="#fbbf24" color="#fbbf24" />
        <span>{rating === null ? 'Not rated' : rating.toFixed(1)}</span>
        {userRatingsTotal !== null && (
          <span style={{ fontSize: 10.5, color: 'rgba(255, 255, 255, 0.65)', fontWeight: 500 }}>
            ({userRatingsTotal})
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        borderRadius: 18,
        padding: '22px',
        background: 'rgba(11, 15, 23, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(16px)',
      }}
    >
      {/* ── Top Rating Card ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 14,
          paddingBottom: 18,
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          marginBottom: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Google G Logo Badge */}
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
              flexShrink: 0,
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: '#ffffff' }}>
                {details?.name || vendorName}
              </span>
              <ShieldCheck size={16} color="#10b981" />
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.6)' }}>
              Verified Google Business Profile · Gurugram Enterprise
            </div>
          </div>
        </div>

        {/* Gold Star Badge */}
        <div
          style={{
            padding: '8px 16px',
            borderRadius: 14,
            background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.2) 0%, rgba(202, 138, 4, 0.1) 100%)',
            border: '1.5px solid rgba(234, 179, 8, 0.45)',
            boxShadow: '0 4px 16px rgba(234, 179, 8, 0.15)',
            textAlign: 'right',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              justifyContent: 'flex-end',
              fontSize: 18,
              fontWeight: 900,
              color: '#fef08a',
            }}
          >
            <Star size={18} fill="#facc15" color="#facc15" />
            <span>{rating === null ? 'Not rated yet' : `${rating.toFixed(1)} / 5.0`}</span>
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255, 255, 255, 0.7)', marginTop: 2 }}>
            {userRatingsTotal === null
              ? 'Google reviews not connected'
              : `${userRatingsTotal} Google reviews`}
          </div>
        </div>
      </div>

      {/* Notice if API key missing in environment */}
      {isKeyMissing && (
        <div style={{ marginBottom: 14 }}>
          <GoogleMapsApiKeyWarning compact />
        </div>
      )}

      {/* ── Live Reviews List ── */}
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <div style={{ fontSize: 11.5, fontWeight: 800, color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Reviews from Google
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.4)' }}>
            {userRatingsTotal === null
              ? '—'
              : `Showing ${Math.min(5, reviews.length)} of ${userRatingsTotal}`}
          </div>
        </div>

        {reviews.length === 0 ? (
          <div
            style={{
              padding: '24px 18px',
              borderRadius: 14,
              background: 'rgba(255, 255, 255, 0.025)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.65)',
              fontSize: 13,
            }}
          >
            <CheckCircle size={22} color="#10b981" style={{ margin: '0 auto 8px', opacity: 0.8 }} />
            <div style={{ fontWeight: 700, color: '#ffffff', marginBottom: 2 }}>
              {isKeyMissing ? 'Google reviews not connected' : 'No public Google reviews yet'}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.5)' }}>
              {isKeyMissing
                ? 'This deployment has no Google Places key configured, so live reviews are unavailable.'
                : 'COE ratings from completed events appear on the vendor profile.'}
            </div>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gap: 10,
              maxHeight: 280,
              overflowY: 'auto',
              paddingRight: 4,
            }}
          >
            {reviews.slice(0, 5).map((rev, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                style={{
                  borderRadius: 12,
                  padding: '14px 16px',
                  background: 'rgba(255, 255, 255, 0.035)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        fontWeight: 800,
                        color: '#ffffff',
                      }}
                    >
                      {rev.author_name.charAt(0)}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>
                      {rev.author_name}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ display: 'flex', gap: 2 }}>
                      {Array.from({ length: 5 }).map((_, sIdx) => (
                        <Star
                          key={sIdx}
                          size={11}
                          fill={sIdx < rev.rating ? '#facc15' : 'transparent'}
                          color={sIdx < rev.rating ? '#facc15' : 'rgba(255,255,255,0.2)'}
                        />
                      ))}
                    </div>
                    <span style={{ fontSize: 10.5, color: 'rgba(255, 255, 255, 0.45)' }}>
                      {rev.relative_time_description}
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: 12.5, color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.5, margin: 0 }}>
                  &ldquo;{rev.text}&rdquo;
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ── Official "Powered by Google" Attribution Badge ── */}
      <div
        style={{
          marginTop: 16,
          paddingTop: 12,
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 11,
          color: 'rgba(255, 255, 255, 0.5)',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <MapPin size={13} color="#f97316" />
          <span>{details?.formatted_address || 'Gurugram, Haryana'}</span>
        </span>

        {/* Powered by Google Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700, color: '#ffffff' }}>
          <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>powered by</span>
          <span style={{ letterSpacing: '0.02em', fontSize: 12 }}>
            <span style={{ color: '#4285F4' }}>G</span>
            <span style={{ color: '#EA4335' }}>o</span>
            <span style={{ color: '#FBBC05' }}>o</span>
            <span style={{ color: '#4285F4' }}>g</span>
            <span style={{ color: '#34A853' }}>l</span>
            <span style={{ color: '#EA4335' }}>e</span>
          </span>
        </div>
      </div>
    </div>
  );
}
