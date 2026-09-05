'use client';
// ============================================================
// app/legal/disclaimer/page.tsx — Platform Disclaimer & Safe Harbor
// Governed by Section 79 of the IT Act, 2000 & Intermediary Rules, 2021
// ============================================================

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, FileText, AlertCircle, Building2, ExternalLink } from 'lucide-react';
import { BlurredCyberHubBackground } from '@/components/canvas/BlurredCyberHubBackground';
import { PreviewFooter } from '@/components/venture/PreviewFooter';

export default function LegalDisclaimerPage() {
  return (
    <div style={{ background: '#FFF7EC', color: 'var(--ink)', minHeight: '100vh', position: 'relative' }}>
      <BlurredCyberHubBackground />

      {/* Top Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          padding: '16px 24px',
          background: 'rgba(29, 26, 23, 0.45)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--line)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, color: '#137A43', fontSize: 13, fontWeight: 700 }}>
          <ArrowLeft size={16} />
          <span>Back to Marketplace Homepage</span>
        </Link>
        <span style={{ fontSize: 12, color: 'var(--ink-2)', fontWeight: 600 }}>
          Community of Employees (COE) Legal Compliance
        </span>
      </header>

      {/* Main Content Container */}
      <main style={{ maxWidth: 960, margin: '0 auto', padding: '60px 24px 100px', position: 'relative', zIndex: 10 }}>
        {/* Title */}
        <div style={{ marginBottom: 40, borderBottom: '1px solid var(--line)', paddingBottom: 24 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 999, background: 'rgba(30, 158, 90, 0.15)', color: '#137A43', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', marginBottom: 12 }}>
            <ShieldCheck size={14} /> STATUTORY INTERMEDIARY SAFE HARBOR NOTICE
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 3.5vw, 42px)', fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: 10 }}>
            Platform Disclaimer & Intermediary Policy
          </h1>
          <p style={{ fontSize: 14, color: 'var(--ink-2)' }}>
            Effective Date: 1st January 2026 · Governed under the Laws of the Republic of India
          </p>
        </div>

        {/* Legal Text Body */}
        <div style={{ display: 'grid', gap: 32, fontSize: 14.5, color: 'var(--ink)', lineHeight: 1.75 }}>
          {/* Section 1 */}
          <section style={{ padding: '24px', borderRadius: 16, background: 'var(--paper)', border: '1px solid var(--line)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#137A43' }}>1.</span> Electronic Intermediary Status (Section 79, IT Act, 2000)
            </h2>
            <p>
              Community of Employees (&quot;COE&quot;, &quot;Platform&quot;) operates solely as a technology and communication intermediary as defined under <strong>Section 2(1)(w)</strong> of the Information Technology Act, 2000 (as amended) and complies strictly with the <strong>Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021</strong>.
            </p>
            <p style={{ marginTop: 10 }}>
              COE provides an automated reverse-auction and request-for-proposal (&quot;RFP&quot;) matching engine connecting enterprise corporate buyers with independent third-party venues, sports complexes, hotels, farmhouses, and banquet providers. COE does not initiate the transmission, select the receiver of the transmission, or modify the procurement information contained in the bids.
            </p>
          </section>

          {/* Section 2 */}
          <section style={{ padding: '24px', borderRadius: 16, background: 'var(--paper)', border: '1px solid var(--line)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#FF6B2C' }}>2.</span> No Ownership, Operation, or Principal-Agent Relationship
            </h2>
            <p>
              COE is <strong>not</strong> an event management company, venue operator, real estate broker, caterer, sports organizer, or hospitality provider. Every venue, sports turf, or banquet space listed on the Platform is owned, operated, and maintained by an independent statutory business entity (Pvt Ltd, Partnership, Proprietorship, or LLP).
            </p>
            <p style={{ marginTop: 10 }}>
              Listing a venue on the platform or participating in a reverse-auction bid does not establish any partnership, joint venture, employer-employee, or agency relationship between COE and the venue partner.
            </p>
          </section>

          {/* Section 3 */}
          <section style={{ padding: '24px', borderRadius: 16, background: 'var(--paper)', border: '1px solid var(--line)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#2E6BFF' }}>3.</span> Direct B2B Contracting & Invoicing
            </h2>
            <p>
              All contracts, bookings, pricing terms, service level agreements (SLAs), and event execution parameters formed as an outcome of a reverse auction are legally binding contracts entered into <strong>directly between the Corporate Buyer and the respective Vendor Entity</strong> under the Indian Contract Act, 1872.
            </p>
            <p style={{ marginTop: 10 }}>
              All tax invoices, GST reconciliation filings, municipal entertainment tax compliance, and statutory certificates are issued directly by the registered vendor partner to the corporate client.
            </p>
          </section>

          {/* Section 4 */}
          <section style={{ padding: '24px', borderRadius: 16, background: 'var(--paper)', border: '1px solid var(--line)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#B23A7A' }}>4.</span> Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted under applicable Indian law, COE, its founders, directors, employees, and affiliates shall not be liable for:
            </p>
            <ul style={{ paddingLeft: 20, marginTop: 8, display: 'grid', gap: 6 }}>
              <li>Any bodily injury, property damage, accidents, or force majeure events occurring at any sports arena or party venue.</li>
              <li>Quality of food, beverages, hygiene, liquor licensing (Excise L-49/L-50), or fire safety certificates of third-party venues.</li>
              <li>Cancellation, schedule delays, weather interruptions, or disputes between buyers and sellers regarding on-ground amenities.</li>
              <li>Indirect, incidental, punitive, or consequential financial damages arising out of contract execution.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section style={{ padding: '24px', borderRadius: 16, background: 'var(--paper)', border: '1px solid var(--line)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#a855f7' }}>5.</span> Grievance Redressal Officer (Rule 3(2) IT Rules, 2021)
            </h2>
            <p>
              In accordance with the Information Technology Act, 2000 and the Rules made thereunder, the name and contact details of the Grievance Officer are provided below:
            </p>
            <div style={{ marginTop: 12, padding: '16px', borderRadius: 12, background: 'var(--cream-2)', border: '1px solid var(--line)' }}>
              <div><strong>Grievance Officer:</strong> Legal & Compliance Desk</div>
              <div style={{ marginTop: 4 }}><strong>Entity:</strong> Community of Employees (COE)</div>
              <div style={{ marginTop: 4 }}><strong>Address:</strong> DLF Cyber City, Building 10B, Phase II, Gurugram, Haryana 122002</div>
              <div style={{ marginTop: 4 }}><strong>Email:</strong> grievance@coe.com / legal@coe.com</div>
              <div style={{ marginTop: 4 }}><strong>Acknowledgment Time:</strong> Within 24 hours · <strong>Resolution Time:</strong> Within 15 days</div>
            </div>
          </section>
        </div>
      </main>

      <PreviewFooter />
    </div>
  );
}
