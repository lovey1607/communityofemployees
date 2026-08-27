'use client';
// Redirect /admin → /admin/dashboard
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminRoot() {
  const router = useRouter();
  useEffect(() => { router.replace('/admin/dashboard'); }, [router]);
  return null;
}
