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
import { Building2, Store } from 'lucide-react';

// The inline demo login modal that used to live here (autofilled shared
// credentials, a one-click 'quick register' that invented an account) has
// been removed. Both buttons now open the real AuthModal.

// ─── Public Navbar Component ────────────────────────────────
export function PublicNav() {
  const { openAuthModal } = useStore();

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
          background: 'var(--paper)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(235, 223, 204, 0.9)',
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
                background: 'linear-gradient(135deg, #1E9E5A 0%, #12854A 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 17,
                fontWeight: 800,
                color: '#ffffff',
                fontFamily: 'var(--font-display)',
                boxShadow: '0 4px 16px rgba(30, 158, 90,0.4)',
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
                  color: '#1D1A17',
                  letterSpacing: '-0.02em',
                  display: 'block',
                  lineHeight: 1.1,
                }}
              >
                COE<span style={{ color: '#1E9E5A' }}> Portal</span>
              </span>
              <span
                style={{
                  fontSize: 9.5,
                  color: '#7A7169',
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
              background: 'rgba(30, 158, 90, 0.12)',
              border: '1.5px solid rgba(30, 158, 90, 0.45)',
              color: '#1E9E5A',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: 'var(--font-body)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(30, 158, 90, 0.22)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(30, 158, 90,0.2)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(30, 158, 90, 0.12)';
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
              background: 'rgba(255, 107, 44, 0.12)',
              border: '1.5px solid rgba(255, 107, 44, 0.45)',
              color: '#FF6B2C',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: 'var(--font-body)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255, 107, 44, 0.22)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(255, 107, 44,0.2)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255, 107, 44, 0.12)';
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
