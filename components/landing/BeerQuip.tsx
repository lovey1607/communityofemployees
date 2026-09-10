'use client';
// ============================================================
// components/landing/BeerQuip.tsx
//
// वीर (veer, brave) → बीयर (beer). One letter, and the compliment becomes the
// reason everyone actually turns up.
//
// The previous version swapped the word and stopped. This one earns its place:
// the glass fills as the word flips, a punchline lands underneath, and it is
// clickable — tap it and you get the next line. Fifteen of them, so the person
// who pokes it four times is rewarded rather than shown the same joke again.
//
// Deliberately small and off to one side. It is the bit of the page that
// sounds like a person rather than a company, and that only works if it
// doesn't try to be the headline.
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react';

// The punchline under the pun. Each is something an actual Gurgaon office
// organiser has thought at 6pm on a Friday.
const LINES = [
  'Either way, someone’s booking the venue.',
  'Bravery is asking finance for the budget.',
  'The real hero raised the PO.',
  'Somebody said “main dekh leta hoon”. That somebody was you.',
  'Warrior energy, Friday deadline.',
  'You didn’t volunteer. You were volunteered.',
  'Two hundred people, one WhatsApp group, zero help.',
  '“Bas venue final kar do” — the six most expensive words.',
  'Legend behaviour: booking it before the group chat argues.',
  'You’re not the party. You’re the reason there is one.',
  'Courage is confirming headcount on a Thursday.',
  'Hero of the offsite, unpaid, uncredited, unbothered.',
  'Someone has to call the caterer. It’s always you.',
  'Brave enough to pick the restaurant for forty people.',
  'The office ka MVP doesn’t get a trophy. Gets a spreadsheet.',
];

export function BeerQuip() {
  const [flipped, setFlipped] = useState(false);
  const [line, setLine] = useState(0);
  const [reduced, setReduced] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setReduced(Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches));
  }, []);

  // Flip on a loop, and advance the punchline on the way back — so the line
  // changes with the word rather than at some unrelated moment.
  useEffect(() => {
    if (reduced) return;
    const loop = () => {
      const a = setTimeout(() => setFlipped(true), 2600);
      const b = setTimeout(() => {
        setFlipped(false);
        setLine((n) => (n + 1) % LINES.length);
      }, 6200);
      timers.current.push(a, b);
    };
    loop();
    const interval = setInterval(loop, 7200);
    return () => {
      clearInterval(interval);
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [reduced]);

  const poke = useCallback(() => {
    setFlipped((f) => !f);
    setLine((n) => (n + 1) % LINES.length);
  }, []);

  return (
    <button
      type="button"
      className={`quip2${flipped ? ' flipped' : ''}`}
      onClick={poke}
      aria-label="Tu veer hai. Tu beer hai. Tap for another line."
      title="Tap me"
    >
      <span className="quip2-line" aria-hidden="true">
        <span className="quip2-tu">Tu</span>

        <span className="quip2-word">
          <b className="veer">वीर</b>
          <b className="beer">बीयर</b>
          {/* The glass fills as the word flips — the joke, drawn. */}
          <svg className="quip2-glass" viewBox="0 0 24 32" aria-hidden="true">
            <defs>
              <clipPath id="quip-glass-clip">
                <path d="M4 3 h14 l-1.6 25 a2 2 0 0 1 -2 1.8 h-6.8 a2 2 0 0 1 -2 -1.8 z" />
              </clipPath>
            </defs>
            <rect className="quip2-fill" x="0" y="0" width="24" height="32" clipPath="url(#quip-glass-clip)" />
            <path
              className="quip2-outline"
              d="M4 3 h14 l-1.6 25 a2 2 0 0 1 -2 1.8 h-6.8 a2 2 0 0 1 -2 -1.8 z"
              fill="none"
            />
            <path className="quip2-handle" d="M18 9 h2.5 a2 2 0 0 1 2 2 v5 a2 2 0 0 1 -2 2 h-2.2" fill="none" />
            <g className="quip2-fizz">
              <circle cx="9" cy="8" r="1.1" />
              <circle cx="13" cy="6" r="0.8" />
              <circle cx="15" cy="9.5" r="0.6" />
            </g>
          </svg>
        </span>

        <span className="quip2-tu">hai</span>
      </span>

      <span className="quip2-note">{LINES[line]}</span>
    </button>
  );
}
