'use client';
// ============================================================
// components/venture/SavingsCalculator.tsx
// Ultra-Cool Minimalist Enterprise Event Spend & ROI Engine
// Precision custom sliders, animated spend compression & luxury glassmorphism
// ============================================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingDown, Clock, ShieldCheck, ArrowRight,
  Sparkles, Trophy, Wine, Plane, Gift, Zap, Users, Calendar, DollarSign
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { formatCurrency } from '@/lib/utils';

type EventCategoryKey = 'sports' | 'food' | 'trips' | 'gifts';

interface CategoryPreset {
  label: string;
  shortLabel: string;
  icon: string;
  defaultHeadcount: number;
  minHeadcount: number;
  maxHeadcount: number;
  defaultEvents: number;
  defaultCostPerHead: number;
  minCost: number;
  maxCost: number;
  typicalBrokerMargin: number;
  color: string;
}

const CATEGORY_CONFIGS: Record<EventCategoryKey, CategoryPreset> = {
  sports: {
    label: 'Sports & Tournaments',
    shortLabel: 'Sports',
    icon: '🏏',
    defaultHeadcount: 120,
    minHeadcount: 20,
    maxHeadcount: 500,
    defaultEvents: 6,
    defaultCostPerHead: 1800,
    minCost: 500,
    maxCost: 8000,
    typicalBrokerMargin: 0.28,
    color: '#10b981',
  },
  food: {
    label: 'Founders Dinners & Mixers',
    shortLabel: 'Dinners',
    icon: '🥂',
    defaultHeadcount: 220,
    minHeadcount: 30,
    maxHeadcount: 800,
    defaultEvents: 8,
    defaultCostPerHead: 2400,
    minCost: 1000,
    maxCost: 10000,
    typicalBrokerMargin: 0.32,
    color: '#f97316',
  },
  trips: {
    label: 'Leadership Offsites',
    shortLabel: 'Offsites',
    icon: '✈️',
    defaultHeadcount: 45,
    minHeadcount: 15,
    maxHeadcount: 200,
    defaultEvents: 3,
    defaultCostPerHead: 14000,
    minCost: 4000,
    maxCost: 35000,
    typicalBrokerMargin: 0.25,
    color: '#0ea5e9',
  },
  gifts: {
    label: 'Rewards & Hampers',
    shortLabel: 'Rewards',
    icon: '🎁',
    defaultHeadcount: 350,
    minHeadcount: 50,
    maxHeadcount: 1500,
    defaultEvents: 4,
    defaultCostPerHead: 1500,
    minCost: 500,
    maxCost: 8000,
    typicalBrokerMargin: 0.35,
    color: '#a855f7',
  },
};

export function SavingsCalculator({ compact = false }: { compact?: boolean }) {
  const { isNightMode } = useStore();
  const [activeCategory, setActiveCategory] = useState<EventCategoryKey>('sports');
  const config = CATEGORY_CONFIGS[activeCategory];

  const [headcount, setHeadcount] = useState(config.defaultHeadcount);
  const [eventsPerYear, setEventsPerYear] = useState(config.defaultEvents);
  const [costPerHead, setCostPerHead] = useState(config.defaultCostPerHead);

  const handleCategoryChange = (cat: EventCategoryKey) => {
    setActiveCategory(cat);
    const newConfig = CATEGORY_CONFIGS[cat];
    setHeadcount(newConfig.defaultHeadcount);
    setEventsPerYear(newConfig.defaultEvents);
    setCostPerHead(newConfig.defaultCostPerHead);
  };

  // Math:
  const directVenueBaseSpend = headcount * eventsPerYear * costPerHead;
  const legacyAgencySpend = Math.round(directVenueBaseSpend * (1 + config.typicalBrokerMargin));
  const coeDirectSpend = Math.round(directVenueBaseSpend * 1.02); // 2% minimal platform facilitation
  const annualSavings = legacyAgencySpend - coeDirectSpend;
  const savingsPercent = Math.round((annualSavings / legacyAgencySpend) * 100);
  const hoursSaved = eventsPerYear * 26;

  // Percentage calculations for custom gradient slider track fills
  const headcountPct = Math.round(((headcount - config.minHeadcount) / (config.maxHeadcount - config.minHeadcount)) * 100);
  const eventsPct = Math.round(((eventsPerYear - 1) / (16 - 1)) * 100);
  const costPct = Math.round(((costPerHead - config.minCost) / (config.maxCost - config.minCost)) * 100);

  // ─── Compact Minimalist Card for Hero ───
  if (compact) {
    return (
      <div
        style={{
          borderRadius: 22,
          background: isNightMode
            ? 'linear-gradient(145deg, rgba(11,15,25,0.94) 0%, rgba(15,23,42,0.9) 100%)'
            : 'linear-gradient(145deg, rgba(255,255,255,0.96) 0%, rgba(248,250,252,0.92) 100%)',
          border: isNightMode
            ? '1.5px solid rgba(16, 185, 129, 0.28)'
            : '1.5px solid rgba(16, 185, 129, 0.2)',
          padding: '22px 24px',
          boxShadow: isNightMode
            ? '0 24px 70px rgba(0,0,0,0.85), 0 0 40px rgba(16,185,129,0.06)'
            : '0 20px 50px rgba(0,0,0,0.08), 0 0 30px rgba(16,185,129,0.05)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle Ambient Accent Glow */}
        <div
          style={{
            position: 'absolute',
            top: -40,
            right: -40,
            width: 140,
            height: 140,
            borderRadius: '50%',
            background: config.color,
            filter: 'blur(60px)',
            opacity: isNightMode ? 0.15 : 0.08,
            pointerEvents: 'none',
          }}
        />

        {/* ── 1. Header: Live Title & Segmented Category Pills ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
            <span style={{ fontSize: 11, fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              REVERSE-AUCTION ROI
            </span>
          </div>

          {/* Minimalist Segmented Category Switcher */}
          <div
            style={{
              display: 'flex',
              gap: 3,
              background: isNightMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
              padding: 3,
              borderRadius: 10,
              border: isNightMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
            }}
          >
            {(Object.keys(CATEGORY_CONFIGS) as EventCategoryKey[]).map((catKey) => {
              const item = CATEGORY_CONFIGS[catKey];
              const active = activeCategory === catKey;
              return (
                <button
                  key={catKey}
                  type="button"
                  onClick={() => handleCategoryChange(catKey)}
                  style={{
                    padding: '4px 9px',
                    borderRadius: 7,
                    border: 'none',
                    background: active ? item.color : 'transparent',
                    color: active ? '#ffffff' : isNightMode ? 'rgba(255,255,255,0.6)' : '#64748b',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    boxShadow: active ? `0 2px 8px ${item.color}44` : 'none',
                    transition: 'all 0.18s cubic-bezier(0.2, 0.8, 0.2, 1)',
                  }}
                >
                  <span style={{ fontSize: 11 }}>{item.icon}</span>
                  <span>{item.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 2. Custom Precision Sliders (Clean 1-Liner Layouts) ── */}
        <div style={{ display: 'grid', gap: 12, marginBottom: 16 }}>
          {/* Slider 1: Headcount */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11.5, fontWeight: 700, marginBottom: 5 }}>
              <span style={{ color: isNightMode ? 'rgba(255,255,255,0.7)' : '#475569', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Users size={12} color="#10b981" /> Event Headcount
              </span>
              <span style={{ color: '#10b981', fontWeight: 900, fontFamily: 'var(--font-display)', background: 'rgba(16,185,129,0.12)', padding: '2px 7px', borderRadius: 6 }}>
                {headcount} Pax
              </span>
            </div>
            <input
              type="range"
              min={config.minHeadcount}
              max={config.maxHeadcount}
              step="5"
              value={headcount}
              onChange={(e) => setHeadcount(Number(e.target.value))}
              style={{
                width: '100%',
                accentColor: '#10b981',
                height: 5,
                borderRadius: 999,
                cursor: 'pointer',
                background: `linear-gradient(90deg, #10b981 ${headcountPct}%, rgba(255,255,255,0.12) ${headcountPct}%)`,
              }}
            />
          </div>

          {/* Slider 2: Annual Events */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11.5, fontWeight: 700, marginBottom: 5 }}>
              <span style={{ color: isNightMode ? 'rgba(255,255,255,0.7)' : '#475569', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Calendar size={12} color="#0ea5e9" /> Annual Frequency
              </span>
              <span style={{ color: '#0ea5e9', fontWeight: 900, fontFamily: 'var(--font-display)', background: 'rgba(14,165,233,0.12)', padding: '2px 7px', borderRadius: 6 }}>
                {eventsPerYear} Events / yr
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="16"
              step="1"
              value={eventsPerYear}
              onChange={(e) => setEventsPerYear(Number(e.target.value))}
              style={{
                width: '100%',
                accentColor: '#0ea5e9',
                height: 5,
                borderRadius: 999,
                cursor: 'pointer',
                background: `linear-gradient(90deg, #0ea5e9 ${eventsPct}%, rgba(255,255,255,0.12) ${eventsPct}%)`,
              }}
            />
          </div>

          {/* Slider 3: Target Budget */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11.5, fontWeight: 700, marginBottom: 5 }}>
              <span style={{ color: isNightMode ? 'rgba(255,255,255,0.7)' : '#475569', display: 'flex', alignItems: 'center', gap: 5 }}>
                <DollarSign size={12} color="#f97316" /> Target Budget / Person
              </span>
              <span style={{ color: '#f97316', fontWeight: 900, fontFamily: 'var(--font-display)', background: 'rgba(249,115,22,0.12)', padding: '2px 7px', borderRadius: 6 }}>
                {formatCurrency(costPerHead)}
              </span>
            </div>
            <input
              type="range"
              min={config.minCost}
              max={config.maxCost}
              step="250"
              value={costPerHead}
              onChange={(e) => setCostPerHead(Number(e.target.value))}
              style={{
                width: '100%',
                accentColor: '#f97316',
                height: 5,
                borderRadius: 999,
                cursor: 'pointer',
                background: `linear-gradient(90deg, #f97316 ${costPct}%, rgba(255,255,255,0.12) ${costPct}%)`,
              }}
            />
          </div>
        </div>

        {/* ── 3. Minimalist Real-Time Savings Display Card ── */}
        <div
          style={{
            borderRadius: 16,
            padding: '14px 16px',
            background: isNightMode
              ? 'linear-gradient(145deg, rgba(16,185,129,0.15) 0%, rgba(14,165,233,0.08) 100%)'
              : 'linear-gradient(145deg, rgba(16,185,129,0.1) 0%, rgba(14,165,233,0.05) 100%)',
            border: '1px solid rgba(16,185,129,0.3)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
            textAlign: 'center',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: isNightMode ? '#34d399' : '#059669', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              PROJECTED ANNUAL DIRECT SAVINGS
            </span>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#10b981', background: 'rgba(16,185,129,0.2)', padding: '2px 7px', borderRadius: 5 }}>
              ⚡ {savingsPercent}% Saved
            </span>
          </div>

          <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 900, color: isNightMode ? '#ffffff' : '#0f172a', letterSpacing: '-0.02em', margin: '3px 0' }}>
            {formatCurrency(annualSavings)}
          </div>

          {/* Slim Visual Comparison Bar */}
          <div style={{ marginTop: 8, paddingTop: 8, borderTop: isNightMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, marginBottom: 4 }}>
              <span style={{ color: '#f87171', fontWeight: 700 }}>Legacy Broker: {formatCurrency(legacyAgencySpend)}</span>
              <span style={{ color: '#10b981', fontWeight: 800 }}>COE Direct: {formatCurrency(coeDirectSpend)}</span>
            </div>
            <div style={{ height: 5, borderRadius: 999, background: 'rgba(255,255,255,0.1)', overflow: 'hidden', display: 'flex' }}>
              <div style={{ width: `${Math.round((coeDirectSpend / legacyAgencySpend) * 100)}%`, background: '#10b981', transition: 'width 0.2s ease' }} />
              <div style={{ width: `${Math.round((annualSavings / legacyAgencySpend) * 100)}%`, background: 'rgba(239,68,68,0.5)', transition: 'width 0.2s ease' }} />
            </div>
            {/* Say what the model assumes. A savings figure with an unstated
                assumption behind it is a claim, not an estimate. */}
            <p style={{ margin: '8px 0 0', fontSize: 10, lineHeight: 1.5, color: isNightMode ? 'rgba(255,255,255,0.42)' : '#94a3b8' }}>
              Estimate. Assumes a {Math.round(config.typicalBrokerMargin * 100)}% agency margin on this
              category and a 2% platform fee. Your actual saving depends on the bids you get.
            </p>
          </div>
        </div>

        {/* ── 4. Compact Action Button ── */}
        <a
          href="#contact"
          style={{
            marginTop: 12,
            width: '100%',
            padding: '11px',
            borderRadius: 11,
            border: 'none',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#ffffff',
            fontSize: 13,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            textDecoration: 'none',
            boxShadow: '0 4px 18px rgba(16,185,129,0.35)',
            transition: 'transform 0.15s ease',
          }}
        >
          <span>Lock Organization Rate</span>
          <ArrowRight size={14} />
        </a>
      </div>
    );
  }

  // ─── Full Analytics Section View (Below on Page) ───
  return (
    <div
      style={{
        borderRadius: 24,
        background: isNightMode
          ? 'linear-gradient(145deg, rgba(11,15,23,0.95) 0%, rgba(13,19,33,0.9) 100%)'
          : '#ffffff',
        border: isNightMode
          ? '1.5px solid rgba(16, 185, 129, 0.25)'
          : '1.5px solid rgba(0,0,0,0.08)',
        padding: '36px',
        boxShadow: isNightMode ? '0 24px 80px rgba(0,0,0,0.8)' : '0 16px 40px rgba(0,0,0,0.06)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 26 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 800, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
            <Sparkles size={13} /> LIVE ROI & SAVINGS SIMULATOR
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 900, color: isNightMode ? '#ffffff' : '#0f172a' }}>
            Interactive Corporate Procurement Calculator
          </h3>
        </div>

        <div style={{ display: 'flex', gap: 6, background: isNightMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', padding: 4, borderRadius: 12 }}>
          {(Object.keys(CATEGORY_CONFIGS) as EventCategoryKey[]).map((catKey) => {
            const item = CATEGORY_CONFIGS[catKey];
            const active = activeCategory === catKey;
            return (
              <button
                key={catKey}
                onClick={() => handleCategoryChange(catKey)}
                style={{
                  padding: '7px 12px',
                  borderRadius: 9,
                  border: active ? `1px solid ${item.color}55` : '1px solid transparent',
                  background: active ? `${item.color}22` : 'transparent',
                  color: active ? '#ffffff' : isNightMode ? 'rgba(255,255,255,0.6)' : '#64748b',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                <span>{item.icon}</span>
                <span>{item.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 28, alignItems: 'center' }}>
        <div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label style={{ fontSize: 12.5, fontWeight: 700, color: isNightMode ? 'rgba(255,255,255,0.8)' : '#334155' }}>
                Average Event Headcount (Pax)
              </label>
              <span style={{ fontSize: 15, fontWeight: 900, color: '#10b981', fontFamily: 'var(--font-display)' }}>
                {headcount} Guests
              </span>
            </div>
            <input
              type="range"
              min={config.minHeadcount}
              max={config.maxHeadcount}
              step="10"
              value={headcount}
              onChange={(e) => setHeadcount(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#10b981', cursor: 'pointer' }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label style={{ fontSize: 12.5, fontWeight: 700, color: isNightMode ? 'rgba(255,255,255,0.8)' : '#334155' }}>
                Annual Events in this Category
              </label>
              <span style={{ fontSize: 15, fontWeight: 900, color: '#0ea5e9', fontFamily: 'var(--font-display)' }}>
                {eventsPerYear} Events / Year
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              step="1"
              value={eventsPerYear}
              onChange={(e) => setEventsPerYear(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#0ea5e9', cursor: 'pointer' }}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label style={{ fontSize: 12.5, fontWeight: 700, color: isNightMode ? 'rgba(255,255,255,0.8)' : '#334155' }}>
                Target Budget per Person
              </label>
              <span style={{ fontSize: 15, fontWeight: 900, color: '#f97316', fontFamily: 'var(--font-display)' }}>
                {formatCurrency(costPerHead)}
              </span>
            </div>
            <input
              type="range"
              min={config.minCost}
              max={config.maxCost}
              step="250"
              value={costPerHead}
              onChange={(e) => setCostPerHead(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#f97316', cursor: 'pointer' }}
            />
          </div>
        </div>

        <div
          style={{
            borderRadius: 20,
            padding: '24px',
            background: isNightMode ? 'linear-gradient(145deg, rgba(16,185,129,0.18) 0%, rgba(14,165,233,0.08) 100%)' : 'rgba(16,185,129,0.06)',
            border: '1.5px solid rgba(16,185,129,0.35)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 800, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
            Projected Annual Direct Savings
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 900, color: isNightMode ? '#ffffff' : '#0f172a', lineHeight: 1 }}>
            {formatCurrency(annualSavings)}
          </div>
          <div style={{ fontSize: 13, color: '#10b981', fontWeight: 800, marginTop: 4 }}>
            💸 {savingsPercent}% Net Cost Compression
          </div>

          <div style={{ margin: '18px 0', padding: '14px 0', borderTop: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, marginBottom: 8 }}>
              <span style={{ color: '#f87171', fontWeight: 700 }}>Legacy Broker: {formatCurrency(legacyAgencySpend)}</span>
              <span style={{ color: '#10b981', fontWeight: 700 }}>COE Direct: {formatCurrency(coeDirectSpend)}</span>
            </div>
            <div style={{ height: 8, borderRadius: 999, background: 'rgba(255,255,255,0.1)', overflow: 'hidden', display: 'flex' }}>
              <div style={{ width: `${Math.round((coeDirectSpend / legacyAgencySpend) * 100)}%`, background: '#10b981' }} />
              <div style={{ width: `${Math.round((annualSavings / legacyAgencySpend) * 100)}%`, background: 'rgba(239,68,68,0.6)' }} />
            </div>
            <p style={{ margin: '10px 0 0', fontSize: 10.5, lineHeight: 1.55, color: isNightMode ? 'rgba(255,255,255,0.42)' : '#94a3b8' }}>
              Estimate. Assumes a {Math.round(config.typicalBrokerMargin * 100)}% agency margin on this
              category and a 2% platform fee. Your actual saving depends on the bids you get.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 12, color: isNightMode ? 'rgba(255,255,255,0.8)' : '#64748b', marginBottom: 18 }}>
            <Clock size={14} color="#0ea5e9" />
            <span>Saves roughly <strong style={{ color: isNightMode ? '#ffffff' : '#0f172a' }}>{hoursSaved} hours</strong> of chasing quotes (about half a day per event)</span>
          </div>

          <a
            href="#contact"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 11,
              border: 'none',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              fontSize: 13,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              textDecoration: 'none',
            }}
          >
            <span>Lock Organization Rate</span>
            <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}
