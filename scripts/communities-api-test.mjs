// scripts/communities-api-test.mjs — end-to-end check of the communities
// backend against a running server + LOCAL database (never production).
//   BASE=http://localhost:3000 ADMIN_EMAIL=… ADMIN_PASSWORD=… node scripts/communities-api-test.mjs
const B = process.env.BASE || 'http://localhost:3000';
let n = 0; const ok = (name, cond, extra = '') => { if (!cond) throw new Error(`✗ ${name} ${extra}`); n++; console.log('✓', name, extra); };
let cookie = '';
const call = async (method, path, body, auth = true) => {
  const r = await fetch(B + path, { method, headers: { 'content-type': 'application/json', origin: B, ...(auth && cookie ? { cookie } : {}) }, body: body ? JSON.stringify(body) : undefined, redirect: 'manual' });
  const set = r.headers.getSetCookie?.() ?? [];
  if (set.length) cookie = set.map((c) => c.split(';')[0]).join('; ');
  let j = null; try { j = await r.json(); } catch { /* html */ }
  return { status: r.status, j };
};
const listing = { name: 'API Test Pickleball Crew', tagline: 'Weeknight pickleball for beginners in Sector 56.', category: 'sports', city: 'Gurgaon', area: 'Sector 56',
  join: { url: 'https://chat.whatsapp.com/TESTTESTTEST', platform: 'whatsapp', cta: 'Join WhatsApp group' }, pricing: { type: 'pay-per-event', note: '₹250' }, meets: { cadence: 'weekly', summary: 'Tue & Thu 8pm' } };

// public: anonymous admin access is refused
ok('admin list needs login', (await call('GET', '/api/admin/communities', null, false)).status === 401);

// lead submits a new community
const bad = await call('POST', '/api/communities/submissions', { kind: 'new', payload: { ...listing, join: { ...listing.join, url: 'not-a-link' } }, submitterName: 'Asha', submitterEmail: 'asha@example.com' }, false);
ok('invalid join link is rejected with a field error', bad.status === 400 && JSON.stringify(bad.j).includes('join.url'));
const sub = await call('POST', '/api/communities/submissions', { kind: 'new', payload: listing, submitterName: 'Asha', submitterEmail: 'asha@example.com', submitterRole: 'organiser', message: 'We play twice a week.' }, false);
ok('lead can submit a new community', sub.status === 200 && sub.j.data.id);
const upd = await call('POST', '/api/communities/submissions', { kind: 'update', targetSlug: 'gurgaon-reads', payload: { meets: { cadence: 'weekly', summary: 'Sundays 11am at Chapters' } }, submitterName: 'Rahul', submitterEmail: 'rahul@example.com' }, false);
ok('lead can request an update to an existing listing', upd.status === 200);
const rem = await call('POST', '/api/communities/submissions', { kind: 'remove', targetSlug: 'the-bhag', submitterName: 'Org', submitterEmail: 'org@example.com', message: 'Please take us down' }, false);
ok('lead can request a removal', rem.status === 200);
ok('unknown listing is refused', (await call('POST', '/api/communities/submissions', { kind: 'remove', targetSlug: 'nope-xyz', submitterName: 'Org', submitterEmail: 'org@example.com' }, false)).status === 400);

// admin logs in
const login = await call('POST', '/api/auth/login', { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD });
ok('admin logs in', login.status === 200, `(${login.status})`);

const q = await call('GET', '/api/admin/community-submissions?status=pending');
ok('admin sees 3 pending requests', q.j.data.items.length >= 3 && q.j.data.pending >= 3);
const byKind = (k) => q.j.data.items.find((s) => s.kind === k);
ok('update request stores only the fields the lead changed', JSON.stringify(Object.keys(byKind('update').payload)) === '["meets"]', JSON.stringify(Object.keys(byKind('update').payload)));

// approve new → appears publicly
const ap = await call('POST', `/api/admin/community-submissions/${byKind('new').id}`, { action: 'approve' });
ok('approving a new listing publishes it', ap.status === 200 && ap.j.data.slug);
const newSlug = ap.j.data.slug;
const page = await fetch(`${B}/communities/${newSlug}`);
ok('new listing has a public page', page.status === 200 && (await page.text()).includes('API Test Pickleball Crew'));
const city = await (await fetch(`${B}/communities?city=Gurgaon`)).text();
ok('new listing shows in the marketplace data', city.includes('API Test Pickleball Crew'));

// approve update → detail reflects it
ok('approving an update applies it', (await call('POST', `/api/admin/community-submissions/${byKind('update').id}`, { action: 'approve' })).status === 200);
ok('updated schedule is live', (await (await fetch(`${B}/communities/gurgaon-reads`)).text()).includes('Sundays 11am at Chapters'));

// reject removal → still live
ok('rejecting removal keeps listing', (await call('POST', `/api/admin/community-submissions/${byKind('remove').id}`, { action: 'reject', note: 'Asked organiser to confirm' })).status === 200 && (await fetch(`${B}/communities/the-bhag`)).status === 200);
ok('a reviewed request cannot be reviewed twice', (await call('POST', `/api/admin/community-submissions/${byKind('remove').id}`, { action: 'approve' })).status === 409);

// admin CRUD + filters
const created = await call('POST', '/api/admin/communities', { ...listing, name: 'Admin Added Book Club', category: 'books', city: 'Mumbai', pricing: { type: 'free' }, join: { url: 'https://www.instagram.com/test_book_club/', platform: 'instagram', cta: 'Follow on Instagram' } });
ok('admin can add a listing', created.status === 200, `(${created.status} ${JSON.stringify(created.j?.error ?? '')})`);
const aSlug = created.j.data.slug;
const filt = await call('GET', '/api/admin/communities?city=Mumbai&category=books&pricing=free&platform=instagram&source=added');
ok('admin filters (city+category+free+platform+source) find it', filt.j.data.items.some((i) => i.slug === aSlug));
const one = await call('GET', `/api/admin/communities/${aSlug}`);
ok('admin can load it for editing', one.status === 200 && one.j.data.input.name === 'Admin Added Book Club');
const put = await call('PUT', `/api/admin/communities/${aSlug}`, { ...one.j.data.input, tagline: 'Monthly fiction picks, Bandra.', pricing: { type: 'membership', note: '₹999/yr' } });
ok('admin can change details', put.status === 200 && put.j.data.community.pricing.type === 'membership');
ok('admin can hide a researched listing', (await call('PATCH', '/api/admin/communities/the-bhag', { action: 'hide' })).status === 200 && (await fetch(`${B}/communities/the-bhag`)).status === 404);
ok('hidden filter lists it', (await call('GET', '/api/admin/communities?status=hidden')).j.data.items.some((i) => i.slug === 'the-bhag'));
ok('admin can unhide it', (await call('PATCH', '/api/admin/communities/the-bhag', { action: 'unhide' })).status === 200 && (await fetch(`${B}/communities/the-bhag`)).status === 200);
ok('unhiding an unedited listing leaves no override behind', !(await call('GET', '/api/admin/communities?source=edited')).j.data.items.some((i) => i.slug === 'the-bhag'));
ok('admin can revert an edited listing to the researched version', (await call('PATCH', '/api/admin/communities/gurgaon-reads', { action: 'revert' })).status === 200 && !(await (await fetch(`${B}/communities/gurgaon-reads`)).text()).includes('Sundays 11am at Chapters'));
ok('researched listings cannot be hard-deleted', (await call('DELETE', '/api/admin/communities/the-bhag')).status === 400);
ok('admin can delete an added listing', (await call('DELETE', `/api/admin/communities/${aSlug}`)).status === 200 && (await fetch(`${B}/communities/${aSlug}`)).status === 404);
ok('cleanup: delete the approved test listing', (await call('DELETE', `/api/admin/communities/${newSlug}`)).status === 200);
console.log(`\n${n} checks passed`);
