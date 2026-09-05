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
    border: '1px solid var(--line)', background: 'var(--cream-2)',
    color: 'var(--ink)', fontSize: 14,
  };

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#FFF7EC', padding: 24 }}>
      <BlurredCyberHubBackground />
      <div
        style={{
          position: 'relative', zIndex: 10, width: '100%', maxWidth: 420,
          background: 'var(--paper)', border: '1px solid var(--line)',
          borderRadius: 22, padding: 32,
        }}
      >
        <p style={{ margin: '0 0 6px', fontSize: 11, letterSpacing: '.16em', color: '#FF6B2C', textTransform: 'uppercase' }}>
          Community of Employees
        </p>
        <h1 style={{ margin: '0 0 16px', fontSize: 21, fontWeight: 700, color: 'var(--ink)' }}>Set a new password</h1>

        {done ? (
          <>
            <p style={{ fontSize: 14, color: '#137A43', lineHeight: 1.6 }}>
              Password updated. Every existing session has been signed out. Taking you back…
            </p>
            <Link href="/" style={{ color: '#FF6B2C', fontSize: 14 }}>Back to COE</Link>
          </>
        ) : !token ? (
          <p style={{ fontSize: 14, color: '#B3261E' }}>That link is missing its reset code.</p>
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
            <p style={{ margin: '0 0 14px', fontSize: 12, color: 'var(--ink-2)' }}>
              10+ characters, with a number or symbol somewhere in there.
            </p>
            {error && <p style={{ margin: '0 0 12px', fontSize: 13, color: '#B3261E' }}>{error}</p>}
            <button
              type="submit" disabled={busy}
              style={{
                width: '100%', padding: '13px', borderRadius: 12, border: 'none',
                background: '#FF6B2C', color: '#FFF7EC', fontWeight: 700, fontSize: 14,
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
