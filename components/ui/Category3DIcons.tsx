'use client';
// ============================================================
// components/ui/Category3DIcons.tsx
// High-end, mature corporate 3D vector icons (Awwwards level)
// Categories: Sports & Tournaments, Food & Party, Trips & Offsites,
// Gifts & Rewards, Dress & Merchandise
// ============================================================

import React from 'react';
import { CategoryType } from '@/lib/types';

export function Sports3DIcon({ className = 'w-12 h-12' }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sportsGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="40%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
        <radialGradient id="trophyCup" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="35%" stopColor="#eab308" />
          <stop offset="85%" stopColor="#b45309" />
          <stop offset="100%" stopColor="#78350f" />
        </radialGradient>
        <filter id="sportsGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#10b981" floodOpacity="0.4" />
        </filter>
      </defs>
      <g filter="url(#sportsGlow)">
        {/* Championship Trophy Cup */}
        <path
          d="M24 20H56V38C56 46.8 48.8 54 40 54C31.2 54 24 46.8 24 38V20Z"
          fill="url(#trophyCup)"
          stroke="#fef08a"
          strokeWidth="1.5"
        />
        {/* Handles */}
        <path
          d="M24 26C16 26 12 32 12 38C12 44 18 48 24 48"
          stroke="#eab308"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M56 26C64 26 68 32 68 38C68 44 62 48 56 48"
          stroke="#eab308"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Stem & Solid Base */}
        <rect x="37" y="54" width="6" height="10" fill="#ca8a04" />
        <rect x="26" y="64" width="28" height="8" rx="3" fill="#0f172a" stroke="#ca8a04" strokeWidth="1.5" />
        <circle cx="40" cy="34" r="5" fill="#fef08a" opacity="0.9" />
        {/* Dynamic Emerald Arc */}
        <path d="M16 16C26 8 54 8 64 16" stroke="url(#sportsGold)" strokeWidth="2.5" strokeLinecap="round" />
      </g>
    </svg>
  );
}

export function FoodParty3DIcon({ className = 'w-12 h-12' }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="partyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fb923c" />
          <stop offset="50%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
        <linearGradient id="glassStem" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>
        <filter id="foodGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#f97316" floodOpacity="0.4" />
        </filter>
      </defs>
      <g filter="url(#foodGlow)">
        {/* Toasting Champagne Flute 1 */}
        <path
          d="M22 18L36 34C38 36.5 38 40 36 42.5L34 44H20L18 42.5C16 40 16 36.5 18 34L22 18Z"
          fill="url(#partyGrad)"
          stroke="rgba(255,255,255,0.7)"
          strokeWidth="1.5"
        />
        <line x1="27" y1="44" x2="27" y2="62" stroke="url(#glassStem)" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="18" y1="62" x2="36" y2="62" stroke="url(#glassStem)" strokeWidth="2.5" strokeLinecap="round" />

        {/* Toasting Champagne Flute 2 (Angled) */}
        <path
          d="M58 18L44 34C42 36.5 42 40 44 42.5L46 44H60L62 42.5C64 40 64 36.5 62 34L58 18Z"
          fill="url(#partyGrad)"
          stroke="rgba(255,255,255,0.7)"
          strokeWidth="1.5"
        />
        <line x1="53" y1="44" x2="53" y2="62" stroke="url(#glassStem)" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="44" y1="62" x2="62" y2="62" stroke="url(#glassStem)" strokeWidth="2.5" strokeLinecap="round" />

        {/* Golden Sparkles on Toast */}
        <circle cx="40" cy="22" r="3" fill="#fef08a" />
        <path d="M40 12V18M40 26V32M34 22H30M50 22H46" stroke="#fde047" strokeWidth="1.5" strokeLinecap="round" />
      </g>
    </svg>
  );
}

export function Trips3DIcon({ className = 'w-12 h-12' }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="jetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
        <filter id="tripsGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#0ea5e9" floodOpacity="0.45" />
        </filter>
      </defs>
      <g filter="url(#tripsGlow)">
        {/* Sleek Corporate Jet / Aircraft */}
        <path
          d="M40 12L46 28L68 40L68 48L46 42L44 60L52 66L52 70L40 66L28 70L28 66L36 60L34 42L12 48L12 40L34 28L40 12Z"
          fill="url(#jetGrad)"
          stroke="#ffffff"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* Horizon Compass Orbit */}
        <ellipse cx="40" cy="46" rx="32" ry="12" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="1.5" strokeDasharray="3 4" />
      </g>
    </svg>
  );
}

export function Gifts3DIcon({ className = 'w-12 h-12' }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="goldBox" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="40%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#a16207" />
        </linearGradient>
        <linearGradient id="ribbonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <filter id="giftsGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#eab308" floodOpacity="0.4" />
        </filter>
      </defs>
      <g filter="url(#giftsGlow)">
        {/* Luxury Gift Box Base */}
        <rect x="18" y="32" width="44" height="34" rx="6" fill="url(#goldBox)" stroke="#fef9c3" strokeWidth="1.5" />
        <rect x="14" y="24" width="52" height="12" rx="4" fill="#ca8a04" stroke="#ffffff" strokeWidth="1.5" />
        {/* Royal Blue Velvet Ribbon */}
        <rect x="36" y="24" width="8" height="42" fill="url(#ribbonGrad)" />
        <rect x="14" y="43" width="52" height="8" fill="url(#ribbonGrad)" />
        {/* Ribbon Bow on Top */}
        <path
          d="M32 16C26 12 26 24 36 24C40 24 40 18 40 18C40 18 40 24 44 24C54 24 54 12 48 16C43 19 40 24 40 24C40 24 37 19 32 16Z"
          fill="url(#ribbonGrad)"
          stroke="#bfdbfe"
          strokeWidth="1"
        />
      </g>
    </svg>
  );
}

export function Dress3DIcon({ className = 'w-12 h-12' }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="blazerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="50%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id="goldButton" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#ca8a04" />
        </linearGradient>
        <filter id="dressGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#94a3b8" floodOpacity="0.4" />
        </filter>
      </defs>
      <g filter="url(#dressGlow)">
        {/* Executive Tailored Blazer / Polo */}
        <path
          d="M24 22L12 36L22 42V66H58V42L68 36L56 22L46 28L34 28L24 22Z"
          fill="url(#blazerGrad)"
          stroke="#cbd5e1"
          strokeWidth="1.5"
        />
        {/* Lapels */}
        <path d="M34 24L40 44L46 24" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
        {/* Polished Gold Buttons */}
        <circle cx="40" cy="50" r="2.5" fill="url(#goldButton)" stroke="#ffffff" strokeWidth="0.5" />
        <circle cx="40" cy="58" r="2.5" fill="url(#goldButton)" stroke="#ffffff" strokeWidth="0.5" />
      </g>
    </svg>
  );
}

export function Category3DIcon({ category, className = 'w-12 h-12' }: { category: CategoryType; className?: string }) {
  switch (category) {
    case 'sports': return <Sports3DIcon className={className} />;
    case 'food':   return <FoodParty3DIcon className={className} />;
    case 'trips':  return <Trips3DIcon className={className} />;
    case 'gifts':  return <Gifts3DIcon className={className} />;
    case 'dress':  return <Dress3DIcon className={className} />;
  }
}
