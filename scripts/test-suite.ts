// Test script to verify all end-to-end Profile Registration, Modal Auth, and Admin Verification
import { useStore } from '../store/useStore';
import { CategoryType, RFP, Bid, VendorProfile, User, CorporateProfile } from '../lib/types';

function runTests() {
  console.log('🧪 Starting End-to-End COE Registration & Modal Auth Verification Suite...\n');
  const store = useStore.getState();

  // Test 1: Modal-driven Corporate User Registration
  console.log('1. Testing Corporate User Registration from Modal...');
  const newCorpEmail = `hr.director_${Date.now()}@nexustech.com`;
  store.registerUser(newCorpEmail, 'test1234', 'corporate');

  let current = useStore.getState();
  if (current.currentUser?.email !== newCorpEmail || current.currentUser?.role !== 'corporate') {
    throw new Error('registerUser failed for corporate');
  }
  if (current.currentCorporateProfile !== null) {
    throw new Error('New corporate registration should have null profile before onboarding');
  }
  console.log('   ✅ New Corporate user created:', current.currentUser.email, '· Ready for onboarding wizard');

  // Complete Onboarding
  store.saveCorporateProfile({
    name: 'Shreya Sengupta',
    mobile: '+91 98119 88776',
    officeCompanyName: 'Nexus Digital Technologies',
    officeAddress: 'Building 10C, DLF Cyber City, Gurugram',
    city: 'Gurugram',
    position: 'VP / Director',
    department: 'People Operations',
    cinNumber: 'U72900HR2021PTC099123',
    teamSize: '500-2000 Employees',
    annualProcurementBudget: '₹3 Cr - ₹10 Cr',
  });

  current = useStore.getState();
  const registeredCorp = current.corporateProfiles.find((c: CorporateProfile) => c.officeCompanyName === 'Nexus Digital Technologies');
  if (!registeredCorp || registeredCorp.status !== 'pending' || !registeredCorp.submittedAt) {
    throw new Error('Corporate onboarding submission failed');
  }
  console.log('   ✅ Corporate profile submitted with status: PENDING verification by Admin');

  // Test 2: Modal-driven Vendor User Registration
  console.log('2. Testing Vendor User Registration from Modal...');
  const newVendorEmail = `partner_${Date.now()}@apexevents.com`;
  store.registerUser(newVendorEmail, 'test1234', 'vendor');

  current = useStore.getState();
  if (current.currentUser?.email !== newVendorEmail || current.currentUser?.role !== 'vendor') {
    throw new Error('registerUser failed for vendor');
  }
  if (current.currentVendorProfile !== null) {
    throw new Error('New vendor registration should have null profile before KYC onboarding');
  }
  console.log('   ✅ New Vendor user created:', current.currentUser.email, '· Ready for KYC onboarding');

  // Complete Vendor KYC Onboarding
  store.saveVendorProfile({
    category: 'sports' as CategoryType,
    vendorName: 'Karan Malhotra',
    companyName: 'Apex Arena Sports & Fitness',
    mobile: '+91 99887 66554',
    companyMobile: '+91 0124 332211',
    address: 'Golf Course Extension Road, Gurugram',
    city: 'Gurugram',
    distanceKm: 3.2,
    entityType: 'LLP',
    panNumber: 'AABCA1234G',
    gstNumber: '07AABCA1234G1Z3',
    portfolioSummary: 'Turnkey corporate sports leagues, turf maintenance, certified referees, and awards ceremony management.',
    pastClients: ['Uber', 'Deloitte', 'Zomato'],
  });

  current = useStore.getState();
  const registeredVen = current.vendorProfiles.find((v: VendorProfile) => v.companyName === 'Apex Arena Sports & Fitness');
  if (!registeredVen || registeredVen.status !== 'pending' || registeredVen.gstVerified !== false || !registeredVen.submittedAt) {
    throw new Error('Vendor KYC submission failed');
  }
  console.log('   ✅ Vendor profile submitted with status: PENDING KYC by Admin');

  // Test 3: Admin Approval Queue
  console.log('3. Testing Admin Verification for both newly registered accounts...');
  store.loginWithPassword('admin@coe.com', 'test1234', 'admin');
  store.adminVerifyCorporate(registeredCorp.id, 'approved');
  store.adminVerifyVendor(registeredVen.id, 'approved');

  current = useStore.getState();
  const approvedCorp = current.corporateProfiles.find((c: CorporateProfile) => c.id === registeredCorp.id);
  const approvedVen = current.vendorProfiles.find((v: VendorProfile) => v.id === registeredVen.id);

  if (approvedCorp?.status !== 'approved' || !approvedCorp.verifiedAt) throw new Error('Corporate approval failed');
  if (approvedVen?.status !== 'approved' || approvedVen.gstVerified !== true || !approvedVen.verifiedAt) throw new Error('Vendor approval failed');
  console.log('   ✅ Corporate verified & activated: Status =', approvedCorp.status);
  console.log('   ✅ Vendor KYC verified & activated: Status =', approvedVen.status, '· GST Verified =', approvedVen.gstVerified);

  console.log('\n🎉 ALL MODAL AUTH & REGISTRATION TESTS PASSED WITH 100% SUCCESS!');
}

runTests();
