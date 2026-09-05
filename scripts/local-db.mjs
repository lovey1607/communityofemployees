/**
 * scripts/local-db.mjs — control the throwaway local PostgreSQL that
 * scripts/local-setup.sh creates in .localdb.
 *
 *   npm run db:stop        stop it
 *   node scripts/local-db.mjs start|stop|status
 *
 * Does nothing if you point DATABASE_URL at a database of your own.
 */
import { existsSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const PGDATA = join(ROOT, '.localdb');
const PORT = '5433';

function findBin() {
  // Kept outside node_modules so `npm install` cannot prune it.
  const bundled = join(ROOT, '.pgsql', 'node_modules', '@embedded-postgres');
  if (existsSync(bundled)) {
    for (const platform of readdirSync(bundled)) {
      const bin = join(bundled, platform, 'native', 'bin');
      if (existsSync(join(bin, 'pg_ctl'))) return bin;
    }
  }
  for (const dir of [
    '/Applications/Postgres.app/Contents/Versions/latest/bin',
    '/opt/homebrew/bin',
    '/usr/local/bin',
  ]) {
    if (existsSync(join(dir, 'pg_ctl'))) return dir;
  }
  return null;
}

const action = process.argv[2] ?? 'status';
if (!existsSync(join(PGDATA, 'PG_VERSION'))) {
  console.log('No local database in .localdb — nothing to do.');
  console.log('(If DATABASE_URL points somewhere else, that database is not managed here.)');
  process.exit(0);
}
const bin = findBin();
if (!bin) {
  console.error('Could not find pg_ctl. Run ./scripts/local-setup.sh first.');
  process.exit(1);
}

const args = { start: ['-w', 'start'], stop: ['-w', '-m', 'fast', 'stop'], status: ['status'] }[action];
if (!args) {
  console.error(`Unknown command "${action}". Use start, stop or status.`);
  process.exit(1);
}

const result = spawnSync(
  join(bin, 'pg_ctl'),
  ['-D', PGDATA, '-o', `-p ${PORT} -k ${PGDATA}`, '-l', join(PGDATA, 'server.log'), ...args],
  { stdio: 'inherit' }
);
process.exit(result.status ?? 0);
