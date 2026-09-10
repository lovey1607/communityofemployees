'use client';
// ============================================================
// components/landing/BeerQuip.tsx
//
// वीर (veer, brave) → बीयर (beer). One letter, and the compliment becomes the
// reason everyone actually turns up.
//
// The first version drew a small mug next to the word and hoped you'd notice.
// Nobody did — it read as a blank icon at the bottom-left of the hero. So the
// glass is gone and the WORD is the glass: amber rises through the letterforms
// with a foam line riding on top, and वीर becomes बीयर as the level passes it.
// The pun is drawn rather than described, at a size you can see from the door.
//
// It pours itself once on arrival, then idles. Tapping pours again and turns
// the punchline over, so the person who pokes it four times gets four jokes.
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

const POUR_MS = 900; // how long the amber takes to reach the top
const FULL_MS = 4200; // how long it stays full before draining
const CYCLE_MS = 7600;

export function BeerQuip() {
  const [poured, setPoured] = useState(false);
  const [line, setLine] = useState(0);
  const [reduced, setReduced] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const r = Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
    setReduced(r);
    // Reduced motion still gets the joke — it just arrives already poured.
    if (r) setPoured(true);
  }, []);

  // Pour on arrival, then on a slow loop. The punchline turns over as the
  // glass drains, so the line changes with the word rather than at some
  // unrelated moment.
  useEffect(() => {
    if (reduced) return;
    const pour = () => {
      const a = setTimeout(() => setPoured(true), 400);
      const b = setTimeout(() => {
        setPoured(false);
        setLine((n) => (n + 1) % LINES.length);
      }, 400 + POUR_MS + FULL_MS);
      timers.current.push(a, b);
    };
    pour();
    const interval = setInterval(pour, CYCLE_MS);
    return () => {
      clearInterval(interval);
      clearTimers();
    };
  }, [reduced]);

  // A tap always gives you something: a fresh pour and a fresh line.
  const poke = useCallback(() => {
    clearTimers();
    setPoured(false);
    setLine((n) => (n + 1) % LINES.length);
    const t = setTimeout(() => setPoured(true), 90);
    timers.current.push(t);
  }, []);

  // The word twice, stacked: once as the empty glass, once as the beer inside
  // it. The second copy is clipped to the level, so the amber climbs through
  // the letters instead of sitting behind them.
  const word = (
    <>
      <b className="veer">वीर</b>
      <b className="beer">बीयर</b>
    </>
  );

  return (
    <button
      type="button"
      className={`pour${poured ? ' on' : ''}`}
      onClick={poke}
      aria-label="Tu veer hai. Tu beer hai. Tap for another line."
      title="Tap me"
    >
      <span className="pour-line" aria-hidden="true">
        <span className="pour-tu">Tu</span>

        <span className="pour-word">
          <span className="pour-empty">{word}</span>
          <span className="pour-fill">{word}</span>
          <span className="pour-foam" />
          <span className="pour-fizz">
            <i style={{ left: '14%', animationDelay: '.15s' }} />
            <i style={{ left: '38%', animationDelay: '.55s' }} />
            <i style={{ left: '58%', animationDelay: '.3s' }} />
            <i style={{ left: '78%', animationDelay: '.75s' }} />
          </span>
        </span>

        <span className="pour-tu">hai</span>
      </span>

      <span className="pour-note">{LINES[line]}</span>
      <span className="pour-tap" aria-hidden="true">
        tap for another
      </span>
    </button>
  );
}
