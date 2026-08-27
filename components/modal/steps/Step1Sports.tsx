'use client';
// ============================================================
// components/modal/steps/Step1Sports.tsx
// ============================================================

import { SportsDetails } from '@/lib/types';
import { SectionLabel, RadioGroup, MultiCheck } from './FormHelpers';

const SPORT_TYPES = [
  'Box Cricket', 'Full-Pitch Cricket', 'Pickleball', 'Badminton',
  'Turf Football', 'Volleyball', 'Table Tennis', 'Corporate Mini-Olympics',
];

const EXTRAS = ['Referee / Umpire', 'Trophies & Medals', 'First-Aid Station', 'Live Scoreboard', 'Photography Coverage'];

export function Step1Sports({
  value,
  onChange,
}: {
  value: Partial<SportsDetails>;
  onChange: (v: Partial<SportsDetails>) => void;
}) {
  return (
    <div>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 20 }}>
        Tell us about the sporting event you're planning for your team.
      </p>

      <SectionLabel>Sport / Activity Type</SectionLabel>
      <RadioGroup
        options={SPORT_TYPES}
        value={value.type || ''}
        onChange={(type) => onChange({ ...value, type })}
      />

      <SectionLabel>Add-ons & Extras</SectionLabel>
      <MultiCheck
        options={EXTRAS}
        values={value.extras || []}
        onChange={(extras) => onChange({ ...value, extras })}
      />
    </div>
  );
}
