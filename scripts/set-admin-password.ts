// ============================================================
// scripts/set-admin-password.ts — set or reset an admin's password.
//
// `seed-production.ts` deliberately refuses to run twice, so it cannot help
// once the first admin exists. This is the tool for afterwards: forgotten
// password, a handover, or a login that was created with a typo.
//
// It works on an EXISTING account and will not create one. If the email is
// not already an admin it stops and says so, rather than quietly minting a
// new set of keys to the building — that is what seed-production is for, and
// it is the one script allowed to do it.
//
// Every reset revokes that admin's live sessions. A password change is either
// a handover or a response to something going wrong, and in both cases the
// old browser session should stop working immediately. The app already
// enforces this via password_changed_at; this sets it too, so the behaviour
// is identical whether the change came from the UI or from here.
//
// Usage:
//   DATABASE_URL=...            \
//   ADMIN_EMAIL=you@company.com \
//   ADMIN_PASSWORD='new one'    \
//     npx tsx scripts/set-admin-password.ts
// ============================================================

import bcrypt from 'bcryptjs';
import { Pool } from 'pg';

function fail(message: string): never {
  console.error(`\n  ${message}\n`);
  process.exit(1);
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!connectionString) fail('DATABASE_URL is not set.');
  if (!email) fail('ADMIN_EMAIL is not set.');
  if (!password) fail('ADMIN_PASSWORD is not set.');
  if (password.length < 12) {
    fail('ADMIN_PASSWORD must be at least 12 characters. Generate one with: openssl rand -base64 18');
  }

  const isLocal = /@(localhost|127\.0\.0\.1)/.test(connectionString);
  const pool = new Pool({
    connectionString,
    ssl: isLocal || process.env.DATABASE_SSL === 'off' ? undefined : { rejectUnauthorized: true },
  });

  const { rows } = await pool.query(
    "SELECT id, role FROM users WHERE email_normalized = $1 AND deleted_at IS NULL",
    [email]
  );

  if (rows.length === 0) {
    const admins = await pool.query(
      "SELECT email FROM users WHERE role = 'admin' AND deleted_at IS NULL ORDER BY created_at"
    );
    await pool.end();
    fail(
      `No account for ${email}.\n\n` +
        (admins.rowCount
          ? `  Admin accounts on this database:\n${admins.rows.map((r) => `    ${r.email}`).join('\n')}`
          : '  This database has no admin accounts. Use: npm run db:seed:production')
    );
  }

  if (rows[0].role !== 'admin') {
    await pool.end();
    fail(`${email} exists but is a ${rows[0].role} account, not an admin. Change roles from the admin dashboard.`);
  }

  const rounds = Number(process.env.BCRYPT_ROUNDS ?? 12);
  await pool.query(
    `UPDATE users
        SET password_hash = $1,
            password_changed_at = NOW(),
            failed_login_count = 0,
            locked_until = NULL,
            updated_at = NOW()
      WHERE id = $2`,
    [await bcrypt.hash(password, rounds), rows[0].id]
  );

  // Belt and braces: password_changed_at already invalidates older sessions
  // at the guard, and this clears the rows so nothing stale is left behind.
  const revoked = await pool.query('DELETE FROM sessions WHERE user_id = $1', [rows[0].id]);

  await pool.end();

  console.log(`
  Password updated for ${email}

  ${revoked.rowCount ?? 0} existing session(s) revoked — any browser still signed
  in as this admin has been logged out.

  Any lockout from failed attempts has also been cleared.
`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
