'use client';
// ============================================================
// components/venture/ReverseBiddingSimulator.tsx
// Interactive Live Reverse-Auction Engine Visualizer
// Real-time price drops, competitive bid ticks, and savings tally
// ============================================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingDown, ShieldCheck, Flame, Clock, CheckCircle2,
  Sparkles, Trophy, ArrowRight, RefreshCw, Zap, Users, MapPin, DollarSign, Star
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface SimulationScenario {
  id: string;
  category: 'sports' | 'food' | 'trips';
  title: string;
  corporateClient: string;
  location: string;
  pax: number;
  initialBudget: number;
  bids: {
    vendorName: string;
    locality: string;
    rating: number;
    bidAmount: number;
    delaySeconds: number;
    proposalHighlight: string;
    amenities: string[];
    isWinner?: boolean;
  }[];
}

const SCENARIOS: SimulationScenario[] = [
  {
    id: 'sports_cricket',
    category: 'sports',
    title: 'Inter-Corporate Box Cricket Premier League',
    corporateClient: 'Nexus Technologies (DLF Cyber City)',
    location: 'Golf Course Extension Road, Gurugram',
    pax: 120,
    initialBudget: 240000,
    bids: [
      {
        vendorName: 'Arena Turf Sports Management',
        locality: 'Sector 54, Golf Course Rd',
        rating: 4.8,
        bidAmount: 228000,
        delaySeconds: 1.5,
        proposalHighlight: 'Includes floodlit turf, umpires, cricket gear & custom jerseys',
        amenities: ['FIFA Turf', 'Live App Scoring', 'Hydration Station'],
      },
      {
        vendorName: 'Rackonnect 63 Sports Arena',
        locality: 'Sector 63, Golf Course Ext',
        rating: 4.7,
        bidAmount: 205000,
        delaySeconds: 3.5,
        proposalHighlight: 'Includes 2 simultaneous box turfs, energy drinks & commentary booth',
        amenities: ['2 Box Turfs', 'Audio Rig', 'First Aid Pavilion'],
      },
      {
        vendorName: 'PlayAll Sports Complex (WINNER)',
        locality: 'Sector 62, Golf Course Ext',
        rating: 4.9,
        bidAmount: 182000,
        delaySeconds: 5.5,
        proposalHighlight: 'Championship Trophy, live streaming, DJ sound setup & buffet lunch',
        amenities: ['FIFA Grade Turf', 'Trophies & Medals', 'Buffet Dining', 'Live Video Stream'],
        isWinner: true,
      },
    ],
  },
  {
    id: 'food_gala',
    category: 'food',
    title: 'Annual Founders Gala & Executive Mixer',
    corporateClient: 'Indigotec Global (Horizon Center)',
    location: 'Golf Course Road, Gurugram',
    pax: 250,
    initialBudget: 480000,
    bids: [
      {
        vendorName: 'Decode Air Bar & Lounge',
        locality: 'Sector 29 Market',
        rating: 4.3,
        bidAmount: 445000,
        delaySeconds: 1.5,
        proposalHighlight: 'Private VIP terrace, 4-course Pan Asian buffet & craft cocktails',
        amenities: ['Rooftop Terrace', 'Live DJ', 'Valet Parking'],
      },
      {
        vendorName: 'Whisky Samba Lounge',
        locality: 'Two Horizon Center',
        rating: 4.8,
        bidAmount: 410000,
        delaySeconds: 3.5,
        proposalHighlight: 'Signature mixology bar, gourmet antipasti & dedicated soundstage',
        amenities: ['Sommelier Bar', 'Private VIP Room', 'Security Staff'],
      },
      {
        vendorName: 'Open Tap Microbrewery (WINNER)',
        locality: 'South Point Mall, Golf Course Rd',
        rating: 4.9,
        bidAmount: 365000,
        delaySeconds: 5.5,
        proposalHighlight: 'Unlimited fresh craft beer on tap, 6 live food stations & live acoustic band',
        amenities: ['Fresh Craft Brews', 'Live Acoustic Band', '6 Food Counters', 'Custom Branding'],
        isWinner: true,
      },
    ],
  },
  {
    id: 'trips_retreat',
    category: 'trips',
    title: 'Leadership Strategy Offsite & Mountain Retreat',
    corporateClient: 'Apex Financial Services (Cyber Hub)',
    location: 'Rishikesh / Mussoorie Luxury Resort',
    pax: 45,
    initialBudget: 850000,
    bids: [
      {
        vendorName: 'Wandercraft Corporate Escapes',
        locality: 'Delhi NCR Fleet Hub',
        rating: 4.6,
        bidAmount: 795000,
        delaySeconds: 1.5,
        proposalHighlight: 'Volvo AC luxury transfers, 4-star riverfront cottages & team bonfire',
        amenities: ['Luxury Volvo', 'River Rafting', 'Bonfire Dinner'],
      },
      {
        vendorName: 'Summit Corporate Retreats (WINNER)',
        locality: 'DLF Phase 2 Headquarters',
        rating: 4.9,
        bidAmount: 690000,
        delaySeconds: 4.5,
        proposalHighlight: '5-star boutique resort, keynote boardroom AV, white-water rafting & gala BBQ night',
        amenities: ['5-Star Luxury Suites', 'Keynote AV Boardroom', 'Private River Rafting', 'Gala BBQ Night'],
        isWinner: true,
      },
    ],
  },
];

export function ReverseBiddingSimulator() {
  const [activeScenarioId, setActiveScenarioId] = useState('sports_cricket');
  const [isRunning, setIsRunning] = useState(true);
  const [timeProgress, setTimeProgress] = useState(0);
  const [visibleBidsCount, setVisibleBidsCount] = useState(1);

  const scenario = SCENARIOS.find((s) => s.id === activeScenarioId) || SCENARIOS[0];

  useEffect(() => {
    setTimeProgress(0);
    setVisibleBidsCount(1);
    setIsRunning(true);

    const interval = setInterval(() => {
      setTimeProgress((prev) => {
        if (prev >= 6) {
          clearInterval(interval);
          setIsRunning(false);
          return 6;
        }
        const next = prev + 0.5;
        if (next >= 1.5 && visibleBidsCount < 1) setVisibleBidsCount(1);
        if (next >= 3.5 && visibleBidsCount < 2) setVisibleBidsCount(2);
        if (next >= 5.5 && visibleBidsCount < 3) setVisibleBidsCount(3);
        return next;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [activeScenarioId]);

  const activeBids = scenario.bids.slice(0, visibleBidsCount);
  const lowestBid = activeBids.reduce(
    (min, b) => (b.bidAmount < min ? b.bidAmount : min),
    scenario.initialBudget
  );
  const savings = scenario.initialBudget - lowestBid;
  const savingsPercent = Math.round((savings / scenario.initialBudget) * 100);

  return (
    <div
      style={{
        borderRadius: 28,
        background: 'rgba(11, 15, 23, 0.85)',
        border: '1.5px solid rgba(16, 185, 129, 0.25)',
        boxShadow: '0 30px 100px rgba(0,0,0,0.8), 0 0 60px rgba(16,185,129,0.08)',
        backdropFilter: 'blur(20px)',
        overflow: 'hidden',
      }}
    >
      {/* ── Simulator Header ── */}
      <div
        style={{
          padding: '24px 28px',
          background: 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(14,165,233,0.06) 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: 'rgba(16,185,129,0.2)',
              border: '1px solid rgba(16,185,129,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10b981',
              boxShadow: '0 0 20px rgba(16,185,129,0.3)',
            }}
          >
            <Zap size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  padding: '3px 8px',
                  borderRadius: 999,
                  background: 'rgba(16,185,129,0.2)',
                  color: '#34d399',
                }}
              >
                LIVE REVERSE-AUCTION ENGINE
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#f97316', fontWeight: 700 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f97316', animation: 'pulse 1.5s infinite' }} />
                Real-Time Simulation
              </span>
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 800, color: '#ffffff', marginTop: 3 }}>
              {scenario.title}
            </h3>
          </div>
        </div>

        {/* Scenario Switcher Tabs */}
        <div style={{ display: 'flex', gap: 6, background: 'rgba(255,255,255,0.05)', padding: 4, borderRadius: 12 }}>
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveScenarioId(s.id)}
              style={{
                padding: '8px 14px',
                borderRadius: 9,
                border: activeScenarioId === s.id ? '1px solid rgba(16,185,129,0.4)' : '1px solid transparent',
                background: activeScenarioId === s.id ? 'rgba(16,185,129,0.2)' : 'transparent',
                color: activeScenarioId === s.id ? '#ffffff' : 'rgba(255,255,255,0.6)',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {s.category === 'sports' && '🏏 Box Cricket'}
              {s.category === 'food' && '🥂 Founders Gala'}
              {s.category === 'trips' && '✈️ Mountain Offsite'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Simulator Body ── */}
      <div style={{ padding: '24px 28px', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
        {/* Left: Live Bidding Stream */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Competitive Vendor Bids ({activeBids.length} Received)
            </div>
            <button
              onClick={() => {
                setTimeProgress(0);
                setVisibleBidsCount(1);
                setIsRunning(true);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 11,
                fontWeight: 700,
                color: '#10b981',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={12} /> Replay Auction
            </button>
          </div>

          <div style={{ display: 'grid', gap: 12 }}>
            <AnimatePresence>
              {activeBids.map((bid, index) => {
                const isCurrentLowest = bid.bidAmount === lowestBid;
                return (
                  <motion.div
                    key={bid.vendorName}
                    initial={{ opacity: 0, x: -20, scale: 0.96 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    style={{
                      borderRadius: 18,
                      padding: '16px 18px',
                      background: isCurrentLowest
                        ? 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(11,15,23,0.95) 100%)'
                        : 'rgba(255,255,255,0.03)',
                      border: isCurrentLowest
                        ? '1.5px solid rgba(16,185,129,0.45)'
                        : '1px solid rgba(255,255,255,0.08)',
                      boxShadow: isCurrentLowest ? '0 8px 30px rgba(16,185,129,0.15)' : 'none',
                      position: 'relative',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, color: '#ffffff' }}>
                            {bid.vendorName}
                          </h4>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, color: '#eab308', fontWeight: 800 }}>
                            <Star size={11} fill="#eab308" /> {bid.rating}
                          </span>
                        </div>
                        <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                          <MapPin size={11} /> {bid.locality}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 900, color: isCurrentLowest ? '#34d399' : '#ffffff' }}>
                          {formatCurrency(bid.bidAmount)}
                        </div>
                        <div style={{ fontSize: 10.5, color: isCurrentLowest ? '#10b981' : 'rgba(255,255,255,0.4)', fontWeight: 700 }}>
                          {isCurrentLowest ? '🔥 LOWEST QUOTE' : `+${formatCurrency(bid.bidAmount - lowestBid)}`}
                        </div>
                      </div>
                    </div>

                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 1.4, marginBottom: 10 }}>
                      "{bid.proposalHighlight}"
                    </p>

                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      {bid.amenities.map((am) => (
                        <span
                          key={am}
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 6,
                            background: 'rgba(255,255,255,0.06)',
                            color: 'rgba(255,255,255,0.75)',
                            border: '1px solid rgba(255,255,255,0.08)',
                          }}
                        >
                          {am}
                        </span>
                      ))}
                    </div>

                    {bid.isWinner && (
                      <div
                        style={{
                          marginTop: 10,
                          padding: '6px 10px',
                          borderRadius: 8,
                          background: 'rgba(16,185,129,0.2)',
                          border: '1px solid rgba(16,185,129,0.4)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span style={{ fontSize: 11, fontWeight: 800, color: '#34d399', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <CheckCircle2 size={13} /> 100% Contract Awarded & Price Locked
                        </span>
                        <span style={{ fontSize: 10.5, fontWeight: 700, color: '#ffffff' }}>
                          GST Ready Invoice
                        </span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Right: Real-Time Savings & Analytics Dashboard */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Main Savings Display Card */}
          <div
            style={{
              borderRadius: 20,
              padding: '22px',
              background: 'linear-gradient(145deg, rgba(16,185,129,0.15) 0%, rgba(14,165,233,0.08) 100%)',
              border: '1.5px solid rgba(16,185,129,0.3)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 800, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
              Enterprise Cost Compression
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.03em', lineHeight: 1 }}>
              {formatCurrency(savings)}
            </div>
            <div style={{ fontSize: 13, color: '#34d399', fontWeight: 700, marginTop: 4 }}>
              💸 {savingsPercent}% Direct Savings Achieved
            </div>

            <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: 700 }}>Starting RFP Budget</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#ffffff', marginTop: 2 }}>{formatCurrency(scenario.initialBudget)}</div>
              </div>
              <div>
                <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: 700 }}>Winning Reverse-Quote</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#34d399', marginTop: 2 }}>{formatCurrency(lowestBid)}</div>
              </div>
            </div>
          </div>

          {/* Turnaround & Trust Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ padding: '14px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ color: '#0ea5e9', marginBottom: 6 }}><Clock size={18} /></div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-display)' }}>4.2 Hours</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Avg Turnaround Time</div>
            </div>

            <div style={{ padding: '14px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ color: '#10b981', marginBottom: 6 }}><ShieldCheck size={18} /></div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-display)' }}>100% KYC</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Verified Gurugram Venues</div>
            </div>
          </div>

          {/* Corporate Client Bar */}
          <div style={{ padding: '12px 14px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', fontSize: 11.5, color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>🏢</span>
            <span>Corporate Buyer: <strong style={{ color: '#ffffff' }}>{scenario.corporateClient}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
