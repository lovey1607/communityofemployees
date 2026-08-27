'use client';
// ============================================================
// app/admin/dashboard/page.tsx — Super Admin Master Control v2
// - Live Monitor with Category Filter + Bid expand/edit/delete
// - Corporate Accounts tab (approve, reject, suspend, delete)
// - Vendor KYC tab (approve, reject, delete)
// - Analytics tab with live charts
// ============================================================

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { User, VendorProfile, CorporateProfile, RFP, Bid, UserRole, CategoryType } from '@/lib/types';
import { CATEGORY_LABELS } from '@/lib/themes';
import { formatCurrency, formatDate } from '@/lib/utils';
import { BlurredCyberHubBackground } from '@/components/canvas/BlurredCyberHubBackground';
import {
  Shield, Users, Store, Building2, DollarSign,
  TrendingUp, CheckCircle, XCircle, AlertTriangle, Trash2,
  Edit2, Search, ShieldCheck, Activity, CheckCircle2, Clock,
  X, Save, RefreshCw, ChevronDown, ChevronUp, Filter,
  Flame, Timer, Trophy, FileText, Eye, Lock,
} from 'lucide-react';

// ─── Constants ──────────────────────────────────────────────
const CATEGORY_COLORS: Record<CategoryType, string> = {
  sports: '#10b981',
  food: '#f97316',
  trips: '#0ea5e9',
  gifts: '#eab308',
  dress: '#a78bfa',
};
const CATEGORY_ICONS: Record<CategoryType, string> = {
  sports: '🏏',
  food: '🍽️',
  trips: '✈️',
  gifts: '🎁',
  dress: '👕',
};
const ALL_CATEGORIES: CategoryType[] = ['sports', 'food', 'trips', 'gifts', 'dress'];

// ─── Helpers ────────────────────────────────────────────────
const lbl = (s: string) => ({
  display: 'block' as const,
  fontSize: 10,
  fontWeight: 700,
  color: 'rgba(255,255,255,0.5)',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.07em',
  marginBottom: 5,
});

// ─── ConfirmDialog ───────────────────────────────────────────
function ConfirmDialog({ title, message, confirmLabel, danger = true, onConfirm, onCancel }: {
  title: string; message: string; confirmLabel: string; danger?: boolean;
  onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(5,8,20,0.82)', backdropFilter: 'blur(14px)' }} onClick={onCancel}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 440, borderRadius: 22, background: '#0B0F17', border: `1.5px solid ${danger ? 'rgba(239,68,68,0.4)' : 'rgba(16,185,129,0.3)'}`, padding: '28px', boxShadow: '0 40px 100px rgba(0,0,0,0.95)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: danger ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: danger ? '#ef4444' : '#10b981' }}>
            {danger ? <AlertTriangle size={20} /> : <CheckCircle size={20} />}
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: '#ffffff' }}>{title}</h3>
        </div>
        <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.65)', marginBottom: 22, lineHeight: 1.6 }}>{message}</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '10px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)', color: '#ffffff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex: 2, padding: '10px', borderRadius: 12, border: 'none', background: danger ? '#ef4444' : '#10b981', color: '#ffffff', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>{confirmLabel}</button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Edit User Modal ─────────────────────────────────────────
function EditUserModal({ user, onClose }: { user: User; onClose: () => void }) {
  const { adminUpdateUser } = useStore();
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState<UserRole>(user.role);
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(5,8,20,0.82)', backdropFilter: 'blur(14px)' }} onClick={onClose}>
      <motion.div initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.93, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 440, borderRadius: 22, background: '#0B0F17', border: '1.5px solid rgba(234,179,8,0.3)', padding: '28px', boxShadow: '0 40px 100px rgba(0,0,0,0.9)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(234,179,8,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#eab308' }}><Edit2 size={18} /></div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: '#ffffff' }}>Edit User Account</h2>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#ffffff' }}><X size={16} /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); adminUpdateUser(user.id, { email: email.trim().toLowerCase(), role }); onClose(); }}>
          <div style={{ marginBottom: 14 }}>
            <label style={lbl('Email')}>Email Address</label>
            <input className="input-base" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={lbl('Role')}>Platform Role</label>
            <select className="input-base" value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
              <option value="corporate">Corporate</option>
              <option value="vendor">Vendor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)', color: '#ffffff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Cancel</button>
            <button type="submit" style={{ flex: 2, padding: '10px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #eab308, #ca8a04)', color: '#050814', fontSize: 13.5, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: 'var(--font-body)' }}>
              <Save size={14} /> Save Changes
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Edit Bid Modal ──────────────────────────────────────────
function EditBidModal({ bid, onClose }: { bid: Bid; onClose: () => void }) {
  const { adminUpdateBid } = useStore();
  const [totalPrice, setTotalPrice] = useState(bid.totalPrice.toString());
  const [proposal, setProposal] = useState(bid.proposal);
  const [status, setStatus] = useState(bid.status);
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(5,8,20,0.82)', backdropFilter: 'blur(14px)' }} onClick={onClose}>
      <motion.div initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.93, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 520, borderRadius: 22, background: '#0B0F17', border: '1.5px solid rgba(14,165,233,0.3)', padding: '28px', boxShadow: '0 40px 100px rgba(0,0,0,0.9)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(14,165,233,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0ea5e9' }}><Edit2 size={18} /></div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 800, color: '#ffffff', lineHeight: 1 }}>Edit Bid</h2>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 3 }}>{bid.vendorCompany}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#ffffff' }}><X size={16} /></button>
        </div>

        <form onSubmit={(e) => {
          e.preventDefault();
          adminUpdateBid(bid.id, { totalPrice: parseInt(totalPrice, 10), proposal, status });
          onClose();
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <label style={lbl('Total Price')}>Total Bid Price (₹)</label>
              <input className="input-base" type="number" required value={totalPrice} onChange={(e) => setTotalPrice(e.target.value)} />
            </div>
            <div>
              <label style={lbl('Status')}>Bid Status</label>
              <select className="input-base" value={status} onChange={(e) => setStatus(e.target.value as Bid['status'])}>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={lbl('Proposal')}>Vendor Proposal</label>
            <textarea className="input-base" rows={4} value={proposal} onChange={(e) => setProposal(e.target.value)} style={{ resize: 'vertical' }} />
          </div>

          {/* Line Items (read-only) */}
          {bid.lineItems?.length > 0 && (
            <div style={{ marginBottom: 20, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '14px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 10, textTransform: 'uppercase' }}>Line Items (read-only)</div>
              {bid.lineItems.map((li, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>
                  <span>{li.description}</span>
                  <span style={{ fontWeight: 700, color: '#ffffff' }}>{formatCurrency(li.amount)}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)', color: '#ffffff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Cancel</button>
            <button type="submit" style={{ flex: 2, padding: '10px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: '#ffffff', fontSize: 13.5, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: 'var(--font-body)' }}>
              <Save size={14} /> Save Bid Changes
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Stat Card ───────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color }: { icon: React.ReactNode; label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div style={{ borderRadius: 18, padding: '20px', background: 'rgba(11,15,23,0.92)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)' }}>
      <div style={{ color, marginBottom: 10, opacity: 0.9 }}>{icon}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 900, color: '#ffffff', marginBottom: 4, letterSpacing: '-0.02em' }}>{value}</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color, marginTop: 4, fontWeight: 700 }}>{sub}</div>}
    </div>
  );
}

// ─── Tab Button ──────────────────────────────────────────────
function TabBtn({ label, active, count, color = '#eab308', onClick }: { label: string; active: boolean; count?: number; color?: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      padding: '10px 20px', borderRadius: 12,
      border: active ? `1px solid ${color}` : '1px solid rgba(255,255,255,0.1)',
      background: active ? `${color}1a` : 'rgba(255,255,255,0.04)',
      color: active ? '#ffffff' : 'rgba(255,255,255,0.6)',
      fontSize: 13.5, fontWeight: active ? 800 : 600, cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-body)',
      transition: 'all 0.2s ease',
      boxShadow: active ? `0 0 20px ${color}22` : 'none',
    }}>
      {label}
      {count !== undefined && count > 0 && (
        <span style={{ fontSize: 11, background: active ? color : 'rgba(255,255,255,0.15)', color: active ? '#050814' : '#fff', padding: '2px 7px', borderRadius: 999, fontWeight: 800 }}>
          {count}
        </span>
      )}
    </button>
  );
}

// ─── Category Filter Pill ─────────────────────────────────────
function CatPill({ cat, active, onClick }: { cat: CategoryType | 'all'; active: boolean; onClick: () => void }) {
  const color = cat === 'all' ? '#eab308' : CATEGORY_COLORS[cat];
  const icon = cat === 'all' ? '🌐' : CATEGORY_ICONS[cat];
  const label = cat === 'all' ? 'All Categories' : CATEGORY_LABELS[cat];
  return (
    <button onClick={onClick} style={{
      padding: '6px 14px', borderRadius: 99, fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
      border: active ? `1px solid ${color}` : '1px solid rgba(255,255,255,0.12)',
      background: active ? `${color}22` : 'rgba(255,255,255,0.04)',
      color: active ? color : 'rgba(255,255,255,0.6)',
      display: 'flex', alignItems: 'center', gap: 6,
      transition: 'all 0.18s ease',
      fontFamily: 'var(--font-body)',
    }}>
      <span>{icon}</span> {label}
    </button>
  );
}

// ─── RFP Row with bid expansion ──────────────────────────────
function RFPMonitorRow({ rfp }: { rfp: RFP }) {
  const { bids, corporateProfiles, adminDeleteBid } = useStore();
  const [expanded, setExpanded] = useState(false);
  const [editingBid, setEditingBid] = useState<Bid | null>(null);
  const [deletingBid, setDeletingBid] = useState<Bid | null>(null);

  const rfpBids = bids.filter((b) => b.rfpId === rfp.id);
  const corp = corporateProfiles.find((c) => c.id === rfp.corporateId);
  const catColor = CATEGORY_COLORS[rfp.category];
  const catIcon = CATEGORY_ICONS[rfp.category];

  const statusConfig: Record<string, { bg: string; color: string; label: string }> = {
    'open': { bg: 'rgba(16,185,129,0.15)', color: '#10b981', label: 'OPEN' },
    'bid-received': { bg: 'rgba(249,115,22,0.15)', color: '#f97316', label: 'BID RECEIVED' },
    'approved': { bg: 'rgba(14,165,233,0.15)', color: '#0ea5e9', label: 'APPROVED' },
    'closed': { bg: 'rgba(100,116,139,0.15)', color: '#64748b', label: 'CLOSED' },
  };
  const sc = statusConfig[rfp.status] || statusConfig['open'];

  return (
    <>
      <div style={{
        borderRadius: 16, marginBottom: 10,
        background: 'rgba(11,15,23,0.92)',
        border: `1px solid rgba(255,255,255,0.09)`,
        overflow: 'hidden',
        transition: 'border-color 0.2s',
      }}>
        {/* Main Row */}
        <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          {/* Left */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${catColor}1a`, border: `1px solid ${catColor}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
              {catIcon}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                <span style={{ fontSize: 10.5, fontWeight: 800, color: catColor, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{CATEGORY_LABELS[rfp.category]}</span>
                <span style={{ fontSize: 10, padding: '1px 7px', borderRadius: 999, background: sc.bg, color: sc.color, fontWeight: 800 }}>{sc.label}</span>
              </div>
              <div style={{ fontSize: 15.5, fontWeight: 800, color: '#ffffff', marginBottom: 2 }}>{rfp.companyName}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                {formatCurrency(rfp.totalBudget)} · {rfp.universal.persons} pax · {formatDate(rfp.universal.startDate)}
                {corp && <span> · {corp.name}</span>}
              </div>
            </div>
          </div>

          {/* Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              fontSize: 12.5, padding: '5px 12px', borderRadius: 99,
              background: rfpBids.length > 0 ? 'rgba(249,115,22,0.2)' : 'rgba(255,255,255,0.07)',
              color: rfpBids.length > 0 ? '#f97316' : 'rgba(255,255,255,0.5)',
              fontWeight: 800, display: 'flex', alignItems: 'center', gap: 5,
            }}>
              {rfpBids.length > 0 ? <Flame size={12} /> : <Timer size={12} />}
              {rfpBids.length > 0 ? `${rfpBids.length} Bid${rfpBids.length !== 1 ? 's' : ''}` : 'Awaiting Bids'}
            </span>
            {rfpBids.length > 0 && (
              <button onClick={() => setExpanded(!expanded)} style={{
                padding: '6px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.06)', color: '#ffffff', fontSize: 12, fontWeight: 700,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-body)',
              }}>
                {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {expanded ? 'Collapse' : 'View Bids'}
              </button>
            )}
          </div>
        </div>

        {/* Expanded Bids Section */}
        <AnimatePresence>
          {expanded && rfpBids.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ overflow: 'hidden', borderTop: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div style={{ padding: '0 20px 16px' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: 14, marginBottom: 10 }}>
                  {rfpBids.length} Competing Bid{rfpBids.length !== 1 ? 's' : ''}
                </div>
                {rfpBids.map((bid, idx) => {
                  const bidStatusColors: Record<string, string> = { pending: '#eab308', accepted: '#10b981', rejected: '#ef4444' };
                  const lowestBid = Math.min(...rfpBids.map((b) => b.totalPrice));
                  const isLowest = bid.totalPrice === lowestBid;
                  return (
                    <div key={bid.id} style={{
                      borderRadius: 12, padding: '14px 16px', marginBottom: 8,
                      background: 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isLowest ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.07)'}`,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span style={{ fontSize: 14, fontWeight: 800, color: '#ffffff' }}>#{idx + 1} — {bid.vendorCompany}</span>
                            {isLowest && <span style={{ fontSize: 10, padding: '1px 7px', borderRadius: 99, background: 'rgba(16,185,129,0.2)', color: '#10b981', fontWeight: 800 }}>⭐ Lowest Bid</span>}
                            <span style={{ fontSize: 10, padding: '1px 7px', borderRadius: 99, background: 'rgba(255,255,255,0.07)', color: bidStatusColors[bid.status], fontWeight: 700 }}>{bid.status.toUpperCase()}</span>
                          </div>
                          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginBottom: 4 }}>
                            👤 {bid.vendorName} · 📍 {bid.distanceKm} km · 🎯 {bid.matchPercentage}% match · Submitted {formatDate(bid.submittedAt)}
                          </div>
                          {bid.lineItems?.slice(0, 2).map((li, li_i) => (
                            <div key={li_i} style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.45)', marginBottom: 2 }}>
                              • {li.description} — {formatCurrency(li.amount)}
                            </div>
                          ))}
                          {bid.lineItems?.length > 2 && (
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>+{bid.lineItems.length - 2} more line items</div>
                          )}
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 900, color: isLowest ? '#10b981' : '#ffffff', marginBottom: 8 }}>
                            {formatCurrency(bid.totalPrice)}
                          </div>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                            <button onClick={() => setEditingBid(bid)} style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid rgba(14,165,233,0.35)', background: 'rgba(14,165,233,0.12)', color: '#0ea5e9', fontSize: 11.5, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-body)' }}>
                              <Edit2 size={11} /> Edit
                            </button>
                            <button onClick={() => setDeletingBid(bid)} style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: 11.5, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-body)' }}>
                              <Trash2 size={11} /> Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {editingBid && <EditBidModal bid={editingBid} onClose={() => setEditingBid(null)} />}
        {deletingBid && (
          <ConfirmDialog
            title="Remove Bid?"
            message={`Remove the bid from "${deletingBid.vendorCompany}" for ${formatCurrency(deletingBid.totalPrice)}? This cannot be undone.`}
            confirmLabel="Remove Bid"
            onConfirm={() => { adminDeleteBid(deletingBid.id); setDeletingBid(null); }}
            onCancel={() => setDeletingBid(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────
export default function AdminDashboard() {
  const {
    currentUser, users, corporateProfiles, vendorProfiles,
    rfpList, bids,
    adminVerifyVendor, adminVerifyCorporate,
    adminToggleUserSuspension, adminDeleteUser,
    adminDeleteVendorProfile, adminUpdateUser,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'monitor' | 'corporate' | 'vendors' | 'analytics'>('monitor');
  const [categoryFilter, setCategoryFilter] = useState<CategoryType | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'user' | 'vendor-profile'; id: string; label: string } | null>(null);

  // ── Metrics ──
  const pendingVendors = vendorProfiles.filter((v) => v.status === 'pending').length;
  const verifiedVendors = vendorProfiles.filter((v) => v.status === 'approved').length;
  const pendingCorporate = corporateProfiles.filter((c) => c.status === 'pending').length;
  const verifiedCorporate = corporateProfiles.filter((c) => c.status === 'approved').length;
  const totalPending = pendingVendors + pendingCorporate;
  const totalGMV = rfpList.reduce((a, r) => a + (r.totalBudget || 0), 0);
  const awardedContracts = bids.filter((b) => b.status === 'accepted').length;

  // ── Filtered RFPs for Monitor ──
  const monitorRFPs = useMemo(() => {
    const active = rfpList.filter((r) => r.status !== 'closed');
    if (categoryFilter === 'all') return active;
    return active.filter((r) => r.category === categoryFilter);
  }, [rfpList, categoryFilter]);

  // ── Filtered for Corporate Tab ──
  const filteredCorporateUsers = useMemo(() => {
    return users.filter((u) => u.role === 'corporate').filter((u) =>
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (corporateProfiles.find((c) => c.userId === u.id)?.officeCompanyName || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, corporateProfiles, searchTerm]);

  // ── Filtered for Vendor Tab ──
  const filteredVendors = useMemo(() => {
    return vendorProfiles.filter((v) =>
      v.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.gstNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [vendorProfiles, searchTerm]);

  const rowStyle = (highlighted?: boolean, highlightColor = '#eab308'): React.CSSProperties => ({
    borderRadius: 16, padding: '18px 20px', marginBottom: 12,
    background: highlighted ? `${highlightColor}08` : 'rgba(11,15,23,0.92)',
    border: `1px solid ${highlighted ? `${highlightColor}35` : 'rgba(255,255,255,0.09)'}`,
  });

  const btnStyle = (color: string, outline = false): React.CSSProperties => ({
    padding: '7px 14px', borderRadius: 9, cursor: 'pointer', fontSize: 12.5, fontWeight: 700,
    fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 5,
    border: `1px solid ${color}55`,
    background: outline ? 'transparent' : `${color}1a`,
    color,
    transition: 'background 0.15s',
  });

  const CATEGORY_RFPS_COUNT = useMemo(() => {
    const map: Record<string, number> = {};
    ALL_CATEGORIES.forEach((c) => { map[c] = rfpList.filter((r) => r.category === c).length; });
    return map;
  }, [rfpList]);

  return (
    <main style={{ minHeight: '100vh', paddingTop: 88, paddingBottom: 60, position: 'relative', background: '#080B14' }}>
      <BlurredCyberHubBackground />

      <div style={{ maxWidth: 1220, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 10 }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg, #eab308, #ca8a04)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#050814', boxShadow: '0 8px 24px rgba(234,179,8,0.35)' }}>
              <Shield size={26} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 900, color: '#ffffff', lineHeight: 1, letterSpacing: '-0.02em' }}>Admin Control Center</h1>
                <Link
                  href="/"
                  style={{
                    padding: '4px 10px',
                    borderRadius: 8,
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: 12,
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                  title="Return to Main Marketplace Homepage"
                >
                  <span>🏠</span>
                  <span>Home</span>
                </Link>
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>Platform governance · KYC verification · Bid management</div>
            </div>
          </div>
          {totalPending > 0 && (
            <motion.div
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              style={{ padding: '9px 18px', borderRadius: 14, background: 'rgba(234,179,8,0.12)', border: '1.5px solid rgba(234,179,8,0.4)', color: '#eab308', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 7 }}
            >
              <AlertTriangle size={15} /> {totalPending} Pending Verification{totalPending !== 1 ? 's' : ''} — {pendingCorporate} Corp · {pendingVendors} Vendor
            </motion.div>
          )}
        </div>

        {/* ── Stats Grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))', gap: 14, marginBottom: 28 }}>
          <StatCard icon={<Building2 size={22} />} label="Verified Corporates" value={verifiedCorporate} sub={pendingCorporate > 0 ? `${pendingCorporate} Pending Approval` : undefined} color="#10b981" />
          <StatCard icon={<Store size={22} />} label="Verified Vendors" value={verifiedVendors} sub={pendingVendors > 0 ? `${pendingVendors} Pending KYC` : undefined} color="#f97316" />
          <StatCard icon={<Activity size={22} />} label="Live RFPs" value={rfpList.filter((r) => r.status !== 'closed').length} color="#0ea5e9" />
          <StatCard icon={<CheckCircle2 size={22} />} label="Contracts Awarded" value={awardedContracts} color="#10b981" />
          <StatCard icon={<Flame size={22} />} label="Total Bids" value={bids.length} color="#f97316" />
          <StatCard icon={<DollarSign size={22} />} label="Platform GMV" value={formatCurrency(totalGMV)} color="#eab308" />
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          <TabBtn label="📡 Live Monitor" active={activeTab === 'monitor'} onClick={() => setActiveTab('monitor')} />
          <TabBtn label="🏢 Corporates" active={activeTab === 'corporate'} count={pendingCorporate} color="#10b981" onClick={() => setActiveTab('corporate')} />
          <TabBtn label="🛡️ Vendor KYC" active={activeTab === 'vendors'} count={pendingVendors} color="#f97316" onClick={() => setActiveTab('vendors')} />
          <TabBtn label="📊 Analytics" active={activeTab === 'analytics'} color="#0ea5e9" onClick={() => setActiveTab('analytics')} />
        </div>

        {/* ── Search Bar (non-monitor, non-analytics tabs) ── */}
        {(activeTab === 'corporate' || activeTab === 'vendors') && (
          <div style={{ position: 'relative', marginBottom: 20 }}>
            <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
            <input
              className="input-base"
              placeholder={activeTab === 'vendors' ? 'Search vendor, company, or GST number…' : 'Search by email or company name…'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: 40 }}
            />
          </div>
        )}

        {/* ══════════════════════════════════════════════════ */}
        {/* TAB 1: LIVE MONITOR                                */}
        {/* ══════════════════════════════════════════════════ */}
        {activeTab === 'monitor' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: '#ffffff' }}>
                Live Reverse-Auction Feed
                <span style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.45)', marginLeft: 10 }}>
                  {monitorRFPs.length} RFP{monitorRFPs.length !== 1 ? 's' : ''}
                </span>
              </h2>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>
                Click "View Bids" to expand bids · Edit or remove individual bids
              </div>
            </div>

            {/* Category Filter Pills */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              <CatPill cat="all" active={categoryFilter === 'all'} onClick={() => setCategoryFilter('all')} />
              {ALL_CATEGORIES.map((cat) => (
                <CatPill key={cat} cat={cat} active={categoryFilter === cat} onClick={() => setCategoryFilter(cat)} />
              ))}
            </div>

            {monitorRFPs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.35)', fontSize: 14 }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>
                  {categoryFilter !== 'all' ? CATEGORY_ICONS[categoryFilter] : '📡'}
                </div>
                No active RFPs {categoryFilter !== 'all' ? `in ${CATEGORY_LABELS[categoryFilter]}` : ''} right now.
              </div>
            ) : (
              monitorRFPs.map((rfp) => <RFPMonitorRow key={rfp.id} rfp={rfp} />)
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════ */}
        {/* TAB 2: CORPORATE ACCOUNTS                         */}
        {/* ══════════════════════════════════════════════════ */}
        {activeTab === 'corporate' && (
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: '#ffffff', marginBottom: 20 }}>
              Corporate Accounts & Verification Queue
              <span style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.45)', marginLeft: 10 }}>({filteredCorporateUsers.length})</span>
            </h2>

            {filteredCorporateUsers.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.4)' }}>No corporate accounts found.</div>
            )}

            {filteredCorporateUsers.map((user) => {
              const profile = corporateProfiles.find((c) => c.userId === user.id);
              const myRFPs = rfpList.filter((r) => r.corporateUserId === user.id);
              const myBids = bids.filter((b) => myRFPs.some((r) => r.id === b.rfpId));
              const corpStatus = profile?.status || 'pending';
              const statusColors: Record<string, string> = { approved: '#10b981', pending: '#eab308', rejected: '#ef4444' };
              const statusBg: Record<string, string> = { approved: 'rgba(16,185,129,0.15)', pending: 'rgba(234,179,8,0.15)', rejected: 'rgba(239,68,68,0.15)' };

              return (
                <div key={user.id} style={{ ...rowStyle(user.isSuspended, '#ef4444'), display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Row Top */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', flexShrink: 0 }}>
                        <Building2 size={22} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 16, fontWeight: 800, color: '#ffffff' }}>{profile?.officeCompanyName || user.email}</span>
                          <span style={{ fontSize: 10.5, padding: '2px 8px', borderRadius: 999, background: statusBg[corpStatus], color: statusColors[corpStatus], fontWeight: 800 }}>{corpStatus.toUpperCase()}</span>
                          {user.isSuspended && <span style={{ fontSize: 10.5, padding: '2px 8px', borderRadius: 999, background: 'rgba(239,68,68,0.15)', color: '#ef4444', fontWeight: 800 }}>SUSPENDED</span>}
                          {profile?.cinNumber && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 999, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>CIN: {profile.cinNumber}</span>}
                        </div>
                        <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.55)' }}>
                          👤 {profile?.name || '—'} · ✉️ {user.email} · 🏢 {profile?.position} · {profile?.city}
                        </div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 3 }}>
                          📋 {myRFPs.length} RFPs · 🔥 {myBids.length} Bids Received · 👥 {profile?.teamSize || '—'} · 💰 {profile?.annualProcurementBudget || '—'}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flexShrink: 0 }}>
                      {profile && corpStatus !== 'approved' && (
                        <button onClick={() => adminVerifyCorporate(profile.id, 'approved')} style={btnStyle('#10b981')}>
                          <CheckCircle size={13} /> Approve
                        </button>
                      )}
                      {profile && corpStatus === 'approved' && (
                        <button onClick={() => adminVerifyCorporate(profile.id, 'pending')} style={btnStyle('#64748b')}>
                          <Clock size={13} /> Revoke
                        </button>
                      )}
                      {profile && corpStatus !== 'rejected' && (
                        <button onClick={() => adminVerifyCorporate(profile.id, 'rejected')} style={btnStyle('#f97316')}>
                          <XCircle size={13} /> Reject
                        </button>
                      )}
                      <button onClick={() => setEditingUser(user)} style={btnStyle('#eab308')}>
                        <Edit2 size={12} /> Edit
                      </button>
                      <button onClick={() => adminToggleUserSuspension(user.id)} style={btnStyle(user.isSuspended ? '#10b981' : '#f97316')}>
                        <Lock size={12} /> {user.isSuspended ? 'Reactivate' : 'Suspend'}
                      </button>
                      <button onClick={() => setConfirmDelete({ type: 'user', id: user.id, label: user.email })} style={btnStyle('#ef4444')}>
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>

                  {/* Detail Footer */}
                  {profile && (
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12, color: 'rgba(255,255,255,0.5)', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
                      <span>📍 {profile.officeAddress}</span>
                      {profile.submittedAt && <span>· 🕒 Submitted {formatDate(profile.submittedAt)}</span>}
                      {profile.verifiedAt && <span style={{ color: '#10b981' }}>· ✔ Verified {formatDate(profile.verifiedAt)}</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ══════════════════════════════════════════════════ */}
        {/* TAB 3: VENDOR KYC                                 */}
        {/* ══════════════════════════════════════════════════ */}
        {activeTab === 'vendors' && (
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: '#ffffff', marginBottom: 20 }}>
              Vendor KYC & Verification Queue
              <span style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.45)', marginLeft: 10 }}>({filteredVendors.length})</span>
            </h2>

            {filteredVendors.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.4)' }}>No vendors found.</div>
            )}

            {filteredVendors.map((vendor) => {
              const vendorUser = users.find((u) => u.id === vendor.userId);
              const vendorBids = bids.filter((b) => b.vendorId === vendor.id);
              const catColor = CATEGORY_COLORS[vendor.category];
              const statusColors: Record<string, string> = { approved: '#10b981', pending: '#eab308', rejected: '#ef4444' };
              const statusBg: Record<string, string> = { approved: 'rgba(16,185,129,0.15)', pending: 'rgba(234,179,8,0.15)', rejected: 'rgba(239,68,68,0.15)' };

              return (
                <div key={vendor.id} style={{ ...rowStyle(vendor.status === 'pending', '#eab308'), display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 14, background: `${catColor}1a`, border: `1px solid ${catColor}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                        {CATEGORY_ICONS[vendor.category]}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 16, fontWeight: 800, color: '#ffffff' }}>{vendor.companyName}</span>
                          <span style={{ fontSize: 10.5, padding: '2px 8px', borderRadius: 999, background: statusBg[vendor.status], color: statusColors[vendor.status], fontWeight: 800 }}>{vendor.status.toUpperCase()}</span>
                          <span style={{ fontSize: 10.5, padding: '2px 8px', borderRadius: 999, background: `${catColor}1a`, color: catColor, fontWeight: 700 }}>{CATEGORY_LABELS[vendor.category]}</span>
                          {vendor.entityType && <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 999, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}>{vendor.entityType}</span>}
                          {vendor.gstVerified && <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 999, background: 'rgba(16,185,129,0.12)', color: '#10b981', fontWeight: 700 }}>✔ GST Verified</span>}
                        </div>
                        <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.55)' }}>
                          👤 {vendor.vendorName} · ✉️ {vendorUser?.email || '—'} · 📞 {vendor.mobile}
                        </div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 3 }}>
                          🧾 GSTIN: <strong style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace' }}>{vendor.gstNumber}</strong>
                          {vendor.panNumber && <> · PAN: <strong style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace' }}>{vendor.panNumber}</strong></>}
                          · 📍 {vendor.city} (~{vendor.distanceKm} km) · 🔥 {vendorBids.length} Bids Placed
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flexShrink: 0 }}>
                      {vendor.status !== 'approved' && (
                        <button onClick={() => adminVerifyVendor(vendor.id, 'approved')} style={btnStyle('#10b981')}>
                          <CheckCircle size={13} /> Approve & Activate
                        </button>
                      )}
                      {vendor.status === 'approved' && (
                        <button onClick={() => adminVerifyVendor(vendor.id, 'pending')} style={btnStyle('#64748b')}>
                          <Clock size={13} /> Revoke Approval
                        </button>
                      )}
                      {vendor.status !== 'rejected' && (
                        <button onClick={() => adminVerifyVendor(vendor.id, 'rejected')} style={btnStyle('#f97316')}>
                          <XCircle size={13} /> Reject KYC
                        </button>
                      )}
                      {vendorUser && (
                        <button onClick={() => setEditingUser(vendorUser)} style={btnStyle('#eab308')}>
                          <Edit2 size={12} /> Edit User
                        </button>
                      )}
                      {vendorUser && (
                        <button onClick={() => adminToggleUserSuspension(vendorUser.id)} style={btnStyle(vendorUser.isSuspended ? '#10b981' : '#f97316')}>
                          <Lock size={12} /> {vendorUser.isSuspended ? 'Reactivate' : 'Suspend'}
                        </button>
                      )}
                      <button onClick={() => setConfirmDelete({ type: 'vendor-profile', id: vendor.id, label: vendor.companyName })} style={btnStyle('#ef4444')}>
                        <Trash2 size={12} /> Delete Profile
                      </button>
                    </div>
                  </div>

                  {/* Footer */}
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
                    {vendor.portfolioSummary && (
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 8, fontStyle: 'italic' }}>📝 {vendor.portfolioSummary}</div>
                    )}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Past Clients:</span>
                      {vendor.pastClients?.map((c) => (
                        <span key={c} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: `${catColor}12`, color: catColor, fontWeight: 600 }}>{c}</span>
                      ))}
                      {vendor.submittedAt && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginLeft: 'auto' }}>Submitted {formatDate(vendor.submittedAt)}</span>}
                      {vendor.verifiedAt && <span style={{ fontSize: 11, color: '#10b981' }}>· KYC Verified {formatDate(vendor.verifiedAt)}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ══════════════════════════════════════════════════ */}
        {/* TAB 4: ANALYTICS                                  */}
        {/* ══════════════════════════════════════════════════ */}
        {activeTab === 'analytics' && (
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: '#ffffff', marginBottom: 24 }}>Platform Analytics</h2>

            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 22 }}>
              {[
                { label: 'Avg Bids per RFP', value: rfpList.length > 0 ? (bids.length / rfpList.length).toFixed(1) : '0', color: '#0ea5e9', icon: '📊' },
                { label: 'Corporate Users', value: users.filter((u) => u.role === 'corporate').length, color: '#10b981', icon: '🏢' },
                { label: 'Vendor Partners', value: users.filter((u) => u.role === 'vendor').length, color: '#f97316', icon: '🛍️' },
                { label: 'Conversion Rate', value: rfpList.length > 0 ? `${Math.round((awardedContracts / rfpList.length) * 100)}%` : '0%', color: '#eab308', icon: '🎯' },
                { label: 'Open RFPs', value: rfpList.filter((r) => r.status === 'open').length, color: '#10b981', icon: '📋' },
                { label: 'Bid-Received RFPs', value: rfpList.filter((r) => r.status === 'bid-received').length, color: '#f97316', icon: '🔥' },
              ].map(({ label, value, color, icon }) => (
                <div key={label} style={{ borderRadius: 16, padding: '18px', background: 'rgba(11,15,23,0.92)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 900, color, marginBottom: 4, letterSpacing: '-0.02em' }}>{value}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>{label}</div>
                </div>
              ))}
            </div>

            {/* RFPs by Category */}
            <div style={{ borderRadius: 20, padding: '24px', background: 'rgba(11,15,23,0.92)', border: '1px solid rgba(255,255,255,0.09)', marginBottom: 18 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: '#ffffff', marginBottom: 20 }}>RFPs by Category</h3>
              {ALL_CATEGORIES.map((cat) => {
                const count = rfpList.filter((r) => r.category === cat).length;
                const pct = rfpList.length > 0 ? Math.round((count / rfpList.length) * 100) : 0;
                const catBids = bids.filter((b) => b.category === cat).length;
                const col = CATEGORY_COLORS[cat];
                return (
                  <div key={cat} style={{ marginBottom: 18 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>{CATEGORY_ICONS[cat]}</span>
                        <span style={{ fontSize: 13.5, fontWeight: 700, color: '#ffffff' }}>{CATEGORY_LABELS[cat]}</span>
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{catBids} bids</span>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 800, color: col }}>{count} RFPs &nbsp;{pct}%</span>
                    </div>
                    <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
                        style={{ height: '100%', background: `linear-gradient(90deg, ${col}, ${col}88)`, borderRadius: 4 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Vendor Distribution by Category */}
            <div style={{ borderRadius: 20, padding: '24px', background: 'rgba(11,15,23,0.92)', border: '1px solid rgba(255,255,255,0.09)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: '#ffffff', marginBottom: 20 }}>Vendor Distribution by Category</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
                {ALL_CATEGORIES.map((cat) => {
                  const count = vendorProfiles.filter((v) => v.category === cat).length;
                  const approved = vendorProfiles.filter((v) => v.category === cat && v.status === 'approved').length;
                  const col = CATEGORY_COLORS[cat];
                  return (
                    <div key={cat} style={{ borderRadius: 14, padding: '16px', background: `${col}0a`, border: `1px solid ${col}25`, textAlign: 'center' }}>
                      <div style={{ fontSize: 28, marginBottom: 8 }}>{CATEGORY_ICONS[cat]}</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 900, color: col, marginBottom: 2 }}>{count}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>{CATEGORY_LABELS[cat]}</div>
                      <div style={{ fontSize: 11, color: '#10b981', marginTop: 4 }}>{approved} verified</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ── Global Modals ── */}
      <AnimatePresence>
        {editingUser && <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} />}
        {confirmDelete && (
          <ConfirmDialog
            title={confirmDelete.type === 'user' ? 'Delete User Account?' : 'Delete Vendor Profile?'}
            message={
              confirmDelete.type === 'user'
                ? `This permanently deletes "${confirmDelete.label}" and all associated data (RFPs, bids, profiles). Cannot be undone.`
                : `This removes the vendor profile for "${confirmDelete.label}". The user account will remain active but unlinked.`
            }
            confirmLabel={confirmDelete.type === 'user' ? 'Delete User & All Data' : 'Delete Vendor Profile'}
            onConfirm={() => {
              if (confirmDelete.type === 'user') adminDeleteUser(confirmDelete.id);
              else adminDeleteVendorProfile(confirmDelete.id);
              setConfirmDelete(null);
            }}
            onCancel={() => setConfirmDelete(null)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
