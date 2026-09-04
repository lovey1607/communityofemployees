// ============================================================
// lib/db/index.ts — PostgreSQL connection pool + Drizzle client.
// A single pool is cached on globalThis so Next.js dev hot-reloads
// and serverless warm invocations reuse connections.
// ============================================================

import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>;

const globalForDb = globalThis as unknown as {
  __coePool?: Pool;
  __coeDb?: DrizzleDb;
};

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      'DATABASE_URL is not set. Copy .env.example to .env.local and point it at a PostgreSQL database.'
    );
  }
  // Managed Postgres (Neon/Supabase/RDS) needs TLS; a local dev socket does not.
  const isLocal = /@(localhost|127\.0\.0\.1)/.test(connectionString);
  return new Pool({
    connectionString,
    max: Number(process.env.DATABASE_POOL_MAX ?? 10),
    ssl: isLocal || process.env.DATABASE_SSL === 'off' ? undefined : { rejectUnauthorized: true },
  });
}

export function getPool(): Pool {
  if (!globalForDb.__coePool) globalForDb.__coePool = createPool();
  return globalForDb.__coePool;
}

export function getDb(): DrizzleDb {
  if (!globalForDb.__coeDb) globalForDb.__coeDb = drizzle(getPool(), { schema });
  return globalForDb.__coeDb;
}

/**
 * Lazy handle: the pool is only created on first property access, so importing
 * this module during `next build` (which loads every route module) does not
 * require DATABASE_URL to be present.
 */
export const db = new Proxy({} as DrizzleDb, {
  get(_target, prop) {
    const real = getDb() as unknown as Record<string | symbol, unknown>;
    const value = real[prop];
    return typeof value === 'function' ? value.bind(real) : value;
  },
});

export { schema };
