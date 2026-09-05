'use client';
// ============================================================
// components/auth/DeleteAccountButton.tsx
//
// Closing an account is irreversible, so the server requires the account
// password. This is the one place that collects it.
// ============================================================

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { AlertTriangle, X } from 'lucide-react';

export function DeleteAccountButton({
  label = 'Yes, delete my account',
  style,
}: {
  label?: string;
  style?: React.CSSProperties;
}) {
  const router = useRouter();
  const { deleteAccount } = useStore();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    const result = await deleteAccount(password);
    setBusy(false);
    if (!result.success) {
      setError(result.message);
      return;
    }
    setOpen(false);
    router.push('/');
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          flex: 2,
          padding: '8px',
          borderRadius: 10,
          border: 'none',
          background: '#C2321C',
          color: '#ffffff',
          fontSize: 12.5,
          fontWeight: 700,
          cursor: 'pointer',
          fontFamily: 'var(--font-body)',
          ...style,
        }}
      >
        {label}
      </button>

      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={submit}
            style={{
              width: '100%',
              maxWidth: 420,
              background: 'var(--paper)',
              border: '1px solid var(--line)',
              borderRadius: 20,
              padding: 24,
              position: 'relative',
            }}
          >
            <button
              type="button"
              aria-label="Close"
              onClick={() => setOpen(false)}
              style={{
                position: 'absolute', top: 14, right: 14, background: 'none',
                border: 'none', color: 'var(--muted)', cursor: 'pointer',
              }}
            >
              <X size={17} />
            </button>

            <div style={{ display: 'flex', gap: 9, alignItems: 'center', marginBottom: 10 }}>
              <AlertTriangle size={18} color="#C2321C" />
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--ink)' }}>
                Close your account
              </h3>
            </div>
            <p style={{ margin: '0 0 16px', fontSize: 13, lineHeight: 1.6, color: 'var(--muted)' }}>
              Your open requirements are cancelled and any live bids withdrawn. Records already
              awarded stay on file. This cannot be undone — enter your password to confirm.
            </p>

            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              style={{
                width: '100%',
                padding: '11px 13px',
                borderRadius: 10,
                border: '1px solid var(--line)',
                background: 'var(--paper)',
                color: 'var(--ink)',
                fontSize: 14,
                marginBottom: 12,
              }}
            />
            {error && (
              <p style={{ margin: '0 0 12px', fontSize: 12.5, color: '#B3261E' }}>{error}</p>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={() => setOpen(false)}
                style={{
                  flex: 1, padding: '10px', borderRadius: 10, cursor: 'pointer',
                  border: '1px solid var(--line)',
                  background: 'transparent', color: 'var(--ink)',
                  fontSize: 13, fontWeight: 600,
                }}
              >
                Keep my account
              </button>
              <button
                type="submit"
                disabled={busy}
                style={{
                  flex: 1, padding: '10px', borderRadius: 10, border: 'none',
                  background: '#C2321C', color: '#ffffff', fontSize: 13, fontWeight: 700,
                  cursor: busy ? 'wait' : 'pointer', opacity: busy ? 0.6 : 1,
                }}
              >
                {busy ? 'Closing…' : 'Close account'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
