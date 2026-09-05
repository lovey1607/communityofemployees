'use client';
// ============================================================
// app/admin/layout.tsx — Admin Route Layout
// Strictly isolated navigation & role guard for Super Admin.
// The /admin/login route renders without the AdminNav wrapper.
// ============================================================

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AdminNav } from '@/components/nav/AdminNav';
import { useStore } from '@/store/useStore';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, hydrated, loadAdminData } = useStore();
  const [authorized, setAuthorized] = useState(false);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (!hydrated) return;
    if (!isLoginPage) {
      // If logged in as wrong role, redirect to their correct dashboard
      if (currentUser && currentUser.role !== 'admin') {
        if (currentUser.role === 'corporate') router.push('/corporate/dashboard');
        else if (currentUser.role === 'vendor') router.push('/vendor/dashboard');
        return;
      }
      // If not logged in at all, redirect to admin login
      if (!currentUser) {
        router.push('/admin/login');
        return;
      }
    }
    setAuthorized(true);
  }, [hydrated, currentUser, router, isLoginPage]);

  useEffect(() => {
    if (hydrated && !isLoginPage && currentUser?.role === 'admin') void loadAdminData();
  }, [hydrated, currentUser, isLoginPage, loadAdminData]);

  // Login page: render without any admin nav chrome
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Block render until authorization is confirmed (prevents flash of admin UI)
  if (!authorized) return null;

  return (
    <>
      <AdminNav />
      {children}
    </>
  );
}
