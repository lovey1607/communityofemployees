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
import { OfficeLightSwitch } from '@/components/OfficeLightSwitch';
import { Store, LogOut, ShieldCheck } from 'lucide-react';
import { CATEGORY_LABELS } from '@/lib/themes';

export function VendorNav() {
  const router = useRouter();
  const { currentVendorProfile, logout, isNightMode } = useStore();

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
        background: isNightMode ? 'rgba(11, 15, 23, 0.92)' : 'rgba(255, 255, 255, 0.94)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: isNightMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
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
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                fontWeight: 800,
                color: '#ffffff',
                fontFamily: 'var(--font-display)',
                boxShadow: '0 4px 16px rgba(249, 115, 22, 0.35)',
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
                  color: isNightMode ? '#ffffff' : '#0f172a',
                  letterSpacing: '-0.02em',
                  display: 'block',
                  lineHeight: 1.1,
                }}
              >
                COE<span style={{ color: '#f97316' }}> Vendor Hub</span>
              </span>
              <span style={{ fontSize: 9.5, color: '#f97316', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
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
            border: isNightMode ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.1)',
            background: isNightMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
            color: isNightMode ? 'rgba(255, 255, 255, 0.8)' : '#334155',
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
        <OfficeLightSwitch />
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
              background: isNightMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
              border: `1px solid ${
                currentVendorProfile?.status === 'approved'
                  ? 'rgba(16, 185, 129, 0.3)'
                  : currentVendorProfile?.status === 'rejected'
                  ? 'rgba(239, 68, 68, 0.3)'
                  : 'rgba(234, 179, 8, 0.3)'
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
                    ? '#10b981'
                    : currentVendorProfile?.status === 'rejected'
                    ? '#ef4444'
                    : '#eab308',
                boxShadow: `0 0 6px ${
                  currentVendorProfile?.status === 'approved'
                    ? '#10b981'
                    : currentVendorProfile?.status === 'rejected'
                    ? '#ef4444'
                    : '#eab308'
                }`,
              }}
            />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: isNightMode ? '#ffffff' : '#0f172a', lineHeight: 1.1 }}>
                {company}
              </div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color:
                    currentVendorProfile?.status === 'approved'
                      ? '#10b981'
                      : currentVendorProfile?.status === 'rejected'
                      ? '#ef4444'
                      : '#eab308',
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
          style={{ padding: '7px 10px', fontSize: 12, color: 'rgba(239,68,68,0.8)' }}
          title="Logout of Vendor Account"
        >
          <LogOut size={14} />
        </button>
      </div>
    </motion.header>
  );
}
