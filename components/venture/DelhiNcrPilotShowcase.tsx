'use client';
// ============================================================
// components/venture/DelhiNcrPilotShowcase.tsx
// Interactive Showcase for Live Delhi NCR Pilot (Sports & Party)
// Verified 45+ Gurugram & NCR venues + Unlisted Venue Sourcing Tile
// ============================================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GURUGRAM_PRESEEDED_VENUES, GurugramVenue } from '@/data/venues';
import {
  MapPin, Clock, ShieldCheck, CheckCircle2,
  Building, Trophy, Wine, ExternalLink, X, Zap, ArrowRight, PlusCircle, Sparkles, Send
} from 'lucide-react';

export function DelhiNcrPilotShowcase() {
  const [activeCategory, setActiveCategory] = useState<'sports' | 'food'>('sports');
  const [selectedVenue, setSelectedVenue] = useState<GurugramVenue | null>(null);
  const [localityFilter, setLocalityFilter] = useState('all');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customVenueName, setCustomVenueName] = useState('');
  const [customLocality, setCustomLocality] = useState('Cyber Hub / Sector 29');
  const [customPax, setCustomPax] = useState('100-250 Pax');
  const [customSubmitted, setCustomSubmitted] = useState(false);

  const sportsCount = GURUGRAM_PRESEEDED_VENUES.filter((v) => v.category === 'sports').length;
  const foodCount = GURUGRAM_PRESEEDED_VENUES.filter((v) => v.category === 'food').length;
  const totalCount = GURUGRAM_PRESEEDED_VENUES.length;

  const venues = GURUGRAM_PRESEEDED_VENUES.filter((v) => v.category === activeCategory);
  const localities = ['all', ...Array.from(new Set(venues.map((v) => v.locality.split(',')[0].trim())))];

  const filteredVenues = venues.filter((v) => {
    if (localityFilter === 'all') return true;
    return v.locality.includes(localityFilter);
  });

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customVenueName) return;
    setCustomSubmitted(true);
    setTimeout(() => {
      setCustomSubmitted(false);
      setShowCustomModal(false);
      setCustomVenueName('');
    }, 2200);
  };

  return (
    <div>
      {/* ── Section Subheader & Filters ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 20, marginBottom: 28 }}>
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 12px',
              borderRadius: 999,
              background: 'rgba(249, 115, 22, 0.15)',
              border: '1px solid rgba(249, 115, 22, 0.3)',
              color: '#f97316',
              fontSize: 11.5,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: 10,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f97316', animation: 'pulse 1.5s infinite' }} />
            PHASE 1 LIVE DEPLOYMENT · DELHI NCR ({totalCount}+ ANCHORS)
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 3.2vw, 36px)', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em' }}>
            Gurugram Enterprise Pilot: Sports & Party Hubs
          </h2>
          <p style={{ fontSize: 14.5, color: 'rgba(255,255,255,0.65)', maxWidth: 680, marginTop: 6, lineHeight: 1.6 }}>
            Direct reverse-bidding network across DLF Cyber City, Golf Course Road, Sector 29, Sohna Road, Noida & Aerocity. Verified anchor facilities ready for live corporate reverse auctions.
          </p>
        </div>

        {/* Category Switcher Pill */}
        <div style={{ display: 'flex', gap: 8, background: 'rgba(255,255,255,0.06)', padding: 5, borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)' }}>
          <button
            onClick={() => { setActiveCategory('sports'); setLocalityFilter('all'); }}
            style={{
              padding: '10px 20px',
              borderRadius: 12,
              border: 'none',
              cursor: 'pointer',
              background: activeCategory === 'sports' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'transparent',
              color: activeCategory === 'sports' ? '#ffffff' : 'rgba(255,255,255,0.6)',
              fontSize: 13,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: activeCategory === 'sports' ? '0 4px 16px rgba(16,185,129,0.35)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <Trophy size={16} />
            <span>Sports & Tournaments ({sportsCount})</span>
          </button>

          <button
            onClick={() => { setActiveCategory('food'); setLocalityFilter('all'); }}
            style={{
              padding: '10px 20px',
              borderRadius: 12,
              border: 'none',
              cursor: 'pointer',
              background: activeCategory === 'food' ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' : 'transparent',
              color: activeCategory === 'food' ? '#ffffff' : 'rgba(255,255,255,0.6)',
              fontSize: 13,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: activeCategory === 'food' ? '0 4px 16px rgba(249,115,22,0.35)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <Wine size={16} />
            <span>Food, Nightclubs & Lounges ({foodCount})</span>
          </button>
        </div>
      </div>

      {/* ── Locality Subfilter Chips ── */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 14, marginBottom: 20 }}>
        {localities.slice(0, 9).map((loc) => (
          <button
            key={loc}
            onClick={() => setLocalityFilter(loc)}
            style={{
              padding: '6px 14px',
              borderRadius: 999,
              border: localityFilter === loc ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
              background: localityFilter === loc ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.03)',
              color: localityFilter === loc ? '#34d399' : 'rgba(255,255,255,0.6)',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            {loc === 'all' ? 'All Delhi NCR Hubs' : `📍 ${loc}`}
          </button>
        ))}
      </div>

      {/* ── Venue Cards Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: 20 }}>
        {filteredVenues.map((venue) => {
          const accentColor = venue.category === 'sports' ? '#10b981' : '#f97316';
          return (
            <motion.div
              key={venue.id}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              onClick={() => setSelectedVenue(venue)}
              style={{
                borderRadius: 22,
                background: 'rgba(11, 15, 23, 0.92)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '22px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Top Row: Name & Locality */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        padding: '2px 8px',
                        borderRadius: 6,
                        background: `${accentColor}18`,
                        color: accentColor,
                        border: `1px solid ${accentColor}30`,
                      }}
                    >
                      {venue.category === 'sports' ? 'SPORTS COMPLEX' : 'BREWPUB / LOUNGE'}
                    </span>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: '#ffffff', marginTop: 6 }}>
                      {venue.name}
                    </h3>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', padding: '4px 8px', borderRadius: 8 }}>
                    <ShieldCheck size={13} color="#10b981" />
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#34d399' }}>Verified</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 12 }}>
                  <MapPin size={13} color={accentColor} />
                  <span>{venue.locality}</span>
                </div>

                <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, marginBottom: 14 }}>
                  {venue.description}
                </p>

                {/* Amenities Badges */}
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 16 }}>
                  {venue.amenities.slice(0, 3).map((am) => (
                    <span
                      key={am}
                      style={{
                        fontSize: 10.5,
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 6,
                        background: 'rgba(255,255,255,0.05)',
                        color: 'rgba(255,255,255,0.8)',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      {am}
                    </span>
                  ))}
                  {venue.amenities.length > 3 && (
                    <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.4)', alignSelf: 'center' }}>
                      +{venue.amenities.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Row: Inspection Action */}
              <div
                style={{
                  paddingTop: 14,
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: 'rgba(255,255,255,0.5)' }}>
                  <Clock size={13} />
                  <span>{venue.timings}</span>
                </div>

                <button
                  style={{
                    padding: '8px 14px',
                    borderRadius: 10,
                    border: `1px solid ${accentColor}40`,
                    background: `${accentColor}18`,
                    color: '#ffffff',
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  Inspect Facility <ExternalLink size={12} />
                </button>
              </div>
            </motion.div>
          );
        })}

        {/* ── ➕ ON-DEMAND CUSTOM VENUE SOURCING TILE ── */}
        <motion.div
          whileHover={{ y: -6, transition: { duration: 0.2 } }}
          onClick={() => setShowCustomModal(true)}
          style={{
            borderRadius: 22,
            background: 'linear-gradient(145deg, rgba(16,185,129,0.08) 0%, rgba(14,165,233,0.05) 100%)',
            border: '2px dashed rgba(16, 185, 129, 0.45)',
            padding: '24px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
            position: 'relative',
            minHeight: 280,
          }}
        >
          <div>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', marginBottom: 14 }}>
              <PlusCircle size={24} />
            </div>

            <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '2px 8px', borderRadius: 6, background: 'rgba(16,185,129,0.15)', color: '#34d399' }}>
              ON-DEMAND PILOT SOURCING
            </span>

            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 900, color: '#ffffff', marginTop: 8, marginBottom: 8 }}>
              Need an Unlisted Venue in Delhi NCR?
            </h3>

            <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.7)', lineHeight: 1.55 }}>
              Have a specific golf club, microbrewery, 5-star lawn, or sports arena in mind? Tell us the name and our team will onboard them for a blind reverse auction within 24 hours.
            </p>
          </div>

          <button
            style={{
              marginTop: 16,
              padding: '10px 16px',
              borderRadius: 11,
              border: 'none',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              fontSize: 12.5,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              boxShadow: '0 4px 16px rgba(16,185,129,0.3)',
            }}
          >
            <span>Request Custom Venue Sourcing</span>
            <ArrowRight size={13} />
          </button>
        </motion.div>
      </div>

      {/* ── Modal 1: Custom Venue Request Modal ── */}
      <AnimatePresence>
        {showCustomModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 300,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(5, 8, 20, 0.88)',
              backdropFilter: 'blur(16px)',
              padding: 20,
            }}
            onClick={() => setShowCustomModal(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: 520,
                borderRadius: 24,
                background: '#0B0F17',
                border: '1.5px solid rgba(16,185,129,0.35)',
                padding: '32px',
                boxShadow: '0 40px 100px rgba(0,0,0,0.9)',
                position: 'relative',
              }}
            >
              <button
                onClick={() => setShowCustomModal(false)}
                style={{
                  position: 'absolute',
                  top: 20,
                  right: 20,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10,
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  cursor: 'pointer',
                }}
              >
                <X size={16} />
              </button>

              {!customSubmitted ? (
                <form onSubmit={handleCustomSubmit}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 999, background: 'rgba(16,185,129,0.15)', color: '#34d399', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', marginBottom: 12 }}>
                    <Sparkles size={12} /> Bespoke Venue Onboarding
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, color: '#ffffff', marginBottom: 6 }}>
                    Request Custom Venue Sourcing
                  </h3>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5, marginBottom: 20 }}>
                    Enter any desired sports facility, microbrewery, or resort in Delhi NCR. We will onboard them and trigger live reverse bids.
                  </p>

                  <div style={{ display: 'grid', gap: 14 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', marginBottom: 6 }}>
                        Venue / Facility Name *
                      </label>
                      <input
                        className="input-base"
                        placeholder="e.g. DLF Golf Club, Smaaash Arena, Westin Grand Ballroom"
                        required
                        value={customVenueName}
                        onChange={(e) => setCustomVenueName(e.target.value)}
                        autoFocus
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', marginBottom: 6 }}>
                          Locality / Cluster
                        </label>
                        <select className="input-base" value={customLocality} onChange={(e) => setCustomLocality(e.target.value)}>
                          <option value="Cyber Hub / Phase 2">Cyber Hub / Phase 2</option>
                          <option value="Golf Course Road">Golf Course Road</option>
                          <option value="Sector 29 Market">Sector 29 Market</option>
                          <option value="Sohna Road / Sector 48">Sohna Road / Sector 48</option>
                          <option value="Noida / Expressway">Noida / Expressway</option>
                          <option value="Aerocity / Central Delhi">Aerocity / Central Delhi</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', marginBottom: 6 }}>
                          Estimated Headcount
                        </label>
                        <select className="input-base" value={customPax} onChange={(e) => setCustomPax(e.target.value)}>
                          <option value="50-100 Pax">50-100 Pax</option>
                          <option value="100-250 Pax">100-250 Pax</option>
                          <option value="250-500 Pax">250-500 Pax</option>
                          <option value="500+ Pax">500+ Pax (Full Venue Lock)</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={!customVenueName}
                      style={{
                        marginTop: 8,
                        padding: '13px',
                        borderRadius: 12,
                        border: 'none',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: '#ffffff',
                        fontSize: 13.5,
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        boxShadow: '0 6px 20px rgba(16,185,129,0.35)',
                      }}
                    >
                      <Send size={15} />
                      <span>Initiate Sourcing Request</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'rgba(16,185,129,0.2)', border: '2px solid #10b981', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', marginBottom: 14 }}>
                    <CheckCircle2 size={26} />
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 900, color: '#ffffff', marginBottom: 6 }}>
                    Sourcing Request Logged!
                  </h3>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                    We will connect with <strong style={{ color: '#10b981' }}>{customVenueName}</strong> to set up direct reverse bids for your event.
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Modal 2: Venue Inspection Drawer ── */}
      <AnimatePresence>
        {selectedVenue && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 300,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(5, 8, 20, 0.85)',
              backdropFilter: 'blur(16px)',
              padding: 20,
            }}
            onClick={() => setSelectedVenue(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: 580,
                maxHeight: '90vh',
                overflowY: 'auto',
                borderRadius: 24,
                background: '#0B0F17',
                border: '1.5px solid rgba(16,185,129,0.3)',
                padding: '32px',
                boxShadow: '0 40px 100px rgba(0,0,0,0.9)',
                position: 'relative',
              }}
            >
              <button
                onClick={() => setSelectedVenue(null)}
                style={{
                  position: 'absolute',
                  top: 20,
                  right: 20,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10,
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  cursor: 'pointer',
                }}
              >
                <X size={16} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 6, background: 'rgba(16,185,129,0.2)', color: '#34d399' }}>
                  ✓ VERIFIED ANCHOR FACILITY
                </span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Delhi NCR Cluster</span>
              </div>

              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 900, color: '#ffffff', marginBottom: 6 }}>
                {selectedVenue.name}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 18 }}>
                <MapPin size={14} color="#10b981" />
                <span>{selectedVenue.address}</span>
              </div>

              {/* Timing & Facility Details Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                <div style={{ padding: '14px', borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: 700 }}>Operating Hours</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#ffffff', marginTop: 4 }}>{selectedVenue.timings}</div>
                </div>

                <div style={{ padding: '14px', borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: 700 }}>Locality Corridor</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#10b981', marginTop: 4 }}>{selectedVenue.locality.split(',')[0]}</div>
                </div>
              </div>

              {/* Corporate Suitability */}
              <div style={{ padding: '16px', borderRadius: 14, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                  🏢 Corporate Suitability & Scope
                </div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}>
                  {selectedVenue.corporateSuitability}
                </p>
              </div>

              {/* Key Amenities */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: 8 }}>
                  Facility Amenities & Features
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {selectedVenue.amenities.map((am) => (
                    <span
                      key={am}
                      style={{
                        padding: '5px 12px',
                        borderRadius: 8,
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#ffffff',
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {am}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setSelectedVenue(null)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 12,
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: 'transparent',
                    color: '#ffffff',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>
                <a
                  href="#simulator"
                  onClick={() => setSelectedVenue(null)}
                  style={{
                    flex: 2,
                    padding: '12px',
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#ffffff',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    textDecoration: 'none',
                    boxShadow: '0 8px 24px rgba(16,185,129,0.35)',
                  }}
                >
                  Source via Live Reverse Auction <ArrowRight size={14} />
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
