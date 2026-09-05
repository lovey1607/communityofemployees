// ============================================================
// lib/themes.ts — per-category colour.
//
// These used to be five near-black page backgrounds that the whole app was
// repainted with. In the cream design the page ground never changes — only
// the accent does — so `bg`/`bgGradient` are now soft tints used behind
// category cards and modals, not a body background.
// ============================================================

import { CategoryType, ThemeConfig } from './types';
export type { ThemeConfig } from './types';

export const THEMES: Record<CategoryType, ThemeConfig> = {
  sports: {
    bg: '#DDF5E7',
    bgGradient: 'linear-gradient(160deg, #1E9E5A, #0C5C34)',
    primary: '#1E9E5A',
    accent: '#5CD48F',
    text: '#0C5C34',
    glass: 'rgba(30, 158, 90, 0.10)',
    particles: 'grass',
    envLabel: 'Sports & tournaments',
  },
  food: {
    bg: '#FFE3D3',
    bgGradient: 'linear-gradient(160deg, #FF6B2C, #A62B0B)',
    primary: '#FF6B2C',
    accent: '#FF8F5C',
    text: '#8A3210',
    glass: 'rgba(255, 107, 44, 0.10)',
    particles: 'neon',
    envLabel: 'Food & party',
  },
  trips: {
    bg: '#E1EAFF',
    bgGradient: 'linear-gradient(160deg, #2E6BFF, #0E2B7A)',
    primary: '#2E6BFF',
    accent: '#6D97FF',
    text: '#183C8C',
    glass: 'rgba(46, 107, 255, 0.10)',
    particles: 'clouds',
    envLabel: 'Trips & offsites',
  },
  gifts: {
    bg: '#FFF1C2',
    bgGradient: 'linear-gradient(160deg, #FFC83D, #B8860B)',
    primary: '#A66A00',
    accent: '#FFC83D',
    text: '#6B4400',
    glass: 'rgba(255, 200, 61, 0.14)',
    particles: 'ribbons',
    envLabel: 'Gifts & rewards',
  },
  dress: {
    bg: '#F9DDEB',
    bgGradient: 'linear-gradient(160deg, #B23A7A, #4E1240)',
    primary: '#B23A7A',
    accent: '#D46BA4',
    text: '#7A2453',
    glass: 'rgba(178, 58, 122, 0.10)',
    particles: 'fabric',
    envLabel: 'Dress & merchandise',
  },
};

export const DEFAULT_THEME: ThemeConfig = {
  bg: '#FFF7EC',
  bgGradient: 'linear-gradient(160deg, #FF6B2C, #FF3D71)',
  primary: '#FF6B2C',
  accent: '#1E9E5A',
  text: '#1D1A17',
  glass: 'rgba(255, 107, 44, 0.10)',
  particles: 'fabric',
  envLabel: 'Community of Employees',
};

export const CATEGORY_LABELS: Record<CategoryType, string> = {
  sports: 'Sports & tournaments',
  food: 'Food & party',
  trips: 'Trips & offsites',
  gifts: 'Gifts & rewards',
  dress: 'Dress & merchandise',
};

export const CATEGORY_ICONS: Record<CategoryType, string> = {
  sports: '🏆',
  food: '🥂',
  trips: '✈️',
  gifts: '🎁',
  dress: '👔',
};
