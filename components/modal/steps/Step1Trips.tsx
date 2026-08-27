'use client';
// ============================================================
// components/modal/steps/Step1Trips.tsx
// ============================================================

import { TripsDetails } from '@/lib/types';
import { SectionLabel, RadioGroup, MultiCheck, Toggle } from './FormHelpers';
import { useState } from 'react';

const DESTINATIONS = ['Hill Station', 'Beach Resort', 'Heritage City', 'Wildlife Sanctuary', 'International'];
const ITINERARY_STYLES = ['Relaxed / Leisure', 'Adventure & Trekking', 'Team-Building Workshops', 'Curated Group Excursions', 'Mixed'];
const TRANSPORT = ['Volvo / Luxury Bus', 'Flight Coordination', 'Local Cab Transfers', 'Train', 'Private Coaches'];
const ACCOMMODATION = ['Single Occupancy', 'Twin Sharing', 'Triple Sharing', 'Dormitory'];

export function Step1Trips({
  value,
  onChange,
}: {
  value: Partial<TripsDetails>;
  onChange: (v: Partial<TripsDetails>) => void;
}) {
  return (
    <div>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 20 }}>
        Plan a memorable corporate offsite with tailored destination and itinerary.
      </p>

      <SectionLabel>Destination Type</SectionLabel>
      <RadioGroup
        options={DESTINATIONS}
        value={value.destinationType || ''}
        onChange={(destinationType) => onChange({ ...value, destinationType })}
      />

      <SectionLabel>Itinerary Style</SectionLabel>
      <RadioGroup
        options={ITINERARY_STYLES}
        value={value.itineraryStyle || ''}
        onChange={(itineraryStyle) => onChange({ ...value, itineraryStyle })}
      />

      <SectionLabel>Transport Required</SectionLabel>
      <MultiCheck
        options={TRANSPORT}
        values={value.transport || []}
        onChange={(transport) => onChange({ ...value, transport })}
      />

      <SectionLabel>Accommodation Type</SectionLabel>
      <RadioGroup
        options={ACCOMMODATION}
        value={value.accommodation || ''}
        onChange={(accommodation) => onChange({ ...value, accommodation })}
      />
    </div>
  );
}
