'use client';
// ============================================================
// components/rfp/QuickRfp.tsx — posting a requirement, one question at a time.
//
// The old modal put every field for a category on one screen: six groups of
// chips, two date pickers and two number inputs, all visible at once. It is
// the same information, and it reads as a procurement form, which is exactly
// what the person handed this job does not want to be filling in.
//
// What changed:
//
//  · ONE question per screen, asked in plain language. The screen is mostly
//    empty. There is no visible sense of "how much is left" beyond a thin
//    progress bar, because a long form's real cost is seeing how long it is.
//
//  · Numbers are sliders with sensible presets either side. Nobody knows what
//    "budget per person" should be, so the slider carries live context — the
//    total updates under your thumb, and the headcount slider names the shape
//    of the group (a pod, a floor, the whole office).
//
//  · Everything after the first four questions is optional and says so. The
//    only required answers are category, headcount, date and budget — the four
//    things a vendor genuinely cannot quote without.
//
//  · The hero's sentence pre-fills whatever it could read, so someone arriving
//    from "dinner on 20th Sep for 30 folks at Cyber Hub" starts on the review
//    screen with four answers already in place and confirms rather than types.
//
// The payload is unchanged, so the API, the tests and the vendor feed all keep
// working exactly as before.
// ============================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Loader2, X } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { CATEGORY_LABELS, THEMES } from '@/lib/themes';
import type { CategoryType, UniversalFields } from '@/lib/types';
import { parseIntent } from '@/lib/parseIntent';

// ─── The five things people post ─────────────────────────────
const CATEGORIES: { id: CategoryType; icon: string; title: string; blurb: string }[] = [
  { id: 'food', icon: '🥂', title: 'Food & party', blurb: 'Lunch, dinner, Diwali night, a bar tab' },
  { id: 'sports', icon: '🏏', title: 'Sports', blurb: 'Turf, box cricket, badminton, a league' },
  { id: 'trips', icon: '🚌', title: 'Offsite & outing', blurb: 'A day out, a resort, an overnight' },
  { id: 'gifts', icon: '🎁', title: 'Gifting', blurb: 'Hampers, joining kits, rewards' },
  { id: 'dress', icon: '👕', title: 'Merch', blurb: 'Jerseys, hoodies, team kit' },
];

// Headcount presets, named the way people describe a group rather than by number.
const HEAD_MARKS: { n: number; label: string }[] = [
  { n: 8, label: 'the pod' },
  { n: 25, label: 'the team' },
  { n: 50, label: 'the floor' },
  { n: 120, label: 'the office' },
  { n: 300, label: 'everyone' },
];

// Realistic Gurgaon per-head bands, so the slider starts somewhere sane
// instead of at zero. Sourced from the same figures as the cost calculator.
const BUDGET_BAND: Record<CategoryType, { min: number; max: number; start: number; unit: string }> = {
  food: { min: 300, max: 6000, start: 1400, unit: 'per person' },
  sports: { min: 200, max: 3000, start: 700, unit: 'per person' },
  trips: { min: 1000, max: 20000, start: 4500, unit: 'per person' },
  gifts: { min: 200, max: 10000, start: 1200, unit: 'per gift' },
  dress: { min: 200, max: 3000, start: 700, unit: 'per piece' },
};

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function relativeDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return iso(d);
}

function nextSaturday(): string {
  const d = new Date();
  d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7));
  return iso(d);
}

const TIME_SLOTS = [
  { v: 'Morning (08:00 AM – 12:00 PM)', label: 'Morning' },
  { v: 'Afternoon & lunch (12:00 PM – 04:00 PM)', label: 'Afternoon' },
  { v: 'Evening (04:00 PM – 08:00 PM)', label: 'Evening' },
  { v: 'Night (07:00 PM – Midnight)', label: 'Night' },
  { v: 'Full day (09:00 AM – 06:00 PM)', label: 'Full day' },
];

type StepId = 'category' | 'people' | 'date' | 'budget' | 'extras' | 'review';

export function QuickRfp() {
  const { modalOpen, closeModal, activeCategory, submitRFP, currentUser, currentCorporateProfile } =
    useStore();

  const [step, setStep] = useState<StepId>('category');
  const [dir, setDir] = useState(1);
  const [category, setCategory] = useState<CategoryType>('food');
  const [persons, setPersons] = useState(25);
  const [date, setDate] = useState(relativeDate(14));
  const [endDate, setEndDate] = useState('');
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[3].v);
  const [budget, setBudget] = useState(BUDGET_BAND.food.start);
  const [notes, setNotes] = useState('');
  const [locality, setLocality] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const seeded = useRef(false);

  const theme = THEMES[category];
  const band = BUDGET_BAND[category];
  const total = persons * budget;

  // ── Seed from the hero sentence ───────────────────────────
  //
  // Whatever the person wrote on the landing page is read once, on open. Every
  // value it produces is a field they can still change; the only thing it
  // decides is which question we start on.
  useEffect(() => {
    if (!modalOpen || seeded.current) return;
    seeded.current = true;

    let raw = '';
    try {
      raw =
        new URLSearchParams(window.location.search).get('intent') ??
        sessionStorage.getItem('coe.intent') ??
        '';
      sessionStorage.removeItem('coe.intent');
    } catch {
      /* private mode — just start from the top */
    }

    // NOTE: activeCategory is not evidence the person chose anything —
    // store.openModal() falls back to 'food' when called with no argument, so
    // it is always set. Skipping the category step on that basis silently
    // started a merch request as a food one. The question is one tap; ask it
    // unless the sentence genuinely answered it.
    if (activeCategory) {
      setCategory(activeCategory);
      setBudget(BUDGET_BAND[activeCategory].start);
    }
    if (!raw.trim()) {
      setStep('category');
      return;
    }

    const p = parseIntent(raw);
    if (p.category) setCategory(p.category);
    if (p.headcount) setPersons(p.headcount);
    if (p.date) setDate(p.date);
    if (p.locality) setLocality(p.locality);
    if (p.budgetPerPerson) setBudget(p.budgetPerPerson);
    else if (p.category) setBudget(BUDGET_BAND[p.category].start);
    setNotes(raw.trim());

    // Start on the first question the sentence did not answer. If it answered
    // everything, go straight to review — they described it, we shouldn't make
    // them describe it again.
    if (!p.category) setStep('category');
    else if (!p.headcount) setStep('people');
    else if (!p.date) setStep('date');
    else setStep('review');
  }, [modalOpen, activeCategory]);

  // Reset when the modal closes so the next post starts clean.
  useEffect(() => {
    if (modalOpen) return;
    seeded.current = false;
    setDone(false);
    setError('');
    setStep('category');
  }, [modalOpen]);

  const isApproved = currentUser?.role === 'corporate' && currentCorporateProfile?.status === 'approved';

  const ORDER: StepId[] = ['category', 'people', 'date', 'budget', 'extras', 'review'];
  const index = ORDER.indexOf(step);

  const go = useCallback((to: StepId, direction: number) => {
    setDir(direction);
    setStep(to);
  }, []);

  const next = useCallback(() => {
    const i = ORDER.indexOf(step);
    if (i < ORDER.length - 1) go(ORDER[i + 1], 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, go]);

  const back = useCallback(() => {
    const i = ORDER.indexOf(step);
    if (i > 0) go(ORDER[i - 1], -1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, go]);

  // Escape closes, Enter advances — a form you can finish without the mouse.
  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'Enter' && step !== 'review' && !(e.target as HTMLElement)?.closest('textarea')) {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modalOpen, step, next, closeModal]);

  const submit = async () => {
    if (sending) return;
    setError('');
    setSending(true);

    const universal: UniversalFields = {
      startDate: date,
      endDate: endDate || date,
      timeSlot,
      timeFlexibility: '',
      urgency: '',
      persons,
      budgetPerPerson: budget,
      notes: notes.trim(),
    };
    const details: Record<string, unknown> = {};
    if (locality.trim()) details.preferredArea = locality.trim();

    const result = await submitRFP({
      category,
      // The API takes a free-form record here; the typed CategoryDetails
      // shapes belong to the old per-category form and are not required.
      categoryDetails: details,
      universal,
      serviceArea: locality.trim() || undefined,
    });
    setSending(false);
    if (result.success) setDone(true);
    else setError(result.message);
  };

  if (!modalOpen) return null;

  const slide = {
    enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <div className="qr-overlay" onClick={closeModal}>
      <motion.div
        className="qr-sheet"
        initial={{ y: 24, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Post a requirement"
      >
        {/* Progress is a hairline, not a "step 3 of 6" counter. The count is
            the thing that makes a form feel long. */}
        <div className="qr-progress" aria-hidden="true">
          <div
            className="qr-progress-fill"
            style={{
              width: done ? '100%' : `${((index + 1) / ORDER.length) * 100}%`,
              background: theme.primary,
            }}
          />
        </div>

        <button type="button" className="qr-close" onClick={closeModal} aria-label="Close">
          <X size={18} />
        </button>

        {done ? (
          <Done category={category} persons={persons} total={total} onClose={closeModal} />
        ) : (
          <>
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={step}
                custom={dir}
                variants={slide}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                className="qr-step"
              >
                {step === 'category' && (
                  <Question title="What does your team need?" sub="Pick one — you can add the details after.">
                    <div className="qr-cards">
                      {CATEGORIES.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          className={`qr-card${category === c.id ? ' on' : ''}`}
                          style={category === c.id ? { borderColor: THEMES[c.id].primary } : undefined}
                          onClick={() => {
                            setCategory(c.id);
                            setBudget(BUDGET_BAND[c.id].start);
                            setTimeout(() => go('people', 1), 120);
                          }}
                        >
                          <span className="qr-card-ic">{c.icon}</span>
                          <span className="qr-card-t">{c.title}</span>
                          <span className="qr-card-b">{c.blurb}</span>
                        </button>
                      ))}
                    </div>
                  </Question>
                )}

                {step === 'people' && (
                  <Question title="How many people?" sub="A rough number is fine — you can change it later.">
                    <div className="qr-big">{persons}</div>
                    <div className="qr-big-sub">
                      {HEAD_MARKS.reduce((best, m) => (Math.abs(m.n - persons) < Math.abs(best.n - persons) ? m : best))
                        .label}
                    </div>
                    <input
                      className="qr-slider"
                      type="range"
                      min={2}
                      max={500}
                      step={1}
                      value={persons}
                      onChange={(e) => setPersons(Number(e.target.value))}
                      style={{ accentColor: theme.primary }}
                      aria-label="Number of people"
                    />
                    <div className="qr-marks">
                      {HEAD_MARKS.map((m) => (
                        <button key={m.n} type="button" className="qr-mark" onClick={() => setPersons(m.n)}>
                          {m.n}
                        </button>
                      ))}
                    </div>
                  </Question>
                )}

                {step === 'date' && (
                  <Question title="When?" sub="Pick a date, or one of these.">
                    <div className="qr-quick">
                      {[
                        { label: 'This weekend', v: nextSaturday() },
                        { label: 'In two weeks', v: relativeDate(14) },
                        { label: 'Next month', v: relativeDate(30) },
                      ].map((q) => (
                        <button
                          key={q.label}
                          type="button"
                          className={`qr-pill${date === q.v ? ' on' : ''}`}
                          style={date === q.v ? { borderColor: theme.primary, color: theme.primary } : undefined}
                          onClick={() => setDate(q.v)}
                        >
                          {q.label}
                        </button>
                      ))}
                    </div>
                    <input
                      className="qr-date"
                      type="date"
                      value={date}
                      min={iso(new Date())}
                      onChange={(e) => setDate(e.target.value)}
                      aria-label="Event date"
                    />
                    <div className="qr-quick qr-quick-sm">
                      {TIME_SLOTS.map((t) => (
                        <button
                          key={t.v}
                          type="button"
                          className={`qr-pill sm${timeSlot === t.v ? ' on' : ''}`}
                          style={timeSlot === t.v ? { borderColor: theme.primary, color: theme.primary } : undefined}
                          onClick={() => setTimeSlot(t.v)}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </Question>
                )}

                {step === 'budget' && (
                  <Question
                    title="Roughly what per head?"
                    sub="A ballpark. Vendors quote against it — they don't just take it."
                  >
                    <div className="qr-big">₹{budget.toLocaleString('en-IN')}</div>
                    <div className="qr-big-sub">{band.unit}</div>
                    <input
                      className="qr-slider"
                      type="range"
                      min={band.min}
                      max={band.max}
                      step={50}
                      value={budget}
                      onChange={(e) => setBudget(Number(e.target.value))}
                      style={{ accentColor: theme.primary }}
                      aria-label="Budget per person"
                    />
                    {/* The number that actually matters is the total, and it is
                        the one nobody works out in their head until later. */}
                    <div className="qr-total">
                      <span>{persons} × ₹{budget.toLocaleString('en-IN')}</span>
                      <strong style={{ color: theme.primary }}>₹{total.toLocaleString('en-IN')}</strong>
                    </div>
                  </Question>
                )}

                {step === 'extras' && (
                  <Question title="Anything specific?" sub="All optional. Skip it and vendors will ask.">
                    <input
                      className="qr-text"
                      placeholder="Area — Cyber Hub, Sohna Road…"
                      value={locality}
                      onChange={(e) => setLocality(e.target.value)}
                      aria-label="Preferred area"
                    />
                    <textarea
                      className="qr-text qr-area"
                      rows={4}
                      placeholder="Veg count, a stage, projector, cake, anything that matters…"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      aria-label="Notes"
                    />
                  </Question>
                )}

                {step === 'review' && (
                  <Question title="That's it — look right?" sub="Change anything by tapping it.">
                    <div className="qr-review">
                      <Row label="What" value={CATEGORY_LABELS[category]} onEdit={() => go('category', -1)} />
                      <Row label="People" value={`${persons}`} onEdit={() => go('people', -1)} />
                      <Row
                        label="When"
                        value={new Date(date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                        onEdit={() => go('date', -1)}
                      />
                      <Row
                        label="Budget"
                        value={`₹${budget.toLocaleString('en-IN')} ${band.unit} · ₹${total.toLocaleString('en-IN')} total`}
                        onEdit={() => go('budget', -1)}
                      />
                      {locality && <Row label="Area" value={locality} onEdit={() => go('extras', -1)} />}
                    </div>
                    {!isApproved && (
                      <p className="qr-note">
                        {currentUser
                          ? 'Your account is still being reviewed — you can post once it is approved.'
                          : 'Sign in as a corporate account to post this.'}
                      </p>
                    )}
                    {error && <p className="qr-error">{error}</p>}
                  </Question>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="qr-foot">
              {index > 0 ? (
                <button type="button" className="qr-back" onClick={back}>
                  <ArrowLeft size={16} /> Back
                </button>
              ) : (
                <span />
              )}

              {step === 'review' ? (
                <button
                  type="button"
                  className="qr-next"
                  style={{ background: theme.primary }}
                  onClick={submit}
                  disabled={sending || !isApproved}
                >
                  {sending ? <Loader2 size={16} className="spin" /> : <Check size={16} />}
                  {sending ? 'Posting…' : 'Post it'}
                </button>
              ) : (
                <button
                  type="button"
                  className="qr-next"
                  style={{ background: theme.primary }}
                  onClick={next}
                >
                  {step === 'extras' ? 'Review' : 'Next'} <ArrowRight size={16} />
                </button>
              )}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

// ─── Small pieces ────────────────────────────────────────────

function Question({
  title,
  sub,
  children,
}: {
  title: string;
  sub?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="qr-q">
      <h2 className="qr-title">{title}</h2>
      {sub && <p className="qr-sub">{sub}</p>}
      <div className="qr-body">{children}</div>
    </div>
  );
}

function Row({ label, value, onEdit }: { label: string; value: string; onEdit: () => void }) {
  return (
    <button type="button" className="qr-row" onClick={onEdit}>
      <span className="qr-row-l">{label}</span>
      <span className="qr-row-v">{value}</span>
      <span className="qr-row-e">Edit</span>
    </button>
  );
}

function Done({
  category,
  persons,
  total,
  onClose,
}: {
  category: CategoryType;
  persons: number;
  total: number;
  onClose: () => void;
}) {
  return (
    <motion.div
      className="qr-done"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="qr-done-tick" style={{ background: THEMES[category].primary }}>
        <Check size={28} strokeWidth={3} />
      </div>
      <h2 className="qr-title">It&rsquo;s live.</h2>
      <p className="qr-sub">
        Verified {CATEGORY_LABELS[category].toLowerCase()} vendors who cover your area can see it now —
        {' '}{persons} people, ₹{total.toLocaleString('en-IN')} budget. Quotes come back to your dashboard.
      </p>
      <button type="button" className="qr-next" style={{ background: THEMES[category].primary }} onClick={onClose}>
        See it on my dashboard <ArrowRight size={16} />
      </button>
    </motion.div>
  );
}
