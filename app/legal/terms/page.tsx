'use client';
// ============================================================
// app/legal/terms/page.tsx — Terms of Service & Marketplace Agreement
// Governed by Indian Contract Act, 1872 & IT Act, 2000
// ============================================================

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText, CheckCircle2, ShieldCheck, Scale } from 'lucide-react';
import { BlurredCyberHubBackground } from '@/components/canvas/BlurredCyberHubBackground';
import { PreviewFooter } from '@/components/venture/PreviewFooter';

export default function TermsOfServicePage() {
  return (
    <div style={{ background: '#05070E', color: '#ffffff', minHeight: '100vh', position: 'relative' }}>
      <BlurredCyberHubBackground />

      {/* Top Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          padding: '16px 24px',
          background: 'rgba(5, 7, 14, 0.92)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, color: '#34d399', fontSize: 13, fontWeight: 700 }}>
          <ArrowLeft size={16} />
          <span>Back to Marketplace Homepage</span>
        </Link>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
          Community of Employees (COE) Terms of Service
        </span>
      </header>

      {/* Main Content Container */}
      <main style={{ maxWidth: 960, margin: '0 auto', padding: '60px 24px 100px', position: 'relative', zIndex: 10 }}>
        {/* Title */}
        <div style={{ marginBottom: 40, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 24 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 999, background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', marginBottom: 12 }}>
            <Scale size={14} /> TERMS OF PLATFORM USE & REVERSE-AUCTION RULES
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 3.5vw, 42px)', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: 10 }}>
            Marketplace Terms of Service
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>
            Effective Date: 1st January 2026 · Governed by the Indian Contract Act, 1872 & IT Act, 2000
          </p>
        </div>

        {/* Legal Text Body */}
        <div style={{ display: 'grid', gap: 28, fontSize: 14.5, color: 'rgba(255,255,255,0.8)', lineHeight: 1.75 }}>
          <section style={{ padding: '24px', borderRadius: 16, background: 'rgba(11,15,23,0.85)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', marginBottom: 12 }}>
              1. Nature of Platform & Non-Liability Clause
            </h2>
            <p>
              Community of Employees (&quot;COE&quot;) acts as a technological discovery and reverse-auction platform only. COE does not lease, operate, or maintain any physical properties or facilities. All event hosting, safety standards, statutory licenses, food and beverage handling, and security measures remain the sole legal responsibility of the venue partner.
            </p>
          </section>

          <section style={{ padding: '24px', borderRadius: 16, background: 'rgba(11,15,23,0.85)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', marginBottom: 12 }}>
              2. Vendor Obligations & Anti-Collusion Rules
            </h2>
            <p>
              Venues participating in reverse auctions must maintain valid statutory registrations (GSTIN, FSSAI, local municipal trade licenses). Rigging of bids, price collusion, or quoting false capacity is strictly prohibited and subject to immediate blacklist and platform deregistration.
            </p>
          </section>

          <section style={{ padding: '24px', borderRadius: 16, background: 'rgba(11,15,23,0.85)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', marginBottom: 12 }}>
              3. Governing Law and Jurisdiction
            </h2>
            <p>
              These terms are governed exclusively by the laws of the Republic of India. Any disputes arising out of the use of the platform shall be subject to the exclusive jurisdiction of the competent courts in <strong>Gurugram / New Delhi</strong>.
            </p>
          </section>
        </div>
      </main>

      <PreviewFooter />
    </div>
  );
}
