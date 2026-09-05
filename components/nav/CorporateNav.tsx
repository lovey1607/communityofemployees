'use client';
// ============================================================
// components/nav/CorporateNav.tsx — Corporate Employee Top Navigation
// Strictly isolated to demand-side corporate users
// ============================================================

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Building2, Plus, LogOut, ShieldCheck, User } from 'lucide-react';

export function CorporateNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { currentCorporateProfile, currentUser, openModal, logout, theme } = useStore();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const company = currentCorporateProfile?.officeCompanyName || 'Nexus Technologies India';
  const name = currentCorporateProfile?.name || 'Sarah Sharma';

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
                background: 'linear-gradient(135deg, #1E9E5A 0%, #12854A 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                fontWeight: 800,
                color: '#ffffff',
                fontFamily: 'var(--font-display)',
                boxShadow: '0 4px 16px rgba(30, 158, 90, 0.35)',
              }}
            >
              C
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
                COE<span style={{ color: '#1E9E5A' }}> Corporate</span>
              </span>
              <span style={{ fontSize: 9.5, color: '#1E9E5A', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Demand & Procurement Hub
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

      {/* Right: Quick Actions, Profile & Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          onClick={() => openModal()}
          className="btn-primary"
          style={{ padding: '8px 16px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Plus size={14} />
          <span>Post New RFP</span>
        </button>

        {/* Corporate Profile Pill (Link to /corporate/profile) */}
        <Link
          href="/corporate/profile"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 12px',
            borderRadius: 12,
            background: 'rgba(235, 223, 204, 0.9)',
            border: `1px solid ${
              currentCorporateProfile?.status === 'approved'
                ? 'rgba(30, 158, 90, 0.3)'
                : currentCorporateProfile?.status === 'rejected'
                ? 'rgba(194, 50, 28, 0.3)'
                : 'rgba(178, 58, 122, 0.3)'
            }`,
            textDecoration: 'none',
            cursor: 'pointer',
            transition: 'border-color 0.2s, background 0.2s',
          }}
          title="View & Manage Corporate Profile"
        >
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background:
                currentCorporateProfile?.status === 'approved'
                  ? '#1E9E5A'
                  : currentCorporateProfile?.status === 'rejected'
                  ? '#C2321C'
                  : '#B23A7A',
              boxShadow: `0 0 6px ${
                currentCorporateProfile?.status === 'approved'
                  ? '#1E9E5A'
                  : currentCorporateProfile?.status === 'rejected'
                  ? '#C2321C'
                  : '#B23A7A'
              }`,
            }}
          />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#1D1A17', lineHeight: 1.1 }}>
              {company}
            </div>
            <div style={{ fontSize: 10, color: '#7A7169' }}>
              {name} ·{' '}
              <span
                style={{
                  fontWeight: 700,
                  color:
                    currentCorporateProfile?.status === 'approved'
                      ? '#1E9E5A'
                      : currentCorporateProfile?.status === 'rejected'
                      ? '#C2321C'
                      : '#B23A7A',
                }}
              >
                {currentCorporateProfile?.status === 'approved'
                  ? 'Verified'
                  : currentCorporateProfile?.status === 'rejected'
                  ? 'Rejected'
                  : 'Pending'}
              </span>
            </div>
          </div>
        </Link>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="btn-ghost"
          style={{ padding: '7px 10px', fontSize: 12, color: 'rgba(194, 50, 28,0.8)' }}
          title="Logout of Corporate Account"
        >
          <LogOut size={14} />
        </button>
      </div>
    </motion.header>
  );
}
