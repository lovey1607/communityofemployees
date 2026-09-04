// ============================================================
// lib/validation.ts — Zod schemas shared by API routes (and importable
// by client forms for matching front-end validation).
// ============================================================

import { z } from 'zod';
import { isValidEmail, normalizeEmail } from './emailDomains';

// ─── Primitives ──────────────────────────────────────────────

export const emailSchema = z
  .string()
  .trim()
  .max(254)
  .transform(normalizeEmail)
  .refine(isValidEmail, { message: 'Enter a valid email address.' });

/**
 * Password policy: length does more for real-world safety than character
 * classes, so the floor is 10 characters with a light complexity check and a
 * block-list of the passwords attackers try first.
 */
const COMMON_PASSWORDS = new Set([
  'password', 'password1', 'password123', '12345678', '123456789', '1234567890',
  'qwertyuiop', 'iloveyou', 'admin123', 'letmein123', 'welcome123', 'test1234',
  'gurgaon123', 'abcd1234', 'passw0rd', 'india@123', 'changeme', 'coeportal',
]);

export const passwordSchema = z
  .string()
  .min(10, 'Use at least 10 characters.')
  .max(200, 'That password is too long.')
  .refine((p) => /[A-Za-z]/.test(p) && /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(p), {
    message: 'Mix letters with at least one number or symbol.',
  })
  .refine((p) => !COMMON_PASSWORDS.has(p.toLowerCase()), {
    message: 'That password is too common. Pick something else.',
  });

/**
 * GSTIN: 15 characters — 2-digit state code, 10-character PAN, 1 entity digit,
 * a fixed 'Z', then a checksum character. The checksum below is the official
 * mod-36 algorithm, so typos are caught without a network call.
 * Real-time verification against the GST portal / a compliance API
 * (e.g. ClearTax, Masters India) is a future upgrade — see README.
 */
const GSTIN_RE = /^[0-3][0-9][A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const GSTIN_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function gstinChecksumValid(gstin: string): boolean {
  if (gstin.length !== 15) return false;
  let sum = 0;
  for (let i = 0; i < 14; i += 1) {
    const value = GSTIN_ALPHABET.indexOf(gstin[i]!);
    if (value < 0) return false;
    const product = value * (i % 2 === 0 ? 1 : 2);
    sum += Math.floor(product / 36) + (product % 36);
  }
  const checkDigit = (36 - (sum % 36)) % 36;
  return GSTIN_ALPHABET[checkDigit] === gstin[14];
}

export const gstinSchema = z
  .string()
  .trim()
  .toUpperCase()
  .length(15, 'A GSTIN is exactly 15 characters.')
  .refine((v) => GSTIN_RE.test(v), { message: 'That is not a valid GSTIN format.' })
  .refine(gstinChecksumValid, { message: 'GSTIN checksum failed — please re-check the number.' });

export const panSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, 'That is not a valid PAN.');

export const mobileSchema = z
  .string()
  .trim()
  .regex(/^(\+91[- ]?)?[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number.');

/** Strips angle brackets and control characters from free text before storage. */
export const safeText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    // eslint-disable-next-line no-control-regex
    .transform((v) => v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, ''))
    .refine((v) => !/<\s*(script|iframe|object|embed|style)\b/i.test(v), {
      message: 'That text contains markup we cannot accept.',
    });

export const categorySchema = z.enum(['sports', 'food', 'trips', 'gifts', 'dress']);
export const roleSchema = z.enum(['corporate', 'vendor', 'admin']);

/**
 * Occasion taxonomy shown to employees. Kept separate from `category`, which
 * drives the vendor marketplace and the existing modal flows.
 */
export const occasionSchema = z.enum([
  'sports-meet',
  'team-lunch',
  'team-dinner',
  'team-outing',
  'office-party',
  'function',
  'offsite',
  'gifting',
  'merchandise',
  'other',
]);

// ─── Auth ────────────────────────────────────────────────────

export const signupCorporateSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: safeText(120).optional(),
  officeCompanyName: safeText(160).optional(),
});

export const signupVendorSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  companyName: safeText(160),
  vendorName: safeText(120).optional(),
  gstNumber: gstinSchema,
  category: categorySchema,
  extraCategories: z.array(categorySchema).max(5).optional(),
  serviceAreas: z.array(safeText(80)).min(1, 'Add at least one service area.').max(15),
  mobile: mobileSchema.optional(),
  city: safeText(80).optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Enter your password.').max(200),
});

export const verifyEmailSchema = z.object({ token: z.string().min(10).max(200) });
export const resendVerificationSchema = z.object({ email: emailSchema });
export const forgotPasswordSchema = z.object({ email: emailSchema });
export const resetPasswordSchema = z.object({
  token: z.string().min(10).max(200),
  password: passwordSchema,
});
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: passwordSchema,
});

// ─── Profiles ────────────────────────────────────────────────

export const corporateProfileSchema = z.object({
  name: safeText(120),
  mobile: mobileSchema,
  officeCompanyName: safeText(160),
  officeAddress: safeText(400),
  city: safeText(80),
  position: safeText(120),
  department: safeText(120),
  cinNumber: safeText(30).optional(),
  teamSize: safeText(40).optional(),
  annualProcurementBudget: safeText(40).optional(),
  placeId: safeText(200).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
});

export const vendorProfileSchema = z.object({
  category: categorySchema,
  extraCategories: z.array(categorySchema).max(5).optional(),
  serviceAreas: z.array(safeText(80)).max(15).optional(),
  vendorName: safeText(120),
  companyName: safeText(160),
  mobile: mobileSchema,
  companyMobile: mobileSchema.optional().or(z.literal('')),
  address: safeText(400),
  city: safeText(80),
  locality: safeText(120).optional(),
  entityType: z.enum(['Pvt Ltd', 'LLP', 'Partnership', 'Proprietorship']).optional(),
  panNumber: panSchema.optional().or(z.literal('')),
  gstNumber: gstinSchema,
  portfolioSummary: safeText(2000).optional(),
  corporateSuitability: safeText(500).optional(),
  pastClients: z.array(safeText(120)).max(30).optional(),
  amenities: z.array(safeText(80)).max(40).optional(),
  timings: safeText(120).optional(),
  avgCostPerPerson: z.number().int().min(0).max(1_000_000).optional(),
  placeId: safeText(200).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
});

// ─── RFP & bids ──────────────────────────────────────────────

export const universalFieldsSchema = z.object({
  startDate: z.string().max(40),
  endDate: z.string().max(40),
  timeSlot: safeText(120).optional().default(''),
  timeFlexibility: safeText(120).optional().default(''),
  urgency: safeText(120).optional().default(''),
  setupLeadTime: safeText(120).optional(),
  persons: z.number().int().min(1, 'At least 1 person.').max(100_000),
  budgetPerPerson: z.number().int().min(0).max(10_000_000),
  notes: safeText(4000).optional().default(''),
  officeAddress: safeText(400).optional(),
});

export const createRfpSchema = z.object({
  category: categorySchema,
  occasion: occasionSchema.optional(),
  categoryDetails: z.record(z.string(), z.unknown()).default({}),
  universal: universalFieldsSchema,
  serviceArea: safeText(120).optional(),
  bidVisibility: z.enum(['masked', 'open']).optional(),
  status: z.enum(['draft', 'open']).optional(),
});

export const updateRfpSchema = createRfpSchema.partial().extend({
  status: z.enum(['draft', 'open', 'cancelled', 'completed']).optional(),
});

export const bidLineItemSchema = z.object({
  description: safeText(200),
  amount: z.number().int().min(0).max(100_000_000),
});

export const createBidSchema = z.object({
  rfpId: z.string().min(1).max(64),
  totalPrice: z.number().int().min(1, 'Enter your quote.').max(100_000_000),
  lineItems: z.array(bidLineItemSchema).max(40).default([]),
  proposal: safeText(4000).default(''),
  /** ISO date the quote stays good until. */
  validUntil: z.string().datetime({ offset: true }).optional(),
});

export const reviseBidSchema = z.object({
  totalPrice: z.number().int().min(1).max(100_000_000).optional(),
  lineItems: z.array(bidLineItemSchema).max(40).optional(),
  proposal: safeText(4000).optional(),
  validUntil: z.string().datetime({ offset: true }).optional(),
});

export const awardBidSchema = z.object({ bidId: z.string().min(1).max(64) });

export const createReviewSchema = z.object({
  rfpId: z.string().min(1).max(64),
  rating: z.number().int().min(1).max(5),
  comment: safeText(2000).default(''),
});

// ─── Admin ───────────────────────────────────────────────────

export const approvalDecisionSchema = z.object({
  decision: z.enum(['approved', 'rejected', 'pending']),
  reason: safeText(500).optional(),
});

export const adminUserPatchSchema = z.object({
  isSuspended: z.boolean().optional(),
  approvalStatus: z.enum(['pending', 'approved', 'rejected']).optional(),
  rejectionReason: safeText(500).optional(),
});

export const domainRuleSchema = z.object({
  domain: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+(\.[a-z0-9-]+)+$/, 'Enter a bare domain, e.g. acme.in'),
  rule: z.enum(['allow', 'block']),
  note: safeText(200).optional(),
});

export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).max(100_000).default(0),
});
