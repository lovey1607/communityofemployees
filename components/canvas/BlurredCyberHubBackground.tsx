'use client';
// ============================================================
// components/canvas/BlurredCyberHubBackground.tsx
// Cinematic Corporate Architecture & Blurred Employee Workspace
// Smooth Day/Night toggle reflecting daytime team hustle vs late-night office lights
// ============================================================

import React, { useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useStore } from '@/store/useStore';

export function BlurredCyberHubBackground() {
  const { isNightMode } = useStore();

  // Smooth mouse parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 100 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const bgTranslateX = useTransform(smoothX, [-1, 1], [-16, 16]);
  const bgTranslateY = useTransform(smoothY, [-1, 1], [-12, 12]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth) * 2 - 1;
      const y = (e.clientY / innerHeight) * 2 - 1;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        background: isNightMode ? '#070913' : '#f1f5f9',
        transition: 'background 0.6s ease',
      }}
    >
      {/* ── 1. NIGHT MODE LAYER: Modern Glass Tower with Warm Office Lights & Employees Working Late ── */}
      <motion.div
        animate={{ opacity: isNightMode ? 1 : 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'absolute',
          top: '-5%',
          left: '-5%',
          width: '110%',
          height: '110%',
          x: bgTranslateX,
          y: bgTranslateY,
          backgroundImage:
            'url("https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop")',
          backgroundSize: 'cover',
          backgroundPosition: 'center 45%',
          filter: 'blur(7px) brightness(0.65) saturate(1.15)',
          transform: 'scale(1.05)',
        }}
      />

      {/* Night Silhouette Layer: Warm interior conference room reflections & desk lights */}
      <motion.div
        animate={{ opacity: isNightMode ? 0.75 : 0 }}
        transition={{ duration: 0.8 }}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(circle at 75% 35%, rgba(245, 158, 11, 0.22) 0%, transparent 45%), radial-gradient(circle at 25% 65%, rgba(16, 185, 129, 0.18) 0%, transparent 50%)',
          mixBlendMode: 'screen',
        }}
      />

      {/* ── 2. DAY MODE LAYER: Sunlit Modern Corporate Atrium with Blurred Teams Collaborating ── */}
      <motion.div
        animate={{ opacity: isNightMode ? 0 : 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'absolute',
          top: '-5%',
          left: '-5%',
          width: '110%',
          height: '110%',
          x: bgTranslateX,
          y: bgTranslateY,
          backgroundImage:
            'url("https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop")',
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%',
          filter: 'blur(7px) brightness(0.92) contrast(1.05)',
          transform: 'scale(1.05)',
        }}
      />

      {/* Day Ambient Sunbeam & Daylight Floor Glaze */}
      <motion.div
        animate={{ opacity: isNightMode ? 0 : 0.6 }}
        transition={{ duration: 0.8 }}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(circle at 65% 25%, rgba(56, 189, 248, 0.18) 0%, transparent 55%), radial-gradient(circle at 20% 40%, rgba(255, 255, 255, 0.5) 0%, transparent 60%)',
        }}
      />

      {/* ── 3. Atmospheric Dark/Light Tint Overlay for High Contrast Text ── */}
      <motion.div
        animate={{ opacity: isNightMode ? 1 : 0 }}
        transition={{ duration: 0.6 }}
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(7, 9, 19, 0.72) 0%, rgba(5, 7, 14, 0.88) 100%)',
        }}
      />

      <motion.div
        animate={{ opacity: isNightMode ? 0 : 1 }}
        transition={{ duration: 0.6 }}
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(248, 250, 252, 0.75) 0%, rgba(241, 245, 249, 0.9) 100%)',
        }}
      />

      {/* Subtle Vignette for Crisp Card Pop */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: isNightMode
            ? 'radial-gradient(ellipse at center, transparent 40%, rgba(3, 5, 10, 0.65) 100%)'
            : 'radial-gradient(ellipse at center, transparent 45%, rgba(15, 23, 42, 0.08) 100%)',
          transition: 'background 0.6s ease',
        }}
      />
    </div>
  );
}
