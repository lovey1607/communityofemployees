'use client';
// ============================================================
// components/venture/PreviewHeader.tsx
// Fixed Floating Cyber Navigation Bar
// Single-line layout with whitespace: nowrap and Place Live Bids action
// ============================================================

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Zap, Menu, X, ArrowRight } from 'lucide-react';
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
        padding: scrolled ? '10px 20px' : '16px 20px',
        transition: 'all 0.3s ease',
      }}
    >
      <div
        style={{
          maxWidth: 1320,
          margin: '0 auto',
          padding: '10px 20px',
          borderRadius: 20,
          background: 'rgba(11, 15, 23, 0.88)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'nowrap',
        }}
      >
        {/* Brand Logo & Tag */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(16,185,129,0.4)',
              color: '#0B0F17',
              fontWeight: 900,
              fontSize: 18,
              fontFamily: 'var(--font-display)',
            }}
          >
            C
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
                COE
              </span>
              <span style={{ fontSize: 9.5, padding: '2px 6px', borderRadius: 6, background: 'rgba(249,115,22,0.2)', color: '#f97316', fontWeight: 800, border: '1px solid rgba(249,115,22,0.35)', whiteSpace: 'nowrap' }}>
                NCR PILOT
              </span>
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', fontWeight: 600, whiteSpace: 'nowrap' }}>
              Community of Employees
            </div>
          </div>
        </Link>

        {/* Desktop Navigation Links — Strictly Single Line (whiteSpace: nowrap) */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(10px, 1.4vw, 20px)',
            flexWrap: 'nowrap',
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
                fontSize: 'clamp(12px, 0.9vw, 13px)',
                fontWeight: 700,
                color: 'rgba(255,255,255,0.75)',
                transition: 'color 0.2s ease',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'inline-block',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#34d399')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.75)')}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Action Buttons & Office Lights Switch */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div className="hidden md:block">
            <OfficeLightSwitch />
          </div>

          {!currentUser ? (
            <>
              <button
                onClick={openAuthModal}
                style={{
                  padding: '8px 14px',
                  borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(255,255,255,0.06)',
                  color: '#ffffff',
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                }}
              >
                Sign In
              </button>

              <button
                onClick={openAuthModal}
                style={{
                  padding: '8px 18px',
                  borderRadius: 10,
                  border: 'none',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#ffffff',
                  fontSize: 12.5,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 20px rgba(16,185,129,0.35)',
                }}
              >
                <Zap size={14} />
                <span>Place Live Bids</span>
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
                padding: '8px 18px',
                borderRadius: 10,
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
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 20px rgba(16,185,129,0.35)',
              }}
            >
              <Zap size={14} />
              <span>Go to {currentUser.role === 'corporate' ? 'Corporate' : currentUser.role === 'vendor' ? 'Vendor' : 'Admin'} Hub</span>
              <ArrowRight size={13} />
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              padding: 4,
              display: 'none',
            }}
            className="mobile-toggle"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginTop: 10,
            padding: 16,
            borderRadius: 16,
            background: '#0B0F17',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => {
                handleNavClick(e, link.href);
                setMobileMenuOpen(false);
              }}
              style={{
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 700,
                color: 'rgba(255,255,255,0.8)',
                padding: '6px 0',
              }}
            >
              {link.label}
            </a>
          ))}
          <div style={{ paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <OfficeLightSwitch />
          </div>
        </motion.div>
      )}

      <style jsx>{`
        @media (max-width: 960px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-toggle {
            display: block !important;
          }
        }
      `}</style>
    </header>
  );
}
