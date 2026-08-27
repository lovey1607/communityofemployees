'use client';
// ============================================================
// components/ThemeProvider.tsx — Injects CSS vars from Zustand
// ============================================================

import { useEffect } from 'react';
import { useStore } from '@/store/useStore';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useStore((s) => s.theme);

  useEffect(() => {
    // Inject CSS variables onto :root whenever theme changes
    const root = document.documentElement;
    root.style.setProperty('--theme-bg', theme.bg);
    root.style.setProperty('--theme-primary', theme.primary);
    root.style.setProperty('--theme-accent', theme.accent);
    root.style.setProperty('--theme-text', theme.text);
    root.style.setProperty('--theme-glass', theme.glass);
    root.style.setProperty('--theme-gradient', theme.bgGradient);
    root.style.setProperty('background', theme.bg);
    document.body.style.background = theme.bgGradient;
  }, [theme]);

  return <>{children}</>;
}
