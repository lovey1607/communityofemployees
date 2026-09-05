// ============================================================
// scripts/contrast-audit.mjs
//
// Walks every screen as each role and reports text whose colour is too
// close to the background behind it. Written after a palette migration
// turned several screens into white-on-white — the kind of regression a
// passing test suite happily reports as green.
//
// It resolves the real painted background by walking up the tree past
// transparent ancestors, so a low ratio here usually means a real problem.
// Known false positives: text over a CSS gradient (the walker sees the
// gradient element's transparent backgroundColor) and gradient-clipped
// text, so read the list, don't gate CI on the count alone.
//
//   BASE_URL=http://127.0.0.1:3000 node scripts/contrast-audit.mjs
// ============================================================
import { chromium } from 'playwright';
const B = (process.env.BASE_URL ?? 'http://127.0.0.1:3000').replace(/\/$/, '');
const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}
);

const lum = ([r,g,b]) => { const f=c=>{c/=255;return c<=0.03928?c/12.92:Math.pow((c+0.055)/1.055,2.4)}; return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b); };
const parse = s => (s.match(/[\d.]+/g)||[]).slice(0,3).map(Number);

const CHECK = `(() => {
  const out = [];
  const bgOf = (el) => {
    let n = el;
    while (n && n !== document.documentElement) {
      const bg = getComputedStyle(n).backgroundColor;
      const m = bg.match(/[\\d.]+/g);
      if (m && (m.length < 4 || Number(m[3]) > 0.5)) return bg;
      n = n.parentElement;
    }
    return 'rgb(255,247,236)';
  };
  for (const el of document.querySelectorAll('body *')) {
    if (el.children.length && ![...el.childNodes].some(n => n.nodeType===3 && n.textContent.trim())) continue;
    const t = el.textContent?.trim(); if (!t || t.length > 120) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility==='hidden' || cs.display==='none' || Number(cs.opacity) < 0.3) continue;
    const r = el.getBoundingClientRect(); if (r.width < 4 || r.height < 4) continue;
    out.push({ text: t.slice(0,60), color: cs.color, bg: bgOf(el), tag: el.tagName });
  }
  return out;
})()`;

async function sign(page, email, pw) {
  await page.request.post(B + '/api/auth/login', { data: { email, password: pw } });
}

const seeds = JSON.parse((await import('fs')).readFileSync('seed/fixtures.json','utf8'));
const acct = (r) => seeds.accounts.find(u => u.role === r);

const pages = [
  ['/', null],
  ['/vendors', null],
  ['/legal', null], ['/legal/terms', null],
  ['/admin/dashboard', 'admin'],
  ['/corporate/dashboard', 'corporate'],
  ['/vendor/dashboard', 'vendor'],
  ['/vendor/profile', 'vendor'],
  ['/corporate/profile', 'corporate'],
];

let bad = 0;
for (const [path, role] of pages) {
  const c = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await c.newPage();
  if (role) { const u = acct(role); await sign(page, u.email, u.password); }
  await page.goto(B + path, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2200);
  const items = await page.evaluate(CHECK);
  const fails = [];
  for (const it of items) {
    const fg = parse(it.color), bg = parse(it.bg);
    if (fg.length < 3 || bg.length < 3) continue;
    const L1 = lum(fg), L2 = lum(bg);
    const ratio = (Math.max(L1,L2)+0.05)/(Math.min(L1,L2)+0.05);
    if (ratio < 2.2) fails.push(`${ratio.toFixed(2)}  ${it.color} on ${it.bg}  "${it.text}"`);
  }
  const uniq = [...new Set(fails)];
  console.log(`\n${path}${role?` (${role})`:''} — ${uniq.length} low-contrast`);
  uniq.slice(0, 12).forEach(f => console.log('   ' + f));
  bad += uniq.length;
  await c.close();
}
console.log(`\nTOTAL low-contrast: ${bad}`);
await browser.close();
process.exitCode = bad ? 1 : 0;
