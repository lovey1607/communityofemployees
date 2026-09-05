// ============================================================
// lib/roleTheme.ts — one source of truth for surface and role colour.
//
// Before this file the palette lived as ~400 hardcoded hex literals across
// the app, including FOUR different near-blacks used as "the background".
// Screens sat on visibly different grounds depending on who built them.
//
// The app now runs on the cream/saffron system introduced with the landing
// page. There is one ground (warm off-white), one set of surfaces, and four
// role accents. Role colour is deliberately kept — an employee, a vendor and
// an admin each keep their own accent, because in a three-sided marketplace
// it is genuinely useful to know at a glance whose side of the product you
// are looking at. What changed is that they now sit on ONE shared ground.
//
// These values mirror the CSS custom properties in app/globals.css. Change
// them in both places or, better, read the variable where CSS will do.
//
// lib/themes.ts is a different thing and stays: those are the five *category*
// atmospheres (sports, food, trips, gifts, dress) used for the category modal
// and hero backdrops, not chrome.
// ============================================================

/** The shared ground everything sits on. */
export const SURFACE = {
  /** Page background. The one true cream. */
  ground: '#FFF7EC',
  /** A warmer step of the ground, for inset strips and tab rails. */
  groundAlt: '#FFEFD9',
  /** Raised: cards, panels, nav bars. */
  raised: '#FFFFFF',
  /** Raised again: modals, popovers, anything floating. */
  overlay: '#FFFFFF',
  /** Hairlines and card edges. */
  border: '#EBDFCC',
  /** A border that needs to be seen — focused inputs, active tabs. */
  borderStrong: '#D8C6AC',
  /** Backdrop behind a modal. */
  scrim: 'rgba(29, 26, 23, 0.42)',
} as const;

/** Text, in descending order of emphasis. */
export const TEXT = {
  primary: '#1D1A17',
  secondary: '#4A443D',
  muted: '#7A7169',
  faint: '#A79C90',
  /** Readable on a solid saffron/turf/sky/berry accent. */
  onAccent: '#FFFFFF',
} as const;

/**
 * Status colour, separate from role colour on purpose. A vendor's blue accent
 * must never be mistaken for an info badge, so nothing below is reused as a
 * role accent. All of these are contrast-checked against the cream ground.
 */
export const STATUS = {
  success: '#137A43',
  successBg: 'rgba(30, 158, 90, 0.12)',
  warning: '#8A6100',
  warningBg: 'rgba(255, 200, 61, 0.20)',
  danger: '#B3261E',
  dangerBg: 'rgba(194, 50, 28, 0.10)',
  info: '#2E6BFF',
  infoBg: 'rgba(46, 107, 255, 0.10)',
  neutral: '#7A7169',
  neutralBg: 'rgba(29, 26, 23, 0.06)',
} as const;

export type Role = 'public' | 'corporate' | 'vendor' | 'admin';

export interface RolePalette {
  /** The accent itself. */
  accent: string;
  /** A deeper step, for accent-coloured text that must stay readable on cream. */
  accentInk: string;
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
 * Four accents, one per side of the product. Public keeps the saffron the
 * landing page is built around; employees get turf green; vendors get sky
 * blue; admins get berry. Vendor is no longer the same orange as public —
 * that ambiguity was flagged in the previous revision of this file and is
 * resolved here now that the landing design is settled.
 */
export const ROLE_THEME: Record<Role, RolePalette> = {
  public: {
    accent: '#FF6B2C',
    accentInk: '#C2481A',
    tint: 'rgba(255, 107, 44, 0.12)',
    tintBorder: 'rgba(255, 107, 44, 0.30)',
    onAccent: '#FFFFFF',
    label: 'Community of Employees',
  },
  corporate: {
    accent: '#1E9E5A',
    accentInk: '#137A43',
    tint: 'rgba(30, 158, 90, 0.12)',
    tintBorder: 'rgba(30, 158, 90, 0.30)',
    onAccent: '#FFFFFF',
    label: 'For your team',
  },
  vendor: {
    accent: '#2E6BFF',
    accentInk: '#1F4FCC',
    tint: 'rgba(46, 107, 255, 0.10)',
    tintBorder: 'rgba(46, 107, 255, 0.28)',
    onAccent: '#FFFFFF',
    label: 'Vendor',
  },
  admin: {
    accent: '#B23A7A',
    accentInk: '#8E2C60',
    tint: 'rgba(178, 58, 122, 0.10)',
    tintBorder: 'rgba(178, 58, 122, 0.28)',
    onAccent: '#FFFFFF',
    label: 'Admin',
  },
};

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
      return { label: 'Bids received', color: ROLE_THEME.vendor.accentInk, background: ROLE_THEME.vendor.tint };
    case 'awarded':
      return { label: 'Awarded', color: STATUS.info, background: STATUS.infoBg };
    case 'completed':
      return { label: 'Completed', color: ROLE_THEME.admin.accentInk, background: ROLE_THEME.admin.tint };
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
