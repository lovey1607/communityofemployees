// ============================================================
// lib/parseIntent.ts — turn a sentence into a head start on an RFP.
//
// The hero asks people to finish "We want ___ for our team". Whatever they
// type gets read here and used to pre-fill the requirement form, so the first
// screen already knows roughly what they meant.
//
// This is a HEAD START, not an understanding. It is deliberately a handful of
// regexes rather than anything cleverer, and everything it produces is shown
// back as an editable field the person confirms. A wrong guess costs one
// correction; it never silently posts something nobody typed.
//
// Kept free of any dependency and pure, so it runs in the browser as you type
// and is covered by scripts/parse-intent-test.ts.
// ============================================================

import type { CategoryType } from '@/lib/types';

export interface ParsedIntent {
  /** Best-guess category, or null when nothing matched. */
  category: CategoryType | null;
  /** Headcount, when a number that looks like people is present. */
  headcount: number | null;
  /** ISO date (yyyy-mm-dd) when a specific or relative date was given. */
  date: string | null;
  /** Human phrase we matched the date from, e.g. "this weekend". */
  dateLabel: string | null;
  /** A Gurgaon locality if one is named. */
  locality: string | null;
  /** Per-head budget in rupees, when stated. */
  budgetPerPerson: number | null;
  /** The original text, trimmed. */
  raw: string;
}

// Ordered: the first match wins, so put the specific before the generic.
// "sports day" must beat "day", "team lunch" must beat "team".
// The trailing s? on most of these is load-bearing: people write "hampers",
// "hoodies", "joining kits". Without it the category silently comes back null
// and the form opens on the wrong step.
const CATEGORY_HINTS: [RegExp, CategoryType][] = [
  [/\b(box crickets?|turfs?|footballs?|badminton|pickleball|padel|crickets?|tournaments?|sports days?|matche?s?|leagues?|olympiads?)\b/i, 'sports'],
  [/\b(offsites?|off-sites?|outings?|trips?|resorts?|farmhouses?|getaways?|team ?buildings?|excursions?)\b/i, 'trips'],
  [/\b(hampers?|gifts?|gifting|rewards?|goodies?|goodie bags?|joining kits?|welcome kits?|tokens?|swag)\b/i, 'gifts'],
  [/\b(t-?shirts?|tshirts?|jerseys?|hoodies?|merch|merchandise|apparel|uniforms?|polos?|caps?)\b/i, 'dress'],
  [/\b(lunch(?:es)?|dinners?|part(?:y|ies)|dine|dining|buffets?|catering|caterers?|cocktails?|drinks|brunch(?:es)?|breakfasts?|high tea|sundowners?|banquets?|venues?|restaurants?|snacks?)\b/i, 'food'],
];

// Gurgaon business districts people actually name.
const LOCALITIES = [
  'Cyber Hub', 'Cyber City', 'Golf Course Road', 'Golf Course Extension',
  'Sohna Road', 'Udyog Vihar', 'MG Road', 'Sector 29', 'Sector 44',
  'Sector 48', 'Sector 62', 'Aerocity', 'Dwarka Expressway', 'Manesar',
  'Huda City Centre', 'Sushant Lok', 'DLF Phase 1', 'DLF Phase 2',
  'DLF Phase 3', 'DLF Phase 4', 'Gurgaon', 'Gurugram', 'Noida', 'Delhi',
];

const MONTHS = [
  'jan', 'feb', 'mar', 'apr', 'may', 'jun',
  'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
];

const iso = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Next occurrence of a weekday (0=Sun). Today counts as "next" only if `includeToday`. */
function nextWeekday(from: Date, weekday: number, includeToday = false): Date {
  const d = new Date(from);
  const diff = (weekday - d.getDay() + 7) % 7;
  d.setDate(d.getDate() + (diff === 0 && !includeToday ? 7 : diff));
  return d;
}

function parseDate(text: string, today: Date): { date: string; label: string } | null {
  const t = text.toLowerCase();

  // "this weekend" / "next weekend" → the coming Saturday.
  if (/\bthis weekend\b/.test(t)) {
    return { date: iso(nextWeekday(today, 6, true)), label: 'this weekend' };
  }
  if (/\bnext weekend\b/.test(t)) {
    const sat = nextWeekday(today, 6, true);
    sat.setDate(sat.getDate() + 7);
    return { date: iso(sat), label: 'next weekend' };
  }
  if (/\btomorrow\b/.test(t)) {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    return { date: iso(d), label: 'tomorrow' };
  }

  // "on 20th Sep", "20 September", "Sep 20"
  const dayMonth = t.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/);
  const monthDay = t.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{1,2})(?:st|nd|rd|th)?\b/);
  const hit = dayMonth
    ? { day: Number(dayMonth[1]), month: MONTHS.indexOf(dayMonth[2]) }
    : monthDay
      ? { day: Number(monthDay[2]), month: MONTHS.indexOf(monthDay[1]) }
      : null;
  if (hit && hit.month >= 0 && hit.day >= 1 && hit.day <= 31) {
    // A month already past this year means they mean next year.
    let year = today.getFullYear();
    const candidate = new Date(year, hit.month, hit.day);
    if (candidate.getTime() < today.getTime() - 86_400_000) year += 1;
    const d = new Date(year, hit.month, hit.day);
    if (d.getMonth() !== hit.month) return null; // e.g. 31 Feb
    return { date: iso(d), label: `${hit.day} ${MONTHS[hit.month]}` };
  }

  // Bare weekday: "on Friday", "this Saturday".
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  for (let i = 0; i < days.length; i += 1) {
    if (new RegExp(`\\b${days[i]}\\b`).test(t)) {
      return { date: iso(nextWeekday(today, i, true)), label: days[i] };
    }
  }

  // "next month" — first of it, as a placeholder the person will adjust.
  if (/\bnext month\b/.test(t)) {
    const d = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    return { date: iso(d), label: 'next month' };
  }

  return null;
}

function parseHeadcount(text: string): number | null {
  // Prefer an explicit "for N people / pax / folks / heads / of us".
  const explicit = text.match(/\b(\d{1,5})\s*(?:\+)?\s*(people|pax|folks|heads|guests|employees|attendees|of us|persons?|members)\b/i);
  if (explicit) {
    const n = Number(explicit[1]);
    if (n >= 1 && n <= 100_000) return n;
  }
  // "team of 40", "group of 12"
  const groupOf = text.match(/\b(?:team|group|batch|floor|office)\s+of\s+(\d{1,5})\b/i);
  if (groupOf) {
    const n = Number(groupOf[1]);
    if (n >= 1 && n <= 100_000) return n;
  }
  // A bare number is ambiguous — "20th Sep" is not twenty people. Only accept
  // one when it is not immediately followed by an ordinal or a month.
  const bare = text.match(/\bfor\s+(\d{1,5})\b(?!\s*(?:st|nd|rd|th|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec))/i);
  if (bare) {
    const n = Number(bare[1]);
    if (n >= 2 && n <= 100_000) return n;
  }
  return null;
}

function parseBudget(text: string): number | null {
  // "₹1200 a head", "1200 per person", "under 1500 pp", "2k per head"
  const m = text.match(/(?:₹|rs\.?\s?|inr\s?)?(\d{1,3}(?:,\d{2,3})*|\d+)(k)?\s*(?:\/|per\s+|a\s+|pp\b|each\b)?\s*(?:head|person|pax|plate|pp)\b/i);
  if (!m) return null;
  const base = Number(m[1].replace(/,/g, ''));
  const value = m[2] ? base * 1000 : base;
  return value >= 50 && value <= 1_000_000 ? value : null;
}

export function parseIntent(input: string, now: Date = new Date()): ParsedIntent {
  const raw = input.trim();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let category: CategoryType | null = null;
  for (const [pattern, cat] of CATEGORY_HINTS) {
    if (pattern.test(raw)) {
      category = cat;
      break;
    }
  }

  const when = parseDate(raw, today);
  const locality =
    LOCALITIES.find((l) => new RegExp(`\\b${l.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(raw)) ?? null;

  return {
    category,
    headcount: parseHeadcount(raw),
    date: when?.date ?? null,
    dateLabel: when?.label ?? null,
    locality,
    budgetPerPerson: parseBudget(raw),
    raw,
  };
}

/** How much of the requirement we managed to read — drives the hero's hint. */
export function intentConfidence(parsed: ParsedIntent): number {
  return [parsed.category, parsed.headcount, parsed.date, parsed.locality, parsed.budgetPerPerson]
    .filter(Boolean).length;
}
