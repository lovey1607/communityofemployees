'use client';
// ============================================================
// components/auth/AuthModal.tsx
// Sign in · Create account · Forgot password.
//
// Rewritten against the real backend. What went: the simulated OTP (a code
// the browser generated and then checked against itself) and the venue
// picker that filled in a shared demo login. Both were props for a
// prototype and neither authenticates anything.
// ============================================================

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { CategoryType } from '@/lib/types';
import { checkWorkEmail } from '@/lib/emailDomains';
import {
  Mail, KeyRound, Building2, Store, ArrowRight, X, Lock, Info, CheckCircle2, AlertTriangle,
} from 'lucide-react';

type Mode = 'signin' | 'signup' | 'forgot';
type SignupRole = 'corporate' | 'vendor';

const CATEGORIES: { value: CategoryType; label: string }[] = [
  { value: 'sports', label: 'Sports & tournaments' },
  { value: 'food', label: 'Food, parties & venues' },
  { value: 'trips', label: 'Trips & offsites' },
  { value: 'gifts', label: 'Gifting & hampers' },
  { value: 'dress', label: 'Merchandise & apparel' },
];

export function AuthModal() {
  const router = useRouter();
  const {
    authModalOpen,
    closeAuthModal,
    loginWithPassword,
    registerUser,
    requestPasswordReset,
  } = useStore();

  const [mode, setMode] = useState<Mode>('signin');
  const [role, setRole] = useState<SignupRole>('corporate');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);

  // Vendor signup extras
  const [companyName, setCompanyName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [category, setCategory] = useState<CategoryType>('food');
  const [serviceArea, setServiceArea] = useState('Gurugram');

  const emailPolicy = useMemo(
    () => (email.includes('@') ? checkWorkEmail(email) : null),
    [email]
  );
  const showWorkEmailHint = mode === 'signup' && role === 'corporate' && emailPolicy?.ok === false;

  if (!authModalOpen) return null;

  const resetNotice = () => setNotice(null);

  const routeForRole = (userRole?: string) => {
    if (userRole === 'corporate') return '/corporate/dashboard';
    if (userRole === 'vendor') return '/vendor/dashboard';
    if (userRole === 'admin') return '/admin/dashboard';
    return '/';
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    resetNotice();
    setLoading(true);
    const result = await loginWithPassword(email, password);
    setLoading(false);
    if (!result.success) {
      setNotice({ tone: 'error', text: result.message });
      return;
    }
    closeAuthModal();
    router.push(routeForRole(useStore.getState().currentUser?.role));
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    resetNotice();
    setLoading(true);
    const result =
      role === 'corporate'
        ? await registerUser({ role: 'corporate', email, password })
        : await registerUser({
            role: 'vendor',
            email,
            password,
            companyName,
            gstNumber,
            category,
            serviceAreas: serviceArea
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean),
          });
    setLoading(false);
    setNotice({ tone: result.success ? 'ok' : 'error', text: result.message });
    if (result.success) setPassword('');
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    resetNotice();
    setLoading(true);
    const result = await requestPasswordReset(email);
    setLoading(false);
    setNotice({ tone: 'ok', text: result.message });
  };

  // ─── Shared styles ─────────────────────────────────────────
  const text = 'var(--ink)';
  const muted = 'var(--muted)';
  const fieldStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 11,
    border: '1px solid var(--line)',
    background: 'var(--paper)',
    color: text,
    fontSize: 14,
    outline: 'none',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: muted,
    marginBottom: 6,
  };
  const fieldWrap: React.CSSProperties = { marginBottom: 14 };

  const tab = (value: Mode, label: string) => (
    <button
      key={value}
      type="button"
      onClick={() => {
        setMode(value);
        resetNotice();
      }}
      style={{
        flex: 1,
        padding: '9px 10px',
        borderRadius: 9,
        border: 'none',
        cursor: 'pointer',
        fontSize: 13,
        fontWeight: 600,
        color: mode === value ? '#FFFFFF' : muted,
        background: mode === value ? 'var(--saffron)' : 'transparent',
        transition: 'all .18s ease',
      }}
    >
      {label}
    </button>
  );

  return (
    <div className="modal-overlay" onClick={closeAuthModal}>
      <motion.div
        initial={{ scale: 0.93, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 520,
          background: 'var(--paper)',
          border: '1px solid var(--line)',
          borderRadius: 24,
          padding: 28,
          boxShadow: '0 32px 90px rgba(60, 30, 0, 0.18)',
          position: 'relative',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <button
          onClick={closeAuthModal}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: 18,
            right: 18,
            background: 'transparent',
            border: 'none',
            color: muted,
            cursor: 'pointer',
            padding: 4,
          }}
        >
          <X size={18} />
        </button>

        <p style={{ margin: '0 0 4px', fontSize: 11, letterSpacing: '.16em', color: 'var(--saffron)', textTransform: 'uppercase' }}>
          Community of Employees
        </p>
        <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: text }}>
          {mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create your account' : 'Reset your password'}
        </h2>
        <p style={{ margin: '0 0 20px', fontSize: 13, color: muted, lineHeight: 1.55 }}>
          {mode === 'signin'
            ? 'Currently live in Gurgaon.'
            : mode === 'signup'
              ? 'Confirm your email, then an admin reviews your account before it goes live.'
              : "We'll email you a link to set a new password."}
        </p>

        <div
          style={{
            display: 'flex',
            gap: 4,
            padding: 4,
            borderRadius: 12,
            background: 'var(--cream-2)',
            marginBottom: 20,
          }}
        >
          {tab('signin', 'Sign in')}
          {tab('signup', 'Create account')}
          {tab('forgot', 'Forgot')}
        </div>

        {notice && (
          <div
            style={{
              display: 'flex',
              gap: 9,
              alignItems: 'flex-start',
              padding: '11px 13px',
              borderRadius: 11,
              marginBottom: 16,
              fontSize: 13,
              lineHeight: 1.5,
              color: notice.tone === 'ok' ? '#137A43' : '#B3261E',
              background: notice.tone === 'ok' ? 'rgba(30, 158, 90, 0.10)' : 'rgba(194, 50, 28, 0.09)',
              border: `1px solid ${notice.tone === 'ok' ? 'rgba(30, 158, 90, 0.3)' : 'rgba(194, 50, 28, 0.28)'}`,
            }}
          >
            {notice.tone === 'ok' ? <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: 1 }} /> : <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />}
            <span>{notice.text}</span>
          </div>
        )}

        <form onSubmit={mode === 'signin' ? handleSignIn : mode === 'signup' ? handleSignUp : handleForgot}>
          {mode === 'signup' && (
            <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
              {(
                [
                  { value: 'corporate' as const, label: 'I work at a company', Icon: Building2 },
                  { value: 'vendor' as const, label: 'I supply services', Icon: Store },
                ]
              ).map(({ value, label, Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRole(value)}
                  style={{
                    flex: 1,
                    padding: '13px 12px',
                    borderRadius: 12,
                    cursor: 'pointer',
                    textAlign: 'left',
                    border: role === value ? '1px solid var(--saffron)' : '1px solid var(--line)',
                    background: role === value ? 'rgba(255, 107, 44,0.10)' : 'transparent',
                    color: text,
                  }}
                >
                  <Icon size={17} color={role === value ? '#FF6B2C' : muted} />
                  <span style={{ display: 'block', marginTop: 7, fontSize: 13, fontWeight: 600 }}>{label}</span>
                </button>
              ))}
            </div>
          )}

          <div style={fieldWrap}>
            <label style={labelStyle} htmlFor="auth-email">
              {mode === 'signup' && role === 'corporate' ? 'Work email' : 'Email'}
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} style={{ position: 'absolute', left: 13, top: 14, color: muted }} />
              <input
                id="auth-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={mode === 'signup' && role === 'corporate' ? 'you@yourcompany.com' : 'you@example.com'}
                style={{ ...fieldStyle, paddingLeft: 36 }}
              />
            </div>
            {showWorkEmailHint && (
              <p style={{ margin: '7px 0 0', fontSize: 12, color: '#A66A00', display: 'flex', gap: 6 }}>
                <Info size={13} style={{ flexShrink: 0, marginTop: 1 }} />
                {emailPolicy?.message}
              </p>
            )}
          </div>

          {mode !== 'forgot' && (
            <div style={fieldWrap}>
              <label style={labelStyle} htmlFor="auth-password">Password</label>
              <div style={{ position: 'relative' }}>
                <KeyRound size={15} style={{ position: 'absolute', left: 13, top: 14, color: muted }} />
                <input
                  id="auth-password"
                  type="password"
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? 'At least 10 characters' : 'Your password'}
                  style={{ ...fieldStyle, paddingLeft: 36 }}
                />
              </div>
              {mode === 'signup' && (
                <p style={{ margin: '7px 0 0', fontSize: 12, color: muted }}>
                  10+ characters, with a number or symbol somewhere in there.
                </p>
              )}
            </div>
          )}

          {mode === 'signup' && role === 'vendor' && (
            <>
              <div style={fieldWrap}>
                <label style={labelStyle} htmlFor="auth-company">Business name</label>
                <input
                  id="auth-company"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Royal Feast Caterers"
                  style={fieldStyle}
                />
              </div>
              <div style={fieldWrap}>
                <label style={labelStyle} htmlFor="auth-gst">GSTIN</label>
                <input
                  id="auth-gst"
                  required
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                  placeholder="06AAACD1234A1ZK"
                  maxLength={15}
                  style={{ ...fieldStyle, letterSpacing: '.06em' }}
                />
                <p style={{ margin: '7px 0 0', fontSize: 12, color: muted }}>
                  15 characters. We check the format now and verify it during review.
                </p>
              </div>
              <div style={fieldWrap}>
                <label style={labelStyle} htmlFor="auth-category">Primary category</label>
                <select
                  id="auth-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CategoryType)}
                  style={fieldStyle}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div style={fieldWrap}>
                <label style={labelStyle} htmlFor="auth-areas">Service areas</label>
                <input
                  id="auth-areas"
                  required
                  value={serviceArea}
                  onChange={(e) => setServiceArea(e.target.value)}
                  placeholder="Cyber City, Golf Course Road, Udyog Vihar"
                  style={fieldStyle}
                />
                <p style={{ margin: '7px 0 0', fontSize: 12, color: muted }}>Comma separated.</p>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              marginTop: 6,
              padding: '13px 18px',
              borderRadius: 12,
              border: 'none',
              cursor: loading ? 'wait' : 'pointer',
              background: 'var(--saffron)',
              color: '#FFFFFF',
              fontSize: 14,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading
              ? 'Just a moment…'
              : mode === 'signin'
                ? 'Sign in'
                : mode === 'signup'
                  ? 'Create account'
                  : 'Send reset link'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <p
          style={{
            margin: '18px 0 0',
            fontSize: 12,
            color: muted,
            display: 'flex',
            gap: 7,
            alignItems: 'flex-start',
            lineHeight: 1.55,
          }}
        >
          <Lock size={13} style={{ flexShrink: 0, marginTop: 2 }} />
          Sessions are server-side and expire. We never store your password — only a hash of it.
        </p>
      </motion.div>
    </div>
  );
}
