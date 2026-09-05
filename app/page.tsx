'use client';
// ============================================================
// app/page.tsx — COE homepage.
//
// The hero speaks to the employee who got handed the job of organising
// something, not to a procurement department. Numbers on this page are
// either derived from real data (venue count) or describe how the product
// works — nothing invented to manufacture urgency.
// ============================================================

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sparkles, ArrowRight, ShieldCheck, Zap, TrendingDown,
  Clock, CheckCircle2, Trophy, Wine, Building2, Store,
  MapPin, ChevronRight, FileText, Check, Shield, Layers, Users, Star
} from 'lucide-react';
import { BlurredCyberHubBackground } from '@/components/canvas/BlurredCyberHubBackground';
import { ReverseBiddingSimulator } from '@/components/venture/ReverseBiddingSimulator';
import { DelhiNcrPilotShowcase } from '@/components/venture/DelhiNcrPilotShowcase';
import { SavingsCalculator } from '@/components/venture/SavingsCalculator';
import { ContactSection } from '@/components/venture/ContactSection';
import { PreviewHeader } from '@/components/venture/PreviewHeader';
import { PreviewFooter } from '@/components/venture/PreviewFooter';
import { CategoryModal } from '@/components/modal/CategoryModal';
import { useStore } from '@/store/useStore';
import { GURUGRAM_PRESEEDED_VENUES } from '@/data/venues';

export default function HomePage() {
  const [activeWorkflowTab, setActiveWorkflowTab] = useState<'corporate' | 'vendor'>('corporate');
  const { isNightMode, openAuthModal } = useStore();

  return (
    <div
      style={{
        background: isNightMode ? '#05070E' : '#f8fafc',
        color: isNightMode ? '#ffffff' : '#0f172a',
        minHeight: '100vh',
        overflowX: 'hidden',
        transition: 'background 0.5s ease, color 0.5s ease',
        position: 'relative',
      }}
    >
      {/* ── Fixed Floating Cyber Navigation Bar ── */}
      <PreviewHeader />

      {/* ── Global Interactive Modals ── */}
      {/* AuthModal is rendered once in app/layout.tsx — rendering it here too
          put two copies of every field on the homepage. */}
      <CategoryModal />

      {/* ══════════════════════════════════════════════════════════
          1. HERO SECTION (2-COLUMN ARCHITECTURE WITH DAY/NIGHT WORKSPACE)
          ══════════════════════════════════════════════════════════ */}
      <section
        id="hero"
        style={{
          position: 'relative',
          minHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          paddingTop: 105,
          paddingBottom: 50,
          overflow: 'hidden',
        }}
      >
        {/* ── High-Res Blurred Corporate Architecture with Employee Workspace Reflections ── */}
        <BlurredCyberHubBackground />

        {/* Ambient Dark/Light Glass Overlay for Razor-Sharp Contrast */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: isNightMode
              ? 'linear-gradient(180deg, rgba(5,7,14,0.65) 0%, rgba(5,7,14,0.92) 100%)'
              : 'linear-gradient(180deg, rgba(248,250,252,0.65) 0%, rgba(248,250,252,0.92) 100%)',
            pointerEvents: 'none',
            zIndex: 1,
            transition: 'background 0.5s ease',
          }}
        />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 10, width: '100%' }}>
          {/* Top Pill Badge */}
          <div style={{ marginBottom: 14 }}>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '4px 12px',
                borderRadius: 999,
                background: isNightMode ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                boxShadow: '0 0 20px rgba(16,185,129,0.15)',
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
              <span style={{ fontSize: 11, fontWeight: 800, color: isNightMode ? '#34d399' : '#059669', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Currently live in Gurgaon
              </span>
            </motion.div>
          </div>

          {/* ── 2-COLUMN HERO GRID ── */}
          <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 1fr)', gap: 32, alignItems: 'center' }}>
            {/* ── Left Column: Value Prop & CTAs ── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              style={{ textAlign: 'left' }}
            >
              {/* Single-Line Headline 1 */}
              <h1
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(20px, 2.35vw, 36px)',
                  fontWeight: 900,
                  lineHeight: 1.15,
                  letterSpacing: '-0.025em',
                  marginBottom: 6,
                  color: isNightMode ? '#ffffff' : '#0f172a',
                }}
              >
                Got roped into planning the office party again?
              </h1>

              {/* Single-Line Headline 2 with Vibrant Gradient */}
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(18px, 2.05vw, 31px)',
                  fontWeight: 900,
                  lineHeight: 1.18,
                  letterSpacing: '-0.025em',
                  marginBottom: 16,
                  background: 'linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Post it once. Let Gurgaon&apos;s venues fight over it.
              </h2>

              {/* Subtitle */}
              <p
                style={{
                  fontSize: 'clamp(13.5px, 1.25vw, 15.5px)',
                  color: isNightMode ? 'rgba(255, 255, 255, 0.72)' : '#475569',
                  maxWidth: 540,
                  lineHeight: 1.55,
                  marginBottom: 22,
                }}
              >
                Apart from your actual job, are <em>you</em> the one organising the team&apos;s next
                sports meet? The Friday lunch, the offsite nobody agrees on, the Diwali party, the
                jerseys? Put it up here and let vendors around Cyber City, Golf Course Road, Sohna
                Road and Udyog Vihar come back with real quotes. No calls, no bhaiya-please-adjust,
                no chasing.
              </p>

              {/* CTAs */}
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
                <button
                  onClick={openAuthModal}
                  style={{
                    padding: '12px 22px',
                    borderRadius: 11,
                    border: 'none',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#ffffff',
                    fontSize: 13.5,
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                    boxShadow: '0 6px 20px rgba(16,185,129,0.35)',
                    transition: 'transform 0.15s ease',
                  }}
                >
                  <Zap size={15} />
                  <span>Post what you need</span>
                  <ArrowRight size={13} />
                </button>

                <a
                  href="#delhi-ncr-pilot"
                  style={{
                    padding: '12px 18px',
                    borderRadius: 11,
                    border: isNightMode ? '1px solid rgba(255, 255, 255, 0.16)' : '1px solid rgba(0, 0, 0, 0.14)',
                    background: isNightMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)',
                    color: isNightMode ? '#ffffff' : '#0f172a',
                    fontSize: 13.5,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                    textDecoration: 'none',
                  }}
                >
                  <Trophy size={15} color="#f97316" />
                  <span>See who&apos;s on here ({GURUGRAM_PRESEEDED_VENUES.length})</span>
                </a>
              </div>

              {/* Speed & Trust Highlights Row */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                  gap: 12,
                  paddingTop: 16,
                  borderTop: isNightMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
                }}
              >
                {/* Only things we can stand behind: a real count, and two
                    statements about how the product works. No made-up
                    "average turnaround" — there is no average yet. */}
                <div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#f97316', fontFamily: 'var(--font-display)' }}>
                    {GURUGRAM_PRESEEDED_VENUES.length} venues
                  </div>
                  <div style={{ fontSize: 11, color: isNightMode ? 'rgba(255,255,255,0.5)' : '#64748b', fontWeight: 600, marginTop: 2 }}>
                    Across Gurgaon, admin-reviewed
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#10b981', fontFamily: 'var(--font-display)' }}>
                    One form
                  </div>
                  <div style={{ fontSize: 11, color: isNightMode ? 'rgba(255,255,255,0.5)' : '#64748b', fontWeight: 600, marginTop: 2 }}>
                    Instead of eleven WhatsApp threads
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#0ea5e9', fontFamily: 'var(--font-display)' }}>
                    No middleman
                  </div>
                  <div style={{ fontSize: 11, color: isNightMode ? 'rgba(255,255,255,0.5)' : '#64748b', fontWeight: 600, marginTop: 2 }}>
                    You talk to the venue directly
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ── Right Column: Minimalist Precision Calculator ── */}
            <motion.div
              id="calculator"
              style={{ scrollMarginTop: 110 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <SavingsCalculator compact={true} />
            </motion.div>
          </div>
        </div>

        <style jsx>{`
          @media (max-width: 900px) {
            .hero-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </section>

      {/* ══════════════════════════════════════════════════════════
          1b. WHAT YOU CAN PUT UP — every category gets equal weight.
          ══════════════════════════════════════════════════════════ */}
      <section style={{ padding: '56px 24px 8px', position: 'relative' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(20px, 2.6vw, 30px)',
              fontWeight: 900,
              letterSpacing: '-0.02em',
              color: isNightMode ? '#ffffff' : '#0f172a',
              marginBottom: 6,
            }}
          >
            Whatever it is this quarter
          </h2>
          <p style={{ fontSize: 14, color: isNightMode ? 'rgba(255,255,255,0.6)' : '#475569', marginBottom: 26 }}>
            Sports meet or Secret Santa, it goes up the same way.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
              gap: 12,
            }}
          >
            {[
              { emoji: '🏏', title: 'Sports meet', line: 'Turf, courts, referees, kit. Box cricket on a Saturday.' },
              { emoji: '🍛', title: 'Team lunch', line: 'Thirty people, one bill, and someone is Jain.' },
              { emoji: '🍽️', title: 'Team dinner', line: 'A reserved section and a bar tab that stays sane.' },
              { emoji: '🚌', title: 'Team outing', line: 'A day out with transport that actually shows up.' },
              { emoji: '🎉', title: 'Office party', line: 'Diwali, annual day, quarter close. Stage, sound, décor.' },
              { emoji: '🏆', title: 'Function', line: 'Awards night, launch, milestone. Formal run of show.' },
              { emoji: '⛰️', title: 'Offsite', line: 'Rooms, a conference hall, and one thing to bond over.' },
              { emoji: '🎁', title: 'Gifting & merch', line: 'Hampers, welcome kits, jerseys with the logo right.' },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  padding: 16,
                  borderRadius: 14,
                  background: isNightMode ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.85)',
                  border: isNightMode ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(0,0,0,0.08)',
                }}
              >
                <div style={{ fontSize: 22, marginBottom: 8 }} aria-hidden>{item.emoji}</div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: isNightMode ? '#ffffff' : '#0f172a',
                    marginBottom: 4,
                  }}
                >
                  {item.title}
                </div>
                <div style={{ fontSize: 12.5, lineHeight: 1.55, color: isNightMode ? 'rgba(255,255,255,0.58)' : '#64748b' }}>
                  {item.line}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          2. LIVE REVERSE-BIDDING INTERACTIVE SIMULATOR SECTION
          ══════════════════════════════════════════════════════════ */}
      <section id="simulator" style={{ padding: '80px 24px', position: 'relative', scrollMarginTop: 80 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: '#10b981',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                padding: '4px 12px',
                borderRadius: 999,
                background: 'rgba(16, 185, 129, 0.12)',
              }}
            >
              ⚡ Worked example — not live activity
            </span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 3.2vw, 38px)', fontWeight: 900, color: isNightMode ? '#ffffff' : '#0f172a', letterSpacing: '-0.025em', marginTop: 10, marginBottom: 10 }}>
              What happens after you post
            </h2>
            <p style={{ fontSize: 14.5, color: isNightMode ? 'rgba(255,255,255,0.65)' : '#475569', maxWidth: 640, margin: '0 auto' }}>
              A walkthrough with made-up numbers, so you can see the shape of it: vendors can see the
              requirement but not each other&apos;s quotes, so the price they send is the price they
              are willing to do it for. Nothing on this page is a real bid.
            </p>
          </div>

          <ReverseBiddingSimulator />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          3. HOW IT WORKS — DUAL-SIDED ENTERPRISE WORKFLOW
          ══════════════════════════════════════════════════════════ */}
      <section id="how-it-works" style={{ padding: '80px 24px', background: isNightMode ? 'rgba(255,255,255,0.015)' : 'rgba(0,0,0,0.02)', position: 'relative', scrollMarginTop: 80 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: '#0ea5e9',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                padding: '4px 12px',
                borderRadius: 999,
                background: 'rgba(14, 165, 233, 0.12)',
              }}
            >
              🔄 SEAMLESS B2B PROCUREMENT WORKFLOW
            </span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 3.2vw, 38px)', fontWeight: 900, color: isNightMode ? '#ffffff' : '#0f172a', letterSpacing: '-0.025em', marginTop: 10, marginBottom: 16 }}>
              Built for Enterprise Teams & Premier Venues
            </h2>

            {/* Workflow Switcher Tab */}
            <div style={{ display: 'inline-flex', gap: 6, background: isNightMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', padding: 4, borderRadius: 14, border: isNightMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)' }}>
              <button
                onClick={() => setActiveWorkflowTab('corporate')}
                style={{
                  padding: '9px 20px',
                  borderRadius: 10,
                  border: 'none',
                  cursor: 'pointer',
                  background: activeWorkflowTab === 'corporate' ? '#10b981' : 'transparent',
                  color: activeWorkflowTab === 'corporate' ? '#ffffff' : isNightMode ? 'rgba(255,255,255,0.6)' : '#64748b',
                  fontSize: 13,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                }}
              >
                <Building2 size={15} />
                <span>For Corporate HR & Procurement</span>
              </button>

              <button
                onClick={() => setActiveWorkflowTab('vendor')}
                style={{
                  padding: '9px 20px',
                  borderRadius: 10,
                  border: 'none',
                  cursor: 'pointer',
                  background: activeWorkflowTab === 'vendor' ? '#f97316' : 'transparent',
                  color: activeWorkflowTab === 'vendor' ? '#ffffff' : isNightMode ? 'rgba(255,255,255,0.6)' : '#64748b',
                  fontSize: 13,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                }}
              >
                <Store size={15} />
                <span>For Verified Venue Partners</span>
              </button>
            </div>
          </div>

          {/* Workflow Steps Grid */}
          {activeWorkflowTab === 'corporate' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 18 }}>
              {[
                {
                  step: '01',
                  title: 'Publish RFP in 60s',
                  desc: 'Pick your category (Cricket tournament, Founders dinner, Offsite), specify pax, target budget & dates.',
                  icon: '📝',
                  color: '#10b981',
                },
                {
                  step: '02',
                  title: 'Receive Blind Bids',
                  desc: 'Verified Gurugram facilities submit competitive line-item quotations in a structured reverse auction.',
                  icon: '⚡',
                  color: '#0ea5e9',
                },
                {
                  step: '03',
                  title: 'Compare & Audit',
                  desc: 'Review itemized menus, turf specifications, sound rigs, and corporate suitability profiles.',
                  icon: '🔍',
                  color: '#f97316',
                },
                {
                  step: '04',
                  title: '1-Click Contract Lock',
                  desc: 'Award the deal with zero hidden broker commissions. Get 100% compliant B2B invoicing.',
                  icon: '🤝',
                  color: '#a855f7',
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    borderRadius: 20,
                    padding: '24px 20px',
                    background: isNightMode ? 'rgba(11, 15, 23, 0.9)' : '#ffffff',
                    border: isNightMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0,0,0,0.08)',
                    boxShadow: isNightMode ? '0 12px 30px rgba(0,0,0,0.5)' : '0 8px 24px rgba(0,0,0,0.05)',
                  }}
                >
                  <div style={{ fontSize: 28, marginBottom: 10 }}>{item.icon}</div>
                  <div style={{ fontSize: 10.5, fontWeight: 900, color: item.color, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
                    STEP {item.step}
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 800, color: isNightMode ? '#ffffff' : '#0f172a', marginBottom: 6 }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: 12.5, color: isNightMode ? 'rgba(255,255,255,0.65)' : '#64748b', lineHeight: 1.5 }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 18 }}>
              {[
                {
                  step: '01',
                  title: 'Instant KYC Onboarding',
                  desc: 'Submit your GSTIN, facility locality, and past corporate references for fast-track verification.',
                  icon: '🛡️',
                  color: '#f97316',
                },
                {
                  step: '02',
                  title: 'Direct Enterprise RFPs',
                  desc: 'Access verified requirements from high-budget corporate procurement teams in Delhi NCR.',
                  icon: '💼',
                  color: '#10b981',
                },
                {
                  step: '03',
                  title: 'Live Reverse Bidding',
                  desc: 'Place transparent bids with match score feedback. Revise pricing dynamically to win the contract.',
                  icon: '📈',
                  color: '#0ea5e9',
                },
                {
                  step: '04',
                  title: 'Guaranteed Payouts',
                  desc: 'Milestone-based corporate settlements with zero intermediary broker commission leakage.',
                  icon: '💰',
                  color: '#eab308',
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    borderRadius: 20,
                    padding: '24px 20px',
                    background: isNightMode ? 'rgba(11, 15, 23, 0.9)' : '#ffffff',
                    border: isNightMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0,0,0,0.08)',
                    boxShadow: isNightMode ? '0 12px 30px rgba(0,0,0,0.5)' : '0 8px 24px rgba(0,0,0,0.05)',
                  }}
                >
                  <div style={{ fontSize: 28, marginBottom: 10 }}>{item.icon}</div>
                  <div style={{ fontSize: 10.5, fontWeight: 900, color: item.color, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
                    STEP {item.step}
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 800, color: isNightMode ? '#ffffff' : '#0f172a', marginBottom: 6 }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: 12.5, color: isNightMode ? 'rgba(255,255,255,0.65)' : '#64748b', lineHeight: 1.5 }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          4. ZERO-TRUST ENTERPRISE VERIFICATION ENGINE
          ══════════════════════════════════════════════════════════ */}
      <section id="verification" style={{ padding: '80px 24px', position: 'relative', scrollMarginTop: 80 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: '#a855f7',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                padding: '4px 12px',
                borderRadius: 999,
                background: 'rgba(168, 85, 247, 0.12)',
              }}
            >
              🔒 6-TIER ENTERPRISE TRUST PROTOCOL
            </span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 3.2vw, 38px)', fontWeight: 900, color: isNightMode ? '#ffffff' : '#0f172a', letterSpacing: '-0.025em', marginTop: 10, marginBottom: 12 }}>
              Zero-Trust Verification & Enterprise Quality Audits
            </h2>
            <p style={{ fontSize: 14.5, color: isNightMode ? 'rgba(255,255,255,0.65)' : '#475569', maxWidth: 680, margin: '0 auto' }}>
              Corporate procurement mandates zero failure risk. Every facility in our network undergoes rigorous statutory and physical auditing before placing bids.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {[
              {
                title: 'GSTIN Statutory Verification',
                desc: 'Every vendor is verified for legitimate statutory standing and active tax filing for seamless corporate reconciliation.',
                tag: 'STATUTORY COMPLIANCE',
                icon: <ShieldCheck size={20} color="#10b981" />,
                badge: 'Verified Entity',
              },
              {
                title: 'On-Ground Physical Facility Audits',
                desc: 'Box cricket turfs, FIFA floodlights, lounge acoustics, and kitchen hygiene standards are physically verified by our operations team.',
                tag: 'QUALITY AUDIT',
                icon: <Layers size={20} color="#0ea5e9" />,
                badge: 'Inspected Facility',
              },
              {
                title: 'Price Lock & Zero Surge Guarantee',
                desc: 'Once a reverse-bid is awarded, the venue cannot charge peak-hour premiums, surprise cover fees, or ad-hoc penalties.',
                tag: 'CONTRACTUAL SLA',
                icon: <Shield size={20} color="#f97316" />,
                badge: 'Price Lock SLA',
              },
              {
                title: 'Itemized Transparent Invoicing',
                desc: 'Clear breakdown of ground rentals, umpire charges, food counters, live DJ, and merchandise with zero broker markups.',
                tag: 'FINANCIAL TRANSPARENCY',
                icon: <FileText size={20} color="#a855f7" />,
                badge: 'Zero Hidden Fees',
              },
              {
                title: 'Enterprise Event Concierge Support',
                desc: 'Dedicated procurement coordinator assigned to oversee schedule alignment, referee setup, and venue onboarding.',
                tag: 'OPERATIONAL BACKING',
                icon: <Users size={20} color="#34d399" />,
                badge: 'Dedicated Desk',
              },
              {
                title: 'Dynamic Reverse-Auction Governance',
                desc: 'Algorithm ensures fair market pricing, anti-collusion protocols, and strictly confidential blind quotations.',
                tag: 'AUCTION GOVERNANCE',
                icon: <Zap size={20} color="#eab308" />,
                badge: 'Fair Competition',
              },
            ].map((pillar, i) => (
              <div
                key={i}
                style={{
                  borderRadius: 20,
                  padding: '24px',
                  background: isNightMode ? 'rgba(11, 15, 23, 0.9)' : '#ffffff',
                  border: isNightMode ? '1.5px solid rgba(255, 255, 255, 0.08)' : '1.5px solid rgba(0,0,0,0.08)',
                  boxShadow: isNightMode ? '0 12px 30px rgba(0,0,0,0.5)' : '0 8px 24px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: isNightMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {pillar.icon}
                    </div>
                    <span style={{ fontSize: 10.5, fontWeight: 800, color: '#34d399', background: 'rgba(16,185,129,0.15)', padding: '2px 8px', borderRadius: 6 }}>
                      {pillar.badge}
                    </span>
                  </div>

                  <div style={{ fontSize: 10, fontWeight: 800, color: isNightMode ? 'rgba(255,255,255,0.4)' : '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                    {pillar.tag}
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 800, color: isNightMode ? '#ffffff' : '#0f172a', marginBottom: 8 }}>
                    {pillar.title}
                  </h3>
                  <p style={{ fontSize: 12.5, color: isNightMode ? 'rgba(255,255,255,0.65)' : '#64748b', lineHeight: 1.5 }}>
                    {pillar.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          5. DELHI NCR LIVE PILOT SHOWCASE (SPORTS & PARTY HUBS)
          ══════════════════════════════════════════════════════════ */}
      <section id="delhi-ncr-pilot" style={{ padding: '80px 24px', background: isNightMode ? 'rgba(255,255,255,0.015)' : 'rgba(0,0,0,0.02)', position: 'relative', scrollMarginTop: 80 }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          <DelhiNcrPilotShowcase />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          6. CONTACT US & VIP ENTERPRISE DEMO BOOKING
          ══════════════════════════════════════════════════════════ */}
      <section style={{ padding: '80px 24px 110px', position: 'relative' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <ContactSection />
        </div>
      </section>

      {/* ── Footer ── */}
      <PreviewFooter />
    </div>
  );
}
