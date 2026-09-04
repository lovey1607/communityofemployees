'use client';
// ============================================================
// components/nav/PublicNav.tsx — Premium Public Navbar
// Glass-morphic fixed header with modal-based auth (no navigation).
// Corporate Login (Emerald) and Vendor Login (Amber/Orange).
// Admin login is hidden from public UI → /admin/login.
// ============================================================

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { OfficeLightSwitch } from '@/components/OfficeLightSwitch';
import { Building2, Store } from 'lucide-react';

// The inline demo login modal that used to live here (autofilled shared
// credentials, a one-click 'quick register' that invented an account) has
// been removed. Both buttons now open the real AuthModal.

// ─── Public Navbar Component ────────────────────────────────
export function PublicNav() {
  const { isNightMode, openAuthModal } = useStore();

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
            onClick={openAuthModal}
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
            onClick={openAuthModal}
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

    </>
  );
}
