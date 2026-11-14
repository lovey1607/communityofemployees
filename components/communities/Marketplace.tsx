'use client';
// ============================================================
// components/communities/Marketplace.tsx — the listing marketplace.
// Filters are always visible, state lives in the URL, geolocation is
// asked for only after the visitor acts, and every card has a direct
// join link. Data is static (data/communities.ts) and filtered client-side.
// ============================================================

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'framer-motion';
import {
  Search, X, SlidersHorizontal, LocateFixed, Map as MapIcon, ChevronRight,
  Footprints, Bike, Trophy, Dumbbell, Mountain, Cpu, Rocket, Palette, BookOpen,
  UtensilsCrossed, Users, Languages, HeartHandshake, Leaf, Baby, PawPrint, Briefcase, Dice5, Sparkles,
} from 'lucide-react';
import {
  COMMUNITIES, CATEGORY_META, CATEGORY_ORDER, AREAS, CITY_CENTRES, CITY_GROUPS, DEFAULT_FILTERS,
  applyFilters, categoriesWithListings, filtersToParams, activeFilterCount, nearestCity, PLATFORM_LABEL,
  type Filters, type Origin, type CommunityCategory, type Scored,
} from '@/lib/communities';
import { CommunityCard } from './CommunityCard';
import { Mark } from './Mark';

const ICONS: Record<CommunityCategory | 'all', React.ComponentType<{ size?: number }>> = {
  all: Sparkles, running: Footprints, cycling: Bike, sports: Trophy, fitness: Dumbbell, outdoors: Mountain,
  tech: Cpu, startup: Rocket, creative: Palette, books: BookOpen, food: UtensilsCrossed, social: Users,
  language: Languages, cause: HeartHandshake, wellbeing: Leaf, parents: Baby, pets: PawPrint,
  professional: Briefcase, games: Dice5, other: Sparkles,
};

const SAVED_KEY = 'cop:saved';
const ORIGIN_KEY = 'cop:origin';

type Props = { initial: Filters; lockCity?: boolean; title?: string };

export function Marketplace({ initial, lockCity = false, title }: Props) {
  const reduce = useReducedMotion();
  const [f, setF] = useState<Filters>(initial);
  const [origin, setOrigin] = useState<Origin>(null);
  const [originKind, setOriginKind] = useState<'none' | 'geo' | 'area' | 'city'>('none');
  const [geo, setGeo] = useState<{ busy: boolean; msg: string | null }>({ busy: false, msg: null });
  const askedGeo = useRef(false);
  const [locOpen, setLocOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [mapOn, setMapOn] = useState(false);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);
  const [stuck, setStuck] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);

  // ─── per-viewer conveniences (localStorage; never load-bearing) ───
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(SAVED_KEY) || '[]');
      if (Array.isArray(s)) setSaved(new Set(s));
      const o = JSON.parse(localStorage.getItem(ORIGIN_KEY) || 'null');
      if (o && typeof o.lat === 'number') { setOrigin(o); setOriginKind(o.kind ?? 'area'); }
    } catch { /* storage unavailable */ }
    setHydrated(true);
  }, []);
  const persistOrigin = (o: Origin, kind: 'geo' | 'area' | 'city') => {
    setOrigin(o); setOriginKind(kind);
    try { localStorage.setItem(ORIGIN_KEY, JSON.stringify(o ? { ...o, kind } : null)); } catch { /* ignore */ }
  };
  const toggleSave = (slug: string) => {
    setSaved((prev) => {
      const n = new Set(prev); n.has(slug) ? n.delete(slug) : n.add(slug);
      try { localStorage.setItem(SAVED_KEY, JSON.stringify([...n])); } catch { /* ignore */ }
      say(n.has(slug) ? 'Saved on this device' : 'Removed from saved');
      return n;
    });
  };
  const tt = useRef<ReturnType<typeof setTimeout> | null>(null);
  const say = (m: string) => { setToast(m); if (tt.current) clearTimeout(tt.current); tt.current = setTimeout(() => setToast(null), 2600); };

  // ─── URL sync (shallow; no navigation) ───
  useEffect(() => {
    if (!hydrated) return;
    const p = filtersToParams(f);
    if (lockCity) p.delete('city');
    const qs = p.toString();
    const url = `${location.pathname}${qs ? `?${qs}` : ''}`;
    if (url !== `${location.pathname}${location.search}`) window.history.replaceState(window.history.state, '', url);
  }, [f, hydrated, lockCity]);

  // ─── sticky shadow ───
  useEffect(() => {
    const el = sentinel.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => setStuck(!e.isIntersecting), { rootMargin: '-65px 0px 0px 0px' });
    io.observe(el); return () => io.disconnect();
  }, []);

  // ─── geolocation (only after the visitor acts) ───
  const locate = useCallback((silent = false) => {
    if (!('geolocation' in navigator)) { if (!silent) setGeo({ busy: false, msg: 'Location isn’t available in this browser — pick an area instead.' }); return; }
    setGeo({ busy: true, msg: 'Finding you…' });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const near = nearestCity(lat, lng);
        persistOrigin({ lat, lng, label: 'your location' }, 'geo');
        if (near.km < 80 && !lockCity && near.city !== f.city) setF((x) => ({ ...x, city: near.city, sort: 'nearest' }));
        else setF((x) => ({ ...x, sort: 'nearest' }));
        setGeo({ busy: false, msg: near.km > 80 ? `You’re ${Math.round(near.km)} km from ${near.city} — showing ${f.city} by distance anyway.` : null });
        say('Sorted by distance from you');
      },
      (err) => {
        const why = err.code === 1 ? 'Location permission declined — no problem.' : err.code === 3 ? 'Location timed out.' : 'Couldn’t get your location.';
        setGeo({ busy: false, msg: silent ? null : `${why} Pick your area instead.` });
        if (!silent) setLocOpen(true);
      },
      { timeout: 9000, maximumAge: 120000 },
    );
  }, [f.city, lockCity]);

  const update = (patch: Partial<Filters>) => {
    setF((x) => ({ ...x, ...patch }));
    if (patch.category && patch.category !== 'all' && !origin && !askedGeo.current) { askedGeo.current = true; locate(true); }
  };
  const pickArea = (a: { label: string; lat: number; lng: number; city: string }) => {
    persistOrigin({ lat: a.lat, lng: a.lng, label: a.label }, 'area');
    setF((x) => ({ ...x, city: lockCity ? x.city : a.city, sort: 'nearest' }));
    setLocOpen(false);
  };
  const pickCity = (city: string) => {
    const c = CITY_CENTRES[city];
    persistOrigin({ lat: c.lat, lng: c.lng, label: `${city} (centre)` }, 'city');
    setF((x) => ({ ...x, city, sort: 'nearest' }));
  };

  // ─── derived ───
  const cityPool = useMemo(() => COMMUNITIES.filter((c) => (CITY_GROUPS[f.city] ?? [f.city]).includes(c.city)), [f.city]);
  const cats = useMemo(() => categoriesWithListings(cityPool), [cityPool]);
  const catCount = useMemo(() => { const m = new Map<string, number>(); for (const c of cityPool) m.set(c.category, (m.get(c.category) ?? 0) + 1); return m; }, [cityPool]);
  const results = useMemo(() => applyFilters(COMMUNITIES, f, origin), [f, origin]);
  const nActive = activeFilterCount(f);
  const pristine = nActive === 0 && !f.q;
  const featured = useMemo(() => cityPool.filter((c) => c.featured).slice(0, 8), [cityPool]);
  const fallback: Scored[] = useMemo(() => results.length ? [] : applyFilters(COMMUNITIES, { ...DEFAULT_FILTERS, city: f.city, category: f.category }, origin).slice(0, 3), [results.length, f.city, f.category, origin]);
  const cityCount = Object.keys(CITY_CENTRES).length;

  const chip = (label: string, on: boolean, onClick: () => void, extra?: React.ReactNode) => (
    <button type="button" className="cop-pill" aria-pressed={on} onClick={onClick}>{label}{extra}</button>
  );

  const removable: { k: string; label: string; clear: () => void }[] = [];
  if (f.category !== 'all') removable.push({ k: 'category', label: CATEGORY_META[f.category].label, clear: () => update({ category: 'all' }) });
  if (f.gender !== 'all') removable.push({ k: 'gender', label: f.gender === 'women' ? 'Women only' : 'Men only', clear: () => update({ gender: 'all' }) });
  if (f.beginner) removable.push({ k: 'beginner', label: 'Beginner-friendly', clear: () => update({ beginner: false }) });
  if (f.price !== 'any') removable.push({ k: 'price', label: f.price === 'free' ? 'Free' : 'Paid', clear: () => update({ price: 'any' }) });
  if (f.events) removable.push({ k: 'events', label: 'Has regular events', clear: () => update({ events: false }) });
  if (f.cadence !== 'any') removable.push({ k: 'cadence', label: f.cadence === 'weekly' ? 'Weekly' : 'Monthly', clear: () => update({ cadence: 'any' }) });
  if (f.size !== 'any') removable.push({ k: 'size', label: `Size: ${f.size}`, clear: () => update({ size: 'any' }) });
  if (f.join !== 'any') removable.push({ k: 'join', label: `Join via ${PLATFORM_LABEL[f.join]}`, clear: () => update({ join: 'any' }) });
  if (f.verified) removable.push({ k: 'verified', label: 'Verified only', clear: () => update({ verified: false }) });
  if (f.q) removable.push({ k: 'q', label: `“${f.q}”`, clear: () => update({ q: '' }) });

  const heading = title ?? (f.category === 'all' ? 'Find your people in' : `${CATEGORY_META[f.category].label} communities in`);

  return (
    <div className="cop">
      {/* ─── Hero ─── */}
      <section className="cop-hero">
        <div className="wrap">
          <div className="cop-hero-row">
            <div>
              <h1>
                {heading}{' '}
                <span className="city" aria-live="polite">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span key={f.city}
                      initial={reduce ? false : { y: '60%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={reduce ? undefined : { y: '-60%', opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}>
                      {f.city}.
                    </motion.span>
                  </AnimatePresence>
                </span>
              </h1>
              <p>Run clubs, turf football, silent reading, founder breakfasts, board-game nights. Real communities with a direct link to join — no sign-up wall, no middleman.</p>
            </div>
            <div className="cop-count" aria-label="Listing counts">
              <div><b>{COMMUNITIES.length}</b><span>communities</span></div>
              <div><b>{cityCount}</b><span>cities</span></div>
              <div><b>{cityPool.length}</b><span>in {f.city} area</span></div>
            </div>
          </div>
          <div className="cop-search">
            <label>
              <Search size={18} />
              <span className="sr">Search communities</span>
              <input type="search" value={f.q} onChange={(e) => update({ q: e.target.value })} placeholder={`Search “pickleball”, “women only”, “Cyber City”, “board games”…`} enterKeyHint="search" />
              {f.q && <button type="button" className="clear" aria-label="Clear search" onClick={() => update({ q: '' })}><X size={14} /></button>}
            </label>
            <button type="button" className="cop-btn cop-btn-primary" onClick={() => locate(false)} disabled={geo.busy}>
              <LocateFixed size={16} /> {geo.busy ? 'Finding…' : 'Near me'}
            </button>
          </div>
          {geo.msg && <p className="cop-note" style={{ marginTop: '.5rem' }} role="status">{geo.msg}</p>}
        </div>
      </section>
      <div ref={sentinel} aria-hidden="true" />

      {/* ─── Filters, always visible ─── */}
      <section className={`cop-filters${stuck ? ' stuck' : ''}`} aria-label="Filters">
        <div className="wrap">
          <div className="cop-cats" role="tablist" aria-label="Category">
            {(['all', ...cats] as (CommunityCategory | 'all')[]).map((k) => {
              const Icon = ICONS[k];
              const on = f.category === k;
              return (
                <button key={k} type="button" role="tab" className="cop-cat" aria-pressed={on} aria-selected={on} onClick={() => update({ category: on && k !== 'all' ? 'all' : k })}>
                  <Icon size={16} /> {k === 'all' ? 'All' : CATEGORY_META[k].label}
                  <span className="n">{k === 'all' ? cityPool.length : catCount.get(k) ?? 0}</span>
                </button>
              );
            })}
          </div>
          <div className="cop-ctl">
            <div className="cop-loc">
              {originKind === 'geo' && <span className="live" aria-hidden="true" />}
              <span>{origin ? 'Near' : 'In'}</span>
              <span className="where">{origin ? origin.label : f.city}</span>
              <button type="button" className="change" onClick={() => setLocOpen(true)}>Change</button>
            </div>
            <span className="desk">{chip('Women only', f.gender === 'women', () => update({ gender: f.gender === 'women' ? 'all' : 'women' }))}</span>
            <span className="desk">{chip('Free', f.price === 'free', () => update({ price: f.price === 'free' ? 'any' : 'free' }))}</span>
            <span className="desk">{chip('Beginner-friendly', f.beginner, () => update({ beginner: !f.beginner }))}</span>
            <span className="desk">{chip('Regular events', f.events, () => update({ events: !f.events }))}</span>
            <button type="button" className="cop-pill" aria-pressed={nActive > (f.category !== 'all' ? 1 : 0)} onClick={() => setMoreOpen(true)}>
              <SlidersHorizontal size={14} /> Filters {nActive > 0 && <span className="cnt">{nActive}</span>}
            </button>
            <span className="spacer" />
            <button type="button" className="cop-pill desk" aria-pressed={mapOn} onClick={() => setMapOn((m) => !m)}><MapIcon size={14} /> Map</button>
            <span className="cop-select">
              <label className="sr" htmlFor="cop-sort">Sort</label>
              <select id="cop-sort" value={f.sort} onChange={(e) => update({ sort: e.target.value as Filters['sort'] })}>
                <option value="nearest">{origin ? 'Nearest first' : 'Recommended'}</option>
                <option value="active">Most active</option>
                <option value="newest">Newest</option>
                <option value="az">A – Z</option>
              </select>
            </span>
          </div>
          {removable.length > 0 && (
            <div className="cop-active">
              <span>{results.length} result{results.length === 1 ? '' : 's'}</span>
              {removable.map((r) => <button key={r.k} type="button" className="x" onClick={r.clear}>{r.label} <X size={11} /></button>)}
              <button type="button" className="all" onClick={() => setF({ ...DEFAULT_FILTERS, city: f.city })}>Clear all</button>
            </div>
          )}
        </div>
      </section>

      {/* ─── Results ─── */}
      <main className={`cop-main${mapOn ? ' with-map' : ''}`}>
        <div className="wrap">
          <div>
            {pristine && featured.length > 0 && (
              <section className="cop-featured" aria-label="Featured communities">
                <h2>Start here</h2>
                <div className="cop-strip">
                  {featured.map((c) => (
                    <Link key={c.slug} href={`/communities/${c.slug}`} className="cop-feat" style={{ ['--h' as string]: CATEGORY_META[c.category].hue }}>
                      <span className="k">{CATEGORY_META[c.category].label} · {c.area ?? c.city}</span>
                      <h3>{c.name}</h3>
                      <p>{c.tagline}</p>
                      <span className="go">See how to join <ChevronRight size={14} /></span>
                    </Link>
                  ))}
                </div>
              </section>
            )}
            <p className="cop-note" style={{ marginBottom: '.8rem' }} aria-live="polite">
              {results.length} {results.length === 1 ? 'community' : 'communities'}
              {f.category !== 'all' ? ` · ${CATEGORY_META[f.category].label.toLowerCase()}` : ''}
              {origin ? ` · sorted by distance from ${origin.label}` : ` · ${f.city} & around`}
            </p>
            <LayoutGroup>
              <motion.div className="cop-grid" layout={!reduce}>
                <AnimatePresence mode="popLayout" initial={false}>
                  {results.map((c, i) => (
                    <CommunityCard key={c.slug} c={c} index={i} saved={saved.has(c.slug)} onSave={toggleSave} onToast={say} />
                  ))}
                </AnimatePresence>
                {results.length === 0 && (
                  <div className="cop-empty">
                    <h3>Nothing matches that exactly.</h3>
                    <p>
                      {f.q ? <>No listing matches “{f.q}”{f.category !== 'all' ? ` under ${CATEGORY_META[f.category].label}` : ''} in the {f.city} area. </> : <>No {f.category !== 'all' ? CATEGORY_META[f.category].label.toLowerCase() : ''} communities with those filters in the {f.city} area yet. </>}
                      Try loosening a filter — or list one you know.
                    </p>
                    <div className="sugg">
                      <button type="button" className="cop-pill" onClick={() => setF({ ...DEFAULT_FILTERS, city: f.city, category: f.category })}>Clear filters</button>
                      {f.city !== 'Gurgaon' && <button type="button" className="cop-pill" onClick={() => pickCity('Gurgaon')}>Try Gurgaon</button>}
                      <Link href="/communities/submit" className="cop-pill">List a community</Link>
                    </div>
                    {fallback.length > 0 && (
                      <div style={{ marginTop: '1.4rem', textAlign: 'left' }}>
                        <p style={{ fontSize: '.8rem', color: 'var(--muted)', marginBottom: '.6rem' }}>Nearby instead:</p>
                        <div className="cop-grid">
                          {fallback.map((c, i) => <CommunityCard key={c.slug} c={c} index={i} saved={saved.has(c.slug)} onSave={toggleSave} onToast={say} />)}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </LayoutGroup>
            <p className="cop-note" style={{ marginTop: '2rem', maxWidth: '70ch' }}>
              Every listing links to the organiser’s own channel and shows the date we last checked it. “Unverified” means we found the community but couldn’t confirm activity in the last ~90 days.
              Spot something wrong? <a href="mailto:contact@communityofemployees.com" style={{ textDecoration: 'underline' }}>Tell us</a>.
            </p>
          </div>
          {mapOn && <MapPanel origin={origin} city={f.city} count={results.length} />}
        </div>
      </main>

      {/* ─── Location picker ─── */}
      <AnimatePresence>
        {locOpen && (
          <Overlay onClose={() => setLocOpen(false)} title="Where should we look?" reduce={!!reduce}>
            <div className="cop-locpick">
              <div className="geo">
                <button type="button" className="cop-btn cop-btn-accent cop-btn-sm" onClick={() => { locate(false); }} disabled={geo.busy}><LocateFixed size={14} /> Use my location</button>
                <span className="status">{geo.busy && <span className="cop-spin" />}{geo.msg ?? 'We only use it to sort by distance. Nothing is stored online.'}</span>
              </div>
              {!lockCity && (
                <div className="cop-fgroup">
                  <h4>City</h4>
                  <div className="cities">{Object.keys(CITY_CENTRES).map((city) => chip(city, f.city === city && originKind !== 'area', () => pickCity(city)))}</div>
                </div>
              )}
              <div className="cop-fgroup">
                <h4>Area in {f.city}</h4>
                <div className="areas">
                  {AREAS.filter((a) => a.city === f.city).map((a) => (
                    <button key={a.label} type="button" className={origin?.label === a.label ? 'on' : ''} onClick={() => pickArea(a)}>{a.label}</button>
                  ))}
                </div>
              </div>
            </div>
          </Overlay>
        )}
        {moreOpen && (
          <Overlay onClose={() => setMoreOpen(false)} title="Filters" reduce={!!reduce}
            footer={<><button type="button" className="cop-btn cop-btn-ghost" onClick={() => setF({ ...DEFAULT_FILTERS, city: f.city })}>Clear all</button><button type="button" className="cop-btn cop-btn-primary" onClick={() => setMoreOpen(false)}>Show {results.length}</button></>}>
            <div className="cop-fgroup"><h4>Who it’s for</h4><div className="opts">
              {chip('Everyone', f.gender === 'all', () => update({ gender: 'all' }))}
              {chip('Women only', f.gender === 'women', () => update({ gender: 'women' }))}
              {chip('Men only', f.gender === 'men', () => update({ gender: 'men' }))}
              {chip('Beginner-friendly', f.beginner, () => update({ beginner: !f.beginner }))}
            </div></div>
            <div className="cop-fgroup"><h4>Pricing</h4><div className="opts">
              {chip('Any', f.price === 'any', () => update({ price: 'any' }))}
              {chip('Free', f.price === 'free', () => update({ price: 'free' }))}
              {chip('Paid / per event', f.price === 'paid', () => update({ price: 'paid' }))}
            </div></div>
            <div className="cop-fgroup"><h4>How often</h4><div className="opts">
              {chip('Any', f.cadence === 'any' && !f.events, () => update({ cadence: 'any', events: false }))}
              {chip('Has regular events', f.events, () => update({ events: !f.events }))}
              {chip('Weekly', f.cadence === 'weekly', () => update({ cadence: f.cadence === 'weekly' ? 'any' : 'weekly' }))}
              {chip('Monthly', f.cadence === 'monthly', () => update({ cadence: f.cadence === 'monthly' ? 'any' : 'monthly' }))}
            </div></div>
            <div className="cop-fgroup"><h4>Size</h4><div className="opts">
              {chip('Any', f.size === 'any', () => update({ size: 'any' }))}
              {chip('Small (< 200)', f.size === 'small', () => update({ size: 'small' }))}
              {chip('Medium (200–1000)', f.size === 'medium', () => update({ size: 'medium' }))}
              {chip('Large (1000+)', f.size === 'large', () => update({ size: 'large' }))}
            </div></div>
            <div className="cop-fgroup"><h4>Join via</h4><div className="opts">
              {chip('Any', f.join === 'any', () => update({ join: 'any' }))}
              {chip('WhatsApp', f.join === 'whatsapp', () => update({ join: 'whatsapp' }))}
              {chip('Instagram', f.join === 'instagram', () => update({ join: 'instagram' }))}
              {chip('Meetup', f.join === 'meetup', () => update({ join: 'meetup' }))}
              {chip('Website', f.join === 'website', () => update({ join: 'website' }))}
            </div></div>
            <div className="cop-fgroup"><h4>Trust</h4><div className="opts">
              {chip('Verified activity only', f.verified, () => update({ verified: !f.verified }))}
            </div></div>
            <div className="cop-fgroup"><h4>Sort</h4><div className="opts">
              {chip(origin ? 'Nearest' : 'Recommended', f.sort === 'nearest', () => update({ sort: 'nearest' }))}
              {chip('Most active', f.sort === 'active', () => update({ sort: 'active' }))}
              {chip('Newest', f.sort === 'newest', () => update({ sort: 'newest' }))}
              {chip('A – Z', f.sort === 'az', () => update({ sort: 'az' }))}
            </div></div>
            <div className="cop-fgroup"><h4>View</h4><div className="opts">{chip('Show map', mapOn, () => setMapOn((m) => !m))}</div></div>
          </Overlay>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div className="cop-toast" role="status" initial={{ opacity: 0, y: 16, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: 16, x: '-50%' }} transition={{ duration: 0.25 }}>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Overlay: bottom sheet on mobile, side panel on desktop ──────
function Overlay({ title, children, footer, onClose, reduce }: { title: string; children: React.ReactNode; footer?: React.ReactNode; onClose: () => void; reduce: boolean }) {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = matchMedia('(max-width: 820px)');
    const on = () => setMobile(mq.matches); on();
    mq.addEventListener('change', on);
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    addEventListener('keydown', key);
    const prev = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { mq.removeEventListener('change', on); removeEventListener('keydown', key); document.body.style.overflow = prev; };
  }, [onClose]);
  const panelAnim = mobile
    ? { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' } }
    : { initial: { x: '100%' }, animate: { x: 0 }, exit: { x: '100%' } };
  return (
    <>
      <motion.div className="cop-scrim" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} />
      <motion.div className={mobile ? 'cop-sheet' : 'cop-desk-panel'} role="dialog" aria-modal="true" aria-label={title}
        {...(reduce ? {} : panelAnim)} transition={{ type: 'spring', stiffness: 380, damping: 36 }}>
        {mobile && <div className="grab" />}
        <header><h2>{title}</h2><button type="button" className="cop-xbtn" aria-label="Close" onClick={onClose}><X size={16} /></button></header>
        <div className="body">{children}</div>
        {footer && <footer>{footer}</footer>}
      </motion.div>
    </>
  );
}

// ─── Keyless map: OpenStreetMap embed centred on the origin ──────
function MapPanel({ origin, city, count }: { origin: Origin; city: string; count: number }) {
  const c = origin ?? CITY_CENTRES[city];
  const pad = origin ? 0.045 : 0.12;
  const bbox = [c.lng - pad * 1.3, c.lat - pad, c.lng + pad * 1.3, c.lat + pad].map((v) => v.toFixed(4)).join('%2C');
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${c.lat.toFixed(5)}%2C${c.lng.toFixed(5)}`;
  return (
    <aside className="cop-map-panel" aria-label="Map">
      <iframe title={`Map around ${c.label}`} src={src} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
      <div className="cap">
        <span>📍 {c.label} · {count} communities in list</span>
        <a href={`https://www.openstreetmap.org/?mlat=${c.lat}&mlon=${c.lng}#map=13/${c.lat}/${c.lng}`} target="_blank" rel="noopener noreferrer">Open map</a>
      </div>
    </aside>
  );
}

export function MiniMark({ c }: { c: Scored }) { return <Mark c={c} size={28} />; }
