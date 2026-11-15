// ============================================================
// data/coe-events.ts — Community of Employees (COE) corporate-events
// content, carried over to the Community of People site
// (/communities/corporate-events). Copy and numbers are taken from the
// COE landing page (app/page.tsx) so the two cannot disagree; if one
// changes, change both (or switch app/page.tsx to import from here).
// ============================================================

export const ROTATING = ['office party.', 'sports day.', 'team lunch.', 'offsite.', 'Diwali night.'];

export const EXAMPLES = [
  '🏏 Box cricket league, 6 teams, Sohna Road',
  '🍻 Friday drinks at Cyber Hub, 22 pax',
  '🪔 Diwali party, 80 people, budget ₹1,500/head',
  '🏸 Badminton doubles tournament, Sec 52',
  '🚌 Day offsite near Sohna, 40 people',
  '🥂 Farewell dinner, Golf Course Road',
  '🏓 Pickleball evening, Sector 62',
];

export const OCCASIONS: { emoji: string; title: string; body: string; tags: string[]; photo: string }[] = [
  { emoji: '🎊', photo: 'office-party', title: 'Office party & Diwali night', body: 'The big one. Venue, food, bar, sound, a stage if there’s an award bit. Usually 60–300 people and one person quietly panicking about it.', tags: ['Banquets & farmhouses', 'Bar packages', 'Stage & sound'] },
  { emoji: '🏏', photo: 'friends-football', title: 'Sports day & leagues', body: 'Box cricket, turf football, badminton, pickleball & padel. Floodlit slots, umpires, gear and jerseys — itemised so you drop what you don’t need.', tags: ['Floodlit turfs', 'Umpires & scoring', 'Jerseys'] },
  { emoji: '🍛', photo: 'friends-dinner', title: 'Team lunch & quarterly offsite meal', body: 'Recurring, unglamorous, and where most of the annual spend actually goes. Buffet or set menu, veg counts that are right the first time.', tags: ['Set menu / buffet', 'Jain & veg counts', 'Near the office'] },
  { emoji: '🥂', photo: 'networking-event', title: 'Client & leadership dinner', body: 'Small headcount, high stakes. A private section, a menu you’ve seen in advance, and a bill that doesn’t surprise finance afterwards.', tags: ['Private dining', 'Plated service', 'Itemised quote'] },
  { emoji: '🚌', photo: 'hiking-group', title: 'Offsite & team outing', body: 'A day out or an overnight — resort, farmhouse or hill drive. Transport, meals and an activity slot, quoted as one line rather than four vendors.', tags: ['Transport included', 'Day or overnight', 'Activities'] },
  { emoji: '🎁', photo: 'women-friends', title: 'Gifting, rewards & team kit', body: 'Diwali hampers, joining kits, jerseys for the league, hoodies for the offsite. Per-head budget in, options back — with what’s inside itemised.', tags: ['Hampers & kits', 'Print & embroidery', 'Bulk pricing'] },
];

export const STEPS = [
  { num: '01', ic: '📝', h: 'Post your team’s requirement', p: '“Team outing, 35 people, Saturday 20th, ₹1,800/head, somewhere near Golf Course Road.” That’s it. Rough is fine — venues ask if they need more.', t: '~2 min' },
  { num: '02', ic: '📡', h: 'Verified venues bid live', p: 'Turfs, clubs, restaurants and caterers in your area see it and submit itemised quotes — competing with each other, not negotiating with you.', t: 'usually within a few hours' },
  { num: '03', ic: '🎯', h: 'Compare, pick, lock', p: 'See menus, ground rentals, umpire charges, DJ, jerseys — line by line. Pick one, and the price is locked. Go tell the group it’s sorted.', t: 'one tap' },
];

export const TRUST = [
  { ic: '🧾', h: 'GSTIN-verified vendors', p: 'Every venue’s tax registration is checked before they can bid. Proper invoices, proper reimbursement.' },
  { ic: '🔍', h: 'Reviewed before they can bid', p: 'Every venue is checked and approved by an admin before a single quote reaches you.' },
  { ic: '📋', h: 'Itemised quotes', p: 'Ground rental, umpires, food, DJ, jerseys — as separate lines. Drop what you don’t want.' },
  { ic: '🔒', h: 'Price lock, no surge', p: 'The bid you accept is the bill you get. No peak-hour premium, no cover-charge surprise, no “sir woh extra tha”.' },
];

export type CalcCategory = 'outing' | 'sports' | 'party' | 'dinner';
export const CALC: Record<CalcCategory, { label: string; emoji: string; bph: number; hint: string; extras: [string, number][]; includes: string }> = {
  outing: { label: 'Team outing', emoji: '🚌', bph: 1800, hint: 'Typical for a Gurgaon day outing: ₹1,500–2,500/head (venue + lunch + one activity).', extras: [['Bus / transport', 350], ['Activity slot (turf, pickleball)', 400], ['Drinks', 500]], includes: 'Usually covers venue or resort day-access, lunch, one activity block. Transport and drinks are the usual add-ons.' },
  sports: { label: 'Sports league', emoji: '🏏', bph: 1900, hint: 'A 120-player box-cricket league in Gurgaon typically lands around ₹2.2–2.4L all-in — roughly ₹1,900/player.', extras: [['Umpires & scoring', 150], ['Custom jerseys', 450], ['Post-match snacks', 300]], includes: 'Usually covers floodlit ground slots for all fixtures, basic gear, drinking water. Umpires, jerseys and food come as separate lines.' },
  party: { label: 'Office party', emoji: '🎉', bph: 2200, hint: 'Cyber Hub / Sector 29 party with food + a couple of drinks: ₹1,800–3,500/head depending on the bar.', extras: [['DJ / music (2 hrs)', 250], ['Unlimited drinks package', 600], ['Décor & photo corner', 150]], includes: 'Usually covers reserved space, buffet or set menu, soft drinks. Bar packages and DJ vary a lot — that’s where bidding helps most.' },
  dinner: { label: 'Team dinner', emoji: '🍽️', bph: 1500, hint: 'Sit-down team dinner on Golf Course Road / Cyber Hub: ₹1,000–2,500/head without a heavy bar.', extras: [['Drinks (2 per head)', 700], ['Private section', 200], ['Cake & a small “thank you”', 80]], includes: 'Usually covers set menu or à la carte cap, service, taxes. Private rooms and drinks are the swing items.' },
};

export const HUBS = ['DLF Cyber City / Cyber Hub', 'Golf Course Road', 'Golf Course Extension Rd', 'Sector 29', 'Sohna Road', 'Noida Sector 62', 'Aerocity'];
