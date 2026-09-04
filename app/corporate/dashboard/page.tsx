'use client';
// ============================================================
// app/corporate/dashboard/page.tsx — Corporate Procurement Dashboard
// Level 1: My Requirements feed with category filters.
// Features: Post RFP, Edit Profile, Close RFP, Delete RFP, Delete Account.
// ============================================================

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { DeleteAccountButton } from '@/components/auth/DeleteAccountButton';
import { RFP, CorporateProfile, CategoryType } from '@/lib/types';
import { CATEGORY_LABELS, THEMES } from '@/lib/themes';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Category3DIcon } from '@/components/ui/Category3DIcons';
import { BlurredCyberHubBackground } from '@/components/canvas/BlurredCyberHubBackground';
import { CategoryModal } from '@/components/modal/CategoryModal';
import {
  Building2, Calendar, Users, DollarSign,
  Plus, Edit2, X, ChevronRight, ShieldCheck,
  CheckCircle2, Clock, Trash2, Zap, Flame, AlertTriangle, LogOut,
  MapPin, Phone, Briefcase, Archive
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────
type FilterOption = 'all' | CategoryType;

const FILTER_OPTIONS: { label: string; id: FilterOption }[] = [
  { label: 'All', id: 'all' },
  { label: '🏆 Sports', id: 'sports' },
  { label: '🥂 Food & Party', id: 'food' },
  { label: '✈️ Trips', id: 'trips' },
  { label: '🎁 Gifts', id: 'gifts' },
  { label: '👔 Dress', id: 'dress' },
];

function getRFPTitle(rfp: RFP): string {
  const titles: Record<CategoryType, string> = {
    food: 'Annual Founders Gala & Executive Networking Dinner',
    sports: 'Inter-Office Box Cricket Premier League & Football',
    trips: 'Leadership Annual Offsite & Workation Retreat',
    gifts: 'Executive Diwali Luxury Hampers & Awards',
    dress: 'Custom Branded Corporate Polos & Winter Jackets',
  };
  return titles[rfp.category] || `${CATEGORY_LABELS[rfp.category]} Requirement`;
}

// ─── Status Badge ───────────────────────────────────────────
function StatusBadge({ status }: { status: RFP['status'] }) {
  const map: Record<RFP['status'], { label: string; color: string; bg: string }> = {
    draft:          { label: 'Draft — not posted yet', color: '#94a3b8', bg: 'rgba(148,163,184,0.15)' },
    open:           { label: 'Open — awaiting bids',   color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
    'bid-received': { label: '🔥 Bids received',       color: '#f97316', bg: 'rgba(249,115,22,0.15)' },
    awarded:        { label: '✅ Awarded',              color: '#0ea5e9', bg: 'rgba(14,165,233,0.15)' },
    completed:      { label: '🎉 Completed',            color: '#a78bfa', bg: 'rgba(167,139,250,0.15)' },
    cancelled:      { label: '✖ Withdrawn',            color: '#94a3b8', bg: 'rgba(148,163,184,0.15)' },
    closed:         { label: '🔒 Closed',               color: '#94a3b8', bg: 'rgba(148,163,184,0.15)' },
  };
  const s = map[status];
  return (
    <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 999, background: s.bg, color: s.color, fontWeight: 800 }}>
      {s.label}
    </span>
  );
}

// ─── Confirm Delete Dialog ──────────────────────────────────
function ConfirmDialog({
  title, message, confirmLabel, onConfirm, onCancel, danger = true,
}: {
  title: string; message: string; confirmLabel: string;
  onConfirm: () => void; onCancel: () => void; danger?: boolean;
}) {
  const { isNightMode } = useStore();
  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(5,8,20,0.75)', backdropFilter: 'blur(12px)' }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 420, borderRadius: 20, background: '#0B0F17', border: danger ? '1.5px solid rgba(239,68,68,0.35)' : '1.5px solid rgba(255,255,255,0.15)', padding: '28px', boxShadow: '0 32px 80px rgba(0,0,0,0.85)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: danger ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: danger ? '#ef4444' : '#ffffff' }}>
            <AlertTriangle size={20} />
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: '#ffffff' }}>{title}</h3>
        </div>
        <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.65)', marginBottom: 22, lineHeight: 1.6 }}>{message}</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
          <button
            onClick={onConfirm}
            style={{ flex: 2, padding: '11px', borderRadius: 12, border: 'none', background: danger ? '#ef4444' : '#10b981', color: '#ffffff', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)' }}
          >
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Edit Corporate Profile Modal ──────────────────────────
function EditProfileModal({ profile, onClose }: { profile: CorporateProfile; onClose: () => void }) {
  const { updateCorporateProfile, logout, isNightMode } = useStore();
  const router = useRouter();

  const [name, setName] = useState(profile.name);
  const [mobile, setMobile] = useState(profile.mobile ? profile.mobile.replace(/\+91\s*/g, '') : '');
  const [officeCompanyName, setOfficeCompanyName] = useState(profile.officeCompanyName);
  const [officeAddress, setOfficeAddress] = useState(profile.officeAddress);
  const [city, setCity] = useState(profile.city || 'Gurugram');
  const [position, setPosition] = useState(profile.position);
  const [department, setDepartment] = useState(profile.department);
  const isMobileValid = /^[6-9]\d{9}$/.test(mobile);

  const handleSave = (e: React.FormEvent) => {
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
      city,
      position,
      department,
    });
    onClose();
  };


  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 11, fontWeight: 700,
    color: isNightMode ? 'rgba(255,255,255,0.65)' : '#334155',
    marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em',
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <motion.div
          initial={{ scale: 0.93, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.93, opacity: 0, y: 15 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%', maxWidth: 600, maxHeight: '92vh', overflowY: 'auto',
            background: isNightMode ? '#0B0F17' : '#ffffff',
            border: isNightMode ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.12)',
            borderRadius: 24, padding: '28px',
            boxShadow: '0 32px 90px rgba(0,0,0,0.8)',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                <Edit2 size={18} />
              </div>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: isNightMode ? '#ffffff' : '#0f172a' }}>Edit Corporate Profile</h2>
                <div style={{ fontSize: 12, color: isNightMode ? 'rgba(255,255,255,0.5)' : '#64748b' }}>Update your procurement account details</div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: isNightMode ? '#ffffff' : '#0f172a' }}>
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
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

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Company / Organisation Name *</label>
              <input className="input-base" required value={officeCompanyName} onChange={(e) => setOfficeCompanyName(e.target.value)} />
            </div>

            <div style={{ marginBottom: 14 }}>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>City</label>
                <select className="input-base" value={city} onChange={(e) => setCity(e.target.value)}>
                  {['Gurugram', 'Noida', 'New Delhi', 'Bangalore', 'Mumbai', 'Hyderabad', 'Chennai', 'Pune'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Position / Designation</label>
                <input className="input-base" required value={position} onChange={(e) => setPosition(e.target.value)} />
              </div>
            </div>

            <div style={{ marginBottom: 22 }}>
              <label style={labelStyle}>Department</label>
              <input className="input-base" required value={department} onChange={(e) => setDepartment(e.target.value)} />
            </div>

            <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
              <button type="button" onClick={onClose} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
              <button type="submit" className="btn-primary" style={{ flex: 2, background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                Save Profile Changes
              </button>
            </div>
          </form>

          {/* Danger zone */}
          <div style={{ borderTop: '1px solid rgba(239,68,68,0.2)', paddingTop: 16, marginTop: 4 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>⚠️ Danger Zone</div>
            <DeleteAccountButton
              label="Delete my account"
              style={{ width: '100%', flex: 'none', padding: '10px', borderRadius: 12, border: '1.5px solid rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.08)', color: '#ef4444', fontSize: 13, fontFamily: 'var(--font-body)' }}
            />
          </div>
        </motion.div>
      </div>

    </>
  );
}

// ─── RFP Card (Level 1) ────────────────────────────────────
function RFPCard({ rfp, bidCount }: { rfp: RFP; bidCount: number }) {
  const { deleteRFP, isNightMode } = useStore();
  const catTheme = THEMES[rfp.category];
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97 }}
        style={{
          borderRadius: 20,
          padding: '22px 24px',
          marginBottom: 14,
          background: isNightMode ? 'rgba(11,15,23,0.92)' : 'rgba(255,255,255,0.95)',
          border: isNightMode ? `1px solid ${catTheme.primary}28` : `1px solid ${catTheme.primary}22`,
          backdropFilter: 'blur(12px)',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Category color accent */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: catTheme.primary, borderRadius: '20px 0 0 20px' }} />

        <div style={{ paddingLeft: 8 }}>
          {/* Top row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, flexShrink: 0 }}>
                <Category3DIcon category={rfp.category} className="w-9 h-9" />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: catTheme.primary, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
                  {CATEGORY_LABELS[rfp.category]}
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 800, color: isNightMode ? '#ffffff' : '#0f172a', lineHeight: 1.2 }}>
                  {getRFPTitle(rfp)}
                </h3>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {bidCount > 0 && (
                <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 999, background: 'rgba(249,115,22,0.18)', color: '#f97316', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Flame size={12} /> {bidCount} Bid{bidCount !== 1 ? 's' : ''}
                </span>
              )}
              <StatusBadge status={rfp.status} />
              <button
                onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }}
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#ef4444' }}
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>

          {/* Stats Row */}
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 16 }}>
            {[
              { icon: <Calendar size={13} />, label: 'Event Date', val: formatDate(rfp.universal.startDate) },
              { icon: <Users size={13} />, label: 'Headcount', val: `${rfp.universal.persons} Pax` },
              { icon: <DollarSign size={13} />, label: 'Total Budget', val: formatCurrency(rfp.totalBudget) },
              { icon: <Clock size={13} />, label: 'Posted', val: formatDate(rfp.submittedAt) },
            ].map(({ icon, label, val }) => (
              <div key={label}>
                <div style={{ fontSize: 10, color: isNightMode ? 'rgba(255,255,255,0.45)' : '#94a3b8', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                  {icon} {label}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: isNightMode ? '#ffffff' : '#0f172a' }}>{val}</div>
              </div>
            ))}
          </div>

          {/* Footer CTA */}
          <Link href={`/corporate/rfp/${rfp.id}`} style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: catTheme.primary, fontSize: 13, fontWeight: 700 }}>
              {bidCount > 0 ? `View & Compare ${bidCount} Bids` : 'View Requirement Details'}
              <ChevronRight size={15} />
            </div>
          </Link>
        </div>
      </motion.div>

      {showDeleteConfirm && (
        <ConfirmDialog
          title="Delete This Requirement?"
          message={`This will permanently remove "${getRFPTitle(rfp)}" and all associated vendor bids.`}
          confirmLabel="Delete RFP"
          onConfirm={() => { deleteRFP(rfp.id); setShowDeleteConfirm(false); }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </>
  );
}

// ─── Main Corporate Dashboard ──────────────────────────────
export default function CorporateDashboard() {
  const {
    currentUser, currentCorporateProfile,
    rfpList, bids, openModal, isNightMode,
  } = useStore();

  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');
  const [showEditProfile, setShowEditProfile] = useState(false);

  const profile = currentCorporateProfile;

  // My RFPs only
  const myRFPs = rfpList.filter(
    (r) => r.corporateUserId === currentUser?.id || r.corporateId === profile?.id
  );

  const filteredRFPs = activeFilter === 'all'
    ? myRFPs
    : myRFPs.filter((r) => r.category === activeFilter);

  const getBidCount = (rfpId: string) => bids.filter((b) => b.rfpId === rfpId).length;

  // Stats
  const totalBudget = myRFPs.reduce((s, r) => s + (r.totalBudget || 0), 0);
  const totalBids = myRFPs.reduce((s, r) => s + getBidCount(r.id), 0);
  const awarded = myRFPs.filter((r) => r.status === 'awarded' || r.status === 'completed').length;

  return (
    <main style={{ minHeight: '100vh', paddingTop: 96, paddingBottom: 60, position: 'relative', background: '#0B0F17' }}>
      <BlurredCyberHubBackground />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 10 }}>

        {/* ── Profile Bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            borderRadius: 20, padding: '22px 28px', marginBottom: 18,
            background: isNightMode ? 'rgba(11,15,23,0.92)' : 'rgba(255,255,255,0.95)',
            border: isNightMode ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(0,0,0,0.1)',
            backdropFilter: 'blur(12px)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-display)', boxShadow: '0 6px 20px rgba(16,185,129,0.3)', flexShrink: 0 }}>
              {(profile?.officeCompanyName || 'C').charAt(0)}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: isNightMode ? '#ffffff' : '#0f172a' }}>
                  {profile?.officeCompanyName || 'Your Company'}
                </h1>
                {profile?.status === 'approved' ? (
                  <span style={{ fontSize: 10.5, padding: '2px 8px', borderRadius: 999, background: 'rgba(16,185,129,0.2)', color: '#10b981', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <ShieldCheck size={12} /> Verified Corporate
                  </span>
                ) : profile?.status === 'rejected' ? (
                  <span style={{ fontSize: 10.5, padding: '2px 8px', borderRadius: 999, background: 'rgba(239,68,68,0.2)', color: '#ef4444', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <X size={12} /> Verification Rejected
                  </span>
                ) : (
                  <span style={{ fontSize: 10.5, padding: '2px 8px', borderRadius: 999, background: 'rgba(234,179,8,0.2)', color: '#eab308', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} /> Verification Pending
                  </span>
                )}
              </div>
              <div style={{ fontSize: 13, color: isNightMode ? 'rgba(255,255,255,0.65)' : '#475569', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <span>👤 {profile?.name}</span>
                <span>·</span>
                <span>📞 {profile?.mobile}</span>
                <span>·</span>
                <span>🏢 {profile?.department} · {profile?.position}</span>
                <span>·</span>
                <span>📍 {profile?.city}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => setShowEditProfile(true)}
              className="btn-ghost"
              style={{ padding: '8px 16px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Edit2 size={13} /> Edit Profile
            </button>
            <button
              onClick={() => openModal()}
              className="btn-primary"
              style={{ padding: '9px 18px', fontSize: 13.5, display: 'flex', alignItems: 'center', gap: 7 }}
            >
              <Plus size={15} /> Post New RFP
            </button>
          </div>
        </motion.div>

        {/* ── Pending Verification Alert Banner ── */}
        {profile?.status !== 'approved' && (
          <div
            style={{
              padding: '12px 18px',
              borderRadius: 14,
              background: profile?.status === 'rejected' ? 'rgba(239,68,68,0.1)' : 'rgba(234,179,8,0.1)',
              border: profile?.status === 'rejected' ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(234,179,8,0.3)',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {profile?.status === 'rejected' ? <AlertTriangle size={16} color="#ef4444" /> : <Clock size={16} color="#eab308" />}
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>
                {profile?.status === 'rejected'
                  ? 'Your corporate verification was declined by the Admin. Please review your company credentials.'
                  : 'Your corporate account has been submitted and is currently pending verification by the Super Admin.'}
              </span>
            </div>
            <span
              style={{
                fontSize: 11,
                padding: '3px 9px',
                borderRadius: 999,
                background: profile?.status === 'rejected' ? 'rgba(239,68,68,0.2)' : 'rgba(234,179,8,0.2)',
                color: profile?.status === 'rejected' ? '#ef4444' : '#eab308',
                fontWeight: 800,
                textTransform: 'uppercase',
              }}
            >
              {profile?.status === 'rejected' ? 'REJECTED' : 'PENDING ADMIN APPROVAL'}
            </span>
          </div>
        )}

        {/* ── Stats Row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
          {[
            { icon: <Building2 size={18} />, label: 'Total Requirements', val: myRFPs.length, color: '#10b981' },
            { icon: <Zap size={18} />, label: 'Live Bids Received', val: totalBids, color: '#f97316' },
            { icon: <CheckCircle2 size={18} />, label: 'Contracts Awarded', val: awarded, color: '#0ea5e9' },
            { icon: <DollarSign size={18} />, label: 'Total Procurement Value', val: formatCurrency(totalBudget), color: '#eab308' },
          ].map(({ icon, label, val, color }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ borderRadius: 16, padding: '18px 20px', background: isNightMode ? 'rgba(11,15,23,0.9)' : 'rgba(255,255,255,0.95)', border: isNightMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)', backdropFilter: 'blur(12px)' }}
            >
              <div style={{ color, marginBottom: 8 }}>{icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: isNightMode ? '#ffffff' : '#0f172a', marginBottom: 2 }}>{val}</div>
              <div style={{ fontSize: 11.5, color: isNightMode ? 'rgba(255,255,255,0.5)' : '#64748b', fontWeight: 600 }}>{label}</div>
            </motion.div>
          ))}
        </div>

        {/* ── Category Filter Pills ── */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {FILTER_OPTIONS.map((opt) => {
            const active = activeFilter === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setActiveFilter(opt.id)}
                style={{
                  padding: '7px 16px', borderRadius: 999,
                  border: active ? '1.5px solid #10b981' : isNightMode ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.12)',
                  background: active ? 'rgba(16,185,129,0.2)' : isNightMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                  color: active ? '#10b981' : isNightMode ? 'rgba(255,255,255,0.7)' : '#64748b',
                  fontSize: 13, fontWeight: active ? 800 : 600, cursor: 'pointer', transition: 'all 0.2s ease',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* ── Feed header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: isNightMode ? '#ffffff' : '#0f172a' }}>
            My Requirements {filteredRFPs.length > 0 && <span style={{ color: '#10b981' }}>({filteredRFPs.length})</span>}
          </h2>
        </div>

        {/* ── RFP Feed ── */}
        <AnimatePresence>
          {filteredRFPs.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ textAlign: 'center', padding: '64px 20px', borderRadius: 20, background: isNightMode ? 'rgba(11,15,23,0.9)' : 'rgba(255,255,255,0.95)', border: isNightMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)' }}
            >
              <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: isNightMode ? '#ffffff' : '#0f172a', marginBottom: 8, fontFamily: 'var(--font-display)' }}>No Requirements Posted Yet</h3>
              <p style={{ color: isNightMode ? 'rgba(255,255,255,0.55)' : '#64748b', fontSize: 14, marginBottom: 24 }}>
                Post your first corporate requirement to start receiving live vendor bids.
              </p>
              <button onClick={() => openModal()} className="btn-primary" style={{ padding: '11px 24px', fontSize: 14 }}>
                <Plus size={15} /> Post Your First RFP
              </button>
            </motion.div>
          ) : (
            filteredRFPs.map((rfp) => (
              <RFPCard key={rfp.id} rfp={rfp} bidCount={getBidCount(rfp.id)} />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <CategoryModal />

      <AnimatePresence>
        {showEditProfile && profile && (
          <EditProfileModal profile={profile} onClose={() => setShowEditProfile(false)} />
        )}
      </AnimatePresence>
    </main>
  );
}
