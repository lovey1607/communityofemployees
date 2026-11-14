'use client';
// components/communities/HeroScene.tsx — the animated hero visual.
// One scene per category, swapped with a spring when the visitor picks a
// chip. Pure inline SVG + CSS keyframes (no images, no libraries beyond
// framer-motion which the repo already ships). Respects reduced motion.
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { CommunityCategory } from '@/lib/communities';

export const SCENE_COPY: Record<CommunityCategory | 'all', { kicker: string; line: string }> = {
  all: { kicker: 'pick a vibe ↓', line: 'Find your people in' },
  running: { kicker: '5am club, no excuses', line: 'Find your run crew in' },
  cycling: { kicker: 'dawn rides, big breakfasts', line: 'Find your riders in' },
  sports: { kicker: 'turf, courts, trash talk', line: 'Find your squad in' },
  fitness: { kicker: 'lift, plunge, repeat', line: 'Find your gym people in' },
  outdoors: { kicker: 'sunday = trail', line: 'Find your hikers in' },
  tech: { kicker: 'ship on saturdays', line: 'Find your builders in' },
  startup: { kicker: 'founders who actually meet', line: 'Find your founders in' },
  creative: { kicker: 'jam, sketch, open mic', line: 'Find your creatives in' },
  books: { kicker: 'silent reading, loud opinions', line: 'Find your readers in' },
  food: { kicker: 'dinner with strangers', line: 'Find your foodies in' },
  social: { kicker: 'new city, new friends', line: 'Find your people in' },
  games: { kicker: 'board games till 2am', line: 'Find your game night in' },
  professional: { kicker: 'network, minus the cringe', line: 'Find your circle in' },
  wellbeing: { kicker: 'slow sundays', line: 'Find your calm in' },
  cause: { kicker: 'show up, do good', line: 'Find your cause in' },
  language: { kicker: 'parlez, hablar, bolo', line: 'Find your language swap in' },
  parents: { kicker: 'nap-time friendly', line: 'Find your parent gang in' },
  pets: { kicker: 'dogs welcome, obviously', line: 'Find your pack in' },
  other: { kicker: 'pick a vibe ↓', line: 'Find your people in' },
};

const W = '#fff';

function Runner() {
  return (
    <g className="hs-runner">
      <g className="hs-bob">
        <circle cx="150" cy="58" r="14" fill={W} />
        <path d="M150 72 L146 118" stroke={W} strokeWidth="9" strokeLinecap="round" />
        <path className="hs-arm hs-arm-a" d="M148 84 L178 100" stroke={W} strokeWidth="8" strokeLinecap="round" />
        <path className="hs-arm hs-arm-b" d="M148 84 L118 96" stroke={W} strokeWidth="8" strokeLinecap="round" />
        <path className="hs-leg hs-leg-a" d="M146 118 L172 150 L186 176" stroke={W} strokeWidth="9" strokeLinecap="round" fill="none" />
        <path className="hs-leg hs-leg-b" d="M146 118 L126 150 L108 170" stroke={W} strokeWidth="9" strokeLinecap="round" fill="none" />
      </g>
      <g className="hs-lines" stroke="rgba(255,255,255,.55)" strokeWidth="4" strokeLinecap="round">
        <path d="M60 80 L100 80" /><path d="M48 100 L96 100" /><path d="M66 120 L98 120" />
      </g>
      <path className="hs-ground" d="M40 182 H260" stroke="rgba(255,255,255,.35)" strokeWidth="3" strokeDasharray="14 12" />
    </g>
  );
}
function Cyclist() {
  return (
    <g>
      <g className="hs-wheel" style={{ transformOrigin: '96px 150px' }}><circle cx="96" cy="150" r="28" fill="none" stroke={W} strokeWidth="6" /><path d="M96 122V178M68 150H124M76 130L116 170M116 130L76 170" stroke={W} strokeWidth="3" /></g>
      <g className="hs-wheel" style={{ transformOrigin: '204px 150px' }}><circle cx="204" cy="150" r="28" fill="none" stroke={W} strokeWidth="6" /><path d="M204 122V178M176 150H232M184 130L224 170M224 130L184 170" stroke={W} strokeWidth="3" /></g>
      <path d="M96 150 L140 150 L160 108 L204 150 M140 150 L128 108 L160 108" stroke={W} strokeWidth="6" fill="none" strokeLinejoin="round" />
      <g className="hs-bob"><circle cx="176" cy="66" r="13" fill={W} /><path d="M172 80 L150 110 L128 108" stroke={W} strokeWidth="8" strokeLinecap="round" fill="none" /><path d="M150 110 L140 150" stroke={W} strokeWidth="8" strokeLinecap="round" /></g>
      <path className="hs-ground" d="M30 182 H270" stroke="rgba(255,255,255,.35)" strokeWidth="3" strokeDasharray="14 12" />
    </g>
  );
}
function Ball() {
  return (
    <g>
      <ellipse className="hs-shadow" cx="150" cy="178" rx="34" ry="7" fill="rgba(0,0,0,.35)" />
      <g className="hs-bounce"><circle cx="150" cy="110" r="42" fill={W} /><path d="M150 68c-22 14-22 70 0 84M150 68c22 14 22 70 0 84M108 110h84" stroke="#0E0C0B" strokeWidth="4" fill="none" /></g>
      <path d="M40 182 H260" stroke="rgba(255,255,255,.35)" strokeWidth="3" />
      <path d="M60 182 V120 H240 V182" stroke="rgba(255,255,255,.25)" strokeWidth="3" fill="none" />
    </g>
  );
}
function Book() {
  return (
    <g>
      <path d="M60 70 Q150 50 240 70 V170 Q150 150 60 170 Z" fill={W} opacity=".95" />
      <path d="M150 58 V158" stroke="#0E0C0B" strokeWidth="3" />
      <g className="hs-page" style={{ transformOrigin: '150px 110px' }}><path d="M150 58 Q195 50 240 70 V170 Q195 150 150 158 Z" fill="#FFE1E3" /></g>
      <g stroke="rgba(14,12,11,.35)" strokeWidth="3" strokeLinecap="round"><path d="M80 90h50M80 104h46M80 118h52M80 132h40" /><path d="M170 90h50M170 104h46M170 118h52M170 132h40" /></g>
      <g className="hs-float"><circle cx="232" cy="46" r="5" fill={W} /><circle cx="250" cy="34" r="3" fill={W} opacity=".7" /></g>
    </g>
  );
}
function Dice() {
  return (
    <g>
      <g className="hs-roll" style={{ transformOrigin: '110px 120px' }}><rect x="70" y="80" width="80" height="80" rx="14" fill={W} /><g fill="#0E0C0B"><circle cx="92" cy="102" r="7" /><circle cx="128" cy="138" r="7" /><circle cx="110" cy="120" r="7" /></g></g>
      <g className="hs-roll2" style={{ transformOrigin: '200px 130px' }}><rect x="160" y="90" width="80" height="80" rx="14" fill="#FF4D57" /><g fill="#0E0C0B"><circle cx="182" cy="112" r="7" /><circle cx="218" cy="112" r="7" /><circle cx="182" cy="148" r="7" /><circle cx="218" cy="148" r="7" /></g></g>
    </g>
  );
}
function Mountain() {
  return (
    <g>
      <path d="M30 180 L110 70 L150 120 L190 60 L270 180 Z" fill="rgba(255,255,255,.25)" />
      <path d="M30 180 L110 70 L150 120 L190 60 L270 180" stroke={W} strokeWidth="5" fill="none" strokeLinejoin="round" />
      <path d="M190 60 L178 78 L202 78 Z" fill={W} />
      <g className="hs-walk"><circle cx="0" cy="-30" r="8" fill={W} /><path d="M0 -22 V0" stroke={W} strokeWidth="5" strokeLinecap="round" /><path className="hs-leg-a" d="M0 0 L-8 16" stroke={W} strokeWidth="5" strokeLinecap="round" /><path className="hs-leg-b" d="M0 0 L8 16" stroke={W} strokeWidth="5" strokeLinecap="round" /></g>
      <circle className="hs-sun" cx="236" cy="44" r="14" fill="#FFC83D" />
    </g>
  );
}
function Rocket() {
  return (
    <g className="hs-lift">
      <path d="M150 40 C190 80 184 130 176 150 H124 C116 130 110 80 150 40 Z" fill={W} />
      <circle cx="150" cy="104" r="14" fill="#0E0C0B" />
      <path d="M124 130 L96 160 L124 152Z M176 130 L204 160 L176 152Z" fill="#FF4D57" />
      <g className="hs-flame"><path d="M136 152 Q150 196 164 152 Z" fill="#FFC83D" /><path d="M142 152 Q150 182 158 152 Z" fill="#FF4D57" /></g>
      <g className="hs-lines" stroke="rgba(255,255,255,.5)" strokeWidth="4" strokeLinecap="round"><path d="M90 60v28M210 70v22M70 110v18" /></g>
    </g>
  );
}
function Cursor() {
  return (
    <g>
      <rect x="40" y="60" width="220" height="120" rx="16" fill="rgba(255,255,255,.12)" stroke={W} strokeWidth="4" />
      <g stroke={W} strokeWidth="5" strokeLinecap="round"><path d="M64 94 l18 12 -18 12" /><path d="M96 118 h44" /></g>
      <rect className="hs-blink" x="150" y="108" width="12" height="22" fill="#FF4D57" />
      <circle cx="58" cy="76" r="4" fill="#FF4D57" /><circle cx="72" cy="76" r="4" fill="#FFC83D" /><circle cx="86" cy="76" r="4" fill="#5CD48F" />
    </g>
  );
}
function Brush() {
  return (
    <g>
      <path className="hs-stroke" d="M50 150 C90 80 130 170 170 100 S230 90 250 60" stroke="#FF4D57" strokeWidth="18" strokeLinecap="round" fill="none" />
      <path className="hs-stroke hs-stroke-2" d="M60 100 C110 130 150 60 240 130" stroke={W} strokeWidth="10" strokeLinecap="round" fill="none" />
      <circle className="hs-float" cx="240" cy="160" r="12" fill="#6C2BD9" /><circle className="hs-float" cx="70" cy="60" r="8" fill="#FFC83D" />
    </g>
  );
}
function Cup() {
  return (
    <g>
      <path d="M90 100 H200 V150 A40 40 0 0 1 160 190 H130 A40 40 0 0 1 90 150 Z" fill={W} />
      <path d="M200 112 h18 a22 22 0 0 1 0 44 h-18" stroke={W} strokeWidth="10" fill="none" />
      <g className="hs-steam" stroke="rgba(255,255,255,.7)" strokeWidth="6" strokeLinecap="round" fill="none"><path d="M118 84 c-8-12 8-18 0-30" /><path d="M146 84 c-8-12 8-18 0-30" /><path d="M174 84 c-8-12 8-18 0-30" /></g>
    </g>
  );
}
function Bubbles() {
  return (
    <g>
      <g className="hs-pop"><rect x="50" y="60" width="130" height="64" rx="24" fill={W} /><path d="M80 124 l-10 22 30-22z" fill={W} /><circle cx="90" cy="92" r="6" fill="#0E0C0B" /><circle cx="115" cy="92" r="6" fill="#0E0C0B" /><circle cx="140" cy="92" r="6" fill="#0E0C0B" /></g>
      <g className="hs-pop hs-pop-2"><rect x="130" y="130" width="130" height="56" rx="24" fill="#FF4D57" /><path d="M230 186 l10 18 -30-18z" fill="#FF4D57" /><path d="M156 158 h78" stroke={W} strokeWidth="7" strokeLinecap="round" /></g>
    </g>
  );
}
function Dumbbell() {
  return (
    <g className="hs-lift-db">
      <rect x="60" y="112" width="180" height="16" rx="8" fill={W} />
      <rect x="40" y="84" width="34" height="72" rx="10" fill="#FF4D57" /><rect x="226" y="84" width="34" height="72" rx="10" fill="#FF4D57" />
      <rect x="20" y="96" width="22" height="48" rx="8" fill={W} /><rect x="258" y="96" width="22" height="48" rx="8" fill={W} />
    </g>
  );
}
function MapScene() {
  return (
    <g>
      <path d="M30 150 C80 110 110 190 160 130 S230 80 272 100" stroke="rgba(255,255,255,.45)" strokeWidth="5" strokeDasharray="10 10" fill="none" className="hs-dash" />
      <g className="hs-pin" style={{ transformOrigin: '90px 118px' }}><path d="M90 60 c-16 0-26 12-26 26 0 20 26 42 26 42 s26-22 26-42c0-14-10-26-26-26z" fill="#FF4D57" /><circle cx="90" cy="86" r="9" fill="#0E0C0B" /></g>
      <g className="hs-pin hs-pin-2" style={{ transformOrigin: '208px 92px' }}><path d="M208 34 c-16 0-26 12-26 26 0 20 26 42 26 42 s26-22 26-42c0-14-10-26-26-26z" fill="#6C2BD9" /><circle cx="208" cy="60" r="9" fill={W} /></g>
      <g className="hs-pin hs-pin-3" style={{ transformOrigin: '160px 160px' }}><path d="M160 112 c-13 0-21 10-21 21 0 16 21 34 21 34s21-18 21-34c0-11-8-21-21-21z" fill="#FFC83D" /><circle cx="160" cy="133" r="7" fill="#0E0C0B" /></g>
      <circle className="hs-ping" cx="90" cy="128" r="10" fill="none" stroke="#FF4D57" strokeWidth="3" />
      <g className="hs-walk"><circle cx="0" cy="-30" r="8" fill={W} /><path d="M0 -22 V0" stroke={W} strokeWidth="5" strokeLinecap="round" /><path className="hs-leg-a" d="M0 0 L-8 16" stroke={W} strokeWidth="5" strokeLinecap="round" /><path className="hs-leg-b" d="M0 0 L8 16" stroke={W} strokeWidth="5" strokeLinecap="round" /></g>
    </g>
  );
}

const SCENES: Partial<Record<CommunityCategory | 'all', () => React.JSX.Element>> = {
  all: MapScene, running: Runner, cycling: Cyclist, sports: Ball, fitness: Dumbbell, outdoors: Mountain,
  tech: Cursor, startup: Rocket, creative: Brush, books: Book, food: Cup, social: Bubbles, games: Dice,
  professional: Bubbles, wellbeing: Cup, cause: Bubbles, language: Bubbles, parents: Bubbles, pets: Runner, other: MapScene,
};

export function HeroScene({ category }: { category: CommunityCategory | 'all' }) {
  const reduce = useReducedMotion();
  const Scene = SCENES[category] ?? MapScene;
  return (
    <div className={`hs${reduce ? ' hs-still' : ''}`} aria-hidden="true">
      <AnimatePresence mode="wait" initial={false}>
        <motion.svg key={category} viewBox="0 0 300 200" className="hs-svg"
          initial={reduce ? false : { opacity: 0, scale: 0.8, rotate: -6, y: 20 }}
          animate={{ opacity: 1, scale: 1, rotate: 0, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, scale: 0.85, rotate: 6, y: -16 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}>
          <Scene />
        </motion.svg>
      </AnimatePresence>
    </div>
  );
}
