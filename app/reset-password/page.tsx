'use client';
// app/reset-password/page.tsx — lands here from the password-reset email.

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { api, describeApiError } from '@/lib/apiClient';
import { BlurredCyberHubBackground } from '@/components/canvas/BlurredCyberHubBackground';

function ResetPasswordInner() {
  const router = useRouter();
  const token = useSearchParams().get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('The two passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      await api.post('/api/auth/reset-password', { token, password });
      setDone(true);
      setTimeout(() => router.push('/'), 2500);
    } catch (err) {
      setError(describeApiError(err));
    } finally {
      setBusy(false);
    }
  };

  const field: React.CSSProperties = {
    width: '100%', padding: '12px 14px', borderRadius: 11, marginBottom: 12,
    border: '1px solid rgba(255,255,255,0.14)', background: 'rgba(255,255,255,0.04)',
    color: '#e8ecf5', fontSize: 14,
  };

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#0B0F17', padding: 24 }}>
      <BlurredCyberHubBackground />
      <div
        style={{
          position: 'relative', zIndex: 10, width: '100%', maxWidth: 420,
          background: 'rgba(11,15,23,0.92)', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 22, padding: 32,
        }}
      >
        <p style={{ margin: '0 0 6px', fontSize: 11, letterSpacing: '.16em', color: '#f97316', textTransform: 'uppercase' }}>
          Community of Employees
        </p>
        <h1 style={{ margin: '0 0 16px', fontSize: 21, fontWeight: 700, color: '#fff' }}>Set a new password</h1>

        {done ? (
          <>
            <p style={{ fontSize: 14, color: '#34d399', lineHeight: 1.6 }}>
              Password updated. Every existing session has been signed out. Taking you back…
            </p>
            <Link href="/" style={{ color: '#f97316', fontSize: 14 }}>Back to COE</Link>
          </>
        ) : !token ? (
          <p style={{ fontSize: 14, color: '#fb7185' }}>That link is missing its reset code.</p>
        ) : (
          <form onSubmit={submit}>
            <input
              type="password" required autoComplete="new-password" value={password}
              onChange={(e) => setPassword(e.target.value)} placeholder="New password" style={field}
            />
            <input
              type="password" required autoComplete="new-password" value={confirm}
              onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm new password" style={field}
            />
            <p style={{ margin: '0 0 14px', fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
              10+ characters, with a number or symbol somewhere in there.
            </p>
            {error && <p style={{ margin: '0 0 12px', fontSize: 13, color: '#fb7185' }}>{error}</p>}
            <button
              type="submit" disabled={busy}
              style={{
                width: '100%', padding: '13px', borderRadius: 12, border: 'none',
                background: '#f97316', color: '#0b0d12', fontWeight: 700, fontSize: 14,
                cursor: busy ? 'wait' : 'pointer', opacity: busy ? 0.6 : 1,
              }}
            >
              {busy ? 'Saving…' : 'Set new password'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordInner />
    </Suspense>
  );
}
