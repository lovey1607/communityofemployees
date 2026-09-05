'use client';
// ============================================================
// components/nav/VendorNav.tsx — Vendor Supply Top Navigation
// Strictly isolated to supply-side registered vendors
// ============================================================

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Store, LogOut, ShieldCheck } from 'lucide-react';
import { CATEGORY_LABELS } from '@/lib/themes';

export function VendorNav() {
  const router = useRouter();
  const { currentVendorProfile, logout } = useStore();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const company = currentVendorProfile?.companyName || 'Royal Feast Catering & Hospitality';
  const category = currentVendorProfile?.category || 'food';

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: '10px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--paper)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(235, 223, 204, 0.9)',
      }}
    >
      {/* Left: Brand + Role Badge + Home Link */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <Link href="/" style={{ textDecoration: 'none' }} title="Return to Marketplace Homepage">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #FF6B2C 0%, #D9541C 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                fontWeight: 800,
                color: '#ffffff',
                fontFamily: 'var(--font-display)',
                boxShadow: '0 4px 16px rgba(255, 107, 44, 0.35)',
              }}
            >
              V
            </div>
            <div>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: 17,
                  color: '#1D1A17',
                  letterSpacing: '-0.02em',
                  display: 'block',
                  lineHeight: 1.1,
                }}
              >
                COE<span style={{ color: '#FF6B2C' }}> Vendor Hub</span>
              </span>
              <span style={{ fontSize: 9.5, color: '#FF6B2C', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {CATEGORY_LABELS[category]} · Live Auctions
              </span>
            </div>
          </div>
        </Link>

        <Link
          href="/"
          style={{
            padding: '5px 12px',
            borderRadius: 8,
            border: '1px solid rgba(235, 223, 204, 0.95)',
            background: 'rgba(235, 223, 204, 0.9)',
            color: '#4A443D',
            fontSize: 12,
            fontWeight: 700,
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            transition: 'all 0.15s ease',
          }}
          title="Return to Main Marketplace Homepage"
        >
          <span>🏠</span>
          <span>Home</span>
        </Link>
      </div>

      {/* Center: Office Lights */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      </div>

        {/* Right: Vendor Profile Pill & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link
            href="/vendor/profile"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 12px',
              borderRadius: 12,
              background: 'rgba(235, 223, 204, 0.9)',
              border: `1px solid ${
                currentVendorProfile?.status === 'approved'
                  ? 'rgba(30, 158, 90, 0.3)'
                  : currentVendorProfile?.status === 'rejected'
                  ? 'rgba(194, 50, 28, 0.3)'
                  : 'rgba(178, 58, 122, 0.3)'
              }`,
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'border-color 0.2s, background 0.2s',
            }}
            title="View & Manage Vendor Profile"
          >
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background:
                  currentVendorProfile?.status === 'approved'
                    ? '#1E9E5A'
                    : currentVendorProfile?.status === 'rejected'
                    ? '#C2321C'
                    : '#B23A7A',
                boxShadow: `0 0 6px ${
                  currentVendorProfile?.status === 'approved'
                    ? '#1E9E5A'
                    : currentVendorProfile?.status === 'rejected'
                    ? '#C2321C'
                    : '#B23A7A'
                }`,
              }}
            />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1D1A17', lineHeight: 1.1 }}>
                {company}
              </div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color:
                    currentVendorProfile?.status === 'approved'
                      ? '#1E9E5A'
                      : currentVendorProfile?.status === 'rejected'
                      ? '#C2321C'
                      : '#B23A7A',
                }}
              >
                {currentVendorProfile?.status === 'approved'
                  ? '✔ GST Verified Partner'
                  : currentVendorProfile?.status === 'rejected'
                  ? '✖ KYC Rejected'
                  : '⏳ KYC Pending'}
              </div>
            </div>
          </Link>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="btn-ghost"
          style={{ padding: '7px 10px', fontSize: 12, color: 'rgba(194, 50, 28,0.8)' }}
          title="Logout of Vendor Account"
        >
          <LogOut size={14} />
        </button>
      </div>
    </motion.header>
  );
}
