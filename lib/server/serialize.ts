// ============================================================
// lib/server/serialize.ts — Database rows → the JSON shapes the
// existing UI already consumes (lib/types.ts). Also the single place
// where fields are *withheld*: password hashes never leave here, and
// masked bids never carry vendor identity.
// ============================================================

import 'server-only';
import type {
  Bid,
  CategoryDetails,
  CorporateProfile,
  RFP,
  UniversalFields,
  User,
  VendorProfile,
} from '@/lib/types';
import type {
  BidRow,
  CorporateProfileRow,
  RfpRow,
  UserRow,
  VendorProfileRow,
  VendorReviewRow,
} from '@/lib/db/schema';

const iso = (d: Date | null | undefined) => (d ? d.toISOString() : undefined);

export function serializeUser(row: UserRow): User & {
  approvalStatus: 'pending' | 'approved' | 'rejected';
  emailVerified: boolean;
} {
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    createdAt: row.createdAt.toISOString(),
    isSuspended: row.isSuspended,
    approvalStatus: row.approvalStatus,
    emailVerified: Boolean(row.emailVerifiedAt),
  };
}

export function serializeCorporateProfile(
  row: CorporateProfileRow,
  user: Pick<UserRow, 'approvalStatus'>
): CorporateProfile {
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    mobile: row.mobile,
    email: row.email,
    officeCompanyName: row.officeCompanyName,
    officeAddress: row.officeAddress,
    city: row.city,
    position: row.position,
    department: row.department,
    cinNumber: row.cinNumber ?? undefined,
    teamSize: row.teamSize ?? undefined,
    annualProcurementBudget: row.annualProcurementBudget ?? undefined,
    isCompleted: row.isCompleted,
    status: user.approvalStatus,
    submittedAt: iso(row.submittedAt),
    place_id: row.placeId ?? undefined,
    lat: row.lat ?? undefined,
    lng: row.lng ?? undefined,
  };
}

export function serializeVendorProfile(
  row: VendorProfileRow,
  user: Pick<UserRow, 'approvalStatus' | 'approvedAt'>
): VendorProfile & { extraCategories: string[]; serviceAreas: string[] } {
  return {
    id: row.id,
    userId: row.userId,
    category: row.category,
    extraCategories: row.extraCategories ?? [],
    serviceAreas: row.serviceAreas ?? [],
    vendorName: row.vendorName,
    companyName: row.companyName,
    mobile: row.mobile,
    companyMobile: row.companyMobile,
    address: row.address,
    city: row.city,
    locality: row.locality ?? undefined,
    distanceKm: row.distanceKm,
    entityType: (row.entityType as VendorProfile['entityType']) ?? undefined,
    panNumber: row.panNumber ?? undefined,
    gstNumber: row.gstNumber,
    gstVerified: row.gstVerified,
    portfolioSummary: row.portfolioSummary ?? undefined,
    corporateSuitability: row.corporateSuitability ?? undefined,
    pastClients: row.pastClients ?? [],
    amenities: row.amenities ?? [],
    photos: row.photos ?? [],
    timings: row.timings ?? undefined,
    avgCostPerPerson: row.avgCostPerPerson ?? undefined,
    isCompleted: row.isCompleted,
    status: user.approvalStatus,
    submittedAt: iso(row.submittedAt),
    verifiedAt: iso(user.approvedAt),
    place_id: row.placeId ?? undefined,
    formatted_address: row.formattedAddress ?? undefined,
    placeName: row.placeName ?? undefined,
    lat: row.lat ?? undefined,
    lng: row.lng ?? undefined,
    rating: row.rating ?? undefined,
    user_ratings_total: row.userRatingsTotal ?? undefined,
  };
}

/** Vendor contact details are only ever exposed to an approved counterpart. */
export function publicVendorSummary(
  row: VendorProfileRow
): Omit<ReturnType<typeof serializeVendorProfile>, 'mobile' | 'companyMobile' | 'panNumber'> {
  const full = serializeVendorProfile(row, { approvalStatus: 'approved', approvedAt: null });
  const { mobile: _m, companyMobile: _c, panNumber: _p, ...rest } = full;
  return rest;
}

export function serializeRfp(
  row: RfpRow,
  extra: { bidCount?: number; lowestBid?: number | null; reviewed?: boolean } = {}
): RFP & { occasion?: string; bidCount: number; lowestBid: number | null; bidVisibility: string; reviewed: boolean } {
  return {
    id: row.id,
    corporateId: row.corporateId,
    corporateUserId: row.corporateUserId,
    companyName: row.companyName,
    category: row.category,
    occasion: row.occasion ?? undefined,
    categoryDetails: row.categoryDetails as unknown as CategoryDetails,
    universal: row.universal as unknown as UniversalFields,
    totalBudget: row.totalBudget,
    submittedAt: row.submittedAt.toISOString(),
    status: row.status,
    acceptedBidId: row.acceptedBidId ?? undefined,
    bidVisibility: row.bidVisibility,
    bidCount: extra.bidCount ?? 0,
    lowestBid: extra.lowestBid ?? null,
    reviewed: extra.reviewed ?? false,
  };
}

export interface BidVendorFacts {
  vendorName: string;
  vendorCompany: string;
  category: VendorProfileRow['category'];
  placeId?: string | null;
  rating?: number | null;
  userRatingsTotal?: number | null;
  timings?: string | null;
  amenities?: string[] | null;
  avgCostPerPerson?: number | null;
  locality?: string | null;
  corporateSuitability?: string | null;
}

/**
 * @param reveal when false the bid is returned "masked": price and terms are
 *        visible, vendor identity is not. Used while an RFP is still taking
 *        bids so a live reverse auction cannot be gamed by name.
 */
export function serializeBid(
  row: BidRow,
  vendor: BidVendorFacts,
  reveal: boolean
): Bid & { validUntil?: string; maskedLabel?: string } {
  const anonLabel = `Vendor ${row.id.slice(-4).toUpperCase()}`;
  return {
    id: row.id,
    rfpId: row.rfpId,
    vendorId: reveal ? row.vendorId : '',
    vendorUserId: reveal ? row.vendorUserId : '',
    vendorName: reveal ? vendor.vendorName : anonLabel,
    vendorCompany: reveal ? vendor.vendorCompany : anonLabel,
    category: vendor.category,
    totalPrice: row.totalPrice,
    lineItems: row.lineItems ?? [],
    proposal: row.proposal,
    distanceKm: row.distanceKm,
    matchPercentage: row.matchPercentage,
    submittedAt: row.submittedAt.toISOString(),
    status: row.status === 'withdrawn' ? 'rejected' : row.status,
    validUntil: iso(row.validUntil),
    maskedLabel: reveal ? undefined : anonLabel,
    place_id: reveal ? vendor.placeId ?? undefined : undefined,
    rating: vendor.rating ?? undefined,
    user_ratings_total: vendor.userRatingsTotal ?? undefined,
    timings: reveal ? vendor.timings ?? undefined : undefined,
    amenities: vendor.amenities ?? undefined,
    avgCostPerPerson: vendor.avgCostPerPerson ?? undefined,
    locality: vendor.locality ?? undefined,
    corporateSuitability: vendor.corporateSuitability ?? undefined,
  };
}

export function serializeReview(row: VendorReviewRow, authorLabel: string) {
  return {
    id: row.id,
    rfpId: row.rfpId,
    vendorId: row.vendorId,
    rating: row.rating,
    comment: row.comment,
    author: authorLabel,
    createdAt: row.createdAt.toISOString(),
  };
}
