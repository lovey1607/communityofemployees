'use client';
// ============================================================
// components/ui/Skeleton.tsx — Dark Glassmorphic Skeleton Loader
// ============================================================

import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
}

export function Skeleton({
  className = '',
  width,
  height,
  borderRadius = 8,
  style,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={`animate-pulse ${className}`}
      style={{
        width: width ?? '100%',
        height: height ?? '1rem',
        borderRadius,
        background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.9) 50%, rgba(255, 255, 255, 0.9) 100%)',
        backgroundSize: '200% 100%',
        ...style,
      }}
      {...props}
    />
  );
}
