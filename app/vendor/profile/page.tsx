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
  const { updateVendorProfile, deleteAccount } = useStore();
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
        background: 'rgba(5,8,20,0.85)',
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
          background: '#0B0F17',
          border: '1.5px solid rgba(249,115,22,0.3)',
          padding: '28px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.9)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(249,115,22,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f97316' }}>
              <Edit2 size={18} />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: '#ffffff' }}>Edit Vendor Partner Profile</h2>
              <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.5)' }}>Update business credentials, GST, and client portfolio</div>
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
              <label style={labelStyle}>Business / Trading Name</label>
              <input className="input-base" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Primary Contact Person</label>
              <input className="input-base" required value={vendorName} onChange={(e) => setVendorName(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Contact Mobile</label>
              <input className="input-base" required value={mobile} onChange={(e) => setMobile(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Company Landline / Alternate</label>
              <input className="input-base" value={companyMobile} onChange={(e) => setCompanyMobile(e.target.value)} />
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
                  <span key={c} style={{ padding: '3px 8px', borderRadius: 999, background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)', color: '#ffffff', fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    {c}
                    <button type="button" onClick={() => removeClient(c)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', padding: 0 }}><X size={10} /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="button" onClick={onClose} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ flex: 2, background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', boxShadow: '0 8px 24px rgba(249,115,22,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Save size={14} /> Save Vendor Profile
            </button>
          </div>
        </form>

        {/* Danger Zone */}
        <div style={{ borderTop: '1px solid rgba(239,68,68,0.2)', paddingTop: 16, marginTop: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>⚠️ Danger Zone</div>
          {showDeleteConfirm ? (
            <div style={{ padding: '14px', borderRadius: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 12, lineHeight: 1.5 }}>
                This will permanently delete your vendor account, GST profile, and all active bids. This cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setShowDeleteConfirm(false)} style={{ flex: 1, padding: '8px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)', color: '#ffffff', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Cancel</button>
                <button onClick={() => { deleteAccount(); router.push('/'); }} style={{ flex: 2, padding: '8px', borderRadius: 10, border: 'none', background: '#ef4444', color: '#ffffff', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Yes, Delete Vendor Account</button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              style={{ width: '100%', padding: '10px', borderRadius: 12, border: '1.5px solid rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.08)', color: '#ef4444', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'var(--font-body)' }}
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
  const { currentVendorProfile, currentUser, bids, isNightMode } = useStore();
  const [showEdit, setShowEdit] = useState(false);

  const vendor = currentVendorProfile;
  const isApproved = vendor?.status === 'approved';
  const isPending = vendor?.status === 'pending' || !vendor?.status;
  const isRejected = vendor?.status === 'rejected';

  const myBids = bids.filter((b) => b.vendorId === vendor?.id);
  const acceptedBids = myBids.filter((b) => b.status === 'accepted');

  if (!vendor) {
    return (
      <main style={{ minHeight: '100vh', paddingTop: 120, textAlign: 'center', color: '#ffffff', background: '#0B0F17' }}>
        <p>No vendor profile found. Please register first.</p>
        <Link href="/vendor/onboarding" className="btn-primary" style={{ marginTop: 14 }}>Complete Vendor Registration</Link>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', paddingTop: 96, paddingBottom: 60, position: 'relative', background: '#0B0F17' }}>
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
              color: 'rgba(255,255,255,0.65)',
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
            background: 'rgba(11,15,23,0.92)',
            border: isApproved
              ? '1.5px solid rgba(16,185,129,0.35)'
              : isRejected
              ? '1.5px solid rgba(239,68,68,0.35)'
              : '1.5px solid rgba(249,115,22,0.35)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.85)',
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
                    ? 'linear-gradient(135deg, #10b981, #059669)'
                    : isRejected
                    ? 'linear-gradient(135deg, #ef4444, #b91c1c)'
                    : 'linear-gradient(135deg, #f97316, #ea580c)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 26,
                  fontWeight: 900,
                  color: '#ffffff',
                  boxShadow: '0 8px 24px rgba(249,115,22,0.3)',
                  fontFamily: 'var(--font-display)',
                  flexShrink: 0,
                }}
              >
                {vendor.companyName.charAt(0)}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                  <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: '#ffffff' }}>
                    {vendor.companyName}
                  </h1>
                  {isApproved ? (
                    <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 999, background: 'rgba(16,185,129,0.2)', color: '#10b981', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <ShieldCheck size={13} /> GST VERIFIED & AUTHORIZED
                    </span>
                  ) : isRejected ? (
                    <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 999, background: 'rgba(239,68,68,0.2)', color: '#ef4444', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <X size={13} /> KYC REJECTED
                    </span>
                  ) : (
                    <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 999, background: 'rgba(234,179,8,0.2)', color: '#eab308', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={13} /> KYC VERIFICATION PENDING
                    </span>
                  )}
                  <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 999, background: 'rgba(249,115,22,0.18)', color: '#f97316', fontWeight: 800, textTransform: 'uppercase' }}>
                    {CATEGORY_ICONS[vendor.category]} {CATEGORY_LABELS[vendor.category]}
                  </span>
                </div>

                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
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
              style={{ padding: '9px 18px', fontSize: 13, background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', boxShadow: '0 8px 24px rgba(249,115,22,0.3)', display: 'flex', alignItems: 'center', gap: 6 }}
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
              ? 'rgba(16,185,129,0.1)'
              : isRejected
              ? 'rgba(239,68,68,0.1)'
              : 'rgba(234,179,8,0.1)',
            border: isApproved
              ? '1px solid rgba(16,185,129,0.3)'
              : isRejected
              ? '1px solid rgba(239,68,68,0.3)'
              : '1px solid rgba(234,179,8,0.3)',
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
              <ShieldCheck size={22} color="#10b981" />
            ) : isRejected ? (
              <AlertTriangle size={22} color="#ef4444" />
            ) : (
              <Lock size={22} color="#eab308" />
            )}
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: isApproved ? '#10b981' : isRejected ? '#ef4444' : '#eab308' }}>
                {isApproved
                  ? 'Bidding Engine Active — Authorized Vendor Partner'
                  : isRejected
                  ? 'KYC Verification Rejected by Admin'
                  : 'KYC Pending Verification — Bidding Restricted'}
              </div>
              <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>
                {isApproved
                  ? 'Your GSTIN and business credentials are verified. You can submit itemized bids across all active reverse auctions.'
                  : isRejected
                  ? 'Please edit your GSTIN and business details to resubmit for Super Admin review.'
                  : 'You will be able to submit itemized bids on live corporate RFPs once your GSTIN is approved by Super Admin.'}
              </div>
            </div>
          </div>

          <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>
            {vendor.submittedAt && `Submitted: ${formatDate(vendor.submittedAt)}`}
            {vendor.verifiedAt && ` · Verified: ${formatDate(vendor.verifiedAt)}`}
          </div>
        </div>

        {/* Main Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 24 }}>
          {/* Card 1: Legal & GST Details */}
          <div style={{ borderRadius: 20, padding: '24px', background: 'rgba(11,15,23,0.92)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <FileText size={20} color="#f97316" />
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, color: '#ffffff' }}>Legal & Tax Credentials</h2>
            </div>

            <div style={{ display: 'grid', gap: 14 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase' }}>Registered Entity Name</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#ffffff', marginTop: 2 }}>{vendor.companyName}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase' }}>Entity Type</div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: '#ffffff', marginTop: 2 }}>{vendor.entityType || 'Private Limited (Pvt Ltd)'}</div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase' }}>GSTIN Number</div>
                  <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 999, background: isApproved ? 'rgba(16,185,129,0.2)' : 'rgba(234,179,8,0.2)', color: isApproved ? '#10b981' : '#eab308', fontWeight: 800 }}>
                    {isApproved ? 'VERIFIED' : 'PENDING'}
                  </span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#ffffff', marginTop: 2, letterSpacing: '0.05em', fontFamily: 'monospace' }}>
                  {vendor.gstNumber}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase' }}>PAN Number</div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: '#ffffff', marginTop: 2, fontFamily: 'monospace' }}>
                  {vendor.panNumber || 'AAACR1234F'}
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Operations & Client Portfolio */}
          <div style={{ borderRadius: 20, padding: '24px', background: 'rgba(11,15,23,0.92)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <Store size={20} color="#f97316" />
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, color: '#ffffff' }}>Operations & Sourcing Track Record</h2>
            </div>

            <div style={{ display: 'grid', gap: 14 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase' }}>Facility / Kitchen / Base Address</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 2, lineHeight: 1.4 }}>{vendor.address}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase' }}>Specialties & Portfolio Highlights</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2, lineHeight: 1.4 }}>
                  {vendor.portfolioSummary || 'Specialized in high-volume enterprise procurement, express SLA turnaround, and custom corporate event packages.'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', marginBottom: 6 }}>Past Corporate Clients</div>
                {vendor.pastClients?.length > 0 ? (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {vendor.pastClients.map((c) => (
                      <span key={c} style={{ fontSize: 11.5, padding: '3px 10px', borderRadius: 999, background: 'rgba(249,115,22,0.15)', color: '#f97316', fontWeight: 700 }}>
                        {c}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.4)' }}>No past clients added yet</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
          <div style={{ borderRadius: 16, padding: '18px 20px', background: 'rgba(11,15,23,0.92)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Total Bids Placed</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#ffffff', marginTop: 4 }}>{myBids.length}</div>
          </div>
          <div style={{ borderRadius: 16, padding: '18px 20px', background: 'rgba(11,15,23,0.92)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Contracts Won</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#10b981', marginTop: 4 }}>{acceptedBids.length}</div>
          </div>
          <div style={{ borderRadius: 16, padding: '18px 20px', background: 'rgba(11,15,23,0.92)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Cyber Hub Proximity</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#f97316', marginTop: 4 }}>~{vendor.distanceKm} km</div>
          </div>
          <div style={{ borderRadius: 16, padding: '18px 20px', background: 'rgba(11,15,23,0.92)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>GSTIN Status</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: isApproved ? '#10b981' : '#eab308', marginTop: 6 }}>
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
