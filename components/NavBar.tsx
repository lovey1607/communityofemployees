'use client';
// ============================================================
// components/NavBar.tsx — Top Navigation with Role-Specific Views
// Corporate View, Vendor View, Super Admin View & Persona Switcher
// ============================================================

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import {
  Building2, Store, LayoutDashboard, Shield,
  User, KeyRound, LogOut, ChevronDown, Sparkles
} from 'lucide-react';
import { OfficeLightSwitch } from '@/components/OfficeLightSwitch';
import { UserRole } from '@/lib/types';

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    currentUser,
    currentCorporateProfile,
    currentVendorProfile,
    switchPersona,
    openAuthModal,
    isNightMode,
    theme,
  } = useStore();

  const [personaMenuOpen, setPersonaMenuOpen] = useState(false);
  const isHome = pathname === '/';

  const userRole = currentUser?.role || 'corporate';
  const displayName =
    userRole === 'corporate'
      ? currentCorporateProfile?.officeCompanyName || currentCorporateProfile?.name || 'Corporate Procurement'
      : userRole === 'vendor'
      ? currentVendorProfile?.companyName || 'Vendor Partner'
      : 'Super Admin';

  const roleColor =
    userRole === 'corporate'
      ? '#10b981'
      : userRole === 'vendor'
      ? '#f97316'
      : '#eab308';

  const handleSwitch = (role: UserRole, email: string, redirectRoute: string) => {
    switchPersona(role, email);
    setPersonaMenuOpen(false);
    router.push(redirectRoute);
  };

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
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
        background: isNightMode ? 'rgba(7, 11, 23, 0.92)' : 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: isNightMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
      }}
    >
      {/* Brand Logo */}
      <Link href="/" style={{ textDecoration: 'none', cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              fontWeight: 800,
              color: '#05060f',
              fontFamily: 'var(--font-display)',
              boxShadow: `0 4px 16px ${theme.primary}44`,
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
                color: isNightMode ? '#ffffff' : '#0f172a',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
                display: 'block',
              }}
            >
              COE<span style={{ color: theme.primary }}> Portal</span>
            </span>
            <span
              style={{
                fontSize: 9.5,
                color: isNightMode ? 'rgba(255, 255, 255, 0.5)' : '#64748b',
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              DLF Cyber Hub Corporate
            </span>
          </div>
        </div>
      </Link>

      {/* Center: Office Lights Switch */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <OfficeLightSwitch />
      </div>

      {/* Navigation Links & Role Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Link
          href="/"
          className={`nav-link ${isHome ? 'active' : ''}`}
          style={{ color: isNightMode ? undefined : '#0f172a' }}
        >
          <LayoutDashboard size={14} />
          <span className="hidden sm:inline">Portal</span>
        </Link>

        <Link
          href="/corporate"
          className={`nav-link ${pathname.startsWith('/corporate') ? 'active' : ''}`}
          style={{ color: isNightMode ? undefined : '#0f172a' }}
        >
          <Building2 size={14} />
          <span>Corporate View</span>
        </Link>

        <Link
          href="/vendor-dashboard"
          className={`nav-link ${pathname.startsWith('/vendor') ? 'active' : ''}`}
          style={{ color: isNightMode ? undefined : '#0f172a' }}
        >
          <Store size={14} />
          <span>Vendor View</span>
        </Link>

        <Link
          href="/admin"
          className={`nav-link ${pathname.startsWith('/admin') ? 'active' : ''}`}
          style={{ color: isNightMode ? undefined : '#0f172a' }}
        >
          <Shield size={14} />
          <span>Super Admin</span>
        </Link>

        {/* ── Active User Badge & Persona Switcher ── */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setPersonaMenuOpen(!personaMenuOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 12px',
              borderRadius: 12,
              background: isNightMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
              border: `1px solid ${roleColor}55`,
              color: isNightMode ? '#ffffff' : '#0f172a',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: roleColor,
                boxShadow: `0 0 8px ${roleColor}`,
              }}
            />
            <span style={{ maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {displayName}
            </span>
            <span
              style={{
                fontSize: 9.5,
                padding: '2px 6px',
                borderRadius: 999,
                background: `${roleColor}20`,
                color: roleColor,
                fontWeight: 800,
                textTransform: 'uppercase',
              }}
            >
              {userRole}
            </span>
            <ChevronDown size={12} opacity={0.6} />
          </button>

          {/* Persona Menu Dropdown */}
          <AnimatePresence>
            {personaMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 6 }}
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: 8,
                  width: 270,
                  background: isNightMode ? 'rgba(7, 12, 28, 0.96)' : 'rgba(255, 255, 255, 0.98)',
                  border: isNightMode ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(0, 0, 0, 0.12)',
                  borderRadius: 16,
                  padding: '12px',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
                  backdropFilter: 'blur(30px)',
                  WebkitBackdropFilter: 'blur(30px)',
                  zIndex: 100,
                }}
              >
                <div style={{ fontSize: 10.5, fontWeight: 800, color: isNightMode ? 'rgba(255,255,255,0.45)' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, padding: '0 4px' }}>
                  Switch Test Persona (RBAC)
                </div>

                <button
                  type="button"
                  onClick={() => handleSwitch('corporate', 'sarah.sharma@techcorp.com', '/corporate')}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 8,
                    background: userRole === 'corporate' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    color: isNightMode ? '#ffffff' : '#0f172a',
                    marginBottom: 4,
                  }}
                >
                  <Building2 size={15} color="#10b981" />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>Corporate Employee</div>
                    <div style={{ fontSize: 10.5, color: isNightMode ? 'rgba(255,255,255,0.5)' : '#64748b' }}>Nexus Tech India (HR)</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSwitch('vendor', 'rajat@royalfeast.in', '/vendor-dashboard')}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 8,
                    background: userRole === 'vendor' ? 'rgba(249, 115, 22, 0.15)' : 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    color: isNightMode ? '#ffffff' : '#0f172a',
                    marginBottom: 4,
                  }}
                >
                  <Store size={15} color="#f97316" />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>Food & Party Vendor</div>
                    <div style={{ fontSize: 10.5, color: isNightMode ? 'rgba(255,255,255,0.5)' : '#64748b' }}>Royal Feast Catering</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSwitch('vendor', 'vikram@arenaturf.com', '/vendor-dashboard')}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 8,
                    background: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    color: isNightMode ? '#ffffff' : '#0f172a',
                    marginBottom: 4,
                  }}
                >
                  <Store size={15} color="#0ea5e9" />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>Sports Vendor</div>
                    <div style={{ fontSize: 10.5, color: isNightMode ? 'rgba(255,255,255,0.5)' : '#64748b' }}>Arena Turf Management</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSwitch('admin', 'admin@coeportal.com', '/admin')}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 8,
                    background: userRole === 'admin' ? 'rgba(234, 179, 8, 0.15)' : 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    color: isNightMode ? '#ffffff' : '#0f172a',
                    marginBottom: 8,
                  }}
                >
                  <Shield size={15} color="#eab308" />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>Super Admin</div>
                    <div style={{ fontSize: 10.5, color: isNightMode ? 'rgba(255,255,255,0.5)' : '#64748b' }}>Master Control Suite</div>
                  </div>
                </button>

                <div style={{ borderTop: isNightMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)', paddingTop: 8 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setPersonaMenuOpen(false);
                      openAuthModal();
                    }}
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      borderRadius: 8,
                      background: 'none',
                      border: 'none',
                      color: '#10b981',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <KeyRound size={14} /> Passwordless Email + OTP
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.nav>
  );
}
