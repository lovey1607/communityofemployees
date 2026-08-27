'use client';
// ============================================================
// components/modal/steps/Step2Universal.tsx
// Date range, specific Time Period & Slots, Team Size, Budget, Notes
// BUG FIX 1: Robust Date Picker Validation with min bindings
// ============================================================

import React, { useMemo } from 'react';
import { UniversalFields } from '@/lib/types';
import { SectionLabel, TextInput, RadioGroup } from './FormHelpers';
import { useStore } from '@/store/useStore';
import { Clock, Calendar, Users, DollarSign, Zap } from 'lucide-react';

const TIME_SLOTS = [
  'Morning Session (08:00 AM – 12:00 PM)',
  'Afternoon Session & Lunch (12:00 PM – 04:00 PM)',
  'Evening Sundowner & Cocktails (04:00 PM – 08:00 PM)',
  'Night Gala Dinner (07:00 PM – Midnight)',
  'Full Day Corporate Program (09:00 AM – 06:00 PM)',
  'Multi-Day Residential Offsite',
];

const TIME_FLEXIBILITY = [
  'Strict / Fixed Schedule',
  'Flexible (±1–2 Hours buffer)',
  'Custom Schedule Required',
];

const URGENCY_OPTIONS = [
  'Immediate (Within 7–10 Days)',
  'Upcoming Month',
  'Planned Quarter (2–3 Months ahead)',
];

export function Step2Universal({
  value,
  onChange,
}: {
  value: Partial<UniversalFields>;
  onChange: (v: Partial<UniversalFields>) => void;
}) {
  const { theme } = useStore();

  // Today's date string (YYYY-MM-DD) for min attribute binding
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Handle Start Date change with automatic End Date reconciliation
  const handleStartDateChange = (newStartDate: string) => {
    const updates: Partial<UniversalFields> = {
      ...value,
      startDate: newStartDate,
    };

    // If End Date is not set OR is earlier than new Start Date, auto-sync End Date
    if (!value.endDate || (value.endDate && value.endDate < newStartDate)) {
      updates.endDate = newStartDate;
    }

    onChange(updates);
  };

  const handleEndDateChange = (newEndDate: string) => {
    onChange({
      ...value,
      endDate: newEndDate,
    });
  };

  return (
    <div>
      <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13.5, marginBottom: 20 }}>
        Specify your event schedule, headcount, budget parameters, and procurement instructions.
      </p>

      {/* 1. Date Range with Validation */}
      <SectionLabel>1. Event Schedule & Dates</SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <TextInput
          label="Start Date"
          value={value.startDate || ''}
          onChange={handleStartDateChange}
          type="date"
          min={todayStr}
          required
        />
        <TextInput
          label="End Date"
          value={value.endDate || ''}
          onChange={handleEndDateChange}
          type="date"
          min={value.startDate || todayStr}
          required
        />
      </div>

      {/* 2. Time Slot & Urgency */}
      <SectionLabel>2. Preferred Time Slot & Timing</SectionLabel>
      <div style={{ marginBottom: 14 }}>
        <RadioGroup
          options={TIME_SLOTS}
          value={value.timeSlot || ''}
          onChange={(timeSlot) => onChange({ ...value, timeSlot })}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginBottom: 16 }}>
        <div>
          <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 600, display: 'block', marginBottom: 6 }}>
            Timing Flexibility
          </label>
          <RadioGroup
            options={TIME_FLEXIBILITY}
            value={value.timeFlexibility || ''}
            onChange={(timeFlexibility) => onChange({ ...value, timeFlexibility })}
          />
        </div>
        <div>
          <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 600, display: 'block', marginBottom: 6 }}>
            Procurement Timeline
          </label>
          <RadioGroup
            options={URGENCY_OPTIONS}
            value={value.urgency || ''}
            onChange={(urgency) => onChange({ ...value, urgency })}
          />
        </div>
      </div>

      {/* 3. Headcount & Budget */}
      <SectionLabel>3. Headcount & Budget Allocation</SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <TextInput
          label="Number of Attendees / Guests"
          value={value.persons || ''}
          onChange={(v) => onChange({ ...value, persons: Math.max(0, parseInt(v) || 0) })}
          type="number"
          placeholder="e.g. 75"
          min="1"
          required
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
            Budget per Person (INR) <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <div style={{ position: 'relative' }}>
            <span
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: theme.primary,
                fontWeight: 700,
                fontSize: 15,
              }}
            >
              ₹
            </span>
            <input
              className="input-base"
              type="number"
              min="0"
              value={value.budgetPerPerson || ''}
              onChange={(e) => onChange({ ...value, budgetPerPerson: Math.max(0, parseInt(e.target.value) || 0) })}
              placeholder="e.g. 2500"
              style={{ paddingLeft: 28 }}
            />
          </div>
        </div>
      </div>

      {/* Live Estimated Budget Outlay */}
      {(value.persons || 0) > 0 && (value.budgetPerPerson || 0) > 0 && (
        <div
          style={{
            background: `linear-gradient(135deg, ${theme.primary}15 0%, rgba(255,255,255,0.03) 100%)`,
            border: `1px solid ${theme.primary}44`,
            borderRadius: 14,
            padding: '14px 18px',
            marginBottom: 20,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
              Estimated Total Budget Outlay
            </div>
            <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>
              {value.persons} Attendees × ₹{(value.budgetPerPerson || 0).toLocaleString('en-IN')}
            </div>
          </div>
          <span style={{ fontSize: 22, fontWeight: 800, color: theme.primary, fontFamily: 'var(--font-display)' }}>
            ₹{((value.persons || 0) * (value.budgetPerPerson || 0)).toLocaleString('en-IN')}
          </span>
        </div>
      )}

      {/* 4. Special Instructions */}
      <SectionLabel>4. Corporate Requirements & Notes</SectionLabel>
      <textarea
        className="input-base"
        rows={3}
        value={value.notes || ''}
        onChange={(e) => onChange({ ...value, notes: e.target.value })}
        placeholder="Specific guidelines (e.g. stage AV, dietary requirements, flight routing, branding specs)..."
        style={{ resize: 'vertical', minHeight: 80 }}
      />
    </div>
  );
}
