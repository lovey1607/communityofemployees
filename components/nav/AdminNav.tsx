'use client';
// ============================================================
// components/nav/AdminNav.tsx — Super Admin Top Navigation
// Strictly isolated to platform administrators
// ============================================================

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Shield, LogOut } from 'lucide-react';

export function AdminNav() {
  const router = useRouter();
  const { logout } = useStore();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

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
      {/* Left: Brand + Role Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <Link href="/admin/dashboard" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #B23A7A 0%, #8E2C61 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                fontWeight: 800,
                color: '#FFF7EC',
                fontFamily: 'var(--font-display)',
                boxShadow: '0 4px 16px rgba(178, 58, 122, 0.35)',
              }}
            >
              <Shield size={18} />
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
                COE<span style={{ color: '#B23A7A' }}> Admin Center</span>
              </span>
              <span style={{ fontSize: 9.5, color: '#B23A7A', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Master Governance & Analytics
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* Center: Office Lights */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      </div>

      {/* Right: Admin Pill & Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 12px',
            borderRadius: 12,
            background: 'rgba(178, 58, 122, 0.12)',
            border: '1px solid rgba(178, 58, 122, 0.3)',
          }}
        >
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#B23A7A', boxShadow: '0 0 6px #B23A7A' }} />
          <div style={{ fontSize: 12, fontWeight: 800, color: '#B23A7A', textTransform: 'uppercase' }}>
            Super Admin
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="btn-ghost"
          style={{ padding: '7px 10px', fontSize: 12, color: 'rgba(194, 50, 28,0.8)' }}
          title="Logout of Super Admin"
        >
          <LogOut size={14} />
        </button>
      </div>
    </motion.header>
  );
}
