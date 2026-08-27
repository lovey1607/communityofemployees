'use client';
// ============================================================
// components/audio/useCategorySound.ts
// Web Audio API — warm, nostalgic ambient tones per category
// Plays a gentle chord/melody when a category is chosen
// ============================================================

import { useCallback, useRef } from 'react';
import { CategoryType } from '@/lib/types';

// Frequency sequences (Hz) for each category
// Inspired by classic Indian musical intervals (sa, re, ga, ma, pa...)
const CATEGORY_NOTES: Record<CategoryType, { freqs: number[]; type: OscillatorType; gain: number }> = {
  sports: {
    // Energetic ascending 4-note fanfare (like a cricket match start)
    freqs: [440, 554, 659, 880],
    type: 'square',
    gain: 0.08,
  },
  food: {
    // Warm 3-note chord (like a restaurant bell)
    freqs: [261, 329, 392],
    type: 'sine',
    gain: 0.1,
  },
  trips: {
    // Dreamy ascending arpeggio (like train departure chime)
    freqs: [329, 415, 494, 622, 784],
    type: 'sine',
    gain: 0.08,
  },
  gifts: {
    // Celebratory bell-like pattern (like Diwali chimes)
    freqs: [523, 659, 784, 1047, 784, 659],
    type: 'triangle',
    gain: 0.09,
  },
  dress: {
    // Smooth 2-note warm tone (like a boutique door bell)
    freqs: [392, 494],
    type: 'sine',
    gain: 0.1,
  },
};

export function useCategorySound() {
  const ctxRef = useRef<AudioContext | null>(null);

  const play = useCallback((category: CategoryType) => {
    try {
      // Create or resume AudioContext on user gesture
      if (!ctxRef.current) {
        ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = ctxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const { freqs, type, gain } = CATEGORY_NOTES[category];

      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const start = ctx.currentTime + i * 0.12;
        const duration = 0.4;

        gainNode.gain.setValueAtTime(0, start);
        gainNode.gain.linearRampToValueAtTime(gain, start + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, start + duration);

        osc.start(start);
        osc.stop(start + duration);
      });
    } catch (e) {
      // Silently ignore — audio is non-critical
    }
  }, []);

  return { play };
}
