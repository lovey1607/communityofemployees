'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectCorporateOnboarding() {
  const router = useRouter();
  useEffect(() => { router.replace('/corporate/onboarding'); }, [router]);
  return null;
}
