'use client';
// ============================================================
// app/vendor/layout.tsx — Vendor Route Layout
// Auth guard + onboarding redirect if vendor profile is incomplete.
// Skips nav for /vendor/onboarding.
// ============================================================

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { VendorNav } from '@/components/nav/VendorNav';
import { useStore } from '@/store/useStore';

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, currentVendorProfile } = useStore();

  const isOnboarding = pathname === '/vendor/onboarding';

  useEffect(() => {
    if (!currentUser) {
      router.push('/');
      return;
    }
    if (currentUser.role === 'corporate') { router.push('/corporate/dashboard'); return; }
    if (currentUser.role === 'admin')     { router.push('/admin/dashboard'); return; }
    // Vendor without completed profile → onboarding
    if (!isOnboarding && !currentVendorProfile?.isCompleted) {
      router.push('/vendor/onboarding');
    }
  }, [currentUser, currentVendorProfile, router, isOnboarding]);

  if (isOnboarding) return <>{children}</>;

  return (
    <>
      <VendorNav />
      {children}
    </>
  );
}
