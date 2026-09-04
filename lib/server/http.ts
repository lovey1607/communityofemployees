// ============================================================
// lib/server/http.ts — Route handler helpers: JSON responses,
// typed errors, CSRF origin checks, client IP extraction.
// ============================================================

import 'server-only';
import { NextResponse } from 'next/server';
import { ZodError, type ZodType } from 'zod';
import { env } from './env';

export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly code: string = 'error',
    readonly details?: unknown
  ) {
    super(message);
  }
}

export const badRequest = (m: string, details?: unknown) => new HttpError(400, m, 'bad_request', details);
export const unauthorized = (m = 'You need to sign in to do that.') => new HttpError(401, m, 'unauthorized');
export const forbidden = (m = 'You do not have access to this resource.') => new HttpError(403, m, 'forbidden');
export const notFound = (m = 'Not found.') => new HttpError(404, m, 'not_found');
export const conflict = (m: string) => new HttpError(409, m, 'conflict');
export const tooManyRequests = (m: string, retryAfter?: number) =>
  new HttpError(429, m, 'rate_limited', retryAfter ? { retryAfterSeconds: retryAfter } : undefined);

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data }, { status: 200, ...init });
}

export function jsonError(error: unknown) {
  if (error instanceof HttpError) {
    return NextResponse.json(
      { ok: false, error: { code: error.code, message: error.message, details: error.details } },
      { status: error.status }
    );
  }
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'validation_failed',
          message: 'Some fields need fixing.',
          details: error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
        },
      },
      { status: 400 }
    );
  }
  // Never leak stack traces or driver messages to the client.
  console.error('[api] unhandled error', error);
  return NextResponse.json(
    { ok: false, error: { code: 'internal_error', message: 'Something went wrong on our side.' } },
    { status: 500 }
  );
}

/** Wraps a route handler so thrown HttpErrors become proper responses. */
export function route<Args extends unknown[]>(
  handler: (request: Request, ...args: Args) => Promise<Response>
) {
  return async (request: Request, ...args: Args): Promise<Response> => {
    try {
      return await handler(request, ...args);
    } catch (error) {
      return jsonError(error);
    }
  };
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]!.trim();
  return request.headers.get('x-real-ip') ?? '0.0.0.0';
}

/**
 * CSRF defence for cookie-authenticated state changes. The session cookie is
 * SameSite=Lax, which already blocks cross-site POSTs from forms; this is the
 * belt-and-braces check on Origin for anything that slips past.
 */
export function assertSameOrigin(request: Request): void {
  const method = request.method.toUpperCase();
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return;

  const origin = request.headers.get('origin');
  if (!origin) return; // same-origin fetches from some clients omit Origin

  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    throw forbidden('Invalid request origin.');
  }

  const allowed = new Set<string>();
  const host = request.headers.get('host');
  if (host) allowed.add(host);
  try {
    allowed.add(new URL(env.appUrl).host);
  } catch {
    /* APP_URL not set to a valid URL — fall back to Host only */
  }

  if (!allowed.has(originHost)) {
    throw forbidden('Cross-origin request blocked.');
  }
}

export async function parseJson<T>(request: Request, schema: ZodType<T>): Promise<T> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    throw badRequest('Request body must be valid JSON.');
  }
  return schema.parse(raw);
}
