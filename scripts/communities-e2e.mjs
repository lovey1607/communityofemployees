// scripts/communities-e2e.mjs — browser checks for /communities.
// Usage: BASE=http://localhost:3000 node scripts/communities-e2e.mjs
// Needs a running server (npm run dev / npm run start). Screenshots land in
// research/screenshots/ so a reviewer can eyeball the result.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const B = process.env.BASE || 'http://localhost:3000';
const OUT = 'research/screenshots/';
mkdirSync(OUT, { recursive: true });
let n = 0; const ok = (name, cond, extra = '') => { if (!cond) throw new Error(`✗ ${name} ${extra}`); n++; console.log('✓', name, extra); };

const b = await chromium.launch();
const errs = [];
const page = async (vp, opts = {}) => {
  const ctx = await b.newContext({ viewport: vp, ...opts });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => errs.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error' && !/ERR_|favicon|openstreetmap|googleapis|status of (404|500)/.test(m.text())) errs.push(m.text()); });
  return [ctx, p];
};

let [ctx, p] = await page({ width: 1400, height: 900 });
await p.goto(`${B}/communities`, { waitUntil: 'networkidle' }); await p.waitForTimeout(600);
await p.screenshot({ path: `${OUT}01-desktop-default.png` });
const total = await p.$$eval('.cop-card', (e) => e.length);
ok('≥ 60 cards for the Gurgaon area by default', total >= 60, `(${total})`);
ok('filter bar visible without scrolling', await p.isVisible('.cop-cats'));
ok('no "List a community" text hidden (button has visible text)', (await p.$eval('.cop-nav .cop-btn-primary', (e) => getComputedStyle(e).color)) === 'rgb(255, 255, 255)');

await p.click('.cop-cat:has-text("Running")'); await p.waitForTimeout(700);
ok('Running chip filters and updates the URL', p.url().includes('category=running'));
ok('picking a category opens the swipe deck', await p.isVisible('.cop-deck'));
ok('desktop deck shows 3 cards side by side', (await p.$$('.cop-deck-rail .cop-deck-card')).length === 3);
ok('cursor buddy is active on desktop', await p.evaluate(() => document.documentElement.classList.contains('cop-cursor')));
await p.screenshot({ path: `${OUT}02-desktop-running-swipe.png` });
// swipe: drag right saves + advances
const first = await p.textContent('.cop-deck-card.front h3');
const bx = await p.locator('.cop-deck-card.front').boundingBox();
await p.mouse.move(bx.x + bx.width / 2, bx.y + bx.height / 2); await p.mouse.down();
await p.mouse.move(bx.x + bx.width / 2 + 300, bx.y + bx.height / 2, { steps: 12 }); await p.mouse.up(); await p.waitForTimeout(700);
const second = await p.textContent('.cop-deck-card.front h3');
ok('drag right advances the deck', first !== second, `${first} → ${second}`);
ok('drag right saves to "Your picks"', (await p.$$eval('.cop-picks a', (e) => e.length)) === 1);
await p.click('.cop-deck-actions .skip'); await p.waitForTimeout(600);
ok('skip button advances', (await p.textContent('.cop-deck-card.front h3')) !== second);
await p.click('.cop-deck-actions .undo'); await p.waitForTimeout(600);
ok('undo brings the card back', (await p.textContent('.cop-deck-card.front h3')) === second);
await p.keyboard.press('ArrowRight'); await p.waitForTimeout(600);
ok('→ key saves', (await p.$$eval('.cop-picks a', (e) => e.length)) === 2);
await p.click('.cop-seg button:has-text("Grid")'); await p.waitForTimeout(600);
ok('Grid toggle shows cards, all running', await p.$$eval('.cop-card .catpill', (e) => e.length > 5 && e.every((x) => x.textContent === 'Running')));
await p.screenshot({ path: `${OUT}02-desktop-running.png` });

await p.click('.cop-loc .change'); await p.waitForTimeout(400);
await p.screenshot({ path: `${OUT}03-desktop-location-panel.png` });
await p.click('.cop-locpick .areas button:has-text("Cyber City")'); await p.waitForTimeout(800);
const firstDist = await p.$eval('.cop-card .dist', (e) => e.textContent);
ok('area pick sorts by distance', firstDist.includes('km'), firstDist);
await p.screenshot({ path: `${OUT}04-desktop-running-near-cybercity.png` });

await p.click('.cop-pill:has-text("Map")'); await p.waitForTimeout(500);
ok('map panel toggles (keyless OSM embed)', await p.isVisible('.cop-map-panel iframe'));
await p.screenshot({ path: `${OUT}05-desktop-map.png` });
await p.click('.cop-pill:has-text("Map")');

await p.click('.cop-pill:has-text("Filters")'); await p.waitForTimeout(400);
await p.screenshot({ path: `${OUT}06-desktop-filter-panel.png` });
await p.keyboard.press('Escape'); await p.waitForSelector('.cop-desk-panel', { state: 'detached', timeout: 3000 });
ok('Escape closes the panel', true);

await p.fill('.cop-search input', 'zzzz-nothing'); await p.waitForTimeout(500);
ok('empty state shows with suggestions', await p.isVisible('.cop-empty .sugg'));
await p.screenshot({ path: `${OUT}07-desktop-empty-state.png` });
await p.click('.cop-search .clear');

const join = await p.$eval('.cop-card .join', (e) => ({ href: e.href, target: e.target, rel: e.rel }));
ok('join link opens organiser URL in new tab with noopener', /^https?:/.test(join.href) && join.target === '_blank' && /noopener/.test(join.rel));

await p.click('.cop-card .ico[aria-label="Save"]'); await p.waitForTimeout(200);
ok('save toggles (localStorage)', (await p.$$eval('.cop-card .ico.saved', (e) => e.length)) >= 1);

await p.goto(`${B}/communities/the-bhag`, { waitUntil: 'networkidle' });
ok('detail page renders OG tags', (await p.$eval('meta[property="og:title"]', (e) => e.content)).includes('The Bhag'));
ok('detail page shows last-checked date', (await p.textContent('.cop-detail')).includes('Last checked'));
await p.screenshot({ path: `${OUT}08-desktop-detail.png`, fullPage: true });

await p.goto(`${B}/communities/gurgaon/running`, { waitUntil: 'networkidle' });
ok('/communities/gurgaon/running opens straight into the deck', await p.isVisible('.cop-deck') && (await p.textContent('h1')).includes('run crew'));
await p.goto(`${B}/communities/mumbai`, { waitUntil: 'networkidle' });
ok('/communities/mumbai switches city', (await p.textContent('h1')).includes('Mumbai'));
await p.goto(`${B}/communities/nope-not-a-slug`);
ok('unknown slug → 404', (await p.title()).toLowerCase().includes('404') || (await p.content()).includes('404'));
// 15 Nov discovery: new categories, online rows in every city, new filters
await p.goto(`${B}/communities?category=dating`, { waitUntil: 'networkidle' }); await p.waitForTimeout(500);
ok('?category=dating shows singles communities', (await p.content()).includes('Let’s Socialise'));
await p.screenshot({ path: `${OUT}12-desktop-singles.png` });
await p.goto(`${B}/communities/jaipur?mode=online`, { waitUntil: 'networkidle' }); await p.waitForTimeout(500);
ok('online rows appear in a non-metro city (Jaipur, mode=online)', (await p.content()).includes('LocalCircles'));
await p.goto(`${B}/communities/save-indian-family-foundation`, { waitUntil: 'networkidle' });
ok('online detail page: pan-India breadcrumb, organiser join link', (await p.textContent('.cop-crumbs')).includes('Online') && (await p.$$('a[href^="https://chat.whatsapp.com/"]')).length > 0);
await p.goto(`${B}/communities`, { waitUntil: 'networkidle' });
await p.click('button:has-text("Filters")'); await p.waitForTimeout(400);
ok('Filters panel has Age focus, Where, Membership and Discord options', await p.isVisible('text=Age focus') && await p.isVisible('button:has-text("Online / hybrid")') && await p.isVisible('button:has-text("Membership / premium")') && await p.isVisible('.cop-fgroup button:has-text("Discord")'));
await p.screenshot({ path: `${OUT}13-desktop-filters-v7.png` });
await p.goto(`${B}/communities/submit`, { waitUntil: 'networkidle' });
await p.screenshot({ path: `${OUT}09-desktop-submit.png` });
await ctx.close();

// geolocation granted near Sohna Road
[ctx, p] = await page({ width: 1400, height: 900 }, { geolocation: { latitude: 28.418, longitude: 77.04 }, permissions: ['geolocation'] });
await p.goto(`${B}/communities`, { waitUntil: 'networkidle' });
await p.click('.cop-ask button:has-text("Use my location")'); await p.waitForTimeout(1000);
ok('geolocation granted → "Near your location"', (await p.textContent('.cop-loc .where')).includes('your location'));
await ctx.close();

// geolocation denied → graceful
[ctx, p] = await page({ width: 1400, height: 900 });
await p.goto(`${B}/communities`, { waitUntil: 'networkidle' });
await p.click('.cop-ask button:has-text("Use my location")'); await p.waitForTimeout(1000);
ok('geolocation denied → location picker opens, no crash', await p.isVisible('.cop-locpick'));
await ctx.close();

// mobile
[ctx, p] = await page({ width: 390, height: 844 });
await p.goto(`${B}/communities`, { waitUntil: 'networkidle' }); await p.waitForTimeout(500);
ok('mobile: no horizontal page scroll', (await p.evaluate(() => document.documentElement.scrollWidth)) === 390);
const h1a = await p.textContent('.cop-hero h1'); await p.waitForTimeout(4300); const h1b = await p.textContent('.cop-hero h1');
ok('mobile: headline cycles through category titles', h1a !== h1b, `${h1a} → ${h1b}`);
ok('mobile: only All + 2 chips + More visible', (await p.$$eval('.cop-cat', (e) => e.filter((x) => getComputedStyle(x).display !== 'none').length)) === 4);
await p.click('.cop-cat.more-cats'); await p.waitForTimeout(500);
await p.click('.cop-sheet .cop-catgrid button:has-text("Games")'); await p.waitForTimeout(900);
ok('mobile: More sheet → pick a category → deck', (await p.isVisible('.cop-deck')) && (await p.textContent('.cop-hero h1')).includes('game night'));
await p.goto(`${B}/communities`, { waitUntil: 'networkidle' }); await p.waitForTimeout(400);
await p.screenshot({ path: `${OUT}10-mobile-default.png` });
await p.click('.cop-pill:has-text("Filters")'); await p.waitForTimeout(500);
ok('mobile: filters open as a bottom sheet', await p.isVisible('.cop-sheet'));
await p.screenshot({ path: `${OUT}11-mobile-sheet.png` });
await p.keyboard.press('Escape');
await p.goto(`${B}/communities/gurgaon/books`, { waitUntil: 'networkidle' }); await p.waitForTimeout(400);
ok('mobile: deck renders, no horizontal scroll', (await p.isVisible('.cop-deck')) && (await p.evaluate(() => document.documentElement.scrollWidth)) === 390);
await p.screenshot({ path: `${OUT}13-mobile-swipe.png` });
await p.goto(`${B}/communities/cubbon-reads`, { waitUntil: 'networkidle' });
ok('mobile: sticky join bar on detail', await p.isVisible('.cop-sticky-join .cop-btn'));
await p.screenshot({ path: `${OUT}12-mobile-detail.png` });
await ctx.close();

// reduced motion
[ctx, p] = await page({ width: 1200, height: 800 });
await p.emulateMedia({ reducedMotion: 'reduce' });
await p.goto(`${B}/communities`, { waitUntil: 'networkidle' });
ok('reduced motion: page renders', (await p.$$eval('.cop-card', (e) => e.length)) > 0);
await ctx.close();

await b.close();
ok('no page errors', errs.length === 0, errs.join(' | ').slice(0, 300));
console.log(`\n${n} checks passed`);
