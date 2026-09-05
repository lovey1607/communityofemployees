'use client';
// ============================================================
// components/modal/steps/FormHelpers.tsx
// Reusable accessible form primitives with high-end corporate styling
// ============================================================

import React from 'react';
import { useStore } from '@/store/useStore';

// ─── Section Label ─────────────────────────────────────────────
export function SectionLabel({ children }: { children: React.ReactNode }) {
  const { theme } = useStore();
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 700,
        color: theme.primary,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        marginBottom: 10,
        marginTop: 18,
      }}
    >
      {children}
    </div>
  );
}

// ─── Toggle Switch ─────────────────────────────────────────────
export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  const { theme } = useStore();
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      <div
        className={`toggle-track ${checked ? 'checked' : ''}`}
        onClick={() => onChange(!checked)}
        style={checked ? { background: theme.primary } : {}}
      >
        <div className="toggle-thumb" />
      </div>
      <span style={{ fontSize: 13.5, color: 'var(--ink)', fontWeight: 500 }}>{label}</span>
    </label>
  );
}

// ─── Checkbox Option ───────────────────────────────────────────
export function CheckOption({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  const { theme } = useStore();
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 14px',
        background: checked ? `${theme.primary}18` : 'var(--cream-2)',
        border: `1px solid ${checked ? theme.primary : 'var(--line)'}`,
        borderRadius: 10,
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          width: 18,
          height: 18,
          borderRadius: 5,
          border: `2px solid ${checked ? theme.primary : 'var(--line)'}`,
          background: checked ? theme.primary : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'all 0.2s',
        }}
        onClick={() => onChange(!checked)}
      >
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="#050711" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span style={{ fontSize: 13.5, color: checked ? 'var(--ink)' : 'var(--ink-2)', fontWeight: checked ? 600 : 400 }}>
        {label}
      </span>
    </label>
  );
}

// ─── Radio Group ───────────────────────────────────────────────
export function RadioGroup({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const { theme } = useStore();
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map((opt) => {
        const isSelected = value === opt;
        return (
          <button
            type="button"
            key={opt}
            onClick={() => onChange(opt)}
            style={{
              padding: '9px 16px',
              borderRadius: 999,
              border: `1px solid ${isSelected ? theme.primary : 'var(--line)'}`,
              background: isSelected ? `${theme.primary}22` : 'var(--cream-2)',
              color: isSelected ? 'var(--ink)' : 'var(--ink-2)',
              fontSize: 13,
              fontWeight: isSelected ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: isSelected ? `0 0 16px ${theme.primary}33` : 'none',
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

// ─── Multi-check Grid ──────────────────────────────────────────
export function MultiCheck({
  options,
  values,
  onChange,
}: {
  options: string[];
  values: string[];
  onChange: (vals: string[]) => void;
}) {
  const toggle = (opt: string) => {
    onChange(values.includes(opt) ? values.filter((v) => v !== opt) : [...values, opt]);
  };
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
      {options.map((opt) => (
        <CheckOption key={opt} label={opt} checked={values.includes(opt)} onChange={() => toggle(opt)} />
      ))}
    </div>
  );
}

// ─── Text Input / Date Input ──────────────────────────────────
export function TextInput({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  min,
  max,
  required = false,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  min?: string;
  max?: string;
  required?: boolean;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12.5, color: 'var(--ink-2)', fontWeight: 600 }}>
        {label} {required && <span style={{ color: '#C2321C' }}>*</span>}
      </label>
      <input
        className="input-base"
        type={type}
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
