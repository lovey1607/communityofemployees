'use client';
// ============================================================
// components/venture/PreviewFooter.tsx
// Enterprise Landing Page Footer & Legal Compliance Link
// ============================================================

import React from 'react';
import Link from 'next/link';
import { Scale, ArrowUp, ArrowRight } from 'lucide-react';

export function PreviewFooter() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'linear-gradient(180deg, #070A12 0%, #030509 100%)',
        padding: '60px 24px 36px',
        position: 'relative',
        zIndex: 10,
      }}
    >
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        {/* Top Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 40, marginBottom: 40 }}>
          {/* Col 1: About & Legal Link */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#050814',
                  fontWeight: 900,
                  fontSize: 16,
                  fontFamily: 'var(--font-display)',
                }}
              >
                C
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 900, color: '#ffffff' }}>
                COE Marketplace
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: 16 }}>
              India’s first enterprise B2B live reverse-bidding marketplace connecting corporate procurement teams with verified sports complexes, brewpubs, offsites & event partners.
            </p>

            {/* Clean, Small Legal & Privacy Link below COE Marketplace */}
            <Link
              href="/legal"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                fontSize: 12,
                color: '#34d399',
                textDecoration: 'none',
                padding: '6px 12px',
                borderRadius: 8,
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                fontWeight: 700,
                transition: 'all 0.2s ease',
              }}
            >
              <Scale size={14} color="#10b981" />
              <span>Privacy & Platform Liability Policy</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          {/* Col 2: Active Pilot Categories */}
          <div>
            <h4 style={{ fontSize: 12.5, fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>
              Delhi NCR Pilot Categories
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10, fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>
              <li>🏆 Sports Complexes & Cricket Turfs (23)</li>
              <li>🥂 Microbreweries & Lounges (100)</li>
              <li>✈️ Luxury Mountain & River Offsites</li>
              <li>🎁 Executive Rewards & Gift Hampers</li>
              <li>👔 Custom Corporate Merchandise</li>
            </ul>
          </div>

          {/* Col 3: Key Gurugram Hubs */}
          <div>
            <h4 style={{ fontSize: 12.5, fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>
              Gurugram Operations
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10, fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>
              <li>📍 DLF Cyber City & Cyber Hub (Ph-II)</li>
              <li>📍 Golf Course Road (Horizon Center)</li>
              <li>📍 Sector 29 Leisure Valley Corridor</li>
              <li>📍 Golf Course Extension Road (Sec 62/63)</li>
              <li>📍 Sohna Road & Southern Peripheral Rd</li>
            </ul>
          </div>

          {/* Col 4: Platform Navigation */}
          <div>
            <h4 style={{ fontSize: 12.5, fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>
              Direct Portal Links
            </h4>
            <div style={{ display: 'grid', gap: 10 }}>
              <Link href="/corporate/dashboard" style={{ textDecoration: 'none', color: '#10b981', fontSize: 13, fontWeight: 700 }}>
                🏢 Corporate Procurement Portal →
              </Link>
              <Link href="/vendor/dashboard" style={{ textDecoration: 'none', color: '#f97316', fontSize: 13, fontWeight: 700 }}>
                🏪 Vendor Supply Dashboard →
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            paddingTop: 20,
            borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
            fontSize: 12,
            color: 'rgba(255,255,255,0.45)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <span>© 2026 Community of Employees (COE). All rights reserved. Operating in Delhi NCR.</span>
            <Link href="/legal" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>
              Legal Disclaimer & Intermediary Safe Harbor
            </Link>
          </div>

          <button
            onClick={scrollToTop}
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.04)',
              color: 'rgba(255,255,255,0.7)',
              fontSize: 11.5,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <span>Back to top</span>
            <ArrowUp size={12} />
          </button>
        </div>
      </div>
    </footer>
  );
}
