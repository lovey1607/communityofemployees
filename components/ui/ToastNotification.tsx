'use client';
// ============================================================
// components/ui/ToastNotification.tsx
// High-End Enterprise Toast Notification System (Framer Motion)
// ============================================================

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from 'lucide-react';

export function ToastContainer() {
  const { toasts, removeToast } = useStore();

  return (
    <div
      style={{
        position: 'fixed',
        top: 24,
        right: 24,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        maxWidth: 420,
        width: 'calc(100vw - 48px)',
        pointerEvents: 'none',
      }}
    >
      <AnimatePresence>
        {toasts.map((t) => {
          const isSuccess = t.type === 'success';
          const isError = t.type === 'error';
          const isWarning = t.type === 'warning';

          const iconColor = isSuccess
            ? '#10b981'
            : isError
            ? '#ef4444'
            : isWarning
            ? '#f59e0b'
            : '#38bdf8';

          const borderColor = isSuccess
            ? 'rgba(16, 185, 129, 0.4)'
            : isError
            ? 'rgba(239, 68, 68, 0.4)'
            : isWarning
            ? 'rgba(245, 158, 11, 0.4)'
            : 'rgba(56, 189, 248, 0.4)';

          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -20, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
              style={{
                background: 'rgba(7, 12, 28, 0.94)',
                border: `1px solid ${borderColor}`,
                borderRadius: 14,
                padding: '14px 18px',
                backdropFilter: 'blur(28px)',
                WebkitBackdropFilter: 'blur(28px)',
                boxShadow: '0 16px 40px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.08) inset',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                pointerEvents: 'auto',
                position: 'relative',
              }}
            >
              <div style={{ flexShrink: 0, marginTop: 2 }}>
                {isSuccess && <CheckCircle2 size={18} color={iconColor} />}
                {isError && <XCircle size={18} color={iconColor} />}
                {isWarning && <AlertTriangle size={18} color={iconColor} />}
                {!isSuccess && !isError && !isWarning && <Info size={18} color={iconColor} />}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13.5,
                    fontWeight: 700,
                    color: '#ffffff',
                    fontFamily: 'var(--font-display)',
                    marginBottom: 2,
                  }}
                >
                  {t.title}
                </div>
                <div
                  style={{
                    fontSize: 12.5,
                    color: 'rgba(255, 255, 255, 0.75)',
                    lineHeight: 1.45,
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {t.message}
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeToast(t.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.4)',
                  cursor: 'pointer',
                  padding: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={15} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
