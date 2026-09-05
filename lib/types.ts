// ============================================================
// lib/types.ts — Shared TypeScript interfaces for COE Portal
// Role-Based Access Control (RBAC), Profiles, RFPs, and Bids
// ============================================================

export type CategoryType = 'sports' | 'food' | 'trips' | 'gifts' | 'dress';
export type UserRole = 'corporate' | 'vendor' | 'admin';

// ─── Theme Configuration ─────────────────────────────────────
export interface ThemeConfig {
  bg: string;
  bgGradient: string;
  primary: string;
  accent: string;
  text: string;
  glass: string;
  particles: ParticleType;
  envLabel: string;
}

export type ParticleType = 'grass' | 'neon' | 'clouds' | 'ribbons' | 'fabric';

// ─── User & Authentication ───────────────────────────────────
export interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
  isSuspended: boolean;
  password?: string;
}

export interface CorporateProfile {
  id: string;
  userId: string;
  name: string;
  mobile: string;
  email: string;
  officeCompanyName: string;
  officeAddress: string;
  city: string;
  position: string;
  department: string;
  cinNumber?: string;
  teamSize?: string;
  annualProcurementBudget?: string;
  isCompleted: boolean;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt?: string;
  verifiedAt?: string;
  place_id?: string;
  lat?: number;
  lng?: number;
}

export interface VendorProfile {
  id: string;
  userId: string;
  category: CategoryType;
  vendorName: string;
  companyName: string;
  mobile: string;
  companyMobile: string;
  address: string;
  city: string;
  distanceKm: number; // Simulated distance from corporate hub (e.g. DLF Cyber Hub)
  entityType?: 'Pvt Ltd' | 'LLP' | 'Partnership' | 'Proprietorship';
  panNumber?: string;
  gstNumber: string;
  gstVerified: boolean;
  portfolioSummary?: string;
  pastClients: string[];
  status: 'pending' | 'approved' | 'rejected';
  isCompleted: boolean;
  submittedAt?: string;
  verifiedAt?: string;

  // Google Places & Maps Integration
  place_id?: string;
  formatted_address?: string;
  placeName?: string;
  lat?: number;
  lng?: number;
  rating?: number;
  user_ratings_total?: number;

  // Venue Specific Attributes
  locality?: string;
  timings?: string;
  amenities?: string[];
  avgCostPerPerson?: number;
  corporateSuitability?: string;
  photos?: string[];
}

// ─── Google Places & Reviews ──────────────────────────────────
export interface GooglePlaceReview {
  author_name: string;
  author_url?: string;
  language?: string;
  profile_photo_url?: string;
  rating: number;
  relative_time_description: string;
  text: string;
  time?: number;
}

export interface GooglePlaceDetails {
  name: string;
  formatted_address?: string;
  rating?: number;
  user_ratings_total?: number;
  reviews?: GooglePlaceReview[];
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
  place_id?: string;
  url?: string;
}

// ─── RFP (Request for Proposal) ──────────────────────────────
export interface SportsDetails {
  type: string;
  extras: string[];
}

export interface FoodDetails {
  mealType: string;
  beverage: string;
  menuPreference: string;
  cuisine: string;
  entertainment: string[];
}

export interface TripsDetails {
  destinationType: string;
  itineraryStyle: string;
  transport: string[];
  accommodation: string;
}

export interface GiftsDetails {
  purpose: string;
  productTypes: string[];
  customLogo: boolean;
}

export interface DressDetails {
  apparelType: string[];
  addOns: string[];
  material: string;
}

export type CategoryDetails =
  | SportsDetails
  | FoodDetails
  | TripsDetails
  | GiftsDetails
  | DressDetails;

export interface UniversalFields {
  startDate: string;
  endDate: string;
  timeSlot: string; // e.g. "Morning Slot (8:00 AM - 12:00 PM)", "Evening Gala (7:00 PM - Midnight)"
  timeFlexibility: string; // e.g. "Strict Schedule" | "Flexible (±2 Hours buffer)"
  urgency: string; // e.g. "Immediate (Next 7-10 Days)" | "Upcoming Month" | "Planned Quarter"
  setupLeadTime?: string; // e.g. "1 Hour Prior" | "Full Day Setup"
  persons: number;
  budgetPerPerson: number;
  notes: string;
  officeAddress?: string;
}

export interface RFP {
  id: string;
  corporateId: string;
  corporateUserId: string;
  companyName: string;
  category: CategoryType;
  categoryDetails: CategoryDetails;
  universal: UniversalFields;
  totalBudget: number;
  submittedAt: string;
  /**
   * Lifecycle: draft → open → bid-received → awarded → completed,
   * with cancelled/closed as terminal states. 'bid-received' is a derived
   * convenience state (an open RFP that has at least one live bid).
   */
  status:
    | 'draft'
    | 'open'
    | 'bid-received'
    | 'awarded'
    | 'completed'
    | 'cancelled'
    | 'closed';
  acceptedBidId?: string;
}

// ─── Bid ─────────────────────────────────────────────────────
export interface BidLineItem {
  description: string;
  amount: number;
}

export interface Bid {
  id: string;
  rfpId: string;
  vendorId: string;
  vendorUserId: string;
  vendorName: string;
  vendorCompany: string;
  category: CategoryType;
  totalPrice: number;
  lineItems: BidLineItem[];
  proposal: string;
  distanceKm: number;
  matchPercentage: number;
  /** Why the score is what it is — see lib/server/match.ts. */
  matchFactors?: {
    key: string;
    label: string;
    score: number;
    weight: number;
    detail: string;
  }[];
  submittedAt: string;
  status: 'pending' | 'accepted' | 'rejected';
  place_id?: string;
  rating?: number;
  user_ratings_total?: number;
  timings?: string;
  amenities?: string[];
  avgCostPerPerson?: number;
  locality?: string;
  corporateSuitability?: string;
}

// ─── Toast Notifications ─────────────────────────────────────
export interface Toast {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  duration?: number;
}
