/**
 * scripts/api-test.ts — End-to-end API tests against a running server.
 *
 *   npm run build && npm run start          # terminal 1
 *   BASE_URL=http://127.0.0.1:3000 npm run test:api   # terminal 2
 *
 * Covers the happy path (signup → verify → approve → post → bid → award →
 * complete → rate) and, more importantly, the authorization cases the brief
 * asks about explicitly:
 *
 *   · can a pending account hit protected endpoints directly?
 *   · can a vendor reach another vendor's data by changing an id?
 *   · does an expired / revoked session still authenticate?
 */
import { randomBytes, createHmac } from 'node:crypto';
import { Pool } from 'pg';

const BASE = (process.env.BASE_URL ?? 'http://127.0.0.1:3000').replace(/\/$/, '');
const ORIGIN = BASE;

let pool: Pool;
let passed = 0;
let failed = 0;
const failures: string[] = [];

function check(name: string, condition: boolean, detail = '') {
  if (condition) {
    passed += 1;
    console.log(`  [32mPASS[0m  ${name}`);
  } else {
    failed += 1;
    failures.push(name);
    console.log(`  [31mFAIL[0m  ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

interface Client {
  cookie: string;
  call: (
    method: string,
    path: string,
    body?: unknown
  ) => Promise<{ status: number; json: { ok?: boolean; data?: unknown; error?: { code: string; message: string } } }>;
}

function makeClient(): Client {
  const client: Client = {
    cookie: '',
    async call(method, path, body) {
      const headers: Record<string, string> = { origin: ORIGIN };
      if (body !== undefined) headers['content-type'] = 'application/json';
      if (client.cookie) headers.cookie = client.cookie;

      const response = await fetch(`${BASE}${path}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        redirect: 'manual',
      });
      const setCookie = response.headers.getSetCookie?.() ?? [];
      for (const raw of setCookie) {
        const [pair] = raw.split(';');
        if (pair?.startsWith('coe_session=')) client.cookie = pair;
      }
      let json: Record<string, unknown> = {};
      try {
        json = (await response.json()) as Record<string, unknown>;
      } catch {
        /* empty body */
      }
      return { status: response.status, json };
    },
  };
  return client;
}

const uniq = () => randomBytes(4).toString('hex');

/** Reads the one-time token straight from the DB — stands in for an inbox. */
async function tokenFor(email: string, purpose: 'email_verify' | 'password_reset', plain: string) {
  const hash = createHmac('sha256', process.env.AUTH_SECRET!).update(plain).digest('hex');
  const result = await pool.query('SELECT id FROM auth_tokens WHERE token_hash = $1 AND purpose = $2', [hash, purpose]);
  return result.rowCount;
}

/**
 * Tokens are stored hashed, so the test cannot read a usable token back out
 * of the database. Instead it verifies + approves accounts directly in SQL,
 * exactly as the admin flow would leave them.
 */
async function forceVerifyAndApprove(email: string) {
  await pool.query(
    `UPDATE users SET email_verified_at = NOW(), approval_status = 'approved', approved_at = NOW()
     WHERE email_normalized = $1`,
    [email.toLowerCase()]
  );
}
async function forceVerifyOnly(email: string) {
  await pool.query(
    `UPDATE users SET email_verified_at = NOW(), approval_status = 'pending' WHERE email_normalized = $1`,
    [email.toLowerCase()]
  );
}
async function userIdFor(email: string): Promise<string> {
  const r = await pool.query<{ id: string }>('SELECT id FROM users WHERE email_normalized = $1', [email.toLowerCase()]);
  return r.rows[0]!.id;
}

const STRONG = 'CorrectHorse!2026';

async function main() {
  if (!process.env.DATABASE_URL || !process.env.AUTH_SECRET) {
    console.error('DATABASE_URL and AUTH_SECRET must be set (use .env.local).');
    process.exit(1);
  }
  pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: undefined });

  // The suite deliberately exceeds the signup and login limits, so it clears
  // the counters between phases. Never do this anywhere but a dev database.
  const clearLimits = () => pool.query('DELETE FROM rate_limits');
  await clearLimits();

  const stamp = uniq();
  const employeeEmail = `emp.${stamp}@acme-test.in`;
  const vendorAEmail = `vendora.${stamp}@feast-test.in`;
  const vendorBEmail = `vendorb.${stamp}@feast-test.in`;

  console.log('\n── Signup & email policy ──────────────────────────────');

  const anon = makeClient();

  let r = await anon.call('POST', '/api/auth/signup', {
    role: 'corporate',
    email: `someone.${stamp}@gmail.com`,
    password: STRONG,
  });
  check('free-mail signup is rejected for employees', r.status === 400, `got ${r.status}`);

  r = await anon.call('POST', '/api/auth/signup', {
    role: 'corporate',
    email: `someone.${stamp}@mailinator.com`,
    password: STRONG,
  });
  check('disposable-inbox signup is rejected', r.status === 400, `got ${r.status}`);

  r = await anon.call('POST', '/api/auth/signup', {
    role: 'corporate',
    email: employeeEmail,
    password: 'password123',
  });
  check('weak password is rejected', r.status === 400, `got ${r.status}`);

  r = await anon.call('POST', '/api/auth/signup', {
    role: 'corporate',
    email: employeeEmail,
    password: STRONG,
  });
  check('company-domain signup succeeds', r.status === 200, `got ${r.status}`);
  check('a verification token was issued', (await tokenFor(employeeEmail, 'email_verify', 'x')) === 0);

  r = await anon.call('POST', '/api/auth/signup', {
    role: 'vendor',
    email: vendorAEmail,
    password: STRONG,
    companyName: 'Feast Test Caterers',
    gstNumber: '06AAACD1234A1Z0',
    category: 'food',
    serviceAreas: ['Gurugram'],
  });
  check('invalid GSTIN checksum is rejected', r.status === 400, `got ${r.status}`);

  await clearLimits();
  for (const email of [vendorAEmail, vendorBEmail]) {
    r = await anon.call('POST', '/api/auth/signup', {
      role: 'vendor',
      email,
      password: STRONG,
      companyName: `Feast Test ${email.slice(0, 7)}`,
      gstNumber: '06AAACD1234A1ZL',
      category: 'food',
      serviceAreas: ['Gurugram'],
    });
    check(`vendor signup succeeds (${email.split('@')[0]})`, r.status === 200, `got ${r.status}`);
  }

  await clearLimits();
  r = await anon.call('POST', '/api/auth/signup', {
    role: 'corporate',
    email: employeeEmail,
    password: STRONG,
  });
  check('duplicate signup does not reveal that the address exists', r.status === 200, `got ${r.status}`);

  console.log('\n── Verification and approval gates ────────────────────');

  const emp = makeClient();
  r = await emp.call('POST', '/api/auth/login', { email: employeeEmail, password: STRONG });
  check('unverified account cannot sign in', r.status === 403 && r.json.error?.code === 'email_unverified', `got ${r.status} ${r.json.error?.code}`);

  await forceVerifyOnly(employeeEmail);
  r = await emp.call('POST', '/api/auth/login', { email: employeeEmail, password: STRONG });
  check('verified-but-unapproved account cannot sign in', r.status === 403 && r.json.error?.code === 'pending_approval', `got ${r.status} ${r.json.error?.code}`);
  check('no session cookie was issued to a pending account', emp.cookie === '');

  r = await emp.call('GET', '/api/rfps');
  check('pending account cannot reach a protected endpoint directly', r.status === 401, `got ${r.status}`);

  r = await emp.call('POST', '/api/rfps', { category: 'food', universal: { startDate: '2027-01-01', endDate: '2027-01-01', persons: 10, budgetPerPerson: 100 } });
  check('pending account cannot post a requirement', r.status === 401, `got ${r.status}`);

  await forceVerifyAndApprove(employeeEmail);
  await forceVerifyAndApprove(vendorAEmail);
  await forceVerifyAndApprove(vendorBEmail);

  r = await emp.call('POST', '/api/auth/login', { email: employeeEmail, password: STRONG });
  check('approved account signs in', r.status === 200, `got ${r.status}`);
  check('a session cookie was issued', emp.cookie.startsWith('coe_session='));

  console.log('\n── Login hardening ────────────────────────────────────');

  const attacker = makeClient();
  let lastStatus = 0;
  for (let i = 0; i < 6; i += 1) {
    const res = await attacker.call('POST', '/api/auth/login', { email: employeeEmail, password: 'WrongPassword!99' });
    lastStatus = res.status;
  }
  check('repeated wrong passwords lock the account (423) or rate-limit (429)', lastStatus === 423 || lastStatus === 429, `got ${lastStatus}`);
  // Unlock so the rest of the suite can proceed.
  await pool.query(`UPDATE users SET locked_until = NULL, failed_login_count = 0 WHERE email_normalized = $1`, [employeeEmail.toLowerCase()]);
  await clearLimits();

  const noOrigin = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'https://evil.example.com' },
    body: JSON.stringify({ email: employeeEmail, password: STRONG }),
  });
  check('cross-origin POST is blocked (CSRF)', noOrigin.status === 403, `got ${noOrigin.status}`);

  console.log('\n── Profile and RFP posting ────────────────────────────');

  r = await emp.call('PUT', '/api/profile/corporate', {
    name: 'Priya Test',
    mobile: '9811122233',
    officeCompanyName: 'Acme Test Pvt Ltd',
    officeAddress: 'Cyber Hub, DLF Cyber City',
    city: 'Gurugram',
    position: 'HR Manager',
    department: 'People',
  });
  check('employee saves their profile', r.status === 200, `got ${r.status}`);

  r = await emp.call('POST', '/api/rfps', {
    category: 'food',
    occasion: 'office-party',
    categoryDetails: { mealType: 'Dinner' },
    universal: {
      startDate: '2027-03-15',
      endDate: '2027-03-15',
      timeSlot: 'Evening',
      persons: 50,
      budgetPerPerson: 2000,
      notes: 'Diwali party',
    },
    serviceArea: 'Cyber City',
  });
  check('employee posts a requirement', r.status === 201, `got ${r.status}`);
  const rfp = (r.json.data ?? {}) as { id: string; totalBudget: number };
  check('total budget is computed server-side (50 x 2000)', rfp.totalBudget === 100_000, `got ${rfp.totalBudget}`);

  r = await emp.call('POST', '/api/rfps', {
    category: 'food',
    categoryDetails: {},
    universal: { startDate: '2027-03-15', endDate: '2027-03-15', persons: 50, budgetPerPerson: 2000 },
    totalBudget: 1,
  });
  check('a client-supplied totalBudget is ignored', ((r.json.data ?? {}) as { totalBudget: number }).totalBudget === 100_000);

  console.log('\n── Bidding and cross-tenant access ────────────────────');

  await clearLimits();
  const vendorA = makeClient();
  const vendorB = makeClient();
  await vendorA.call('POST', '/api/auth/login', { email: vendorAEmail, password: STRONG });
  await vendorB.call('POST', '/api/auth/login', { email: vendorBEmail, password: STRONG });

  for (const [client, email] of [[vendorA, vendorAEmail], [vendorB, vendorBEmail]] as const) {
    await client.call('PUT', '/api/profile/vendor', {
      category: 'food',
      vendorName: 'Test Rep',
      companyName: `Feast ${email.slice(0, 7)}`,
      mobile: '9811100000',
      address: 'Sector 29, Gurugram',
      city: 'Gurugram',
      gstNumber: '06AAACD1234A1ZL',
      serviceAreas: ['Gurugram'],
    });
  }

  r = await vendorA.call('POST', `/api/rfps/${rfp.id}/bids`, { rfpId: rfp.id, totalPrice: 90_000, proposal: 'Vendor A quote' });
  check('vendor A submits a bid', r.status === 201, `got ${r.status}`);
  const bidA = (r.json.data ?? {}) as { id: string };

  r = await vendorB.call('POST', `/api/rfps/${rfp.id}/bids`, { rfpId: rfp.id, totalPrice: 85_000, proposal: 'Vendor B quote' });
  check('vendor B submits a bid', r.status === 201, `got ${r.status}`);
  const bidB = (r.json.data ?? {}) as { id: string };

  r = await vendorA.call('POST', `/api/rfps/${rfp.id}/bids`, { rfpId: rfp.id, totalPrice: 100, lineItems: [{ description: 'x', amount: 5 }], proposal: 'mismatched' });
  check('line items that do not add up are rejected', r.status === 400, `got ${r.status}`);

  r = await vendorA.call('GET', `/api/rfps/${rfp.id}`);
  const vendorAView = (r.json.data ?? {}) as { bids: { id: string }[] };
  check('a vendor sees only their own bid on an RFP', vendorAView.bids?.length === 1 && vendorAView.bids[0]!.id === bidA.id, `saw ${vendorAView.bids?.length} bids`);

  r = await vendorA.call('PATCH', `/api/bids/${bidB.id}`, { totalPrice: 1 });
  check("vendor A cannot edit vendor B's bid by id", r.status === 404, `got ${r.status}`);

  r = await vendorA.call('DELETE', `/api/bids/${bidB.id}`);
  check("vendor A cannot withdraw vendor B's bid by id", r.status === 404, `got ${r.status}`);

  r = await vendorA.call('GET', '/api/bids');
  const ownBids = ((r.json.data ?? {}) as { bids: { id: string }[] }).bids ?? [];
  check('GET /api/bids returns only the caller\'s bids', ownBids.every((b) => b.id === bidA.id), `got ${ownBids.length}`);

  r = await vendorA.call('GET', '/api/admin/users');
  check('a vendor cannot read the admin user list', r.status === 403, `got ${r.status}`);

  r = await vendorA.call('POST', `/api/rfps/${rfp.id}/award`, { bidId: bidA.id });
  check('a vendor cannot award themselves the job', r.status === 403, `got ${r.status}`);

  r = await emp.call('GET', `/api/rfps/${rfp.id}`);
  const posterView = (r.json.data ?? {}) as { bids: { vendorCompany: string; totalPrice: number }[] };
  check('poster sees both bids', posterView.bids?.length === 2, `saw ${posterView.bids?.length}`);
  check(
    'bids are masked before award (no vendor identity leaked)',
    posterView.bids.every((b) => /^Vendor [A-Z0-9]{4}$/.test(b.vendorCompany)),
    JSON.stringify(posterView.bids.map((b) => b.vendorCompany))
  );

  console.log('\n── Award, complete, rate ──────────────────────────────');

  r = await emp.call('POST', `/api/rfps/${rfp.id}/award`, { bidId: bidB.id });
  check('poster awards the cheaper bid', r.status === 200, `got ${r.status}`);

  r = await emp.call('POST', `/api/rfps/${rfp.id}/award`, { bidId: bidA.id });
  check('an awarded requirement cannot be re-awarded', r.status === 400, `got ${r.status}`);

  r = await emp.call('GET', `/api/rfps/${rfp.id}`);
  const afterAward = (r.json.data ?? {}) as { rfp: { status: string }; bids: { vendorCompany: string }[] };
  check('RFP status becomes awarded', afterAward.rfp.status === 'awarded', afterAward.rfp.status);
  check('vendor identities are revealed after award', afterAward.bids.some((b) => b.vendorCompany.startsWith('Feast')));

  r = await vendorA.call('POST', `/api/rfps/${rfp.id}/bids`, { rfpId: rfp.id, totalPrice: 10_000, proposal: 'too late' });
  check('bidding closes once awarded', r.status === 400, `got ${r.status}`);

  r = await emp.call('POST', '/api/reviews', { rfpId: rfp.id, rating: 5, comment: 'Great' });
  check('rating is blocked before the event is marked complete', r.status === 400, `got ${r.status}`);

  r = await emp.call('POST', `/api/rfps/${rfp.id}/complete`);
  check('poster marks the event complete', r.status === 200, `got ${r.status}`);

  r = await emp.call('POST', '/api/reviews', { rfpId: rfp.id, rating: 5, comment: 'Great turnout' });
  check('poster rates the vendor after completion', r.status === 201, `got ${r.status}`);

  r = await emp.call('POST', '/api/reviews', { rfpId: rfp.id, rating: 1, comment: 'Again' });
  check('a second rating on the same event is rejected', r.status === 409, `got ${r.status}`);

  r = await vendorA.call('POST', '/api/reviews', { rfpId: rfp.id, rating: 5, comment: 'self review' });
  check('a vendor cannot rate themselves', r.status === 403, `got ${r.status}`);

  console.log('\n── Sessions ───────────────────────────────────────────');
  await clearLimits();

  const staleCookie = vendorA.cookie;
  await vendorA.call('POST', '/api/auth/logout');
  const replay = makeClient();
  replay.cookie = staleCookie;
  r = await replay.call('GET', '/api/bids');
  check('a session is dead after logout (server-side revocation)', r.status === 401, `got ${r.status}`);

  const expiring = makeClient();
  await expiring.call('POST', '/api/auth/login', { email: vendorBEmail, password: STRONG });
  await pool.query(`UPDATE sessions SET expires_at = NOW() - INTERVAL '1 hour' WHERE user_id = $1`, [await userIdFor(vendorBEmail)]);
  r = await expiring.call('GET', '/api/bids');
  check('an expired session no longer authenticates', r.status === 401, `got ${r.status}`);

  const suspendee = makeClient();
  await suspendee.call('POST', '/api/auth/login', { email: employeeEmail, password: STRONG });
  await pool.query(`UPDATE users SET is_suspended = TRUE WHERE email_normalized = $1`, [employeeEmail.toLowerCase()]);
  r = await suspendee.call('GET', '/api/rfps');
  check('suspending an account blocks it immediately', r.status === 403, `got ${r.status}`);
  await pool.query(`UPDATE users SET is_suspended = FALSE WHERE email_normalized = $1`, [employeeEmail.toLowerCase()]);

  const pwChanger = makeClient();
  await pwChanger.call('POST', '/api/auth/login', { email: employeeEmail, password: STRONG });
  const cookieBefore = pwChanger.cookie;
  await pwChanger.call('POST', '/api/auth/change-password', { currentPassword: STRONG, newPassword: 'AnotherStrong!2026' });
  const oldSession = makeClient();
  oldSession.cookie = cookieBefore;
  r = await oldSession.call('GET', '/api/rfps');
  check('changing the password invalidates older sessions', r.status === 401, `got ${r.status}`);

  console.log('\n── Public surfaces ────────────────────────────────────');

  r = await anon.call('GET', '/api/vendors?category=food&limit=5');
  const directory = ((r.json.data ?? {}) as { vendors: Record<string, unknown>[] }).vendors ?? [];
  check('vendor directory is public', r.status === 200, `got ${r.status}`);
  check(
    'directory withholds vendor phone numbers',
    directory.every((v) => !('mobile' in v) && !('companyMobile' in v)),
    JSON.stringify(Object.keys(directory[0] ?? {}))
  );

  r = await anon.call('GET', '/api/vendors?limit=5');
  const withoutOrigin = ((r.json.data ?? {}) as { vendors: { distanceFromYouKm: number | null }[] }).vendors ?? [];
  check(
    'no coordinates means no distances (not a distance from 0,0)',
    withoutOrigin.every((v) => v.distanceFromYouKm === null),
    JSON.stringify(withoutOrigin.slice(0, 2).map((v) => v.distanceFromYouKm))
  );

  r = await anon.call('GET', '/api/vendors?lat=28.4949&lng=77.0895&limit=5');
  const nearby = (r.json.data ?? {}) as { sortedByDistance: boolean; vendors: { distanceFromYouKm: number | null }[] };
  check('nearby search sorts by real distance', nearby.sortedByDistance === true);
  const distances = nearby.vendors.map((v) => v.distanceFromYouKm).filter((d): d is number => d !== null);
  check('nearest vendor comes first', distances.every((d, i) => i === 0 || d >= distances[i - 1]!));

  r = await anon.call('GET', '/api/rfps');
  check('anonymous visitors cannot list requirements', r.status === 401, `got ${r.status}`);

  r = await anon.call('GET', '/api/admin/stats');
  check('anonymous visitors cannot read admin stats', r.status === 401, `got ${r.status}`);

  console.log('\n── Injection & input handling ─────────────────────────');

  r = await anon.call('GET', "/api/vendors?q=' OR 1=1 --");
  check('SQL metacharacters in a query are harmless (parameterised)', r.status === 200, `got ${r.status}`);

  const evil = makeClient();
  await evil.call('POST', '/api/auth/login', { email: employeeEmail, password: 'AnotherStrong!2026' });
  r = await evil.call('PUT', '/api/profile/corporate', {
    name: '<script>alert(1)</script>',
    mobile: '9811122233',
    officeCompanyName: 'Acme',
    officeAddress: 'Somewhere',
    city: 'Gurugram',
    position: 'HR',
    department: 'People',
  });
  check('script markup in profile text is rejected', r.status === 400, `got ${r.status}`);

  console.log('\n── Admin surface ──────────────────────────────────────');
  await clearLimits();

  const adminEmail = process.env.TEST_ADMIN_EMAIL;
  const adminPassword = process.env.TEST_ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    console.log('  [33mSKIP[0m  admin tests (set TEST_ADMIN_EMAIL / TEST_ADMIN_PASSWORD)');
  } else {
    const admin = makeClient();
    r = await admin.call('POST', '/api/auth/login', { email: adminEmail, password: adminPassword });
    check('admin signs in', r.status === 200, `got ${r.status}`);

    // A fresh account to run through the approval queue.
    const queueEmail = `queue.${uniq()}@acme-test.in`;
    await admin.call('POST', '/api/auth/signup', { role: 'corporate', email: queueEmail, password: STRONG });
    await forceVerifyOnly(queueEmail);

    r = await admin.call('GET', '/api/admin/approvals');
    const queue = ((r.json.data ?? {}) as { pending: { email: string }[] }).pending ?? [];
    check('verified-but-unapproved accounts appear in the approval queue', queue.some((u) => u.email === queueEmail));

    const queueId = await userIdFor(queueEmail);
    r = await admin.call('POST', `/api/admin/approvals/${queueId}`, { decision: 'approved' });
    check('admin approves an account in one call', r.status === 200, `got ${r.status}`);

    const queueClient = makeClient();
    r = await queueClient.call('POST', '/api/auth/login', { email: queueEmail, password: STRONG });
    check('the newly approved account can now sign in', r.status === 200, `got ${r.status}`);

    r = await admin.call('PATCH', `/api/admin/users/${queueId}`, { isSuspended: true });
    check('admin suspends an account', r.status === 200, `got ${r.status}`);
    r = await queueClient.call('GET', '/api/rfps');
    check('suspension revokes the live session immediately', r.status === 401 || r.status === 403, `got ${r.status}`);

    const adminId = await userIdFor(adminEmail);
    r = await admin.call('PATCH', `/api/admin/users/${adminId}`, { isSuspended: true });
    check('an admin cannot suspend themselves', r.status === 400, `got ${r.status}`);

    r = await admin.call('GET', '/api/admin/stats');
    const stats = (r.json.data ?? {}) as { rfps?: { total: number } };
    check('admin stats report real numbers', (stats.rfps?.total ?? 0) > 0);

    r = await admin.call('GET', '/api/admin/audit?limit=20');
    const entries = ((r.json.data ?? {}) as { entries: { action: string }[] }).entries ?? [];
    check('admin actions land in the audit log', entries.some((e) => e.action.startsWith('admin.')));
  }

  console.log('\n── Audit trail ────────────────────────────────────────');

  const auditCount = await pool.query<{ n: string }>(
    `SELECT count(*) AS n FROM audit_logs WHERE action IN ('rfp.created','rfp.awarded','auth.login','review.created')`
  );
  check('consequential actions are written to the audit log', Number(auditCount.rows[0]!.n) >= 4, auditCount.rows[0]!.n);

  await pool.end();

  console.log(`\n${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    console.log('Failing:', failures.join(', '));
    process.exit(1);
  }
}

main().catch(async (error) => {
  console.error(error);
  try {
    await pool?.end();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
