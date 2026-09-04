// ============================================================
// proxy.ts — Edge-level request handling (Next.js 16 renamed `middleware`
// to `proxy`; same semantics).
//
// This does TWO things and no more:
//   1. Sets security response headers.
//   2. Cheaply redirects anonymous visitors away from private page routes,
//      as a UX nicety.
//
// It is NOT the access control. It cannot be: it only sees whether a cookie
// is *present*, not whether the session behind it is valid, approved or
// suspended. Every API route re-checks properly against the database
// (lib/server/guards.ts). Treat this file as a signpost, not a lock.
// ============================================================

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE = 'coe_session';

const PRIVATE_PREFIXES = ['/corporate', '/vendor', '/vendor-dashboard', '/admin'];
const PUBLIC_EXCEPTIONS = ['/admin/login'];

const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-DNS-Prefetch-Control': 'off',
  'Permissions-Policy': 'camera=(), microphone=(), payment=(), geolocation=(self)',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPrivate =
    PRIVATE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`)) &&
    !PUBLIC_EXCEPTIONS.includes(pathname);

  if (isPrivate && !request.cookies.has(SESSION_COOKIE)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.startsWith('/admin') ? '/admin/login' : '/';
    url.searchParams.set('next', pathname);
    const redirect = NextResponse.redirect(url);
    for (const [key, value] of Object.entries(SECURITY_HEADERS)) redirect.headers.set(key, value);
    return redirect;
  }

  const response = NextResponse.next();
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) response.headers.set(key, value);
  return response;
}

export const config = {
  matcher: [
    // Everything except Next internals and static files.
    '/((?!_next/static|_next/image|favicon.ico|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
