// ============================================================
// lib/themes.ts — Category-specific theme configurations
// Sophisticated, mature corporate dark theme (Apple/Stripe inspired)
// ============================================================

import { CategoryType, ThemeConfig } from './types';
export type { ThemeConfig } from './types';

export const THEMES: Record<CategoryType, ThemeConfig> = {
  sports: {
    bg: '#020805',
    bgGradient: 'radial-gradient(circle at 50% 12%, #082414 0%, #031008 50%, #010503 100%)',
    primary: '#10b981',
    accent: '#34d399',
    text: '#ecfdf5',
    glass: 'rgba(16, 185, 129, 0.08)',
    particles: 'grass',
    envLabel: 'Sports & Corporate Tournaments',
  },
  food: {
    bg: '#0a0407',
    bgGradient: 'radial-gradient(circle at 50% 12%, #2d0e1b 0%, #15060d 50%, #060204 100%)',
    primary: '#f97316',
    accent: '#fb7185',
    text: '#fff7ed',
    glass: 'rgba(249, 115, 22, 0.08)',
    particles: 'neon',
    envLabel: 'Food & Party',
  },
  trips: {
    bg: '#020712',
    bgGradient: 'radial-gradient(circle at 50% 12%, #08213e 0%, #041021 50%, #01040a 100%)',
    primary: '#0ea5e9',
    accent: '#38bdf8',
    text: '#f0f9ff',
    glass: 'rgba(14, 165, 233, 0.08)',
    particles: 'clouds',
    envLabel: 'Trips & Corporate Offsites',
  },
  gifts: {
    bg: '#0a0802',
    bgGradient: 'radial-gradient(circle at 50% 12%, #322107 0%, #170f03 50%, #050301 100%)',
    primary: '#eab308',
    accent: '#fde047',
    text: '#fefce8',
    glass: 'rgba(234, 179, 8, 0.08)',
    particles: 'ribbons',
    envLabel: 'Gifts & Executive Rewards',
  },
  dress: {
    bg: '#05070e',
    bgGradient: 'radial-gradient(circle at 50% 12%, #192036 0%, #0d111e 50%, #030408 100%)',
    primary: '#cbd5e1',
    accent: '#94a3b8',
    text: '#ffffff',
    glass: 'rgba(203, 213, 225, 0.08)',
    particles: 'fabric',
    envLabel: 'Dress & Custom Merchandise',
  },
};

export const DEFAULT_THEME: ThemeConfig = {
  bg: '#03040a',
  bgGradient: 'radial-gradient(circle at 50% 12%, #10162f 0%, #070916 50%, #020308 100%)',
  primary: '#10b981',
  accent: '#38bdf8',
  text: '#ffffff',
  glass: 'rgba(16, 185, 129, 0.08)',
  particles: 'fabric',
  envLabel: 'Community of Employees',
};

export const CATEGORY_LABELS: Record<CategoryType, string> = {
  sports: 'Sports & Tournaments',
  food: 'Food & Party',
  trips: 'Trips & Offsites',
  gifts: 'Gifts & Rewards',
  dress: 'Dress & Merchandise',
};

export const CATEGORY_ICONS: Record<CategoryType, string> = {
  sports: '🏆',
  food: '🥂',
  trips: '✈️',
  gifts: '🎁',
  dress: '👔',
};
