'use client';
// ============================================================
// app/admin/login/page.tsx — Hidden Super Admin Login
// Completely isolated from the public UI.
// Only accessible at /admin/login.
// ============================================================

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { BlurredCyberHubBackground } from '@/components/canvas/BlurredCyberHubBackground';
import { Shield, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const { loginWithPassword } = useStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    const loginEmail = email.trim();

    if (!loginEmail || !loginEmail.includes('@')) {
      setError('Enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    const result = await loginWithPassword(loginEmail, password);
    setLoading(false);
    if (!result.success) {
      setError(result.message);
      return;
    }
    // The server decides what an admin is; this only picks where to land.
    if (useStore.getState().currentUser?.role !== 'admin') {
      setError('That account does not have admin access.');
      return;
    }
    router.push('/admin/dashboard');
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        background: '#05060e',
        padding: '24px',
      }}
    >
      <BlurredCyberHubBackground />

      {/* Security watermark background text */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          zIndex: 1,
          fontSize: 'clamp(60px, 14vw, 160px)',
          fontWeight: 900,
          color: 'rgba(234, 179, 8, 0.025)',
          fontFamily: 'var(--font-display)',
          letterSpacing: '-0.04em',
          userSelect: 'none',
        }}
      >
        ADMIN
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: 420,
        }}
      >
        {/* Card */}
        <div
          style={{
            borderRadius: 24,
            overflow: 'hidden',
            background: '#0B0F17',
            border: '1.5px solid rgba(234, 179, 8, 0.25)',
            boxShadow: '0 40px 100px rgba(0,0,0,0.9), 0 0 60px rgba(234,179,8,0.06)',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '32px 32px 24px',
              background: 'linear-gradient(145deg, rgba(234, 179, 8, 0.1) 0%, transparent 70%)',
              borderBottom: '1px solid rgba(234, 179, 8, 0.15)',
              textAlign: 'center',
            }}
          >
            {/* Icon */}
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: 'rgba(234, 179, 8, 0.15)',
                border: '1px solid rgba(234, 179, 8, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#eab308',
                margin: '0 auto 16px',
                boxShadow: '0 8px 24px rgba(234,179,8,0.2)',
              }}
            >
              <Shield size={26} />
            </div>

            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 24,
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '-0.025em',
                marginBottom: 6,
              }}
            >
              Super Admin Access
            </h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
              Restricted platform governance portal.
              <br />
              Unauthorised access is monitored and logged.
            </p>
          </div>

          {/* Form */}
          <div style={{ padding: '28px 32px 32px' }}>
            <form onSubmit={handleLogin}>
              {/* Email */}
              <div style={{ marginBottom: 14 }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'rgba(255,255,255,0.55)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: 6,
                  }}
                >
                  Administrator Email
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={14}
                    style={{
                      position: 'absolute',
                      left: 13,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#eab308',
                    }}
                  />
                  <input
                    className="input-base"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@communityofemployees.com"
                    style={{ paddingLeft: 36, fontSize: 13.5 }}
                  />
                </div>
              </div>

              {/* Password */}
              <div style={{ marginBottom: 24 }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'rgba(255,255,255,0.55)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: 6,
                  }}
                >
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={14}
                    style={{
                      position: 'absolute',
                      left: 13,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#eab308',
                    }}
                  />
                  <input
                    className="input-base"
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{ paddingLeft: 36, paddingRight: 40, fontSize: 13.5 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'rgba(255,255,255,0.4)',
                      cursor: 'pointer',
                      display: 'flex',
                    }}
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div
                  style={{
                    marginBottom: 14,
                    padding: '9px 14px',
                    borderRadius: 10,
                    background: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#f87171',
                    fontSize: 12.5,
                    fontWeight: 600,
                  }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '13px',
                  borderRadius: 12,
                  border: 'none',
                  background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
                  color: '#0B0F17',
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 8px 24px rgba(234,179,8,0.3)',
                  fontFamily: 'var(--font-body)',
                  transition: 'all 0.2s ease',
                }}
              >
                {loading ? 'Authenticating…' : 'Access Admin Control Center'}
                {!loading && <ArrowRight size={16} />}
              </button>
            </form>

            {/* Demo access for testing */}
            <div
              style={{
                marginTop: 20,
                borderRadius: 12,
                padding: '12px 14px',
                background: 'rgba(234, 179, 8, 0.06)',
                border: '1px solid rgba(234, 179, 8, 0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 800,
                  color: '#eab308',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Restricted
              </span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>
                Admin accounts are created by an existing admin.
              </span>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p
          style={{
            textAlign: 'center',
            marginTop: 16,
            fontSize: 11.5,
            color: 'rgba(255,255,255,0.25)',
            fontWeight: 600,
          }}
        >
          This page is not linked from any public surface.
        </p>
      </motion.div>
    </main>
  );
}
