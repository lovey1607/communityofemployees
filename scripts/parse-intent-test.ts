// ============================================================
// scripts/parse-intent-test.ts
//
// The hero parser guesses at what someone typed and pre-fills a requirement
// with the result. A wrong guess is quiet — the person sees a filled field and
// may not notice it says 20 people when they wrote "20th Sep". So the cases
// below are mostly about what it must NOT do.
//
//   npm run test:parse
// ============================================================

import { parseIntent } from '../lib/parseIntent';

let passed = 0;
let failed = 0;

function check(name: string, condition: boolean, detail = '') {
  if (condition) {
    passed += 1;
    console.log(`  \x1b[32mPASS\x1b[0m  ${name}`);
  } else {
    failed += 1;
    console.log(`  \x1b[31mFAIL\x1b[0m  ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

// A fixed "today" so weekday and relative-date cases are deterministic.
// Thursday, 10 September 2026.
const NOW = new Date(2026, 8, 10);

console.log('\n── Category ──');
{
  const cases: [string, string][] = [
    ['team outing for 50 people this weekend', 'trips'],
    ['dinner on 20th Sep for 30 folks at Cyber Hub', 'food'],
    ['box cricket league for 6 teams', 'sports'],
    ['diwali hampers for 200 employees', 'gifts'],
    ['hoodies for the team, 40 pieces', 'dress'],
    ['badminton doubles on Friday', 'sports'],
    ['sundowner at a rooftop in Sector 29', 'food'],
  ];
  for (const [text, expected] of cases) {
    const got = parseIntent(text, NOW).category;
    check(`"${text}" → ${expected}`, got === expected, `got ${got}`);
  }
  check('gibberish has no category', parseIntent('asdf qwerty', NOW).category === null);
}

console.log('\n── Headcount, and what is not a headcount ──');
{
  check('"for 50 people" → 50', parseIntent('outing for 50 people', NOW).headcount === 50);
  check('"team of 40" → 40', parseIntent('lunch for team of 40', NOW).headcount === 40);
  check('"30 folks" → 30', parseIntent('dinner for 30 folks', NOW).headcount === 30);
  check('"120 pax" → 120', parseIntent('gala for 120 pax', NOW).headcount === 120);

  // The one that matters: a date must never be read as a headcount.
  const d = parseIntent('dinner on 20th Sep', NOW);
  check('"20th Sep" is NOT 20 people', d.headcount === null, `got ${d.headcount}`);

  const both = parseIntent('dinner on 20th Sep for 30 folks at Cyber Hub', NOW);
  check('date and headcount together read correctly', both.headcount === 30 && both.date === '2026-09-20',
    `${both.headcount} / ${both.date}`);

  check('no number → null', parseIntent('team dinner somewhere nice', NOW).headcount === null);
}

console.log('\n── Dates ──');
{
  // Thursday 10 Sep 2026 → the coming Saturday is the 12th.
  check('"this weekend" → Sat 12 Sep', parseIntent('outing this weekend', NOW).date === '2026-09-12',
    parseIntent('outing this weekend', NOW).date ?? 'null');
  check('"next weekend" → Sat 19 Sep', parseIntent('outing next weekend', NOW).date === '2026-09-19');
  check('"tomorrow" → 11 Sep', parseIntent('lunch tomorrow', NOW).date === '2026-09-11');
  check('"on 20th Sep" → 2026-09-20', parseIntent('dinner on 20th Sep', NOW).date === '2026-09-20');
  check('"Sep 20" → 2026-09-20', parseIntent('dinner Sep 20', NOW).date === '2026-09-20');
  check('"Friday" → 11 Sep', parseIntent('badminton on Friday', NOW).date === '2026-09-11');

  // A month already gone means next year, not a date in the past.
  const past = parseIntent('offsite on 5th Feb', NOW);
  check('a past month rolls to next year', past.date === '2027-02-05', past.date ?? 'null');

  check('no date → null', parseIntent('dinner for 30', NOW).date === null);
  check('impossible date rejected', parseIntent('party on 31 Feb', NOW).date === null);
}

console.log('\n── Locality and budget ──');
{
  check('Cyber Hub found', parseIntent('dinner at Cyber Hub', NOW).locality === 'Cyber Hub');
  check('Sohna Road found', parseIntent('turf on Sohna Road', NOW).locality === 'Sohna Road');
  check('no locality → null', parseIntent('dinner somewhere', NOW).locality === null);

  check('"₹1200 per head" → 1200', parseIntent('dinner at ₹1200 per head', NOW).budgetPerPerson === 1200);
  check('"1500 pp" → 1500', parseIntent('lunch 1500 pp', NOW).budgetPerPerson === 1500);
  check('"2k per head" → 2000', parseIntent('dinner 2k per head', NOW).budgetPerPerson === 2000);
  check('no budget → null', parseIntent('dinner for 30', NOW).budgetPerPerson === null);
}

console.log('\n── The real examples shown in the hero ──');
{
  // Every rotating example must parse into something useful, or the hero is
  // advertising a capability the form does not deliver.
  const examples = [
    'team outing for 50 people this weekend',
    'dinner on 20th Sep for 30 folks at Cyber Hub',
    'box cricket for 6 teams on a Saturday night',
    'diwali party for 200 at a banquet in Sector 29',
    'team lunch for 25 near Udyog Vihar',
    'offsite for 60 people, two days, somewhere with a lawn',
    'badminton court for 12 on Friday evening',
    'joining kits for 40 new hires',
    'farewell dinner for 15 on Golf Course Road',
    'turf football for 20 on Sunday morning',
    'client dinner for 8, private room, MG Road',
    'hoodies for 45 people before the offsite',
    'high tea for 35 in Cyber City',
    'cricket tournament for 8 teams next month',
    'sundowner for 50 on a rooftop',
  ];
  for (const text of examples) {
    const p = parseIntent(text, NOW);
    const useful = Boolean(p.category) && (p.headcount !== null || p.date !== null);
    check(`"${text.slice(0, 46)}…"`, useful,
      `cat=${p.category} head=${p.headcount} date=${p.date}`);
  }
}

console.log(`\n${passed} passed, ${failed} failed.\n`);
process.exit(failed > 0 ? 1 : 0);
