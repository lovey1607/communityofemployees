'use client';
// components/communities/HeroStack.tsx — the hero visual: three photo
// cards fanned like a hand of cards, re-dealt whenever the vibe changes,
// with glass chips floating over them. Photos are credited Unsplash
// representative images (see data/category-photos.ts).
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { CommunityCategory } from '@/lib/communities';
import { CATEGORY_PHOTOS, TOPIC_PHOTOS, photoSrc } from '@/data/category-photos';
import { CAT_EMOJI } from './emoji';

const ROT = [-10, 2, 12];
const POS = [{ x: -86, y: 18 }, { x: 0, y: -10 }, { x: 92, y: 26 }];

export function HeroStack({ category, label, count, verified }: { category: CommunityCategory | 'all'; label: string; count: number; verified: number }) {
  const reduce = useReducedMotion();
  const photos = category === 'all'
    ? [TOPIC_PHOTOS.social[1], TOPIC_PHOTOS.run[0], TOPIC_PHOTOS.sports[0]]
    : [...CATEGORY_PHOTOS[category], ...CATEGORY_PHOTOS[category]].slice(0, 3);
  return (
    <div className="hstack" aria-hidden="true">
      <div className="hstack-glow" />
      <AnimatePresence mode="popLayout" initial={false}>
        {photos.map((p, i) => (
          <motion.figure key={`${category}-${i}`} className={`hcard h${i}`}
            initial={reduce ? false : { opacity: 0, x: 0, y: 80, rotate: 0, scale: 0.8 }}
            animate={{ opacity: 1, x: POS[i].x, y: POS[i].y, rotate: ROT[i], scale: i === 1 ? 1.04 : 0.94 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -60, rotate: ROT[i] * 2, scale: 0.85, transition: { duration: 0.25 } }}
            transition={{ type: 'spring', stiffness: 220, damping: 22, delay: reduce ? 0 : i * 0.07 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photoSrc(p, 420, 520)} alt="" draggable={false} />
          </motion.figure>
        ))}
      </AnimatePresence>
      <motion.div key={`c1-${category}`} className="hchip c1" initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <span className="e">{CAT_EMOJI[category]}</span><b>{count}</b> {label}
      </motion.div>
      <motion.div className="hchip c2" initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
        <span className="dot" /> {verified} checked this month
      </motion.div>
      <div className="hchip c3"><span className="e">↗</span> one tap to join</div>
      <span className="hcredit">Representative photos · Unsplash</span>
    </div>
  );
}
