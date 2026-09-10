'use client';
// ============================================================
// components/landing/IntentHero.tsx
//
// The hero is one sentence with a hole in it:
//
//     We want ______________________ for our team
//
// The blank types itself through real requirements, deletes, and types the
// next. The moment someone clicks or types, the animation stops for good and
// the blank becomes theirs — no fighting a cursor that keeps moving.
//
// Two things make this more than decoration:
//
//  1. The examples are the real range of what gets posted, so the hero
//     teaches the format instead of describing it. Someone who has never seen
//     the product knows what to write by the time the second example finishes.
//
//  2. What they type is parsed as they type it (lib/parseIntent.ts) and the
//     chips underneath fill in — category, headcount, date, place. By the time
//     they press the button, the requirement form already knows most of it, so
//     the first screen is a confirmation rather than an interrogation.
//
// The parse is a head start, never a decision: everything it reads is shown
// back as an editable field, and a blank sentence just opens the normal flow.
// ============================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { intentConfidence, parseIntent } from '@/lib/parseIntent';
import { CATEGORY_LABELS } from '@/lib/themes';

/** What the blank types through. Real requirements, in the words people use. */
const EXAMPLES = [
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

const TYPE_MS = 45;
const DELETE_MS = 22;
const HOLD_MS = 1500;

export function IntentHero({ onStart }: { onStart: (text: string) => void }) {
  const [typed, setTyped] = useState('');
  const [value, setValue] = useState('');
  const [owned, setOwned] = useState(false); // the person has taken over
  const inputRef = useRef<HTMLInputElement>(null);

  // ── The typewriter ────────────────────────────────────────
  //
  // One timeout chain rather than an interval, so each phase can have its own
  // speed and a pause at the end of a sentence. Stops permanently once owned.
  useEffect(() => {
    if (owned) return;
    if (typeof window === 'undefined') return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setTyped(EXAMPLES[0]);
      return;
    }

    let index = 0;
    let charCount = 0;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      const phrase = EXAMPLES[index];
      if (!deleting) {
        charCount += 1;
        setTyped(phrase.slice(0, charCount));
        if (charCount === phrase.length) {
          deleting = true;
          timer = setTimeout(tick, HOLD_MS);
          return;
        }
        timer = setTimeout(tick, TYPE_MS);
      } else {
        charCount -= 1;
        setTyped(phrase.slice(0, charCount));
        if (charCount === 0) {
          deleting = false;
          index = (index + 1) % EXAMPLES.length;
        }
        timer = setTimeout(tick, DELETE_MS);
      }
    };

    timer = setTimeout(tick, 700);
    return () => clearTimeout(timer);
  }, [owned]);

  const takeOver = useCallback(() => {
    if (owned) return;
    setOwned(true);
    setTyped('');
    // Focus after the state flush so the caret lands in the real input.
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [owned]);

  const parsed = useMemo(() => parseIntent(value), [value]);
  const confidence = intentConfidence(parsed);

  const submit = () => {
    const text = value.trim();
    if (!text) {
      takeOver();
      return;
    }
    onStart(text);
  };

  // The chips that fill in as you type — proof the sentence is being read.
  const chips = [
    parsed.category ? { k: 'cat', label: CATEGORY_LABELS[parsed.category] } : null,
    parsed.headcount ? { k: 'head', label: `${parsed.headcount} people` } : null,
    parsed.dateLabel ? { k: 'date', label: parsed.dateLabel } : null,
    parsed.locality ? { k: 'loc', label: parsed.locality } : null,
    parsed.budgetPerPerson
      ? { k: 'bud', label: `₹${parsed.budgetPerPerson.toLocaleString('en-IN')}/head` }
      : null,
  ].filter(Boolean) as { k: string; label: string }[];

  // A long sentence in a fixed-width input scrolls, so the start of what you
  // typed disappears — you lose sight of your own requirement mid-thought.
  // Step the type size down instead, and let the slot grow.
  const len = (owned ? value : typed).length;
  const size = len > 46 ? 'xs' : len > 34 ? 'sm' : len > 24 ? 'md' : 'lg';
  // An input cannot wrap, so a fixed width just scrolls the start of the
  // sentence out of sight. Size it to its own content and let the flex line
  // wrap the slot onto its own row instead — the text stays whole.
  const slotCh = Math.min(Math.max(len + 2, 14), 54);

  return (
    <div className={`intent intent-${size}`}>
      <div className="intent-line">
        <span className="intent-fixed">We want</span>

        <span className="intent-slot" onClick={takeOver} style={{ width: `${slotCh}ch` }}>
          {owned ? (
            <input
              ref={inputRef}
              className="intent-input"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  submit();
                }
              }}
              placeholder="dinner for 30 on Friday…"
              aria-label="What does your team need?"
              autoComplete="off"
              spellCheck={false}
            />
          ) : (
            <button
              type="button"
              className="intent-ghost"
              onClick={takeOver}
              onFocus={takeOver}
              aria-label="Type what your team needs"
            >
              <span className="intent-typed">{typed}</span>
              <span className="intent-caret" aria-hidden="true" />
            </button>
          )}
          <span className="intent-rule" aria-hidden="true" />
        </span>

        <span className="intent-fixed">for our team</span>
      </div>

      <div className={`intent-chips${chips.length ? ' on' : ''}`} aria-live="polite">
        {chips.map((c) => (
          <span className="intent-chip" key={c.k}>
            {c.label}
          </span>
        ))}
        {owned && value.trim().length > 2 && chips.length === 0 && (
          <span className="intent-chip muted">We&rsquo;ll ask the details on the next screen</span>
        )}
      </div>

      <div className="intent-actions">
        <button type="button" className="btn btn-saffron intent-go" onClick={submit}>
          {owned && value.trim() ? 'Continue' : 'Post what you need'} <span className="arr">→</span>
        </button>
        <span className="intent-hint">
          {confidence >= 3
            ? 'Got it — two more taps and it’s live.'
            : 'Takes about a minute. No signup to look around.'}
        </span>
      </div>
    </div>
  );
}
