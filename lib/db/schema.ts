// ============================================================
// lib/db/schema.ts — Drizzle table definitions.
// Mirrors drizzle/0001_init.sql. The SQL file is the source of
// truth for DDL; this file is the typed query surface.
// ============================================================

import {
  pgTable,
  text,
  boolean,
  integer,
  doublePrecision,
  timestamp,
  jsonb,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';

export const users = pgTable(
  'users',
  {
    id: text('id').primaryKey(),
    email: text('email').notNull(),
    emailNormalized: text('email_normalized').notNull(),
    emailDomain: text('email_domain').notNull(),
    role: text('role').$type<'corporate' | 'vendor' | 'admin'>().notNull(),
    passwordHash: text('password_hash').notNull(),
    emailVerifiedAt: timestamp('email_verified_at', { withTimezone: true }),
    approvalStatus: text('approval_status')
      .$type<'pending' | 'approved' | 'rejected'>()
      .notNull()
      .default('pending'),
    approvedAt: timestamp('approved_at', { withTimezone: true }),
    approvedBy: text('approved_by'),
    rejectionReason: text('rejection_reason'),
    isSuspended: boolean('is_suspended').notNull().default(false),
    failedLoginCount: integer('failed_login_count').notNull().default(0),
    lockedUntil: timestamp('locked_until', { withTimezone: true }),
    passwordChangedAt: timestamp('password_changed_at', { withTimezone: true }),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('users_role_idx').on(t.role)]
);

export const authTokens = pgTable('auth_tokens', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  tokenHash: text('token_hash').notNull(),
  purpose: text('purpose').$type<'email_verify' | 'password_reset'>().notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  consumedAt: timestamp('consumed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  tokenHash: text('token_hash').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).notNull().defaultNow(),
  userAgent: text('user_agent'),
  ip: text('ip'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const corporateProfiles = pgTable('corporate_profiles', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  name: text('name').notNull().default(''),
  mobile: text('mobile').notNull().default(''),
  email: text('email').notNull(),
  officeCompanyName: text('office_company_name').notNull().default(''),
  officeAddress: text('office_address').notNull().default(''),
  city: text('city').notNull().default(''),
  position: text('position').notNull().default(''),
  department: text('department').notNull().default(''),
  cinNumber: text('cin_number'),
  teamSize: text('team_size'),
  annualProcurementBudget: text('annual_procurement_budget'),
  isCompleted: boolean('is_completed').notNull().default(false),
  placeId: text('place_id'),
  lat: doublePrecision('lat'),
  lng: doublePrecision('lng'),
  submittedAt: timestamp('submitted_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const vendorProfiles = pgTable(
  'vendor_profiles',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    category: text('category')
      .$type<'sports' | 'food' | 'trips' | 'gifts' | 'dress'>()
      .notNull(),
    extraCategories: jsonb('extra_categories').$type<string[]>().notNull().default([]),
    serviceAreas: jsonb('service_areas').$type<string[]>().notNull().default([]),
    vendorName: text('vendor_name').notNull().default(''),
    companyName: text('company_name').notNull().default(''),
    mobile: text('mobile').notNull().default(''),
    companyMobile: text('company_mobile').notNull().default(''),
    address: text('address').notNull().default(''),
    city: text('city').notNull().default(''),
    locality: text('locality'),
    distanceKm: doublePrecision('distance_km').notNull().default(0),
    entityType: text('entity_type'),
    panNumber: text('pan_number'),
    gstNumber: text('gst_number').notNull().default(''),
    gstVerified: boolean('gst_verified').notNull().default(false),
    gstDocumentPath: text('gst_document_path'),
    portfolioSummary: text('portfolio_summary'),
    corporateSuitability: text('corporate_suitability'),
    pastClients: jsonb('past_clients').$type<string[]>().notNull().default([]),
    amenities: jsonb('amenities').$type<string[]>().notNull().default([]),
    photos: jsonb('photos').$type<string[]>().notNull().default([]),
    timings: text('timings'),
    avgCostPerPerson: integer('avg_cost_per_person'),
    isCompleted: boolean('is_completed').notNull().default(false),
    placeId: text('place_id'),
    formattedAddress: text('formatted_address'),
    placeName: text('place_name'),
    lat: doublePrecision('lat'),
    lng: doublePrecision('lng'),
    rating: doublePrecision('rating'),
    userRatingsTotal: integer('user_ratings_total'),
    submittedAt: timestamp('submitted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('vendor_profiles_category_idx').on(t.category)]
);

export const rfps = pgTable(
  'rfps',
  {
    id: text('id').primaryKey(),
    corporateId: text('corporate_id').notNull(),
    corporateUserId: text('corporate_user_id').notNull(),
    companyName: text('company_name').notNull(),
    category: text('category')
      .$type<'sports' | 'food' | 'trips' | 'gifts' | 'dress'>()
      .notNull(),
    occasion: text('occasion'),
    categoryDetails: jsonb('category_details').$type<Record<string, unknown>>().notNull().default({}),
    universal: jsonb('universal').$type<Record<string, unknown>>().notNull().default({}),
    serviceArea: text('service_area'),
    totalBudget: integer('total_budget').notNull().default(0),
    status: text('status')
      .$type<'draft' | 'open' | 'bid-received' | 'awarded' | 'completed' | 'cancelled' | 'closed'>()
      .notNull()
      .default('open'),
    bidVisibility: text('bid_visibility').$type<'masked' | 'open'>().notNull().default('masked'),
    acceptedBidId: text('accepted_bid_id'),
    awardedAt: timestamp('awarded_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    submittedAt: timestamp('submitted_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('rfps_status_idx').on(t.status)]
);

export const bids = pgTable(
  'bids',
  {
    id: text('id').primaryKey(),
    rfpId: text('rfp_id').notNull(),
    vendorId: text('vendor_id').notNull(),
    vendorUserId: text('vendor_user_id').notNull(),
    totalPrice: integer('total_price').notNull(),
    lineItems: jsonb('line_items')
      .$type<{ description: string; amount: number }[]>()
      .notNull()
      .default([]),
    proposal: text('proposal').notNull().default(''),
    validUntil: timestamp('valid_until', { withTimezone: true }),
    distanceKm: doublePrecision('distance_km').notNull().default(0),
    matchPercentage: integer('match_percentage').notNull().default(0),
    status: text('status')
      .$type<'pending' | 'accepted' | 'rejected' | 'withdrawn'>()
      .notNull()
      .default('pending'),
    submittedAt: timestamp('submitted_at', { withTimezone: true }).notNull().defaultNow(),
    revisedAt: timestamp('revised_at', { withTimezone: true }),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('bids_rfp_vendor_active_idx').on(t.rfpId, t.vendorUserId),
    index('bids_rfp_idx').on(t.rfpId),
  ]
);

export const vendorReviews = pgTable('vendor_reviews', {
  id: text('id').primaryKey(),
  rfpId: text('rfp_id').notNull(),
  bidId: text('bid_id').notNull(),
  vendorId: text('vendor_id').notNull(),
  authorUserId: text('author_user_id').notNull(),
  rating: integer('rating').notNull(),
  comment: text('comment').notNull().default(''),
  isHidden: boolean('is_hidden').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const emailDomainRules = pgTable('email_domain_rules', {
  domain: text('domain').primaryKey(),
  rule: text('rule').$type<'allow' | 'block'>().notNull(),
  note: text('note'),
  createdBy: text('created_by'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const auditLogs = pgTable('audit_logs', {
  id: text('id').primaryKey(),
  actorId: text('actor_id'),
  actorEmail: text('actor_email'),
  actorRole: text('actor_role'),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id'),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().notNull().default({}),
  ip: text('ip'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const rateLimits = pgTable('rate_limits', {
  bucket: text('bucket').primaryKey(),
  windowStart: timestamp('window_start', { withTimezone: true }).notNull(),
  count: integer('count').notNull().default(0),
});

export type UserRow = typeof users.$inferSelect;
export type CorporateProfileRow = typeof corporateProfiles.$inferSelect;
export type VendorProfileRow = typeof vendorProfiles.$inferSelect;
export type RfpRow = typeof rfps.$inferSelect;
export type BidRow = typeof bids.$inferSelect;
export type VendorReviewRow = typeof vendorReviews.$inferSelect;
