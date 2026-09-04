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
              <span style={{ color: '#f97316' }}>3.</span> How Bids Are Kept Confidential
            </h2>
            <p>
              While a requirement is open for bids, a vendor can see the requirement and their own
              quote and nothing else. Rival vendors&apos; prices, terms and identities are never sent
              to a bidding vendor&apos;s browser, so they cannot be recovered from the page.
            </p>
            <p style={{ marginTop: 10 }}>
              The employee who posted the requirement sees every quote, with vendor identities masked
              until they award — unless they chose open bidding when posting, which is shown on the
              requirement. Once awarded, identities are revealed to both sides so the work can be
              coordinated. Data is encrypted in transit (HTTPS) and at rest by our database provider;
              we do not claim any additional bid-level encryption beyond that.
            </p>
          </section>

          {/* Section 4 */}
          <section style={{ padding: '24px', borderRadius: 16, background: 'rgba(11,15,23,0.85)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#38bdf8' }}>4.</span> Cookies, Sessions and Location
            </h2>
            <ul style={{ paddingLeft: 20, display: 'grid', gap: 8 }}>
              <li>
                <strong>Session cookie.</strong> Signing in sets one strictly-necessary cookie
                (<code>coe_session</code>). It is HttpOnly and SameSite=Lax, holds a random token
                rather than any personal data, expires after 7 days, and is revoked server-side the
                moment you sign out, change your password, or an admin suspends the account. We set
                no advertising or analytics cookies.
              </li>
              <li>
                <strong>Location.</strong> The vendor directory can sort by distance from you. Your
                browser is only asked for a location after you press the button that says so; the
                coordinates are used to sort that one list, are not written to our database, and are
                not shared with anyone. Declining simply shows the unsorted list.
              </li>
              <li>
                <strong>Passwords.</strong> Stored only as a bcrypt hash. Nobody at COE can read
                your password, and we will never ask you for it.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section style={{ padding: '24px', borderRadius: 16, background: 'rgba(11,15,23,0.85)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#fbbf24' }}>5.</span> How Long We Keep Things
            </h2>
            <ul style={{ paddingLeft: 20, display: 'grid', gap: 8 }}>
              <li><strong>Account and profile:</strong> for as long as the account is open.</li>
              <li>
                <strong>Closed accounts:</strong> the profile is anonymised immediately. Awarded
                requirements and their bids are retained, because they are the record of a
                transaction between two other parties and an audit trail we are obliged to keep.
              </li>
              <li><strong>Email verification and password-reset links:</strong> 24 hours and 1 hour respectively, and single-use.</li>
              <li><strong>Expired sessions:</strong> deleted.</li>
              <li><strong>Admin audit log:</strong> retained for 24 months.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section style={{ padding: '24px', borderRadius: 16, background: 'rgba(11,15,23,0.85)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#a855f7' }}>6.</span> Your Rights, and Getting In Touch
            </h2>
            <p>
              Under the DPDP Act, 2023 you can review, correct, or ask us to delete your data. You can
              edit your profile yourself at any time, and close your account from your profile page —
              that anonymises it immediately, subject to the retention note above. For anything else,
              or to raise a grievance, write to our Data Protection Desk at{' '}
              <strong>privacy@communityofemployees.com</strong>.
            </p>
          </section>
        </div>
      </main>

      <PreviewFooter />
    </div>
  );
}
