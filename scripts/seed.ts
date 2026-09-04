/**
 * scripts/seed.ts — Local development data.
 *
 *   npm run db:seed
 *
 * Two sources, in order:
 *   1. seed/fixtures.json — gitignored. Copy seed/fixtures.example.json and
 *      put your own local passwords in it. Never committed.
 *   2. If that file is absent, accounts are generated with strong random
 *      passwords which are printed ONCE to this terminal and nowhere else.
 *
 * Deliberately refuses to run against a production database.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import { GURUGRAM_PRESEEDED_VENUES } from '../data/venues';

/**
 * The venue GSTINs in data/venues.ts are placeholders and do not carry a
 * valid mod-36 check character, which would make a seeded vendor unable to
 * save their own profile (lib/validation.ts checks it). Recompute the check
 * character so seeded rows are at least self-consistent.
 */
const GSTIN_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
function withValidChecksum(gstin: string): string {
  const base = gstin.toUpperCase().slice(0, 14);
  if (base.length !== 14) return gstin;
  let sum = 0;
  for (let i = 0; i < 14; i += 1) {
    const value = GSTIN_ALPHABET.indexOf(base[i]!);
    if (value < 0) return gstin;
    const product = value * (i % 2 === 0 ? 1 : 2);
    sum += Math.floor(product / 36) + (product % 36);
  }
  return base + GSTIN_ALPHABET[(36 - (sum % 36)) % 36];
}

interface FixtureAccount {
  email: string;
  password: string;
  role: 'corporate' | 'vendor' | 'admin';
  companyName?: string;
  category?: string;
  city?: string;
  gstNumber?: string;
}

interface Fixtures {
  accounts: FixtureAccount[];
  /** Create vendor accounts for the Gurugram venue directory. */
  seedVenueVendors?: boolean;
  /** Domain suffix used to build venue vendor logins when generating. */
  venueEmailDomain?: string;
}

const FIXTURE_PATH = join(process.cwd(), 'seed', 'fixtures.json');

function strongPassword(): string {
  // 24 base64url chars — long enough that the generated accounts are not a
  // weak link if someone forgets to delete them.
  return randomBytes(18).toString('base64url');
}

function id(prefix: string): string {
  return `${prefix}_${randomBytes(10).toString('hex')}`;
}

function loadFixtures(): { fixtures: Fixtures; generated: boolean } {
  if (existsSync(FIXTURE_PATH)) {
    return { fixtures: JSON.parse(readFileSync(FIXTURE_PATH, 'utf8')) as Fixtures, generated: false };
  }
  return {
    generated: true,
    fixtures: {
      seedVenueVendors: true,
      venueEmailDomain: 'coe-dev.local',
      accounts: [
        { email: 'admin@coe-dev.local', password: strongPassword(), role: 'admin' },
        {
          email: 'hr@nexus-dev.local',
          password: strongPassword(),
          role: 'corporate',
          companyName: 'Nexus Technologies',
          city: 'Gurugram',
        },
        {
          email: 'people@indigotec-dev.local',
          password: strongPassword(),
          role: 'corporate',
          companyName: 'IndigoTec',
          city: 'Gurugram',
        },
      ],
    },
  };
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is not set.');
    process.exit(1);
  }
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_PRODUCTION_SEED !== 'yes-i-am-sure') {
    console.error('Refusing to seed a production database.');
    process.exit(1);
  }

  const isLocal = /@(localhost|127\.0\.0\.1)/.test(connectionString);
  const pool = new Pool({
    connectionString,
    ssl: isLocal || process.env.DATABASE_SSL === 'off' ? undefined : { rejectUnauthorized: true },
  });

  const { fixtures, generated } = loadFixtures();
  const rounds = Number(process.env.BCRYPT_ROUNDS ?? 10);
  const created: { email: string; role: string; password: string }[] = [];

  for (const account of fixtures.accounts) {
    const existing = await pool.query('SELECT id FROM users WHERE email_normalized = $1', [
      account.email.toLowerCase(),
    ]);
    if (existing.rowCount) {
      console.log(`  skip   ${account.email} (already exists)`);
      continue;
    }

    const userId = id('user');
    const domain = account.email.split('@')[1] ?? '';
    await pool.query(
      `INSERT INTO users (id, email, email_normalized, email_domain, role, password_hash,
                          email_verified_at, approval_status, approved_at)
       VALUES ($1,$2,$3,$4,$5,$6, NOW(), 'approved', NOW())`,
      [userId, account.email, account.email.toLowerCase(), domain, account.role, await bcrypt.hash(account.password, rounds)]
    );

    if (account.role === 'corporate') {
      await pool.query(
        `INSERT INTO corporate_profiles (id, user_id, email, name, office_company_name, city, is_completed, submitted_at)
         VALUES ($1,$2,$3,$4,$5,$6, TRUE, NOW())`,
        [id('cp'), userId, account.email, account.companyName ?? 'Dev Employee', account.companyName ?? 'Dev Co', account.city ?? 'Gurugram']
      );
    }
    if (account.role === 'vendor') {
      await pool.query(
        `INSERT INTO vendor_profiles (id, user_id, category, company_name, vendor_name, gst_number,
                                      gst_verified, city, service_areas, is_completed, submitted_at)
         VALUES ($1,$2,$3,$4,$5,$6, TRUE, $7, $8::jsonb, TRUE, NOW())`,
        [
          id('vp'),
          userId,
          account.category ?? 'food',
          account.companyName ?? 'Dev Vendor',
          `${account.companyName ?? 'Dev Vendor'} Representative`,
          withValidChecksum(account.gstNumber ?? '06AAACD1234A1ZL'),
          account.city ?? 'Gurugram',
          JSON.stringify([account.city ?? 'Gurugram']),
        ]
      );
    }

    created.push({ email: account.email, role: account.role, password: account.password });
    console.log(`  create ${account.email} (${account.role})`);
  }

  if (fixtures.seedVenueVendors) {
    const domain = fixtures.venueEmailDomain ?? 'coe-dev.local';
    for (const venue of GURUGRAM_PRESEEDED_VENUES) {
      const email = `${venue.sanitizedKey}@${domain}`;
      const existing = await pool.query('SELECT id FROM users WHERE email_normalized = $1', [email]);
      if (existing.rowCount) continue;

      // Every venue account gets its OWN random password. There is deliberately
      // no shared default.
      const password = strongPassword();
      const userId = id('user');
      await pool.query(
        `INSERT INTO users (id, email, email_normalized, email_domain, role, password_hash,
                            email_verified_at, approval_status, approved_at)
         VALUES ($1,$2,$3,$4,'vendor',$5, NOW(), 'approved', NOW())`,
        [userId, email, email, domain, await bcrypt.hash(password, rounds)]
      );
      await pool.query(
        `INSERT INTO vendor_profiles
           (id, user_id, category, company_name, vendor_name, mobile, company_mobile, address, city,
            locality, distance_km, entity_type, gst_number, gst_verified, portfolio_summary,
            corporate_suitability, past_clients, amenities, timings, avg_cost_per_person,
            is_completed, place_id, formatted_address, place_name, lat, lng, rating,
            user_ratings_total, service_areas, submitted_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,TRUE,$14,$15,$16::jsonb,$17::jsonb,$18,$19,
                 TRUE,$20,$21,$22,$23,$24,$25,$26,$27::jsonb, NOW())`,
        [
          id('vp'), userId, venue.category, venue.name, `${venue.name} Representative`,
          venue.phone, venue.companyPhone, venue.address, venue.city, venue.locality,
          venue.distanceKm, venue.entityType ?? 'Pvt Ltd', withValidChecksum(venue.gstNumber),
          venue.description, venue.corporateSuitability,
          JSON.stringify(venue.pastClients ?? []), JSON.stringify(venue.amenities ?? []),
          venue.timings, venue.avgCostPerPerson, venue.place_id, venue.address, venue.name,
          venue.lat, venue.lng, venue.rating, venue.user_ratings_total,
          JSON.stringify([venue.locality, venue.city].filter(Boolean)),
        ]
      );
      created.push({ email, role: 'vendor (venue)', password });
    }
  }

  await pool.end();

  if (created.length === 0) {
    console.log('\nNothing to create — the database already has these accounts.');
    return;
  }

  console.log(`\nSeeded ${created.length} account(s).`);
  if (generated) {
    console.log(
      '\nNo seed/fixtures.json found, so passwords were generated. They are shown\n' +
        'ONCE, here, and are not stored anywhere else. Copy what you need now:\n'
    );
    for (const account of created) {
      console.log(`  ${account.email.padEnd(42)} ${account.role.padEnd(14)} ${account.password}`);
    }
    console.log(
      '\nTo control these yourself, copy seed/fixtures.example.json to\n' +
        'seed/fixtures.json (gitignored) and re-run.\n'
    );
  } else {
    console.log('Passwords came from seed/fixtures.json — see that file.\n');
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
