'use client';
// ============================================================
// components/ThemeProvider.tsx
//
// Publishes the active category's colour as CSS variables. It used to also
// paint the <body> background with a dark gradient, which overrode the
// stylesheet from JavaScript and made the page ground unfixable in CSS.
// The ground is now owned by globals.css and never changes; only the accent
// varies by category.
// ============================================================

import { useEffect } from 'react';
import { useStore } from '@/store/useStore';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', theme.primary);
    root.style.setProperty('--theme-accent', theme.accent);
    root.style.setProperty('--theme-text', theme.text);
    root.style.setProperty('--theme-glass', theme.glass);
    root.style.setProperty('--theme-tint', theme.bg);
    root.style.setProperty('--theme-gradient', theme.bgGradient);
  }, [theme]);

  return <>{children}</>;
}
