// ============================================================
// lib/rfpTemplates.ts — Starter templates so posting a requirement is a
// two-minute job rather than a blank form. Served by /api/rfp-templates
// and importable directly by the posting modal.
// ============================================================

import type { CategoryType } from './types';

export interface RfpTemplate {
  id: string;
  label: string;
  blurb: string;
  category: CategoryType;
  occasion: string;
  defaults: {
    persons: number;
    budgetPerPerson: number;
    timeSlot: string;
    timeFlexibility: string;
    urgency: string;
    notes: string;
  };
  categoryDetails: Record<string, unknown>;
}

export const RFP_TEMPLATES: RfpTemplate[] = [
  {
    id: 'tpl_sports_meet',
    label: 'Inter-team sports meet',
    blurb: 'Turf or court booking, referees, kit and water for a half-day tournament.',
    category: 'sports',
    occasion: 'sports-meet',
    defaults: {
      persons: 40,
      budgetPerPerson: 700,
      timeSlot: 'Morning Slot (8:00 AM - 12:00 PM)',
      timeFlexibility: 'Flexible (±2 Hours buffer)',
      urgency: 'Upcoming Month',
      notes: 'Two courts if possible, plus a referee and basic first-aid on site.',
    },
    categoryDetails: { type: 'Box Cricket / Football', extras: ['Referee', 'Kit & bibs', 'Water & electrolytes'] },
  },
  {
    id: 'tpl_team_lunch',
    label: 'Team lunch',
    blurb: 'Sit-down or buffet lunch near the office for a single team.',
    category: 'food',
    occasion: 'team-lunch',
    defaults: {
      persons: 25,
      budgetPerPerson: 900,
      timeSlot: 'Afternoon (12:30 PM - 3:00 PM)',
      timeFlexibility: 'Strict Schedule',
      urgency: 'Immediate (Next 7-10 Days)',
      notes: 'Need a clearly labelled vegetarian and Jain option.',
    },
    categoryDetails: {
      mealType: 'Lunch',
      beverage: 'Soft drinks & mocktails',
      menuPreference: 'Buffet',
      cuisine: 'North Indian + Continental',
      entertainment: [],
    },
  },
  {
    id: 'tpl_team_dinner',
    label: 'Team dinner',
    blurb: 'Evening dinner with a reserved section and a set menu.',
    category: 'food',
    occasion: 'team-dinner',
    defaults: {
      persons: 30,
      budgetPerPerson: 1600,
      timeSlot: 'Evening (7:00 PM - 11:00 PM)',
      timeFlexibility: 'Flexible (±2 Hours buffer)',
      urgency: 'Upcoming Month',
      notes: 'Reserved section, set menu, separate bar tab settled on the night.',
    },
    categoryDetails: {
      mealType: 'Dinner',
      beverage: 'Bar on consumption',
      menuPreference: 'Set menu',
      cuisine: 'Multi-cuisine',
      entertainment: ['Music'],
    },
  },
  {
    id: 'tpl_office_party',
    label: 'Office party',
    blurb: 'Annual day, Diwali or quarter-close party with food, music and décor.',
    category: 'food',
    occasion: 'office-party',
    defaults: {
      persons: 120,
      budgetPerPerson: 2200,
      timeSlot: 'Evening Gala (7:00 PM - Midnight)',
      timeFlexibility: 'Strict Schedule',
      urgency: 'Planned Quarter',
      notes: 'Need a stage, sound system, and a photo corner. Décor brief to follow.',
    },
    categoryDetails: {
      mealType: 'Dinner + starters',
      beverage: 'Full bar',
      menuPreference: 'Buffet',
      cuisine: 'Multi-cuisine',
      entertainment: ['DJ', 'Anchor', 'Photo booth'],
    },
  },
  {
    id: 'tpl_team_outing',
    label: 'Team outing (day trip)',
    blurb: 'One-day outing with transport, activities and meals.',
    category: 'trips',
    occasion: 'team-outing',
    defaults: {
      persons: 35,
      budgetPerPerson: 2800,
      timeSlot: 'Full Day (7:00 AM - 9:00 PM)',
      timeFlexibility: 'Flexible (±2 Hours buffer)',
      urgency: 'Upcoming Month',
      notes: 'Pick-up and drop from the office. Activities suitable for mixed fitness levels.',
    },
    categoryDetails: {
      destinationType: 'Resort within 2 hours of Gurgaon',
      itineraryStyle: 'Activities + leisure',
      transport: ['AC coach'],
      accommodation: 'Day use only',
    },
  },
  {
    id: 'tpl_offsite',
    label: 'Offsite (overnight)',
    blurb: 'Two-day offsite: rooms, conference hall, meals and one team activity.',
    category: 'trips',
    occasion: 'offsite',
    defaults: {
      persons: 50,
      budgetPerPerson: 9000,
      timeSlot: 'Two days, one night',
      timeFlexibility: 'Flexible (±2 Hours buffer)',
      urgency: 'Planned Quarter',
      notes: 'Conference hall with projector for half a day, twin sharing rooms, all meals included.',
    },
    categoryDetails: {
      destinationType: 'Resort — Aravalli belt / Rishikesh / Jaipur',
      itineraryStyle: 'Workshop + team activity',
      transport: ['AC coach'],
      accommodation: 'Twin sharing, 1 night',
    },
  },
  {
    id: 'tpl_function',
    label: 'Company function',
    blurb: 'Milestone, launch or award night with a formal run of show.',
    category: 'food',
    occasion: 'function',
    defaults: {
      persons: 200,
      budgetPerPerson: 2500,
      timeSlot: 'Evening (6:00 PM - 11:00 PM)',
      timeFlexibility: 'Strict Schedule',
      urgency: 'Planned Quarter',
      notes: 'Formal seating, AV for a 30-minute presentation, awards handover on stage.',
    },
    categoryDetails: {
      mealType: 'Cocktail + dinner',
      beverage: 'Full bar',
      menuPreference: 'Buffet',
      cuisine: 'Multi-cuisine',
      entertainment: ['AV & stage', 'Anchor'],
    },
  },
  {
    id: 'tpl_gifting',
    label: 'Festive gifting',
    blurb: 'Diwali or new-joiner hampers, delivered to the office or to homes.',
    category: 'gifts',
    occasion: 'gifting',
    defaults: {
      persons: 150,
      budgetPerPerson: 1500,
      timeSlot: 'Delivery window',
      timeFlexibility: 'Flexible (±2 Hours buffer)',
      urgency: 'Upcoming Month',
      notes: 'Split delivery: office for NCR, courier for the rest. Need branded sleeves.',
    },
    categoryDetails: { purpose: 'Festive', productTypes: ['Dry fruits', 'Gourmet', 'Desk accessories'], customLogo: true },
  },
  {
    id: 'tpl_merchandise',
    label: 'Team merchandise',
    blurb: 'Branded t-shirts, hoodies or jerseys with sizing collection.',
    category: 'dress',
    occasion: 'merchandise',
    defaults: {
      persons: 80,
      budgetPerPerson: 800,
      timeSlot: 'Delivery window',
      timeFlexibility: 'Flexible (±2 Hours buffer)',
      urgency: 'Upcoming Month',
      notes: 'Need a size sample set before the bulk run. Logo files will be shared on award.',
    },
    categoryDetails: { apparelType: ['T-shirts'], addOns: ['Name printing'], material: 'Cotton / dry-fit' },
  },
];

export function templatesForCategory(category?: CategoryType): RfpTemplate[] {
  if (!category) return RFP_TEMPLATES;
  return RFP_TEMPLATES.filter((t) => t.category === category);
}
