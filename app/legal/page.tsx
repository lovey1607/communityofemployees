'use client';
// ============================================================
// app/legal/page.tsx — Master Legal, Privacy & Platform Liability Document
// Comprehensive Indian Statutory Compliance:
// - Information Technology Act, 2000 (Section 79 Safe Harbor)
// - IT (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021
// - Digital Personal Data Protection (DPDP) Act, 2023
// - Indian Contract Act, 1872
// ============================================================

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Scale, ShieldCheck, Printer, Building2, ExternalLink, Lock, FileText } from 'lucide-react';
import { PreviewFooter } from '@/components/venture/PreviewFooter';

export default function MasterLegalPage() {
  const handlePrint = () => {
    if (typeof window !== 'undefined') window.print();
  };

  return (
    <div style={{ background: 'var(--cream)', color: 'var(--ink-2)', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Sticky Navigation */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          padding: '14px 24px',
          background: 'var(--paper)',
          borderBottom: '1px solid var(--line)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Link
          href="/"
          style={{
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: '#137A43',
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Marketplace Homepage</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={handlePrint}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              background: 'var(--ink)',
              border: '1px solid var(--ink)',
              color: '#ffffff',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Printer size={13} />
            <span>Print Legal Document</span>
          </button>
        </div>
      </header>

      {/* Main Document Layout */}
      <main style={{ maxWidth: 860, margin: '0 auto', padding: '50px 24px 80px' }}>
        {/* Document Header Box */}
        <div
          style={{
            background: 'var(--paper)',
            border: '1px solid var(--line)',
            borderRadius: 12,
            padding: '36px 32px',
            marginBottom: 36,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#137A43', fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
            <Scale size={16} /> STATUTORY COMPLIANCE & LEGAL NOTICE
          </div>
          <h1
            style={{
              fontSize: 'clamp(24px, 3vw, 32px)',
              fontWeight: 800,
              color: 'var(--ink)',
              lineHeight: 1.3,
              marginBottom: 12,
              letterSpacing: '-0.02em',
            }}
          >
            Privacy, Platform Liability & Intermediary Policy
          </h1>
          <div style={{ fontSize: 13, color: '#7A7169', lineHeight: 1.6 }}>
            <strong>Entity:</strong> Community of Employees (COE)<br />
            <strong>Jurisdiction:</strong> Republic of India (Applicable to Delhi NCR Pilot & Pan-India Operations)<br />
            <strong>Effective Date:</strong> 1st January 2026 · Version 2.1 (DPDP Act, 2023 & IT Rules, 2021 Compliant)
          </div>
        </div>

        {/* Structured Legal Clauses */}
        <div
          style={{
            display: 'grid',
            gap: 28,
            fontSize: 14,
            lineHeight: 1.8,
            color: 'var(--ink-2)',
          }}
        >
          {/* Clause 1 */}
          <section style={{ borderBottom: '1px solid var(--line)', paddingBottom: 24 }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: 'var(--ink)', marginBottom: 10 }}>
              1. Statutory Intermediary Status (Section 79, IT Act, 2000)
            </h2>
            <p>
              Community of Employees (&quot;<strong>COE</strong>&quot;, &quot;<strong>Platform</strong>&quot;) is an electronic marketplace and communication intermediary as defined under <strong>Section 2(1)(w) of the Information Technology Act, 2000</strong> (as amended) and operates in strict accordance with the <strong>Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021</strong>.
            </p>
            <p style={{ marginTop: 8 }}>
              COE solely provides an automated technology network facilitating reverse-auction discovery between corporate entities (&quot;<strong>Corporate Buyers</strong>&quot;) and independent third-party venues, sports complexes, hotels, farmhouses, and caterers (&quot;<strong>Venue Partners</strong>&quot;). COE does not initiate the transmission, select the receiver of the transmission, or modify the procurement information contained in the bids. COE enjoys statutory exemption from liability under <strong>Section 79(1) of the Information Technology Act, 2000</strong>.
            </p>
          </section>

          {/* Clause 2 */}
          <section style={{ borderBottom: '1px solid var(--line)', paddingBottom: 24 }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: 'var(--ink)', marginBottom: 10 }}>
              2. Nature of Platform & Non-Operator Disclaimer
            </h2>
            <p>
              COE is <strong>not</strong> an event management agency, venue owner, property operator, broker, caterer, sports tournament organizer, or travel agency.
            </p>
            <ul style={{ paddingLeft: 22, marginTop: 8, display: 'grid', gap: 6 }}>
              <li>Every sports facility, box cricket turf, banquet hall, microbrewery, or resort listed on the platform is independently owned and operated by an autonomous statutory entity (Pvt Ltd, Partnership, Proprietorship, or LLP).</li>
              <li>COE does not inspect, guarantee, or warrant the physical structural safety, air conditioning, turf quality, floodlight luminance, sound levels, or aesthetic conditions of any physical premises.</li>
              <li>Listing a venue on the platform does not create any joint venture, partnership, franchise, employment, or agency relationship between COE and the venue partner.</li>
            </ul>
          </section>

          {/* Clause 3 */}
          <section style={{ borderBottom: '1px solid var(--line)', paddingBottom: 24 }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: 'var(--ink)', marginBottom: 10 }}>
              3. On-Ground Service Execution, Licenses & Statutory Permits
            </h2>
            <p>
              The Venue Partner bears the sole legal responsibility for:
            </p>
            <ul style={{ paddingLeft: 22, marginTop: 8, display: 'grid', gap: 6 }}>
              <li><strong>Liquor & Excise Compliance:</strong> Obtaining and displaying valid excise licenses (e.g., Excise L-49 / L-50 one-day liquor permits in Haryana/Delhi) and ensuring compliance with the Punjab Excise Act (as applicable to Haryana) and Delhi Excise Act.</li>
              <li><strong>Food Safety & Hygiene:</strong> Compliance with Food Safety and Standards Authority of India (FSSAI) regulations, kitchen hygiene standards, and ingredient quality.</li>
              <li><strong>Municipal & Fire Safety:</strong> Maintaining valid Fire Safety NOCs, local municipal trade licenses, occupancy clearances, and emergency exits.</li>
              <li><strong>Safety & Medical First Aid:</strong> Ensuring referee qualifications, first-aid kits on turf complexes, security staff, and adherence to noise curfew limits.</li>
            </ul>
            <p style={{ marginTop: 8 }}>
              COE expressly disclaims all liability for food poisoning, alcohol over-serving, noise violations, fire hazards, equipment failure, bodily injuries, or police/excise enforcement actions occurring on the venue premises.
            </p>
          </section>

          {/* Clause 4 */}
          <section style={{ borderBottom: '1px solid var(--line)', paddingBottom: 24 }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: 'var(--ink)', marginBottom: 10 }}>
              4. Direct B2B Contracting & Invoicing (Indian Contract Act, 1872)
            </h2>
            <p>
              When a Corporate Buyer awards a reverse-auction bid to a Venue Partner, a legally enforceable bilateral contract is formed <strong>directly between the Corporate Buyer and the Venue Partner</strong> under the <strong>Indian Contract Act, 1872</strong>.
            </p>
            <p style={{ marginTop: 8 }}>
              All tax invoices, GSTIN debit/credit notes, payment schedules, cancellation fees, and refund reconciliations are executed directly between the respective corporate accounts and vendor entities. COE is not a party to the contractual consideration and does not collect payments on behalf of venues as a payment aggregator unless explicitly contracted under a written tripartite escrow agreement.
            </p>
          </section>

          {/* Clause 5 */}
          <section style={{ borderBottom: '1px solid var(--line)', paddingBottom: 24 }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: 'var(--ink)', marginBottom: 10 }}>
              5. Privacy Policy & Digital Personal Data Protection (DPDP) Act, 2023
            </h2>
            <p>
              COE respects the privacy of corporate representatives and venue partners in accordance with the <strong>Digital Personal Data Protection Act, 2023</strong> (&quot;DPDP Act&quot;):
            </p>
            <ul style={{ paddingLeft: 22, marginTop: 8, display: 'grid', gap: 6 }}>
              <li><strong>Purpose Limitation:</strong> Contact information (name, official corporate email, phone number, GSTIN) is processed strictly to enable reverse auctions, statutory verification, and RFP matching.</li>
              <li><strong>No Data Monetization:</strong> COE does not sell, rent, or distribute corporate employee data to third-party marketing brokers or advertisers.</li>
              <li><strong>Blind Bidding Confidentiality:</strong> During live reverse auctions, vendor pricing proposals are anonymized to prevent price collusion and protect proprietary commercial margins.</li>
              <li><strong>Data Principal Rights:</strong> Users have the right to access, rectify, or request deletion of their profile data by emailing <strong>contact@communityofemployees.com</strong>.</li>
            </ul>
          </section>

          {/* Clause 6 */}
          <section style={{ borderBottom: '1px solid var(--line)', paddingBottom: 24 }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: 'var(--ink)', marginBottom: 10 }}>
              6. Limitation of Liability & Force Majeure
            </h2>
            <p>
              Under no circumstances shall COE, its founders, officers, employees, or technical contractors be liable for any direct, indirect, punitive, incidental, special, or consequential damages arising out of:
            </p>
            <ul style={{ paddingLeft: 22, marginTop: 8, display: 'grid', gap: 6 }}>
              <li>Event cancellations due to rain, weather disruptions, civic unrest, electrical grid outages, or governmental restrictions.</li>
              <li>Failure of a venue partner to honor the confirmed pricing, menu items, or timing slots.</li>
              <li>Disputes regarding GST input tax credit (ITC) eligibility or mismatch in GSTR-1/GSTR-3B filings by independent vendor partners.</li>
            </ul>
          </section>

          {/* Clause 7 */}
          <section style={{ borderBottom: '1px solid var(--line)', paddingBottom: 24 }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: 'var(--ink)', marginBottom: 10 }}>
              7. Statutory Grievance Redressal Officer (Rule 3(2), IT Rules 2021)
            </h2>
            <p>
              For grievances, legal notices, or compliance inquiries, the designated Grievance Officer under the Information Technology Act, 2000 is:
            </p>
            <div style={{ marginTop: 12, padding: '16px 20px', borderRadius: 8, background: 'var(--cream-2)', border: '1px solid var(--line)', fontSize: 13 }}>
              <div><strong>Designation:</strong> Grievance Redressal & Legal Compliance Officer</div>
              <div style={{ marginTop: 4 }}><strong>Organization:</strong> Community of Employees (COE)</div>
              <div style={{ marginTop: 4 }}><strong>Office:</strong> Building 10B, DLF Cyber City, Phase II, Gurugram, Haryana 122002</div>
              <div style={{ marginTop: 4 }}><strong>Email:</strong> contact@communityofemployees.com</div>
              <div style={{ marginTop: 4 }}><strong>Resolution SLA:</strong> Acknowledged within 24 hours; resolved within 15 working days.</div>
            </div>
          </section>

          {/* Clause 8 */}
          <section>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: 'var(--ink)', marginBottom: 10 }}>
              8. Governing Law & Exclusive Jurisdiction
            </h2>
            <p>
              This document, the platform terms, and any legal disputes arising out of the use of COE shall be governed by and construed in accordance with the substantive <strong>laws of the Republic of India</strong>. The courts and dispute tribunals at <strong>Gurugram, Haryana / New Delhi</strong> shall have exclusive jurisdiction over all claims and proceedings.
            </p>
          </section>
        </div>
      </main>

      <PreviewFooter />
    </div>
  );
}
