'use client';
// components/communities/CommunityCard.tsx — the unit of the product.
import Link from 'next/link';
import { useState } from 'react';
import { Heart, Share2, Clock, Users, IndianRupee, MapPin, ExternalLink } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { CATEGORY_META, PLATFORM_LABEL, formatKm, type Scored, whereLabel } from '@/lib/communities';
import { Mark } from './Mark';
import { CAT_EMOJI } from './emoji';
import { CardPhoto } from './CardPhoto';

export function priceLabel(c: Scored): string {
  switch (c.pricing.type) {
    case 'free': return 'Free';
    case 'paid': return 'Paid';
    case 'membership': return 'Membership';
    case 'pay-per-event': return 'Pay per event';
    default: return 'Ask organiser';
  }
}
export function audienceLabel(c: Scored): string {
  if (c.audience.gender === 'women') return 'Women only';
  if (c.audience.gender === 'men') return 'Men only';
  return c.audience.level === 'beginner' || c.tags.includes('beginner-friendly') ? 'Beginner-friendly' : 'Open to all';
}
export function cadenceLabel(c: Scored): string {
  if (c.meets.summary) return c.meets.summary;
  const m: Record<string, string> = { weekly: 'Weekly', fortnightly: 'Fortnightly', monthly: 'Monthly', irregular: 'Pop-up', unknown: 'See their page' };
  return m[c.meets.cadence];
}

export function CommunityCard({ c, saved, onSave, onToast, index = 0 }: {
  c: Scored; saved: boolean; onSave: (slug: string) => void; onToast: (m: string) => void; index?: number;
}) {
  const reduce = useReducedMotion();
  const [pressed, setPressed] = useState(false);
  const meta = CATEGORY_META[c.category];
  const detail = `/communities/${c.slug}`;

  const share = async () => {
    const url = `${location.origin}${detail}`;
    try {
      if (navigator.share) await navigator.share({ title: c.name, text: c.tagline, url });
      else { await navigator.clipboard.writeText(url); onToast('Link copied'); }
    } catch { /* user cancelled */ }
  };

  return (
    <motion.article
      layout={!reduce}
      initial={reduce ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? undefined : { opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1], delay: Math.min(index, 8) * 0.035 }}
      className="cop-card"
      data-cur={CAT_EMOJI[c.category]}
      style={{ ['--c-ink' as string]: `hsl(${meta.hue} 60% 28%)`, ['--c-soft' as string]: `hsl(${meta.hue} 70% 93%)`, transform: pressed ? 'scale(.985)' : undefined }}
      onPointerDown={() => setPressed(true)} onPointerUp={() => setPressed(false)} onPointerLeave={() => setPressed(false)}
    >
      <div className="cover">
        <CardPhoto c={c} w={560} h={300} />
        <Link href={detail} className="cover-link" tabIndex={-1} aria-hidden="true" />
        <span className="cover-cat">{CAT_EMOJI[c.category]} {meta.label}</span>
        {c.km != null && <span className="cover-km">{formatKm(c.km)}</span>}
      </div>
      {c.status === 'unverified' && <span className="unv" title="We found this community but could not confirm activity in the last ~90 days.">Unverified</span>}
      <div className="head">
        <span className="mark"><Mark c={c} size={48} /></span>
        <div className="ttl">
          <h3><Link href={detail}>{c.name}</Link></h3>
          <div className="sub">
            <span><MapPin size={11} style={{ display: 'inline', verticalAlign: '-1px' }} /> {whereLabel(c)}</span>
            {c.km != null && <span className="dist">· {formatKm(c.km)}</span>}
          </div>
        </div>
      </div>
      <p className="tag">{c.tagline}</p>
      <div className="facts">
        <span><Clock /> {cadenceLabel(c)}</span>
        <span><Users /> {audienceLabel(c)}</span>
        <span><IndianRupee /> {priceLabel(c)}</span>
        {c.size.bucket !== 'unknown' && <span>· {c.size.bucket} people</span>}
      </div>
      <div className="foot">
        <a className="cop-btn cop-btn-accent cop-btn-sm join" href={c.join.url} target="_blank" rel="noopener noreferrer"
          aria-label={`${c.join.cta} — ${c.name} (opens ${PLATFORM_LABEL[c.join.platform]})`}>
          {c.join.cta} <ExternalLink size={13} />
        </a>
        <button type="button" className={`ico${saved ? ' saved' : ''}`} aria-pressed={saved} aria-label={saved ? 'Remove from saved' : 'Save'} onClick={() => onSave(c.slug)}>
          <Heart size={16} fill={saved ? 'currentColor' : 'none'} />
        </button>
        <button type="button" className="ico" aria-label="Share" onClick={share}><Share2 size={16} /></button>
      </div>
    </motion.article>
  );
}
