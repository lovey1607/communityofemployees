'use client';
// ============================================================
// app/corporate/onboarding/page.tsx — Corporate Profile Registration
// First-time onboarding wizard for enterprise procurement users.
// Captures personal info, company entity, CIN, spend bracket,
// and submits for Super Admin verification.
// ============================================================

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { BlurredCyberHubBackground } from '@/components/canvas/BlurredCyberHubBackground';
import {
  Building2, User, Phone, MapPin, Briefcase, ChevronRight,
  ArrowRight, ShieldCheck, Clock, CheckCircle2, Sparkles,
} from 'lucide-react';

const DEPARTMENTS = [
  'People Operations', 'Human Resources', 'Finance & Accounts',
  'Marketing & Brand', 'Corporate Affairs', 'Administration', 'Operations', 'IT & Infrastructure',
];

const POSITIONS = [
  'VP / Director', 'Senior Manager', 'Manager', 'Team Lead',
  'HR Business Partner', 'Corporate Officer', 'Executive Assistant', 'Analyst',
];

const CITIES = [
  'Gurugram', 'Noida', 'New Delhi', 'Bangalore', 'Mumbai', 'Hyderabad', 'Chennai', 'Pune',
];

const TEAM_SIZES = [
  '50-200 Employees', '200-500 Employees', '500-2000 Employees', '2000-5000 Employees', '5000+ Employees',
];

const BUDGET_BRACKETS = [
  '₹25 Lakh - ₹50 Lakh', '₹50 Lakh - ₹1 Cr', '₹1 Cr - ₹3 Cr', '₹3 Cr - ₹10 Cr', '₹10 Cr+',
];

const GURUGRAM_CORPORATE_HUBS = [
  'DLF Cyber City & Cyber Hub (Building 5/8/10/14)',
  'Golf Course Road (Two Horizon / One Horizon)',
  'Golf Course Extension Road (AIPL / WorldMark)',
  'Udyog Vihar (Phases I - V)',
  'Sohna Road (Vatika / Spaze / JMD)',
  'Sector 44 Institutional Area',
  'MG Road & Time Tower',
  'Sector 32 Institutional Area',
  'Manesar Cyber Park',
  'Other Gurugram Business District',
];

export default function CorporateOnboardingPage() {
  const router = useRouter();
  const { saveCorporateProfile, currentUser, isNightMode } = useStore();

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [officeCompanyName, setOfficeCompanyName] = useState('');
  const [corporateHub, setCorporateHub] = useState(GURUGRAM_CORPORATE_HUBS[0]);
  const [cinNumber, setCinNumber] = useState('');
  const [officeAddress, setOfficeAddress] = useState('');
  const [city, setCity] = useState('Gurugram');
  const [position, setPosition] = useState('');
  const [department, setDepartment] = useState('');
  const [teamSize, setTeamSize] = useState('500-2000 Employees');
  const [budget, setBudget] = useState('₹1 Cr - ₹3 Cr');
  const [loading, setLoading] = useState(false);

  const isMobileValid = /^[6-9]\d{9}$/.test(mobile);
  const canStep1 = Boolean(name.trim() && isMobileValid);
  const canStep2 = Boolean(officeCompanyName.trim() && officeAddress.trim() && city);
  const canStep3 = Boolean(position && department);

  const handleFinish = () => {
    if (!canStep3) return;
    setLoading(true);
    setTimeout(() => {
      saveCorporateProfile({
        name: name.trim(),
        mobile: `+91 ${mobile.trim()}`,
        officeCompanyName: officeCompanyName.trim(),
        officeAddress: officeAddress.trim(),
        city,
        position,
        department,
        cinNumber: cinNumber.trim().toUpperCase(),
        teamSize,
        annualProcurementBudget: budget,
      });
      setLoading(false);
      setStep(4); // Success & Verification Screen
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
        {step <= 3 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28, justifyContent: 'center' }}>
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: s <= step ? '#10b981' : 'rgba(255,255,255,0.1)',
                    border: s === step ? '2px solid #10b981' : '2px solid transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                    fontWeight: 800,
                    color: s <= step ? '#ffffff' : 'rgba(255,255,255,0.4)',
                    transition: 'all 0.3s ease',
                    boxShadow: s === step ? '0 0 16px rgba(16,185,129,0.4)' : 'none',
                  }}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div
                    style={{
                      height: 2,
                      width: 48,
                      background: s < step ? '#10b981' : 'rgba(255,255,255,0.1)',
                      borderRadius: 2,
                      transition: 'background 0.3s ease',
                    }}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Card */}
        <div
          style={{
            borderRadius: 24,
            overflow: 'hidden',
            background: '#0B0F17',
            border: '1.5px solid rgba(16, 185, 129, 0.25)',
            boxShadow: '0 40px 100px rgba(0,0,0,0.85)',
          }}
        >
          {/* Header */}
          {step <= 3 ? (
            <div
              style={{
                padding: '28px 28px 20px',
                background: 'linear-gradient(145deg, rgba(16,185,129,0.12) 0%, transparent 60%)',
                borderBottom: '1px solid rgba(16,185,129,0.15)',
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  background: 'rgba(16,185,129,0.18)',
                  border: '1px solid rgba(16,185,129,0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#10b981',
                  marginBottom: 12,
                  boxShadow: '0 6px 20px rgba(16,185,129,0.2)',
                }}
              >
                {step === 1 ? <User size={22} /> : step === 2 ? <Building2 size={22} /> : <Briefcase size={22} />}
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
                {step === 1 && 'Authorized Representative Details'}
                {step === 2 && 'Company Entity & Workplace Location'}
                {step === 3 && 'Procurement Role & Sourcing Capacity'}
              </h1>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                Step {step} of 3 — Enterprise Procurement Registration
              </p>
            </div>
          ) : (
            <div
              style={{
                padding: '36px 28px 24px',
                textAlign: 'center',
                background: 'linear-gradient(145deg, rgba(234,179,8,0.15) 0%, transparent 70%)',
                borderBottom: '1px solid rgba(234,179,8,0.2)',
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 18,
                  background: 'rgba(234,179,8,0.18)',
                  border: '1.5px solid rgba(234,179,8,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#eab308',
                  margin: '0 auto 16px',
                  boxShadow: '0 8px 24px rgba(234,179,8,0.25)',
                }}
              >
                <Clock size={28} />
              </div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: '#ffffff', marginBottom: 6 }}>
                Registration Submitted!
              </h1>
              <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.65)', maxWidth: 420, margin: '0 auto' }}>
                Your corporate account has been registered and is now queued for Super Admin review.
              </p>
            </div>
          )}

          {/* Form Body */}
          <div style={{ padding: '24px 28px 28px' }}>
            {/* Step 1: Personal */}
            {step === 1 && (
              <div style={{ display: 'grid', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Full Name *</label>
                  <input
                    className="input-base"
                    placeholder="e.g. Priya Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                  />
                </div>
                <div>
                  <label style={labelStyle}>Official Work Email (Locked)</label>
                  <input
                    className="input-base"
                    type="email"
                    disabled
                    value={currentUser?.email || ''}
                    style={{ opacity: 0.6, cursor: 'not-allowed', background: 'rgba(255,255,255,0.03)' }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Contact Mobile Number (10 Digits) *</label>
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
                      placeholder="9811234567"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    />
                  </div>
                  <div style={{ fontSize: 11, color: isMobileValid ? '#10b981' : 'rgba(255,255,255,0.4)', marginTop: 4, fontWeight: 600 }}>
                    {isMobileValid ? '✅ Valid 10-digit Indian mobile number' : `${mobile.length}/10 digits (Must start with 6, 7, 8, or 9)`}
                  </div>
                </div>
                <button
                  disabled={!canStep1}
                  onClick={() => setStep(2)}
                  className="btn-primary"
                  style={{ marginTop: 8, padding: '12px', opacity: canStep1 ? 1 : 0.4 }}
                >
                  Continue to Company Info <ChevronRight size={15} />
                </button>
              </div>
            )}

            {/* Step 2: Company */}
            {step === 2 && (
              <div style={{ display: 'grid', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Company / Organisation Name *</label>
                  <input
                    className="input-base"
                    placeholder="e.g. Nexus Technologies India Pvt Ltd"
                    value={officeCompanyName}
                    onChange={(e) => setOfficeCompanyName(e.target.value)}
                    autoFocus
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Gurugram Business District / Hub *</label>
                    <select
                      className="input-base"
                      value={corporateHub}
                      onChange={(e) => setCorporateHub(e.target.value)}
                    >
                      {GURUGRAM_CORPORATE_HUBS.map((hub) => (
                        <option key={hub} value={hub}>{hub}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>City</label>
                    <select
                      className="input-base"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    >
                      {CITIES.map((c) => (<option key={c} value={c}>{c}</option>))}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Office Building & Address *</label>
                  <textarea
                    className="input-base"
                    rows={2}
                    placeholder="e.g. Building 10B, 6th Floor, DLF Cyber City, Phase II, Gurugram, Haryana 122002"
                    value={officeAddress}
                    onChange={(e) => setOfficeAddress(e.target.value)}
                  />
                </div>

                <div>
                  <label style={labelStyle}>CIN / Corporate Registration No. (Optional)</label>
                  <input
                    className="input-base"
                    placeholder="e.g. U72900HR2018PTC075432"
                    value={cinNumber}
                    onChange={(e) => setCinNumber(e.target.value.toUpperCase())}
                  />
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setStep(1)} className="btn-ghost" style={{ flex: 1 }}>Back</button>
                  <button
                    disabled={!canStep2}
                    onClick={() => setStep(3)}
                    className="btn-primary"
                    style={{ flex: 2, opacity: canStep2 ? 1 : 0.4 }}
                  >
                    Continue to Role <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Role */}
            {step === 3 && (
              <div style={{ display: 'grid', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Position / Designation</label>
                    <select
                      className="input-base"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      autoFocus
                    >
                      <option value="">Select position...</option>
                      {POSITIONS.map((p) => (<option key={p} value={p}>{p}</option>))}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Department</label>
                    <select
                      className="input-base"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                    >
                      <option value="">Select department...</option>
                      {DEPARTMENTS.map((d) => (<option key={d} value={d}>{d}</option>))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Team Size</label>
                    <select
                      className="input-base"
                      value={teamSize}
                      onChange={(e) => setTeamSize(e.target.value)}
                    >
                      {TEAM_SIZES.map((t) => (<option key={t} value={t}>{t}</option>))}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Estimated Annual Sourcing Spend</label>
                    <select
                      className="input-base"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                    >
                      {BUDGET_BRACKETS.map((b) => (<option key={b} value={b}>{b}</option>))}
                    </select>
                  </div>
                </div>

                <div style={{ padding: '12px 14px', borderRadius: 12, background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)', fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 1.4 }}>
                  ℹ️ Post-submission, your company profile will be reviewed by COE Admin before full Verified Corporate status is unlocked.
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button onClick={() => setStep(2)} className="btn-ghost" style={{ flex: 1 }}>Back</button>
                  <button
                    disabled={!canStep3 || loading}
                    onClick={handleFinish}
                    className="btn-primary"
                    style={{
                      flex: 2,
                      opacity: canStep3 && !loading ? 1 : 0.4,
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      boxShadow: '0 8px 24px rgba(16,185,129,0.3)',
                    }}
                  >
                    {loading ? 'Submitting Application…' : 'Submit for Admin Verification'}
                    {!loading && <ArrowRight size={15} />}
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Verification Submitted Confirmation */}
            {step === 4 && (
              <div style={{ display: 'grid', gap: 16 }}>
                <div style={{ padding: '16px', borderRadius: 16, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: 8 }}>
                    Summary of Submitted Application
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#ffffff', marginBottom: 2 }}>{officeCompanyName}</div>
                  <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.65)' }}>{name} · {position} ({department})</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>📍 {officeAddress}</div>
                  <div style={{ fontSize: 12, color: '#eab308', marginTop: 6, fontWeight: 700 }}>
                    Status: ⏳ Pending Verification by Super Admin
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={() => router.push('/corporate/profile')}
                    className="btn-ghost"
                    style={{ flex: 1, padding: '12px', fontSize: 13 }}
                  >
                    View My Profile
                  </button>
                  <button
                    onClick={() => router.push('/corporate/dashboard')}
                    className="btn-primary"
                    style={{ flex: 1, padding: '12px', fontSize: 13 }}
                  >
                    Go to Dashboard <ArrowRight size={14} />
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
