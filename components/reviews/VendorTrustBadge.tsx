'use client';
// ============================================================
// components/reviews/VendorTrustBadge.tsx
// Interactive Google Places Trust Badge for Vendor Proposals
// ============================================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ShieldCheck, X, ExternalLink } from 'lucide-react';
import { VendorGoogleReviewsWidget } from './VendorGoogleReviewsWidget';

interface VendorTrustBadgeProps {
  placeId?: string;
  vendorName: string;
  rating?: number;
  userRatingsTotal?: number;
  showModalOnClick?: boolean;
}

export function VendorTrustBadge({
  placeId,
  vendorName,
  // No default score. A vendor with no ratings shows as unrated, not 4.8.
  rating,
  userRatingsTotal,
  showModalOnClick = true,
}: VendorTrustBadgeProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          if (showModalOnClick) {
            e.stopPropagation();
            setModalOpen(true);
          }
        }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 10px',
          borderRadius: 999,
          background: 'rgba(178, 58, 122, 0.12)',
          border: '1px solid rgba(178, 58, 122, 0.35)',
          color: '#A66A00',
          fontSize: 12,
          fontWeight: 700,
          cursor: showModalOnClick ? 'pointer' : 'default',
          transition: 'all 0.2s ease',
          fontFamily: 'var(--font-body)',
        }}
        onMouseEnter={(e) => {
          if (showModalOnClick) {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(178, 58, 122, 0.22)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 12px rgba(178, 58, 122, 0.25)';
          }
        }}
        onMouseLeave={(e) => {
          if (showModalOnClick) {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(178, 58, 122, 0.12)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
          }
        }}
        title="Click to view verified Google Places reviews & business rating"
      >
        <Star size={13} fill="#A66A00" color="#A66A00" />
        <span>{rating === undefined ? 'Not rated' : rating.toFixed(1)}</span>
        <span style={{ fontSize: 10.5, color: 'var(--ink-2)', fontWeight: 500 }}>
          {userRatingsTotal === undefined ? '' : `(${userRatingsTotal})`}
        </span>
        <span
          style={{
            fontSize: 9.5,
            padding: '1px 5px',
            borderRadius: 4,
            background: 'rgba(30, 158, 90, 0.2)',
            color: '#137A43',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            marginLeft: 2,
          }}
        >
          Google
        </span>
      </button>

      {/* Modal View when clicked */}
      <AnimatePresence>
        {modalOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 300,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
              background: 'rgba(29, 26, 23, 0.45)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
            onClick={(e) => {
              e.stopPropagation();
              setModalOpen(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: 540,
                maxHeight: '90vh',
                overflowY: 'auto',
                position: 'relative',
              }}
            >
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                style={{
                  position: 'absolute',
                  top: 14,
                  right: 14,
                  zIndex: 10,
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  background: 'var(--cream-2)',
                  border: '1px solid var(--line)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--ink)',
                  cursor: 'pointer',
                }}
              >
                <X size={14} />
              </button>

              <VendorGoogleReviewsWidget
                placeId={placeId}
                vendorName={vendorName}
                fallbackRating={rating}
                fallbackTotalReviews={userRatingsTotal}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
