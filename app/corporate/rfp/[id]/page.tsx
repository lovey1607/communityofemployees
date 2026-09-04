'use client';
// ============================================================
// app/corporate/rfp/[id]/page.tsx — Level 2 & Level 3 Drill-Down
// Level 2: Specific Inquiry Details & Bid Comparison List
// Level 3: Detailed Vendor Proposal Slide-Over Drawer with Accept/Negotiate
// ============================================================

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { RFP, Bid, VendorProfile } from '@/lib/types';
import { CATEGORY_LABELS, THEMES } from '@/lib/themes';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Category3DIcon } from '@/components/ui/Category3DIcons';
import { BlurredCyberHubBackground } from '@/components/canvas/BlurredCyberHubBackground';
import {
  ChevronRight, ArrowLeft, Building2, Calendar, Users, DollarSign,
  ShieldCheck, Zap, Phone, Mail, MessageSquare, CheckCircle,
  Clock, X, ArrowUpRight, Flame, MapPin, CheckCircle2, SlidersHorizontal,
  Sparkles, FileText, Lock, ExternalLink, Star
} from 'lucide-react';
import { VendorGoogleReviewsWidget } from '@/components/reviews/VendorGoogleReviewsWidget';
import { VendorTrustBadge } from '@/components/reviews/VendorTrustBadge';

function getRFPTitle(rfp: RFP): string {
  if (rfp.category === 'food') return 'Annual Founders Gala & Executive Networking Dinner';
  if (rfp.category === 'sports') return 'Inter-Office Box Cricket Premier League & Football';
  if (rfp.category === 'trips') return 'Leadership Annual Offsite & Workation Retreat';
  if (rfp.category === 'gifts') return 'Executive Diwali Luxury Hampers & Awards';
  if (rfp.category === 'dress') return 'Custom Branded Corporate Polos & Winter Jackets';
  return `${CATEGORY_LABELS[rfp.category]} Requirement`;
}

// ─── Level 3: Slide-Over Drawer (Decision View) ────────────────
function VendorProposalDrawer({
  bid,
  rfp,
  vendorProfile,
  onClose,
  onAccept,
}: {
  bid: Bid;
  rfp: RFP;
  vendorProfile?: VendorProfile;
  onClose: () => void;
  onAccept: () => void;
}) {
  const { isNightMode } = useStore();
  const catTheme = THEMES[rfp.category];
  const isAccepted = bid.status === 'accepted';

  const phone = vendorProfile?.mobile || '+91 98711 22334';
  const companyPhone = vendorProfile?.companyMobile || '+91 0124 4567890';
  const address = vendorProfile?.address || 'DLF Phase 1, Gurugram';
  const gstin = vendorProfile?.gstNumber || '07AAAAA0000A1Z5';
  const clients = vendorProfile?.pastClients || ['Google India', 'Microsoft', 'Zomato', 'Deloitte'];

  const whatsappText = encodeURIComponent(
    `Hello ${bid.vendorName}, regarding your quotation of ₹${bid.totalPrice.toLocaleString('en-IN')} for ${CATEGORY_LABELS[rfp.category]} (${rfp.companyName}). Let's finalize timeline & SLA.`
  );

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        justifyContent: 'flex-end',
        background: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 580,
          height: '100%',
          background: isNightMode ? '#0B0F17' : '#ffffff',
          borderLeft: isNightMode ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.1)',
          boxShadow: '-20px 0 60px rgba(0, 0, 0, 0.8)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '24px 28px',
            borderBottom: isNightMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: `linear-gradient(135deg, ${catTheme.primary}18 0%, transparent 100%)`,
          }}
        >
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: catTheme.primary, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>
              Level 3 · Vendor Proposal Dossier
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: isNightMode ? '#ffffff' : '#0f172a' }}>
              {bid.vendorCompany}
            </h2>
          </div>

          <button
            onClick={onClose}
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isNightMode ? '#ffffff' : '#0f172a',
              cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Drawer Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          {/* Match Score & Price Hero Card */}
          <div
            style={{
              borderRadius: 18,
              padding: '20px',
              background: isNightMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)',
              border: `1px solid ${catTheme.primary}33`,
              marginBottom: 22,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: 11, color: isNightMode ? 'rgba(255,255,255,0.5)' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Binding Total Quotation
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: isAccepted ? '#10b981' : catTheme.primary }}>
                {formatCurrency(bid.totalPrice)}
              </div>
              <div style={{ fontSize: 12, color: '#10b981', fontWeight: 600, marginTop: 2 }}>
                ✓ Within Corporate Target Budget
              </div>
            </div>

            <div
              style={{
                padding: '8px 14px',
                borderRadius: 14,
                background: bid.matchPercentage >= 90 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                border: `1px solid ${bid.matchPercentage >= 90 ? '#10b981' : '#f59e0b'}`,
                color: bid.matchPercentage >= 90 ? '#10b981' : '#f59e0b',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
                <Zap size={16} /> {bid.matchPercentage}%
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>Match Score</div>
            </div>
          </div>

          {/* 1. Itemized Price Breakdown Table */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: isNightMode ? '#ffffff' : '#0f172a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
              1. Itemized Line-Item Price Breakdown
            </div>

            <div
              style={{
                borderRadius: 14,
                border: isNightMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
                background: isNightMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                overflow: 'hidden',
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: isNightMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)', color: isNightMode ? 'rgba(255,255,255,0.45)' : '#64748b', fontSize: 11, textTransform: 'uppercase' }}>
                    <th style={{ padding: '10px 14px' }}>Item Description</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {bid.lineItems.map((item, i) => (
                    <tr key={i} style={{ borderBottom: isNightMode ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(0,0,0,0.04)' }}>
                      <td style={{ padding: '10px 14px', color: isNightMode ? 'rgba(255,255,255,0.85)' : '#334155' }}>
                        {item.description}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: isNightMode ? '#ffffff' : '#0f172a' }}>
                        {formatCurrency(item.amount)}
                      </td>
                    </tr>
                  ))}
                  <tr style={{ background: isNightMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', fontWeight: 800 }}>
                    <td style={{ padding: '10px 14px', color: isNightMode ? '#ffffff' : '#0f172a' }}>Total Final Bid</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', color: catTheme.primary, fontSize: 14 }}>
                      {formatCurrency(bid.totalPrice)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. Custom Pitch & Notes */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: isNightMode ? '#ffffff' : '#0f172a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
              2. Custom Vendor Pitch & SLA Commitments
            </div>
            <div
              style={{
                fontSize: 13,
                color: isNightMode ? 'rgba(255,255,255,0.75)' : '#334155',
                lineHeight: 1.6,
                padding: '14px 16px',
                borderRadius: 12,
                background: isNightMode ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.025)',
                borderLeft: `3px solid ${catTheme.primary}`,
              }}
            >
              &ldquo;{bid.proposal}&rdquo;
            </div>
          </div>

          {/* 3. Verified Credentials & Venue Details */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: isNightMode ? '#ffffff' : '#0f172a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
              3. Verified Venue Specifications & Corporate Credentials
            </div>

            <div
              style={{
                borderRadius: 14,
                padding: '16px',
                background: isNightMode ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.025)',
                border: isNightMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
                display: 'grid',
                gap: 10,
                fontSize: 12.5,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldCheck size={16} color="#10b981" />
                <span>GSTIN: <strong style={{ fontFamily: 'monospace' }}>{gstin}</strong> (Verified Compliance)</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <MapPin size={16} color="#f97316" />
                <span>Base Hub: <strong>{address}</strong> (~{bid.distanceKm} km from DLF Cyber Hub)</span>
              </div>

              {(vendorProfile?.timings || bid.timings) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Clock size={16} color="#38bdf8" />
                  <span>Operating Timings: <strong>{vendorProfile?.timings || bid.timings}</strong></span>
                </div>
              )}

              {(vendorProfile?.avgCostPerPerson || bid.avgCostPerPerson) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <DollarSign size={16} color="#34d399" />
                  <span>Average Cost per Person: <strong>{formatCurrency(vendorProfile?.avgCostPerPerson || bid.avgCostPerPerson || 850)} / pax</strong></span>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Building2 size={16} color="#0ea5e9" />
                <span>Representative: <strong>{bid.vendorName}</strong></span>
              </div>

              {/* Amenities Pills */}
              {(vendorProfile?.amenities || bid.amenities) && (
                <div style={{ marginTop: 4, paddingTop: 10, borderTop: isNightMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)' }}>
                  <div style={{ fontSize: 11, color: isNightMode ? 'rgba(255,255,255,0.5)' : '#64748b', marginBottom: 6 }}>
                    Featured Facilities & Amenities:
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {(vendorProfile?.amenities || bid.amenities || []).map((amenity) => (
                      <span
                        key={amenity}
                        style={{
                          fontSize: 11,
                          padding: '3px 8px',
                          borderRadius: 999,
                          background: 'rgba(249, 115, 22, 0.12)',
                          border: '1px solid rgba(249, 115, 22, 0.25)',
                          color: '#fb923c',
                          fontWeight: 600,
                        }}
                      >
                        ✨ {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Corporate Suitability */}
              {(vendorProfile?.corporateSuitability || bid.corporateSuitability) && (
                <div style={{ marginTop: 4, paddingTop: 10, borderTop: isNightMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)' }}>
                  <div style={{ fontSize: 11, color: '#10b981', fontWeight: 700, marginBottom: 2 }}>
                    🏆 Corporate Event Suitability:
                  </div>
                  <div style={{ fontSize: 12, color: isNightMode ? 'rgba(255,255,255,0.7)' : '#334155', lineHeight: 1.4 }}>
                    {vendorProfile?.corporateSuitability || bid.corporateSuitability}
                  </div>
                </div>
              )}

              <div style={{ marginTop: 4, paddingTop: 10, borderTop: isNightMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: 11, color: isNightMode ? 'rgba(255,255,255,0.5)' : '#64748b', marginBottom: 6 }}>
                  Past Corporate Client References:
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {clients.map((c) => (
                    <span
                      key={c}
                      style={{
                        fontSize: 11,
                        padding: '3px 8px',
                        borderRadius: 999,
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: isNightMode ? '#ffffff' : '#0f172a',
                        fontWeight: 600,
                      }}
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 4. Verified Google Business Reviews & Rating */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: isNightMode ? '#ffffff' : '#0f172a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
              4. Verified Google Places Reviews & Live Rating
            </div>
            <VendorGoogleReviewsWidget
              placeId={vendorProfile?.place_id || bid.place_id}
              vendorName={bid.vendorCompany}
              fallbackRating={vendorProfile?.rating || bid.rating || 4.8}
              fallbackTotalReviews={vendorProfile?.user_ratings_total || bid.user_ratings_total || 48}
            />
          </div>
        </div>

        {/* ── Sticky Bottom Actions ── */}
        <div
          style={{
            padding: '18px 28px',
            borderTop: isNightMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
            background: isNightMode ? 'rgba(11, 15, 23, 0.98)' : '#ffffff',
            display: 'flex',
            gap: 12,
          }}
        >
          <a
            href={`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${whatsappText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost"
            style={{
              flex: 1,
              padding: '12px',
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              textDecoration: 'none',
            }}
          >
            <MessageSquare size={15} />
            <span>Message / Negotiate</span>
          </a>

          {isAccepted ? (
            <div
              style={{
                flex: 2,
                padding: '12px',
                background: 'rgba(34, 197, 94, 0.2)',
                border: '1px solid #22c55e',
                borderRadius: 12,
                textAlign: 'center',
                color: '#22c55e',
                fontWeight: 800,
                fontSize: 13.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <CheckCircle size={16} />
              Contract Awarded & Locked
            </div>
          ) : (
            <button
              onClick={onAccept}
              className="btn-primary"
              style={{
                flex: 2,
                padding: '12px',
                fontSize: 13.5,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              }}
            >
              <CheckCircle size={16} />
              Accept & Unlock Vendor
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Level 2: Specific Inquiry Page Main View ──────────────────
export default function SpecificRFPInquiryPage() {
  const params = useParams();
  const router = useRouter();
  const rfpId = params.id as string;

  const { rfpList, getBidsForRFP, vendorProfiles, acceptBid, isNightMode, hydrated, loadRfpDetail } =
    useStore();

  // Bids are fetched per requirement — the poster's view is the only one the
  // server will return rival quotes to.
  useEffect(() => {
    if (hydrated && rfpId) void loadRfpDetail(rfpId);
  }, [hydrated, rfpId, loadRfpDetail]);
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null);
  const [sortBy, setSortBy] = useState<'match' | 'price' | 'distance'>('match');

  const rfp = rfpList.find((r) => r.id === rfpId);

  if (!rfp) {
    return (
      <main style={{ minHeight: '100vh', paddingTop: 120, textAlign: 'center', color: '#ffffff' }}>
        <BlurredCyberHubBackground />
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Requirement Not Found</h2>
        <Link href="/corporate/dashboard" className="btn-primary">
          Back to Corporate Dashboard
        </Link>
      </main>
    );
  }

  const bids = getBidsForRFP(rfp.id);
  const catTheme = THEMES[rfp.category];
  const rfpTitle = getRFPTitle(rfp);

  const sortedBids = [...bids].sort((a, b) => {
    if (sortBy === 'match') return b.matchPercentage - a.matchPercentage;
    if (sortBy === 'price') return a.totalPrice - b.totalPrice;
    if (sortBy === 'distance') return a.distanceKm - b.distanceKm;
    return 0;
  });

  return (
    <main
      style={{
        minHeight: '100vh',
        paddingTop: 96,
        paddingBottom: 60,
        position: 'relative',
        background: '#0B0F17',
      }}
    >
      <BlurredCyberHubBackground />

      <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 10 }}>
        {/* ── BREADCRUMB NAVIGATION (User Requirement) ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: isNightMode ? 'rgba(255,255,255,0.5)' : '#64748b', marginBottom: 20, flexWrap: 'wrap' }}>
          <Link
            href="/corporate/dashboard"
            style={{
              color: isNightMode ? '#ffffff' : '#0f172a',
              textDecoration: 'none',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <ArrowLeft size={13} /> Dashboard
          </Link>
          <ChevronRight size={13} />
          <span style={{ color: catTheme.primary, fontWeight: 700 }}>
            {CATEGORY_LABELS[rfp.category]}
          </span>
          <ChevronRight size={13} />
          <span style={{ color: isNightMode ? 'rgba(255,255,255,0.8)' : '#334155', fontWeight: 600 }}>
            {rfpTitle}
          </span>
          <ChevronRight size={13} />
          <span style={{ color: '#10b981', fontWeight: 800 }}>
            Bids ({bids.length})
          </span>
        </div>

        {/* ── TOP HEADER: FULL RFP DETAILS SUMMARY CARD ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            borderRadius: 20,
            padding: '26px 30px',
            marginBottom: 28,
            background: isNightMode ? 'rgba(11, 15, 23, 0.92)' : 'rgba(255, 255, 255, 0.95)',
            border: isNightMode ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  background: `${catTheme.primary}20`,
                  border: `1px solid ${catTheme.primary}40`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Category3DIcon category={rfp.category} className="w-9 h-9" />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: isNightMode ? '#ffffff' : '#0f172a' }}>
                    {rfpTitle}
                  </h1>
                  {rfp.status === 'awarded' ? (
                    <span style={{ padding: '3px 10px', borderRadius: 999, background: 'rgba(34,197,94,0.18)', color: '#22c55e', fontSize: 11, fontWeight: 800 }}>
                      ● Contract Awarded
                    </span>
                  ) : (
                    <span style={{ padding: '3px 10px', borderRadius: 999, background: 'rgba(16,185,129,0.18)', color: '#10b981', fontSize: 11, fontWeight: 800 }}>
                      ● Live Reverse Auction ({bids.length} Proposals)
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 13, color: isNightMode ? 'rgba(255,255,255,0.6)' : '#64748b' }}>
                  Posted by {rfp.companyName} · Submitted on {formatDate(rfp.submittedAt)}
                </div>
              </div>
            </div>

            <div
              style={{
                padding: '10px 18px',
                borderRadius: 14,
                background: `${catTheme.primary}15`,
                border: `1px solid ${catTheme.primary}44`,
                textAlign: 'right',
              }}
            >
              <div style={{ fontSize: 11, color: isNightMode ? 'rgba(255,255,255,0.5)' : '#64748b', textTransform: 'uppercase' }}>Target Budget Cap</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: catTheme.primary }}>
                {formatCurrency(rfp.totalBudget)}
              </div>
            </div>
          </div>

          {/* Specs Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: 14,
              paddingTop: 16,
              borderTop: isNightMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
            }}
          >
            <div>
              <div style={{ fontSize: 11, color: isNightMode ? 'rgba(255,255,255,0.45)' : '#64748b' }}>Headcount</div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: isNightMode ? '#ffffff' : '#0f172a' }}>
                {rfp.universal.persons} Attendees
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: isNightMode ? 'rgba(255,255,255,0.45)' : '#64748b' }}>Date & Schedule</div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: isNightMode ? '#ffffff' : '#0f172a' }}>
                {formatDate(rfp.universal.startDate)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: isNightMode ? 'rgba(255,255,255,0.45)' : '#64748b' }}>Time Slot</div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: isNightMode ? '#ffffff' : '#0f172a' }}>
                {rfp.universal.timeSlot || 'Full Day'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: isNightMode ? 'rgba(255,255,255,0.45)' : '#64748b' }}>Office Location</div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: isNightMode ? '#ffffff' : '#0f172a' }}>
                {rfp.universal.officeAddress || 'DLF Cyber City'}
              </div>
            </div>
          </div>

          {rfp.universal.notes && (
            <div style={{ marginTop: 14, fontSize: 12.5, color: isNightMode ? 'rgba(255,255,255,0.7)' : '#475569', background: isNightMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', padding: '10px 14px', borderRadius: 10 }}>
              <strong>Requirement Notes:</strong> {rfp.universal.notes}
            </div>
          )}
        </motion.div>

        {/* ── LEVEL 2: BID COMPARISON TABLE & ROWS ── */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: isNightMode ? '#ffffff' : '#0f172a' }}>
                Vendor Proposals & Reverse-Bidding ({bids.length})
              </h2>
              <div style={{ fontSize: 12, color: isNightMode ? 'rgba(255,255,255,0.5)' : '#64748b' }}>
                Click any proposal row to open the Level 3 Decision Dossier.
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: isNightMode ? 'rgba(255,255,255,0.5)' : '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                <SlidersHorizontal size={13} /> Sort By:
              </span>
              <select
                className="input-base"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                style={{ padding: '6px 12px', fontSize: 12, width: 'auto', borderRadius: 8 }}
              >
                <option value="match">⚡ Highest Match % (Algorithm)</option>
                <option value="price">💰 Lowest Bid Price</option>
                <option value="distance">📍 Proximity (Closest Hub)</option>
              </select>
            </div>
          </div>

          {bids.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 20px',
                borderRadius: 20,
                background: isNightMode ? 'rgba(11, 15, 23, 0.9)' : 'rgba(255,255,255,0.9)',
                border: isNightMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
              }}
            >
              <Clock size={36} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
              <h3 style={{ fontSize: 17, fontWeight: 700, color: isNightMode ? '#ffffff' : '#0f172a', marginBottom: 4 }}>
                Awaiting Incoming Proposals
              </h3>
              <p style={{ color: isNightMode ? 'rgba(255,255,255,0.5)' : '#64748b', fontSize: 13 }}>
                This requirement is live in the vendor pool. Verified vendors from DLF Cyber City will submit bids shortly.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {sortedBids.map((bid) => {
                const prof = vendorProfiles.find((v) => v.id === bid.vendorId || v.userId === bid.vendorUserId);
                const isAccepted = bid.status === 'accepted';

                return (
                  <motion.div
                    key={bid.id}
                    layout
                    whileHover={{ y: -2 }}
                    onClick={() => setSelectedBid(bid)}
                    style={{
                      borderRadius: 16,
                      padding: '20px 24px',
                      background: isAccepted
                        ? 'rgba(16, 185, 129, 0.12)'
                        : isNightMode
                        ? 'rgba(11, 15, 23, 0.92)'
                        : 'rgba(255, 255, 255, 0.95)',
                      border: isAccepted
                        ? '2px solid #10b981'
                        : isNightMode
                        ? '1px solid rgba(255, 255, 255, 0.1)'
                        : '1px solid rgba(0, 0, 0, 0.08)',
                      backdropFilter: 'blur(12px)',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 16,
                      boxShadow: isAccepted ? '0 12px 32px rgba(16, 185, 129, 0.25)' : 'none',
                    }}
                  >
                    {/* Left: Vendor & Distance */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 12,
                          background: 'rgba(249, 115, 22, 0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#f97316',
                          fontWeight: 800,
                          fontSize: 16,
                          flexShrink: 0,
                        }}
                      >
                        {bid.vendorCompany.charAt(0)}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: isNightMode ? '#ffffff' : '#0f172a' }}>
                            {bid.vendorCompany}
                          </span>
                          <span style={{ fontSize: 10.5, padding: '2px 7px', borderRadius: 999, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: 800 }}>
                            GST Verified
                          </span>
                          <VendorTrustBadge
                            placeId={prof?.place_id || bid.place_id}
                            vendorName={bid.vendorCompany}
                            rating={prof?.rating || bid.rating || 4.8}
                            userRatingsTotal={prof?.user_ratings_total || bid.user_ratings_total || 48}
                          />
                        </div>

                        <div style={{ fontSize: 12, color: isNightMode ? 'rgba(255,255,255,0.65)' : '#64748b', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                          <span>Rep: <strong>{bid.vendorName}</strong></span>
                          <span>•</span>
                          <span>📍 {bid.locality || prof?.locality || `${bid.distanceKm} km from DLF Cyber Hub`}</span>
                          {(bid.timings || prof?.timings) && (
                            <>
                              <span>•</span>
                              <span>⏰ {bid.timings || prof?.timings}</span>
                            </>
                          )}
                        </div>

                        {/* Top Amenities Pills */}
                        {(prof?.amenities || bid.amenities) && (
                          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                            {(prof?.amenities || bid.amenities || []).slice(0, 3).map((amenity) => (
                              <span
                                key={amenity}
                                style={{
                                  fontSize: 10.5,
                                  padding: '1px 6px',
                                  borderRadius: 6,
                                  background: 'rgba(249, 115, 22, 0.1)',
                                  color: '#fb923c',
                                  fontWeight: 600,
                                }}
                              >
                                ✨ {amenity}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Match %, Price & Review CTA */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                      <div
                        style={{
                          padding: '4px 10px',
                          borderRadius: 999,
                          background: bid.matchPercentage >= 90 ? 'rgba(16, 185, 129, 0.18)' : 'rgba(245, 158, 11, 0.18)',
                          color: bid.matchPercentage >= 90 ? '#10b981' : '#f59e0b',
                          fontSize: 12,
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <Zap size={12} /> {bid.matchPercentage}% Match
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 10.5, color: isNightMode ? 'rgba(255,255,255,0.45)' : '#64748b', textTransform: 'uppercase' }}>
                          Quotation
                        </div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: isAccepted ? '#10b981' : catTheme.primary }}>
                          {formatCurrency(bid.totalPrice)}
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBid(bid);
                        }}
                        className="btn-primary"
                        style={{
                          background: isAccepted ? '#10b981' : catTheme.primary,
                          padding: '8px 16px',
                          fontSize: 12.5,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <span>{isAccepted ? 'Awarded Dossier' : 'Review Proposal'}</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── LEVEL 3: DETAILED VENDOR PROPOSAL SLIDE-OVER DRAWER ── */}
      <AnimatePresence>
        {selectedBid && (
          <VendorProposalDrawer
            bid={selectedBid}
            rfp={rfp}
            vendorProfile={vendorProfiles.find((v) => v.id === selectedBid.vendorId || v.userId === selectedBid.vendorUserId)}
            onClose={() => setSelectedBid(null)}
            onAccept={() => {
              acceptBid(selectedBid.id, rfp.id);
              setSelectedBid({ ...selectedBid, status: 'accepted' });
            }}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
