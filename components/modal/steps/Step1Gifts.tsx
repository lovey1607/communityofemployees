'use client';
// ============================================================
// components/modal/steps/Step1Gifts.tsx
// ============================================================

import { GiftsDetails } from '@/lib/types';
import { SectionLabel, RadioGroup, MultiCheck, Toggle } from './FormHelpers';

const PURPOSES = [
  'Festival Hampers (Diwali)', 'Festival Hampers (New Year)', 'New Joiner Welcome Kits',
  'Long-Service Awards', 'Performance Rewards', 'Client Gifts',
];
const PRODUCT_TYPES = [
  'Specialized Desktop Accessories', 'Premium Organizers', 'Tech Gadgets',
  'Gourmet Food Baskets', 'Wellness Kits', 'Branded Stationery', 'Luxury Hampers',
];

export function Step1Gifts({
  value,
  onChange,
}: {
  value: Partial<GiftsDetails>;
  onChange: (v: Partial<GiftsDetails>) => void;
}) {
  return (
    <div>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 20 }}>
        Create premium branded gifts that leave a lasting impression.
      </p>

      <SectionLabel>Gift Purpose</SectionLabel>
      <RadioGroup
        options={PURPOSES}
        value={value.purpose || ''}
        onChange={(purpose) => onChange({ ...value, purpose })}
      />

      <SectionLabel>Product Types (Select all that apply)</SectionLabel>
      <MultiCheck
        options={PRODUCT_TYPES}
        values={value.productTypes || []}
        onChange={(productTypes) => onChange({ ...value, productTypes })}
      />

      <SectionLabel>Branding</SectionLabel>
      <Toggle
        checked={value.customLogo || false}
        onChange={(customLogo) => onChange({ ...value, customLogo })}
        label="Custom logo printing required"
      />
    </div>
  );
}
