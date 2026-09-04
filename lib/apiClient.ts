// ============================================================
// lib/apiClient.ts — Thin fetch wrapper for the browser.
//
// Every call is same-origin with credentials, so the httpOnly session cookie
// rides along and no token is ever handled in JavaScript.
// ============================================================

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly code: string = 'error',
    readonly details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface ApiEnvelope<T> {
  ok: boolean;
  data?: T;
  error?: { code: string; message: string; details?: unknown };
}

async function request<T>(
  path: string,
  init: RequestInit & { json?: unknown } = {}
): Promise<T> {
  const { json, ...rest } = init;
  const headers = new Headers(rest.headers);
  if (json !== undefined) headers.set('content-type', 'application/json');

  let response: Response;
  try {
    response = await fetch(path, {
      ...rest,
      headers,
      credentials: 'same-origin',
      body: json !== undefined ? JSON.stringify(json) : rest.body,
    });
  } catch {
    throw new ApiError(0, 'Could not reach the server. Check your connection and try again.', 'network');
  }

  let payload: ApiEnvelope<T> | null = null;
  try {
    payload = (await response.json()) as ApiEnvelope<T>;
  } catch {
    /* empty or non-JSON body */
  }

  if (!response.ok || !payload?.ok) {
    const error = payload?.error;
    throw new ApiError(
      response.status,
      error?.message ?? 'Something went wrong. Please try again.',
      error?.code ?? 'error',
      error?.details
    );
  }
  return payload.data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, json?: unknown) => request<T>(path, { method: 'POST', json }),
  put: <T>(path: string, json?: unknown) => request<T>(path, { method: 'PUT', json }),
  patch: <T>(path: string, json?: unknown) => request<T>(path, { method: 'PATCH', json }),
  del: <T>(path: string, json?: unknown) => request<T>(path, { method: 'DELETE', json }),
};

/** Turns validation details from the API into a single readable line. */
export function describeApiError(error: unknown): string {
  if (error instanceof ApiError) {
    const details = error.details as { path?: string; message?: string }[] | undefined;
    if (Array.isArray(details) && details.length > 0) {
      return details.map((d) => (d.path ? `${d.path}: ${d.message}` : d.message)).join(' · ');
    }
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
}
