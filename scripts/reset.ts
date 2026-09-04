/**
 * scripts/reset.ts — Drops every application table so `db:migrate` can
 * rebuild from scratch. Local development only.
 */
import { Pool } from 'pg';

const TABLES = [
  'audit_logs', 'rate_limits', 'vendor_reviews', 'bids', 'rfps',
  'vendor_profiles', 'corporate_profiles', 'sessions', 'auth_tokens',
  'email_domain_rules', 'users', '_migrations',
];

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is not set.');
    process.exit(1);
  }
  if (process.env.NODE_ENV === 'production') {
    console.error('Refusing to drop tables with NODE_ENV=production.');
    process.exit(1);
  }
  const isLocal = /@(localhost|127\.0\.0\.1)/.test(connectionString);
  const pool = new Pool({
    connectionString,
    ssl: isLocal || process.env.DATABASE_SSL === 'off' ? undefined : { rejectUnauthorized: true },
  });
  await pool.query(`DROP TABLE IF EXISTS ${TABLES.join(', ')} CASCADE`);
  await pool.end();
  console.log('Dropped all application tables. Run `npm run db:migrate` next.');
}

main().catch((e) => { console.error(e); process.exit(1); });
