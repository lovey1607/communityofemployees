// ============================================================
// store/useStore.ts — Global client state.
//
// This used to BE the database: seed arrays, plaintext passwords and an
// impersonation switch, all persisted to localStorage. It is now a thin
// client cache in front of the real API. Rules:
//
//   · No user records, profiles, RFPs or bids are persisted to localStorage.
//     Everything comes from the server on load and after every mutation.
//   · The session lives in an httpOnly cookie the browser never exposes to
//     JavaScript; `currentUser` here is a *display copy*, not a credential.
//   · Nothing in this file authorises anything. The server decides.
// ============================================================

'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  CategoryType,
  UserRole,
  User,
  CorporateProfile,
  VendorProfile,
  RFP,
  Bid,
  BidLineItem,
  CategoryDetails,
  UniversalFields,
  Toast,
} from '@/lib/types';
import { THEMES, DEFAULT_THEME, ThemeConfig } from '@/lib/themes';
import { generateId } from '@/lib/utils';
import { api, describeApiError } from '@/lib/apiClient';

// ─── Server payload shapes ─────────────────────────────────────
interface SessionPayload {
  user: (User & { approvalStatus: 'pending' | 'approved' | 'rejected'; emailVerified: boolean }) | null;
  corporateProfile: CorporateProfile | null;
  vendorProfile: VendorProfile | null;
}

export interface AdminUserRecord extends User {
  approvalStatus: 'pending' | 'approved' | 'rejected';
  emailVerified: boolean;
  deletedAt?: string | null;
  rejectionReason?: string | null;
  corporateProfile: CorporateProfile | null;
  vendorProfile: VendorProfile | null;
}

export interface AuditEntry {
  id: string;
  actorEmail: string | null;
  actorRole: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface AdminStats {
  employees: Record<string, number>;
  vendors: Record<string, number>;
  rfps: { total: number; active: number; byStatus: Record<string, number> };
  bids: { total: number; accepted: number; totalQuotedValue: number };
  categories: { rfps: Record<string, number>; vendors: Record<string, number> };
}

export type ActionResult = { success: boolean; message: string };

const ok = (message: string): ActionResult => ({ success: true, message });
const fail = (message: string): ActionResult => ({ success: false, message });

interface COEStore {
  // ─── Theme & Day/Night ─────────────────────────────────────
  activeCategory: CategoryType | null;
  hoveredCategory: CategoryType | null;
  theme: ThemeConfig;
  modalOpen: boolean;
  gravitySettled: boolean;
  isNightMode: boolean;

  // ─── Session ───────────────────────────────────────────────
  currentUser: User | null;
  currentCorporateProfile: CorporateProfile | null;
  currentVendorProfile: VendorProfile | null;
  authModalOpen: boolean;
  hydrated: boolean;
  busy: boolean;

  // ─── Server-backed caches (never persisted) ────────────────
  users: AdminUserRecord[];
  corporateProfiles: CorporateProfile[];
  vendorProfiles: VendorProfile[];
  rfpList: RFP[];
  bids: Bid[];
  auditLog: AuditEntry[];
  adminStats: AdminStats | null;
  toasts: Toast[];

  // ─── Day/Night Actions ─────────────────────────────────────
  toggleNightMode: () => void;
  setNightMode: (isNight: boolean) => void;
  setHoveredCategory: (cat: CategoryType | null) => void;
  selectCategory: (category: CategoryType) => void;
  resetCategory: () => void;
  openModal: (category?: CategoryType) => void;
  closeModal: () => void;

  // ─── Toasts ────────────────────────────────────────────────
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;

  // ─── Auth ──────────────────────────────────────────────────
  openAuthModal: () => void;
  closeAuthModal: () => void;
  hydrateSession: () => Promise<void>;
  loginWithPassword: (email: string, password: string) => Promise<ActionResult>;
  registerUser: (
    input:
      | { role: 'corporate'; email: string; password: string; name?: string; officeCompanyName?: string }
      | {
          role: 'vendor';
          email: string;
          password: string;
          companyName: string;
          vendorName?: string;
          gstNumber: string;
          category: CategoryType;
          serviceAreas: string[];
          mobile?: string;
          city?: string;
        }
  ) => Promise<ActionResult>;
  resendVerification: (email: string) => Promise<ActionResult>;
  requestPasswordReset: (email: string) => Promise<ActionResult>;
  logout: () => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<ActionResult>;
  deleteAccount: (password: string) => Promise<ActionResult>;

  // ─── Profiles ──────────────────────────────────────────────
  saveCorporateProfile: (profile: Partial<CorporateProfile> & Record<string, unknown>) => Promise<ActionResult>;
  updateCorporateProfile: (profile: Partial<CorporateProfile> & Record<string, unknown>) => Promise<ActionResult>;
  saveVendorProfile: (profile: Partial<VendorProfile> & Record<string, unknown>) => Promise<ActionResult>;
  updateVendorProfile: (profile: Partial<VendorProfile> & Record<string, unknown>) => Promise<ActionResult>;

  // ─── Data loading ──────────────────────────────────────────
  loadRfps: (query?: Record<string, string>) => Promise<void>;
  loadRfpDetail: (rfpId: string) => Promise<void>;
  loadMyBids: () => Promise<void>;
  loadVendorDirectory: (query?: Record<string, string>) => Promise<void>;
  loadAdminData: () => Promise<void>;

  // ─── Corporate actions ─────────────────────────────────────
  submitRFP: (rfp: {
    category: CategoryType;
    occasion?: string;
    categoryDetails: CategoryDetails | Record<string, unknown>;
    universal: UniversalFields | Record<string, unknown>;
    serviceArea?: string;
    bidVisibility?: 'masked' | 'open';
  }) => Promise<ActionResult>;
  deleteRFP: (rfpId: string) => Promise<ActionResult>;
  acceptBid: (bidId: string, rfpId: string) => Promise<ActionResult>;
  completeRFP: (rfpId: string) => Promise<ActionResult>;
  rateVendor: (rfpId: string, rating: number, comment: string) => Promise<ActionResult>;
  getBidsForRFP: (rfpId: string) => Bid[];

  // ─── Vendor actions ────────────────────────────────────────
  submitBid: (bid: {
    rfpId: string;
    totalPrice: number;
    lineItems?: BidLineItem[];
    proposal?: string;
    validUntil?: string;
  }) => Promise<ActionResult>;
  reviseBid: (
    bidId: string,
    newPrice: number,
    newProposal: string,
    newLineItems?: BidLineItem[]
  ) => Promise<ActionResult>;
  withdrawBid: (bidId: string) => Promise<ActionResult>;
  getVendorOwnBids: () => Bid[];

  // ─── Admin actions ─────────────────────────────────────────
  adminDecide: (userId: string, decision: 'approved' | 'rejected' | 'pending', reason?: string) => Promise<ActionResult>;
  adminVerifyCorporate: (userId: string, status: 'approved' | 'rejected' | 'pending') => Promise<ActionResult>;
  adminVerifyVendor: (userId: string, status: 'approved' | 'rejected' | 'pending') => Promise<ActionResult>;
  adminToggleUserSuspension: (userId: string) => Promise<ActionResult>;
  adminDeleteUser: (userId: string) => Promise<ActionResult>;
  adminUpdateUser: (userId: string, data: Partial<AdminUserRecord>) => Promise<ActionResult>;
  adminDeleteBid: (bidId: string) => Promise<ActionResult>;
  adminUpdateBid: (bidId: string, data: { status?: 'pending' | 'rejected' | 'withdrawn' }) => Promise<ActionResult>;
  adminDeleteRFP: (rfpId: string) => Promise<ActionResult>;
}

const qs = (query?: Record<string, string>) => {
  if (!query) return '';
  const params = new URLSearchParams(
    Object.entries(query).filter(([, v]) => v !== undefined && v !== '')
  );
  const s = params.toString();
  return s ? `?${s}` : '';
};

export const useStore = create<COEStore>()(
  persist(
    (set, get) => ({
      // ─── Initial State ──────────────────────────────────────
      activeCategory: null,
      hoveredCategory: null,
      theme: DEFAULT_THEME,
      modalOpen: false,
      gravitySettled: false,
      // The product is light-only now: the cream design has no dark
      // counterpart, and a half-designed dark mode is worse than none.
      // The flag stays so the ~260 `isNightMode ? dark : light` branches
      // across the app keep resolving — always to the light one.
      isNightMode: false,

      currentUser: null,
      currentCorporateProfile: null,
      currentVendorProfile: null,
      authModalOpen: false,
      hydrated: false,
      busy: false,

      users: [],
      corporateProfiles: [],
      vendorProfiles: [],
      rfpList: [],
      bids: [],
      auditLog: [],
      adminStats: null,
      toasts: [],

      // ─── Day/Night ──────────────────────────────────────────
      toggleNightMode: () => undefined,
      setNightMode: () => undefined,
      setHoveredCategory: (cat) => set({ hoveredCategory: cat }),

      selectCategory: (category) =>
        set({ activeCategory: category, theme: THEMES[category], gravitySettled: true }),

      resetCategory: () =>
        set({ activeCategory: null, theme: DEFAULT_THEME, gravitySettled: false, modalOpen: false }),

      openModal: (category?: CategoryType) => {
        const cat = category || get().activeCategory || 'food';
        set({ activeCategory: cat, theme: THEMES[cat], modalOpen: true });
      },
      closeModal: () => set({ modalOpen: false }),

      // ─── Toasts ─────────────────────────────────────────────
      addToast: (toastData) => {
        const id = generateId();
        set((state) => ({ toasts: [...state.toasts, { ...toastData, id }] }));
        setTimeout(() => get().removeToast(id), toastData.duration || 4500);
      },
      removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

      openAuthModal: () => set({ authModalOpen: true }),
      closeAuthModal: () => set({ authModalOpen: false }),

      // ─── Session ────────────────────────────────────────────
      hydrateSession: async () => {
        try {
          const data = await api.get<SessionPayload>('/api/auth/session');
          set({
            currentUser: data.user,
            currentCorporateProfile: data.corporateProfile,
            currentVendorProfile: data.vendorProfile,
            hydrated: true,
          });
        } catch {
          set({ currentUser: null, currentCorporateProfile: null, currentVendorProfile: null, hydrated: true });
        }
      },

      loginWithPassword: async (email, password) => {
        set({ busy: true });
        try {
          const data = await api.post<SessionPayload>('/api/auth/login', { email, password });
          set({
            currentUser: data.user,
            currentCorporateProfile: data.corporateProfile,
            currentVendorProfile: data.vendorProfile,
            authModalOpen: false,
            hydrated: true,
          });
          get().addToast({
            type: 'success',
            title: 'Signed in',
            message: `Welcome back, ${data.user?.email ?? ''}`,
          });
          return ok('Signed in.');
        } catch (error) {
          const message = describeApiError(error);
          get().addToast({ type: 'error', title: 'Could not sign in', message });
          return fail(message);
        } finally {
          set({ busy: false });
        }
      },

      registerUser: async (input) => {
        set({ busy: true });
        try {
          await api.post('/api/auth/signup', input);
          get().addToast({
            type: 'success',
            title: 'Check your inbox',
            message: 'Confirm your email, then an admin reviews your account before it goes live.',
            duration: 8000,
          });
          return ok('Check your inbox to confirm your email address.');
        } catch (error) {
          const message = describeApiError(error);
          get().addToast({ type: 'error', title: 'Signup failed', message });
          return fail(message);
        } finally {
          set({ busy: false });
        }
      },

      resendVerification: async (email) => {
        try {
          await api.post('/api/auth/resend-verification', { email });
          return ok('If that address needs confirming, a new link is on its way.');
        } catch (error) {
          return fail(describeApiError(error));
        }
      },

      requestPasswordReset: async (email) => {
        try {
          await api.post('/api/auth/forgot-password', { email });
          return ok('If that address is registered, a reset link is on its way.');
        } catch (error) {
          return fail(describeApiError(error));
        }
      },

      logout: async () => {
        try {
          await api.post('/api/auth/logout');
        } catch {
          /* the cookie is cleared server-side on the next request either way */
        }
        set({
          currentUser: null,
          currentCorporateProfile: null,
          currentVendorProfile: null,
          users: [],
          corporateProfiles: [],
          vendorProfiles: [],
          rfpList: [],
          bids: [],
          auditLog: [],
          adminStats: null,
        });
        get().addToast({ type: 'info', title: 'Signed out', message: 'You have been securely signed out.' });
      },

      changePassword: async (oldPassword, newPassword) => {
        try {
          await api.post('/api/auth/change-password', {
            currentPassword: oldPassword,
            newPassword,
          });
          get().addToast({
            type: 'success',
            title: 'Password updated',
            message: 'Your other devices have been signed out.',
          });
          return ok('Password updated.');
        } catch (error) {
          const message = describeApiError(error);
          get().addToast({ type: 'error', title: 'Could not update password', message });
          return fail(message);
        }
      },

      deleteAccount: async (password) => {
        try {
          await api.post('/api/auth/delete-account', { password });
          set({
            currentUser: null,
            currentCorporateProfile: null,
            currentVendorProfile: null,
            rfpList: [],
            bids: [],
          });
          get().addToast({ type: 'info', title: 'Account closed', message: 'Sorry to see you go.' });
          return ok('Account closed.');
        } catch (error) {
          const message = describeApiError(error);
          get().addToast({ type: 'error', title: 'Could not close account', message });
          return fail(message);
        }
      },

      // ─── Profiles ───────────────────────────────────────────
      saveCorporateProfile: async (profile) => get().updateCorporateProfile(profile),

      updateCorporateProfile: async (profile) => {
        try {
          const saved = await api.put<CorporateProfile>('/api/profile/corporate', profile);
          set({ currentCorporateProfile: saved });
          get().addToast({ type: 'success', title: 'Profile saved', message: 'Your company details are up to date.' });
          return ok('Profile saved.');
        } catch (error) {
          const message = describeApiError(error);
          get().addToast({ type: 'error', title: 'Could not save profile', message });
          return fail(message);
        }
      },

      saveVendorProfile: async (profile) => get().updateVendorProfile(profile),

      updateVendorProfile: async (profile) => {
        try {
          const saved = await api.put<VendorProfile>('/api/profile/vendor', profile);
          set({ currentVendorProfile: saved });
          get().addToast({ type: 'success', title: 'Profile saved', message: 'Your listing is up to date.' });
          return ok('Profile saved.');
        } catch (error) {
          const message = describeApiError(error);
          get().addToast({ type: 'error', title: 'Could not save profile', message });
          return fail(message);
        }
      },

      // ─── Loading ────────────────────────────────────────────
      loadRfps: async (query) => {
        try {
          const data = await api.get<{ rfps: RFP[] }>(`/api/rfps${qs(query)}`);
          set({ rfpList: data.rfps });
        } catch (error) {
          if ((error as { status?: number }).status !== 401) {
            console.warn('[store] loadRfps', error);
          }
        }
      },

      loadRfpDetail: async (rfpId) => {
        try {
          const data = await api.get<{ rfp: RFP; bids: Bid[] }>(`/api/rfps/${encodeURIComponent(rfpId)}`);
          set((state) => ({
            rfpList: state.rfpList.some((r) => r.id === data.rfp.id)
              ? state.rfpList.map((r) => (r.id === data.rfp.id ? data.rfp : r))
              : [data.rfp, ...state.rfpList],
            bids: [...state.bids.filter((b) => b.rfpId !== rfpId), ...data.bids],
          }));
        } catch (error) {
          console.warn('[store] loadRfpDetail', error);
        }
      },

      loadMyBids: async () => {
        try {
          const data = await api.get<{ bids: (Bid & { rfp: RFP })[] }>('/api/bids');
          set((state) => {
            const rfpsFromBids = data.bids.map((b) => b.rfp).filter(Boolean);
            const merged = [...state.rfpList];
            for (const r of rfpsFromBids) {
              if (!merged.some((x) => x.id === r.id)) merged.push(r);
            }
            return { bids: data.bids, rfpList: merged };
          });
        } catch (error) {
          console.warn('[store] loadMyBids', error);
        }
      },

      loadVendorDirectory: async (query) => {
        try {
          const data = await api.get<{ vendors: VendorProfile[] }>(`/api/vendors${qs(query)}`);
          set({ vendorProfiles: data.vendors });
        } catch (error) {
          console.warn('[store] loadVendorDirectory', error);
        }
      },

      loadAdminData: async () => {
        try {
          const [usersData, rfpData, bidData, statsData, auditData] = await Promise.all([
            api.get<{ users: AdminUserRecord[] }>('/api/admin/users?limit=100'),
            api.get<{ rfps: RFP[] }>('/api/admin/rfps?limit=100'),
            api.get<{ bids: Bid[] }>('/api/admin/bids?limit=100'),
            api.get<AdminStats>('/api/admin/stats'),
            api.get<{ entries: AuditEntry[] }>('/api/admin/audit?limit=100'),
          ]);
          set({
            users: usersData.users,
            corporateProfiles: usersData.users
              .map((u) => u.corporateProfile)
              .filter((p): p is CorporateProfile => Boolean(p)),
            vendorProfiles: usersData.users
              .map((u) => u.vendorProfile)
              .filter((p): p is VendorProfile => Boolean(p)),
            rfpList: rfpData.rfps,
            bids: bidData.bids,
            adminStats: statsData,
            auditLog: auditData.entries,
          });
        } catch (error) {
          console.warn('[store] loadAdminData', error);
        }
      },

      // ─── Corporate ──────────────────────────────────────────
      submitRFP: async (rfp) => {
        try {
          await api.post('/api/rfps', rfp);
          await get().loadRfps();
          get().addToast({
            type: 'success',
            title: 'Requirement posted',
            message: 'Vendors in this category can start bidding now.',
          });
          return ok('Requirement posted.');
        } catch (error) {
          const message = describeApiError(error);
          get().addToast({ type: 'error', title: 'Could not post requirement', message });
          return fail(message);
        }
      },

      deleteRFP: async (rfpId) => {
        try {
          await api.del(`/api/rfps/${encodeURIComponent(rfpId)}`);
          set((state) => ({ rfpList: state.rfpList.filter((r) => r.id !== rfpId) }));
          get().addToast({ type: 'warning', title: 'Requirement withdrawn', message: 'Open bids were closed.' });
          return ok('Requirement withdrawn.');
        } catch (error) {
          const message = describeApiError(error);
          get().addToast({ type: 'error', title: 'Could not withdraw', message });
          return fail(message);
        }
      },

      acceptBid: async (bidId, rfpId) => {
        try {
          const result = await api.post<{ vendorCompany: string }>(
            `/api/rfps/${encodeURIComponent(rfpId)}/award`,
            { bidId }
          );
          await get().loadRfpDetail(rfpId);
          get().addToast({
            type: 'success',
            title: 'Bid awarded',
            message: `${result.vendorCompany} has been notified.`,
          });
          return ok('Bid awarded.');
        } catch (error) {
          const message = describeApiError(error);
          get().addToast({ type: 'error', title: 'Could not award bid', message });
          return fail(message);
        }
      },

      completeRFP: async (rfpId) => {
        try {
          await api.post(`/api/rfps/${encodeURIComponent(rfpId)}/complete`);
          await get().loadRfpDetail(rfpId);
          get().addToast({ type: 'success', title: 'Marked complete', message: 'You can now rate the vendor.' });
          return ok('Marked complete.');
        } catch (error) {
          const message = describeApiError(error);
          get().addToast({ type: 'error', title: 'Could not mark complete', message });
          return fail(message);
        }
      },

      rateVendor: async (rfpId, rating, comment) => {
        try {
          await api.post('/api/reviews', { rfpId, rating, comment });
          await get().loadRfpDetail(rfpId);
          get().addToast({ type: 'success', title: 'Thanks for the rating', message: 'It helps the next team pick well.' });
          return ok('Rating saved.');
        } catch (error) {
          const message = describeApiError(error);
          get().addToast({ type: 'error', title: 'Could not save rating', message });
          return fail(message);
        }
      },

      getBidsForRFP: (rfpId) => get().bids.filter((b) => b.rfpId === rfpId),

      // ─── Vendor ─────────────────────────────────────────────
      submitBid: async (bid) => {
        try {
          await api.post(`/api/rfps/${encodeURIComponent(bid.rfpId)}/bids`, {
            rfpId: bid.rfpId,
            totalPrice: bid.totalPrice,
            lineItems: bid.lineItems ?? [],
            proposal: bid.proposal ?? '',
            validUntil: bid.validUntil,
          });
          await get().loadMyBids();
          get().addToast({ type: 'success', title: 'Bid submitted', message: 'The poster can see your quote now.' });
          return ok('Bid submitted.');
        } catch (error) {
          const message = describeApiError(error);
          get().addToast({ type: 'error', title: 'Could not submit bid', message });
          return fail(message);
        }
      },

      reviseBid: async (bidId, newPrice, newProposal, newLineItems) => {
        try {
          await api.patch(`/api/bids/${encodeURIComponent(bidId)}`, {
            totalPrice: newPrice,
            proposal: newProposal,
            ...(newLineItems ? { lineItems: newLineItems } : {}),
          });
          await get().loadMyBids();
          get().addToast({ type: 'success', title: 'Bid revised', message: 'Your updated quote is live.' });
          return ok('Bid revised.');
        } catch (error) {
          const message = describeApiError(error);
          get().addToast({ type: 'error', title: 'Could not revise bid', message });
          return fail(message);
        }
      },

      withdrawBid: async (bidId) => {
        try {
          await api.del(`/api/bids/${encodeURIComponent(bidId)}`);
          await get().loadMyBids();
          get().addToast({ type: 'warning', title: 'Bid withdrawn', message: 'Your quote has been pulled.' });
          return ok('Bid withdrawn.');
        } catch (error) {
          const message = describeApiError(error);
          get().addToast({ type: 'error', title: 'Could not withdraw bid', message });
          return fail(message);
        }
      },

      getVendorOwnBids: () => get().bids,

      // ─── Admin ──────────────────────────────────────────────
      adminDecide: async (userId, decision, reason) => {
        try {
          await api.post(`/api/admin/approvals/${encodeURIComponent(userId)}`, { decision, reason });
          await get().loadAdminData();
          get().addToast({
            type: decision === 'approved' ? 'success' : 'warning',
            title: `Account ${decision}`,
            message: 'The account holder has been emailed.',
          });
          return ok(`Account ${decision}.`);
        } catch (error) {
          const message = describeApiError(error);
          get().addToast({ type: 'error', title: 'Action failed', message });
          return fail(message);
        }
      },

      adminVerifyCorporate: async (userId, status) => get().adminDecide(userId, status),
      adminVerifyVendor: async (userId, status) => get().adminDecide(userId, status),

      adminToggleUserSuspension: async (userId) => {
        const target = get().users.find((u) => u.id === userId);
        if (!target) return fail('That account is not loaded.');
        return get().adminUpdateUser(userId, { isSuspended: !target.isSuspended });
      },

      adminUpdateUser: async (userId, data) => {
        try {
          await api.patch(`/api/admin/users/${encodeURIComponent(userId)}`, {
            ...(data.isSuspended !== undefined ? { isSuspended: data.isSuspended } : {}),
            ...(data.approvalStatus !== undefined ? { approvalStatus: data.approvalStatus } : {}),
          });
          await get().loadAdminData();
          get().addToast({ type: 'success', title: 'Account updated', message: 'Change recorded in the audit log.' });
          return ok('Account updated.');
        } catch (error) {
          const message = describeApiError(error);
          get().addToast({ type: 'error', title: 'Could not update account', message });
          return fail(message);
        }
      },

      adminDeleteUser: async (userId) => {
        try {
          await api.del(`/api/admin/users/${encodeURIComponent(userId)}`);
          await get().loadAdminData();
          get().addToast({
            type: 'warning',
            title: 'Account closed',
            message: 'Soft-deleted — their history stays intact for the audit trail.',
          });
          return ok('Account closed.');
        } catch (error) {
          const message = describeApiError(error);
          get().addToast({ type: 'error', title: 'Could not close account', message });
          return fail(message);
        }
      },

      adminDeleteBid: async (bidId) => {
        try {
          await api.del(`/api/admin/bids/${encodeURIComponent(bidId)}`);
          await get().loadAdminData();
          get().addToast({ type: 'warning', title: 'Bid removed', message: 'Recorded in the audit log.' });
          return ok('Bid removed.');
        } catch (error) {
          const message = describeApiError(error);
          get().addToast({ type: 'error', title: 'Could not remove bid', message });
          return fail(message);
        }
      },

      adminUpdateBid: async (bidId, data) => {
        try {
          await api.patch(`/api/admin/bids/${encodeURIComponent(bidId)}`, data);
          await get().loadAdminData();
          get().addToast({ type: 'success', title: 'Bid updated', message: 'Recorded in the audit log.' });
          return ok('Bid updated.');
        } catch (error) {
          const message = describeApiError(error);
          get().addToast({ type: 'error', title: 'Could not update bid', message });
          return fail(message);
        }
      },

      adminDeleteRFP: async (rfpId) => {
        try {
          await api.del(`/api/admin/rfps/${encodeURIComponent(rfpId)}`);
          await get().loadAdminData();
          get().addToast({ type: 'warning', title: 'Requirement removed', message: 'Recorded in the audit log.' });
          return ok('Requirement removed.');
        } catch (error) {
          const message = describeApiError(error);
          get().addToast({ type: 'error', title: 'Could not remove requirement', message });
          return fail(message);
        }
      },
    }),
    {
      name: 'coe-ui-preferences-v1',
      // Only cosmetic preferences survive a reload. Identity and business data
      // are fetched from the server every time.
      partialize: () => ({}),
    }
  )
);
