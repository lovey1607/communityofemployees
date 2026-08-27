'use client';
// ============================================================
// components/nav/PublicNav.tsx — Premium Public Navbar
// Glass-morphic fixed header with modal-based auth (no navigation).
// Corporate Login (Emerald) and Vendor Login (Amber/Orange).
// Admin login is hidden from public UI → /admin/login.
// ============================================================

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { OfficeLightSwitch } from '@/components/OfficeLightSwitch';
import {
  Building2, Store, Mail, Lock, ArrowRight,
  X, Sparkles, Check, ShieldCheck
} from 'lucide-react';

// ─── Inline Login Modal ─────────────────────────────────────
type ModalRole = 'corporate' | 'vendor' | null;

interface LoginModalProps {
  role: 'corporate' | 'vendor';
  onClose: () => void;
}

function LoginModal({ role, onClose }: LoginModalProps) {
  const router = useRouter();
  const { loginWithPassword, registerUser, isNightMode } = useStore();

  const isCorporate = role === 'corporate';
  const color = isCorporate ? '#10b981' : '#f97316';
  const defaultEmail = isCorporate ? 'hr@nexus.com' : 'sales@royalturf.com';
  const defaultPass = 'test1234';
  const redirectRoute = isCorporate ? '/corporate/dashboard' : '/vendor/dashboard';
  const onboardingRoute = isCorporate ? '/corporate/onboarding' : '/vendor/onboarding';

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [autoFilled, setAutoFilled] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);

    if (isRegister) {
      const regEmail = email.trim() || (isCorporate ? `procurement.${Date.now().toString().slice(-4)}@enterprisecorp.com` : `partner.${Date.now().toString().slice(-4)}@servicehub.com`);
      const regPass = password || 'test1234';
      setTimeout(() => {
        registerUser(regEmail, regPass, role);
        setLoading(false);
        onClose();
        router.push(onboardingRoute);
      }, 350);
    } else {
      const loginEmail = email || defaultEmail;
      const loginPass = password || defaultPass;
      setTimeout(() => {
        loginWithPassword(loginEmail, loginPass, role);
        setLoading(false);
        onClose();
        router.push(redirectRoute);
      }, 350);
    }
  };

  const handleAutoLogin = () => {
    setEmail(defaultEmail);
    setPassword(defaultPass);
    setAutoFilled(true);
    setLoading(true);
    setTimeout(() => {
      loginWithPassword(defaultEmail, defaultPass, role);
      setLoading(false);
      onClose();
      router.push(redirectRoute);
    }, 350);
  };

  const handleQuickRegister = () => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const demoEmail = isCorporate
      ? `lead.procure${randomSuffix}@horizoncapital.com`
      : `sales.partner${randomSuffix}@deluxeevents.com`;
    setLoading(true);
    setTimeout(() => {
      registerUser(demoEmail, 'test1234', role);
      setLoading(false);
      onClose();
      router.push(onboardingRoute);
    }, 350);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: 'rgba(5, 8, 20, 0.78)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 26, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 470,
          borderRadius: 24,
          overflow: 'hidden',
          background: '#0B0F17',
          border: `1.5px solid ${color}30`,
          boxShadow: `0 32px 80px rgba(0,0,0,0.85), 0 0 40px ${color}12`,
        }}
      >
        {/* Modal header with gradient tint */}
        <div
          style={{
            padding: '28px 28px 20px',
            background: `linear-gradient(145deg, ${color}14 0%, transparent 60%)`,
            borderBottom: `1px solid ${color}18`,
            position: 'relative',
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255,255,255,0.7)',
            }}
          >
            <X size={15} />
          </button>

          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: `${color}22`,
              border: `1px solid ${color}44`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color,
              marginBottom: 12,
              boxShadow: `0 4px 20px ${color}25`,
            }}
          >
            {isCorporate ? <Building2 size={22} /> : <Store size={22} />}
          </div>

          <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
            <button
              type="button"
              onClick={() => setIsRegister(false)}
              style={{
                padding: '4px 12px',
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 800,
                cursor: 'pointer',
                border: !isRegister ? `1px solid ${color}` : '1px solid rgba(255,255,255,0.12)',
                background: !isRegister ? `${color}22` : 'transparent',
                color: !isRegister ? '#ffffff' : 'rgba(255,255,255,0.5)',
                transition: 'all 0.2s',
                fontFamily: 'var(--font-body)',
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsRegister(true)}
              style={{
                padding: '4px 12px',
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 800,
                cursor: 'pointer',
                border: isRegister ? `1px solid ${color}` : '1px solid rgba(255,255,255,0.12)',
                background: isRegister ? `${color}22` : 'transparent',
                color: isRegister ? '#ffffff' : 'rgba(255,255,255,0.5)',
                transition: 'all 0.2s',
                fontFamily: 'var(--font-body)',
              }}
            >
              Register New Account
            </button>
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 22,
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              marginBottom: 4,
            }}
          >
            {isRegister
              ? isCorporate
                ? 'Register New Corporate Account'
                : 'Register as Vendor Partner'
              : isCorporate
              ? 'Welcome back, Corporate Hub'
              : 'Vendor Partner Access'}
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>
            {isRegister
              ? isCorporate
                ? 'Create your credentials to submit your company profile for Admin verification.'
                : 'Create your credentials to submit your GSTIN & business KYC.'
              : isCorporate
              ? 'Sign in to post RFPs and evaluate live vendor bids.'
              : 'Sign in to access live corporate auctions and submit quotes.'}
          </p>
        </div>

        {/* Form body */}
        <div style={{ padding: '24px 28px 28px' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label
                style={{
                  display: 'block',
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.6)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: 6,
                }}
              >
                {isCorporate ? 'Corporate Work Email' : 'Registered Business Email'}
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={14}
                  style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color }}
                />
                <input
                  className="input-base"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isRegister ? (isCorporate ? 'you@company.com' : 'sales@yourbusiness.com') : defaultEmail}
                  style={{ paddingLeft: 36, fontSize: 13.5 }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  display: 'block',
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.6)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: 6,
                }}
              >
                {isRegister ? 'Create Password' : 'Password'}
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={14}
                  style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color }}
                />
                <input
                  className="input-base"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isRegister ? 'Minimum 6 characters' : '••••••••'}
                  style={{ paddingLeft: 36, fontSize: 13.5 }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '13px',
                fontSize: 14,
                background: color,
                boxShadow: `0 8px 24px ${color}35`,
              }}
            >
              {loading
                ? 'Processing…'
                : isRegister
                ? isCorporate
                  ? 'Create Account & Start Company Onboarding'
                  : 'Create Account & Submit Vendor KYC'
                : isCorporate
                ? 'Enter Corporate Portal'
                : 'Enter Vendor Hub'}
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Registration Mode: Quick Demo helper */}
          {isRegister ? (
            <div
              style={{
                marginTop: 18,
                borderRadius: 12,
                padding: '12px 14px',
                background: `${color}0c`,
                border: `1px solid ${color}25`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
              }}
            >
              <div>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: '#ffffff' }}>Fast-Track Registration</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>
                  Auto-creates fresh user & opens onboarding wizard
                </div>
              </div>
              <button
                type="button"
                onClick={handleQuickRegister}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  background: `${color}22`,
                  border: `1px solid ${color}44`,
                  borderRadius: 8,
                  padding: '6px 12px',
                  color,
                  fontSize: 11.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  flexShrink: 0,
                }}
              >
                <Sparkles size={12} />
                <span>Quick Register</span>
              </button>
            </div>
          ) : (
            /* Sign In Mode: Test credentials helper */
            <div
              style={{
                marginTop: 16,
                borderRadius: 12,
                padding: '12px 14px',
                background: `${color}0a`,
                border: `1px solid ${color}22`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 800,
                    color,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  🔑 Test Credentials
                </span>
                <button
                  type="button"
                  onClick={handleAutoLogin}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    background: `${color}22`,
                    border: `1px solid ${color}44`,
                    borderRadius: 8,
                    padding: '4px 10px',
                    color,
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {autoFilled ? <Check size={11} /> : <Sparkles size={11} />}
                  <span>1-Click Auto Login</span>
                </button>
              </div>
              <div
                style={{
                  fontFamily: 'monospace',
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.75)',
                  display: 'grid',
                  gap: 3,
                }}
              >
                <div>
                  Email: <strong style={{ color: '#ffffff' }}>{defaultEmail}</strong>
                </div>
                <div>
                  Pass: <strong style={{ color: '#ffffff' }}>{defaultPass}</strong>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Switcher Link */}
          <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
            {isRegister ? (
              <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.6)' }}>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegister(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color,
                    fontSize: 12.5,
                    fontWeight: 800,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: 0,
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  Sign In to existing account →
                </button>
              </p>
            ) : (
              <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.6)' }}>
                {isCorporate ? "Don't have a corporate account?" : "Not a registered vendor partner yet?"}{' '}
                <button
                  type="button"
                  onClick={() => setIsRegister(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color,
                    fontSize: 12.5,
                    fontWeight: 800,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: 0,
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {isCorporate ? 'Register your Company →' : 'Register as Vendor Partner →'}
                </button>
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Public Navbar Component ────────────────────────────────
export function PublicNav() {
  const { isNightMode } = useStore();
  const [openModal, setOpenModal] = useState<ModalRole>(null);

  return (
    <>
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: '12px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: isNightMode ? 'rgba(11, 15, 23, 0.85)' : 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: isNightMode
            ? '1px solid rgba(255, 255, 255, 0.08)'
            : '1px solid rgba(0, 0, 0, 0.07)',
        }}
      >
        {/* Left: Logo + Brand */}
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 11,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 17,
                fontWeight: 800,
                color: '#ffffff',
                fontFamily: 'var(--font-display)',
                boxShadow: '0 4px 16px rgba(16,185,129,0.4)',
                flexShrink: 0,
              }}
            >
              C
            </div>
            <div>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: 18,
                  color: isNightMode ? '#ffffff' : '#0f172a',
                  letterSpacing: '-0.02em',
                  display: 'block',
                  lineHeight: 1.1,
                }}
              >
                COE<span style={{ color: '#10b981' }}> Portal</span>
              </span>
              <span
                style={{
                  fontSize: 9.5,
                  color: isNightMode ? 'rgba(255,255,255,0.45)' : '#94a3b8',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                DLF Cyber Hub Enterprise
              </span>
            </div>
          </div>
        </Link>

        {/* Center: Office Lights Toggle */}
        <OfficeLightSwitch />

        {/* Right: Two Login Buttons (no admin) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Corporate Login */}
          <button
            id="public-nav-corporate-login-btn"
            onClick={() => setOpenModal('corporate')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              padding: '8px 18px',
              borderRadius: 12,
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1.5px solid rgba(16, 185, 129, 0.45)',
              color: '#10b981',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: 'var(--font-body)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(16, 185, 129, 0.22)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(16,185,129,0.2)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(16, 185, 129, 0.12)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
            }}
          >
            <Building2 size={14} />
            <span>Corporate Login</span>
          </button>

          {/* Vendor Login */}
          <button
            id="public-nav-vendor-login-btn"
            onClick={() => setOpenModal('vendor')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              padding: '8px 18px',
              borderRadius: 12,
              background: 'rgba(249, 115, 22, 0.12)',
              border: '1.5px solid rgba(249, 115, 22, 0.45)',
              color: '#f97316',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: 'var(--font-body)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(249, 115, 22, 0.22)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(249,115,22,0.2)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(249, 115, 22, 0.12)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
            }}
          >
            <Store size={14} />
            <span>Vendor Partner Login</span>
          </button>
        </div>
      </motion.header>

      {/* Auth Modals (no-page-navigation, centered Dialog) */}
      <AnimatePresence>
        {openModal === 'corporate' && (
          <LoginModal role="corporate" onClose={() => setOpenModal(null)} />
        )}
        {openModal === 'vendor' && (
          <LoginModal role="vendor" onClose={() => setOpenModal(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
