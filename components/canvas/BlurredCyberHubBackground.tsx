'use client';
// ============================================================
// components/canvas/BlurredCyberHubBackground.tsx
//
// The soft backdrop behind app screens. It used to be a darkened photo of
// Cyber Hub with a day/night crossfade, which only worked on a near-black
// ground. On the cream design it is the same warm blobs the landing hero
// uses, so every screen sits on one recognisable surface.
//
// Kept under the original name because a dozen screens import it.
// ============================================================

import React from 'react';

export function BlurredCyberHubBackground() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        background: 'var(--cream)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: 520,
          height: 520,
          borderRadius: '50%',
          filter: 'blur(70px)',
          opacity: 0.5,
          background: '#FFD9C2',
          top: -180,
          right: -140,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 420,
          height: 420,
          borderRadius: '50%',
          filter: 'blur(70px)',
          opacity: 0.45,
          background: '#CDEFDB',
          bottom: -160,
          left: -150,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 300,
          height: 300,
          borderRadius: '50%',
          filter: 'blur(70px)',
          opacity: 0.35,
          background: '#FFF0B3',
          top: '45%',
          left: '48%',
        }}
      />
    </div>
  );
}
