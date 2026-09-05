// ============================================================
// scripts/seed-production.ts — the ONLY seed that should ever touch a
// production database.
//
// It creates one thing: the first admin account, from environment variables.
// Nothing else. That is a deliberate decision, not an omission.
//
// Why the development seed must never run in production
// -----------------------------------------------------
// `scripts/seed.ts` creates 241 accounts. Every one of them is wrong here:
//
//  · 116 pilot corporate placeholders (data/pilot-companies.ts) for companies
//    that have not signed up. They exist for outreach and demos.
//
//  · 124 venue vendor accounts for real, named Gurgaon businesses that have
//    not signed up either. The public directory only lists vendors whose
//    account is `approved`, so putting them in front of buyers means marking
//    them approved — which means an account nobody owns, holding a password
//    in a local file, that can submit a binding quote as "The Irish House".
//    A marketplace showing 124 vendors who cannot actually answer a bid is
//    worse than one showing five who can: the first buyer to award learns
//    the supply was decoration.
//
//  · 4 development logins on .local domains.
//
// So production starts empty, with one admin, and fills up as real vendors
// register and are approved. data/venues.ts remains the outreach list.
//
// Usage:
//   DATABASE_URL=...            \
//   ADMIN_EMAIL=you@company.com \
//   ADMIN_PASSWORD='...'        \
//     npx tsx scripts/seed-production.ts
// ============================================================

import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { Pool } from 'pg';

function id(prefix: string): string {
  return `${prefix}_${randomBytes(10).toString('hex')}`;
}

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

  // The password policy the app enforces on everyone else applies here too.
  // An admin account is the one login worth attacking.
  if (password.length < 12) {
    fail('ADMIN_PASSWORD must be at least 12 characters. Generate one with: openssl rand -base64 18');
  }
  if (!/^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(email)) {
    fail(`ADMIN_EMAIL does not look like an email address: ${email}`);
  }

  const isLocal = /@(localhost|127\.0\.0\.1)/.test(connectionString);
  const pool = new Pool({
    connectionString,
    ssl: isLocal || process.env.DATABASE_SSL === 'off' ? undefined : { rejectUnauthorized: true },
  });

  const existing = await pool.query('SELECT id FROM users WHERE email_normalized = $1', [email]);
  if (existing.rowCount) {
    console.log(`\n  ${email} already exists — nothing to do.\n`);
    await pool.end();
    return;
  }

  // If any admin already exists, refuse. Re-running this by accident should
  // never quietly mint a second set of keys to the building.
  const admins = await pool.query("SELECT COUNT(*)::int AS n FROM users WHERE role = 'admin' AND deleted_at IS NULL");
  if (admins.rows[0].n > 0) {
    await pool.end();
    fail(
      `This database already has ${admins.rows[0].n} admin account(s).\n` +
        '  Add further admins from the admin dashboard, not from this script.'
    );
  }

  const rounds = Number(process.env.BCRYPT_ROUNDS ?? 12);
  await pool.query(
    `INSERT INTO users (id, email, email_normalized, email_domain, role, password_hash,
                        email_verified_at, approval_status, approved_at)
     VALUES ($1,$2,$3,$4,'admin',$5, NOW(), 'approved', NOW())`,
    [id('user'), email, email, email.split('@')[1], await bcrypt.hash(password, rounds)]
  );

  await pool.end();

  console.log(`
  Created the first admin: ${email}

  Sign in at  <your domain>/admin/login

  Nothing else was seeded. The vendor directory fills up as real venues
  register and you approve them — data/venues.ts is your outreach list, not
  your supply.
`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
