'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectVendorDashboard() {
  const router = useRouter();
  useEffect(() => { router.replace('/vendor/dashboard'); }, [router]);
  return null;
}
