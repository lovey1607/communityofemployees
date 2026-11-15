'use client';
// components/communities/SwipeDeck.tsx — Tinder-style deck over the current
// results. Swipe right = save, left = skip, tap/“Join” = organiser link.
// Framer-motion drag (already a dependency); keyboard ← → ↵ supported.
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useMotionValue, useTransform, useReducedMotion, type PanInfo } from 'framer-motion';
import { Heart, X, ExternalLink, MapPin, Clock, Users, IndianRupee, RotateCcw } from 'lucide-react';
import { CATEGORY_META, formatKm, whereLabel, type Scored } from '@/lib/communities';
import { Mark } from './Mark';
import { priceLabel, audienceLabel, cadenceLabel } from './CommunityCard';

type Props = { items: Scored[]; saved: Set<string>; onSave: (slug: string) => void; onToast: (m: string) => void; onExit: () => void };

export function SwipeDeck({ items, saved, onSave, onToast, onExit }: Props) {
  const [i, setI] = useState(0);
  const [history, setHistory] = useState<number[]>([]);
  const [fling, setFling] = useState<'left' | 'right' | null>(null);
  const reduce = useReducedMotion();
  useEffect(() => { setI(0); setHistory([]); }, [items]);

  const cur = items[i];
  const next = items.slice(i + 1, i + 3);

  const advance = useCallback((dir: 'left' | 'right') => {
    if (!cur) return;
    if (dir === 'right' && !saved.has(cur.slug)) onSave(cur.slug);
    else if (dir === 'right') onToast('Already saved');
    setFling(dir);
    setTimeout(() => { setHistory((h) => [...h, i]); setI((x) => x + 1); setFling(null); }, reduce ? 0 : 220);
  }, [cur, i, onSave, onToast, saved, reduce]);

  const undo = () => { const h = [...history]; const last = h.pop(); if (last == null) return; setHistory(h); setI(last); };

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') advance('right');
      else if (e.key === 'ArrowLeft') advance('left');
      else if (e.key === 'Backspace') undo();
      else if (e.key === 'Enter' && cur) window.open(cur.join.url, '_blank', 'noopener');
    };
    addEventListener('keydown', k); return () => removeEventListener('keydown', k);
  }, [advance, cur]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section className="cop-deck" aria-label="Swipe through communities">
      <div className="cop-deck-top">
        <span className="cnt">{Math.min(i + 1, items.length)} / {items.length}</span>
        <span className="hint">drag or use ← →</span>
      </div>
      <div className="cop-deck-stage">
        {next.map((c, n) => (
          <div key={c.slug} className="cop-deck-card ghost" style={{ transform: `translateY(${(n + 1) * 14}px) scale(${1 - (n + 1) * 0.045})`, zIndex: 2 - n, ['--h' as string]: CATEGORY_META[c.category].hue }} aria-hidden="true">
            <div className="hd" />
          </div>
        ))}
        <AnimatePresence>
          {cur ? <DeckCard key={cur.slug} c={cur} saved={saved.has(cur.slug)} fling={fling} onSwipe={advance} reduce={!!reduce} /> : (
            <div className="cop-deck-card done">
              <div className="body" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
                <h3>That’s everyone here.</h3>
                <p style={{ color: 'var(--ink-2)', margin: '.5rem 0 1.2rem' }}>You went through all {items.length}. Loosen a filter or try another city.</p>
                <div style={{ display: 'flex', gap: '.6rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button type="button" className="cop-btn cop-btn-primary" onClick={() => { setI(0); setHistory([]); }}><RotateCcw size={14} /> Start over</button>
                  <button type="button" className="cop-btn cop-btn-ghost" onClick={onExit}>Back to grid</button>
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
      <div className="cop-deck-actions">
        <button type="button" className="act undo" aria-label="Undo" onClick={undo} disabled={!history.length}><RotateCcw size={18} /></button>
        <button type="button" className="act skip" aria-label="Skip" onClick={() => advance('left')} disabled={!cur}><X size={26} /></button>
        <a className="act join" href={cur?.join.url} target="_blank" rel="noopener noreferrer" aria-label="Open join link" aria-disabled={!cur}><ExternalLink size={20} /></a>
        <button type="button" className="act save" aria-label="Save" onClick={() => advance('right')} disabled={!cur}><Heart size={26} fill="currentColor" /></button>
      </div>
    </section>
  );
}

function DeckCard({ c, saved, fling, onSwipe, reduce }: { c: Scored; saved: boolean; fling: 'left' | 'right' | null; onSwipe: (d: 'left' | 'right') => void; reduce: boolean }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-240, 240], [-14, 14]);
  const likeOp = useTransform(x, [40, 140], [0, 1]);
  const nopeOp = useTransform(x, [-40, -140], [0, 1]);
  const meta = CATEGORY_META[c.category];
  const onEnd = (_: unknown, info: PanInfo) => {
    const dx = info.offset.x, v = info.velocity.x;
    if (dx > 110 || v > 600) onSwipe('right');
    else if (dx < -110 || v < -600) onSwipe('left');
  };
  const exitX = fling === 'right' ? 520 : fling === 'left' ? -520 : 0;
  const facts = useMemo(() => [cadenceLabel(c), audienceLabel(c), priceLabel(c)], [c]);
  return (
    <motion.article className="cop-deck-card" style={{ x, rotate, ['--h' as string]: meta.hue, zIndex: 5 }}
      drag={reduce ? false : 'x'} dragConstraints={{ left: 0, right: 0 }} dragElastic={0.9} onDragEnd={onEnd}
      initial={reduce ? false : { scale: 0.96, y: 10, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }}
      exit={{ x: exitX, opacity: 0, rotate: fling === 'right' ? 18 : fling === 'left' ? -18 : 0, transition: { duration: 0.25 } }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}>
      <motion.span className="stamp like" style={{ opacity: likeOp }}>SAVE</motion.span>
      <motion.span className="stamp nope" style={{ opacity: nopeOp }}>SKIP</motion.span>
      <div className="hd">
        <span className="k">{meta.label} · {whereLabel(c)}</span>
        <Mark c={c} size={64} />
        {c.km != null && <span className="km">{formatKm(c.km)} away</span>}
      </div>
      <div className="body">
        <h3><Link href={`/communities/${c.slug}`}>{c.name}</Link>{saved && <Heart size={16} fill="currentColor" style={{ color: 'var(--accent)', marginLeft: 8, verticalAlign: '-2px' }} />}</h3>
        {c.status === 'unverified' && <span className="unv-inline">Unverified — activity not recently confirmed</span>}
        <p className="tag">{c.tagline}</p>
        <ul className="facts">
          <li><Clock size={14} /> {facts[0]}</li>
          <li><Users size={14} /> {facts[1]}</li>
          <li><IndianRupee size={14} /> {facts[2]}</li>
          <li><MapPin size={14} /> {whereLabel(c)}</li>
        </ul>
        <a className="cop-btn cop-btn-primary" href={c.join.url} target="_blank" rel="noopener noreferrer">{c.join.cta} <ExternalLink size={14} /></a>
        <Link href={`/communities/${c.slug}`} className="more">Full details →</Link>
      </div>
    </motion.article>
  );
}
