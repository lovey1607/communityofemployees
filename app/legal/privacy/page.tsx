'use client';
// ============================================================
// app/legal/privacy/page.tsx — Privacy Policy
// Compliant with Digital Personal Data Protection (DPDP) Act, 2023 & IT Act, 2000
// ============================================================

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Lock, Eye, Database, CheckCircle2 } from 'lucide-react';
import { BlurredCyberHubBackground } from '@/components/canvas/BlurredCyberHubBackground';
import { PreviewFooter } from '@/components/venture/PreviewFooter';

export default function PrivacyPolicyPage() {
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
          Community of Employees (COE) Data Protection
        </span>
      </header>

      {/* Main Content Container */}
      <main style={{ maxWidth: 960, margin: '0 auto', padding: '60px 24px 100px', position: 'relative', zIndex: 10 }}>
        {/* Title */}
        <div style={{ marginBottom: 40, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 24 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 999, background: 'rgba(14, 165, 233, 0.15)', color: '#0ea5e9', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', marginBottom: 12 }}>
            <Lock size={14} /> DPDP ACT, 2023 COMPLIANT PRIVACY NOTICE
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 3.5vw, 42px)', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: 10 }}>
            Enterprise Privacy & Data Protection Policy
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>
            Effective Date: 1st January 2026 · Compliant with Digital Personal Data Protection (DPDP) Act, 2023
          </p>
        </div>

        {/* Legal Text Body */}
        <div style={{ display: 'grid', gap: 28, fontSize: 14.5, color: 'rgba(255,255,255,0.8)', lineHeight: 1.75 }}>
          {/* Section 1 */}
          <section style={{ padding: '24px', borderRadius: 16, background: 'rgba(11,15,23,0.85)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#0ea5e9' }}>1.</span> Information We Collect
            </h2>
            <p>
              Community of Employees (&quot;COE&quot;) collects only necessary corporate procurement information to facilitate reverse auctions:
            </p>
            <ul style={{ paddingLeft: 20, marginTop: 8, display: 'grid', gap: 6 }}>
              <li><strong>Corporate Buyer Data:</strong> Authorized representative name, official corporate email, company name, office address, and contact numbers.</li>
              <li><strong>Vendor Entity Data:</strong> Business name, registered entity type, GSTIN number, establishment address, contact person, and bank/invoicing coordinates.</li>
              <li><strong>RFP & Auction Data:</strong> Headcount requirements, event dates, event category preferences, and itemized reverse quotations.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section style={{ padding: '24px', borderRadius: 16, background: 'rgba(11,15,23,0.85)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#10b981' }}>2.</span> Purpose Limitation & Processing
            </h2>
            <p>
              Under Section 6 of the DPDP Act, 2023, data is processed strictly for the specified purpose of enabling B2B reverse auctions, vendor statutory KYC validation, and auction contract facilitation. We do not sell, rent, or trade corporate or vendor data to third-party advertisers.
            </p>
          </section>

          {/* Section 3 */}
          <section style={{ padding: '24px', borderRadius: 16, background: 'rgba(11,15,23,0.85)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#f97316' }}>3.</span> Blind Bidding Confidentiality
            </h2>
            <p>
              During active reverse auctions, vendor bids are encrypted and anonymized. Competing venues only see the lowest current market quotation benchmark, and cannot view other bidding entities&apos; proprietary margin breakdowns or identifying credentials until contracts are formally unlocked.
            </p>
          </section>

          {/* Section 4 */}
          <section style={{ padding: '24px', borderRadius: 16, background: 'rgba(11,15,23,0.85)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#a855f7' }}>4.</span> Data Principal Rights & Deletion
            </h2>
            <p>
              Corporate and vendor partners possess full rights under the DPDP Act, 2023 to review, correct, or request deletion of their profile data by contacting our Data Protection Desk at <strong>privacy@coe.com</strong>.
            </p>
          </section>
        </div>
      </main>

      <PreviewFooter />
    </div>
  );
}
