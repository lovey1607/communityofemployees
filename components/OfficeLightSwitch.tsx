'use client';
// ============================================================
// components/OfficeLightSwitch.tsx
// Luxury physical tactile "Office Lights" switch with inset shadows
// Controls Day/Night transition of the Blurred Cyber Hub background
// ============================================================

import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Sun, Moon } from 'lucide-react';

export function OfficeLightSwitch() {
  const { isNightMode, toggleNightMode } = useStore();

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 12,
        background: isNightMode
          ? 'rgba(15, 23, 42, 0.72)'
          : 'rgba(255, 255, 255, 0.85)',
        border: isNightMode
          ? '1px solid rgba(255, 255, 255, 0.14)'
          : '1px solid rgba(0, 0, 0, 0.1)',
        borderRadius: 999,
        padding: '5px 8px 5px 16px',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        boxShadow: isNightMode
          ? '0 10px 25px -5px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
          : '0 10px 25px -5px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
        transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
        userSelect: 'none',
      }}
    >
      {/* Label and Live Status Light */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: isNightMode ? '#fbbf24' : '#0ea5e9',
            boxShadow: isNightMode
              ? '0 0 12px #fbbf24, 0 0 4px #fbbf24'
              : '0 0 10px #0ea5e9, 0 0 4px #0ea5e9',
            transition: 'all 0.3s ease',
          }}
        />
        <span
          style={{
            fontSize: 11.5,
            fontWeight: 800,
            color: isNightMode ? '#ffffff' : '#0f172a',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-display)',
            transition: 'color 0.3s ease',
          }}
        >
          Office Lights
        </span>
      </div>

      {/* Luxury Inset Switch Track */}
      <button
        type="button"
        onClick={toggleNightMode}
        aria-label="Toggle Office Lights (Day / Night Mode)"
        style={{
          width: 62,
          height: 30,
          borderRadius: 15,
          background: isNightMode
            ? 'linear-gradient(180deg, #0b0f19 0%, #172033 100%)'
            : 'linear-gradient(180deg, #cbd5e1 0%, #e2e8f0 100%)',
          border: isNightMode
            ? '1px solid rgba(255, 255, 255, 0.18)'
            : '1px solid rgba(0, 0, 0, 0.14)',
          position: 'relative',
          cursor: 'pointer',
          padding: 3,
          display: 'flex',
          alignItems: 'center',
          outline: 'none',
          boxShadow: isNightMode
            ? 'inset 0 3px 6px rgba(0, 0, 0, 0.8), inset 0 1px 2px rgba(0, 0, 0, 0.6), 0 1px 0 rgba(255, 255, 255, 0.1)'
            : 'inset 0 3px 6px rgba(0, 0, 0, 0.18), inset 0 1px 2px rgba(0, 0, 0, 0.12), 0 1px 0 rgba(255, 255, 255, 0.8)',
          transition: 'all 0.4s ease',
        }}
      >
        {/* Day Sun Icon */}
        <div
          style={{
            position: 'absolute',
            left: 7,
            display: 'flex',
            alignItems: 'center',
            opacity: isNightMode ? 0.25 : 0.95,
            transition: 'opacity 0.3s ease',
          }}
        >
          <Sun size={13} color={isNightMode ? '#64748b' : '#d97706'} />
        </div>

        {/* Night Moon Icon */}
        <div
          style={{
            position: 'absolute',
            right: 7,
            display: 'flex',
            alignItems: 'center',
            opacity: isNightMode ? 0.95 : 0.25,
            transition: 'opacity 0.3s ease',
          }}
        >
          <Moon size={13} color={isNightMode ? '#38bdf8' : '#94a3b8'} />
        </div>

        {/* Tactile Metallic Thumb Slider Knob */}
        <motion.div
          animate={{ x: isNightMode ? 32 : 2 }}
          transition={{ type: 'spring', stiffness: 480, damping: 28 }}
          style={{
            width: 22,
            height: 22,
            borderRadius: '50%',
            background: isNightMode
              ? 'radial-gradient(circle at 35% 30%, #fef08a 0%, #f59e0b 55%, #b45309 100%)'
              : 'radial-gradient(circle at 35% 30%, #ffffff 0%, #e2e8f0 60%, #94a3b8 100%)',
            boxShadow: isNightMode
              ? '0 0 14px rgba(251, 191, 36, 0.7), 0 2px 5px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.6)'
              : '0 2px 6px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
            border: isNightMode
              ? '1px solid rgba(254, 240, 138, 0.6)'
              : '1px solid rgba(255, 255, 255, 0.8)',
          }}
        >
          {isNightMode ? (
            <Moon size={10} color="#451a03" />
          ) : (
            <Sun size={10} color="#b45309" />
          )}
        </motion.div>
      </button>
    </div>
  );
}
