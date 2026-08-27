'use client';
// ============================================================
// components/auth/AuthModal.tsx
// Production Enterprise Authentication Portal
// Email + Password & OTP Access for Verified Corporate & Vendor Partners
// ============================================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { UserRole } from '@/lib/types';
import { GURUGRAM_PRESEEDED_VENUES, GurugramVenue } from '@/data/venues';
import {
  Mail, KeyRound, Building2, Store,
  ArrowRight, X, Sparkles, CheckCircle2, Star, Clock, MapPin, Search, ChevronDown, Lock, Info
} from 'lucide-react';

export function AuthModal() {
  const router = useRouter();
  const { authModalOpen, closeAuthModal, sendOtp, verifyOtp, loginWithPassword, isNightMode } = useStore();

  const [role, setRole] = useState<UserRole>('vendor');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  const handleSelectVenue = (venue: GurugramVenue) => {
    setEmail(venue.email);
    setShowVenuePicker(false);
  };

  const sportsCount = GURUGRAM_PRESEEDED_VENUES.filter((v) => v.category === 'sports').length;
  const foodCount = GURUGRAM_PRESEEDED_VENUES.filter((v) => v.category === 'food').length;

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
          maxWidth: 560,
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
            Enterprise Reverse-Bidding & Verified Delhi NCR Marketplace
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

        {/* ── Admin Activation & Verified Partner Notice ── */}
        <div
          style={{
            padding: '12px 14px',
            borderRadius: 14,
            background: role === 'vendor' ? 'rgba(249, 115, 22, 0.08)' : 'rgba(16, 185, 129, 0.08)',
            border: role === 'vendor' ? '1px solid rgba(249, 115, 22, 0.25)' : '1px solid rgba(16, 185, 129, 0.25)',
            marginBottom: 18,
            fontSize: 12,
            lineHeight: 1.5,
            color: isNightMode ? 'rgba(255,255,255,0.8)' : '#334155',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: role === 'vendor' ? '#f97316' : '#10b981', marginBottom: 3 }}>
            <Info size={14} />
            <span>{role === 'vendor' ? 'Verified Venue Partner Access' : 'Corporate Account Activation'}</span>
          </div>
          <div>
            To activate your verified account or request access credentials, please reach out to admin via email at{' '}
            <a
              href="mailto:contact@communityofemployees.com"
              style={{ color: role === 'vendor' ? '#f97316' : '#10b981', fontWeight: 700, textDecoration: 'underline' }}
            >
              contact@communityofemployees.com
            </a>
          </div>
        </div>

        {/* ── Verified NCR Partner Directory Browser (Vendor Tab) ── */}
        {role === 'vendor' && (
          <div
            style={{
              marginBottom: 18,
              borderRadius: 14,
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              overflow: 'hidden',
            }}
          >
            <div
              onClick={() => setShowVenuePicker(!showVenuePicker)}
              style={{
                padding: '11px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                background: 'rgba(255, 255, 255, 0.02)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Building2 size={15} color="#f97316" />
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: '#ffffff' }}>
                    Browse Verified Delhi NCR Venues ({GURUGRAM_PRESEEDED_VENUES.length} Listed)
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.5)' }}>
                    {sportsCount} Sports Complexes & {foodCount} Food / Nightclubs
                  </div>
                </div>
              </div>
              <ChevronDown
                size={16}
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
                  <div style={{ padding: '12px 14px 14px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    {/* Category Pills & Search */}
                    <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedVenueCategory('all')}
                        style={{
                          padding: '4px 9px',
                          borderRadius: 6,
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
                          padding: '4px 9px',
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer',
                          border: 'none',
                          background: selectedVenueCategory === 'sports' ? '#0ea5e9' : 'rgba(255,255,255,0.08)',
                          color: '#ffffff',
                        }}
                      >
                        🏆 Sports ({sportsCount})
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedVenueCategory('food')}
                        style={{
                          padding: '4px 9px',
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer',
                          border: 'none',
                          background: selectedVenueCategory === 'food' ? '#10b981' : 'rgba(255,255,255,0.08)',
                          color: '#ffffff',
                        }}
                      >
                        🥂 Food/Lounges ({foodCount})
                      </button>

                      <div style={{ flex: 1, minWidth: 130, position: 'relative' }}>
                        <Search size={12} style={{ position: 'absolute', left: 7, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
                        <input
                          type="text"
                          placeholder="Search venue name..."
                          value={venueSearchQuery}
                          onChange={(e) => setVenueSearchQuery(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '3px 6px 3px 24px',
                            borderRadius: 6,
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: '#ffffff',
                            fontSize: 11,
                            outline: 'none',
                          }}
                        />
                      </div>
                    </div>

                    {/* Scrollable Venue List */}
                    <div style={{ maxHeight: 180, overflowY: 'auto', display: 'grid', gap: 5 }}>
                      {filteredVenues.map((v) => (
                        <div
                          key={v.id}
                          onClick={() => handleSelectVenue(v)}
                          style={{
                            padding: '7px 10px',
                            borderRadius: 8,
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.06)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLDivElement).style.background = 'rgba(249, 115, 22, 0.12)';
                            (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(249, 115, 22, 0.3)';
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLDivElement).style.background = 'rgba(255, 255, 255, 0.03)';
                            (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255, 255, 255, 0.06)';
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontSize: 12.5, fontWeight: 700, color: '#ffffff' }}>{v.name}</span>
                              <span style={{ fontSize: 10, color: '#fbbf24', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                                <Star size={9} fill="#fbbf24" /> {v.rating.toFixed(1)}
                              </span>
                            </div>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>
                              <span>📍 {v.locality}</span> · <span>⏰ {v.timings}</span>
                            </div>
                          </div>

                          <span style={{ fontSize: 11, color: '#f97316', fontWeight: 700 }}>
                            Select →
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ── Standard Email + Password / OTP Form ── */}
        <form onSubmit={handlePasswordLogin}>
          <div style={{ marginBottom: 14 }}>
            <label
              style={{
                display: 'block',
                fontSize: 11.5,
                fontWeight: 700,
                color: isNightMode ? 'rgba(255,255,255,0.7)' : '#475569',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: 6,
              }}
            >
              {role === 'vendor' ? 'Venue Partner Email' : 'Corporate Work Email'}
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={16}
                style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: isNightMode ? 'rgba(255,255,255,0.4)' : '#94a3b8',
                }}
              />
              <input
                type="email"
                required
                placeholder={role === 'corporate' ? 'name@company.com' : 'partner@venue.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-base"
                style={{ paddingLeft: 40 }}
              />
            </div>
          </div>

          {/* Password Mode */}
          {authMode === 'password' && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label
                  style={{
                    fontSize: 11.5,
                    fontWeight: 700,
                    color: isNightMode ? 'rgba(255,255,255,0.7)' : '#475569',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setAuthMode('otp')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#10b981',
                    fontSize: 11.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Sign in with OTP instead
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  style={{
                    position: 'absolute',
                    left: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: isNightMode ? 'rgba(255,255,255,0.4)' : '#94a3b8',
                  }}
                />
                <input
                  type="password"
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-base"
                  style={{ paddingLeft: 40 }}
                />
              </div>
            </div>
          )}

          {/* OTP Mode */}
          {authMode === 'otp' && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label
                  style={{
                    fontSize: 11.5,
                    fontWeight: 700,
                    color: isNightMode ? 'rgba(255,255,255,0.7)' : '#475569',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  One-Time Password (OTP)
                </label>
                <button
                  type="button"
                  onClick={() => setAuthMode('password')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#10b981',
                    fontSize: 11.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Sign in with Password instead
                </button>
              </div>

              {step === 'email' ? (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={!email || loading}
                  className="btn-primary"
                  style={{ width: '100%', padding: '11px', fontSize: 13 }}
                >
                  {loading ? 'Sending OTP…' : 'Send Verification OTP →'}
                </button>
              ) : (
                <div style={{ display: 'grid', gap: 10 }}>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="input-base"
                    style={{ textAlign: 'center', letterSpacing: '0.2em', fontSize: 16, fontWeight: 800 }}
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={!otp || loading}
                    className="btn-primary"
                    style={{ width: '100%', padding: '11px', fontSize: 13 }}
                  >
                    {loading ? 'Verifying OTP…' : 'Verify & Enter Portal →'}
                  </button>
                </div>
              )}
            </div>
          )}

          {authMode === 'password' && (
            <button
              type="submit"
              disabled={!email || !password || loading}
              style={{
                width: '100%',
                padding: '13px',
                borderRadius: 12,
                border: 'none',
                background: role === 'vendor' ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                fontSize: 13.5,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: role === 'vendor' ? '0 6px 20px rgba(249,115,22,0.35)' : '0 6px 20px rgba(16,185,129,0.35)',
                opacity: (!email || !password || loading) ? 0.5 : 1,
                transition: 'all 0.2s ease',
              }}
            >
              <span>{loading ? 'Authenticating…' : 'Sign In to Portal'}</span>
              {!loading && <ArrowRight size={15} />}
            </button>
          )}
        </form>
      </motion.div>
    </div>
  );
}
