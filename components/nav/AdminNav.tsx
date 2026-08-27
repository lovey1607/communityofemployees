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
import { OfficeLightSwitch } from '@/components/OfficeLightSwitch';
import { Shield, LogOut } from 'lucide-react';

export function AdminNav() {
  const router = useRouter();
  const { logout, isNightMode } = useStore();

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
        background: isNightMode ? 'rgba(11, 15, 23, 0.92)' : 'rgba(255, 255, 255, 0.94)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: isNightMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
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
                background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                fontWeight: 800,
                color: '#050814',
                fontFamily: 'var(--font-display)',
                boxShadow: '0 4px 16px rgba(234, 179, 8, 0.35)',
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
                  color: isNightMode ? '#ffffff' : '#0f172a',
                  letterSpacing: '-0.02em',
                  display: 'block',
                  lineHeight: 1.1,
                }}
              >
                COE<span style={{ color: '#eab308' }}> Admin Center</span>
              </span>
              <span style={{ fontSize: 9.5, color: '#eab308', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Master Governance & Analytics
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* Center: Office Lights */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <OfficeLightSwitch />
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
            background: 'rgba(234, 179, 8, 0.12)',
            border: '1px solid rgba(234, 179, 8, 0.3)',
          }}
        >
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#eab308', boxShadow: '0 0 6px #eab308' }} />
          <div style={{ fontSize: 12, fontWeight: 800, color: '#eab308', textTransform: 'uppercase' }}>
            Super Admin
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="btn-ghost"
          style={{ padding: '7px 10px', fontSize: 12, color: 'rgba(239,68,68,0.8)' }}
          title="Logout of Super Admin"
        >
          <LogOut size={14} />
        </button>
      </div>
    </motion.header>
  );
}
