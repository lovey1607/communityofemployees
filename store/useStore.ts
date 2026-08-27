// ============================================================
// store/useStore.ts — Global Zustand state management with RBAC
// Full Authentication (Email + Password / OTP), Multi-Role Profiles,
// Corporate Bid Evaluation, Vendor Blind Bidding, and Admin Suite.
// ============================================================

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
  Toast,
} from '@/lib/types';
import { THEMES, DEFAULT_THEME, ThemeConfig } from '@/lib/themes';
import { generateId } from '@/lib/utils';
import {
  SEED_USERS,
  SEED_CORPORATE_PROFILES,
  SEED_VENDOR_PROFILES,
  SEED_RFPS,
  SEED_BIDS,
} from '@/lib/mockDatabase';
import { GURUGRAM_PRESEEDED_VENUES } from '@/data/venues';

export function findPreseededVenueProfile(email: string, userId?: string): VendorProfile | undefined {
  const cleanEmail = email.trim().toLowerCase();
  const venue = GURUGRAM_PRESEEDED_VENUES.find(
    (v) => v.email.toLowerCase() === cleanEmail || (userId && `user_venue_${v.sanitizedKey}` === userId)
  );
  if (!venue) return undefined;

  return {
    id: `vp_venue_${venue.sanitizedKey}`,
    userId: userId || `user_venue_${venue.sanitizedKey}`,
    category: venue.category,
    vendorName: `${venue.name} Representative`,
    companyName: venue.name,
    mobile: venue.phone,
    companyMobile: venue.companyPhone,
    address: venue.address,
    city: venue.city,
    locality: venue.locality,
    distanceKm: venue.distanceKm,
    entityType: venue.entityType || 'Pvt Ltd',
    gstNumber: venue.gstNumber,
    gstVerified: true,
    portfolioSummary: venue.description,
    corporateSuitability: venue.corporateSuitability,
    pastClients: venue.pastClients || [],
    status: 'approved',
    isCompleted: true,
    submittedAt: '2026-07-20T10:00:00Z',
    verifiedAt: '2026-07-20T12:00:00Z',
    place_id: venue.place_id,
    formatted_address: venue.address,
    placeName: venue.name,
    lat: venue.lat,
    lng: venue.lng,
    rating: venue.rating,
    user_ratings_total: venue.user_ratings_total,
    timings: venue.timings,
    amenities: venue.amenities,
    avgCostPerPerson: venue.avgCostPerPerson,
  };
}

interface COEStore {
  // ─── Theme & Day/Night ─────────────────────────────────────
  activeCategory: CategoryType | null;
  hoveredCategory: CategoryType | null;
  theme: ThemeConfig;
  modalOpen: boolean;
  gravitySettled: boolean;
  isNightMode: boolean;

  // ─── Authentication & RBAC State ───────────────────────────
  currentUser: User | null;
  currentCorporateProfile: CorporateProfile | null;
  currentVendorProfile: VendorProfile | null;
  authModalOpen: boolean;
  generatedOtp: { email: string; code: string; role: UserRole } | null;

  // ─── Relational Database Tables ────────────────────────────
  users: User[];
  corporateProfiles: CorporateProfile[];
  vendorProfiles: VendorProfile[];
  rfpList: RFP[];
  bids: Bid[];
  toasts: Toast[];

  // ─── Day/Night Actions ─────────────────────────────────────
  toggleNightMode: () => void;
  setNightMode: (isNight: boolean) => void;
  setHoveredCategory: (cat: CategoryType | null) => void;
  selectCategory: (category: CategoryType) => void;
  resetCategory: () => void;
  openModal: (category?: CategoryType) => void;
  closeModal: () => void;

  // ─── Toast Notifications ───────────────────────────────────
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;

  // ─── Auth & Onboarding Actions ─────────────────────────────
  openAuthModal: () => void;
  closeAuthModal: () => void;
  loginWithPassword: (email: string, password: string, role: UserRole) => boolean;
  registerUser: (email: string, password: string, role: UserRole) => boolean;
  sendOtp: (email: string, role: UserRole) => string;
  verifyOtp: (email: string, code: string) => { success: boolean; isNewUser: boolean; role: UserRole };
  switchPersona: (role: UserRole, specificEmail?: string) => void;
  logout: () => void;
  saveCorporateProfile: (profile: Omit<CorporateProfile, 'id' | 'userId' | 'email' | 'isCompleted' | 'status'>) => void;
  updateCorporateProfile: (profile: Partial<CorporateProfile>) => void;
  saveVendorProfile: (profile: Omit<VendorProfile, 'id' | 'userId' | 'status' | 'isCompleted' | 'gstVerified'>) => void;
  updateVendorProfile: (profile: Partial<VendorProfile>) => void;
  registerNewVenue: (venueData: Omit<VendorProfile, 'id' | 'userId' | 'status' | 'isCompleted' | 'gstVerified'>) => void;
  changePassword: (oldPassword: string, newPassword: string) => { success: boolean; message: string };

  // ─── Corporate Actions ─────────────────────────────────────
  submitRFP: (rfp: Omit<RFP, 'id' | 'submittedAt' | 'status' | 'corporateId' | 'corporateUserId' | 'companyName' | 'totalBudget'>) => void;
  deleteRFP: (rfpId: string) => void;
  acceptBid: (bidId: string, rfpId: string) => void;
  getBidsForRFP: (rfpId: string) => Bid[];

  // ─── Vendor Actions ───────────────────────────────────────
  submitBid: (bid: Omit<Bid, 'id' | 'submittedAt' | 'status' | 'vendorId' | 'vendorUserId' | 'vendorName' | 'vendorCompany' | 'distanceKm' | 'matchPercentage'>) => void;
  reviseBid: (bidId: string, newPrice: number, newProposal: string, newLineItems?: BidLineItem[]) => void;
  getVendorOwnBids: (vendorUserId: string) => Bid[];

  // ─── Self-Service Account Management ────────────────────
  deleteAccount: () => void;
  withdrawBid: (bidId: string) => void;

  // ─── Admin Actions ────────────────────────────────────────
  adminVerifyCorporate: (corporateId: string, status: 'approved' | 'rejected' | 'pending') => void;
  adminVerifyVendor: (vendorId: string, status: 'approved' | 'rejected' | 'pending') => void;
  adminToggleUserSuspension: (userId: string) => void;
  adminDeleteUser: (userId: string) => void;
  adminUpdateUser: (userId: string, data: Partial<User>) => void;
  adminDeleteVendorProfile: (vendorId: string) => void;
  adminDeleteBid: (bidId: string) => void;
  adminUpdateBid: (bidId: string, data: Partial<Bid>) => void;
}

export const useStore = create<COEStore>()(
  persist(
    (set, get) => ({
      // ─── Initial State ──────────────────────────────────────
      activeCategory: null,
      hoveredCategory: null,
      theme: DEFAULT_THEME,
      modalOpen: false,
      gravitySettled: false,
      isNightMode: true,

      // No user auto-logged in — all users must sign in from the homepage
      currentUser: null,
      currentCorporateProfile: null,
      currentVendorProfile: null,
      authModalOpen: false,
      generatedOtp: null,

      // Initial Tables seeded from mock database
      users: SEED_USERS,
      corporateProfiles: SEED_CORPORATE_PROFILES,
      vendorProfiles: SEED_VENDOR_PROFILES,
      rfpList: SEED_RFPS,
      bids: SEED_BIDS,
      toasts: [],

      // ─── Day/Night Actions ──────────────────────────────────
      toggleNightMode: () => set((state) => ({ isNightMode: !state.isNightMode })),
      setNightMode: (isNight) => set({ isNightMode: isNight }),
      setHoveredCategory: (cat) => set({ hoveredCategory: cat }),

      selectCategory: (category) =>
        set({
          activeCategory: category,
          theme: THEMES[category],
          gravitySettled: true,
        }),

      resetCategory: () =>
        set({
          activeCategory: null,
          theme: DEFAULT_THEME,
          gravitySettled: false,
          modalOpen: false,
        }),

      openModal: (category?: CategoryType) => {
        const cat = category || get().activeCategory || 'food';
        set({
          activeCategory: cat,
          theme: THEMES[cat],
          modalOpen: true,
        });
      },
      closeModal: () => set({ modalOpen: false }),

      // ─── Toast Notifications ─────────────────────────────────
      addToast: (toastData) => {
        const id = generateId();
        const newToast: Toast = { ...toastData, id };
        set((state) => ({ toasts: [...state.toasts, newToast] }));

        // Auto remove after duration
        setTimeout(() => {
          get().removeToast(id);
        }, toastData.duration || 4500);
      },

      removeToast: (id) => {
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
      },

      // ─── Auth Modal ──────────────────────────────────────────
      openAuthModal: () => set({ authModalOpen: true }),
      closeAuthModal: () => set({ authModalOpen: false }),

      // ─── Test Password / Direct Authentication ───────────────
      loginWithPassword: (email, password, role) => {
        const cleanEmail = email.trim().toLowerCase();
        const state = get();

        // Check if this is one of our 33 verified pre-seeded Gurugram venues
        const preseededVenue = findPreseededVenueProfile(cleanEmail);

        // Known test credentials (base seed passwords)
        const KNOWN_PASSWORDS: Record<string, string> = {
          'admin@coe.com': 'test1234',
          'hr@nexus.com': 'test1234',
          'admin.ops@apexfin.com': 'test1234',
          'people@indigotec.com': 'test1234',
          'sports@arenaturf.com': 'test1234',
          'food@royalfeast.in': 'test1234',
          'trips@summitretreats.in': 'test1234',
          'gifts@luxehampers.com': 'test1234',
          'dress@threadsco.in': 'test1234',
          'sports2@proleagues.in': 'test1234',
          'food2@cyberhubgourmet.com': 'test1234',
          'trips2@wandercraft.in': 'test1234',
          'gifts2@arcadeawards.com': 'test1234',
          'dress2@brandwear.in': 'test1234',
        };

        // Determine the expected password
        const preseededPassword = preseededVenue ? (preseededVenue as any)._defaultPassword || 'gurgaon123' : null;
        const knownPassword = KNOWN_PASSWORDS[cleanEmail];
        const expectedPassword = knownPassword || preseededPassword;

        // Match existing seed user by email
        let user = state.users.find((u) => u.email.toLowerCase() === cleanEmail);

        // Validate password for existing users
        if (user) {
          // Check suspension first
          if (user.isSuspended) {
            get().addToast({ type: 'error', title: '🚫 Account Suspended', message: 'Your account has been suspended. Contact admin@coe.com.' });
            return false;
          }
          // Validate password: check stored password or known default
          const storedPass = user.password;
          const validPass = storedPass || expectedPassword || 'gurgaon123';
          if (password && validPass && password !== validPass) {
            get().addToast({ type: 'error', title: '❌ Invalid Credentials', message: 'Incorrect password. Please try again.' });
            return false;
          }
        }

        if (!user) {
          // Create user on-the-fly for new pre-seeded venue logins
          if (!preseededVenue && expectedPassword && password !== expectedPassword) {
            get().addToast({ type: 'error', title: '❌ Invalid Credentials', message: 'Incorrect email or password.' });
            return false;
          }
          user = {
            id: preseededVenue ? preseededVenue.userId : `user_${generateId()}`,
            email: cleanEmail,
            role: preseededVenue ? 'vendor' : role,
            createdAt: new Date().toISOString(),
            isSuspended: false,
          };
          set((s) => ({ users: [...s.users, user!] }));
        }

        // Find matching profiles in current state or from pre-seeded directory
        let corpProf = state.corporateProfiles.find(
          (p) => p.userId === user!.id || p.email?.toLowerCase() === cleanEmail
        );
        let vendorProf = state.vendorProfiles.find((p) => p.userId === user!.id) || preseededVenue;

        if (preseededVenue) {
          vendorProf = preseededVenue;
          // Ensure profile is in state.vendorProfiles
          if (!state.vendorProfiles.some((p) => p.id === preseededVenue.id || p.userId === user!.id)) {
            set((s) => ({ vendorProfiles: [...s.vendorProfiles, preseededVenue] }));
          }
        }

        // Auto-create minimal profile only for unknown corporate users
        if (role === 'corporate' && !corpProf && !preseededVenue) {
          corpProf = {
            id: `corp_${generateId()}`,
            userId: user.id,
            name: 'Corporate Officer',
            mobile: '9811200000',
            email: cleanEmail,
            officeCompanyName: 'New Corporate Account',
            officeAddress: 'DLF Cyber City, Gurugram',
            city: 'Gurugram',
            position: 'Manager',
            department: 'Operations',
            isCompleted: false,
            status: 'pending',
            submittedAt: new Date().toISOString(),
          };
          set((s) => ({ corporateProfiles: [...s.corporateProfiles, corpProf!] }));
        }

        const effectiveRole = preseededVenue ? 'vendor' : role;

        set({
          currentUser: user,
          currentCorporateProfile: effectiveRole === 'corporate' ? (corpProf || null) : null,
          currentVendorProfile: effectiveRole === 'vendor' ? (vendorProf || null) : null,
          authModalOpen: false,
        });

        get().addToast({
          type: 'success',
          title: `✅ Logged in as ${effectiveRole.toUpperCase()}`,
          message: preseededVenue
            ? `Welcome ${preseededVenue.companyName} (${preseededVenue.category.toUpperCase()})`
            : `Authenticated successfully: ${cleanEmail}`,
        });

        return true;
      },

      registerUser: (email, password, role) => {
        const cleanEmail = email.trim().toLowerCase();
        const state = get();
        const preseededVenue = findPreseededVenueProfile(cleanEmail);

        // Check if user already exists
        const existingUser = state.users.find((u) => u.email.toLowerCase() === cleanEmail);
        if (existingUser) {
          const existingCorp = state.corporateProfiles.find((p) => p.userId === existingUser.id);
          const existingVen = state.vendorProfiles.find((p) => p.userId === existingUser.id) || preseededVenue;
          set({
            currentUser: existingUser,
            currentCorporateProfile: existingCorp || null,
            currentVendorProfile: existingVen || null,
            authModalOpen: false,
          });
          return true;
        }

        // Create brand new user without pre-filled profile
        const newUser: User = {
          id: preseededVenue ? preseededVenue.userId : `user_${generateId()}`,
          email: cleanEmail,
          role: preseededVenue ? 'vendor' : role,
          createdAt: new Date().toISOString(),
          isSuspended: false,
        };

        const initialVendor = preseededVenue || null;
        if (preseededVenue) {
          set((s) => ({
            users: [...s.users, newUser],
            vendorProfiles: s.vendorProfiles.some((p) => p.id === preseededVenue.id)
              ? s.vendorProfiles
              : [...s.vendorProfiles, preseededVenue],
          }));
        } else {
          set((s) => ({ users: [...s.users, newUser] }));
        }

        set({
          currentUser: newUser,
          currentCorporateProfile: null,
          currentVendorProfile: initialVendor,
          authModalOpen: false,
        });

        get().addToast({
          type: 'success',
          title: 'Account Registered',
          message: `Account created for ${cleanEmail}. Please complete your KYC profile.`,
        });

        return true;
      },

      // ─── OTP Authentication Flow ─────────────────────────────
      sendOtp: (email, role) => {
        const cleanEmail = email.trim().toLowerCase();
        // Generate a clean 6-digit OTP code (always '123456' for rapid testing in dev)
        const code = '123456';
        set({ generatedOtp: { email: cleanEmail, code, role } });

        get().addToast({
          type: 'info',
          title: '🔑 Verification Code Sent',
          message: `Test OTP is: ${code} (sent to ${cleanEmail})`,
          duration: 8000,
        });

        return code;
      },

      verifyOtp: (email, code) => {
        const cleanEmail = email.trim().toLowerCase();
        const pending = get().generatedOtp;

        // In test mode: accept '123456' or the generated code
        const isValid =
          (pending && pending.email.toLowerCase() === cleanEmail && pending.code === code) ||
          code === '123456';

        if (!isValid) {
          get().addToast({
            type: 'error',
            title: 'Invalid OTP Code',
            message: 'The 6-digit code you entered is incorrect or has expired.',
          });
          return { success: false, isNewUser: false, role: 'corporate' };
        }

        const state = get();
        const preseededVenue = findPreseededVenueProfile(cleanEmail);
        let existingUser = state.users.find((u) => u.email.toLowerCase() === cleanEmail);

        // Block suspended users
        if (existingUser?.isSuspended) {
          get().addToast({ type: 'error', title: '🚫 Account Suspended', message: 'Your account has been suspended. Contact admin@coe.com.' });
          return { success: false, isNewUser: false, role: 'corporate' };
        }

        const selectedRole = preseededVenue ? 'vendor' : (pending?.role || 'corporate');

        let isNewUser = false;
        if (!existingUser) {
          isNewUser = !preseededVenue;
          existingUser = {
            id: preseededVenue ? preseededVenue.userId : `user_${generateId()}`,
            email: cleanEmail,
            role: selectedRole,
            createdAt: new Date().toISOString(),
            isSuspended: false,
          };
          set((s) => ({ users: [...s.users, existingUser!] }));
        }

        const corpProf = state.corporateProfiles.find((p) => p.userId === existingUser!.id);
        let vendorProf = state.vendorProfiles.find((p) => p.userId === existingUser!.id) || preseededVenue;

        if (preseededVenue && !state.vendorProfiles.some((p) => p.id === preseededVenue.id)) {
          set((s) => ({ vendorProfiles: [...s.vendorProfiles, preseededVenue] }));
        }

        set({
          currentUser: existingUser,
          currentCorporateProfile: corpProf || null,
          currentVendorProfile: vendorProf || null,
          generatedOtp: null,
          authModalOpen: false,
        });

        get().addToast({
          type: 'success',
          title: '✅ Successfully Authenticated',
          message: `Logged in as ${cleanEmail} (${existingUser.role.toUpperCase()})`,
        });

        return {
          success: true,
          isNewUser,
          role: existingUser.role,
        };
      },

      // ─── Persona Switcher (For rapid testing across all roles) ──
      switchPersona: (role, specificEmail) => {
        const state = get();
        let targetUser: User | undefined;
        const cleanEmail = specificEmail?.trim().toLowerCase();
        const preseededVenue = cleanEmail ? findPreseededVenueProfile(cleanEmail) : undefined;

        if (cleanEmail) {
          targetUser = state.users.find((u) => u.email.toLowerCase() === cleanEmail);
          if (!targetUser && preseededVenue) {
            targetUser = {
              id: preseededVenue.userId,
              email: cleanEmail,
              role: 'vendor',
              createdAt: '2026-07-20T10:00:00Z',
              isSuspended: false,
            };
            set((s) => ({ users: [...s.users, targetUser!] }));
          }
        } else {
          targetUser = state.users.find((u) => u.role === role);
        }

        if (!targetUser) return;

        const corpProf = state.corporateProfiles.find((p) => p.userId === targetUser.id);
        let vendorProf = state.vendorProfiles.find((p) => p.userId === targetUser.id) || preseededVenue;

        if (preseededVenue && !state.vendorProfiles.some((p) => p.id === preseededVenue.id)) {
          set((s) => ({ vendorProfiles: [...s.vendorProfiles, preseededVenue] }));
        }

        set({
          currentUser: targetUser,
          currentCorporateProfile: corpProf || null,
          currentVendorProfile: vendorProf || null,
        });

        const roleLabel =
          role === 'corporate'
            ? 'Corporate Employee (Demand Side)'
            : role === 'vendor'
            ? `Vendor (${vendorProf?.category.toUpperCase() || 'SUPPLY'})`
            : 'Super Admin (Control Center)';

        get().addToast({
          type: 'info',
          title: `Switched to ${role.toUpperCase()}`,
          message: `Active persona: ${targetUser.email} · ${roleLabel}`,
        });
      },

      logout: () => {
        set({
          currentUser: null,
          currentCorporateProfile: null,
          currentVendorProfile: null,
        });
        get().addToast({
          type: 'info',
          title: 'Logged Out',
          message: 'You have been securely signed out.',
        });
      },

      // ─── Onboarding & Profile Updaters ───────────────────────
      saveCorporateProfile: (profileData) => {
        const state = get();
        const user = state.currentUser;
        if (!user) return;

        const newProf: CorporateProfile = {
          ...profileData,
          id: `corp_prof_${generateId()}`,
          userId: user.id,
          email: user.email,
          isCompleted: true,
          status: 'pending',
          submittedAt: new Date().toISOString(),
        };

        set((s) => ({
          corporateProfiles: [
            ...s.corporateProfiles.filter((p) => p.userId !== user.id),
            newProf,
          ],
          currentCorporateProfile: newProf,
        }));

        get().addToast({
          type: 'info',
          title: '🏢 Corporate Profile Submitted',
          message: `Welcome ${profileData.name}! Your account is pending verification by the COE Admin.`,
        });
      },

      updateCorporateProfile: (profileData) => {
        const state = get();
        const current = state.currentCorporateProfile;
        if (!current) return;

        const updated: CorporateProfile = {
          ...current,
          ...profileData,
        };

        set((s) => ({
          corporateProfiles: s.corporateProfiles.map((p) => (p.id === current.id ? updated : p)),
          currentCorporateProfile: updated,
        }));

        get().addToast({
          type: 'success',
          title: 'Profile Updated',
          message: 'Corporate profile details saved successfully.',
        });
      },

      saveVendorProfile: (profileData) => {
        const state = get();
        const user = state.currentUser;
        if (!user) return;

        const newProf: VendorProfile = {
          ...profileData,
          id: `vendor_prof_${generateId()}`,
          userId: user.id,
          isCompleted: true,
          status: 'pending',
          gstVerified: false,
          submittedAt: new Date().toISOString(),
        };

        set((s) => ({
          vendorProfiles: [
            ...s.vendorProfiles.filter((p) => p.userId !== user.id),
            newProf,
          ],
          currentVendorProfile: newProf,
        }));

        get().addToast({
          type: 'success',
          title: '🏪 Vendor Profile Submitted',
          message: 'Your onboarding profile and GSTIN are in queue for Admin verification.',
        });
      },

      updateVendorProfile: (profileData) => {
        const state = get();
        const current = state.currentVendorProfile;
        if (!current) return;

        const updated: VendorProfile = {
          ...current,
          ...profileData,
        };

        set((s) => ({
          vendorProfiles: s.vendorProfiles.map((v) => (v.id === current.id ? updated : v)),
          currentVendorProfile: updated,
        }));

        get().addToast({
          type: 'success',
          title: 'Vendor Profile Updated',
          message: 'Your vendor details, service range, and references have been saved.',
        });
      },

      registerNewVenue: (venueData) => {
        const state = get();
        const user = state.currentUser;
        if (!user) return;

        const newProf: VendorProfile = {
          ...venueData,
          id: `vp_venue_${generateId()}`,
          userId: user.id,
          isCompleted: true,
          status: 'approved',
          gstVerified: true,
          submittedAt: new Date().toISOString(),
          verifiedAt: new Date().toISOString(),
          distanceKm: venueData.distanceKm || Math.round((Math.random() * 6 + 1.5) * 10) / 10,
          rating: venueData.rating || 4.7,
          user_ratings_total: venueData.user_ratings_total || 64,
        };

        set((s) => ({
          vendorProfiles: [newProf, ...s.vendorProfiles],
          currentVendorProfile: newProf,
        }));

        get().addToast({
          type: 'success',
          title: '🎉 New Venue Registered',
          message: `${venueData.companyName} has been registered and verified in Gurugram!`,
        });
      },

      changePassword: (oldPassword, newPassword) => {
        const state = get();
        const user = state.currentUser;
        if (!user) return { success: false, message: 'Not logged in' };

        const currentPass = user.password || 'gurgaon123';
        if (oldPassword !== currentPass && oldPassword !== 'gurgaon123' && oldPassword !== 'test1234') {
          get().addToast({
            type: 'error',
            title: 'Password Change Failed',
            message: 'Current password does not match.',
          });
          return { success: false, message: 'Current password is incorrect' };
        }

        const updatedUser: User = { ...user, password: newPassword };
        set((s) => ({
          currentUser: updatedUser,
          users: s.users.map((u) => (u.id === user.id ? updatedUser : u)),
        }));

        get().addToast({
          type: 'success',
          title: '🔒 Password Updated',
          message: 'Your account credentials have been successfully updated.',
        });
        return { success: true, message: 'Password updated successfully' };
      },

      // ─── Corporate RFP Actions ───────────────────────────────
      submitRFP: (rfpData) => {
        const state = get();
        const user = state.currentUser;
        const corp = state.currentCorporateProfile;

        if (!user || user.role !== 'corporate' || !corp) {
          get().addToast({
            type: 'error',
            title: '🔒 Sign In Required',
            message: 'You must be logged in as a Corporate to publish an RFP.',
          });
          return;
        }

        if (corp.status !== 'approved') {
          get().addToast({
            type: 'warning',
            title: '⏳ Verification Pending',
            message: 'Your corporate profile is awaiting Admin approval before you can publish RFPs.',
          });
          return;
        }

        const totalBudget = rfpData.universal.persons * rfpData.universal.budgetPerPerson;

        const newRFP: RFP = {
          ...rfpData,
          id: `rfp_${generateId()}`,
          corporateId: corp.id,
          corporateUserId: user.id,
          companyName: corp.officeCompanyName,
          totalBudget,
          submittedAt: new Date().toISOString(),
          status: 'open',
        };

        set((s) => ({ rfpList: [newRFP, ...s.rfpList] }));

        get().addToast({
          type: 'success',
          title: '🎉 Corporate RFP Published',
          message: `Live Auction created for ${rfpData.category.toUpperCase()} (${rfpData.universal.persons} pax)!`,
        });
      },

      deleteRFP: (rfpId) => {
        const state = get();
        const user = state.currentUser;
        const rfp = state.rfpList.find((r) => r.id === rfpId);
        // Ownership guard: only the RFP owner or admin can delete
        if (!rfp) return;
        if (user?.role !== 'admin' && rfp.corporateUserId !== user?.id) {
          get().addToast({ type: 'error', title: '🔒 Unauthorized', message: 'You can only delete your own RFPs.' });
          return;
        }
        set((s) => ({
          rfpList: s.rfpList.filter((r) => r.id !== rfpId),
          bids: s.bids.filter((b) => b.rfpId !== rfpId),
        }));

        get().addToast({
          type: 'info',
          title: 'RFP Removed',
          message: 'The requirement and associated bids have been removed.',
        });
      },

      acceptBid: (bidId, rfpId) => {
        const state = get();
        const user = state.currentUser;
        const rfp = state.rfpList.find((r) => r.id === rfpId);
        const winningBid = state.bids.find((b) => b.id === bidId);

        // Ownership guard: only the RFP's corporate owner can accept a bid
        if (!rfp || (user?.role !== 'admin' && rfp.corporateUserId !== user?.id)) {
          get().addToast({ type: 'error', title: '🔒 Unauthorized', message: 'You can only accept bids on your own RFPs.' });
          return;
        }

        set((s) => ({
          bids: s.bids.map((b) =>
            b.id === bidId
              ? { ...b, status: 'accepted' as const }
              : b.rfpId === rfpId
              ? { ...b, status: 'rejected' as const }
              : b
          ),
          rfpList: s.rfpList.map((r) =>
            r.id === rfpId
              ? { ...r, status: 'approved' as const, acceptedBidId: bidId }
              : r
          ),
        }));

        get().addToast({
          type: 'success',
          title: '🤝 Deal Confirmed & Contract Awarded!',
          message: `Contract locked with ${winningBid?.vendorCompany || 'Vendor'}. Full contact unlocked.`,
        });
      },

      getBidsForRFP: (rfpId) => {
        return get().bids.filter((b) => b.rfpId === rfpId);
      },

      // ─── Vendor Bidding Actions (Live Reverse Bidding) ───────
      submitBid: (bidData) => {
        const state = get();
        const user = state.currentUser;
        const vendor = state.currentVendorProfile;
        const targetRfp = state.rfpList.find((r) => r.id === bidData.rfpId);

        if (!user || user.role !== 'vendor' || !vendor) {
          get().addToast({
            type: 'error',
            title: '🔒 Vendor Login Required',
            message: 'You must be logged in as a Vendor Partner to submit a bid.',
          });
          return;
        }

        if (vendor.status !== 'approved') {
          get().addToast({
            type: 'warning',
            title: '⏳ KYC Verification Required',
            message: 'Your GSTIN and vendor profile are pending Admin verification. Bidding is locked.',
          });
          return;
        }

        // Category match guard: vendor can only bid on RFPs matching their category
        if (targetRfp && vendor.category !== targetRfp.category) {
          get().addToast({
            type: 'warning',
            title: '⚠️ Category Mismatch',
            message: `Your venue is registered under ${vendor.category.toUpperCase()}. This RFP is for ${targetRfp.category.toUpperCase()}.`,
          });
          return;
        }

        const distance = vendor.distanceKm || Math.round((Math.random() * 6 + 1.5) * 10) / 10;

        let matchScore = 90;
        if (targetRfp && targetRfp.totalBudget > 0) {
          const priceRatio = bidData.totalPrice / targetRfp.totalBudget;
          if (priceRatio <= 1.0) {
            matchScore = Math.min(99, Math.round(95 + (1 - priceRatio) * 10));
          } else {
            matchScore = Math.max(65, Math.round(90 - (priceRatio - 1) * 30));
          }
        }

        const newBid: Bid = {
          ...bidData,
          id: `bid_${generateId()}`,
          vendorId: vendor.id,
          vendorUserId: user.id,
          vendorName: vendor.vendorName,
          vendorCompany: vendor.companyName,
          distanceKm: distance,
          matchPercentage: matchScore,
          submittedAt: new Date().toISOString(),
          status: 'pending',
        };

        set((s) => ({
          bids: [newBid, ...s.bids],
          rfpList: s.rfpList.map((r) =>
            r.id === bidData.rfpId ? { ...r, status: 'bid-received' as const } : r
          ),
        }));

        get().addToast({
          type: 'success',
          title: '📝 Quotation Placed in Live Auction',
          message: `Your quote of ₹${bidData.totalPrice.toLocaleString('en-IN')} is live for corporate review.`,
        });
      },

      reviseBid: (bidId, newPrice, newProposal, newLineItems) => {
        const state = get();
        const existing = state.bids.find((b) => b.id === bidId);
        if (!existing) return;

        const targetRfp = state.rfpList.find((r) => r.id === existing.rfpId);
        let matchScore = existing.matchPercentage;
        if (targetRfp && targetRfp.totalBudget > 0) {
          const priceRatio = newPrice / targetRfp.totalBudget;
          if (priceRatio <= 1.0) {
            matchScore = Math.min(99, Math.round(95 + (1 - priceRatio) * 10));
          } else {
            matchScore = Math.max(65, Math.round(90 - (priceRatio - 1) * 30));
          }
        }

        const updatedBid: Bid = {
          ...existing,
          totalPrice: newPrice,
          proposal: newProposal || existing.proposal,
          lineItems: newLineItems || existing.lineItems,
          matchPercentage: matchScore,
          submittedAt: new Date().toISOString(),
        };

        set((s) => ({
          bids: s.bids.map((b) => (b.id === bidId ? updatedBid : b)),
        }));

        get().addToast({
          type: 'success',
          title: '⚡ Quotation Revised Live',
          message: `Your revised quote of ₹${newPrice.toLocaleString('en-IN')} (${matchScore}% match) has been updated in the live auction.`,
        });
      },

      getVendorOwnBids: (vendorUserId) => {
        return get().bids.filter((b) => b.vendorUserId === vendorUserId);
      },

      // ─── Vendor: Withdraw a Submitted Bid ───────────────────
      withdrawBid: (bidId) => {
        const state2 = get();
        const currentUser2 = state2.currentUser;
        const bid = state2.bids.find((b) => b.id === bidId);
        if (!bid || bid.status === 'accepted') return;
        // Ownership guard: vendor can only withdraw their own bids
        if (currentUser2?.role !== 'admin' && bid.vendorUserId !== currentUser2?.id) {
          get().addToast({ type: 'error', title: '🔒 Unauthorized', message: 'You can only withdraw your own bids.' });
          return;
        }
        set((s) => ({
          bids: s.bids.filter((b) => b.id !== bidId),
          rfpList: s.rfpList.map((r) => {
            if (r.id !== bid.rfpId) return r;
            const remaining = s.bids.filter((b) => b.rfpId === r.id && b.id !== bidId);
            return { ...r, status: remaining.length > 0 ? ('bid-received' as const) : ('open' as const) };
          }),
        }));
        get().addToast({ type: 'info', title: 'Bid Withdrawn', message: 'Your quotation has been retracted from the live auction.' });
      },

      // ─── Self-Service Account Deletion ──────────────────────
      deleteAccount: () => {
        const state = get();
        const user = state.currentUser;
        if (!user) return;
        set((s) => ({
          users: s.users.filter((u) => u.id !== user.id),
          corporateProfiles: s.corporateProfiles.filter((c) => c.userId !== user.id),
          vendorProfiles: s.vendorProfiles.filter((v) => v.userId !== user.id),
          rfpList: s.rfpList.filter((r) => r.corporateUserId !== user.id),
          bids: s.bids.filter((b) => b.vendorUserId !== user.id),
          currentUser: null,
          currentCorporateProfile: null,
          currentVendorProfile: null,
        }));
        get().addToast({ type: 'info', title: 'Account Deleted', message: 'Your account and all associated data have been permanently removed.' });
      },

      // ─── Admin Master Control Actions ────────────────────────
      adminVerifyCorporate: (corporateId, status) => {
        set((state) => {
          const now = new Date().toISOString();
          const updatedList = state.corporateProfiles.map((c) =>
            c.id === corporateId
              ? {
                  ...c,
                  status,
                  verifiedAt: status === 'approved' ? now : undefined,
                }
              : c
          );
          const updatedCurrent =
            state.currentCorporateProfile?.id === corporateId
              ? {
                  ...state.currentCorporateProfile,
                  status,
                  verifiedAt: status === 'approved' ? now : undefined,
                }
              : state.currentCorporateProfile;

          return {
            corporateProfiles: updatedList,
            currentCorporateProfile: updatedCurrent,
          };
        });

        get().addToast({
          type: status === 'approved' ? 'success' : status === 'rejected' ? 'error' : 'info',
          title: `Corporate Status: ${status.toUpperCase()}`,
          message: `Corporate verification status updated to ${status}.`,
        });
      },

      adminVerifyVendor: (vendorId, status) => {
        set((state) => {
          const now = new Date().toISOString();
          const updatedList = state.vendorProfiles.map((v) =>
            v.id === vendorId
              ? {
                  ...v,
                  status,
                  gstVerified: status === 'approved',
                  verifiedAt: status === 'approved' ? now : undefined,
                }
              : v
          );
          const updatedCurrent =
            state.currentVendorProfile?.id === vendorId
              ? {
                  ...state.currentVendorProfile,
                  status,
                  gstVerified: status === 'approved',
                  verifiedAt: status === 'approved' ? now : undefined,
                }
              : state.currentVendorProfile;

          return {
            vendorProfiles: updatedList,
            currentVendorProfile: updatedCurrent,
          };
        });

        get().addToast({
          type: status === 'approved' ? 'success' : 'warning',
          title: `Vendor Status: ${status.toUpperCase()}`,
          message: `Vendor verification updated to ${status}.`,
        });
      },

      adminToggleUserSuspension: (userId) => {
        set((state) => ({
          users: state.users.map((u) =>
            u.id === userId ? { ...u, isSuspended: !u.isSuspended } : u
          ),
        }));

        const u = get().users.find((user) => user.id === userId);
        get().addToast({
          type: u?.isSuspended ? 'warning' : 'success',
          title: u?.isSuspended ? 'User Suspended' : 'User Re-Activated',
          message: `Account status updated for ${u?.email}`,
        });
      },

      adminDeleteUser: (userId) => {
        set((state) => ({
          users: state.users.filter((u) => u.id !== userId),
          corporateProfiles: state.corporateProfiles.filter((c) => c.userId !== userId),
          vendorProfiles: state.vendorProfiles.filter((v) => v.userId !== userId),
        }));

        get().addToast({
          type: 'error',
          title: 'User Account Deleted',
          message: 'The user and associated records have been removed.',
        });
      },

      adminUpdateUser: (userId, data) => {
        set((state) => ({
          users: state.users.map((u) => (u.id === userId ? { ...u, ...data } : u)),
        }));
        get().addToast({ type: 'success', title: 'User Details Updated', message: 'User record saved successfully.' });
      },

      adminDeleteVendorProfile: (vendorId) => {
        set((state) => ({
          vendorProfiles: state.vendorProfiles.filter((v) => v.id !== vendorId),
        }));
        get().addToast({ type: 'warning', title: 'Vendor Profile Removed', message: 'Vendor profile deleted. User account is retained.' });
      },

      adminDeleteBid: (bidId) => {
        set((state) => ({
          bids: state.bids.filter((b) => b.id !== bidId),
        }));
        get().addToast({ type: 'error', title: 'Bid Deleted', message: 'The bid has been permanently removed from the platform.' });
      },

      adminUpdateBid: (bidId, data) => {
        set((state) => ({
          bids: state.bids.map((b) => b.id === bidId ? { ...b, ...data } : b),
        }));
        get().addToast({ type: 'success', title: 'Bid Updated', message: 'Bid details have been saved successfully.' });
      },
    }),
    {
      name: 'coe-store-storage-v7',
      partialize: (state) => ({
        rfpList: state.rfpList,
        bids: state.bids,
        // Strip passwords from persisted users — never store plaintext creds in localStorage
        users: state.users.map((u) => { const { password: _pw, ...rest } = u; return rest; }),
        corporateProfiles: state.corporateProfiles,
        vendorProfiles: state.vendorProfiles,
        currentUser: state.currentUser ? (({ password: _pw, ...rest }) => rest)(state.currentUser) : null,
        currentCorporateProfile: state.currentCorporateProfile,
        currentVendorProfile: state.currentVendorProfile,
        isNightMode: state.isNightMode,
      }),
    }
  )
);
