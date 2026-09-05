'use client';
// ============================================================
// components/modal/steps/Step1Food.tsx
// Category: Food & Party
// ============================================================

import { FoodDetails } from '@/lib/types';
import { SectionLabel, RadioGroup, MultiCheck, Toggle } from './FormHelpers';
import { useState } from 'react';

const MEAL_TYPES = [
  'Annual Corporate Gala Dinner',
  'Cocktail & Networking Evening',
  'Executive Lunch Buffet',
  'Sundowner Party & High Tea',
  'Live BBQ & Food Stations',
];

const BEVERAGE_OPTS = [
  'Full Premium Open Bar (Liquor, Wine, Cocktails)',
  'Beer & Wine Tasting',
  'Craft Mocktails & Artisanal Mixology',
  'Non-Alcoholic Soft Bar & Fresh Juices',
  'BYOB (Bring Your Own Beverage) Support',
];

const MENU_PREFS = [
  'Multi-Course Plated Fine Dining',
  'Grand Multi-Cuisine Buffet (Veg + Non-Veg)',
  'Pure Vegetarian / Jain Gourmet',
  'Gluten-Free & Vegan Friendly',
];

const CUISINES = [
  'Continental & European',
  'Contemporary Pan-Asian',
  'Modern North Indian & Mughlai',
  'Mediterranean & Coastal',
  'Global Fusion',
];

const ENTERTAINMENT = [
  'Live Acoustic Band & Vocals',
  'Celebrity DJ & Intelligent Light Show',
  'Corporate Stand-up Comedy Act',
  'Interactive Illusionist & Mentalist',
  'Karaoke & Interactive Host / MC',
];

export function Step1Food({
  value,
  onChange,
}: {
  value: Partial<FoodDetails>;
  onChange: (v: Partial<FoodDetails>) => void;
}) {
  const [showBeverage, setShowBeverage] = useState(Boolean(value.beverage));

  return (
    <div>
      <p style={{ color: 'var(--ink-2)', fontSize: 13.5, marginBottom: 20 }}>
        Configure your Food & Party requirements — from executive networking dinners to full-scale corporate galas.
      </p>

      <SectionLabel>Event & Dining Format</SectionLabel>
      <RadioGroup
        options={MEAL_TYPES}
        value={value.mealType || ''}
        onChange={(mealType) => onChange({ ...value, mealType })}
      />

      <SectionLabel>Beverage & Bar Service</SectionLabel>
      <div style={{ marginBottom: 14 }}>
        <Toggle
          checked={showBeverage}
          onChange={(v) => {
            setShowBeverage(v);
            if (!v) onChange({ ...value, beverage: 'Non-Alcoholic' });
          }}
          label="Include Bar / Specialized Cocktail & Mixology Service"
        />
      </div>
      {showBeverage && (
        <RadioGroup
          options={BEVERAGE_OPTS}
          value={value.beverage || ''}
          onChange={(beverage) => onChange({ ...value, beverage })}
        />
      )}

      <SectionLabel>Dietary & Menu Preferences</SectionLabel>
      <RadioGroup
        options={MENU_PREFS}
        value={value.menuPreference || ''}
        onChange={(menuPreference) => onChange({ ...value, menuPreference })}
      />

      <SectionLabel>Cuisine Selection</SectionLabel>
      <RadioGroup
        options={CUISINES}
        value={value.cuisine || ''}
        onChange={(cuisine) => onChange({ ...value, cuisine })}
      />

      <SectionLabel>Party Entertainment & Stage Acts</SectionLabel>
      <MultiCheck
        options={ENTERTAINMENT}
        values={value.entertainment || []}
        onChange={(entertainment) => onChange({ ...value, entertainment })}
      />
    </div>
  );
}
