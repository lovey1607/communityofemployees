'use client';
// ============================================================
// app/vendor/onboarding/page.tsx — Vendor Partner Registration
// First-time onboarding wizard for suppliers and service partners.
// Captures category, legal entity, GSTIN, PAN, facility address,
// past corporate clients, and submits for Super Admin verification.
// ============================================================

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { BlurredCyberHubBackground } from '@/components/canvas/BlurredCyberHubBackground';
import { CategoryType } from '@/lib/types';
import {
  Store, ChevronRight, ArrowRight, X, Plus, ShieldCheck,
  Clock, FileText, CheckCircle2, Lock,
} from 'lucide-react';

const CATEGORIES: { id: CategoryType; label: string; icon: string; desc: string }[] = [
  { id: 'sports', label: 'Sports & Tournaments', icon: '🏆', desc: 'Turf booking, jerseys, referees, trophies' },
  { id: 'food', label: 'Food & Party', icon: '🥂', desc: 'Buffet catering, bar setups, box meals, DJs' },
  { id: 'trips', label: 'Trips & Offsites', icon: '✈️', desc: 'Resorts, corporate bus fleets, team building' },
  { id: 'gifts', label: 'Gifts & Rewards', icon: '🎁', desc: 'Diwali hampers, onboarding kits, vouchers' },
  { id: 'dress', label: 'Dress & Merchandise', icon: '👔', desc: 'Embroidered hoodies, polos, custom swag' },
];

const ENTITY_TYPES = ['Pvt Ltd', 'LLP', 'Partnership', 'Proprietorship'] as const;
const CITIES = ['Gurugram', 'Noida', 'New Delhi', 'Bangalore', 'Mumbai', 'Hyderabad', 'Chennai', 'Pune'];

const GURUGRAM_LOCALITIES = [
  'Sector 29 Market & Leisure Valley',
  'DLF Cyber City & Cyber Hub',
  'Golf Course Road (Horizon Center / Sector 43 / 54)',
  'Golf Course Extension Road (Sector 58 / 62 / 63)',
  'Sohna Road & Sector 48 / 49',
  'Sector 38 (Near Medanta & Tau Devi Lal)',
  'Sector 31 & Star Mall',
  'MG Road & Heritage City',
  'Sector 70 & 72 (Southern Peripheral Rd)',
  'Sector 56 & 57 (Hong Kong Bazaar)',
  'Sector 14 & Old Gurgaon',
  'Udyog Vihar (Phases I - V)',
  'South City I & II',
  'DLF Phase 1 / 2 / 3 / 4 / 5',
  'Other Gurugram Area',
];

export default function VendorOnboardingPage() {
  const router = useRouter();
  const { saveVendorProfile, currentUser, isNightMode } = useStore();

  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<CategoryType | ''>('');
  const [vendorName, setVendorName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [entityType, setEntityType] = useState<'Pvt Ltd' | 'LLP' | 'Partnership' | 'Proprietorship'>('Pvt Ltd');
  const [mobile, setMobile] = useState('');
  const [companyMobile, setCompanyMobile] = useState('');
  const [locality, setLocality] = useState(GURUGRAM_LOCALITIES[0]);
  const [address, setAddress] = useState('');
  const [timings, setTimings] = useState('6:00 AM - 11:00 PM');
  const [avgCostPerPerson, setAvgCostPerPerson] = useState(850);
  const [city, setCity] = useState('Gurugram');
  const [gstNumber, setGstNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [portfolioSummary, setPortfolioSummary] = useState('');
  const [pastClients, setPastClients] = useState<string[]>([]);
  const [newClient, setNewClient] = useState('');
  const [loading, setLoading] = useState(false);

  // 10-digit Indian mobile validation
  const isMobileValid = /^[6-9]\d{9}$/.test(mobile);
  const canStep1 = Boolean(category && vendorName.trim() && isMobileValid);
  const canStep2 = Boolean(companyName.trim() && address.trim());
  const canStep3 = gstNumber.trim().length === 15;

  const addClient = () => {
    if (newClient.trim() && !pastClients.includes(newClient.trim())) {
      setPastClients([...pastClients, newClient.trim()]);
      setNewClient('');
    }
  };

  const handleFinish = () => {
    if (!canStep3 || !category) return;
    setLoading(true);
    setTimeout(() => {
      saveVendorProfile({
        category: category as CategoryType,
        vendorName: vendorName.trim(),
        companyName: companyName.trim(),
        mobile: `+91 ${mobile.trim()}`,
        companyMobile: companyMobile.trim() ? `+91 ${companyMobile.trim()}` : `+91 ${mobile.trim()}`,
        address: address.trim(),
        locality,
        city,
        timings,
        avgCostPerPerson: Number(avgCostPerPerson) || 850,
        distanceKm: Math.round((Math.random() * 8 + 1) * 10) / 10,
        gstNumber: gstNumber.trim().toUpperCase(),
        panNumber: panNumber.trim().toUpperCase() || undefined,
        entityType,
        portfolioSummary: portfolioSummary.trim() || undefined,
        pastClients,
      });
      setLoading(false);
      setStep(4); // Success & KYC Notice screen
    }, 600);
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 11,
    fontWeight: 700,
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: 6,
  };

  const catColor = '#f97316';

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
        background: '#05060e',
      }}
    >
      <BlurredCyberHubBackground />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 540 }}
      >
        {/* Progress Stepper */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28, justifyContent: 'center' }}>
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: s <= step ? catColor : 'rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  fontWeight: 800,
                  color: s <= step ? '#ffffff' : 'rgba(255,255,255,0.4)',
                  boxShadow: s === step ? `0 0 16px ${catColor}55` : 'none',
                  transition: 'all 0.3s ease',
                }}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  style={{
                    height: 2,
                    width: 48,
                    background: s < step ? catColor : 'rgba(255,255,255,0.1)',
                    borderRadius: 2,
                    transition: 'background 0.3s ease',
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        <div
          style={{
            borderRadius: 24,
            overflow: 'hidden',
            background: '#0B0F17',
            border: `1.5px solid ${catColor}28`,
            boxShadow: '0 40px 100px rgba(0,0,0,0.85)',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '28px 28px 20px',
              background: `linear-gradient(145deg, ${catColor}12 0%, transparent 60%)`,
              borderBottom: `1px solid ${catColor}18`,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: `${catColor}20`,
                border: `1px solid ${catColor}40`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: catColor,
                marginBottom: 12,
                boxShadow: `0 6px 20px ${catColor}20`,
              }}
            >
              <Store size={22} />
            </div>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 22,
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '-0.02em',
                marginBottom: 4,
              }}
            >
              {step === 1 && '1. Business Category & Contact'}
              {step === 2 && '2. Venue & Facility Details'}
              {step === 3 && '3. Legal GST & Corporate KYC'}
              {step === 4 && 'KYC Application Complete'}
            </h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
              {step <= 3 ? `Step ${step} of 3 — Verified Gurugram Vendor Registration` : 'Profile Created Successfully'}
            </p>
          </div>

          <div style={{ padding: '24px 28px 28px' }}>
            {/* Step 1: Category & Contact */}
            {step === 1 && (
              <div style={{ display: 'grid', gap: 14 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label style={{ ...labelStyle, marginBottom: 0 }}>Service Category (Strictly 1 Category) *</label>
                    <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 999, background: `${catColor}20`, color: catColor, fontWeight: 800 }}>
                      Single Category Focus
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        style={{
                          padding: '10px 14px',
                          borderRadius: 12,
                          border: category === cat.id ? `1.5px solid ${catColor}` : '1px solid rgba(255,255,255,0.12)',
                          background: category === cat.id ? `${catColor}20` : 'rgba(255,255,255,0.04)',
                          color: category === cat.id ? '#ffffff' : 'rgba(255,255,255,0.7)',
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: 'pointer',
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontFamily: 'var(--font-body)',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 18 }}>{cat.icon}</span>
                          <div>
                            <div>{cat.label}</div>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>{cat.desc}</div>
                          </div>
                        </div>
                        {category === cat.id && <CheckCircle2 size={16} color={catColor} />}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Primary Contact Person *</label>
                    <input className="input-base" placeholder="e.g. Vikram Singh" value={vendorName} onChange={(e) => setVendorName(e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>Entity Type</label>
                    <select className="input-base" value={entityType} onChange={(e) => setEntityType(e.target.value as any)}>
                      {ENTITY_TYPES.map((t) => (<option key={t} value={t}>{t}</option>))}
                    </select>
                  </div>
                </div>

                {/* 10-Digit Mobile Input with +91 badge */}
                <div>
                  <label style={labelStyle}>Primary Mobile Number (10 Digits) *</label>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span
                      style={{
                        padding: '11px 14px',
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRight: 'none',
                        borderTopLeftRadius: 10,
                        borderBottomLeftRadius: 10,
                        color: 'rgba(255,255,255,0.8)',
                        fontSize: 13,
                        fontWeight: 800,
                      }}
                    >
                      +91
                    </span>
                    <input
                      className="input-base"
                      style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                      type="tel"
                      maxLength={10}
                      placeholder="9871100000"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    />
                  </div>
                  <div style={{ fontSize: 11, color: isMobileValid ? '#10b981' : 'rgba(255,255,255,0.4)', marginTop: 4, fontWeight: 600 }}>
                    {isMobileValid ? '✅ Valid 10-digit Indian mobile number' : `${mobile.length}/10 digits (Must start with 6, 7, 8, or 9)`}
                  </div>
                </div>

                <button disabled={!canStep1} onClick={() => setStep(2)} className="btn-primary" style={{ marginTop: 8, opacity: canStep1 ? 1 : 0.4, background: catColor }}>
                  Continue to Venue & Location <ChevronRight size={15} />
                </button>
              </div>
            )}

            {/* Step 2: Venue & Facility Details */}
            {step === 2 && (
              <div style={{ display: 'grid', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Official Business / Venue Name *</label>
                  <input
                    className="input-base"
                    placeholder="e.g. Royal Arena Sports Complex / Sky High Lounge"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    autoFocus
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Gurugram Locality / Area *</label>
                    <select
                      className="input-base"
                      value={locality}
                      onChange={(e) => setLocality(e.target.value)}
                    >
                      {GURUGRAM_LOCALITIES.map((loc) => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>City</label>
                    <select className="input-base" value={city} onChange={(e) => setCity(e.target.value)}>
                      {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Full Facility / Venue Address *</label>
                  <textarea
                    className="input-base"
                    rows={2}
                    placeholder="e.g. SCO 45, Main Market, Sector 29, Gurugram, Haryana 122001"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Operating Timings</label>
                    <input
                      className="input-base"
                      placeholder="e.g. 6:00 AM - 12:00 AM"
                      value={timings}
                      onChange={(e) => setTimings(e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Avg Cost / Person (₹)</label>
                    <input
                      className="input-base"
                      type="number"
                      placeholder="850"
                      value={avgCostPerPerson}
                      onChange={(e) => setAvgCostPerPerson(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Company Landline / Support (Optional)</label>
                  <input
                    className="input-base"
                    type="tel"
                    placeholder="0124 4567890"
                    value={companyMobile}
                    onChange={(e) => setCompanyMobile(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setStep(1)} className="btn-ghost" style={{ flex: 1 }}>Back</button>
                  <button disabled={!canStep2} onClick={() => setStep(3)} className="btn-primary" style={{ flex: 2, opacity: canStep2 ? 1 : 0.4, background: catColor }}>
                    Continue to Legal KYC <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div style={{ display: 'grid', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>GSTIN Number (15 Characters)</label>
                    <input className="input-base" placeholder="07AAAAA0000A1Z5" maxLength={15} value={gstNumber} onChange={(e) => setGstNumber(e.target.value.toUpperCase())} />
                    <div style={{ fontSize: 11, color: gstNumber.length === 15 ? '#10b981' : 'rgba(255,255,255,0.35)', marginTop: 4, fontWeight: 600 }}>
                      {gstNumber.length}/15 — {gstNumber.length === 15 ? '✅ Valid length' : 'Must be exactly 15 characters'}
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>PAN Number (Optional)</label>
                    <input className="input-base" placeholder="AAACR1234F" maxLength={10} value={panNumber} onChange={(e) => setPanNumber(e.target.value.toUpperCase())} />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Services & Portfolio Summary</label>
                  <textarea className="input-base" rows={2} placeholder="Brief summary of offerings, catering menus, fleet size, or merchandise..." value={portfolioSummary} onChange={(e) => setPortfolioSummary(e.target.value)} />
                </div>

                <div>
                  <label style={labelStyle}>Past Corporate Clients</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input className="input-base" placeholder="e.g. Google India, Microsoft" value={newClient} onChange={(e) => setNewClient(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addClient(); } }} />
                    <button type="button" onClick={addClient} className="btn-ghost" style={{ padding: '0 14px', flexShrink: 0 }}><Plus size={14} /></button>
                  </div>
                  {pastClients.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                      {pastClients.map((c) => (
                        <span key={c} style={{ padding: '3px 8px', borderRadius: 999, background: `${catColor}18`, border: `1px solid ${catColor}30`, color: '#ffffff', fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                          {c}
                          <button type="button" onClick={() => setPastClients(pastClients.filter((x) => x !== c))} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: 0 }}><X size={10} /></button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Disclaimer */}
                <div style={{ padding: '12px 14px', borderRadius: 12, background: `${catColor}08`, border: `1px solid ${catColor}20`, fontSize: 12, color: 'rgba(255,255,255,0.65)' }}>
                  ⚠️ Your GSTIN will be verified by the COE Admin team. Live bidding is enabled only after Super Admin approval.
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setStep(2)} className="btn-ghost" style={{ flex: 1 }}>Back</button>
                  <button
                    disabled={!canStep3 || loading}
                    onClick={handleFinish}
                    className="btn-primary"
                    style={{ flex: 2, opacity: canStep3 && !loading ? 1 : 0.4, background: `linear-gradient(135deg, ${catColor} 0%, #ea580c 100%)`, boxShadow: `0 8px 24px ${catColor}30` }}
                  >
                    {loading ? 'Submitting for KYC…' : 'Submit for Admin Verification'} {!loading && <ArrowRight size={15} />}
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Submission Confirmation */}
            {step === 4 && (
              <div style={{ display: 'grid', gap: 16 }}>
                <div style={{ padding: '16px', borderRadius: 16, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: 8 }}>
                    Summary of Submitted Vendor Details
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#ffffff', marginBottom: 2 }}>{companyName}</div>
                  <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.65)' }}>{vendorName} · GSTIN: {gstNumber}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>📍 {address}</div>
                  <div style={{ fontSize: 12, color: '#eab308', marginTop: 6, fontWeight: 700 }}>
                    Status: ⏳ Pending KYC Verification by Super Admin
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={() => router.push('/vendor/profile')}
                    className="btn-ghost"
                    style={{ flex: 1, padding: '12px', fontSize: 13 }}
                  >
                    View Vendor Profile
                  </button>
                  <button
                    onClick={() => router.push('/vendor/dashboard')}
                    className="btn-primary"
                    style={{ flex: 1, padding: '12px', fontSize: 13, background: `linear-gradient(135deg, ${catColor} 0%, #ea580c 100%)` }}
                  >
                    Explore Dashboard <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 14, fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>
          Logged in as: {currentUser?.email}
        </p>
      </motion.div>
    </main>
  );
}
