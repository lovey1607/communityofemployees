/**
 * scripts/migrate.ts — Applies every .sql file in drizzle/ in filename order,
 * once, inside a transaction, recording what ran in _migrations.
 *
 *   npm run db:migrate
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { Pool } from 'pg';

const MIGRATIONS_DIR = join(process.cwd(), 'drizzle');

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is not set. Copy .env.example to .env.local first.');
    process.exit(1);
  }
  const isLocal = /@(localhost|127\.0\.0\.1)/.test(connectionString);
  const pool = new Pool({
    connectionString,
    ssl: isLocal || process.env.DATABASE_SSL === 'off' ? undefined : { rejectUnauthorized: true },
  });

  await pool.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      name       TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const applied = new Set(
    (await pool.query<{ name: string }>('SELECT name FROM _migrations')).rows.map((r) => r.name)
  );

  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  let ran = 0;
  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf8');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO _migrations (name) VALUES ($1)', [file]);
      await client.query('COMMIT');
      console.log(`  applied ${file}`);
      ran += 1;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`  FAILED  ${file}`);
      throw error;
    } finally {
      client.release();
    }
  }

  console.log(ran === 0 ? 'Database already up to date.' : `Applied ${ran} migration(s).`);
  await pool.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
