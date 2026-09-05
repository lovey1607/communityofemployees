'use client';
// ============================================================
// components/venture/Hero3DCanvas.tsx
// Ultra-Refined, Elegant Ambient 3D Constellation & Grid Mesh
// Linear/Stripe style: Sophisticated, subtle, non-intrusive backdrop
// ============================================================

import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

// ─── Subtle Ambient Particle Constellation ───────────────────
function AmbientParticleConstellation({ count = 280 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null!);
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const emerald = new THREE.Color('#1E9E5A');
    const cyan = new THREE.Color('#2E6BFF');
    const amber = new THREE.Color('#FF6B2C');

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Spread across wide background plane
      pos[i3] = (Math.random() - 0.5) * 32;
      pos[i3 + 1] = (Math.random() - 0.5) * 20;
      pos[i3 + 2] = -4 - Math.random() * 12; // Far behind text plane

      const c = [emerald, cyan, amber][i % 3];
      col[i3] = c.r;
      col[i3 + 1] = c.g;
      col[i3 + 2] = c.b;
    }
    return [pos, col];
  }, [count]);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.015;
      pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.03;
    }
  });

  return (
    <Points ref={pointsRef} positions={positions} colors={colors} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        vertexColors
        size={0.08}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={0.65}
      />
    </Points>
  );
}

// ─── Subtle Geometric Horizon Wireframe ──────────────────────
function SubtleHorizonGrid() {
  const gridRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (gridRef.current) {
      gridRef.current.position.y = -5.5 + Math.sin(state.clock.elapsedTime * 0.2) * 0.15;
    }
  });

  return (
    <group ref={gridRef} position={[0, -5.5, -8]} rotation={[-Math.PI * 0.38, 0, 0]}>
      <gridHelper args={[40, 24, '#1E9E5A', 'rgba(255, 255, 255, 0.9)']} />
    </group>
  );
}

export function Hero3DCanvas() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 50% 20%, rgba(30, 158, 90,0.08) 0%, transparent 60%)',
        }}
      />
    );
  }

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 10], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.4} />
        <AmbientParticleConstellation count={240} />
        <SubtleHorizonGrid />
      </Canvas>
    </div>
  );
}
