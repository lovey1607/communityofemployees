'use client';
// ============================================================
// components/venture/ContactSection.tsx
// Enterprise Inquiries & VIP Pilot Demo Scheduling Form
// Direct lead capture with 10-digit Indian validation and instant feedback
// ============================================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Mail, Phone, MapPin, Send, CheckCircle2,
  Calendar, ShieldCheck, Sparkles, MessageSquare, ArrowRight
} from 'lucide-react';

const HUBS = [
  'DLF Cyber City & Cyber Hub, Gurugram',
  'Golf Course Road (Horizon Center), Gurugram',
  'Sector 29 Market & Leisure Valley, Gurugram',
  'Golf Course Extension Rd (Sector 62/63), Gurugram',
  'Sohna Road & Sector 48/49, Gurugram',
  'Aerocity & Central Delhi',
  'Noida Sector 62 / Expressway',
  'Other Delhi NCR Location',
];

export function ContactSection() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [company, setCompany] = useState('');
  const [hub, setHub] = useState(HUBS[0]);
  const [interestType, setInterestType] = useState<'corporate' | 'vendor'>('corporate');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const isMobileValid = /^[6-9]\d{9}$/.test(mobile);
  const isEmailValid = email.includes('@') && email.includes('.');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !isEmailValid || !isMobileValid || !company) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 500);
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 11,
    fontWeight: 700,
    color: 'rgba(255,255,255,0.65)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: 6,
  };

  return (
    <div id="contact" style={{ scrollMarginTop: 100 }}>
      <div
        style={{
          borderRadius: 24,
          background: 'linear-gradient(145deg, rgba(11,15,23,0.95) 0%, rgba(15,23,42,0.9) 100%)',
          border: '1.5px solid rgba(16, 185, 129, 0.25)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.85)',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 0 }}>
          {/* Left Column: Direct Info & Hub Details */}
          <div
            style={{
              padding: '36px',
              background: 'linear-gradient(160deg, rgba(16,185,129,0.12) 0%, transparent 60%)',
              borderRight: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '3px 10px',
                  borderRadius: 999,
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#34d399',
                  fontSize: 11,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: 12,
                }}
              >
                <Sparkles size={12} /> ENTERPRISE PILOT ACCESS
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 8 }}>
                Connect with the Reverse-Bidding Network
              </h3>
              <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, marginBottom: 26 }}>
                Whether you are an enterprise HR/procurement team seeking 20%+ savings, or a verified venue looking to bid on verified corporate event RFPs.
              </p>

              {/* Office Location Box */}
              <div style={{ display: 'grid', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', flexShrink: 0 }}>
                    <MapPin size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#ffffff' }}>Delhi NCR Operational Hub</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>
                      Building 10B, DLF Cyber City, Phase II, Gurugram, Haryana 122002
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(14,165,233,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0ea5e9', flexShrink: 0 }}>
                    <Mail size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#ffffff' }}>Enterprise Procurement Desk</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>
                      contact@communityofemployees.com
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(249,115,22,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f97316', flexShrink: 0 }}>
                    <Phone size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#ffffff' }}>Gurugram Operations Line</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>
                      +91 98112 00000 (Mon - Sat, 9:00 AM - 8:00 PM)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Lead Form */}
          <div style={{ padding: '36px' }}>
            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                >
                  {/* Persona Picker */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>I am reaching out as a:</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => setInterestType('corporate')}
                        style={{
                          padding: '10px',
                          borderRadius: 10,
                          border: interestType === 'corporate' ? '1.5px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
                          background: interestType === 'corporate' ? 'rgba(16,185,129,0.18)' : 'rgba(255,255,255,0.03)',
                          color: interestType === 'corporate' ? '#ffffff' : 'rgba(255,255,255,0.6)',
                          fontSize: 12.5,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        🏢 Corporate HR / Buyer
                      </button>
                      <button
                        type="button"
                        onClick={() => setInterestType('vendor')}
                        style={{
                          padding: '10px',
                          borderRadius: 10,
                          border: interestType === 'vendor' ? '1.5px solid #f97316' : '1px solid rgba(255,255,255,0.1)',
                          background: interestType === 'vendor' ? 'rgba(249,115,22,0.18)' : 'rgba(255,255,255,0.03)',
                          color: interestType === 'vendor' ? '#ffffff' : 'rgba(255,255,255,0.6)',
                          fontSize: 12.5,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        🏪 Venue / Sports Partner
                      </button>
                    </div>
                  </div>

                  {/* Name & Email */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                    <div>
                      <label style={labelStyle}>Full Name *</label>
                      <input
                        className="input-base"
                        placeholder="e.g. Rahul Sharma"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Work Email *</label>
                      <input
                        className="input-base"
                        type="email"
                        placeholder="rahul@company.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Company & Phone */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                    <div>
                      <label style={labelStyle}>Organization / Facility Name *</label>
                      <input
                        className="input-base"
                        placeholder="e.g. Nexus Tech / PlayAll"
                        required
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Mobile (10 Digits) *</label>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span
                          style={{
                            padding: '9px 12px',
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.12)',
                            borderRight: 'none',
                            borderTopLeftRadius: 10,
                            borderBottomLeftRadius: 10,
                            color: 'rgba(255,255,255,0.8)',
                            fontSize: 12.5,
                            fontWeight: 800,
                          }}
                        >
                          +91
                        </span>
                        <input
                          className="input-base"
                          type="tel"
                          placeholder="98112 00000"
                          maxLength={10}
                          style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Hub */}
                  <div style={{ marginBottom: 12 }}>
                    <label style={labelStyle}>Preferred Delhi NCR Hub</label>
                    <select
                      className="input-base"
                      value={hub}
                      onChange={(e) => setHub(e.target.value)}
                    >
                      {HUBS.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Message Brief */}
                  <div style={{ marginBottom: 18 }}>
                    <label style={labelStyle}>Event Requirements / Venue Pitch</label>
                    <textarea
                      className="input-base"
                      rows={2}
                      placeholder="e.g. Planning a 120-pax inter-office box cricket tournament in Sector 62..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !name || !isEmailValid || !isMobileValid || !company}
                    style={{
                      width: '100%',
                      padding: '13px',
                      borderRadius: 11,
                      border: 'none',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: '#ffffff',
                      fontSize: 13.5,
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      opacity: (!name || !isEmailValid || !isMobileValid || !company || loading) ? 0.45 : 1,
                      boxShadow: '0 6px 20px rgba(16,185,129,0.3)',
                    }}
                  >
                    {loading ? 'Submitting Application…' : 'Schedule Corporate Consultation & Access'}
                    {!loading && <ArrowRight size={15} />}
                  </button>
                </motion.form>
              ) : (
                <motion.div
                  key="success"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  style={{ textAlign: 'center', padding: '24px 16px' }}
                >
                  <div
                    style={{
                      width: 54,
                      height: 54,
                      borderRadius: '50%',
                      background: 'rgba(16,185,129,0.2)',
                      border: '2px solid #10b981',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#10b981',
                      marginBottom: 14,
                      boxShadow: '0 0 24px rgba(16,185,129,0.4)',
                    }}
                  >
                    <CheckCircle2 size={28} />
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, color: '#ffffff', marginBottom: 6 }}>
                    Inquiry Received Successfully!
                  </h3>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, maxWidth: 360, margin: '0 auto 18px' }}>
                    Thank you <strong style={{ color: '#ffffff' }}>{name}</strong>. Our Gurugram Enterprise Lead will connect with you at <strong style={{ color: '#10b981' }}>{email}</strong> shortly.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setName(''); setEmail(''); setMobile(''); setCompany(''); setMessage(''); }}
                    style={{
                      padding: '8px 18px',
                      borderRadius: 9,
                      border: '1px solid rgba(255,255,255,0.15)',
                      background: 'rgba(255,255,255,0.05)',
                      color: '#ffffff',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Send Another Inquiry
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
