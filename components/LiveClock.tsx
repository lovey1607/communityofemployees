'use client';
// ============================================================
// components/LiveClock.tsx — Live time display with IST label
// ============================================================

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';

export function LiveClock() {
  const { theme } = useStore();
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
      setDate(
        now.toLocaleDateString('en-IN', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      );
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 2,
      }}
    >
      {/* Time */}
      <div
        style={{
          fontFamily: '"Courier New", Courier, monospace',
          fontSize: 'clamp(18px, 2.5vw, 26px)',
          fontWeight: 700,
          color: theme.primary,
          letterSpacing: '0.08em',
          lineHeight: 1,
          transition: 'color 0.5s',
          textShadow: `0 0 12px ${theme.primary}66`,
        }}
      >
        {time || '—'}
      </div>
      {/* Date */}
      <div
        style={{
          fontSize: 11,
          color: 'var(--ink-2)',
          letterSpacing: '0.05em',
          fontFamily: 'var(--font-body)',
        }}
      >
        {date}
      </div>
      {/* IST tag */}
      <div
        style={{
          fontSize: 9,
          fontWeight: 600,
          color: theme.primary,
          letterSpacing: '0.12em',
          opacity: 0.7,
        }}
      >
        IST
      </div>
    </div>
  );
}
