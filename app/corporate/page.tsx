'use client';
// Redirect /corporate → /corporate/dashboard
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CorporateRoot() {
  const router = useRouter();
  useEffect(() => { router.replace('/corporate/dashboard'); }, [router]);
  return null;
}
