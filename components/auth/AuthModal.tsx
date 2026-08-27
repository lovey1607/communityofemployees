'use client';
// ============================================================
// components/auth/AuthModal.tsx
// Passwordless Email + OTP Login, Direct Password Access,
// and Pre-Seeded 33 Gurugram Venues Quick Switcher
// ============================================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { UserRole } from '@/lib/types';
import { GURUGRAM_PRESEEDED_VENUES, GurugramVenue } from '@/data/venues';
import {
  Mail, KeyRound, Building2, Store, Shield,
  ArrowRight, X, Sparkles, CheckCircle2, Star, Clock, MapPin, Search, ChevronDown, Lock
} from 'lucide-react';

export function AuthModal() {
  const router = useRouter();
  const { authModalOpen, closeAuthModal, sendOtp, verifyOtp, loginWithPassword, switchPersona, isNightMode } = useStore();

  const [role, setRole] = useState<UserRole>('vendor');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('gurgaon123');
  const [authMode, setAuthMode] = useState<'password' | 'otp'>('password');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [selectedVenueCategory, setSelectedVenueCategory] = useState<'all' | 'sports' | 'food'>('all');
  const [venueSearchQuery, setVenueSearchQuery] = useState('');
  const [showVenuePicker, setShowVenuePicker] = useState(false);

  if (!authModalOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setLoading(true);
    setTimeout(() => {
      sendOtp(email, role);
      setStep('otp');
      setLoading(false);
    }, 400);
  };

  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setLoading(true);
    setTimeout(() => {
      const ok = loginWithPassword(email, password, role);
      setLoading(false);
      if (ok) {
        closeAuthModal();
        if (role === 'corporate') router.push('/corporate/dashboard');
        else if (role === 'vendor') router.push('/vendor/dashboard');
        else router.push('/admin/dashboard');
      }
    }, 350);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;

    setLoading(true);
    setTimeout(() => {
      const res = verifyOtp(email, otp);
      setLoading(false);
      if (res.success) {
        if (res.isNewUser) {
          if (res.role === 'corporate') router.push('/corporate/onboarding');
          else if (res.role === 'vendor') router.push('/vendor/onboarding');
          else router.push('/admin/dashboard');
        } else {
          if (res.role === 'corporate') router.push('/corporate/dashboard');
          else if (res.role === 'vendor') router.push('/vendor/dashboard');
          else router.push('/admin/dashboard');
        }
      }
    }, 400);
  };

  const handleQuickLogin = (demoRole: UserRole, demoEmail: string, route: string) => {
    switchPersona(demoRole, demoEmail);
    closeAuthModal();
    router.push(route);
  };

  const handleSelectVenue = (venue: GurugramVenue) => {
    setEmail(venue.email);
    setPassword(venue.defaultPassword || 'gurgaon123');
    switchPersona('vendor', venue.email);
    closeAuthModal();
    router.push('/vendor/dashboard');
  };

  const filteredVenues = GURUGRAM_PRESEEDED_VENUES.filter((v) => {
    const matchesCat = selectedVenueCategory === 'all' || v.category === selectedVenueCategory;
    const matchesSearch =
      v.name.toLowerCase().includes(venueSearchQuery.toLowerCase()) ||
      v.locality.toLowerCase().includes(venueSearchQuery.toLowerCase()) ||
      v.email.toLowerCase().includes(venueSearchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="modal-overlay" onClick={closeAuthModal}>
      <motion.div
        initial={{ scale: 0.93, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.93, opacity: 0, y: 15 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 580,
          background: isNightMode ? '#0B0F17' : '#ffffff',
          border: isNightMode ? '1px solid rgba(255, 255, 255, 0.14)' : '1px solid rgba(0, 0, 0, 0.12)',
          borderRadius: 24,
          padding: '28px',
          backdropFilter: 'blur(36px)',
          WebkitBackdropFilter: 'blur(36px)',
          boxShadow: '0 32px 90px rgba(0,0,0,0.85)',
          position: 'relative',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
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
            cursor: 'pointer',
            color: isNightMode ? '#ffffff' : '#0f172a',
          }}
        >
          <X size={16} />
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#050814',
              marginBottom: 10,
              boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)',
            }}
          >
            <KeyRound size={22} />
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 22,
              fontWeight: 800,
              color: isNightMode ? '#ffffff' : '#0f172a',
              marginBottom: 4,
            }}
          >
            Sign In to COE Portal
          </h2>
          <p style={{ fontSize: 13, color: isNightMode ? 'rgba(255,255,255,0.6)' : '#64748b' }}>
            Corporate Procurement, Vendor Supply & Verified Gurugram Venues
          </p>
        </div>

        {/* ── Role Selection Tabs ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 6,
            background: isNightMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
            border: isNightMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
            borderRadius: 14,
            padding: 4,
            marginBottom: 18,
          }}
        >
          {[
            { id: 'vendor' as UserRole, label: 'Vendor / Partner Hub', icon: Store, color: '#f97316' },
            { id: 'corporate' as UserRole, label: 'Corporate Procurement', icon: Building2, color: '#10b981' },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = role === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setRole(tab.id);
                  setStep('email');
                  if (tab.id === 'vendor') {
                    if (!email) setEmail('playall123@coe.com');
                  } else if (tab.id === 'corporate') {
                    if (!email) setEmail('hr@nexus.com');
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '9px 8px',
                  borderRadius: 10,
                  border: 'none',
                  background: active ? (tab.color || '#10b981') : 'transparent',
                  color: active ? '#ffffff' : isNightMode ? 'rgba(255,255,255,0.6)' : '#64748b',
                  fontSize: 12.5,
                  fontWeight: active ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: 'var(--font-display)',
                }}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── Pre-Seeded 33 Gurugram Venues Quick Selector (Prominent for Vendors) ── */}
        <div
          style={{
            marginBottom: 18,
            borderRadius: 16,
            background: 'linear-gradient(145deg, rgba(249, 115, 22, 0.1) 0%, rgba(249, 115, 22, 0.03) 100%)',
            border: '1.5px solid rgba(249, 115, 22, 0.35)',
            overflow: 'hidden',
          }}
        >
          <div
            onClick={() => setShowVenuePicker(!showVenuePicker)}
            style={{
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              background: 'rgba(249, 115, 22, 0.06)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={16} color="#f97316" />
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#ffffff' }}>
                  Quick Login as Pre-Seeded NCR Venue ({GURUGRAM_PRESEEDED_VENUES.length} Verified)
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.55)' }}>
                  23 Sports Complexes & 100 Food / Nightclub Lounges
                </div>
              </div>
            </div>
            <ChevronDown
              size={18}
              color="#f97316"
              style={{
                transform: showVenuePicker ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
              }}
            />
          </div>

          <AnimatePresence>
            {showVenuePicker && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ padding: '12px 16px 16px', borderTop: '1px solid rgba(249, 115, 22, 0.2)' }}>
                  {/* Category Pills & Search */}
                  <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        type="button"
                        onClick={() => setSelectedVenueCategory('all')}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 8,
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer',
                          border: 'none',
                          background: selectedVenueCategory === 'all' ? '#f97316' : 'rgba(255,255,255,0.08)',
                          color: '#ffffff',
                        }}
                      >
                        All ({GURUGRAM_PRESEEDED_VENUES.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedVenueCategory('sports')}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 8,
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer',
                          border: 'none',
                          background: selectedVenueCategory === 'sports' ? '#0ea5e9' : 'rgba(255,255,255,0.08)',
                          color: '#ffffff',
                        }}
                      >
                        🏆 Sports (17)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedVenueCategory('food')}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 8,
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer',
                          border: 'none',
                          background: selectedVenueCategory === 'food' ? '#10b981' : 'rgba(255,255,255,0.08)',
                          color: '#ffffff',
                        }}
                      >
                        🥂 Food & Clubs (16)
                      </button>
                    </div>

                    <div style={{ flex: 1, minWidth: 140, position: 'relative' }}>
                      <Search size={13} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
                      <input
                        type="text"
                        placeholder="Search venue name..."
                        value={venueSearchQuery}
                        onChange={(e) => setVenueSearchQuery(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '4px 8px 4px 26px',
                          borderRadius: 8,
                          background: 'rgba(255,255,255,0.06)',
                          border: '1px solid rgba(255,255,255,0.12)',
                          color: '#ffffff',
                          fontSize: 11,
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>

                  {/* Scrollable Venue List */}
                  <div style={{ maxHeight: 220, overflowY: 'auto', display: 'grid', gap: 6 }}>
                    {filteredVenues.map((v) => (
                      <div
                        key={v.id}
                        onClick={() => handleSelectVenue(v)}
                        style={{
                          padding: '9px 12px',
                          borderRadius: 10,
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLDivElement).style.background = 'rgba(249, 115, 22, 0.15)';
                          (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(249, 115, 22, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLDivElement).style.background = 'rgba(255, 255, 255, 0.03)';
                          (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255, 255, 255, 0.08)';
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 13, fontWeight: 800, color: '#ffffff' }}>{v.name}</span>
                            <span
                              style={{
                                fontSize: 10,
                                padding: '1px 5px',
                                borderRadius: 4,
                                background: v.category === 'sports' ? 'rgba(14, 165, 233, 0.18)' : 'rgba(16, 185, 129, 0.18)',
                                color: v.category === 'sports' ? '#38bdf8' : '#34d399',
                                fontWeight: 700,
                              }}
                            >
                              {v.category === 'sports' ? 'Sports' : 'Food/Club'}
                            </span>
                            <span style={{ fontSize: 11, color: '#fbbf24', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                              <Star size={10} fill="#fbbf24" /> {v.rating.toFixed(1)}
                            </span>
                          </div>
                          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2, display: 'flex', gap: 10 }}>
                            <span>📍 {v.locality}</span>
                            <span>⏰ {v.timings}</span>
                            <span style={{ color: '#f97316' }}>🔑 {v.email}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="btn-primary"
                          style={{
                            padding: '4px 10px',
                            fontSize: 11,
                            background: '#f97316',
                            borderRadius: 8,
                            flexShrink: 0,
                          }}
                        >
                          1-Click Login →
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Standard Email + Password / OTP Form ── */}
        <form onSubmit={handlePasswordLogin}>
          <div style={{ marginBottom: 14 }}>
            <label
              style={{
                display: 'block',
                fontSize: 11.5,
                fontWeight: 700,
                color: isNightMode ? 'rgba(255,255,255,0.7)' : '#334155',
                marginBottom: 6,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {role === 'corporate' ? 'Corporate Work Email' : role === 'vendor' ? 'Vendor / Venue Email' : 'Admin Email'}
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={16}
                style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: role === 'vendor' ? '#f97316' : '#10b981',
                }}
              />
              <input
                type="email"
                className="input-base"
                required
                placeholder={
                  role === 'corporate'
                    ? 'e.g. hr@nexus.com'
                    : role === 'vendor'
                    ? 'e.g. playall123@coe.com / whiskysamba123@coe.com'
                    : 'admin@coe.com'
                }
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: 40 }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label
                style={{
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: isNightMode ? 'rgba(255,255,255,0.7)' : '#334155',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Password
              </label>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>
                Default: <strong style={{ color: '#10b981' }}>gurgaon123</strong>
              </span>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock
                size={16}
                style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'rgba(255,255,255,0.4)',
                }}
              />
              <input
                type="password"
                className="input-base"
                required
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: 40 }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !email}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '13px',
              background: role === 'vendor' ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' : undefined,
            }}
          >
            {loading ? 'Authenticating...' : `Log In as ${role.toUpperCase()}`}
            <ArrowRight size={15} />
          </button>
        </form>

        {/* ── Quick 1-Click Persona Accounts ── */}
        <div
          style={{
            marginTop: 20,
            paddingTop: 16,
            borderTop: isNightMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
          }}
        >
          <div
            style={{
              fontSize: 10.5,
              fontWeight: 800,
              color: isNightMode ? 'rgba(255,255,255,0.4)' : '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: 8,
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <Sparkles size={11} color="#10b981" />
            Quick Sign-In Presets
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <button
              type="button"
              onClick={() => handleQuickLogin('corporate', 'hr@nexus.com', '/corporate/dashboard')}
              style={{
                padding: '10px 8px',
                borderRadius: 10,
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                color: '#ffffff',
                fontSize: 11.5,
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              <div style={{ fontWeight: 700, color: '#10b981' }}>🏢 Corporate</div>
              <div style={{ fontSize: 10, opacity: 0.7 }}>Nexus Technologies</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('vendor', 'playall123@coe.com', '/vendor/dashboard')}
              style={{
                padding: '10px 8px',
                borderRadius: 10,
                background: 'rgba(14, 165, 233, 0.1)',
                border: '1px solid rgba(14, 165, 233, 0.25)',
                color: '#ffffff',
                fontSize: 11.5,
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              <div style={{ fontWeight: 700, color: '#0ea5e9' }}>🏆 Sports Arena</div>
              <div style={{ fontSize: 10, opacity: 0.7 }}>PlayAll Complex</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('vendor', 'whiskysamba123@coe.com', '/vendor/dashboard')}
              style={{
                padding: '10px 8px',
                borderRadius: 10,
                background: 'rgba(249, 115, 22, 0.1)',
                border: '1px solid rgba(249, 115, 22, 0.25)',
                color: '#ffffff',
                fontSize: 11.5,
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              <div style={{ fontWeight: 700, color: '#f97316' }}>🥂 Food & Lounge</div>
              <div style={{ fontSize: 10, opacity: 0.7 }}>Whisky Samba</div>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
