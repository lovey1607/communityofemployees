'use client';
// ============================================================
// components/communities/CorporateEvents.tsx — /communities/corporate-events
// The Community of Employees (COE) offer, moved onto the Community of
// People site: post a team event once, verified venues bid, you pick.
// Every CTA goes into the real COE flow (auth modal → corporate dashboard
// with the intent pre-filled), exactly like the COE landing page.
// ============================================================
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { ROTATING, EXAMPLES, OCCASIONS, STEPS, TRUST, CALC, HUBS, type CalcCategory } from '@/data/coe-events';
import { TOPIC_PHOTOS, photoSrc, photoPage, type Photo } from '@/data/category-photos';

const inr = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');
const money = (n: number) => (n >= 100000 ? '₹' + (n / 100000).toFixed(2).replace(/\.?0+$/, '') + ' L' : inr(n));
const PHOTO: Record<string, Photo> = {
  'office-party': TOPIC_PHOTOS.party[0], 'friends-football': TOPIC_PHOTOS.sports[1], 'friends-dinner': TOPIC_PHOTOS.food[0],
  'networking-event': TOPIC_PHOTOS.network[0], 'hiking-group': TOPIC_PHOTOS.hike[0], 'women-friends': TOPIC_PHOTOS.social[1],
};

export function CorporateEvents() {
  const router = useRouter();
  const { currentUser, openAuthModal } = useStore();
  const reduce = useReducedMotion();
  const [intent, setIntent] = useState('');
  const [w, setW] = useState(0);
  useEffect(() => { if (reduce) return; const t = setInterval(() => setW((x) => (x + 1) % ROTATING.length), 2200); return () => clearInterval(t); }, [reduce]);

  const start = useCallback((text: string) => {
    const q = text.trim() ? `?intent=${encodeURIComponent(text.trim())}` : '';
    if (currentUser?.role === 'corporate') router.push(`/corporate/dashboard${q}`);
    else if (currentUser?.role === 'vendor') router.push('/vendor/dashboard');
    else if (currentUser?.role === 'admin') router.push('/admin/dashboard');
    else {
      if (text.trim()) { try { sessionStorage.setItem('coe.intent', text.trim()); } catch { /* private mode */ } }
      openAuthModal();
    }
  }, [currentUser, router, openAuthModal]);

  // calculator
  const [cat, setCat] = useState<CalcCategory>('party');
  const [heads, setHeads] = useState(40);
  const [extras, setExtras] = useState<Set<string>>(new Set());
  const C = CALC[cat];
  const perHead = C.bph + C.extras.filter(([n]) => extras.has(n)).reduce((a, [, v]) => a + v, 0);
  const total = useMemo(() => perHead * heads, [perHead, heads]);

  return (
    <div className="ce">
      {/* ─── Hero ─── */}
      <section className="cop-hero ce-hero">
        <div className="wrap cop-hero-grid">
          <div>
            <div className="cop-kicker"><i /> For teams · by Community of Employees</div>
            <h1>
              Plan the{' '}
              <span className="city ce-rot">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span key={w} initial={reduce ? false : { y: '70%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={reduce ? undefined : { y: '-70%', opacity: 0 }} transition={{ duration: 0.35 }}>
                    {ROTATING[w]}
                  </motion.span>
                </AnimatePresence>
              </span>
              <br />In one post.
            </h1>
            <p className="ce-lead">Headcount, date, budget. Verified venues near your office in Gurgaon &amp; Delhi NCR bid line by line — you compare on your phone and lock the price.</p>
            <form className="ce-intent" onSubmit={(e) => { e.preventDefault(); start(intent); }}>
              <input value={intent} onChange={(e) => setIntent(e.target.value)} placeholder="Diwali party, 45 people, ₹1,500/head, near Cyber City" aria-label="Describe your event" />
              <button type="submit" className="cop-btn cop-btn-primary">Post it <ArrowRight size={16} /></button>
            </form>
            <div className="cop-quick">
              {EXAMPLES.slice(0, 5).map((x) => <button key={x} type="button" onClick={() => setIntent(x.replace(/^\S+\s/, ''))}>{x}</button>)}
            </div>
          </div>
          <div className="hstack ce-stack" aria-hidden="true">
            <div className="hstack-glow" />
            {[TOPIC_PHOTOS.party[0], TOPIC_PHOTOS.sports[1], TOPIC_PHOTOS.food[1]].map((p, i) => (
              <motion.figure key={p.id} className={`hcard h${i}`} initial={reduce ? false : { opacity: 0, y: 60, rotate: 0 }}
                animate={{ opacity: 1, x: [-86, 0, 92][i], y: [18, -10, 26][i], rotate: [-10, 2, 12][i], scale: i === 1 ? 1.04 : 0.94 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20, delay: i * 0.08 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photoSrc(p, 420, 520)} alt="" />
              </motion.figure>
            ))}
            <div className="hchip c1"><span className="e">📡</span> venues bid, you pick</div>
            <div className="hchip c2"><span className="dot" /> itemised, GST-ready</div>
            <div className="hchip c3"><span className="e">🔒</span> price locked</div>
            <span className="hcredit">Representative photos · Unsplash</span>
          </div>
        </div>
      </section>

      {/* ─── What teams post ─── */}
      <section className="ce-sec">
        <div className="wrap">
          <p className="ce-eyebrow">What teams post</p>
          <h2>Everything your team does together. <em>Except the meetings.</em></h2>
          <div className="ce-occ">
            {OCCASIONS.map((o, i) => (
              <motion.article key={o.title} className="ce-occ-card" initial={reduce ? false : { opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ delay: (i % 3) * 0.06 }}>
                <figure className="cop-photo">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photoSrc(PHOTO[o.photo], 640, 360)} alt="" loading="lazy" />
                  <figcaption>Representative photo · <a href={photoPage(PHOTO[o.photo])} target="_blank" rel="noopener noreferrer">{PHOTO[o.photo].by} / Unsplash</a></figcaption>
                  <span className="emo">{o.emoji}</span>
                </figure>
                <div className="b">
                  <h3>{o.title}</h3>
                  <p>{o.body}</p>
                  <div className="tags">{o.tags.map((t) => <span key={t}>{t}</span>)}</div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section className="ce-sec ce-ink">
        <div className="wrap">
          <p className="ce-eyebrow">How it works</p>
          <h2>Post for your team. <em>Let venues compete for it.</em></h2>
          <div className="ce-steps">
            {STEPS.map((s) => (
              <div key={s.num} className="ce-step">
                <span className="num">{s.num}</span>
                <span className="ic">{s.ic}</span>
                <h3>{s.h}</h3>
                <p>{s.p}</p>
                <span className="t">⏱ {s.t}</span>
              </div>
            ))}
          </div>
          <div className="ce-who">
            <div><span>🙋</span><div><h3>Any employee can post — for their own team</h3><p>You don’t need to be HR, and you don’t need approval to <em>ask</em>. Post for your pod, your floor, your cricket gang. Take the quotes to whoever holds the budget.</p></div></div>
            <div><span>🏢</span><div><h3>HR / admin? Post company-wide too</h3><p>Annual day, town-hall dinner, 300-pax offsite — with itemised, GST-ready invoicing. Same flow, bigger numbers.</p></div></div>
          </div>
        </div>
      </section>

      {/* ─── Calculator ─── */}
      <section className="ce-sec" id="estimate">
        <div className="wrap ce-calc">
          <div>
            <p className="ce-eyebrow">Ballpark it in 10 seconds</p>
            <h2>What will it <em>roughly</em> cost?</h2>
            <p className="ce-muted">Typical Gurgaon ranges, so you walk into the conversation with a number. Real bids come from venues once you post.</p>
            <div className="ce-tabs" role="tablist">
              {(Object.keys(CALC) as CalcCategory[]).map((k) => (
                <button key={k} type="button" role="tab" aria-selected={cat === k} className={cat === k ? 'on' : ''} onClick={() => { setCat(k); setExtras(new Set()); }}>{CALC[k].emoji} {CALC[k].label}</button>
              ))}
            </div>
            <label className="ce-range">
              <span>Headcount <b>{heads}</b></span>
              <input type="range" min={10} max={300} step={5} value={heads} onChange={(e) => setHeads(+e.target.value)} />
            </label>
            <div className="ce-extras">
              {C.extras.map(([n, v]) => {
                const on = extras.has(n);
                return (
                  <button key={n} type="button" aria-pressed={on} className={on ? 'on' : ''} onClick={() => setExtras((s) => { const x = new Set(s); x.has(n) ? x.delete(n) : x.add(n); return x; })}>
                    {on ? <Check size={14} /> : '+'} {n} <small>{inr(v)}/head</small>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="ce-total">
            <span className="lbl">Estimated total</span>
            <motion.b key={total} initial={reduce ? false : { scale: 0.92, opacity: 0.4 }} animate={{ scale: 1, opacity: 1 }}>{money(total)}</motion.b>
            <span className="ph">{inr(perHead)} per head × {heads}</span>
            <p>{C.hint}</p>
            <p className="inc">{C.includes}</p>
            <button type="button" className="cop-btn cop-btn-primary" onClick={() => start(`${C.label}, ${heads} people, ₹${perHead.toLocaleString('en-IN')}/head`)}>Get real bids for this <ArrowRight size={16} /></button>
          </div>
        </div>
      </section>

      {/* ─── Trust ─── */}
      <section className="ce-sec ce-soft">
        <div className="wrap">
          <p className="ce-eyebrow">The boring-but-important bit</p>
          <h2>Why your finance team will <em>also</em> be okay with this.</h2>
          <div className="ce-trust">
            {TRUST.map((t) => <div key={t.h}><span>{t.ic}</span><h3>{t.h}</h3><p>{t.p}</p></div>)}
          </div>
          <div className="ce-hubs"><span>Live around</span>{HUBS.map((h) => <b key={h}>{h}</b>)}</div>
        </div>
      </section>

      {/* ─── Final ─── */}
      <section className="ce-final">
        <div className="wrap">
          <h2>Post it once. <em>Then go get coffee.</em></h2>
          <p>Tell us what, how many, when and roughly how much. Venues near your office bid; you’ll be the person who “just sorted it”.</p>
          <div className="row">
            <button type="button" className="cop-btn cop-btn-primary" onClick={() => start(intent)}>Post your team event <ArrowRight size={16} /></button>
            <Link href="/communities" className="cop-btn ce-ghost">Or find a community to join →</Link>
          </div>
          <p className="ce-small">Run a turf, club, restaurant or catering business in NCR? <Link href="/vendors">Bid on corporate events</Link>.</p>
        </div>
      </section>
    </div>
  );
}
