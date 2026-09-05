'use client';
// app/verify-email/page.tsx — lands here from the confirmation email.

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api, describeApiError } from '@/lib/apiClient';
import { BlurredCyberHubBackground } from '@/components/canvas/BlurredCyberHubBackground';

function VerifyEmailInner() {
  const params = useSearchParams();
  const token = params.get('token');
  const [state, setState] = useState<'working' | 'done' | 'failed'>('working');
  const [message, setMessage] = useState('Confirming your email address…');

  useEffect(() => {
    if (!token) {
      setState('failed');
      setMessage('That link is missing its confirmation code.');
      return;
    }
    let cancelled = false;
    api
      .post<{ nextStep: string }>('/api/auth/verify-email', { token })
      .then((data) => {
        if (cancelled) return;
        setState('done');
        setMessage(data.nextStep);
      })
      .catch((error) => {
        if (cancelled) return;
        setState('failed');
        setMessage(describeApiError(error));
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#0B0F17', padding: 24 }}>
      <BlurredCyberHubBackground />
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: 460,
          textAlign: 'center',
          background: 'rgba(11,15,23,0.92)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 22,
          padding: 32,
        }}
      >
        <p style={{ margin: '0 0 6px', fontSize: 11, letterSpacing: '.16em', color: '#f97316', textTransform: 'uppercase' }}>
          Community of Employees
        </p>
        <h1 style={{ margin: '0 0 12px', fontSize: 21, fontWeight: 700, color: '#fff' }}>
          {state === 'working' ? 'One moment…' : state === 'done' ? 'Email confirmed' : 'That link did not work'}
        </h1>
        <p style={{ margin: '0 0 22px', fontSize: 14, lineHeight: 1.6, color: 'rgba(255,255,255,0.68)' }}>{message}</p>
        <Link
          href="/"
          style={{
            display: 'inline-block', padding: '11px 20px', borderRadius: 11,
            background: '#f97316', color: '#0B0F17', fontWeight: 700, fontSize: 14, textDecoration: 'none',
          }}
        >
          Back to COE
        </Link>
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailInner />
    </Suspense>
  );
}
