'use client';
// ============================================================
// components/modal/steps/Step1Dress.tsx
// ============================================================

import { DressDetails } from '@/lib/types';
import { SectionLabel, RadioGroup, MultiCheck } from './FormHelpers';

const APPAREL_TYPES = ['Polo T-Shirts', 'Round Neck T-Shirts', 'Hoodies', 'Winter Jackets', 'Caps', 'Sweatshirts'];
const ADD_ONS = ['Custom Backpacks', 'Laptop Sleeves', 'Canvas Tote Bags', 'Branded Notebooks', 'Lanyards & ID Cases'];
const MATERIALS = ['100% Cotton', 'Dri-fit (Polyester)', 'Fleece', 'Organic Cotton', 'Blended'];

export function Step1Dress({
  value,
  onChange,
}: {
  value: Partial<DressDetails>;
  onChange: (v: Partial<DressDetails>) => void;
}) {
  return (
    <div>
      <p style={{ color: 'var(--ink-2)', fontSize: 14, marginBottom: 20 }}>
        Design and source premium branded merchandise for your team.
      </p>

      <SectionLabel>Apparel Type (Select all)</SectionLabel>
      <MultiCheck
        options={APPAREL_TYPES}
        values={value.apparelType || []}
        onChange={(apparelType) => onChange({ ...value, apparelType })}
      />

      <SectionLabel>Add-ons & Accessories</SectionLabel>
      <MultiCheck
        options={ADD_ONS}
        values={value.addOns || []}
        onChange={(addOns) => onChange({ ...value, addOns })}
      />

      <SectionLabel>Primary Material</SectionLabel>
      <RadioGroup
        options={MATERIALS}
        value={value.material || ''}
        onChange={(material) => onChange({ ...value, material })}
      />
    </div>
  );
}
