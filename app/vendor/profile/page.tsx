'use client';
// ============================================================
// app/vendor/profile/page.tsx — Dedicated Vendor Profile Hub
// Displays verified KYC status, GSTIN, PAN, category specializations,
// past client references, operational base, and edit modal.
// ============================================================

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { DeleteAccountButton } from '@/components/auth/DeleteAccountButton';
import { VendorProfile, CategoryType } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { BlurredCyberHubBackground } from '@/components/canvas/BlurredCyberHubBackground';
import {
  Store, User, Phone, MapPin, ShieldCheck, Clock,
  AlertTriangle, CheckCircle, Edit2, Trash2, ArrowLeft,
  Plus, X, Save, ExternalLink, FileText, CheckCircle2,
  Lock, Sparkles, Building,
} from 'lucide-react';

const CATEGORY_ICONS: Record<CategoryType, string> = {
  sports: '🏆',
  food: '🥂',
  trips: '✈️',
  gifts: '🎁',
  dress: '👔',
};

const CATEGORY_LABELS: Record<CategoryType, string> = {
  sports: 'Sports & Tournaments',
  food: 'Food & Party',
  trips: 'Trips & Offsites',
  gifts: 'Gifts & Rewards',
  dress: 'Dress & Merchandise',
};

const ENTITY_TYPES = ['Pvt Ltd', 'LLP', 'Partnership', 'Proprietorship'] as const;

// ─── Edit Vendor Modal ──────────────────────────────────────
function EditVendorModal({
  profile,
  onClose,
}: {
  profile: VendorProfile;
  onClose: () => void;
}) {
  const { updateVendorProfile } = useStore();
  const router = useRouter();

  const [companyName, setCompanyName] = useState(profile.companyName);
  const [vendorName, setVendorName] = useState(profile.vendorName);
  const [mobile, setMobile] = useState(profile.mobile);
  const [companyMobile, setCompanyMobile] = useState(profile.companyMobile);
  const [address, setAddress] = useState(profile.address);
  const [city, setCity] = useState(profile.city);
  const [gstNumber, setGstNumber] = useState(profile.gstNumber);
  const [panNumber, setPanNumber] = useState(profile.panNumber || '');
  const [entityType, setEntityType] = useState(profile.entityType || 'Pvt Ltd');
  const [portfolioSummary, setPortfolioSummary] = useState(profile.portfolioSummary || '');
  const [pastClients, setPastClients] = useState<string[]>(profile.pastClients || []);
  const [newClient, setNewClient] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const addClient = () => {
    if (newClient.trim() && !pastClients.includes(newClient.trim())) {
      setPastClients([...pastClients, newClient.trim()]);
      setNewClient('');
    }
  };

  const removeClient = (name: string) => {
    setPastClients(pastClients.filter((c) => c !== name));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateVendorProfile({
      companyName: companyName.trim(),
      vendorName: vendorName.trim(),
      mobile: mobile.trim(),
      companyMobile: companyMobile.trim() || mobile.trim(),
      address: address.trim(),
      city,
      gstNumber: gstNumber.trim().toUpperCase(),
      panNumber: panNumber.trim().toUpperCase(),
      entityType,
      portfolioSummary: portfolioSummary.trim(),
      pastClients,
    });
    onClose();
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 11,
    fontWeight: 700,
    color: 'var(--ink-2)',
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
        background: 'rgba(29, 26, 23, 0.45)',
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
          maxWidth: 580,
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: 24,
          background: '#FFF7EC',
          border: '1.5px solid rgba(255, 107, 44,0.3)',
          padding: '28px',
          boxShadow: '0 32px 80px rgba(60, 30, 0, 0.18)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255, 107, 44,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF6B2C' }}>
              <Edit2 size={18} />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: 'var(--ink)' }}>Edit Vendor Partner Profile</h2>
              <div style={{ fontSize: 11.5, color: 'var(--ink-2)' }}>Update business credentials, GST, and client portfolio</div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--cream-2)',
              border: '1px solid var(--line)',
              borderRadius: 8,
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--ink)',
            }}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Business / Trading Name</label>
              <input className="input-base" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Primary Contact Person</label>
              <input className="input-base" required value={vendorName} onChange={(e) => setVendorName(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {/* This field was a free-text box while onboarding already
                constrained the same value to ten digits, so an edit here could
                save something the server would later reject — and this is the
                number the buyer's WhatsApp button is built from. */}
            <div>
              <label style={labelStyle}>Contact Mobile (WhatsApp)</label>
              <div style={{ display: 'flex' }}>
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 11px',
                    borderRadius: '10px 0 0 10px',
                    border: '1px solid var(--line)',
                    borderRight: 'none',
                    background: 'var(--cream-2)',
                    color: 'var(--ink-2)',
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  +91
                </span>
                <input
                  className="input-base"
                  style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  required
                  placeholder="9871100000"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                />
              </div>
              <div
                style={{
                  fontSize: 11,
                  marginTop: 4,
                  fontWeight: 600,
                  color: /^[6-9]\d{9}$/.test(mobile) ? '#137A43' : 'var(--muted)',
                }}
              >
                {/^[6-9]\d{9}$/.test(mobile)
                  ? 'Buyers reach you here on WhatsApp once they award you'
                  : `${mobile.length}/10 digits — must start with 6, 7, 8 or 9`}
              </div>
            </div>
            <div>
              <label style={labelStyle}>Company Landline / Alternate</label>
              <input
                className="input-base"
                type="tel"
                inputMode="numeric"
                maxLength={11}
                placeholder="Optional"
                value={companyMobile}
                onChange={(e) => setCompanyMobile(e.target.value.replace(/\D/g, '').slice(0, 11))}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>GSTIN Number (15 Chars)</label>
              <input className="input-base" required maxLength={15} value={gstNumber} onChange={(e) => setGstNumber(e.target.value.toUpperCase())} />
            </div>
            <div>
              <label style={labelStyle}>PAN Number (10 Chars)</label>
              <input className="input-base" maxLength={10} placeholder="AAACR1234F" value={panNumber} onChange={(e) => setPanNumber(e.target.value.toUpperCase())} />
            </div>
            <div>
              <label style={labelStyle}>Entity Type</label>
              <select className="input-base" value={entityType} onChange={(e) => setEntityType(e.target.value as any)}>
                {ENTITY_TYPES.map((t) => (<option key={t} value={t}>{t}</option>))}
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Operational Base / Facility Address</label>
            <textarea className="input-base" rows={2} required value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>

          <div>
            <label style={labelStyle}>Services & Portfolio Summary</label>
            <textarea className="input-base" rows={2} placeholder="Summary of specialties, menus, fleet, or merchandise..." value={portfolioSummary} onChange={(e) => setPortfolioSummary(e.target.value)} />
          </div>

          <div>
            <label style={labelStyle}>Past Corporate Clients</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="input-base" placeholder="e.g. Google India, Zomato..." value={newClient} onChange={(e) => setNewClient(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addClient(); } }} />
              <button type="button" onClick={addClient} className="btn-ghost" style={{ padding: '0 14px', flexShrink: 0 }}><Plus size={14} /></button>
            </div>
            {pastClients.length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                {pastClients.map((c) => (
                  <span key={c} style={{ padding: '3px 8px', borderRadius: 999, background: 'rgba(255, 107, 44,0.15)', border: '1px solid rgba(255, 107, 44,0.3)', color: 'var(--ink)', fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    {c}
                    <button type="button" onClick={() => removeClient(c)} style={{ background: 'none', border: 'none', color: 'var(--ink-2)', cursor: 'pointer', padding: 0 }}><X size={10} /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="button" onClick={onClose} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ flex: 2, background: 'linear-gradient(135deg, #FF6B2C 0%, #D9541C 100%)', boxShadow: '0 8px 24px rgba(255, 107, 44,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Save size={14} /> Save Vendor Profile
            </button>
          </div>
        </form>

        {/* Danger Zone */}
        <div style={{ borderTop: '1px solid rgba(194, 50, 28,0.2)', paddingTop: 16, marginTop: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#C2321C', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>⚠️ Danger Zone</div>
          {showDeleteConfirm ? (
            <div style={{ padding: '14px', borderRadius: 12, background: 'rgba(194, 50, 28,0.1)', border: '1px solid rgba(194, 50, 28,0.3)' }}>
              <p style={{ fontSize: 13, color: 'var(--ink)', marginBottom: 12, lineHeight: 1.5 }}>
                This will permanently delete your vendor account, GST profile, and all active bids. This cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setShowDeleteConfirm(false)} style={{ flex: 1, padding: '8px', borderRadius: 10, border: '1px solid var(--line)', background: 'var(--cream-2)', color: 'var(--ink)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Cancel</button>
                <DeleteAccountButton label="Yes, delete vendor account" />
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              style={{ width: '100%', padding: '10px', borderRadius: 12, border: '1.5px solid rgba(194, 50, 28,0.4)', background: 'rgba(194, 50, 28,0.08)', color: '#C2321C', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'var(--font-body)' }}
            >
              <Trash2 size={14} /> Delete Vendor Account & Bids
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────
export default function VendorProfilePage() {
  const { currentVendorProfile, currentUser, bids } = useStore();
  const [showEdit, setShowEdit] = useState(false);

  const vendor = currentVendorProfile;
  const isApproved = vendor?.status === 'approved';
  const isPending = vendor?.status === 'pending' || !vendor?.status;
  const isRejected = vendor?.status === 'rejected';

  const myBids = bids.filter((b) => b.vendorId === vendor?.id);
  const acceptedBids = myBids.filter((b) => b.status === 'accepted');

  if (!vendor) {
    return (
      <main style={{ minHeight: '100vh', paddingTop: 120, textAlign: 'center', color: 'var(--ink)', background: '#FFF7EC' }}>
        <p>No vendor profile found. Please register first.</p>
        <Link href="/vendor/onboarding" className="btn-primary" style={{ marginTop: 14 }}>Complete Vendor Registration</Link>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', paddingTop: 96, paddingBottom: 60, position: 'relative', background: '#FFF7EC' }}>
      <BlurredCyberHubBackground />

      <div style={{ maxWidth: 1040, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 10 }}>

        {/* Back Link */}
        <div style={{ marginBottom: 18 }}>
          <Link
            href="/vendor/dashboard"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              fontWeight: 700,
              color: 'var(--ink-2)',
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}
          >
            <ArrowLeft size={14} /> Back to Live Auctions Dashboard
          </Link>
        </div>

        {/* Top Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            borderRadius: 24,
            padding: '28px 32px',
            marginBottom: 24,
            background: 'var(--paper)',
            border: isApproved
              ? '1.5px solid rgba(30, 158, 90,0.35)'
              : isRejected
              ? '1.5px solid rgba(194, 50, 28,0.35)'
              : '1.5px solid rgba(255, 107, 44,0.35)',
            boxShadow: '0 32px 80px rgba(60, 30, 0, 0.18)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <div
                style={{
                  width: 62,
                  height: 62,
                  borderRadius: 18,
                  background: isApproved
                    ? 'linear-gradient(135deg, #1E9E5A, #12854A)'
                    : isRejected
                    ? 'linear-gradient(135deg, #C2321C, #b91c1c)'
                    : 'linear-gradient(135deg, #FF6B2C, #D9541C)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 26,
                  fontWeight: 900,
                  color: 'var(--ink)',
                  boxShadow: '0 8px 24px rgba(255, 107, 44,0.3)',
                  fontFamily: 'var(--font-display)',
                  flexShrink: 0,
                }}
              >
                {vendor.companyName.charAt(0)}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                  <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--ink)' }}>
                    {vendor.companyName}
                  </h1>
                  {isApproved ? (
                    <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 999, background: 'rgba(30, 158, 90,0.2)', color: '#1E9E5A', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <ShieldCheck size={13} /> GST VERIFIED & AUTHORIZED
                    </span>
                  ) : isRejected ? (
                    <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 999, background: 'rgba(194, 50, 28,0.2)', color: '#C2321C', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <X size={13} /> KYC REJECTED
                    </span>
                  ) : (
                    <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 999, background: 'rgba(178, 58, 122,0.2)', color: '#B23A7A', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={13} /> KYC VERIFICATION PENDING
                    </span>
                  )}
                  <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 999, background: 'rgba(255, 107, 44,0.18)', color: '#FF6B2C', fontWeight: 800, textTransform: 'uppercase' }}>
                    {CATEGORY_ICONS[vendor.category]} {CATEGORY_LABELS[vendor.category]}
                  </span>
                </div>

                <div style={{ fontSize: 13, color: 'var(--ink-2)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <span>👤 {vendor.vendorName}</span>
                  <span>·</span>
                  <span>📞 {vendor.mobile}</span>
                  <span>·</span>
                  <span>📍 {vendor.city} (~{vendor.distanceKm} km to Cyber Hub)</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowEdit(true)}
              className="btn-primary"
              style={{ padding: '9px 18px', fontSize: 13, background: 'linear-gradient(135deg, #FF6B2C 0%, #D9541C 100%)', boxShadow: '0 8px 24px rgba(255, 107, 44,0.3)', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Edit2 size={13} /> Edit Profile & Services
            </button>
          </div>
        </motion.div>

        {/* Live Bidding Authorization Status Banner */}
        <div
          style={{
            padding: '16px 20px',
            borderRadius: 18,
            background: isApproved
              ? 'rgba(30, 158, 90,0.1)'
              : isRejected
              ? 'rgba(194, 50, 28,0.1)'
              : 'rgba(178, 58, 122,0.1)',
            border: isApproved
              ? '1px solid rgba(30, 158, 90,0.3)'
              : isRejected
              ? '1px solid rgba(194, 50, 28,0.3)'
              : '1px solid rgba(178, 58, 122,0.3)',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {isApproved ? (
              <ShieldCheck size={22} color="#1E9E5A" />
            ) : isRejected ? (
              <AlertTriangle size={22} color="#C2321C" />
            ) : (
              <Lock size={22} color="#B23A7A" />
            )}
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: isApproved ? '#1E9E5A' : isRejected ? '#C2321C' : '#B23A7A' }}>
                {isApproved
                  ? 'Bidding Engine Active — Authorized Vendor Partner'
                  : isRejected
                  ? 'KYC Verification Rejected by Admin'
                  : 'KYC Pending Verification — Bidding Restricted'}
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 2 }}>
                {isApproved
                  ? 'Your GSTIN and business credentials are verified. You can submit itemized bids across all active reverse auctions.'
                  : isRejected
                  ? 'Please edit your GSTIN and business details to resubmit for Super Admin review.'
                  : 'You will be able to submit itemized bids on live corporate RFPs once your GSTIN is approved by Super Admin.'}
              </div>
            </div>
          </div>

          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-2)' }}>
            {vendor.submittedAt && `Submitted: ${formatDate(vendor.submittedAt)}`}
            {vendor.verifiedAt && ` · Verified: ${formatDate(vendor.verifiedAt)}`}
          </div>
        </div>

        {/* Main Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 24 }}>
          {/* Card 1: Legal & GST Details */}
          <div style={{ borderRadius: 20, padding: '24px', background: 'var(--paper)', border: '1px solid var(--line)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <FileText size={20} color="#FF6B2C" />
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, color: 'var(--ink)' }}>Legal & Tax Credentials</h2>
            </div>

            <div style={{ display: 'grid', gap: 14 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-2)', textTransform: 'uppercase' }}>Registered Entity Name</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginTop: 2 }}>{vendor.companyName}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-2)', textTransform: 'uppercase' }}>Entity Type</div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', marginTop: 2 }}>{vendor.entityType || 'Private Limited (Pvt Ltd)'}</div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-2)', textTransform: 'uppercase' }}>GSTIN Number</div>
                  <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 999, background: isApproved ? 'rgba(30, 158, 90,0.2)' : 'rgba(178, 58, 122,0.2)', color: isApproved ? '#1E9E5A' : '#B23A7A', fontWeight: 800 }}>
                    {isApproved ? 'VERIFIED' : 'PENDING'}
                  </span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--ink)', marginTop: 2, letterSpacing: '0.05em', fontFamily: 'monospace' }}>
                  {vendor.gstNumber}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-2)', textTransform: 'uppercase' }}>PAN Number</div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink)', marginTop: 2, fontFamily: 'monospace' }}>
                  {vendor.panNumber || 'AAACR1234F'}
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Operations & Client Portfolio */}
          <div style={{ borderRadius: 20, padding: '24px', background: 'var(--paper)', border: '1px solid var(--line)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <Store size={20} color="#FF6B2C" />
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, color: 'var(--ink)' }}>Operations & Sourcing Track Record</h2>
            </div>

            <div style={{ display: 'grid', gap: 14 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-2)', textTransform: 'uppercase' }}>Facility / Kitchen / Base Address</div>
                <div style={{ fontSize: 13, color: 'var(--ink)', marginTop: 2, lineHeight: 1.4 }}>{vendor.address}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-2)', textTransform: 'uppercase' }}>Specialties & Portfolio Highlights</div>
                <div style={{ fontSize: 13, color: 'var(--ink)', marginTop: 2, lineHeight: 1.4 }}>
                  {vendor.portfolioSummary || 'Specialized in high-volume enterprise procurement, express SLA turnaround, and custom corporate event packages.'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-2)', textTransform: 'uppercase', marginBottom: 6 }}>Past Corporate Clients</div>
                {vendor.pastClients?.length > 0 ? (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {vendor.pastClients.map((c) => (
                      <span key={c} style={{ fontSize: 11.5, padding: '3px 10px', borderRadius: 999, background: 'rgba(255, 107, 44,0.15)', color: '#FF6B2C', fontWeight: 700 }}>
                        {c}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>No past clients added yet</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
          <div style={{ borderRadius: 16, padding: '18px 20px', background: 'var(--paper)', border: '1px solid var(--line)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-2)', textTransform: 'uppercase' }}>Total Bids Placed</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--ink)', marginTop: 4 }}>{myBids.length}</div>
          </div>
          <div style={{ borderRadius: 16, padding: '18px 20px', background: 'var(--paper)', border: '1px solid var(--line)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-2)', textTransform: 'uppercase' }}>Contracts Won</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#1E9E5A', marginTop: 4 }}>{acceptedBids.length}</div>
          </div>
          <div style={{ borderRadius: 16, padding: '18px 20px', background: 'var(--paper)', border: '1px solid var(--line)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-2)', textTransform: 'uppercase' }}>Cyber Hub Proximity</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#FF6B2C', marginTop: 4 }}>~{vendor.distanceKm} km</div>
          </div>
          <div style={{ borderRadius: 16, padding: '18px 20px', background: 'var(--paper)', border: '1px solid var(--line)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-2)', textTransform: 'uppercase' }}>GSTIN Status</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: isApproved ? '#1E9E5A' : '#B23A7A', marginTop: 6 }}>
              {isApproved ? 'VERIFIED' : 'PENDING'}
            </div>
          </div>
        </div>

      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEdit && (
          <EditVendorModal profile={vendor} onClose={() => setShowEdit(false)} />
        )}
      </AnimatePresence>
    </main>
  );
}
