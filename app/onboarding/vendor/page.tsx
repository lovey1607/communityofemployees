'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectVendorOnboarding() {
  const router = useRouter();
  useEffect(() => { router.replace('/vendor/onboarding'); }, [router]);
  return null;
}
