// ============================================================
// data/pilot-companies.ts
//
// Outreach list for the Gurgaon pilot: large employers with a real presence
// in Gurugram / Delhi NCR. The company names, sectors and business districts
// below are publicly known facts about where these organisations operate.
//
// IMPORTANT — what these are NOT.
//
// None of these companies has signed up for COE. Seeding them creates
// *pilot placeholder* accounts so the portal has realistic demand-side data
// to demo and so there is a working list to run outreach against. They are
// therefore seeded as `pending`, never approved or "verified", carry no
// contact details, no GSTIN and no named employee, and their logins live
// only in the gitignored seed/fixtures.json.
//
// Do not present a pilot placeholder to anyone as an existing customer, and
// do not add a contact name, phone number or GSTIN here unless that company
// actually gave it to you.
// ============================================================

export interface PilotCompany {
  name: string;
  sector: string;
  /** Business district within Gurugram, where publicly known. */
  hub: string;
  /** Rough employee band, used only to pre-fill a plausible headcount range. */
  sizeBand: '500-2000' | '2000-10000' | '10000+';
}

export const GURUGRAM_PILOT_COMPANIES: PilotCompany[] = [
  // ─── IT services, BPM and shared services ───────────────────
  { name: 'Genpact', sector: 'Business services', hub: 'Udyog Vihar', sizeBand: '10000+' },
  { name: 'EXL Service', sector: 'Analytics & BPM', hub: 'Sector 44', sizeBand: '10000+' },
  { name: 'Concentrix', sector: 'Customer experience', hub: 'Udyog Vihar', sizeBand: '10000+' },
  { name: 'WNS Global Services', sector: 'Business services', hub: 'Sector 44', sizeBand: '2000-10000' },
  { name: 'Infosys BPM', sector: 'IT services', hub: 'Sector 44', sizeBand: '2000-10000' },
  { name: 'Wipro', sector: 'IT services', hub: 'Sector 21', sizeBand: '2000-10000' },
  { name: 'HCLTech', sector: 'IT services', hub: 'Sector 44', sizeBand: '2000-10000' },
  { name: 'Tech Mahindra', sector: 'IT services', hub: 'Sector 44', sizeBand: '2000-10000' },
  { name: 'Cognizant', sector: 'IT services', hub: 'Sector 21', sizeBand: '2000-10000' },
  { name: 'Accenture', sector: 'Consulting & technology', hub: 'DLF Cyber City', sizeBand: '10000+' },
  { name: 'Capgemini', sector: 'IT services', hub: 'Sector 44', sizeBand: '2000-10000' },
  { name: 'NTT DATA', sector: 'IT services', hub: 'Sector 44', sizeBand: '2000-10000' },
  { name: 'LTIMindtree', sector: 'IT services', hub: 'Sector 44', sizeBand: '2000-10000' },
  { name: 'Birlasoft', sector: 'IT services', hub: 'Sector 44', sizeBand: '500-2000' },
  { name: 'Nagarro', sector: 'IT services', hub: 'Sector 44', sizeBand: '2000-10000' },
  { name: 'Xebia', sector: 'IT services', hub: 'Sector 44', sizeBand: '500-2000' },
  { name: 'Iris Software', sector: 'IT services', hub: 'Sector 44', sizeBand: '500-2000' },
  { name: 'Incedo', sector: 'IT services', hub: 'Sector 44', sizeBand: '500-2000' },
  { name: 'Sopra Steria', sector: 'IT services', hub: 'Sector 44', sizeBand: '500-2000' },
  { name: 'Coforge', sector: 'IT services', hub: 'Sector 44', sizeBand: '2000-10000' },

  // ─── Consulting, audit and professional services ────────────
  { name: 'KPMG India', sector: 'Professional services', hub: 'DLF Cyber City', sizeBand: '2000-10000' },
  { name: 'Deloitte India', sector: 'Professional services', hub: 'DLF Cyber City', sizeBand: '10000+' },
  { name: 'EY India', sector: 'Professional services', hub: 'Golf Course Road', sizeBand: '10000+' },
  { name: 'PwC India', sector: 'Professional services', hub: 'DLF Cyber City', sizeBand: '2000-10000' },
  { name: 'McKinsey & Company', sector: 'Management consulting', hub: 'DLF Cyber City', sizeBand: '500-2000' },
  { name: 'Bain & Company', sector: 'Management consulting', hub: 'DLF Cyber City', sizeBand: '500-2000' },
  { name: 'Boston Consulting Group', sector: 'Management consulting', hub: 'DLF Cyber City', sizeBand: '500-2000' },
  { name: 'Grant Thornton Bharat', sector: 'Professional services', hub: 'Sector 44', sizeBand: '500-2000' },
  { name: 'BDO India', sector: 'Professional services', hub: 'Sector 44', sizeBand: '500-2000' },
  { name: 'Protiviti India', sector: 'Risk & consulting', hub: 'DLF Cyber City', sizeBand: '500-2000' },

  // ─── Banking, financial services and insurance ──────────────
  { name: 'American Express', sector: 'Financial services', hub: 'DLF Cyber City', sizeBand: '2000-10000' },
  { name: 'HDFC Bank', sector: 'Banking', hub: 'Sector 44', sizeBand: '2000-10000' },
  { name: 'ICICI Bank', sector: 'Banking', hub: 'Golf Course Road', sizeBand: '2000-10000' },
  { name: 'Axis Bank', sector: 'Banking', hub: 'Sector 44', sizeBand: '500-2000' },
  { name: 'Kotak Mahindra Bank', sector: 'Banking', hub: 'Golf Course Road', sizeBand: '500-2000' },
  { name: 'RBL Bank', sector: 'Banking', hub: 'Sector 44', sizeBand: '500-2000' },
  { name: 'Bajaj Allianz', sector: 'Insurance', hub: 'Sector 44', sizeBand: '500-2000' },
  { name: 'Max Life Insurance', sector: 'Insurance', hub: 'Sector 44', sizeBand: '2000-10000' },
  { name: 'SBI Cards', sector: 'Financial services', hub: 'Sector 44', sizeBand: '2000-10000' },
  { name: 'Paytm', sector: 'Fintech', hub: 'Sector 44', sizeBand: '2000-10000' },
  { name: 'PolicyBazaar', sector: 'Insurtech', hub: 'Sector 44', sizeBand: '2000-10000' },
  { name: 'Pine Labs', sector: 'Fintech', hub: 'Sector 44', sizeBand: '500-2000' },
  { name: 'MobiKwik', sector: 'Fintech', hub: 'Sector 44', sizeBand: '500-2000' },
  { name: 'Fiserv', sector: 'Financial technology', hub: 'DLF Cyber City', sizeBand: '2000-10000' },
  { name: 'Fidelity Investments', sector: 'Financial services', hub: 'DLF Cyber City', sizeBand: '500-2000' },
  { name: 'S&P Global', sector: 'Financial information', hub: 'DLF Cyber City', sizeBand: '2000-10000' },
  { name: 'Moody\'s Analytics', sector: 'Financial information', hub: 'DLF Cyber City', sizeBand: '500-2000' },
  { name: 'Nomura Services', sector: 'Financial services', hub: 'DLF Cyber City', sizeBand: '500-2000' },
  { name: 'BA Continuum (Bank of America)', sector: 'Financial services', hub: 'DLF Cyber City', sizeBand: '2000-10000' },
  { name: 'Aon', sector: 'Risk & advisory', hub: 'DLF Cyber City', sizeBand: '500-2000' },

  // ─── Technology products and internet ───────────────────────
  { name: 'Google India', sector: 'Technology', hub: 'DLF Cyber City', sizeBand: '2000-10000' },
  { name: 'Microsoft India', sector: 'Technology', hub: 'DLF Cyber City', sizeBand: '2000-10000' },
  { name: 'Adobe India', sector: 'Software', hub: 'Sector 25', sizeBand: '500-2000' },
  { name: 'SAP India', sector: 'Software', hub: 'DLF Cyber City', sizeBand: '500-2000' },
  { name: 'Oracle India', sector: 'Software', hub: 'DLF Cyber City', sizeBand: '2000-10000' },
  { name: 'Salesforce India', sector: 'Software', hub: 'DLF Cyber City', sizeBand: '500-2000' },
  { name: 'Amazon India', sector: 'E-commerce & cloud', hub: 'Sector 44', sizeBand: '2000-10000' },
  { name: 'Zomato', sector: 'Consumer internet', hub: 'Sector 44', sizeBand: '2000-10000' },
  { name: 'Blinkit', sector: 'Quick commerce', hub: 'Sector 44', sizeBand: '2000-10000' },
  { name: 'Snapdeal', sector: 'E-commerce', hub: 'Sector 44', sizeBand: '500-2000' },
  { name: 'MakeMyTrip', sector: 'Online travel', hub: 'Sector 44', sizeBand: '2000-10000' },
  { name: 'OYO', sector: 'Hospitality technology', hub: 'Sector 44', sizeBand: '2000-10000' },
  { name: 'Spinny', sector: 'Auto marketplace', hub: 'Sector 44', sizeBand: '500-2000' },
  { name: 'Cars24', sector: 'Auto marketplace', hub: 'Sector 44', sizeBand: '2000-10000' },
  { name: 'Urban Company', sector: 'Consumer services', hub: 'Sector 44', sizeBand: '2000-10000' },
  { name: 'Lenskart', sector: 'Retail & eyewear', hub: 'Sector 44', sizeBand: '2000-10000' },
  { name: 'ShareChat', sector: 'Consumer internet', hub: 'Sector 44', sizeBand: '500-2000' },
  { name: 'Grofers Technologies', sector: 'Quick commerce', hub: 'Sector 44', sizeBand: '500-2000' },
  { name: 'Zeta', sector: 'Fintech', hub: 'Sector 44', sizeBand: '500-2000' },
  { name: 'Airtel Digital', sector: 'Telecom & digital', hub: 'Sector 44', sizeBand: '2000-10000' },

  // ─── Telecom, media and entertainment ───────────────────────
  { name: 'Bharti Airtel', sector: 'Telecom', hub: 'Sector 44', sizeBand: '10000+' },
  { name: 'Nokia India', sector: 'Telecom equipment', hub: 'Sector 44', sizeBand: '2000-10000' },
  { name: 'Ericsson India', sector: 'Telecom equipment', hub: 'Sector 44', sizeBand: '500-2000' },
  { name: 'Sony Pictures Networks', sector: 'Media', hub: 'Sector 44', sizeBand: '500-2000' },
  { name: 'Zee Entertainment', sector: 'Media', hub: 'Sector 44', sizeBand: '500-2000' },
  { name: 'Dentsu India', sector: 'Advertising', hub: 'DLF Cyber City', sizeBand: '500-2000' },
  { name: 'Publicis Groupe India', sector: 'Advertising', hub: 'DLF Cyber City', sizeBand: '500-2000' },
  { name: 'GroupM India', sector: 'Media buying', hub: 'DLF Cyber City', sizeBand: '500-2000' },

  // ─── Manufacturing, auto and industrial ─────────────────────
  { name: 'Maruti Suzuki India', sector: 'Automotive', hub: 'Palam Gurgaon Road', sizeBand: '10000+' },
  { name: 'Hero MotoCorp', sector: 'Automotive', hub: 'Sector 33', sizeBand: '10000+' },
  { name: 'Honda Cars India', sector: 'Automotive', hub: 'Sector 44', sizeBand: '2000-10000' },
  { name: 'Denso India', sector: 'Auto components', hub: 'Udyog Vihar', sizeBand: '500-2000' },
  { name: 'Minda Corporation', sector: 'Auto components', hub: 'Sector 44', sizeBand: '500-2000' },
  { name: 'Havells India', sector: 'Electricals', hub: 'Sector 44', sizeBand: '2000-10000' },
  { name: 'Schneider Electric India', sector: 'Energy management', hub: 'Sector 44', sizeBand: '500-2000' },
  { name: 'Siemens India', sector: 'Industrial technology', hub: 'Sector 44', sizeBand: '500-2000' },
  { name: 'Whirlpool of India', sector: 'Consumer appliances', hub: 'Sector 44', sizeBand: '500-2000' },
  { name: 'Panasonic India', sector: 'Consumer electronics', hub: 'Sector 44', sizeBand: '500-2000' },

  // ─── FMCG, retail and hospitality ───────────────────────────
  { name: 'Coca-Cola India', sector: 'FMCG', hub: 'Sector 44', sizeBand: '500-2000' },
  { name: 'PepsiCo India', sector: 'FMCG', hub: 'Sector 44', sizeBand: '2000-10000' },
  { name: 'Nestle India', sector: 'FMCG', hub: 'Sector 44', sizeBand: '500-2000' },
  { name: 'Reckitt India', sector: 'FMCG', hub: 'Sector 44', sizeBand: '500-2000' },
  { name: 'Mondelez India', sector: 'FMCG', hub: 'Sector 44', sizeBand: '500-2000' },
  { name: 'Kellanova India', sector: 'FMCG', hub: 'Sector 44', sizeBand: '500-2000' },
  { name: 'Reliance Retail', sector: 'Retail', hub: 'Sector 44', sizeBand: '2000-10000' },
  { name: 'Shoppers Stop', sector: 'Retail', hub: 'Sector 44', sizeBand: '500-2000' },
  { name: 'Lifestyle International', sector: 'Retail', hub: 'Sector 44', sizeBand: '500-2000' },
  { name: 'Domino\'s (Jubilant FoodWorks)', sector: 'Food service', hub: 'Sector 44', sizeBand: '2000-10000' },

  // ─── Pharma, healthcare and life sciences ───────────────────
  { name: 'Sun Pharmaceutical', sector: 'Pharmaceuticals', hub: 'Sector 44', sizeBand: '2000-10000' },
  { name: 'Fortis Healthcare', sector: 'Healthcare', hub: 'Sector 44', sizeBand: '2000-10000' },
  { name: 'Medanta', sector: 'Healthcare', hub: 'Sector 38', sizeBand: '2000-10000' },
  { name: 'Max Healthcare', sector: 'Healthcare', hub: 'Sector 19', sizeBand: '2000-10000' },
  { name: 'AbbVie India', sector: 'Pharmaceuticals', hub: 'Sector 44', sizeBand: '500-2000' },
  { name: 'Boehringer Ingelheim India', sector: 'Pharmaceuticals', hub: 'Sector 44', sizeBand: '500-2000' },
  { name: 'Stryker India', sector: 'Medical devices', hub: 'Sector 44', sizeBand: '500-2000' },
  { name: 'Baxter India', sector: 'Medical devices', hub: 'Sector 44', sizeBand: '500-2000' },

  // ─── Real estate, logistics and infrastructure ──────────────
  { name: 'DLF', sector: 'Real estate', hub: 'DLF Cyber City', sizeBand: '2000-10000' },
  { name: 'Godrej Properties', sector: 'Real estate', hub: 'Golf Course Road', sizeBand: '500-2000' },
  { name: 'JLL India', sector: 'Real estate services', hub: 'DLF Cyber City', sizeBand: '500-2000' },
  { name: 'CBRE India', sector: 'Real estate services', hub: 'DLF Cyber City', sizeBand: '2000-10000' },
  { name: 'Colliers India', sector: 'Real estate services', hub: 'DLF Cyber City', sizeBand: '500-2000' },
  { name: 'Delhivery', sector: 'Logistics', hub: 'Sector 44', sizeBand: '2000-10000' },
  { name: 'DHL Express India', sector: 'Logistics', hub: 'Sector 44', sizeBand: '500-2000' },
  { name: 'Blue Dart', sector: 'Logistics', hub: 'Sector 44', sizeBand: '500-2000' },
  { name: 'IndiGo (InterGlobe)', sector: 'Aviation', hub: 'Sector 44', sizeBand: '2000-10000' },
  { name: 'InterGlobe Enterprises', sector: 'Travel & hospitality', hub: 'Sector 44', sizeBand: '2000-10000' },
];
