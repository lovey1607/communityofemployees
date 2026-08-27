'use client';
// ============================================================
// app/corporate/profile/page.tsx — Dedicated Corporate Profile Hub
// Displays verified credentials, CIN, office location, procurement
// role, application verification tracking timeline, and edit modal.
// ============================================================

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { CorporateProfile } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { BlurredCyberHubBackground } from '@/components/canvas/BlurredCyberHubBackground';
import {
  Building2, User, Phone, Mail, MapPin, Briefcase,
  ShieldCheck, Clock, AlertTriangle, CheckCircle,
  Edit2, Trash2, ArrowLeft, Plus, X, Save,
  ExternalLink, Calendar, Users, DollarSign, Award,
} from 'lucide-react';

const DEPARTMENTS = [
  'People Operations', 'Human Resources', 'Finance & Accounts',
  'Marketing & Brand', 'Corporate Affairs', 'Administration', 'Operations', 'IT & Infrastructure',
];

const POSITIONS = [
  'VP / Director', 'Senior Manager', 'Manager', 'Team Lead',
  'HR Business Partner', 'Corporate Officer', 'Executive Assistant', 'Analyst',
];

const BUDGET_BRACKETS = [
  '₹25 Lakh - ₹50 Lakh', '₹50 Lakh - ₹1 Cr', '₹1 Cr - ₹3 Cr', '₹3 Cr - ₹10 Cr', '₹10 Cr+',
];

const TEAM_SIZES = [
  '50-200 Employees', '200-500 Employees', '500-2000 Employees', '2000-5000 Employees', '5000+ Employees',
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

// ─── Edit Modal ──────────────────────────────────────────────
function EditCorporateModal({
  profile,
  onClose,
}: {
  profile: CorporateProfile;
  onClose: () => void;
}) {
  const { updateCorporateProfile, deleteAccount, isNightMode } = useStore();
  const router = useRouter();

  const [name, setName] = useState(profile.name);
  const [mobile, setMobile] = useState(profile.mobile ? profile.mobile.replace(/\+91\s*/g, '') : '');
  const [officeCompanyName, setOfficeCompanyName] = useState(profile.officeCompanyName);
  const [officeAddress, setOfficeAddress] = useState(profile.officeAddress);
  const [position, setPosition] = useState(profile.position);
  const [department, setDepartment] = useState(profile.department);
  const [cinNumber, setCinNumber] = useState(profile.cinNumber || '');
  const [teamSize, setTeamSize] = useState(profile.teamSize || '500-2000 Employees');
  const [budget, setBudget] = useState(profile.annualProcurementBudget || '₹1 Cr - ₹3 Cr');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isMobileValid = /^[6-9]\d{9}$/.test(mobile);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMobileValid) {
      alert('Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9');
      return;
    }
    updateCorporateProfile({
      name: name.trim(),
      mobile: `+91 ${mobile.trim()}`,
      officeCompanyName: officeCompanyName.trim(),
      officeAddress: officeAddress.trim(),
      position,
      department,
      cinNumber: cinNumber.trim().toUpperCase(),
      teamSize,
      annualProcurementBudget: budget,
    });
    onClose();
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
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: 'rgba(5,8,20,0.8)',
        backdropFilter: 'blur(12px)',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.93, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.93, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 560,
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: 24,
          background: '#0B0F17',
          border: '1.5px solid rgba(16,185,129,0.3)',
          padding: '28px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.9)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
              <Edit2 size={18} />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: '#ffffff' }}>Edit Corporate Profile</h2>
              <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.5)' }}>Update your organizational credentials & preferences</div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#ffffff',
            }}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Full Name *</label>
              <input className="input-base" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Mobile Number (10 Digits) *</label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{
                  padding: '9px 12px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRight: 'none',
                  borderTopLeftRadius: 10,
                  borderBottomLeftRadius: 10,
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: 12.5,
                  fontWeight: 800,
                }}>+91</span>
                <input
                  className="input-base"
                  style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                  type="tel"
                  maxLength={10}
                  required
                  placeholder="9811234567"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                />
              </div>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Company / Organization *</label>
            <input className="input-base" required value={officeCompanyName} onChange={(e) => setOfficeCompanyName(e.target.value)} />
          </div>

          <div>
            <label style={labelStyle}>Office Building & Address *</label>
            <textarea
              className="input-base"
              rows={2}
              required
              placeholder="Building 10B, DLF Cyber City, Phase II, Gurugram"
              value={officeAddress}
              onChange={(e) => setOfficeAddress(e.target.value)}
            />
          </div>

          <div>
            <label style={labelStyle}>CIN / Corporate Registration No. (Optional)</label>
            <input className="input-base" placeholder="U72900HR2018PTC075432" value={cinNumber} onChange={(e) => setCinNumber(e.target.value.toUpperCase())} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Position / Designation</label>
              <select className="input-base" value={position} onChange={(e) => setPosition(e.target.value)}>
                {POSITIONS.map((p) => (<option key={p} value={p}>{p}</option>))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Department</label>
              <select className="input-base" value={department} onChange={(e) => setDepartment(e.target.value)}>
                {DEPARTMENTS.map((d) => (<option key={d} value={d}>{d}</option>))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Team Size</label>
              <select className="input-base" value={teamSize} onChange={(e) => setTeamSize(e.target.value)}>
                {TEAM_SIZES.map((t) => (<option key={t} value={t}>{t}</option>))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Annual Spend Bracket</label>
              <select className="input-base" value={budget} onChange={(e) => setBudget(e.target.value)}>
                {BUDGET_BRACKETS.map((b) => (<option key={b} value={b}>{b}</option>))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="button" onClick={onClose} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Save size={14} /> Save Profile Changes
            </button>
          </div>
        </form>

        {/* Danger Zone */}
        <div style={{ borderTop: '1px solid rgba(239,68,68,0.2)', paddingTop: 16, marginTop: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>⚠️ Danger Zone</div>
          {showDeleteConfirm ? (
            <div style={{ padding: '14px', borderRadius: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 12, lineHeight: 1.5 }}>
                This will permanently delete your corporate account, company profile, and all active RFPs. This cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setShowDeleteConfirm(false)} style={{ flex: 1, padding: '8px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)', color: '#ffffff', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Cancel</button>
                <button onClick={() => { deleteAccount(); router.push('/'); }} style={{ flex: 2, padding: '8px', borderRadius: 10, border: 'none', background: '#ef4444', color: '#ffffff', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Yes, Delete Account</button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              style={{ width: '100%', padding: '10px', borderRadius: 12, border: '1.5px solid rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.08)', color: '#ef4444', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'var(--font-body)' }}
            >
              <Trash2 size={14} /> Delete Corporate Account & RFPs
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────
export default function CorporateProfilePage() {
  const { currentCorporateProfile, currentUser, rfpList, isNightMode } = useStore();
  const [showEdit, setShowEdit] = useState(false);

  const profile = currentCorporateProfile;
  const isApproved = profile?.status === 'approved';
  const isPending = profile?.status === 'pending' || !profile?.status;
  const isRejected = profile?.status === 'rejected';

  const myRFPs = rfpList.filter((r) => r.corporateUserId === currentUser?.id || r.corporateId === profile?.id);

  return (
    <main style={{ minHeight: '100vh', paddingTop: 96, paddingBottom: 60, position: 'relative', background: '#0B0F17' }}>
      <BlurredCyberHubBackground />

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 10 }}>

        {/* Back Link */}
        <div style={{ marginBottom: 18 }}>
          <Link
            href="/corporate/dashboard"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              fontWeight: 700,
              color: 'rgba(255,255,255,0.65)',
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}
          >
            <ArrowLeft size={14} /> Back to Procurement Dashboard
          </Link>
        </div>

        {/* Header Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            borderRadius: 24,
            padding: '28px 32px',
            marginBottom: 24,
            background: 'rgba(11,15,23,0.92)',
            border: isApproved
              ? '1.5px solid rgba(16,185,129,0.35)'
              : isRejected
              ? '1.5px solid rgba(239,68,68,0.35)'
              : '1.5px solid rgba(234,179,8,0.35)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.85)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 18,
                  background: isApproved
                    ? 'linear-gradient(135deg, #10b981, #059669)'
                    : isRejected
                    ? 'linear-gradient(135deg, #ef4444, #b91c1c)'
                    : 'linear-gradient(135deg, #eab308, #ca8a04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 26,
                  fontWeight: 900,
                  color: '#ffffff',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                  fontFamily: 'var(--font-display)',
                  flexShrink: 0,
                }}
              >
                {(profile?.officeCompanyName || 'C').charAt(0)}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                  <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: '#ffffff' }}>
                    {profile?.officeCompanyName || 'Your Enterprise'}
                  </h1>
                  {isApproved ? (
                    <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 999, background: 'rgba(16,185,129,0.2)', color: '#10b981', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <ShieldCheck size={13} /> VERIFIED & LIVE
                    </span>
                  ) : isRejected ? (
                    <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 999, background: 'rgba(239,68,68,0.2)', color: '#ef4444', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <X size={13} /> VERIFICATION REJECTED
                    </span>
                  ) : (
                    <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 999, background: 'rgba(234,179,8,0.2)', color: '#eab308', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={13} /> PENDING ADMIN VERIFICATION
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <span>🏢 {profile?.department}</span>
                  <span>·</span>
                  <span>📍 {profile?.city}</span>
                  <span>·</span>
                  <span>📋 {myRFPs.length} Active RFP{myRFPs.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowEdit(true)}
              className="btn-primary"
              style={{ padding: '9px 18px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Edit2 size={13} /> Edit Profile Details
            </button>
          </div>
        </motion.div>

        {/* Verification Status Tracking Timeline */}
        <div style={{ borderRadius: 20, padding: '24px 28px', marginBottom: 24, background: 'rgba(11,15,23,0.92)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, color: '#ffffff', marginBottom: 18 }}>
            Enterprise Verification Lifecycle
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {/* Step 1 */}
            <div style={{ padding: '16px', borderRadius: 14, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <CheckCircle size={16} color="#10b981" />
                <span style={{ fontSize: 13, fontWeight: 800, color: '#10b981' }}>1. Profile Submitted</span>
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.4 }}>
                Company credentials, workplace address, and work email recorded.
              </div>
              {profile?.submittedAt && (
                <div style={{ fontSize: 11, color: '#10b981', marginTop: 6, fontWeight: 600 }}>
                  Submitted: {formatDate(profile.submittedAt)}
                </div>
              )}
            </div>

            {/* Step 2 */}
            <div style={{ padding: '16px', borderRadius: 14, background: isApproved ? 'rgba(16,185,129,0.08)' : isRejected ? 'rgba(239,68,68,0.08)' : 'rgba(234,179,8,0.08)', border: isApproved ? '1px solid rgba(16,185,129,0.25)' : isRejected ? '1px solid rgba(239,68,68,0.25)' : '1px solid rgba(234,179,8,0.25)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                {isApproved ? <CheckCircle size={16} color="#10b981" /> : isRejected ? <X size={16} color="#ef4444" /> : <Clock size={16} color="#eab308" />}
                <span style={{ fontSize: 13, fontWeight: 800, color: isApproved ? '#10b981' : isRejected ? '#ef4444' : '#eab308' }}>
                  2. Admin Governance Review
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.4 }}>
                {isApproved
                  ? 'Official company domain & CIN verified by COE Admin.'
                  : isRejected
                  ? 'Verification declined. Update your credentials to resubmit.'
                  : 'Under active review by COE Super Admin team (2-4 hrs SLA).'}
              </div>
              {profile?.verifiedAt && (
                <div style={{ fontSize: 11, color: '#10b981', marginTop: 6, fontWeight: 600 }}>
                  Verified: {formatDate(profile.verifiedAt)}
                </div>
              )}
            </div>

            {/* Step 3 */}
            <div style={{ padding: '16px', borderRadius: 14, background: isApproved ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.03)', border: isApproved ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                {isApproved ? <ShieldCheck size={16} color="#10b981" /> : <Clock size={16} color="rgba(255,255,255,0.3)" />}
                <span style={{ fontSize: 13, fontWeight: 800, color: isApproved ? '#10b981' : 'rgba(255,255,255,0.4)' }}>
                  3. Live Enterprise Sourcing
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.4 }}>
                {isApproved
                  ? 'Full corporate procurement access, verified badges & SLA contracts unlocked.'
                  : 'Unlocked upon Super Admin verification.'}
              </div>
            </div>
          </div>
        </div>

        {/* Two-Column Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          {/* Card 1: Company Entity */}
          <div style={{ borderRadius: 20, padding: '24px', background: 'rgba(11,15,23,0.92)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <Building2 size={20} color="#10b981" />
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, color: '#ffffff' }}>Organization Details</h2>
            </div>

            <div style={{ display: 'grid', gap: 14 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase' }}>Company / Organization</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#ffffff', marginTop: 2 }}>{profile?.officeCompanyName}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase' }}>CIN / Registration Number</div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: profile?.cinNumber ? '#ffffff' : 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                  {profile?.cinNumber || 'Not specified'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase' }}>Office Location</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 2, lineHeight: 1.4 }}>{profile?.officeAddress}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase' }}>Workforce Size</div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: '#ffffff', marginTop: 2 }}>{profile?.teamSize || '500-2000 Employees'}</div>
              </div>
            </div>
          </div>

          {/* Card 2: Contact & Procurement Authority */}
          <div style={{ borderRadius: 20, padding: '24px', background: 'rgba(11,15,23,0.92)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <User size={20} color="#10b981" />
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, color: '#ffffff' }}>Procurement Authority</h2>
            </div>

            <div style={{ display: 'grid', gap: 14 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase' }}>Authorized Representative</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#ffffff', marginTop: 2 }}>{profile?.name}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase' }}>Official Work Email</div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: '#10b981', marginTop: 2 }}>{currentUser?.email}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase' }}>Mobile Contact</div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: '#ffffff', marginTop: 2 }}>{profile?.mobile}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase' }}>Designation & Department</div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: '#ffffff', marginTop: 2 }}>
                  {profile?.position} · {profile?.department}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase' }}>Estimated Annual Sourcing Budget</div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: '#eab308', marginTop: 2 }}>
                  {profile?.annualProcurementBudget || '₹1 Cr - ₹3 Cr'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEdit && profile && (
          <EditCorporateModal profile={profile} onClose={() => setShowEdit(false)} />
        )}
      </AnimatePresence>
    </main>
  );
}
