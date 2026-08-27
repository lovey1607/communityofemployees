'use client';
// ============================================================
// components/modal/steps/Step3Confirm.tsx
// Review summary + auth & verification gating + live submission
// ============================================================

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle, Sparkles, ArrowRight, Clock, Calendar,
  Users, DollarSign, Lock, AlertTriangle, ShieldCheck, UserCheck
} from 'lucide-react';
import { CategoryType, CategoryDetails, UniversalFields } from '@/lib/types';
import { CATEGORY_LABELS } from '@/lib/themes';
import { useStore } from '@/store/useStore';
import { formatCurrency, formatDate } from '@/lib/utils';

function ConfettiPiece({ color, delay }: { color: string; delay: number }) {
  const startX = Math.random() * 100;
  const endX = startX + (Math.random() - 0.5) * 40;
  return (
    <motion.div
      initial={{ y: -20, x: `${startX}vw`, opacity: 1, rotate: 0, scale: 1 }}
      animate={{ y: '100vh', x: `${endX}vw`, opacity: 0, rotate: 720, scale: 0.3 }}
      transition={{ duration: 2.5, delay, ease: 'easeIn' }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 8,
        height: 16,
        borderRadius: 2,
        background: color,
        zIndex: 200,
        pointerEvents: 'none',
      }}
    />
  );
}

export function Step3Confirm({
  category,
  categoryDetails,
  universal,
  onSubmit,
  submitted,
  onClose,
}: {
  category: CategoryType;
  categoryDetails: Partial<CategoryDetails>;
  universal: Partial<UniversalFields>;
  onSubmit: () => void;
  submitted: boolean;
  onClose: () => void;
}) {
  const { theme, currentUser, currentCorporateProfile } = useStore();
  const router = useRouter();
  const [confetti, setConfetti] = useState<{ color: string; delay: number }[]>([]);

  const isCorporate = currentUser?.role === 'corporate';
  const isApproved = isCorporate && currentCorporateProfile?.status === 'approved';
  const isPending = isCorporate && currentCorporateProfile?.status !== 'approved';

  useEffect(() => {
    if (submitted) {
      const colors = [theme.primary, theme.accent, '#ffffff', '#fbbf24', '#f472b6', '#38bdf8'];
      setConfetti(
        Array.from({ length: 50 }, (_, i) => ({
          color: colors[i % colors.length],
          delay: i * 0.04,
        }))
      );
    }
  }, [submitted, theme]);

  if (submitted) {
    return (
      <>
        {/* Confetti */}
        {confetti.map((c, i) => (
          <ConfettiPiece key={i} color={c.color} delay={c.delay} />
        ))}

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          style={{ textAlign: 'center', padding: '36px 0' }}
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.15, 1] }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ fontSize: 64, marginBottom: 16 }}
          >
            🎉
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: `${theme.primary}20`,
                border: `1px solid ${theme.primary}44`,
                borderRadius: 999,
                padding: '6px 16px',
                marginBottom: 16,
              }}
            >
              <CheckCircle size={14} color={theme.primary} />
              <span style={{ fontSize: 12, color: theme.primary, fontWeight: 700 }}>
                RFP Published to Verified Vendors
              </span>
            </div>

            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 24,
                fontWeight: 800,
                color: 'white',
                marginBottom: 10,
              }}
            >
              Requirements Live in Vendor Pool!
            </h3>

            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, maxWidth: 420, margin: '0 auto 28px', lineHeight: 1.6 }}>
              Top vendors matching your timing ({universal.timeSlot || 'Flexible'}) and budget are submitting itemized bids.
              Track and approve incoming bids on your Corporate Dashboard.
            </p>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={onClose} className="btn-ghost">
                Close
              </button>
              <button
                onClick={() => {
                  onClose();
                  router.push('/corporate/dashboard');
                }}
                className="btn-primary"
                style={{ background: theme.primary }}
              >
                View Live RFPs on Dashboard
                <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        </motion.div>
      </>
    );
  }

  // ─── Category Details Summary ──────────────────────────────
  const summary = Object.entries(categoryDetails).map(([key, val]) => {
    if (Array.isArray(val)) return { key, val: val.join(', ') || '—' };
    if (typeof val === 'boolean') return { key, val: val ? 'Yes' : 'No' };
    return { key, val: String(val || '—') };
  });

  const camelToTitle = (s: string) =>
    s.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());

  return (
    <div>
      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 18 }}>
        Review your complete event requirements and timing details before publishing to vendors.
      </p>

      {/* Category badge */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: `${theme.primary}18`,
          border: `1px solid ${theme.primary}44`,
          borderRadius: 999,
          padding: '5px 14px',
          marginBottom: 14,
        }}
      >
        <span style={{ fontSize: 12, color: theme.primary, fontWeight: 700 }}>
          {CATEGORY_LABELS[category]}
        </span>
      </div>

      {/* Category specifications */}
      <div
        style={{
          background: 'rgba(255,255,255,0.035)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12,
          padding: '14px 16px',
          marginBottom: 14,
        }}
      >
        {summary.map(({ key, val }) => (
          <div
            key={key}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '6px 0',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              gap: 16,
            }}
          >
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', flexShrink: 0 }}>
              {camelToTitle(key)}
            </span>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', textAlign: 'right', fontWeight: 500 }}>
              {val || '—'}
            </span>
          </div>
        ))}
      </div>

      {/* Universal & Time Period Summary */}
      <div
        style={{
          background: `linear-gradient(135deg, ${theme.primary}12 0%, rgba(255,255,255,0.02) 100%)`,
          border: `1px solid ${theme.primary}28`,
          borderRadius: 14,
          padding: '16px',
          marginBottom: 20,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 12,
        }}
      >
        {[
          ['Dates', `${formatDate(universal.startDate || '')} – ${formatDate(universal.endDate || '')}`],
          ['Time Slot', universal.timeSlot || 'Standard Corporate Hours'],
          ['Schedule Flexibility', universal.timeFlexibility || 'Flexible buffer'],
          ['Timeline Urgency', universal.urgency || 'Planned month'],
          ['Team Size', `${universal.persons || 0} Persons`],
          ['Budget / Person', formatCurrency(universal.budgetPerPerson || 0)],
          ['Total Outlay', formatCurrency((universal.persons || 0) * (universal.budgetPerPerson || 0))],
        ].map(([label, val]) => (
          <div key={label} style={{ padding: '4px 0' }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#ffffff' }}>{val}</div>
          </div>
        ))}
      </div>

      {/* ── Auth State Guidance Banner ── */}
      {!currentUser && (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: 14,
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Lock size={18} color="#ef4444" />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>
                Corporate Registration Required
              </div>
              <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.6)' }}>
                Please sign in or register as a Corporate to publish this RFP.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              const btn = document.getElementById('public-nav-corporate-login-btn');
              if (btn) btn.click();
            }}
            className="btn-primary"
            style={{
              padding: '6px 14px',
              fontSize: 12,
              background: '#10b981',
              flexShrink: 0,
            }}
          >
            Sign In / Register
          </button>
        </div>
      )}

      {currentUser && currentUser.role === 'vendor' && (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: 14,
            background: 'rgba(249,115,22,0.1)',
            border: '1px solid rgba(249,115,22,0.3)',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <AlertTriangle size={18} color="#f97316" />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>
              Vendor Account Active
            </div>
            <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.6)' }}>
              You are logged in as a Vendor ({currentUser.email}). RFPs can only be posted by verified Corporate accounts.
            </div>
          </div>
        </div>
      )}

      {isPending && (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: 14,
            background: 'rgba(234,179,8,0.1)',
            border: '1px solid rgba(234,179,8,0.3)',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <Clock size={18} color="#eab308" />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>
              Corporate Verification Pending
            </div>
            <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.6)' }}>
              Your profile for <strong>{currentCorporateProfile?.officeCompanyName}</strong> is awaiting review by the COE Admin team. You can publish RFPs once approved.
            </div>
          </div>
        </div>
      )}

      {isApproved && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 12,
            background: 'rgba(16,185,129,0.08)',
            border: '1px solid rgba(16,185,129,0.25)',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <ShieldCheck size={16} color="#10b981" />
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
            Publishing as: <strong style={{ color: '#10b981' }}>{currentCorporateProfile?.officeCompanyName}</strong> ({currentCorporateProfile?.name})
          </div>
        </div>
      )}

      <button
        onClick={onSubmit}
        disabled={!isApproved}
        className="btn-primary"
        style={{
          background: isApproved ? theme.primary : 'rgba(255,255,255,0.12)',
          color: isApproved ? '#ffffff' : 'rgba(255,255,255,0.4)',
          cursor: isApproved ? 'pointer' : 'not-allowed',
          width: '100%',
          padding: '14px',
          fontSize: 15,
          boxShadow: isApproved ? `0 0 20px ${theme.primary}50` : 'none',
        }}
      >
        {isApproved ? (
          <>
            <Sparkles size={18} />
            Publish RFP to Vendor Pool
          </>
        ) : !currentUser ? (
          <>
            <Lock size={16} />
            Sign in as Corporate to Publish
          </>
        ) : isPending ? (
          <>
            <Clock size={16} />
            Verification Pending — Cannot Publish Yet
          </>
        ) : (
          <>
            <AlertTriangle size={16} />
            Corporate Account Required
          </>
        )}
      </button>
    </div>
  );
}
