'use client';
// ============================================================
// app/vendor/dashboard/page.tsx — Vendor Supply Portal & Live Bidding Engine
// Tailored Category Feed, Live Reverse-Bidding, Bids Tracking Table
// with Live Bid Revision, Withdraw Bid, Edit Profile, and Delete Account.
// ============================================================

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { DeleteAccountButton } from '@/components/auth/DeleteAccountButton';
import { RFP, Bid, VendorProfile, BidLineItem, CategoryType } from '@/lib/types';
import { CATEGORY_LABELS, THEMES } from '@/lib/themes';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Category3DIcon } from '@/components/ui/Category3DIcons';
import { BlurredCyberHubBackground } from '@/components/canvas/BlurredCyberHubBackground';
import {
  Store, Clock, Users, Calendar, DollarSign,
  ChevronRight, X, Plus, Trash2, Send, CheckCircle, Zap,
  ShieldCheck, Lock, Unlock, AlertCircle, FileText, Edit2,
  RefreshCw, TrendingDown, Building, MapPin, Phone, AlertTriangle,
} from 'lucide-react';

import { VendorTrustBadge } from '@/components/reviews/VendorTrustBadge';

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

// ─── Venue / facility details modal ──────────────────────────
// One vendor account = one listing. This modal used to mint an extra vendor
// record client-side; it now updates the signed-in vendor's own listing.
function RegisterNewVenueModal({ onClose }: { onClose: () => void }) {
  const { updateVendorProfile, isNightMode } = useStore();
  const [venueName, setVenueName] = useState('');
  const [category, setCategory] = useState<CategoryType>('sports');
  const [timings, setTimings] = useState('6:00 AM - 11:00 PM');
  const [avgCost, setAvgCost] = useState(800);
  const [locality, setLocality] = useState(GURUGRAM_LOCALITIES[0]);
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [corporateSuitability, setCorporateSuitability] = useState('');
  const [phone, setPhone] = useState('9811200000');
  const [gstNumber, setGstNumber] = useState('07AAAAA0000A1Z5');
  const [amenities, setAmenities] = useState<string[]>(['Box Cricket Turf', 'Floodlights', 'Hydration Lounge']);
  const [newAmenity, setNewAmenity] = useState('');

  const isPhoneValid = /^[6-9]\d{9}$/.test(phone);

  const handleAddAmenity = () => {
    if (newAmenity.trim() && !amenities.includes(newAmenity.trim())) {
      setAmenities([...amenities, newAmenity.trim()]);
      setNewAmenity('');
    }
  };

  const handleRemoveAmenity = (item: string) => {
    setAmenities(amenities.filter((a) => a !== item));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!venueName.trim() || !address.trim() || !isPhoneValid) return;

    // Rating and review counts are earned, not set here — they come from
    // completed events (see /api/reviews).
    void updateVendorProfile({
      category,
      vendorName: `${venueName} Coordinator`,
      companyName: venueName.trim(),
      mobile: `+91 ${phone.trim()}`,
      companyMobile: `+91 ${phone.trim()}`,
      address: address.trim(),
      locality,
      city: 'Gurugram',
      gstNumber: gstNumber.trim().toUpperCase(),
      portfolioSummary: description.trim(),
      corporateSuitability: corporateSuitability.trim(),
      timings,
      amenities,
      avgCostPerPerson: Number(avgCost) || 800,
    }).then(onClose);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.93, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.93, opacity: 0, y: 15 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 640,
          maxHeight: '90vh',
          overflowY: 'auto',
          background: isNightMode ? '#0B0F17' : '#ffffff',
          border: isNightMode ? '1px solid rgba(249, 115, 22, 0.35)' : '1px solid rgba(0, 0, 0, 0.12)',
          borderRadius: 24,
          padding: '28px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 32px 90px rgba(0,0,0,0.85)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(249, 115, 22, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f97316' }}>
              <Plus size={20} />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: isNightMode ? '#ffffff' : '#0f172a' }}>
                Update your venue details
              </h2>
              <div style={{ fontSize: 12, color: isNightMode ? 'rgba(255,255,255,0.5)' : '#64748b' }}>
                Publish a new sports arena, banquet hall, or party lounge in Gurugram
              </div>
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '6px', borderRadius: 8 }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: isNightMode ? 'rgba(255,255,255,0.7)' : '#334155', marginBottom: 5 }}>
                Venue / Facility Name *
              </label>
              <input
                className="input-base"
                required
                placeholder="e.g. Sports Box 2.0 / Sky Lounge MG Road"
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: isNightMode ? 'rgba(255,255,255,0.7)' : '#334155', marginBottom: 5 }}>
                Service Category *
              </label>
              <select
                className="input-base"
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryType)}
              >
                <option value="sports">🏆 Sports & Tournaments</option>
                <option value="food">🥂 Food, Nightclubs & Lounges</option>
                <option value="trips">✈️ Trips & Offsite Resorts</option>
                <option value="gifts">🎁 Gifts & Rewards</option>
                <option value="dress">👔 Dress & Merchandise</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: isNightMode ? 'rgba(255,255,255,0.7)' : '#334155', marginBottom: 5 }}>
                Gurugram Locality / Area *
              </label>
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
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: isNightMode ? 'rgba(255,255,255,0.7)' : '#334155', marginBottom: 5 }}>
                Starting Cost (₹/Person)
              </label>
              <input
                className="input-base"
                type="number"
                required
                placeholder="e.g. 850"
                value={avgCost}
                onChange={(e) => setAvgCost(Number(e.target.value))}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: isNightMode ? 'rgba(255,255,255,0.7)' : '#334155', marginBottom: 5 }}>
                Full Facility / Venue Address *
              </label>
              <input
                className="input-base"
                required
                placeholder="e.g. SCO 45, Main Market, Sector 29, Gurugram"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: isNightMode ? 'rgba(255,255,255,0.7)' : '#334155', marginBottom: 5 }}>
                Operating Hours / Timings
              </label>
              <input
                className="input-base"
                required
                placeholder="e.g. 6:00 AM - 12:00 AM"
                value={timings}
                onChange={(e) => setTimings(e.target.value)}
              />
            </div>
          </div>

          {/* Amenities Tag Manager */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: isNightMode ? 'rgba(255,255,255,0.7)' : '#334155', marginBottom: 5 }}>
              Featured Amenities & Services
            </label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input
                className="input-base"
                placeholder="e.g. Floodlights, VIP Lounge, DJ Console, Valet Parking"
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddAmenity();
                  }
                }}
              />
              <button type="button" onClick={handleAddAmenity} className="btn-ghost" style={{ padding: '0 14px', flexShrink: 0 }}>
                <Plus size={14} /> Add
              </button>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {amenities.map((a) => (
                <span
                  key={a}
                  style={{
                    padding: '3px 8px',
                    borderRadius: 999,
                    background: 'rgba(249, 115, 22, 0.15)',
                    border: '1px solid rgba(249, 115, 22, 0.3)',
                    color: isNightMode ? '#ffffff' : '#0f172a',
                    fontSize: 11,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                  }}
                >
                  {a}
                  <button type="button" onClick={() => handleRemoveAmenity(a)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: 0 }}>
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: isNightMode ? 'rgba(255,255,255,0.7)' : '#334155', marginBottom: 5 }}>
              Venue Description & Corporate Highlights
            </label>
            <textarea
              className="input-base"
              rows={2}
              placeholder="Describe facility capacity, ground dimensions, audio systems, catering options..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 14, marginBottom: 18 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: isNightMode ? 'rgba(255,255,255,0.7)' : '#334155', marginBottom: 5 }}>
                Direct Booking Contact (10 Digits) *
              </label>
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
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: isNightMode ? 'rgba(255,255,255,0.7)' : '#334155', marginBottom: 5 }}>
                GSTIN Number (15 Digits) *
              </label>
              <input className="input-base" maxLength={15} required value={gstNumber} onChange={(e) => setGstNumber(e.target.value.toUpperCase())} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={onClose} className="btn-ghost" style={{ flex: 1 }}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isPhoneValid || !venueName.trim() || !address.trim()}
              className="btn-primary"
              style={{
                flex: 2,
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                opacity: (!isPhoneValid || !venueName.trim() || !address.trim()) ? 0.4 : 1,
              }}
            >
              Publish Venue & Open for Bids
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Edit Vendor Profile & Security Modal ──────────────────────
function EditVendorProfileModal({
  profile,
  onClose,
}: {
  profile: VendorProfile;
  onClose: () => void;
}) {
  const { updateVendorProfile, changePassword, isNightMode } = useStore();
  const router = useRouter();
  const [tab, setTab] = useState<'profile' | 'security' | 'danger'>('profile');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Profile fields
  const [companyName, setCompanyName] = useState(profile.companyName);
  const [vendorName, setVendorName] = useState(profile.vendorName);
  const [locality, setLocality] = useState(profile.locality || GURUGRAM_LOCALITIES[0]);
  const [mobile, setMobile] = useState(profile.mobile ? profile.mobile.replace(/\+91\s*/g, '') : '');
  const [companyMobile, setCompanyMobile] = useState(profile.companyMobile);
  const [address, setAddress] = useState(profile.address);
  const [gstNumber, setGstNumber] = useState(profile.gstNumber);
  const [timings, setTimings] = useState(profile.timings || '6:00 AM - 12:00 AM');
  const [avgCost, setAvgCost] = useState(profile.avgCostPerPerson || 850);
  const [description, setDescription] = useState(profile.portfolioSummary || '');
  const [corporateSuitability, setCorporateSuitability] = useState(profile.corporateSuitability || '');
  const [amenities, setAmenities] = useState<string[]>(profile.amenities || ['Box Cricket Turf', 'Floodlights', 'Hydration Lounge']);
  const [newAmenity, setNewAmenity] = useState('');
  const [pastClients, setPastClients] = useState<string[]>(profile.pastClients || []);
  const [newClient, setNewClient] = useState('');

  // Password fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const isMobileValid = /^[6-9]\d{9}$/.test(mobile);

  const handleAddAmenity = () => {
    if (newAmenity.trim() && !amenities.includes(newAmenity.trim())) {
      setAmenities([...amenities, newAmenity.trim()]);
      setNewAmenity('');
    }
  };

  const handleRemoveAmenity = (item: string) => {
    setAmenities(amenities.filter((a) => a !== item));
  };

  const handleAddClient = () => {
    if (newClient.trim() && !pastClients.includes(newClient.trim())) {
      setPastClients([...pastClients, newClient.trim()]);
      setNewClient('');
    }
  };

  const handleRemoveClient = (client: string) => {
    setPastClients(pastClients.filter((c) => c !== client));
  };

  const handleSubmitProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMobileValid) {
      alert('Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9');
      return;
    }
    updateVendorProfile({
      companyName,
      vendorName,
      mobile: `+91 ${mobile.trim()}`,
      companyMobile: companyMobile.trim() ? (companyMobile.startsWith('+91') ? companyMobile.trim() : `+91 ${companyMobile.trim()}`) : `+91 ${mobile.trim()}`,
      address,
      locality,
      gstNumber,
      timings,
      avgCostPerPerson: Number(avgCost) || 850,
      portfolioSummary: description,
      corporateSuitability,
      amenities,
      pastClients,
    });
    onClose();
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    if (!newPassword || newPassword !== confirmPassword) {
      setPasswordError('The two new passwords do not match.');
      return;
    }
    setPasswordLoading(true);
    // Strength rules live server-side (lib/validation.ts) so they cannot be
    // bypassed; the message comes back from there.
    const result = await changePassword(oldPassword, newPassword);
    setPasswordLoading(false);
    if (!result.success) {
      setPasswordError(result.message);
      return;
    }
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.93, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.93, opacity: 0, y: 15 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 640,
          maxHeight: '90vh',
          overflowY: 'auto',
          background: isNightMode ? '#0B0F17' : '#ffffff',
          border: isNightMode ? '1px solid rgba(249, 115, 22, 0.35)' : '1px solid rgba(0, 0, 0, 0.12)',
          borderRadius: 24,
          padding: '28px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 32px 90px rgba(0,0,0,0.85)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(249, 115, 22, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f97316' }}>
              <Edit2 size={20} />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: isNightMode ? '#ffffff' : '#0f172a' }}>
                Vendor Settings & Security
              </h2>
              <div style={{ fontSize: 12, color: isNightMode ? 'rgba(255,255,255,0.5)' : '#64748b' }}>
                Manage {profile.companyName} profile, venue timings, and credentials
              </div>
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '6px', borderRadius: 8 }}>
            <X size={16} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: 8, padding: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 12, marginBottom: 20 }}>
          <button
            type="button"
            onClick={() => setTab('profile')}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              background: tab === 'profile' ? '#f97316' : 'transparent',
              color: tab === 'profile' ? '#ffffff' : 'rgba(255,255,255,0.6)',
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            🏢 Profile & Venue
          </button>
          <button
            type="button"
            onClick={() => setTab('security')}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              background: tab === 'security' ? '#10b981' : 'transparent',
              color: tab === 'security' ? '#ffffff' : 'rgba(255,255,255,0.6)',
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            🔒 Security & Password
          </button>
          <button
            type="button"
            onClick={() => setTab('danger')}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              background: tab === 'danger' ? '#ef4444' : 'transparent',
              color: tab === 'danger' ? '#ffffff' : 'rgba(255,255,255,0.6)',
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            ⚠️ Danger Zone
          </button>
        </div>

        {/* Tab 1: Profile & Venue */}
        {tab === 'profile' && (
          <form onSubmit={handleSubmitProfile}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: isNightMode ? 'rgba(255,255,255,0.7)' : '#334155', marginBottom: 5 }}>
                Venue / Business Name *
              </label>
              <input className="input-base" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: isNightMode ? 'rgba(255,255,255,0.7)' : '#334155', marginBottom: 5 }}>
                  Gurugram Locality / Area *
                </label>
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
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: isNightMode ? 'rgba(255,255,255,0.7)' : '#334155', marginBottom: 5 }}>
                  Average Cost (₹/Person)
                </label>
                <input className="input-base" type="number" required value={avgCost} onChange={(e) => setAvgCost(Number(e.target.value))} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: isNightMode ? 'rgba(255,255,255,0.7)' : '#334155', marginBottom: 5 }}>
                  Full Facility Address *
                </label>
                <input className="input-base" required value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: isNightMode ? 'rgba(255,255,255,0.7)' : '#334155', marginBottom: 5 }}>
                  Operating Hours / Timings
                </label>
                <input className="input-base" required value={timings} onChange={(e) => setTimings(e.target.value)} />
              </div>
            </div>

            {/* Featured Amenities */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: isNightMode ? 'rgba(255,255,255,0.7)' : '#334155', marginBottom: 5 }}>
                Featured Amenities & Facilities
              </label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input
                  className="input-base"
                  placeholder="Add amenity (e.g. Box Cricket Turf, Floodlights, VIP Lounge)"
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddAmenity();
                    }
                  }}
                />
                <button type="button" onClick={handleAddAmenity} className="btn-ghost" style={{ padding: '0 14px', flexShrink: 0 }}>
                  <Plus size={14} /> Add
                </button>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {amenities.map((a) => (
                  <span
                    key={a}
                    style={{
                      padding: '3px 8px',
                      borderRadius: 999,
                      background: 'rgba(249, 115, 22, 0.15)',
                      border: '1px solid rgba(249, 115, 22, 0.3)',
                      color: isNightMode ? '#ffffff' : '#0f172a',
                      fontSize: 11,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                    }}
                  >
                    {a}
                    <button type="button" onClick={() => handleRemoveAmenity(a)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: 0 }}>
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: isNightMode ? 'rgba(255,255,255,0.7)' : '#334155', marginBottom: 5 }}>
                Description & Corporate Highlights
              </label>
              <textarea
                className="input-base"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: isNightMode ? 'rgba(255,255,255,0.7)' : '#334155', marginBottom: 5 }}>
                  Primary Contact Person *
                </label>
                <input className="input-base" required value={vendorName} onChange={(e) => setVendorName(e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: isNightMode ? 'rgba(255,255,255,0.7)' : '#334155', marginBottom: 5 }}>
                  Mobile Number (10 Digits) *
                </label>
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
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: isNightMode ? 'rgba(255,255,255,0.7)' : '#334155', marginBottom: 5 }}>
                  GSTIN Number (15 Digits) *
                </label>
                <input className="input-base" maxLength={15} required value={gstNumber} onChange={(e) => setGstNumber(e.target.value.toUpperCase())} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: isNightMode ? 'rgba(255,255,255,0.7)' : '#334155', marginBottom: 5 }}>
                  Company Landline / Support
                </label>
                <input className="input-base" value={companyMobile} onChange={(e) => setCompanyMobile(e.target.value)} />
              </div>
            </div>

            {/* Past Corporate Clients Tags */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: isNightMode ? 'rgba(255,255,255,0.7)' : '#334155', marginBottom: 5 }}>
                Past Corporate Clients & References
              </label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input
                  className="input-base"
                  placeholder="e.g. Google India, Microsoft, Deloitte"
                  value={newClient}
                  onChange={(e) => setNewClient(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddClient();
                    }
                  }}
                />
                <button type="button" onClick={handleAddClient} className="btn-ghost" style={{ padding: '0 14px', flexShrink: 0 }}>
                  <Plus size={14} /> Add
                </button>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {pastClients.map((client) => (
                  <span
                    key={client}
                    style={{
                      padding: '3px 8px',
                      borderRadius: 999,
                      background: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      color: isNightMode ? '#ffffff' : '#0f172a',
                      fontSize: 11,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                    }}
                  >
                    {client}
                    <button type="button" onClick={() => handleRemoveClient(client)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: 0 }}>
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={onClose} className="btn-ghost" style={{ flex: 1 }}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" style={{ flex: 2, background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' }}>
                Save Profile & Venue Details
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Security & Password */}
        {tab === 'security' && (
          <form onSubmit={handleChangePassword}>
            <div style={{ padding: '16px', borderRadius: 14, background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#10b981', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                <ShieldCheck size={16} /> Account Security & Password
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)' }}>
                Changing your password signs you out everywhere else.
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: isNightMode ? 'rgba(255,255,255,0.7)' : '#334155', marginBottom: 5 }}>
                Current Password
              </label>
              <input
                type="password"
                className="input-base"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: isNightMode ? 'rgba(255,255,255,0.7)' : '#334155', marginBottom: 5 }}>
                New Password
              </label>
              <input
                type="password"
                className="input-base"
                required
                placeholder="Enter at least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: isNightMode ? 'rgba(255,255,255,0.7)' : '#334155', marginBottom: 5 }}>
                Confirm New Password
              </label>
              <input
                type="password"
                className="input-base"
                required
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={() => setTab('profile')} className="btn-ghost" style={{ flex: 1 }}>
                Back to Profile
              </button>
              <button
                type="submit"
                disabled={passwordLoading || !newPassword}
                className="btn-primary"
                style={{ flex: 2, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
              >
                {passwordLoading ? 'Updating…' : 'Update Password & Save'}
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Danger Zone */}
        {tab === 'danger' && (
          <div>
            <div style={{ padding: '16px', borderRadius: 14, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#ef4444', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertTriangle size={16} /> Danger Zone: Delete Account
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>
                Deleting your account will permanently remove your vendor profile, all submitted bids, and venue listings from the COE Portal.
              </div>
            </div>

            {showDeleteConfirm ? (
              <div style={{ padding: '14px', borderRadius: 12, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', marginBottom: 14 }}>
                <p style={{ fontSize: 13, color: '#ffffff', marginBottom: 12, fontWeight: 600 }}>
                  Are you absolutely sure you want to delete this vendor account?
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setShowDeleteConfirm(false)} style={{ flex: 1, padding: '8px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)', color: '#ffffff', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                  <DeleteAccountButton label="Yes, delete my account" />
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                style={{ width: '100%', padding: '12px', borderRadius: 12, border: '1.5px solid rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.08)', color: '#ef4444', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                <Trash2 size={15} /> Delete Vendor Account & All Data
              </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ─── Live Bid Revision Modal (Revise Bid) ──────────────────────
function ReviseBidModal({
  bid,
  rfp,
  onClose,
}: {
  bid: Bid;
  rfp?: RFP;
  onClose: () => void;
}) {
  const { reviseBid, isNightMode } = useStore();
  const catTheme = THEMES[bid.category];

  const [price, setPrice] = useState(bid.totalPrice);
  const [proposal, setProposal] = useState(bid.proposal);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (price <= 0) return;
    reviseBid(bid.id, price, proposal);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.93, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.93, opacity: 0, y: 15 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 520,
          background: isNightMode ? '#0B0F17' : '#ffffff',
          border: isNightMode ? `1px solid ${catTheme.primary}44` : '1px solid rgba(0,0,0,0.12)',
          borderRadius: 24,
          padding: '28px',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 32px 90px rgba(0,0,0,0.8)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${catTheme.primary}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: catTheme.primary }}>
              <RefreshCw size={18} />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 800, color: isNightMode ? '#ffffff' : '#0f172a' }}>
                Revise Live Quotation
              </h2>
              <div style={{ fontSize: 11.5, color: isNightMode ? 'rgba(255,255,255,0.5)' : '#64748b' }}>
                Adjust price or terms in the live reverse-bidding auction
              </div>
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
              color: isNightMode ? '#ffffff' : '#0f172a',
            }}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {rfp && (
            <div style={{ background: isNightMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', borderRadius: 12, padding: '12px 14px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 11, color: isNightMode ? 'rgba(255,255,255,0.5)' : '#64748b' }}>Corporate Budget Target</div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: isNightMode ? '#ffffff' : '#0f172a' }}>{formatCurrency(rfp.totalBudget)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: isNightMode ? 'rgba(255,255,255,0.5)' : '#64748b' }}>Your Current Quote</div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: catTheme.primary }}>{formatCurrency(bid.totalPrice)}</div>
              </div>
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: isNightMode ? 'rgba(255,255,255,0.7)' : '#334155', marginBottom: 6 }}>
              New Binding Quotation Amount (₹)
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontWeight: 800, color: catTheme.primary, fontSize: 16 }}>₹</span>
              <input
                className="input-base"
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
                style={{ paddingLeft: 30, fontSize: 16, fontWeight: 700 }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: isNightMode ? 'rgba(255,255,255,0.7)' : '#334155', marginBottom: 6 }}>
              Updated Pitch / SLA Offer
            </label>
            <textarea
              className="input-base"
              rows={3}
              required
              value={proposal}
              onChange={(e) => setProposal(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={onClose} className="btn-ghost" style={{ flex: 1 }}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{ flex: 2, background: catTheme.primary }}
            >
              <TrendingDown size={14} /> Update Live Bid ({formatCurrency(price)})
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Itemized Bid Submit Modal ─────────────────────────────────
function SubmitBidModal({ rfp, onClose }: { rfp: RFP; onClose: () => void }) {
  const { submitBid, currentUser, currentVendorProfile, bids, isNightMode } = useStore();
  const catTheme = THEMES[rfp.category];

  const myExistingBid = bids.find(
    (b) => b.rfpId === rfp.id && (b.vendorUserId === currentUser?.id || b.vendorId === currentVendorProfile?.id)
  );

  const [lineItems, setLineItems] = useState<BidLineItem[]>([
    { description: 'Core Execution & Service Delivery', amount: Math.round(rfp.totalBudget * 0.7) },
    { description: 'Logistics, Setup, AV & Coordination', amount: Math.round(rfp.totalBudget * 0.18) },
  ]);
  const [proposal, setProposal] = useState(
    `We have extensive corporate experience executing ${CATEGORY_LABELS[rfp.category]} events in DLF Cyber City. We guarantee top-tier service delivery matching your strict schedule.`
  );
  const [submitted, setSubmitted] = useState(false);

  const totalPrice = lineItems.reduce((sum, item) => sum + (item.amount || 0), 0);

  const addLine = () => setLineItems([...lineItems, { description: '', amount: 0 }]);
  const removeLine = (i: number) => setLineItems(lineItems.filter((_, idx) => idx !== i));
  const updateLine = (i: number, field: keyof BidLineItem, val: string | number) => {
    const updated = [...lineItems];
    updated[i] = { ...updated[i], [field]: val };
    setLineItems(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalPrice <= 0 || !proposal.trim()) return;

    submitBid({
      rfpId: rfp.id,
      totalPrice,
      lineItems: lineItems.filter((l) => l.description.trim()),
      proposal,
    });
    setSubmitted(true);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.93, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.93, opacity: 0, y: 15 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 620,
          maxHeight: '90vh',
          background: isNightMode ? '#0B0F17' : '#ffffff',
          border: isNightMode ? `1px solid ${catTheme.primary}44` : '1px solid rgba(0,0,0,0.12)',
          borderRadius: 24,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 32px 90px rgba(0,0,0,0.8)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            padding: '20px 24px',
            borderBottom: isNightMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: `linear-gradient(135deg, ${catTheme.primary}18 0%, transparent 100%)`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36 }}>
              <Category3DIcon category={rfp.category} className="w-8 h-8" />
            </div>
            <div>
              <div style={{ fontSize: 11, color: catTheme.primary, fontWeight: 800, textTransform: 'uppercase' }}>
                Live Reverse-Bidding
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: isNightMode ? '#ffffff' : '#0f172a', fontFamily: 'var(--font-display)' }}>
                {CATEGORY_LABELS[rfp.category]} · {rfp.companyName}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 8,
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: isNightMode ? 'rgba(255,255,255,0.7)' : '#0f172a',
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ overflowY: 'auto', padding: '24px', flex: 1 }}>
          {submitted || myExistingBid ? (
            <div style={{ textAlign: 'center', padding: '36px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: isNightMode ? '#ffffff' : '#0f172a', marginBottom: 6, fontFamily: 'var(--font-display)' }}>
                Quotation Live in Reverse Auction!
              </h3>
              <p style={{ color: isNightMode ? 'rgba(255,255,255,0.6)' : '#64748b', fontSize: 13, maxWidth: 420, margin: '0 auto 20px' }}>
                Your proposal has been submitted to Corporate Procurement. Competitor bids remain strictly hidden.
              </p>
              <div
                style={{
                  display: 'inline-block',
                  padding: '10px 24px',
                  background: `${catTheme.primary}15`,
                  border: `1px solid ${catTheme.primary}44`,
                  borderRadius: 12,
                  fontSize: 22,
                  fontWeight: 800,
                  color: catTheme.primary,
                  fontFamily: 'var(--font-display)',
                }}
              >
                {formatCurrency(myExistingBid?.totalPrice || totalPrice)}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Event Specs Banner */}
              <div
                style={{
                  background: isNightMode ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.035)',
                  border: isNightMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
                  borderRadius: 14,
                  padding: '14px',
                  marginBottom: 18,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                  gap: 10,
                }}
              >
                <div>
                  <div style={{ fontSize: 10.5, color: isNightMode ? 'rgba(255,255,255,0.45)' : '#64748b' }}>Date</div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: isNightMode ? '#ffffff' : '#0f172a' }}>
                    {formatDate(rfp.universal.startDate)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10.5, color: isNightMode ? 'rgba(255,255,255,0.45)' : '#64748b' }}>Attendees</div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: isNightMode ? '#ffffff' : '#0f172a' }}>
                    {rfp.universal.persons} Pax
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10.5, color: isNightMode ? 'rgba(255,255,255,0.45)' : '#64748b' }}>Corporate Budget</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: catTheme.primary }}>
                    {formatCurrency(rfp.totalBudget)}
                  </div>
                </div>
              </div>

              {/* Line Items Builder */}
              <div style={{ fontSize: 11, color: isNightMode ? 'rgba(255,255,255,0.5)' : '#64748b', fontWeight: 800, marginBottom: 8, textTransform: 'uppercase' }}>
                Itemized Price Breakdown
              </div>

              {lineItems.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                  <input
                    className="input-base"
                    required
                    placeholder="Description (e.g. Catering, Setup, Kits)"
                    value={item.description}
                    onChange={(e) => updateLine(i, 'description', e.target.value)}
                    style={{ flex: 2, padding: '7px 10px', fontSize: 12.5 }}
                  />
                  <div style={{ position: 'relative', flex: 1 }}>
                    <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: catTheme.primary, fontSize: 13, fontWeight: 700 }}>₹</span>
                    <input
                      className="input-base"
                      type="number"
                      required
                      placeholder="Amount"
                      value={item.amount || ''}
                      onChange={(e) => updateLine(i, 'amount', parseInt(e.target.value) || 0)}
                      style={{ paddingLeft: 22, padding: '7px 10px 7px 22px', fontSize: 12.5 }}
                    />
                  </div>
                  {lineItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLine(i)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 4 }}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}

              <button type="button" onClick={addLine} className="btn-ghost" style={{ marginBottom: 16, fontSize: 12, padding: '6px 12px' }}>
                <Plus size={13} /> Add Line Item
              </button>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  background: `${catTheme.primary}15`,
                  border: `1px solid ${catTheme.primary}44`,
                  borderRadius: 12,
                  marginBottom: 16,
                }}
              >
                <span style={{ fontSize: 12.5, fontWeight: 700, color: isNightMode ? '#ffffff' : '#0f172a' }}>Total Quotation</span>
                <span style={{ fontSize: 20, fontWeight: 800, color: catTheme.primary, fontFamily: 'var(--font-display)' }}>
                  {formatCurrency(totalPrice)}
                </span>
              </div>

              <div style={{ fontSize: 11, color: isNightMode ? 'rgba(255,255,255,0.5)' : '#64748b', fontWeight: 800, marginBottom: 6, textTransform: 'uppercase' }}>
                Proposal & SLA Commitments
              </div>
              <textarea
                className="input-base"
                rows={3}
                required
                value={proposal}
                onChange={(e) => setProposal(e.target.value)}
                placeholder="Highlight your previous corporate experience in DLF Cyber City..."
                style={{ resize: 'vertical', marginBottom: 18 }}
              />

              <button
                type="submit"
                disabled={totalPrice <= 0 || !proposal.trim()}
                className="btn-primary"
                style={{
                  background: catTheme.primary,
                  width: '100%',
                  padding: '12px',
                  fontSize: 14,
                }}
              >
                <Send size={15} />
                Submit Live Quote · {formatCurrency(totalPrice)}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Vendor Dashboard ─────────────────────────────────────
export default function VendorDashboard() {
  const {
    currentUser,
    currentVendorProfile,
    rfpList,
    bids,
    withdrawBid,
    isNightMode,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'available' | 'my-bids'>('available');
  const [selectedRFP, setSelectedRFP] = useState<RFP | null>(null);
  const [revisingBid, setRevisingBid] = useState<Bid | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [registeringVenue, setRegisteringVenue] = useState(false);
  const [confirmWithdrawBid, setConfirmWithdrawBid] = useState<Bid | null>(null);

  // No stand-in profile: if the server has not sent one, the vendor has not
  // finished onboarding and there is nothing truthful to show here.
  const vendor = currentVendorProfile;
  if (!vendor) {
    return (
      <main style={{ minHeight: '100vh', paddingTop: 140, background: '#0B0F17', textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Finish setting up your listing</h1>
        <p style={{ fontSize: 14 }}>
          Complete your vendor profile and we&apos;ll start showing you matching requirements.
        </p>
        <Link
          href="/vendor/onboarding"
          style={{ display: 'inline-block', marginTop: 18, padding: '11px 20px', borderRadius: 11, background: '#f97316', color: '#0B0F17', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}
        >
          Complete profile
        </Link>
      </main>
    );
  }

  // Tailored strictly to vendor category
  const openRFPs = rfpList.filter((r) => r.category === vendor.category && (r.status === 'open' || r.status === 'bid-received'));

  // Vendor's own bids
  const myBids = bids.filter((b) => b.vendorUserId === currentUser?.id || b.vendorId === vendor.id);

  return (
    <main
      style={{
        minHeight: '100vh',
        paddingTop: 96,
        paddingBottom: 60,
        position: 'relative',
        background: '#0B0F17',
      }}
    >
      <BlurredCyberHubBackground />

      <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 10 }}>
        {/* ── 1. TOP PROFILE BAR ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            borderRadius: 20,
            padding: '22px 28px',
            marginBottom: 20,
            background: isNightMode ? 'rgba(11, 15, 23, 0.92)' : 'rgba(255, 255, 255, 0.95)',
            border: isNightMode ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: 14,
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 8px 24px rgba(249, 115, 22, 0.35)',
                fontSize: 24,
                fontWeight: 800,
                fontFamily: 'var(--font-display)',
                flexShrink: 0,
              }}
            >
              {vendor.companyName.charAt(0)}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 21, fontWeight: 800, color: isNightMode ? '#ffffff' : '#0f172a' }}>
                  {vendor.companyName}
                </h1>
                {vendor.status === 'approved' ? (
                  <span
                    style={{
                      fontSize: 10.5,
                      padding: '2px 8px',
                      borderRadius: 999,
                      background: 'rgba(16, 185, 129, 0.18)',
                      color: '#10b981',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                    }}
                  >
                    <ShieldCheck size={12} /> GST Verified
                  </span>
                ) : vendor.status === 'rejected' ? (
                  <span
                    style={{
                      fontSize: 10.5,
                      padding: '2px 8px',
                      borderRadius: 999,
                      background: 'rgba(239, 68, 68, 0.18)',
                      color: '#ef4444',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                    }}
                  >
                    <X size={12} /> KYC Rejected
                  </span>
                ) : (
                  <span
                    style={{
                      fontSize: 10.5,
                      padding: '2px 8px',
                      borderRadius: 999,
                      background: 'rgba(234, 179, 8, 0.18)',
                      color: '#eab308',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                    }}
                  >
                    <Clock size={12} /> KYC Verification Pending
                  </span>
                )}
                <span
                  style={{
                    fontSize: 10.5,
                    padding: '2px 8px',
                    borderRadius: 999,
                    background: 'rgba(249, 115, 22, 0.18)',
                    color: '#f97316',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                  }}
                >
                  {CATEGORY_LABELS[vendor.category]}
                </span>

                {/* Google Places Trust Badge */}
                <VendorTrustBadge
                  placeId={vendor.place_id}
                  vendorName={vendor.companyName}
                  rating={vendor.rating ?? undefined}
                  userRatingsTotal={vendor.user_ratings_total ?? undefined}
                />
              </div>

              {/* Venue Metadata Chips */}
              <div style={{ fontSize: 12.5, color: isNightMode ? 'rgba(255, 255, 255, 0.7)' : '#334155', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                <span>👤 <strong>{vendor.vendorName}</strong></span>
                <span>•</span>
                <span>📞 {vendor.mobile}</span>
                <span>•</span>
                <span>
                  📍 {vendor.address ? vendor.address.split(',')[0] : vendor.city || 'Gurugram'}
                  {vendor.distanceKm > 0 ? ` (~${vendor.distanceKm} km from Cyber Hub)` : ''}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', fontSize: 11 }}>
                {/* These describe the vendor's own listing, so an empty value
                    is shown as "not set" rather than filled with a plausible
                    default they never entered. */}
                {vendor.timings && (
                  <span style={{ padding: '2px 7px', borderRadius: 6, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.8)' }}>
                    ⏰ {vendor.timings}
                  </span>
                )}
                {vendor.avgCostPerPerson ? (
                  <span style={{ padding: '2px 7px', borderRadius: 6, background: 'rgba(16,185,129,0.12)', color: '#34d399', fontWeight: 700 }}>
                    💰 Avg {formatCurrency(vendor.avgCostPerPerson)}/pax
                  </span>
                ) : (
                  <span style={{ padding: '2px 7px', borderRadius: 6, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.55)' }}>
                    💰 Typical spend not set
                  </span>
                )}
                {vendor.amenities && vendor.amenities.length > 0 && (
                  <span style={{ padding: '2px 7px', borderRadius: 6, background: 'rgba(249,115,22,0.12)', color: '#fb923c' }}>
                    ✨ {vendor.amenities.slice(0, 3).join(' · ')}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => setRegisteringVenue(true)}
              className="btn-primary"
              style={{
                padding: '9px 16px',
                fontSize: 13,
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Plus size={15} />
              Update venue details
            </button>

            <button
              onClick={() => setEditingProfile(true)}
              className="btn-ghost"
              style={{ padding: '9px 16px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Edit2 size={13} />
              Edit Profile & Security
            </button>
          </div>
        </motion.div>

        {/* ── Vendor Pending Verification Alert Banner ── */}
        {vendor.status !== 'approved' && (
          <div
            style={{
              padding: '14px 18px',
              borderRadius: 14,
              background: vendor.status === 'rejected' ? 'rgba(239,68,68,0.1)' : 'rgba(234,179,8,0.1)',
              border: vendor.status === 'rejected' ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(234,179,8,0.3)',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {vendor.status === 'rejected' ? <AlertCircle size={17} color="#ef4444" /> : <Clock size={17} color="#eab308" />}
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>
                {vendor.status === 'rejected'
                  ? 'Your vendor partner KYC verification was rejected by Super Admin. Please update your GSTIN.'
                  : `Your GSTIN (${vendor.gstNumber}) and business credentials have been submitted for Super Admin KYC verification.`}
              </span>
            </div>
            <span
              style={{
                fontSize: 11,
                padding: '3px 9px',
                borderRadius: 999,
                background: vendor.status === 'rejected' ? 'rgba(239,68,68,0.2)' : 'rgba(234,179,8,0.2)',
                color: vendor.status === 'rejected' ? '#ef4444' : '#eab308',
                fontWeight: 800,
                textTransform: 'uppercase',
              }}
            >
              {vendor.status === 'rejected' ? 'KYC REJECTED' : 'KYC PENDING APPROVAL'}
            </span>
          </div>
        )}

        {/* ── 2. TWO PRIMARY VIEWS TABS ── */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <button
            onClick={() => setActiveTab('available')}
            style={{
              padding: '10px 20px',
              borderRadius: 12,
              border: activeTab === 'available' ? '1px solid #f97316' : isNightMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
              background: activeTab === 'available' ? 'rgba(249, 115, 22, 0.2)' : isNightMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
              color: activeTab === 'available' ? '#ffffff' : isNightMode ? 'rgba(255,255,255,0.65)' : '#64748b',
              fontSize: 13.5,
              fontWeight: activeTab === 'available' ? 800 : 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>Live Corporate RFPs (Available to Bid)</span>
            <span style={{ fontSize: 11, background: '#f97316', color: '#000', padding: '1px 7px', borderRadius: 999, fontWeight: 800 }}>
              {openRFPs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('my-bids')}
            style={{
              padding: '10px 20px',
              borderRadius: 12,
              border: activeTab === 'my-bids' ? '1px solid #10b981' : isNightMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
              background: activeTab === 'my-bids' ? 'rgba(16, 185, 129, 0.2)' : isNightMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
              color: activeTab === 'my-bids' ? '#ffffff' : isNightMode ? 'rgba(255,255,255,0.65)' : '#64748b',
              fontSize: 13.5,
              fontWeight: activeTab === 'my-bids' ? 800 : 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>My Active Bids & Bidding History</span>
            <span style={{ fontSize: 11, background: 'rgba(16, 185, 129, 0.3)', color: '#10b981', padding: '1px 7px', borderRadius: 999, fontWeight: 800 }}>
              {myBids.length}
            </span>
          </button>
        </div>

        {/* ── View 1: Live Corporate RFPs ── */}
        {activeTab === 'available' && (
          <div>
            {openRFPs.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  borderRadius: 20,
                  background: isNightMode ? 'rgba(11, 15, 23, 0.9)' : 'rgba(255,255,255,0.9)',
                  border: isNightMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
                }}
              >
                <Clock size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                <h3 style={{ fontSize: 18, fontWeight: 700, color: isNightMode ? '#ffffff' : '#0f172a', marginBottom: 6 }}>
                  No Open RFPs in {CATEGORY_LABELS[vendor.category]}
                </h3>
                <p style={{ color: isNightMode ? 'rgba(255,255,255,0.5)' : '#64748b', fontSize: 13 }}>
                  New corporate requirements from DLF Cyber City stream in continuously.
                </p>
              </div>
            ) : (
              openRFPs.map((rfp) => {
                const myBid = myBids.find((b) => b.rfpId === rfp.id);
                const catTheme = THEMES[rfp.category];

                return (
                  <motion.div
                    key={rfp.id}
                    layout
                    style={{
                      borderRadius: 18,
                      padding: '22px 24px',
                      marginBottom: 16,
                      background: isNightMode ? 'rgba(11, 15, 23, 0.92)' : 'rgba(255, 255, 255, 0.95)',
                      border: myBid ? '1.5px solid #10b981' : isNightMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
                      backdropFilter: 'blur(12px)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 42, height: 42 }}>
                          <Category3DIcon category={rfp.category} className="w-8 h-8" />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: isNightMode ? '#ffffff' : '#0f172a' }}>
                              {rfp.companyName}
                            </h3>
                            <span style={{ fontSize: 10.5, padding: '2px 7px', borderRadius: 999, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: 800 }}>
                              Verified Enterprise
                            </span>
                          </div>
                          <div style={{ fontSize: 12.5, color: isNightMode ? 'rgba(255, 255, 255, 0.55)' : '#64748b' }}>
                            {CATEGORY_LABELS[rfp.category]} · Posted on {formatDate(rfp.submittedAt)}
                          </div>
                        </div>
                      </div>

                      {myBid ? (
                        <span
                          style={{
                            padding: '5px 12px',
                            borderRadius: 999,
                            background: 'rgba(16, 185, 129, 0.2)',
                            color: '#10b981',
                            fontSize: 12,
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5,
                          }}
                        >
                          <CheckCircle size={13} />
                          Live Quote: {formatCurrency(myBid.totalPrice)}
                        </span>
                      ) : (
                        <span
                          style={{
                            padding: '5px 12px',
                            borderRadius: 999,
                            background: 'rgba(249, 115, 22, 0.18)',
                            color: '#f97316',
                            fontSize: 12,
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5,
                          }}
                        >
                          <Zap size={13} />
                          Live Auction Open
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 14 }}>
                      <span style={{ fontSize: 12.5, color: isNightMode ? 'rgba(255, 255, 255, 0.7)' : '#475569', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Users size={14} color="#f97316" />
                        {rfp.universal.persons} Attendees
                      </span>
                      <span style={{ fontSize: 12.5, color: isNightMode ? 'rgba(255, 255, 255, 0.7)' : '#475569', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Calendar size={14} color="#f97316" />
                        {formatDate(rfp.universal.startDate)} ({rfp.universal.timeSlot || 'Full Day'})
                      </span>
                      <span style={{ fontSize: 12.5, color: isNightMode ? 'rgba(255, 255, 255, 0.7)' : '#475569', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <DollarSign size={14} color="#10b981" />
                        Target Budget: <strong>{formatCurrency(rfp.totalBudget)}</strong>
                      </span>
                    </div>

                    {rfp.universal.notes && (
                      <div style={{ fontSize: 12, color: isNightMode ? 'rgba(255,255,255,0.6)' : '#64748b', background: isNightMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', padding: '8px 12px', borderRadius: 8, marginBottom: 14 }}>
                        {rfp.universal.notes}
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: 11.5, color: isNightMode ? 'rgba(255,255,255,0.45)' : '#64748b', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Lock size={12} /> Blind reverse-bidding protocol active
                      </div>

                      {vendor.status !== 'approved' ? (
                        <button
                          onClick={() => {
                            useStore.getState().addToast({
                              type: 'warning',
                              title: '🔒 Bidding Restricted',
                              message: 'Your GSTIN is pending Super Admin verification. You will be authorized to submit bids once approved.',
                            });
                          }}
                          style={{
                            padding: '8px 16px',
                            borderRadius: 10,
                            border: '1px solid rgba(234,179,8,0.4)',
                            background: 'rgba(234,179,8,0.12)',
                            color: '#eab308',
                            fontSize: 12.5,
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            fontFamily: 'var(--font-body)',
                          }}
                        >
                          <Lock size={13} /> KYC Pending to Bid
                        </button>
                      ) : myBid ? (
                        <button
                          onClick={() => setRevisingBid(myBid)}
                          className="btn-ghost"
                          style={{ borderColor: '#10b981', color: '#10b981', padding: '8px 16px', fontSize: 12.5 }}
                        >
                          <RefreshCw size={13} /> Revise My Quote
                        </button>
                      ) : (
                        <button
                          onClick={() => setSelectedRFP(rfp)}
                          className="btn-primary"
                          style={{ background: '#f97316', padding: '8px 18px', fontSize: 13 }}
                        >
                          Submit Bid <ChevronRight size={14} />
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        )}

        {/* ── View 2: My Active Bids & Tracking Table ── */}
        {activeTab === 'my-bids' && (
          <div
            style={{
              borderRadius: 20,
              padding: '24px',
              background: isNightMode ? 'rgba(11, 15, 23, 0.92)' : 'rgba(255, 255, 255, 0.95)',
              border: isNightMode ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.1)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: isNightMode ? '#ffffff' : '#0f172a' }}>
                Active Reverse-Bidding Live Tracker
              </h3>
              <div style={{ fontSize: 12, color: isNightMode ? 'rgba(255,255,255,0.5)' : '#64748b' }}>
                Total Quotations: {myBids.length}
              </div>
            </div>

            {myBids.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: isNightMode ? 'rgba(255,255,255,0.45)' : '#64748b' }}>
                <Clock size={32} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
                <div>You haven't submitted any bids yet.</div>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: isNightMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', color: isNightMode ? 'rgba(255,255,255,0.45)' : '#64748b', fontSize: 11.5, textTransform: 'uppercase' }}>
                      <th style={{ padding: '10px 12px' }}>Event / Corporate</th>
                      <th style={{ padding: '10px 12px' }}>Your Live Quote</th>
                      <th style={{ padding: '10px 12px' }}>Match %</th>
                      <th style={{ padding: '10px 12px' }}>Status</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myBids.map((bid) => {
                      const targetRfp = rfpList.find((r) => r.id === bid.rfpId);
                      const isAwarded = bid.status === 'accepted';

                      return (
                        <tr key={bid.id} style={{ borderBottom: isNightMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)' }}>
                          <td style={{ padding: '14px 12px' }}>
                            <div style={{ fontWeight: 700, color: isNightMode ? '#ffffff' : '#0f172a' }}>
                              {targetRfp?.companyName || 'Corporate Client'}
                            </div>
                            <div style={{ fontSize: 11.5, color: isNightMode ? 'rgba(255,255,255,0.5)' : '#64748b' }}>
                              {CATEGORY_LABELS[bid.category]} · {formatDate(bid.submittedAt)}
                            </div>
                          </td>

                          <td style={{ padding: '14px 12px', fontWeight: 800, fontSize: 15, color: isAwarded ? '#10b981' : '#f97316' }}>
                            {formatCurrency(bid.totalPrice)}
                          </td>

                          <td style={{ padding: '14px 12px' }}>
                            <span style={{ padding: '2px 8px', borderRadius: 999, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: 800, fontSize: 11.5 }}>
                              ⚡ {bid.matchPercentage}%
                            </span>
                          </td>

                          <td style={{ padding: '14px 12px' }}>
                            <span
                              style={{
                                padding: '3px 10px',
                                borderRadius: 999,
                                fontSize: 11,
                                fontWeight: 700,
                                background: isAwarded ? 'rgba(34, 197, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                                color: isAwarded ? '#22c55e' : '#f59e0b',
                                border: `1px solid ${isAwarded ? '#22c55e' : '#f59e0b'}44`,
                              }}
                            >
                              {isAwarded ? '🎉 Awarded' : '● In Review'}
                            </span>
                          </td>

                          <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                            {!isAwarded && (
                              <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                <button
                                  onClick={() => setRevisingBid(bid)}
                                  style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: isNightMode ? '#ffffff' : '#0f172a', fontSize: 11.5, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-body)' }}
                                >
                                  <RefreshCw size={12} /> Revise
                                </button>
                                <button
                                  onClick={() => setConfirmWithdrawBid(bid)}
                                  style={{ padding: '6px 10px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontSize: 11.5, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-body)' }}
                                >
                                  <Trash2 size={12} /> Withdraw
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Venue details modal */}
      <AnimatePresence>
        {registeringVenue && (
          <RegisterNewVenueModal onClose={() => setRegisteringVenue(false)} />
        )}
      </AnimatePresence>

      {/* Edit Vendor Profile Modal */}
      <AnimatePresence>
        {editingProfile && (
          <EditVendorProfileModal
            profile={vendor}
            onClose={() => setEditingProfile(false)}
          />
        )}
      </AnimatePresence>

      {/* Submit Bid Modal */}
      <AnimatePresence>
        {selectedRFP && (
          <SubmitBidModal rfp={selectedRFP} onClose={() => setSelectedRFP(null)} />
        )}
      </AnimatePresence>

      {/* Revise Bid Modal */}
      <AnimatePresence>
        {revisingBid && (
          <ReviseBidModal
            bid={revisingBid}
            rfp={rfpList.find((r) => r.id === revisingBid.rfpId)}
            onClose={() => setRevisingBid(null)}
          />
        )}
      </AnimatePresence>

      {/* Withdraw Bid Confirm */}
      <AnimatePresence>
        {confirmWithdrawBid && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(5,8,20,0.8)', backdropFilter: 'blur(12px)' }} onClick={() => setConfirmWithdrawBid(null)}>
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{ width: '100%', maxWidth: 400, borderRadius: 20, background: '#0B0F17', border: '1.5px solid rgba(239,68,68,0.35)', padding: '28px', boxShadow: '0 32px 80px rgba(0,0,0,0.9)' }}
            >
              <div style={{ fontSize: 36, textAlign: 'center', marginBottom: 12 }}>🏳️</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: '#ffffff', textAlign: 'center', marginBottom: 10 }}>Withdraw This Bid?</h3>
              <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.65)', textAlign: 'center', marginBottom: 22, lineHeight: 1.5 }}>
                Your quote of <strong style={{ color: '#ffffff' }}>{formatCurrency(confirmWithdrawBid.totalPrice)}</strong> will be permanently retracted from the live auction.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setConfirmWithdrawBid(null)} style={{ flex: 1, padding: '10px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)', color: '#ffffff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Keep Bid</button>
                <button onClick={() => { withdrawBid(confirmWithdrawBid.id); setConfirmWithdrawBid(null); }} style={{ flex: 2, padding: '10px', borderRadius: 12, border: 'none', background: '#ef4444', color: '#ffffff', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Yes, Withdraw</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
