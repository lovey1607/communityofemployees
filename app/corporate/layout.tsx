'use client';
// ============================================================
// app/corporate/layout.tsx — Corporate Route Layout
// Auth guard: must be logged in as 'corporate'. Onboarding redirect if no profile.
// Skips nav injection for /corporate/onboarding.
// ============================================================

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { CorporateNav } from '@/components/nav/CorporateNav';
import { useStore } from '@/store/useStore';

export default function CorporateLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, currentCorporateProfile } = useStore();

  const isOnboarding = pathname === '/corporate/onboarding';

  useEffect(() => {
    if (!currentUser) {
      router.push('/');
      return;
    }
    if (currentUser.role === 'vendor') { router.push('/vendor/dashboard'); return; }
    if (currentUser.role === 'admin')   { router.push('/admin/dashboard'); return; }
    // Corporate user without a completed profile → onboarding
    if (!isOnboarding && !currentCorporateProfile?.isCompleted) {
      router.push('/corporate/onboarding');
    }
  }, [currentUser, currentCorporateProfile, router, isOnboarding]);

  if (isOnboarding) return <>{children}</>;

  return (
    <>
      <CorporateNav />
      {children}
    </>
  );
}
