// ============================================================
// lib/roleTheme.ts — one source of truth for surface and role colour.
//
// Before this file the palette lived as ~400 hardcoded hex literals across
// the app, including FOUR different near-blacks used as "the background"
// (#0B0F17, #050814, #0b0d12, #05070E). Screens sat on visibly different
// grounds depending on who built them.
//
// Role colour is deliberately kept — an employee, a vendor and an admin each
// keep their own accent, because in a three-sided marketplace it is genuinely
// useful to know at a glance whose side of the product you are looking at.
// What changes is that they now sit on ONE shared ground, with one set of
// surface, border and text values.
//
// lib/themes.ts is a different thing and stays: those are the five *category*
// atmospheres (sports, food, trips, gifts, dress) used for the category modal
// and hero backdrops, not chrome.
// ============================================================

/** The shared ground everything sits on, dark mode. */
export const SURFACE = {
  /** Page background. The one true near-black. */
  ground: '#0B0F17',
  /** Slightly raised: cards, panels, nav bars. */
  raised: 'rgba(255, 255, 255, 0.035)',
  /** Raised again: modals, popovers, anything floating. */
  overlay: '#0F131C',
  /** Hairlines and card edges. */
  border: 'rgba(255, 255, 255, 0.09)',
  /** A border that needs to be seen — focused inputs, active tabs. */
  borderStrong: 'rgba(255, 255, 255, 0.16)',
  /** Backdrop behind a modal. */
  scrim: 'rgba(5, 7, 14, 0.82)',
} as const;

/** The same, for light mode. */
export const SURFACE_LIGHT = {
  ground: '#f7f8fa',
  raised: 'rgba(255, 255, 255, 0.9)',
  overlay: '#ffffff',
  border: 'rgba(15, 23, 42, 0.10)',
  borderStrong: 'rgba(15, 23, 42, 0.18)',
  scrim: 'rgba(15, 23, 42, 0.35)',
} as const;

/** Text, in descending order of emphasis. */
export const TEXT = {
  primary: '#ffffff',
  secondary: 'rgba(255, 255, 255, 0.68)',
  muted: 'rgba(255, 255, 255, 0.46)',
  faint: 'rgba(255, 255, 255, 0.28)',
  onAccent: '#0B0F17',
} as const;

export const TEXT_LIGHT = {
  primary: '#0f172a',
  secondary: '#475569',
  muted: '#64748b',
  faint: '#94a3b8',
  onAccent: '#ffffff',
} as const;

/**
 * Status colour, separate from role colour on purpose. A vendor's orange
 * accent must never be mistaken for a warning, so nothing below is reused
 * as a role accent.
 */
export const STATUS = {
  success: '#22c55e',
  successBg: 'rgba(34, 197, 94, 0.12)',
  warning: '#fbbf24',
  warningBg: 'rgba(251, 191, 36, 0.12)',
  danger: '#ef4444',
  dangerBg: 'rgba(239, 68, 68, 0.12)',
  info: '#38bdf8',
  infoBg: 'rgba(56, 189, 248, 0.12)',
  neutral: 'rgba(255, 255, 255, 0.46)',
  neutralBg: 'rgba(255, 255, 255, 0.06)',
} as const;

export type Role = 'public' | 'corporate' | 'vendor' | 'admin';

export interface RolePalette {
  /** The accent itself. */
  accent: string;
  /** A lighter step, for text on dark grounds where the accent is too dim. */
  accentSoft: string;
  /** Tinted fill for chips, badges and hover states. */
  tint: string;
  /** Tinted border to match. */
  tintBorder: string;
  /** Readable text colour to place ON the solid accent. */
  onAccent: string;
  /** What this side of the product is called, for nav and page labels. */
  label: string;
}

/**
 * The three role accents are unchanged from what the app already used —
 * emerald for employees, orange for vendors, gold for admins — so nobody has
 * to relearn the product. They are now defined once instead of 300 times.
 */
export const ROLE_THEME: Record<Role, RolePalette> = {
  public: {
    accent: '#f97316',
    accentSoft: '#fb923c',
    tint: 'rgba(249, 115, 22, 0.12)',
    tintBorder: 'rgba(249, 115, 22, 0.32)',
    onAccent: '#0B0F17',
    label: 'Community of Employees',
  },
  corporate: {
    accent: '#10b981',
    accentSoft: '#34d399',
    tint: 'rgba(16, 185, 129, 0.12)',
    tintBorder: 'rgba(16, 185, 129, 0.32)',
    onAccent: '#03140d',
    label: 'For your team',
  },
  vendor: {
    accent: '#f97316',
    accentSoft: '#fb923c',
    tint: 'rgba(249, 115, 22, 0.12)',
    tintBorder: 'rgba(249, 115, 22, 0.32)',
    onAccent: '#170a02',
    label: 'Vendor',
  },
  admin: {
    accent: '#eab308',
    accentSoft: '#facc15',
    tint: 'rgba(234, 179, 8, 0.12)',
    tintBorder: 'rgba(234, 179, 8, 0.32)',
    onAccent: '#161104',
    label: 'Admin',
  },
};

/**
 * NOTE — one thing left deliberately unresolved: `public` and `vendor` are
 * currently the same orange, so a public marketing surface and a vendor
 * surface read as the same "side" of the product. Worth splitting once the
 * landing design is settled; changing it here changes it everywhere.
 */

export function roleTheme(role: Role | string | null | undefined): RolePalette {
  if (role === 'corporate' || role === 'vendor' || role === 'admin') return ROLE_THEME[role];
  return ROLE_THEME.public;
}

/** Status colour for an RFP, so every screen badges a requirement the same way. */
export function rfpStatusStyle(status: string): { label: string; color: string; background: string } {
  switch (status) {
    case 'draft':
      return { label: 'Draft', color: STATUS.neutral, background: STATUS.neutralBg };
    case 'open':
      return { label: 'Open — awaiting bids', color: STATUS.success, background: STATUS.successBg };
    case 'bid-received':
      return { label: 'Bids received', color: ROLE_THEME.vendor.accentSoft, background: ROLE_THEME.vendor.tint };
    case 'awarded':
      return { label: 'Awarded', color: STATUS.info, background: STATUS.infoBg };
    case 'completed':
      return { label: 'Completed', color: '#a78bfa', background: 'rgba(167, 139, 250, 0.12)' };
    case 'cancelled':
      return { label: 'Withdrawn', color: STATUS.neutral, background: STATUS.neutralBg };
    default:
      return { label: 'Closed', color: STATUS.neutral, background: STATUS.neutralBg };
  }
}

/** Status colour for a bid. */
export function bidStatusStyle(status: string): { label: string; color: string; background: string } {
  switch (status) {
    case 'accepted':
      return { label: 'Won', color: STATUS.success, background: STATUS.successBg };
    case 'rejected':
      return { label: 'Not selected', color: STATUS.neutral, background: STATUS.neutralBg };
    case 'withdrawn':
      return { label: 'Withdrawn', color: STATUS.neutral, background: STATUS.neutralBg };
    default:
      return { label: 'Live', color: STATUS.warning, background: STATUS.warningBg };
  }
}
