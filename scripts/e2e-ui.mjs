/**
 * scripts/e2e-ui.mjs — End-to-end walkthrough of the real UI:
 * signup → verify → admin approve → profile → post RFP → vendor bid →
 * award → complete → rate, with a screenshot at each step.
 *
 * Complements scripts/api-test.ts, which tests the API directly. This one
 * drives a browser, so it catches the wiring between the store and the API.
 *
 *   npm run build && npm run start
 *   npx playwright install chromium        # once
 *   DATABASE_URL=... BASE_URL=http://127.0.0.1:3000  *   TEST_ADMIN_EMAIL=... TEST_ADMIN_PASSWORD=...  *   TEST_VENDOR_EMAIL=... TEST_VENDOR_PASSWORD=...  *   TEST_VENDOR2_EMAIL=... TEST_VENDOR2_PASSWORD=...  *     node scripts/e2e-ui.mjs
 *
 * Development database only — it writes rows and reads the users table
 * directly to stand in for clicking a link in an inbox.
 */
import { chromium } from 'playwright';
import pg from 'pg';

const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:3000';
const SHOTS = process.env.SHOT_DIR ?? '/tmp/coe-e2e';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

for (const key of ['DATABASE_URL', 'TEST_ADMIN_EMAIL', 'TEST_ADMIN_PASSWORD', 'TEST_VENDOR_EMAIL', 'TEST_VENDOR_PASSWORD', 'TEST_VENDOR2_EMAIL', 'TEST_VENDOR2_PASSWORD']) {
  if (!process.env[key]) {
    console.error(`Missing ${key}. See the header of this file.`);
    process.exit(1);
  }
}
await import('node:fs').then((fs) => fs.mkdirSync(SHOTS, { recursive: true }));

const stamp = Math.random().toString(36).slice(2, 7);
const EMP = `priya.${stamp}@nexustech.in`;
const PASS = 'GurgaonMonsoon!26';
const ADMIN = { email: process.env.TEST_ADMIN_EMAIL, password: process.env.TEST_ADMIN_PASSWORD };
const VENDOR = { email: process.env.TEST_VENDOR_EMAIL, password: process.env.TEST_VENDOR_PASSWORD };

let step = 0;
const log = [];
async function shot(page, name) {
  step += 1;
  const file = `${SHOTS}/${String(step).padStart(2, '0')}-${name}.png`;
  await page.screenshot({ path: file });
  console.log(`  ${String(step).padStart(2, '0')} ${name}`);
  log.push({ step, name, file });
}
function ok(name, cond, detail = '') {
  console.log(`  ${cond ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m'}  ${name}${detail && !cond ? ` — ${detail}` : ''}`);
  if (!cond) process.exitCode = 1;
}

const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}
);

async function ctx() {
  const c = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await c.newPage();
  page.on('pageerror', (e) => console.log('    [page error]', e.message));
  return { c, page };
}

// ─── 1. Employee signs up through the real modal ─────────────
console.log('\n── Employee signup ──');
let { c: empCtx, page } = await ctx();
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(1500);
await shot(page, 'landing');

await page.getByRole('button', { name: /Post for your team|Go to my dashboard/i }).first().click();
await page.waitForTimeout(600);
const modal = () => page.locator('.modal-overlay');
await modal().getByRole('button', { name: 'Create account' }).first().click();
await page.waitForTimeout(300);
await shot(page, 'signup-modal');

// Work-email rule should complain about gmail before anything is submitted.
await page.locator('#auth-email').fill('someone@gmail.com');
await page.waitForTimeout(400);
const gmailHint = await page.getByText(/work email/i).count();
ok('gmail address triggers the work-email hint inline', gmailHint > 0);
await shot(page, 'signup-gmail-hint');

await page.locator('#auth-email').fill(EMP);
await page.locator('#auth-password').fill(PASS);
await modal().getByRole('button', { name: /^Create account$/ }).last().click();
await page.waitForTimeout(2500);
await shot(page, 'signup-confirmation');
ok('signup tells the user to check their inbox', (await page.getByText(/Check your inbox|confirm/i).count()) > 0);

// Try to sign in before verifying — should be refused.
await modal().getByRole('button', { name: 'Sign in' }).first().click();
await page.waitForTimeout(300);
await page.locator('#auth-email').fill(EMP);
await page.locator('#auth-password').fill(PASS);
await modal().getByRole('button', { name: /^Sign in$/ }).last().click();
await page.waitForTimeout(2000);
const unverified = await page.getByText(/Confirm your email/i).count();
ok('unverified account is refused at the UI', unverified > 0);
await shot(page, 'signin-blocked-unverified');

// ─── 2. Verify the email (stand-in for clicking the link) ────
await pool.query(`UPDATE users SET email_verified_at = NOW() WHERE email_normalized = $1`, [EMP]);
await page.reload({ waitUntil: 'domcontentloaded' });
await page.waitForTimeout(1200);
await page.getByRole('button', { name: /Post for your team|Go to my dashboard/i }).first().click();
await page.waitForTimeout(500);
await page.locator('#auth-email').fill(EMP);
await page.locator('#auth-password').fill(PASS);
await modal().getByRole('button', { name: /^Sign in$/ }).last().click();
await page.waitForTimeout(2000);
ok('verified-but-unapproved is still refused', (await page.getByText(/admin still needs to approve/i).count()) > 0);
await shot(page, 'signin-blocked-pending-approval');
await empCtx.close();

// ─── 3. Admin approves from the real admin UI ────────────────
console.log('\n── Admin approval ──');
const { c: adminCtx, page: admin } = await ctx();
await admin.goto(`${BASE}/admin/login`, { waitUntil: 'domcontentloaded' });
await admin.waitForTimeout(1200);
await shot(admin, 'admin-login');
await admin.locator('input[type="email"]').fill(ADMIN.email);
await admin.locator('input[type="password"]').first().fill(ADMIN.password);
await admin.getByRole('button', { name: /sign in|access|login/i }).last().click();
await admin.waitForTimeout(3500);
await shot(admin, 'admin-dashboard');
ok('admin reaches the dashboard', admin.url().includes('/admin/dashboard'), admin.url());

// Approve through the API the admin UI itself calls, with the admin's own cookie.
const empId = (await pool.query('SELECT id FROM users WHERE email_normalized = $1', [EMP])).rows[0].id;
const approved = await admin.evaluate(async (id) => {
  const r = await fetch(`/api/admin/approvals/${id}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ decision: 'approved' }),
    credentials: 'same-origin',
  });
  return r.status;
}, empId);
ok('admin approves the pending employee', approved === 200, `status ${approved}`);

const auditSeen = await admin.evaluate(async () => {
  const r = await fetch('/api/admin/audit?limit=5', { credentials: 'same-origin' });
  const d = await r.json();
  return d.data.entries.map((e) => e.action);
});
ok('the approval landed in the audit log', auditSeen.includes('admin.approval.approved'), auditSeen.join(','));
await admin.reload({ waitUntil: 'domcontentloaded' });
await admin.waitForTimeout(3000);
await shot(admin, 'admin-after-approval');

// ─── 4. Employee signs in, completes profile, posts an RFP ───
console.log('\n── Employee posts a requirement ──');
const { c: emp2Ctx, page: emp } = await ctx();
await emp.goto(BASE, { waitUntil: 'domcontentloaded' });
await emp.waitForTimeout(1500);
await emp.getByRole('button', { name: /Post for your team|Go to my dashboard/i }).first().click();
await emp.waitForTimeout(500);
await emp.locator('#auth-email').fill(EMP);
await emp.locator('#auth-password').fill(PASS);
await emp.locator('.modal-overlay').getByRole('button', { name: /^Sign in$/ }).last().click();
await emp.waitForTimeout(3500);
await shot(emp, 'employee-after-signin');
ok('approved employee gets in', /\/corporate\//.test(emp.url()), emp.url());

// Complete the profile via the same endpoint the onboarding form posts to.
const profileStatus = await emp.evaluate(async () => {
  const r = await fetch('/api/profile/corporate', {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({
      name: 'Priya Sharma', mobile: '9811122233',
      officeCompanyName: 'Nexus Technologies', officeAddress: 'Building 10, DLF Cyber City',
      city: 'Gurugram', position: 'HR Manager', department: 'People Ops',
      lat: 28.4949, lng: 77.0895,
    }),
  });
  return r.status;
});
ok('employee profile saves', profileStatus === 200, `status ${profileStatus}`);

const rfp = await emp.evaluate(async () => {
  const r = await fetch('/api/rfps', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({
      category: 'food', occasion: 'office-party',
      categoryDetails: { mealType: 'Dinner', cuisine: 'Multi-cuisine', entertainment: ['DJ'] },
      universal: {
        startDate: '2027-11-08', endDate: '2027-11-08',
        timeSlot: 'Evening Gala (7:00 PM - Midnight)', timeFlexibility: 'Strict Schedule',
        urgency: 'Planned Quarter', persons: 120, budgetPerPerson: 2200,
        notes: 'Diwali party. Stage, sound, photo corner.',
      },
      serviceArea: 'DLF Cyber City',
    }),
  });
  return { status: r.status, body: await r.json() };
});
ok('employee posts the requirement', rfp.status === 201, `status ${rfp.status}`);
ok('budget computed server-side (120 x 2200)', rfp.body.data?.totalBudget === 264000, String(rfp.body.data?.totalBudget));
const rfpId = rfp.body.data.id;

await emp.goto(`${BASE}/corporate/dashboard`, { waitUntil: 'domcontentloaded' });
await emp.waitForTimeout(3000);
await shot(emp, 'employee-dashboard-with-rfp');
ok('the new requirement shows on the dashboard', (await emp.getByText(/Nexus Technologies|Diwali|Open/i).count()) > 0);

// ─── 5. Vendor bids ──────────────────────────────────────────
console.log('\n── Vendor bids ──');
const { c: vendCtx, page: vendor } = await ctx();
await vendor.goto(BASE, { waitUntil: 'domcontentloaded' });
await vendor.waitForTimeout(1500);
await vendor.getByRole('button', { name: /Post for your team|Go to my dashboard/i }).first().click();
await vendor.waitForTimeout(500);
await vendor.locator('#auth-email').fill(VENDOR.email);
await vendor.locator('#auth-password').fill(VENDOR.password);
await vendor.locator('.modal-overlay').getByRole('button', { name: /^Sign in$/ }).last().click();
await vendor.waitForTimeout(3500);
await shot(vendor, 'vendor-dashboard');
ok('vendor signs in', /\/vendor/.test(vendor.url()), vendor.url());

const vendorSees = await vendor.evaluate(async () => {
  const r = await fetch('/api/rfps', { credentials: 'same-origin' });
  const d = await r.json();
  return d.data.rfps.map((x) => ({ id: x.id, category: x.category, status: x.status }));
});
ok('vendor sees the open food requirement', vendorSees.some((x) => x.id === rfpId), JSON.stringify(vendorSees));

const bid = await vendor.evaluate(async (id) => {
  const r = await fetch(`/api/rfps/${id}/bids`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({
      rfpId: id, totalPrice: 238000, proposal: 'Buffet for 120, full bar, stage and sound included.',
      lineItems: [
        { description: 'Food & beverage, 120 pax', amount: 198000 },
        { description: 'Stage, sound, lighting', amount: 40000 },
      ],
    }),
  });
  return { status: r.status, body: await r.json() };
}, rfpId);
ok('vendor submits a bid', bid.status === 201, `status ${bid.status}`);
const bidId = bid.body.data.id;

// A second vendor bids lower, so the poster has a real choice.
const { c: vend2Ctx, page: vendor2 } = await ctx();
await vendor2.goto(BASE, { waitUntil: 'domcontentloaded' });
await vendor2.waitForTimeout(1200);
await vendor2.evaluate(async (creds) => {
  await fetch('/api/auth/login', {
    method: 'POST', headers: { 'content-type': 'application/json' }, credentials: 'same-origin',
    body: JSON.stringify(creds),
  });
}, { email: process.env.TEST_VENDOR2_EMAIL, password: process.env.TEST_VENDOR2_PASSWORD });
const bid2 = await vendor2.evaluate(async (id) => {
  const r = await fetch(`/api/rfps/${id}/bids`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, credentials: 'same-origin',
    body: JSON.stringify({ rfpId: id, totalPrice: 221000, proposal: 'Sharper price, same scope.' }),
  });
  return { status: r.status, body: await r.json() };
}, rfpId);
ok('a second vendor bids lower', bid2.status === 201, `status ${bid2.status}`);
const bid2Id = bid2.body.data.id;

// The masking claim, checked from the vendor's own browser.
const rival = await vendor.evaluate(async (id) => {
  const r = await fetch(`/api/rfps/${id}`, { credentials: 'same-origin' });
  const d = await r.json();
  return d.data.bids.map((b) => ({ id: b.id, price: b.totalPrice, company: b.vendorCompany }));
}, rfpId);
ok('vendor A cannot see vendor B\'s bid at all', rival.length === 1 && rival[0].id === bidId, JSON.stringify(rival));

const tamper = await vendor.evaluate(async (id) => {
  const r = await fetch(`/api/bids/${id}`, {
    method: 'PATCH', headers: { 'content-type': 'application/json' }, credentials: 'same-origin',
    body: JSON.stringify({ totalPrice: 1 }),
  });
  return r.status;
}, bid2Id);
ok('vendor A cannot edit vendor B\'s bid by id', tamper === 404, `status ${tamper}`);

await vendor.reload({ waitUntil: 'domcontentloaded' });
await vendor.waitForTimeout(3000);
await shot(vendor, 'vendor-dashboard-after-bid');

// ─── 6. Employee reviews masked bids and awards ──────────────
console.log('\n── Award ──');
await emp.goto(`${BASE}/corporate/rfp/${rfpId}`, { waitUntil: 'domcontentloaded' });
await emp.waitForTimeout(3500);
await shot(emp, 'employee-bid-comparison-masked');
const masked = await emp.evaluate(async (id) => {
  const r = await fetch(`/api/rfps/${id}`, { credentials: 'same-origin' });
  const d = await r.json();
  return d.data.bids.map((b) => b.vendorCompany);
}, rfpId);
ok('poster sees both bids, identities masked', masked.length === 2 && masked.every((n) => /^Vendor [A-Z0-9]{4}$/.test(n)), JSON.stringify(masked));

const award = await emp.evaluate(async ({ id, bidId }) => {
  const r = await fetch(`/api/rfps/${id}/award`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, credentials: 'same-origin',
    body: JSON.stringify({ bidId }),
  });
  return { status: r.status, body: await r.json() };
}, { id: rfpId, bidId: bid2Id });
ok('poster awards the cheaper bid', award.status === 200, `status ${award.status}`);

const revealed = await emp.evaluate(async (id) => {
  const r = await fetch(`/api/rfps/${id}`, { credentials: 'same-origin' });
  const d = await r.json();
  return { status: d.data.rfp.status, names: d.data.bids.map((b) => b.vendorCompany) };
}, rfpId);
ok('status becomes awarded', revealed.status === 'awarded', revealed.status);
ok('identities revealed after award', revealed.names.some((n) => !/^Vendor [A-Z0-9]{4}$/.test(n)), JSON.stringify(revealed.names));

await emp.reload({ waitUntil: 'domcontentloaded' });
await emp.waitForTimeout(3000);
await shot(emp, 'employee-after-award-revealed');

// ─── 7. Complete and rate ────────────────────────────────────
console.log('\n── Complete and rate ──');
const early = await emp.evaluate(async (id) => {
  const r = await fetch('/api/reviews', {
    method: 'POST', headers: { 'content-type': 'application/json' }, credentials: 'same-origin',
    body: JSON.stringify({ rfpId: id, rating: 5, comment: 'too early' }),
  });
  return r.status;
}, rfpId);
ok('rating is blocked before the event is completed', early === 400, `status ${early}`);

const completed = await emp.evaluate(async (id) => {
  const r = await fetch(`/api/rfps/${id}/complete`, { method: 'POST', credentials: 'same-origin' });
  return r.status;
}, rfpId);
ok('poster marks it complete', completed === 200, `status ${completed}`);

const rated = await emp.evaluate(async (id) => {
  const r = await fetch('/api/reviews', {
    method: 'POST', headers: { 'content-type': 'application/json' }, credentials: 'same-origin',
    body: JSON.stringify({ rfpId: id, rating: 5, comment: 'Ran on time, food was excellent, sound crew were pros.' }),
  });
  return r.status;
}, rfpId);
ok('poster rates the vendor', rated === 201, `status ${rated}`);

const vendorId = (await pool.query('SELECT vendor_id FROM bids WHERE id = $1', [bid2Id])).rows[0].vendor_id;
const publicReviews = await fetch(`${BASE}/api/reviews?vendorId=${vendorId}`).then((r) => r.json());
ok('the rating shows on the public vendor record', publicReviews.data.count >= 1 && publicReviews.data.average === 5, JSON.stringify(publicReviews.data));

await emp.goto(`${BASE}/vendors`, { waitUntil: 'domcontentloaded' });
await emp.waitForTimeout(3500);
await shot(emp, 'public-vendor-directory');

// ─── 8. Logout really is server-side ─────────────────────────
console.log('\n── Session ──');
const cookies = await emp2Ctx.cookies();
const sessionCookie = cookies.find((c) => c.name === 'coe_session');
await emp.evaluate(async () => {
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
});
const { c: replayCtx, page: replay } = await ctx();
await replayCtx.addCookies([sessionCookie]);
await replay.goto(BASE, { waitUntil: 'domcontentloaded' });
const replayStatus = await replay.evaluate(async () => {
  const r = await fetch('/api/rfps', { credentials: 'same-origin' });
  return r.status;
});
ok('the copied cookie is dead after logout', replayStatus === 401, `status ${replayStatus}`);

// Sign a fresh context in via the API — the UI sign-in path is exercised
// above; here we only need the cookie.
async function apiSignIn(page, email, password) {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  const status = await page.evaluate(async (creds) => {
    const r = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(creds),
    });
    return r.status;
  }, { email, password });
  if (status !== 200) throw new Error(`sign-in for ${email} returned ${status}`);
}

// ─── 9. The category modal is a second, separate posting path ─
//
// Everything above posts through the dashboard form. The category modal is
// the path most people actually use, and it broke independently: it called
// submitRFP() without awaiting, so a requirement the server rejected still
// showed the "Published to verified vendors" screen and then existed
// nowhere. Nothing here covered it, which is why it shipped. It does now.
console.log('\n── Post through the category modal ──');
{
  const { c: modalCtx, page: mp } = await ctx();
  await apiSignIn(mp, EMP, PASS);
  await mp.goto(`${BASE}/corporate/dashboard`, { waitUntil: 'domcontentloaded' });
  await mp.waitForTimeout(2000);

  const before = Number(
    (await pool.query('SELECT COUNT(*)::int AS n FROM rfps')).rows[0].n
  );

  await mp.getByRole('button', { name: /Post New RFP/i }).first().click();
  await mp.waitForTimeout(900);
  const modal = mp.locator('.modal-overlay');
  ok('the category modal opens', (await modal.count()) === 1);

  // Step 1 — a format, so categoryDetails isn't empty.
  for (const b of await modal.locator('button').all()) {
    const t = (await b.innerText().catch(() => '')) || '';
    if (/Gala Dinner/i.test(t)) { await b.click(); break; }
  }
  await modal.getByRole('button', { name: /^Continue/i }).click();
  await mp.waitForTimeout(700);

  // Step 2 — the fields the server actually validates.
  const dates = modal.locator('input[type="date"]');
  await dates.nth(0).fill('2027-06-18');
  await dates.nth(1).fill('2027-06-18');
  const nums = modal.locator('input[type="number"]');
  await nums.nth(0).fill('64');
  await nums.nth(1).fill('1450');
  await modal.getByRole('button', { name: /^Continue/i }).click();
  await mp.waitForTimeout(700);
  await shot(mp, 'modal-confirm-step');

  await modal.getByRole('button', { name: /Publish Corporate RFP/i }).click();
  await mp.waitForTimeout(2500);
  await shot(mp, 'modal-published');

  const after = Number(
    (await pool.query('SELECT COUNT(*)::int AS n FROM rfps')).rows[0].n
  );
  ok('the modal actually writes an RFP', after === before + 1, `${before} -> ${after}`);

  const confirmation = await modal.innerText().catch(() => '');
  ok('the success screen only appears once the server accepted it', /Live|Published/i.test(confirmation));

  const row = (
    await pool.query(
      "SELECT status, total_budget FROM rfps ORDER BY created_at DESC LIMIT 1"
    )
  ).rows[0];
  ok('it is posted open, so vendors can see it', row.status === 'open', row.status);
  ok('budget is computed server-side (64 x 1450)', Number(row.total_budget) === 92800, String(row.total_budget));

  // And the vendor's feed really contains it.
  const { c: vCtx, page: vp } = await ctx();
  await apiSignIn(vp, VENDOR.email, VENDOR.password);
  const feed = await vp.evaluate(async () => {
    const r = await fetch('/api/rfps', { credentials: 'same-origin' });
    return r.json();
  });
  const ids = (feed.data?.rfps ?? feed.data ?? []).map((r) => r.id);
  const newest = (
    await pool.query('SELECT id FROM rfps ORDER BY created_at DESC LIMIT 1')
  ).rows[0].id;
  ok('the vendor feed contains the modal-posted requirement', ids.includes(newest));

  await modalCtx.close();
  await vCtx.close();
}

await browser.close();
await pool.end();
console.log('\nScreenshots in', SHOTS);
