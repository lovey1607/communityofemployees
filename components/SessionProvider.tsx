'use client';
// ============================================================
// components/SessionProvider.tsx
//
// Asks the server who the current user is, once, on load. Nothing about
// identity is read from localStorage any more, so this is the only source
// of truth on the client.
// ============================================================

import { useEffect } from 'react';
import { useStore } from '@/store/useStore';

export function SessionProvider() {
  const hydrateSession = useStore((s) => s.hydrateSession);

  useEffect(() => {
    void hydrateSession();
  }, [hydrateSession]);

  return null;
}
