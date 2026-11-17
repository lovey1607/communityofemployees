'use client';
// ============================================================
// components/communities/Marketplace.tsx — the listing marketplace.
// Filters are always visible, state lives in the URL, geolocation is
// asked for only after the visitor acts, and every card has a direct
// join link. Data is static (data/communities.ts) and filtered client-side.
// ============================================================

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'framer-motion';
import {
  Search, X, SlidersHorizontal, LocateFixed, Map as MapIcon, ChevronRight, Layers, LayoutGrid,
} from 'lucide-react';
import {
  CATEGORY_META, CATEGORY_ORDER, WORLD_REGIONS, CITY_COUNTRY, isWorldCity, cityLabel, AREAS, CITY_CENTRES, CITY_GROUPS, DEFAULT_FILTERS, METRO_CITIES, ALL_CITIES,
  JOIN_FILTER_OPTIONS, applyFilters, inCity, categoriesWithListings, filtersToParams, activeFilterCount, nearestCity, PLATFORM_LABEL,
  type Filters, type Origin, type CommunityCategory, type Scored, type Community,
} from '@/lib/communities';
import { CommunityCard } from './CommunityCard';
import { Mark } from './Mark';
import { SCENE_COPY } from './HeroScene';
import { HeroStack } from './HeroStack';
import { SwipeDeck } from './SwipeDeck';
import { CursorBuddy, burst } from './CursorBuddy';
import { CAT_EMOJI } from './emoji';
import { PlatformDock } from './PlatformDock';


const SAVED_KEY = 'cop:saved';
const ORIGIN_KEY = 'cop:origin';
const CITY_KEY = 'cop:city';
const GEO_ASKED_KEY = 'cop:geo-asked';

/**
 * `all` is only the slice for the current city (plus pan-India online rows for
 * Indian cities) — the server cuts it so the page never ships every listing.
 * Switching to a city outside that slice navigates and the server sends the new one.
 */
type Props = { initial: Filters; lockCity?: boolean; title?: string; all: Community[]; cityCounts: Record<string, number>; totals: { listings: number; cities: number } };

export const CITY_COOKIE = 'cop_city';

export function Marketplace({ initial, lockCity = false, title, all, cityCounts: cityCountsRec, totals }: Props) {
  const router = useRouter();
  const poolCity = initial.city;
  const reduce = useReducedMotion();
  const [f, setF] = useState<Filters>(initial);
  const [origin, setOrigin] = useState<Origin>(null);
  const [originKind, setOriginKind] = useState<'none' | 'geo' | 'area' | 'city'>('none');
  const [geo, setGeo] = useState<{ busy: boolean; msg: string | null }>({ busy: false, msg: null });
  const askedGeo = useRef(false);
  const [locOpen, setLocOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [mapOn, setMapOn] = useState(false);
  const [view, setView] = useState<'swipe' | 'grid'>(initial.category !== 'all' ? 'swipe' : 'grid');
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // Remember the visitor's city in a cookie, so /communities (server-rendered) opens there next time.
  const rememberCity = (city: string) => { try { document.cookie = `${CITY_COOKIE}=${encodeURIComponent(city)}; path=/; max-age=31536000; samesite=lax`; localStorage.setItem(CITY_KEY, city); } catch { /* ignore */ } };
  useEffect(() => { if (hydrated && !lockCity) rememberCity(f.city); }, [f.city, hydrated, lockCity]); // eslint-disable-line react-hooks/exhaustive-deps
  /** Switch city: in-slice cities switch instantly; anything else loads that city's slice. */
  const goCity = (city: string, extra: Partial<Filters> = {}) => {
    if (!lockCity && (CITY_GROUPS[poolCity] ?? [poolCity]).includes(city)) { setF((x) => ({ ...x, ...extra, city })); return; }
    rememberCity(city);
    const p = filtersToParams({ ...f, ...extra, city });
    router.push(`/?${p.toString()}`);
  };
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
        if (!lockCity && near.city !== f.city) goCity(near.city, { sort: 'nearest' });
        else setF((x) => ({ ...x, sort: 'nearest' }));
        setGeo({ busy: false, msg: near.km > 80 ? `The nearest city we cover is ${near.city} (${Math.round(near.km)} km). Pick another city any time.` : null });
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

  // Default to the visitor's real location: on first visit ask once (the
  // browser shows its own prompt); if they already granted it, refresh
  // silently each visit. Declined → we stay on the default city and the
  // location bubble lets them pick a city/area by hand.
  useEffect(() => {
    if (!hydrated || lockCity || !('geolocation' in navigator)) return;
    // A city in the URL was chosen (a shared link, or the visitor just switched) — don't override it.
    if (new URLSearchParams(location.search).has('city')) return;
    let asked = false;
    try { asked = localStorage.getItem(GEO_ASKED_KEY) === '1'; } catch { /* ignore */ }
    const go = () => { askedGeo.current = true; try { localStorage.setItem(GEO_ASKED_KEY, '1'); } catch { /* ignore */ } locate(true); };
    const perms = (navigator as Navigator & { permissions?: Permissions }).permissions;
    if (perms?.query) {
      perms.query({ name: 'geolocation' as PermissionName }).then((st) => {
        if (st.state === 'granted') go();
        else if (st.state === 'prompt' && !asked && originKind !== 'area' && originKind !== 'city') go();
      }).catch(() => { if (!asked) go(); });
    } else if (!asked) go();
  }, [hydrated]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = (patch: Partial<Filters>) => {
    setF((x) => ({ ...x, ...patch }));
    if (patch.category) {
      setView(patch.category === 'all' ? 'grid' : 'swipe'); setMapOn(false);
      if (patch.category !== 'all') setTimeout(() => {
        const main = document.querySelector('.cop-main') as HTMLElement | null;
        const bar = document.querySelector('.cop-filters') as HTMLElement | null;
        if (!main) return;
        const stickyBar = bar && getComputedStyle(bar).position === 'sticky' ? bar.offsetHeight : 0;
        const top = main.getBoundingClientRect().top + window.scrollY - 64 - stickyBar + 4;
        window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
      }, 140);
    }
    if (patch.category && patch.category !== 'all' && !origin && !askedGeo.current) { askedGeo.current = true; locate(true); }
  };
  const pickArea = (a: { label: string; lat: number; lng: number; city: string }) => {
    persistOrigin({ lat: a.lat, lng: a.lng, label: a.label }, 'area');
    if (lockCity || a.city === f.city) setF((x) => ({ ...x, sort: 'nearest' })); else goCity(a.city, { sort: 'nearest' });
    setLocOpen(false);
  };
  const pickCity = (city: string) => {
    const c = CITY_CENTRES[city];
    persistOrigin({ lat: c.lat, lng: c.lng, label: `${city} (centre)` }, 'city');
    if (city === f.city) { setF((x) => ({ ...x, sort: 'nearest' })); return; }
    goCity(city, { sort: 'nearest' });
  };

  // ─── derived ───
  const cityPool = useMemo(() => all.filter((c) => inCity(c, f.city)), [f.city, all]);
  // Render the grid in pages: 24 cards first, more on demand (keeps the
  // first paint fast even when a city has 150+ listings).
  const PAGE = 24;
  const [limit, setLimit] = useState(PAGE);
  useEffect(() => { setLimit(PAGE); }, [f]);
  const verifiedCount = useMemo(() => cityPool.filter((c) => c.status === 'approved' && c.source.verifiedOn >= '2026-11-01').length, [cityPool]);
  const platformCount = useMemo(() => { const m = new Map<string, number>(); for (const c of cityPool) if (f.category === 'all' || c.category === f.category) m.set(c.join.platform, (m.get(c.join.platform) ?? 0) + 1); return m; }, [cityPool, f.category]);
  const catsRaw = useMemo(() => categoriesWithListings(cityPool), [cityPool]);
  const catCountPre = useMemo(() => { const m = new Map<string, number>(); for (const c of cityPool) m.set(c.category, (m.get(c.category) ?? 0) + 1); return m; }, [cityPool]);
  const cats = useMemo(() => [...catsRaw].sort((a, b) => (catCountPre.get(b) ?? 0) - (catCountPre.get(a) ?? 0)), [catsRaw, catCountPre]);
  // Mobile: until a category is picked, the headline + scene cycle through the top 3.
  const [cycleIdx, setCycleIdx] = useState(-1);
  const [isMobile, setIsMobile] = useState(false);
  const [catsOpen, setCatsOpen] = useState(false);
  useEffect(() => { const mq = matchMedia('(max-width: 820px)'); const on = () => setIsMobile(mq.matches); on(); mq.addEventListener('change', on); return () => mq.removeEventListener('change', on); }, []);
  useEffect(() => {
    if (!isMobile || reduce || f.category !== 'all' || cats.length === 0) { setCycleIdx(-1); return; }
    const top = Math.min(3, cats.length);
    const first = setTimeout(() => setCycleIdx(0), 1600);
    const t = setInterval(() => setCycleIdx((i) => (i + 1) % top), 2600);
    return () => { clearTimeout(first); clearInterval(t); };
  }, [isMobile, reduce, f.category, cats]);
  const shownCat: CommunityCategory | 'all' = f.category !== 'all' ? f.category : cycleIdx >= 0 ? cats[cycleIdx] ?? 'all' : 'all';
  const catCount = useMemo(() => { const m = new Map<string, number>(); for (const c of cityPool) m.set(c.category, (m.get(c.category) ?? 0) + 1); return m; }, [cityPool]);
  const results = useMemo(() => applyFilters(all, f, origin), [all, f, origin]);
  const nActive = activeFilterCount(f);
  const pristine = nActive === 0 && !f.q;
  const featured = useMemo(() => cityPool.filter((c) => c.featured).slice(0, 8), [cityPool]);
  const fallback: Scored[] = useMemo(() => results.length ? [] : applyFilters(all, { ...DEFAULT_FILTERS, city: f.city, category: f.category }, origin).slice(0, 3), [all, results.length, f.city, f.category, origin]);
  const cityCount = totals.cities;
  const cityCounts = useMemo(() => new Map(Object.entries(cityCountsRec)), [cityCountsRec]);

  const chip = (label: string, on: boolean, onClick: () => void, extra?: React.ReactNode) => (
    <button type="button" className="cop-pill" aria-pressed={on} onClick={onClick}>{label}{extra}</button>
  );

  const removable: { k: string; label: string; clear: () => void }[] = [];
  if (f.category !== 'all') removable.push({ k: 'category', label: CATEGORY_META[f.category].label, clear: () => update({ category: 'all' }) });
  if (f.gender !== 'all') removable.push({ k: 'gender', label: f.gender === 'women' ? 'Women only' : 'Men only', clear: () => update({ gender: 'all' }) });
  if (f.beginner) removable.push({ k: 'beginner', label: 'Beginner-friendly', clear: () => update({ beginner: false }) });
  if (f.price !== 'any') removable.push({ k: 'price', label: f.price === 'free' ? 'Free' : f.price === 'membership' ? 'Membership / premium' : 'Paid', clear: () => update({ price: 'any' }) });
  if (f.events) removable.push({ k: 'events', label: 'Has regular events', clear: () => update({ events: false }) });
  if (f.cadence !== 'any') removable.push({ k: 'cadence', label: f.cadence === 'weekly' ? 'Weekly' : 'Monthly', clear: () => update({ cadence: 'any' }) });
  if (f.size !== 'any') removable.push({ k: 'size', label: `Size: ${f.size}`, clear: () => update({ size: 'any' }) });
  if (f.join !== 'any') removable.push({ k: 'join', label: `Join via ${PLATFORM_LABEL[f.join]}`, clear: () => update({ join: 'any' }) });
  if (f.mode !== 'any') removable.push({ k: 'mode', label: f.mode === 'online' ? 'Online' : 'In person', clear: () => update({ mode: 'any' }) });
  if (f.age !== 'any') removable.push({ k: 'age', label: f.age === 'genz' ? 'Gen Z' : '50+', clear: () => update({ age: 'any' }) });
  if (f.verified) removable.push({ k: 'verified', label: 'Verified only', clear: () => update({ verified: false }) });
  if (f.q) removable.push({ k: 'q', label: `“${f.q}”`, clear: () => update({ q: '' }) });

  

  return (
    <div className="cop">
      <CursorBuddy emoji={CAT_EMOJI[shownCat]} />
      {/* ─── Hero ─── */}
      <section className="cop-hero">
        <div className="wrap cop-hero-grid">
          <div>
            <div className="cop-kicker"><i /> {SCENE_COPY[shownCat].kicker}</div>
            <h1>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span key={shownCat} style={{ display: 'inline-block' }}
                  initial={reduce ? false : { opacity: 0, y: 14, filter: 'blur(6px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={reduce ? undefined : { opacity: 0, y: -14, filter: 'blur(6px)' }} transition={{ duration: 0.32 }}>
                  {f.category === 'all' && title ? title : SCENE_COPY[shownCat].line}
                </motion.span>
              </AnimatePresence>{' '}
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
            <div className="cop-hero-tools">
              <div className="cop-search">
                <label>
                  <Search size={18} />
                  <span className="sr">Search communities</span>
                  <input type="search" value={f.q} onChange={(e) => update({ q: e.target.value })} placeholder="pickleball, women only, board games…" enterKeyHint="search" />
                  {f.q && <button type="button" className="clear" aria-label="Clear search" onClick={() => update({ q: '' })}><X size={14} /></button>}
                </label>
              </div>
              {origin ? (
                <div className="cop-ask on">
                  <button type="button" className="cop-locbtn" onClick={() => setLocOpen(true)}><span aria-hidden="true">📍</span> Near <b>{origin.label}</b> <small>change</small></button>
                </div>
              ) : (
                <div className="cop-ask" role="group" aria-label="Set your location">
                  <button type="button" className="cop-locbtn hot" onClick={() => locate(false)} disabled={geo.busy}><LocateFixed size={15} /> {geo.busy ? 'Finding…' : 'Use my location'}</button>
                  <button type="button" className="cop-locbtn" onClick={() => setLocOpen(true)}>Pick area</button>
                </div>
              )}
            </div>
            <div className="cop-quick" aria-label="Popular searches">
              {['pickleball', 'women only', 'singles', 'board games', 'run club', 'free'].map((q) => (
                <button key={q} type="button" onClick={() => {
                  if (q === 'women only') update({ gender: f.gender === 'women' ? 'all' : 'women' });
                  else if (q === 'singles') update({ category: 'dating' });
                  else if (q === 'free') update({ price: f.price === 'free' ? 'any' : 'free' });
                  else if (q === 'run club') update({ category: 'running' });
                  else update({ q: f.q === q ? '' : q });
                }}>{q}</button>
              ))}
              <span className="sub">{totals.listings} communities · {cityCount} cities</span>
            </div>
            <PlatformDock counts={platformCount} value={f.join} onPick={(p) => update({ join: p })} />
            {geo.msg && <p className="cop-note" style={{ marginTop: '.5rem', color: 'rgba(255,255,255,.7)' }} role="status">{geo.msg}</p>}
          </div>
          <HeroStack category={shownCat}
            label={shownCat === 'all' ? `communities around ${f.city}` : `${CATEGORY_META[shownCat].label.toLowerCase()} picks around ${f.city}`}
            count={shownCat === 'all' ? cityPool.length : catCount.get(shownCat) ?? 0}
            verified={verifiedCount} />
        </div>
      </section>
      <div ref={sentinel} aria-hidden="true" />

      {/* ─── Filters, always visible ─── */}
      <section className={`cop-filters${stuck ? ' stuck' : ''}${view === 'swipe' ? ' swipe' : ''}`} aria-label="Filters">
        <div className="wrap">
          <div className="cop-cats" role="tablist" aria-label="Category">
            {(['all', ...cats] as (CommunityCategory | 'all')[]).map((k, idx) => {
              const on = f.category === k;
              const extra = idx > 2 && !on;
              return (
                <button key={k} type="button" role="tab" className={`cop-cat${extra ? ' extra' : ''}`} aria-pressed={on} aria-selected={on} data-cur={CAT_EMOJI[k]}
                  onClick={(e) => { if (!on && k !== 'all') burst(e.clientX, e.clientY, CAT_EMOJI[k]); update({ category: on && k !== 'all' ? 'all' : k }); }}>
                  <span className="emo" aria-hidden="true">{CAT_EMOJI[k]}</span> {k === 'all' ? 'All' : CATEGORY_META[k].label}
                  <span className="n">{k === 'all' ? cityPool.length : catCount.get(k) ?? 0}</span>
                </button>
              );
            })}
            <button type="button" className="cop-cat more-cats" onClick={() => setCatsOpen(true)}>More <span className="n">+{Math.max(0, cats.length - 2)}</span></button>
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
            <button type="button" className="cop-pill" aria-pressed={nActive > (f.category !== 'all' ? 1 : 0)} onClick={() => setMoreOpen(true)}>
              <SlidersHorizontal size={14} /> Filters {nActive > 0 && <span className="cnt">{nActive}</span>}
            </button>
            <span className="spacer" />
            <div className="cop-seg" role="tablist" aria-label="View">
              <button type="button" role="tab" aria-selected={view === 'swipe'} className={view === 'swipe' ? 'on' : ''} onClick={() => { setView('swipe'); setMapOn(false); }}><Layers size={14} /> Swipe</button>
              <button type="button" role="tab" aria-selected={view === 'grid'} className={view === 'grid' ? 'on' : ''} onClick={() => setView('grid')}><LayoutGrid size={14} /> Grid</button>
            </div>
            {view === 'grid' && <button type="button" className="cop-pill desk" aria-pressed={mapOn} onClick={() => setMapOn((m) => !m)}><MapIcon size={14} /> Map</button>}
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
      <main className={`cop-main${mapOn && view === 'grid' ? ' with-map' : ''}${view === 'swipe' ? ' is-swipe' : ''}`}>
        <div className="wrap">
          <div>
            <p className="cop-note" style={{ marginBottom: '.8rem', display: view === 'swipe' && results.length > 0 ? 'none' : undefined }} aria-live="polite">
              {results.length} {results.length === 1 ? 'community' : 'communities'}
              {f.category !== 'all' ? ` · ${CATEGORY_META[f.category].label.toLowerCase()}` : ''}
              {origin ? ` · sorted by distance from ${origin.label}` : ` · ${f.city} & around`}
            </p>
            {view === 'swipe' && results.length > 0 ? (
              <SwipeDeck items={results} saved={saved} onSave={toggleSave} onToast={say} onExit={() => setView('grid')} />
            ) : (
            <LayoutGroup>
              <motion.div className="cop-grid" layout={!reduce}>
                <AnimatePresence mode="popLayout" initial={false}>
                  {results.slice(0, limit).map((c, i) => (
                    <CommunityCard key={c.slug} c={c} index={i} saved={saved.has(c.slug)} onSave={toggleSave} onToast={say} />
                  ))}
                </AnimatePresence>
                {results.length > limit && (
                  <div className="cop-more">
                    <button type="button" className="cop-btn cop-btn-primary" onClick={() => setLimit((l) => l + PAGE * 2)}>Show {Math.min(PAGE * 2, results.length - limit)} more</button>
                    <span>{limit} of {results.length}</span>
                  </div>
                )}
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
            )}
            {saved.size > 0 && view === 'swipe' && (
              <div className="cop-picks" aria-label="Your saved picks">
                <span className="lbl">Your picks · {saved.size}</span>
                <div className="row">
                  {all.filter((c) => saved.has(c.slug)).slice(0, 12).map((c) => (
                    <Link key={c.slug} href={`/communities/${c.slug}`} title={c.name}><Mark c={c} size={40} /></Link>
                  ))}
                </div>
              </div>
            )}
            <p className="cop-note" style={{ marginTop: '2rem', maxWidth: '70ch' }}>
              Every listing links to the organiser’s own channel and shows the date we last checked it. “Unverified” means we found the community but couldn’t confirm activity in the last ~90 days.
              Spot something wrong? <a href="mailto:contact@communityofemployees.com" style={{ textDecoration: 'underline' }}>Tell us</a>.
            </p>
          </div>
          {mapOn && view === 'grid' && <MapPanel origin={origin} city={f.city} count={results.length} />}
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
              {AREAS.some((a) => a.city === f.city) && (
                <div className="cop-fgroup">
                  <h4>Area in {f.city}</h4>
                  <div className="areas">
                    {AREAS.filter((a) => a.city === f.city).map((a) => (
                      <button key={a.label} type="button" className={origin?.label === a.label ? 'on' : ''} onClick={() => pickArea(a)}>{a.label}</button>
                    ))}
                  </div>
                </div>
              )}
              <CityPicker current={f.city} onPick={pickCity} counts={cityCounts} />
            </div>
          </Overlay>
        )}
        {catsOpen && (
          <Overlay onClose={() => setCatsOpen(false)} title="Pick a vibe" reduce={!!reduce}>
            <div className="cop-catgrid">
              {(['all', ...cats] as (CommunityCategory | 'all')[]).map((k) => {
                return (
                  <button key={k} type="button" className={f.category === k ? 'on' : ''} data-cur={CAT_EMOJI[k]} onClick={(e) => { burst(e.clientX, e.clientY, CAT_EMOJI[k]); setCatsOpen(false); update({ category: k }); }}>
                    <span className="emo" aria-hidden="true">{CAT_EMOJI[k]}</span><b>{k === 'all' ? 'All' : CATEGORY_META[k].label}</b><span>{k === 'all' ? cityPool.length : catCount.get(k) ?? 0}</span>
                  </button>
                );
              })}
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
            <div className="cop-fgroup"><h4>Age focus <small>(only where the organiser says so)</small></h4><div className="opts">
              {chip('Any age', f.age === 'any', () => update({ age: 'any' }))}
              {chip('Gen Z', f.age === 'genz', () => update({ age: 'genz' }))}
              {chip('50+', f.age === '50plus', () => update({ age: '50plus' }))}
            </div></div>
            <div className="cop-fgroup"><h4>Where</h4><div className="opts">
              {chip('In person + online', f.mode === 'any', () => update({ mode: 'any' }))}
              {chip('In person', f.mode === 'inperson', () => update({ mode: 'inperson' }))}
              {chip('Online / hybrid', f.mode === 'online', () => update({ mode: 'online' }))}
            </div></div>
            <div className="cop-fgroup"><h4>Pricing</h4><div className="opts">
              {chip('Any', f.price === 'any', () => update({ price: 'any' }))}
              {chip('Free', f.price === 'free', () => update({ price: 'free' }))}
              {chip('Paid / per event', f.price === 'paid', () => update({ price: 'paid' }))}
              {chip('Membership / premium', f.price === 'membership', () => update({ price: 'membership' }))}
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
              {JOIN_FILTER_OPTIONS.map((p) => <span key={p}>{chip(PLATFORM_LABEL[p], f.join === p, () => update({ join: p }))}</span>)}
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

// ─── City picker: metros as chips, everything else searchable ─────

function CityPicker({ current, onPick, counts: CITY_COUNT }: { current: string; onPick: (city: string) => void; counts: Map<string, number> }) {
  const [q, setQ] = useState('');
  const norm = (s: string) => s.toLowerCase();
  const others = ALL_CITIES.filter((c) => !METRO_CITIES.includes(c) && !isWorldCity(c) && (CITY_COUNT.get(c) ?? 0) > 0);
  const match = (c: string) => !q || norm(c).includes(norm(q));
  return (
    <>
      <div className="cop-fgroup" id="cop-region-India">
        <h4>India · metros</h4>
        <input className="input-base" type="search" placeholder={`Search ${ALL_CITIES.length} cities or countries…`} value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search cities" />
        <div className="cop-regions" role="navigation" aria-label="Jump to region">
          {['India', ...Object.keys(WORLD_REGIONS)].map((r) => (
            <button key={r} type="button" onClick={() => document.getElementById(`cop-region-${r.replace(/\W+/g, '-')}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>{r === 'India' ? '🇮🇳 India' : r}</button>
          ))}
        </div>
        <div className="cities" style={{ marginTop: '.6rem' }}>
          {METRO_CITIES.filter(match).map((city) => (
            <button key={city} type="button" className="cop-pill" aria-pressed={current === city} onClick={() => onPick(city)}>{city} <span className="n" style={{ color: 'var(--muted)', fontWeight: 500 }}>{CITY_COUNT.get(city) ?? 0}</span></button>
          ))}
        </div>
      </div>
      {others.some(match) && (
        <div className="cop-fgroup">
          <h4>More cities in India</h4>
          <div className="areas">
            {others.filter(match).map((city) => (
              <button key={city} type="button" className={current === city ? 'on' : ''} onClick={() => onPick(city)}>{city} <span style={{ color: 'var(--muted)' }}>· {CITY_COUNT.get(city) ?? 0}</span></button>
            ))}
          </div>
        </div>
      )}
      {Object.entries(WORLD_REGIONS).map(([region, cities]) => {
        const list = cities.filter((c) => (CITY_COUNT.get(c) ?? 0) > 0 && (match(c) || match(CITY_COUNTRY[c] ?? '') || match(region)));
        if (!list.length) return null;
        return (
          <div key={region} className="cop-fgroup cop-world" id={`cop-region-${region.replace(/\W+/g, '-')}`}>
            <h4><span aria-hidden="true">🌍</span> {region}</h4>
            <div className="areas">
              {list.map((city) => (
                <button key={city} type="button" className={current === city ? 'on' : ''} onClick={() => onPick(city)} title={cityLabel(city)}>{city} <span style={{ color: 'var(--muted)' }}>· {CITY_COUNT.get(city) ?? 0}</span></button>
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
}

// ─── Overlay: bottom sheet on mobile, side panel on desktop ──────
function Overlay({ title, children, footer, onClose, reduce }: { title: string; children: React.ReactNode; footer?: React.ReactNode; onClose: () => void; reduce: boolean }) {
  // Overlays only mount after a click, so reading matchMedia here can't cause a hydration mismatch.
  const [mobile, setMobile] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 820px)').matches);
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
