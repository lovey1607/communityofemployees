'use client';
// ============================================================
// components/venture/PreviewHeader.tsx
// Floating Cyber-Glass Navigation Bar for Landing Page Preview
// Smooth anchor jumps, live pilot badge & quick portal access
// ============================================================

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Menu, X } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { OfficeLightSwitch } from '@/components/OfficeLightSwitch';

export function PreviewHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { openAuthModal, currentUser } = useStore();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Live Auction', href: '#simulator' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Enterprise Trust', href: '#verification' },
    { label: 'Delhi NCR Pilot', href: '#delhi-ncr-pilot' },
    { label: 'ROI Calculator', href: '#calculator' },
    { label: 'Contact Us', href: '#contact' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const targetId = href.replace('#', '');
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: scrolled ? '12px 24px' : '20px 24px',
        transition: 'all 0.3s ease',
      }}
    >
      <div
        style={{
          maxWidth: 1240,
          margin: '0 auto',
          borderRadius: 20,
          padding: '12px 22px',
          background: scrolled ? 'rgba(11, 15, 23, 0.88)' : 'rgba(11, 15, 23, 0.65)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxShadow: scrolled ? '0 16px 40px rgba(0,0,0,0.6)' : '0 8px 30px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Brand Logo */}
        <Link
          href="#hero"
          style={{
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(16,185,129,0.4)',
              color: '#050814',
              fontWeight: 900,
              fontSize: 18,
              fontFamily: 'var(--font-display)',
            }}
          >
            C
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em' }}>
                COE
              </span>
              <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 6, background: 'rgba(249,115,22,0.2)', color: '#f97316', fontWeight: 800, border: '1px solid rgba(249,115,22,0.35)' }}>
                NCR PILOT
              </span>
            </div>
            <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>
              Community of Employees
            </div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          style={{
            display: 'none',
            alignItems: 'center',
            gap: 22,
          }}
          className="desktop-nav"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              style={{
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: 700,
                color: 'rgba(255,255,255,0.7)',
                transition: 'color 0.2s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#34d399')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Action Buttons & Office Lights Switch */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="hidden sm:block">
            <OfficeLightSwitch />
          </div>

          {!currentUser ? (
            <>
              <button
                onClick={openAuthModal}
                style={{
                  padding: '9px 16px',
                  borderRadius: 11,
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(255,255,255,0.06)',
                  color: '#ffffff',
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.2s ease',
                }}
              >
                Sign In
              </button>

              <button
                onClick={openAuthModal}
                style={{
                  padding: '9px 18px',
                  borderRadius: 11,
                  border: 'none',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#ffffff',
                  fontSize: 12.5,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 4px 20px rgba(16,185,129,0.35)',
                }}
              >
                <Zap size={14} />
                <span>Launch Live Portal</span>
                <ArrowRight size={13} />
              </button>
            </>
          ) : (
            <Link
              href={
                currentUser.role === 'corporate'
                  ? '/corporate/dashboard'
                  : currentUser.role === 'vendor'
                  ? '/vendor/dashboard'
                  : '/admin/dashboard'
              }
              style={{
                padding: '9px 18px',
                borderRadius: 11,
                border: 'none',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                fontSize: 12.5,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                textDecoration: 'none',
                boxShadow: '0 4px 20px rgba(16,185,129,0.35)',
              }}
            >
              <Zap size={14} />
              <span>Go to {currentUser.role === 'corporate' ? 'Corporate' : currentUser.role === 'vendor' ? 'Vendor' : 'Admin'} Hub</span>
              <ArrowRight size={13} />
            </Link>
          )}
        </div>
      </div>

      <style jsx>{`
        @media (min-width: 900px) {
          .desktop-nav {
            display: flex !important;
          }
        }
      `}</style>
    </header>
  );
}
