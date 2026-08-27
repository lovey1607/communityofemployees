'use client';
// Redirect /vendor → /vendor/dashboard
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VendorRoot() {
  const router = useRouter();
  useEffect(() => { router.replace('/vendor/dashboard'); }, [router]);
  return null;
}
