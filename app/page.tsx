'use client';
// ============================================================
// app/page.tsx — the landing page.
//
// Ported from the standalone design, with three changes so it is part of
// the product rather than a brochure beside it:
//   · every call to action opens the real auth modal or the real dashboard
//   · the venue marquee and the sports count read from data/venues.ts, so
//     they cannot drift from the actual directory
//   · the sample feed stays clearly labelled as illustrative
//
// Styles live in app/landing.css; the design tokens it uses are the
// product-wide ones in globals.css.
// ============================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { GURUGRAM_PRESEEDED_VENUES } from '@/data/venues';
import './landing.css';

// ─── Content ────────────────────────────────────────────────

type Mood = 'none' | 'a' | 'b';

const MOOD_COPY: Record<'a' | 'b', {
  title: string;
  lead: string;
  list: [string, string][];
  cta: string;
  final: string;
  finalLead: string;
  cat: CalcCategory;
}> = {
  a: {
    title: 'Captain saab, the venue is the easy part now.',
    lead:
      'You already have the team list, the WhatsApp group, and three people who “will definitely come, promise”. Post the league — dates, teams, budget — and floodlit turfs across Gurgaon bid with umpires, gear and jerseys itemized. You handle the trash talk.',
    list: [
      ['🏏', 'Post the league: “6 teams, two Saturdays, ~₹2.3L all-in, Sohna Road side.” Two minutes.'],
      ['📋', 'Turfs bid line by line — ground, umpires, jerseys, post-match snacks. Drop what you don’t want.'],
      ['🏆', 'Lock the venue, share the fixture in the group. Trophy budget: your call.'],
    ],
    cta: 'Post my league',
    final: 'Post the league. Then go practise your cover drive.',
    finalLead:
      'Dates, teams, rough budget. Floodlit turfs near your office bid with everything itemized. You get to be the captain who actually got it done.',
    cat: 'sports',
  },
  b: {
    title: 'Yaar, you didn’t sign up for this. We know.',
    lead:
      'Someone said “tu hi kar le na” in standup and now it’s your problem. Fine. Post the party once — headcount, date, budget per head — and go back to your actual work. Venues near the office bid; you compare on your phone during a boring call.',
    list: [
      ['📝', 'Post in 2 minutes. “Diwali party, 45 people, ₹1,500/head, near Cyber City” is enough.'],
      ['📵', 'Venues chase you, not the other way round. No callbacks, no “sir ek minute hold kariye”.'],
      ['😌', 'Pick one, forward the quote to your manager, done. Take the credit anyway.'],
    ],
    cta: 'Post the party, be done',
    final: 'Post it once. Then go get coffee.',
    finalLead:
      'Tell us category, headcount, date and rough budget. Venues near your office will bid. You’ll be the person who “just sorted it”, and nobody needs to know it took two minutes.',
    cat: 'party',
  },
};

type CalcCategory = 'outing' | 'sports' | 'party' | 'dinner';

const CALC: Record<CalcCategory, {
  label: string;
  emoji: string;
  bph: number;
  hint: string;
  extras: [string, number][];
  includes: React.ReactNode;
}> = {
  outing: {
    label: 'Team outing',
    emoji: '🚌',
    bph: 1800,
    hint: 'Typical for a Gurgaon day outing: ₹1,500–2,500/head (venue + lunch + one activity).',
    extras: [['Bus / transport', 350], ['Activity slot (turf, pickleball)', 400], ['Drinks', 500]],
    includes: (
      <>Usually covers: <b>venue or resort day-access, lunch, one activity block</b>. Transport and drinks are the usual add-ons.</>
    ),
  },
  sports: {
    label: 'Sports league',
    emoji: '🏏',
    bph: 1900,
    hint: 'A 120-player box-cricket league in Gurgaon typically lands around ₹2.2–2.4L all-in — roughly ₹1,900/player.',
    extras: [['Umpires & scoring', 150], ['Custom jerseys', 450], ['Post-match snacks', 300]],
    includes: (
      <>Usually covers: <b>floodlit ground slots for all fixtures, basic gear, drinking water</b>. Umpires, jerseys and food come as separate lines.</>
    ),
  },
  party: {
    label: 'Office party',
    emoji: '🎉',
    bph: 2200,
    hint: 'Cyber Hub / Sector 29 party with food + a couple of drinks: ₹1,800–3,500/head depending on the bar.',
    extras: [['DJ / music (2 hrs)', 250], ['Unlimited drinks package', 600], ['Décor & photo corner', 150]],
    includes: (
      <>Usually covers: <b>reserved space, buffet or set menu, soft drinks</b>. Bar packages and DJ vary a lot — that’s where bidding helps most.</>
    ),
  },
  dinner: {
    label: 'Team dinner',
    emoji: '🍽️',
    bph: 1500,
    hint: 'Sit-down team dinner on Golf Course Road / Cyber Hub: ₹1,000–2,500/head without a heavy bar.',
    extras: [['Drinks (2 per head)', 700], ['Private section', 200], ['Cake & a small “thank you”', 80]],
    includes: (
      <>Usually covers: <b>set menu or à la carte cap, service, taxes</b>. Private rooms and drinks are the swing items.</>
    ),
  },
};

const HUBS = [
  { n: 'DLF Cyber City / Cyber Hub', d: 'Gurugram · Building 10, rapid metro side', lat: 28.495, lng: 77.089 },
  { n: 'Golf Course Road', d: 'Gurugram · Horizon Center, Sec 42–54', lat: 28.4515, lng: 77.0975 },
  { n: 'Golf Course Extension Rd', d: 'Gurugram · Sector 62–63', lat: 28.408, lng: 77.088 },
  { n: 'Sector 29', d: 'Gurugram · market & Leisure Valley', lat: 28.4665, lng: 77.064 },
  { n: 'Sohna Road', d: 'Gurugram · Sector 48–49', lat: 28.418, lng: 77.04 },
  { n: 'Noida', d: 'Sector 62 / Expressway', lat: 28.627, lng: 77.365 },
  { n: 'Aerocity & Central Delhi', d: 'Delhi · near IGI', lat: 28.549, lng: 77.121 },
];

const HERO_CHIPS = [
  '🏏 Box cricket league, 6 teams, Sohna Road',
  '🍻 Friday drinks at Cyber Hub, 22 pax',
  '🪔 Diwali party, 80 people, budget ₹1,500/head',
  '🏸 Badminton doubles tournament, Sec 52',
  '🚌 Day offsite near Sohna, 40 people',
  '🥂 Farewell dinner, Golf Course Road',
  '🥒 Pickleball evening, Sector 62',
];

// ─── Helpers ────────────────────────────────────────────────

const inr = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');
const lakh = (n: number) =>
  n >= 100000 ? '₹' + (n / 100000).toFixed(n >= 1000000 ? 1 : 2).replace(/\.?0+$/, '') + ' L' : inr(n);

const EARTH_KM = 6371;
function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const p = Math.PI / 180;
  const dLat = (bLat - aLat) * p;
  const dLng = (bLng - aLng) * p;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(aLat * p) * Math.cos(bLat * p) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_KM * Math.asin(Math.sqrt(h));
}
/** Gurgaon traffic, roughly: 22 km/h plus finding parking. */
const driveMinutes = (km: number) => Math.max(5, Math.round((km / 22) * 60 + 4));

function mapSrc(lat: number, lng: number, pad: number) {
  const bbox = [lng - pad * 1.4, lat - pad, lng + pad * 1.4, lat + pad].map((v) => v.toFixed(4)).join('%2C');
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat.toFixed(5)}%2C${lng.toFixed(5)}`;
}

// ─── Page ───────────────────────────────────────────────────

export default function HomePage() {
  const router = useRouter();
  const { currentUser, openAuthModal } = useStore();

  const [mood, setMood] = useState<Mood>('none');
  const [scrolled, setScrolled] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const say = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  // Where a "post it" button should actually take you.
  const goPost = useCallback(() => {
    if (currentUser?.role === 'corporate') router.push('/corporate/dashboard');
    else if (currentUser?.role === 'vendor') router.push('/vendor/dashboard');
    else if (currentUser?.role === 'admin') router.push('/admin/dashboard');
    else openAuthModal();
  }, [currentUser, router, openAuthModal]);

  // ── Reveal on scroll ──────────────────────────────────────
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('.rv'));
    if (!('IntersectionObserver' in window)) {
      nodes.forEach((n) => n.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Calculator ────────────────────────────────────────────
  const [cat, setCat] = useState<CalcCategory>('outing');
  const [headcount, setHeadcount] = useState(35);
  const [budgetPerHead, setBudgetPerHead] = useState(CALC.outing.bph);
  const [extras, setExtras] = useState<Set<number>>(new Set());

  const chooseCategory = useCallback((next: CalcCategory) => {
    setCat(next);
    setBudgetPerHead(CALC[next].bph);
    setExtras(new Set());
  }, []);

  const config = CALC[cat];
  const base = headcount * budgetPerHead;
  const extrasTotal = [...extras].reduce((sum, i) => sum + (config.extras[i]?.[1] ?? 0) * headcount, 0);
  const total = base + extrasTotal;

  // ── Mood branching ────────────────────────────────────────
  const pickMood = useCallback((next: 'a' | 'b', scrollToBranch: boolean) => {
    setMood(next);
    setCat(MOOD_COPY[next].cat);
    setBudgetPerHead(CALC[MOOD_COPY[next].cat].bph);
    setExtras(new Set());
    if (scrollToBranch) {
      setTimeout(() => document.getElementById('branch')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80);
    }
  }, []);

  const branch = mood === 'none' ? null : MOOD_COPY[mood];

  // ── Near you ──────────────────────────────────────────────
  const [origin, setOrigin] = useState<{ lat: number; lng: number; label: string }>({
    lat: HUBS[0].lat,
    lng: HUBS[0].lng,
    label: HUBS[0].n,
  });
  const [geoBusy, setGeoBusy] = useState(false);
  const [geoMsg, setGeoMsg] = useState('Showing hubs by distance from DLF Cyber City (default).');
  const [mapView, setMapView] = useState({ lat: HUBS[0].lat, lng: HUBS[0].lng, label: HUBS[0].n, pad: 0.09 });

  const rankedHubs = useMemo(
    () =>
      HUBS.map((h) => ({ ...h, km: distanceKm(origin.lat, origin.lng, h.lat, h.lng) })).sort((a, b) => a.km - b.km),
    [origin]
  );

  const locate = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGeoMsg('Location isn’t available in this browser — pick your area instead.');
      return;
    }
    setGeoBusy(true);
    setGeoMsg('Finding you… (your browser will ask for permission)');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoBusy(false);
        const { latitude: lat, longitude: lng } = pos.coords;
        const nearest = Math.min(...HUBS.map((h) => distanceKm(lat, lng, h.lat, h.lng)));
        setGeoMsg(
          nearest > 120
            ? 'You’re a fair way from Delhi NCR right now — showing hubs by distance anyway. We’re Gurgaon-first for the pilot.'
            : 'Sorted by distance from where you are right now.'
        );
        setOrigin({ lat, lng, label: 'You are here' });
        setMapView({ lat, lng, label: 'You are here', pad: 0.09 });
        say('📍 Hubs sorted by distance from you');
      },
      (err) => {
        setGeoBusy(false);
        const why =
          err.code === err.PERMISSION_DENIED
            ? 'No worries — location permission was declined.'
            : err.code === err.TIMEOUT
              ? 'Location timed out.'
              : 'Couldn’t get your location.';
        setGeoMsg(`${why} Pick your area from the dropdown instead — works just as well.`);
      },
      { timeout: 9000, maximumAge: 120000 }
    );
  };

  // ── Real venues, straight from the directory ──────────────
  const sportsVenues = useMemo(
    () => GURUGRAM_PRESEEDED_VENUES.filter((v) => v.category === 'sports'),
    []
  );
  const marquee = useMemo(() => {
    const items = sportsVenues.map((v) => ({ name: v.name, detail: `${v.locality} · ${v.city}` }));
    return [...items, ...items];
  }, [sportsVenues]);

  const confetti = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
        left: `${(i * 37) % 100}%`,
        delay: `${-((i * 0.9) % 7)}s`,
        duration: `${6 + ((i * 1.7) % 5)}s`,
        background: ['#fff', '#FFC83D', '#5CD48F', '#FFE3D3'][i % 4],
        scale: 0.6 + ((i * 0.13) % 1),
      })),
    []
  );

  return (
    <div className="landing">
      {/* ════════ NAV ════════ */}
      <header className={`nav${scrolled ? ' scrolled' : ''}`}>
        <div className="wrap">
          <a href="#top" className="logo" aria-label="Community of Employees home">
            <span className="logo-badge">COE</span>
            <span>
              Community of Employees
              <small>Gurgaon · Delhi NCR</small>
            </span>
          </a>
          <nav className="nav-links" aria-label="Sections">
            <a href="#how">How it works</a>
            <a href="#sports">Sports</a>
            <a href="#calc">Cost calculator</a>
            <a href="#near">Near you</a>
            <a href="#vendors">For venues</a>
          </nav>
          <button type="button" className="btn btn-saffron" onClick={goPost}>
            {currentUser ? 'Go to my dashboard' : 'Post for your team'} <span className="arr">→</span>
          </button>
        </div>
      </header>

      {/* ════════ HERO ════════ */}
      <section className="hero" id="top">
        <div className="hero-bg" aria-hidden="true">
          <div className="blob b1" />
          <div className="blob b2" />
          <div className="blob b3" />
        </div>
        <div className="wrap">
          <div className="hero-top">
            <div className="pill rv">
              <span className="dot">📍</span> Gurgaon &amp; Delhi NCR · Cyber City to Sohna Road
            </div>
            <h1 className="rv rv-d1">
              <span className="line">Office party. Sports day. Offsite.</span>
              <span className="line">
                Someone has to plan it. <span className="mark">Ab akele nahi.</span>
              </span>
            </h1>
            <p className="lead rv rv-d2">
              Post what your team needs — headcount, budget, vibe — and verified venues across Gurgaon bid live
              for it. You pick. Done. Back to your actual job.
            </p>
          </div>

          <div className="hero-cards">
            <div
              className={`mood a rv rv-d2${mood === 'a' ? ' sel' : ''}`}
              role="button"
              tabIndex={0}
              onClick={() => pickMood('a', true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  pickMood('a', true);
                }
              }}
            >
              <span className="emo" aria-hidden="true">🏏</span>
              <span className="tag">🔥 Captain energy</span>
              <h2>
                Apart from work, are <em>YOU</em> the one organizing your team’s next sports meet?
              </h2>
              <p>
                Box cricket league, turf football Saturday, badminton doubles — you’ve got the WhatsApp group
                ready. Now get the venue, umpires and jerseys sorted without 40 phone calls.
              </p>
              <span className="go">
                Yes, that’s me <span className="arr">→</span>
              </span>
            </div>

            <div
              className={`mood b rv rv-d3${mood === 'b' ? ' sel' : ''}`}
              role="button"
              tabIndex={0}
              onClick={() => pickMood('b', true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  pickMood('b', true);
                }
              }}
            >
              <span className="emo" aria-hidden="true">😮‍💨</span>
              <span className="tag">😩 Bas ho gaya</span>
              <h2>Got roped into planning the office party again… and dreading it?</h2>
              <p>
                “Tu hi kar le na, tujhe pata hai sab.” Diwali party, farewell dinner, Friday team night — you
                didn’t sign up for this. Post it in 2 minutes and let venues chase <em>you</em>.
              </p>
              <span className="go">
                Ugh, yes. Help. <span className="arr">→</span>
              </span>
            </div>
          </div>

          <p className="hero-note rv rv-d4">
            Same product either way. We just get it — the two moods are very different.
          </p>

          <div className="chips rv rv-d4" aria-label="Things people post">
            {HERO_CHIPS.map((c) => (
              <span className="chip" key={c}>{c}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ BRANCH ════════ */}
      <section className="branch" id="branch" data-mood={mood}>
        <div className="wrap">
          <div className="branch-card rv rv-scale">
            <div>
              <div className="branch-switch" role="tablist" aria-label="Pick your situation">
                <button
                  type="button"
                  role="tab"
                  aria-selected={mood === 'a'}
                  className={mood === 'a' ? 'on' : ''}
                  onClick={() => pickMood('a', false)}
                >
                  🏏 Sports organizer
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mood === 'b'}
                  className={mood === 'b' ? 'on' : ''}
                  onClick={() => pickMood('b', false)}
                >
                  🎉 Party planner (reluctant)
                </button>
              </div>
              <h2 className="swap">
                {branch ? branch.title : 'Pick your situation above — we’ll talk accordingly.'}
              </h2>
              <p className="lead swap">
                {branch
                  ? branch.lead
                  : 'Both roads lead to the same place: you post once, venues bid live, you choose. But how we say it depends on how your week’s going.'}
              </p>
              <div className="branch-cta">
                <button type="button" className="btn btn-primary swap" onClick={goPost}>
                  {branch ? branch.cta : 'Post a requirement'} <span className="arr">→</span>
                </button>
                <a href="#calc" className="btn btn-ghost" >
                  See what it’ll cost
                </a>
              </div>
            </div>
            <ul className="branch-list swap">
              {(branch
                ? branch.list
                : ([
                    ['📝', 'Post once — category, headcount, date, budget. Two minutes, phone se bhi.'],
                    ['⚡', 'Verified venues bid live against each other. Typically you have quotes within a few hours.'],
                    ['✅', 'Compare itemized quotes, lock one. No broker, no “sir final price bata raha hoon”.'],
                  ] as [string, string][])
              ).map(([icon, text]) => (
                <li key={text}>
                  <span className="ic">{icon}</span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ════════ HOW ════════ */}
      <section id="how">
        <div className="wrap">
          <div className="eyebrow rv">How it works</div>
          <h2 className="rv rv-d1">
            Post for your team. <span className="hi">Let venues fight for it.</span>
          </h2>
          <p className="lead rv rv-d2" style={{ marginTop: '1rem' }}>
            No vendor dashboards, no procurement forms. It’s built for one person with a team WhatsApp group and
            a deadline.
          </p>

          <div className="steps">
            {[
              {
                tint: 'var(--saffron-soft)',
                num: '01',
                ic: '📝',
                h: 'Post your team’s requirement',
                p: '“Team outing, 35 people, Saturday 20th, ₹1,800/head, somewhere near Golf Course Road.” That’s it. Rough is fine — venues ask if they need more.',
                t: '⏱ ~2 min',
                d: '',
              },
              {
                tint: 'var(--turf-soft)',
                num: '02',
                ic: '📡',
                h: 'Verified venues bid live',
                p: 'Turfs, clubs, restaurants and caterers in your area see it and submit itemized quotes — competing with each other, not negotiating with you.',
                t: '⏱ usually within a few hours',
                d: 'rv-d1',
              },
              {
                tint: 'var(--sky-soft)',
                num: '03',
                ic: '🎯',
                h: 'Compare, pick, lock',
                p: 'See menus, ground rentals, umpire charges, DJ, jerseys — line by line. Pick one, and the price is locked. Go tell the group it’s sorted.',
                t: '⏱ one tap',
                d: 'rv-d2',
              },
            ].map((s) => (
              <div className={`step rv ${s.d}`} key={s.num} style={{ ['--tint' as string]: s.tint }}>
                <span className="num">{s.num}</span>
                <div className="ic">{s.ic}</div>
                <h3>{s.h}</h3>
                <p>{s.p}</p>
                <span className="time">{s.t}</span>
              </div>
            ))}
          </div>

          <div className="whocan">
            <div className="who lead-path rv">
              <span className="ic">🙋</span>
              <div>
                <h3>Any employee can post — for their own team</h3>
                <p>
                  You don’t need to be HR. You don’t need approval to <em>ask</em>. Post for your pod, your
                  floor, your cricket gang, your Friday crew. Bring the quotes to whoever holds the budget, or
                  split it yourselves.
                </p>
              </div>
            </div>
            <div className="who alt-path rv rv-d1">
              <span className="ic">🏢</span>
              <div>
                <h3>HR / admin? Post company-wide too</h3>
                <p>
                  Company accounts can post for the whole org — annual day, town hall dinner, 300-pax offsite —
                  with itemized, GST-ready invoicing. Same flow, bigger numbers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ SPORTS ════════ */}
      <section className="sports" id="sports">
        <div className="wrap">
          <div className="eyebrow rv">Sports leagues</div>
          <h2 className="rv rv-d1">
            Gurgaon’s turfs and courts are the best part. <span className="hi-turf">So we lead with them.</span>
          </h2>
          <p className="lead rv rv-d2" style={{ marginTop: '1rem' }}>
            Floodlit box cricket at 9pm on Sohna Road. Turf football walkable from Cyber City. Badminton courts
            on wooden floors. Pickleball, because it’s 2026. All bidding for your league.
          </p>

          <div className="sport-grid">
            <div className="sport cric rv">
              <div className="art" aria-hidden="true">
                <svg viewBox="0 0 300 300" preserveAspectRatio="xMidYMid slice">
                  <ellipse cx="150" cy="330" rx="240" ry="120" fill="rgba(255,255,255,.08)" />
                  <rect x="120" y="120" width="60" height="220" rx="4" fill="rgba(255,255,255,.12)" />
                  <line x1="0" y1="0" x2="300" y2="300" stroke="rgba(255,255,255,.08)" strokeWidth="40" />
                  <circle cx="230" cy="70" r="6" fill="rgba(255,255,255,.5)" />
                </svg>
              </div>
              <span className="big" aria-hidden="true">🏏</span>
              <h3>Box cricket</h3>
              <p>6–8 team leagues, floodlit, umpires + gear + custom jerseys as line items.</p>
              <div className="fmt"><span>Night slots</span><span>Custom jerseys</span><span>Umpires</span></div>
            </div>

            <div className="sport ftbl rv rv-d1">
              <div className="art" aria-hidden="true">
                <svg viewBox="0 0 300 300" preserveAspectRatio="xMidYMid slice">
                  <rect x="20" y="40" width="260" height="360" rx="8" fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="3" />
                  <circle cx="150" cy="220" r="50" fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="3" />
                  <line x1="20" y1="220" x2="280" y2="220" stroke="rgba(255,255,255,.18)" strokeWidth="3" />
                  <rect x="90" y="40" width="120" height="50" fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="3" />
                </svg>
              </div>
              <span className="big" aria-hidden="true">⚽</span>
              <h3>Turf football</h3>
              <p>5-a-side and 7-a-side on FIFA-grade turf. Some grounds are a walk from the rapid metro.</p>
              <div className="fmt"><span>5s / 7s</span><span>Floodlit</span><span>Near metro</span></div>
            </div>

            <div className="sport badm rv rv-d2">
              <div className="art" aria-hidden="true">
                <svg viewBox="0 0 300 300" preserveAspectRatio="xMidYMid slice">
                  <g stroke="rgba(255,255,255,.16)" strokeWidth="3" fill="none">
                    <rect x="40" y="-40" width="220" height="400" />
                    <line x1="40" y1="160" x2="260" y2="160" strokeWidth="5" />
                    <line x1="150" y1="-40" x2="150" y2="360" />
                    <line x1="40" y1="60" x2="260" y2="60" />
                    <line x1="40" y1="260" x2="260" y2="260" />
                  </g>
                </svg>
              </div>
              <span className="big" aria-hidden="true">🏸</span>
              <h3>Badminton</h3>
              <p>Wooden and mat courts, gear rental, doubles brackets sorted. The office’s most fiercely contested sport.</p>
              <div className="fmt"><span>Doubles</span><span>Gear rental</span><span>AC courts</span></div>
            </div>

            <div className="sport pick rv rv-d3">
              <div className="art" aria-hidden="true">
                <svg viewBox="0 0 300 300" preserveAspectRatio="xMidYMid slice">
                  <g fill="rgba(255,255,255,.12)">
                    <circle cx="60" cy="60" r="10" /><circle cx="120" cy="90" r="10" />
                    <circle cx="200" cy="50" r="10" /><circle cx="250" cy="130" r="10" />
                    <circle cx="80" cy="180" r="10" /><circle cx="170" cy="200" r="10" />
                    <circle cx="240" cy="250" r="10" /><circle cx="40" cy="270" r="10" />
                  </g>
                  <rect x="30" y="-20" width="240" height="340" rx="10" fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="3" />
                </svg>
              </div>
              <span className="big" aria-hidden="true">🥒</span>
              <h3>Pickleball &amp; padel</h3>
              <p>Low skill floor, high trash-talk ceiling. Perfect for mixed teams where half the office “doesn’t play sports”.</p>
              <div className="fmt"><span>Beginner-friendly</span><span>Padel too</span><span>Evening slots</span></div>
            </div>
          </div>

          <div className="marquee rv" aria-label="Sports venues in the COE directory">
            <div className="marquee-track">
              {marquee.map((v, i) => (
                <div className="venue" key={`${v.name}-${i}`}>
                  <b>{v.name}</b>
                  <span>{v.detail}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="foot-note">
            {sportsVenues.length} sports venues currently in the directory — the strip above is the live list.
            Need one that isn’t on it? Tell us the name; we onboard them for your bid.
          </p>
        </div>
      </section>

      {/* ════════ CALCULATOR ════════ */}
      <section id="calc">
        <div className="wrap">
          <div className="eyebrow rv">Live cost calculator</div>
          <h2 className="rv rv-d1">
            “Bhai, roughly kitna lagega?” <span className="hi">Here, roughly.</span>
          </h2>
          <p className="lead rv rv-d2" style={{ marginTop: '1rem' }}>
            Before you go asking finance or collecting ₹500 from everyone — a realistic Gurgaon ballpark. Pick a
            category, drag the sliders.
          </p>

          <div className="calc-wrap">
            <div className="panel rv">
              <div className="cat-grid" role="tablist" aria-label="Event category">
                {(Object.keys(CALC) as CalcCategory[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={cat === key}
                    className={`cat${cat === key ? ' on' : ''}`}
                    onClick={() => chooseCategory(key)}
                  >
                    <span className="e">{CALC[key].emoji}</span>
                    {CALC[key].label}
                  </button>
                ))}
              </div>

              <div className="field">
                <label htmlFor="hc">
                  Headcount <output>{headcount}</output>
                </label>
                <input
                  type="range"
                  id="hc"
                  min={8}
                  max={300}
                  step={1}
                  value={headcount}
                  onChange={(e) => setHeadcount(Number(e.target.value))}
                  style={{ ['--p' as string]: `${((headcount - 8) / (300 - 8)) * 100}%` }}
                />
                <div className="presets">
                  {[[12, 'just the pod'], [35, 'the floor'], [80, 'the whole office'], [120, 'league size']].map(
                    ([n, why]) => (
                      <button type="button" key={String(n)} onClick={() => setHeadcount(Number(n))}>
                        {n} · {why}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="field">
                <label htmlFor="bph">
                  Budget per head <output>{inr(budgetPerHead)}</output>
                </label>
                <input
                  type="range"
                  id="bph"
                  min={500}
                  max={6000}
                  step={50}
                  value={budgetPerHead}
                  onChange={(e) => setBudgetPerHead(Number(e.target.value))}
                  style={{ ['--p' as string]: `${((budgetPerHead - 500) / (6000 - 500)) * 100}%` }}
                />
                <div className="hint">{config.hint}</div>
              </div>

              <div className="field">
                <label>
                  Add-ons{' '}
                  <span style={{ fontWeight: 500, color: 'var(--muted)', fontSize: '.8rem' }}>
                    indicative, per head
                  </span>
                </label>
                <div className="presets">
                  {config.extras.map(([name, price], i) => {
                    const on = extras.has(i);
                    return (
                      <button
                        type="button"
                        key={name}
                        aria-pressed={on}
                        onClick={() =>
                          setExtras((prev) => {
                            const next = new Set(prev);
                            if (next.has(i)) next.delete(i);
                            else next.add(i);
                            return next;
                          })
                        }
                        style={on ? { background: 'var(--sun)', borderColor: 'var(--sun)' } : undefined}
                      >
                        + {name} · ₹{price}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="result rv rv-d1">
              <div className="lbl">
                Estimated total · {config.label} · {headcount} people
              </div>
              <div className="total">{inr(total)}</div>
              <div className="range">
                Typical bids land between {lakh(total * 0.92)} and {lakh(total * 1.05)}
                {total >= 100000 ? ` (${inr(total * 0.92)} – ${inr(total * 1.05)})` : ''}
              </div>
              <div className="rows">
                <div className="row"><span>Your budget × headcount</span><b>{inr(base)}</b></div>
                <div className="row"><span>Add-ons</span><b>{inr(extrasTotal)}</b></div>
                <div className="row good">
                  <span>Live bidding usually shaves</span>
                  <b>{inr(total * 0.05)} – {inr(total * 0.15)}</b>
                </div>
              </div>
              <p className="includes">{config.includes}</p>
              <p className="disc">
                Indicative ranges based on what venues in Gurgaon typically bid on COE for similar posts. Your
                actual quotes depend on date, area and what you ask for. Savings shown as a 5–15% band — real
                bids have landed both above and below it.
              </p>
              <button type="button" className="btn" onClick={goPost}>
                Post this requirement <span className="arr">→</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ NEAR YOU ════════ */}
      <section id="near" style={{ background: 'var(--cream-2)' }}>
        <div className="wrap">
          <div className="eyebrow rv">Near you</div>
          <h2 className="rv rv-d1">
            Where’s your office? <span className="hi">We’ll find the closest hub.</span>
          </h2>
          <p className="lead rv rv-d2" style={{ marginTop: '1rem' }}>
            Venues bid by hub, so a Cyber City team gets Cyber City–side quotes, not a 90-minute NH-8 crawl. Use
            your location, or just pick your area.
          </p>

          <div className="near-wrap">
            <div className="rv">
              <div className="near-ctl">
                <button className="btn btn-primary" type="button" onClick={locate} disabled={geoBusy}>
                  📍 Use my location
                </button>
                <select
                  aria-label="Or pick your area"
                  value=""
                  onChange={(e) => {
                    const h = HUBS[Number(e.target.value)];
                    if (!h) return;
                    setGeoMsg(`Sorted by distance from ${h.n}.`);
                    setOrigin({ lat: h.lat, lng: h.lng, label: h.n });
                    setMapView({ lat: h.lat, lng: h.lng, label: h.n, pad: 0.09 });
                  }}
                >
                  <option value="">…or pick your area</option>
                  {HUBS.map((h, i) => (
                    <option key={h.n} value={i}>{h.n}</option>
                  ))}
                </select>
              </div>
              <div className={`status${geoBusy ? ' busy' : ''}`}>
                <span className="spin" />
                <span>{geoMsg}</span>
              </div>
              <ul className="hubs">
                {rankedHubs.map((h, i) => (
                  <li
                    className={`hub${i === 0 ? ' top' : ''}`}
                    key={h.n}
                    onClick={() => setMapView({ lat: h.lat, lng: h.lng, label: h.n, pad: 0.035 })}
                  >
                    <span className="rank">{i + 1}</span>
                    <div>
                      <b>{h.n}{i === 0 ? ' · closest' : ''}</b>
                      <span>{h.d}</span>
                    </div>
                    <div className="dist">
                      {h.km < 1 ? '< 1' : h.km.toFixed(h.km < 10 ? 1 : 0)} km
                      <small>~{driveMinutes(h.km)} min drive</small>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="map-box rv rv-d1">
              <iframe
                title="Map of COE hubs"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={mapSrc(mapView.lat, mapView.lng, mapView.pad)}
              />
              <div className="map-cap">📍 {mapView.label} · OpenStreetMap</div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ SAMPLE FEED ════════ */}
      <section id="feed">
        <div className="wrap">
          <div className="eyebrow rv">What people post</div>
          <h2 className="rv rv-d1">
            Real-shaped requirements. <span className="hi">Zero corporate-speak.</span>
          </h2>
          <div className="feed">
            {[
              { d: '', k: '🏏 Sports', hub: 'Sohna Road hub', h: 'Box cricket league, 6 teams, two Saturdays', p: '~70 players. Floodlit slots after 6pm, need umpires and jerseys with team names. Budget around ₹2.3L all-in.', n: 3 },
              { d: 'rv-d1', k: '🪔 Party', hub: 'Cyber City hub', h: 'Diwali party for our floor, ~45 people', p: 'Veg-heavy menu, one round of mocktails/cocktails, a DJ for 2 hours, walkable from the rapid metro. ₹1,500/head.', n: 2 },
              { d: 'rv-d2', k: '🚌 Outing', hub: 'Golf Course Ext hub', h: 'Day outing for a 28-person team, weekday', p: 'Something active in the morning (pickleball / turf), lunch, back by 5. Manager wants “team bonding” but we want fun. ₹2,000/head.', n: 3 },
            ].map((post) => (
              <div className={`post rv ${post.d}`} key={post.h}>
                <div className="meta">
                  <span className="k">{post.k}</span>
                  <span>{post.hub}</span>
                </div>
                <h3>{post.h}</h3>
                <p>{post.p}</p>
                <div className="bids">
                  <span className="av">{Array.from({ length: post.n }, (_, i) => <i key={i} />)}</span> {post.n} venues bidding
                </div>
              </div>
            ))}
          </div>
          <div className="sample-lbl">
            ✎ Illustrative examples — a template for what real posts look like, not live activity.
          </div>
        </div>
      </section>

      {/* ════════ TRUST ════════ */}
      <section className="trust" id="trust">
        <div className="wrap">
          <div className="eyebrow rv">The boring-but-important bit</div>
          <h2 className="rv rv-d1">Why your finance team will also be okay with this.</h2>
          <p className="lead rv rv-d2" style={{ marginTop: '1rem' }}>
            You get the fun part. We do the paperwork part — so nobody has to chase a “cash only, bhaiya” venue
            for a bill three weeks later.
          </p>
          <div className="trust-grid">
            {[
              { d: '', ic: '🧾', h: 'GSTIN-verified vendors', p: 'Every venue’s tax registration is checked before they can bid. Proper invoices, proper reimbursement.' },
              { d: 'rv-d1', ic: '🔍', h: 'Reviewed before they can bid', p: 'Every venue is checked and approved by an admin before a single quote reaches you.' },
              { d: 'rv-d2', ic: '📋', h: 'Itemized quotes', p: 'Ground rental, umpires, food, DJ, jerseys — as separate lines. Drop what you don’t want.' },
              { d: 'rv-d3', ic: '🔒', h: 'Price lock, no surge', p: 'The bid you accept is the bill you get. No peak-hour premium, no cover charge surprise, no “sir woh extra tha”.' },
            ].map((t) => (
              <div className={`tcard rv ${t.d}`} key={t.h}>
                <div className="ic">{t.ic}</div>
                <h3>{t.h}</h3>
                <p>{t.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ VENDORS ════════ */}
      <section className="vendor" id="vendors">
        <div className="wrap vendor-in">
          <div>
            <div className="eyebrow rv">For venues, turfs, caterers</div>
            <h2 className="rv rv-d1">Run a turf, club or restaurant in NCR? Corporate groups are posting.</h2>
            <ul className="vlist rv rv-d2">
              <li>See real requirements with headcount, budget and date — bid only on what suits you.</li>
              <li>No listing fee, no lead-selling. You quote directly; no broker in between.</li>
              <li>Get verified once (GSTIN + review) and bid on every post in your hub.</li>
            </ul>
            <div style={{ marginTop: '1.5rem' }} className="rv rv-d3">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  say('Venue registration: GSTIN + admin review, then you can bid on every post in your hub.');
                  goPost();
                }}
              >
                Register your venue <span className="arr">→</span>
              </button>
            </div>
          </div>
          <div className="panel rv rv-d1" style={{ background: 'var(--paper)' }}>
            <div style={{ fontSize: '.75rem', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 700 }}>
              Hubs we’re onboarding in
            </div>
            <ul className="vlist" style={{ marginTop: '.8rem' }}>
              {HUBS.map((h) => (
                <li key={h.n}>
                  {h.n} <span style={{ color: 'var(--muted)' }}>· {h.d.split(' · ')[1] || h.d}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ════════ FINAL CTA ════════ */}
      <section className="final" id="post">
        <div className="wrap">
          <div className="final-card rv rv-scale">
            <div className="confetti" aria-hidden="true">
              {confetti.map((c, i) => (
                <i
                  key={i}
                  style={{
                    left: c.left,
                    animationDelay: c.delay,
                    animationDuration: c.duration,
                    background: c.background,
                    transform: `scale(${c.scale})`,
                  }}
                />
              ))}
            </div>
            <h2>{branch ? branch.final : 'Post it once. Then go get coffee.'}</h2>
            <p>
              {branch
                ? branch.finalLead
                : 'Tell us category, headcount, date and rough budget. Venues near your office will bid. You’ll be the person who “just sorted it”, and nobody needs to know it took two minutes.'}
            </p>
            <div style={{ display: 'flex', gap: '.8rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button type="button" className="btn btn-primary" onClick={goPost}>
                Post for my team <span className="arr">→</span>
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  if (currentUser?.role === 'vendor') router.push('/vendor/dashboard');
                  else openAuthModal();
                }}
              >
                I run a venue
              </button>
            </div>
            <p style={{ marginTop: '1.4rem', fontSize: '.85rem', opacity: 0.85 }}>
              Questions first?{' '}
              <a href="mailto:contact@communityofemployees.com" style={{ textDecoration: 'underline' }}>
                contact@communityofemployees.com
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* ════════ FOOTER ════════ */}
      <footer>
        <div className="wrap">
          <div className="foot">
            <div>
              <a href="#top" className="logo" style={{ marginBottom: '.8rem' }}>
                <span className="logo-badge">COE</span>
                <span>
                  Community of Employees
                  <small>Gurgaon · Delhi NCR</small>
                </span>
              </a>
              <p>
                A marketplace where employees and companies post what their team needs — parties, outings,
                sports leagues, dinners — and verified venues bid live for it.
              </p>
              <p style={{ marginTop: '.8rem', color: 'var(--muted)', fontSize: '.8rem' }}>
                Building 10B, DLF Cyber City, Phase II, Gurugram, Haryana 122002
              </p>
            </div>
            <div>
              <h4>Product</h4>
              <ul>
                <li><a href="#how">How it works</a></li>
                <li><a href="#calc">Cost calculator</a></li>
                <li><Link href="/vendors">Vendors near you</Link></li>
                <li><a href="#vendors">For venues</a></li>
              </ul>
            </div>
            <div>
              <h4>Legal</h4>
              <ul>
                <li><Link href="/legal/terms">Terms of use</Link></li>
                <li><Link href="/legal/privacy">Privacy policy</Link></li>
                <li><Link href="/legal/disclaimer">Disclaimer</Link></li>
                <li><a href="mailto:contact@communityofemployees.com">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="copy">
            <span>© {new Date().getFullYear()} Community of Employees. Currently live in Gurgaon.</span>
            <span>Built in Gurugram.</span>
          </div>
        </div>
      </footer>

      <div className={`toast${toast ? ' show' : ''}`}>{toast}</div>
    </div>
  );
}
