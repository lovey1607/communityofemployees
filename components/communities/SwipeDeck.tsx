'use client';
// components/communities/SwipeDeck.tsx — a swipeable rail over the current
// results. Desktop shows three cards side by side, tablet two, phone one.
// Drag any card right = save, left = skip; the rest slide over and the next
// one deals in from the right. Keyboard (← → ↵ ⌫) acts on the first card.
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useMotionValue, useTransform, useReducedMotion, type PanInfo } from 'framer-motion';
import { Heart, X, ExternalLink, MapPin, Clock, Users, IndianRupee, RotateCcw } from 'lucide-react';
import { CATEGORY_META, formatKm, whereLabel, type Scored } from '@/lib/communities';
import { Mark } from './Mark';
import { CAT_EMOJI } from './emoji';
import { priceLabel, audienceLabel, cadenceLabel } from './CommunityCard';

type Dir = 'left' | 'right';
type Props = { items: Scored[]; saved: Set<string>; onSave: (slug: string) => void; onToast: (m: string) => void; onExit: () => void };

function useSlots() {
  const [n, setN] = useState(1);
  useEffect(() => {
    const q3 = matchMedia('(min-width: 1000px)'), q2 = matchMedia('(min-width: 640px)');
    const f = () => setN(q3.matches ? 3 : q2.matches ? 2 : 1);
    f(); q3.addEventListener('change', f); q2.addEventListener('change', f);
    return () => { q3.removeEventListener('change', f); q2.removeEventListener('change', f); };
  }, []);
  return n;
}

export function SwipeDeck({ items, saved, onSave, onToast, onExit }: Props) {
  const reduce = !!useReducedMotion();
  const slots = useSlots();
  const [gone, setGone] = useState<string[]>([]);
  const [leaving, setLeaving] = useState<Record<string, Dir>>({});
  const key = useMemo(() => items.map((c) => c.slug).join('|'), [items]);
  useEffect(() => { setGone([]); setLeaving({}); }, [key]);

  const goneSet = useMemo(() => new Set(gone), [gone]);
  const remaining = useMemo(() => items.filter((c) => !goneSet.has(c.slug)), [items, goneSet]);
  const visible = remaining.slice(0, slots);
  const done = items.length - remaining.length;

  const decide = useCallback((slug: string, dir: Dir) => {
    if (goneSet.has(slug) || leaving[slug]) return;
    if (dir === 'right') { if (!saved.has(slug)) onSave(slug); else onToast('Already saved'); }
    setLeaving((l) => ({ ...l, [slug]: dir }));
    setTimeout(() => setGone((g) => [...g, slug]), reduce ? 0 : 16);
  }, [goneSet, leaving, saved, onSave, onToast, reduce]);

  const undo = useCallback(() => {
    setGone((g) => {
      if (!g.length) return g;
      const last = g[g.length - 1];
      setLeaving((l) => { const n = { ...l }; delete n[last]; return n; });
      return g.slice(0, -1);
    });
  }, []);

  const front = visible[0];
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
      if (e.key === 'ArrowRight' && front) decide(front.slug, 'right');
      else if (e.key === 'ArrowLeft' && front) decide(front.slug, 'left');
      else if (e.key === 'Backspace') undo();
      else if (e.key === 'Enter' && front) window.open(front.join.url, '_blank', 'noopener');
    };
    addEventListener('keydown', k); return () => removeEventListener('keydown', k);
  }, [front, decide, undo]);

  return (
    <section className="cop-deck" aria-label="Swipe through communities">
      <div className="cop-deck-top">
        <span className="cnt"><b>{Math.min(done + 1, items.length)}{visible.length > 1 ? `–${done + visible.length}` : ''}</b> of {items.length}</span>
        <div className="bar" aria-hidden="true"><i style={{ width: `${(done / Math.max(1, items.length)) * 100}%` }} /></div>
        <span className="hint">drag a card · ← skip · → save</span>
      </div>
      <div className="cop-deck-rail" style={{ ['--slots' as string]: slots }}>
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((c, i) => (
            <DeckCard key={c.slug} c={c} i={i} saved={saved.has(c.slug)} dir={leaving[c.slug] ?? null} onDecide={decide} reduce={reduce} />
          ))}
        </AnimatePresence>
        {!visible.length && (
          <div className="cop-deck-done">
            <span className="big" aria-hidden="true">🎉</span>
            <h3>That’s everyone here.</h3>
            <p>You went through all {items.length}. Loosen a filter or try another city.</p>
            <div className="row">
              <button type="button" className="cop-btn cop-btn-primary" onClick={() => { setGone([]); setLeaving({}); }}><RotateCcw size={14} /> Start over</button>
              <button type="button" className="cop-btn cop-btn-ghost" onClick={onExit}>Back to grid</button>
            </div>
          </div>
        )}
      </div>
      <div className="cop-deck-actions">
        <button type="button" className="act undo" aria-label="Undo" onClick={undo} disabled={!gone.length}><RotateCcw size={18} /></button>
        <button type="button" className="act skip" aria-label="Skip" onClick={() => front && decide(front.slug, 'left')} disabled={!front}><X size={24} /></button>
        <a className="act join" href={front?.join.url} target="_blank" rel="noopener noreferrer" aria-label="Open join link" aria-disabled={!front}><ExternalLink size={20} /></a>
        <button type="button" className="act save" aria-label="Save" onClick={() => front && decide(front.slug, 'right')} disabled={!front}><Heart size={24} fill="currentColor" /></button>
      </div>
    </section>
  );
}

function DeckCard({ c, i, saved, dir, onDecide, reduce }: { c: Scored; i: number; saved: boolean; dir: Dir | null; onDecide: (s: string, d: Dir) => void; reduce: boolean }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-240, 240], [-12, 12]);
  const likeOp = useTransform(x, [30, 120], [0, 1]);
  const nopeOp = useTransform(x, [-30, -120], [0, 1]);
  const meta = CATEGORY_META[c.category];
  const onEnd = (_: unknown, info: PanInfo) => {
    const dx = info.offset.x, v = info.velocity.x;
    if (dx > 110 || v > 600) onDecide(c.slug, 'right');
    else if (dx < -110 || v < -600) onDecide(c.slug, 'left');
  };
  const facts = [cadenceLabel(c), audienceLabel(c), priceLabel(c)];
  const exitX = dir === 'right' ? 600 : dir === 'left' ? -600 : 0;
  return (
    <motion.article layout={!reduce} className={`cop-deck-card${i === 0 ? ' front' : ''}`} data-cur={CAT_EMOJI[c.category]}
      style={{ x, rotate, ['--h' as string]: meta.hue }}
      drag={reduce ? false : 'x'} dragConstraints={{ left: 0, right: 0 }} dragElastic={0.85} onDragEnd={onEnd} whileDrag={{ scale: 1.03, zIndex: 9 }}
      initial={reduce ? false : { opacity: 0, x: 120, scale: 0.92 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={reduce ? { opacity: 0 } : { x: exitX, y: 40, opacity: 0, rotate: dir === 'right' ? 20 : dir === 'left' ? -20 : 0, transition: { duration: 0.32 } }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
      <motion.span className="stamp like" style={{ opacity: likeOp }}>SAVE ♥</motion.span>
      <motion.span className="stamp nope" style={{ opacity: nopeOp }}>NOPE</motion.span>
      <div className="hd">
        <span className="k">{meta.label}</span>
        <span className="emo" aria-hidden="true">{CAT_EMOJI[c.category]}</span>
        <Mark c={c} size={44} />
        {c.km != null && <span className="km">{formatKm(c.km)}</span>}
      </div>
      <div className="body">
        <h3><Link href={`/communities/${c.slug}`} draggable={false}>{c.name}</Link>{saved && <Heart size={15} fill="currentColor" className="sv" />}</h3>
        <p className="where"><MapPin size={12} /> {whereLabel(c)}{c.status === 'unverified' && <span className="unv-inline"> · unverified</span>}</p>
        <p className="tag">{c.tagline}</p>
        <ul className="facts">
          <li><Clock size={13} /> {facts[0]}</li>
          <li><Users size={13} /> {facts[1]}</li>
          <li><IndianRupee size={13} /> {facts[2]}</li>
        </ul>
        <div className="ft">
          <button type="button" className="mini nope" aria-label={`Skip ${c.name}`} onClick={() => onDecide(c.slug, 'left')}><X size={18} /></button>
          <a className="cop-btn cop-btn-primary" href={c.join.url} target="_blank" rel="noopener noreferrer" draggable={false}>{c.join.cta} <ExternalLink size={13} /></a>
          <button type="button" className="mini like" aria-label={`Save ${c.name}`} onClick={() => onDecide(c.slug, 'right')}><Heart size={18} fill="currentColor" /></button>
        </div>
      </div>
    </motion.article>
  );
}
