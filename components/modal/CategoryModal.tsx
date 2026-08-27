'use client';
// ============================================================
// components/modal/CategoryModal.tsx
// High-End Glassmorphism Multi-Step Intake Modal
// Robust opening from any dashboard / button with Category Switcher
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Sparkles, CheckCircle2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { CategoryType, CategoryDetails, UniversalFields } from '@/lib/types';
import { CATEGORY_LABELS, THEMES } from '@/lib/themes';
import { Category3DIcon } from '@/components/ui/Category3DIcons';
import { Step1Sports } from './steps/Step1Sports';
import { Step1Food } from './steps/Step1Food';
import { Step1Trips } from './steps/Step1Trips';
import { Step1Gifts } from './steps/Step1Gifts';
import { Step1Dress } from './steps/Step1Dress';
import { Step2Universal } from './steps/Step2Universal';
import { Step3Confirm } from './steps/Step3Confirm';

const STEP_LABELS = [
  '1. Event Specifications',
  '2. Schedule, Headcount & Budget',
  '3. Review & Publish RFP',
];

const CATEGORY_TABS: { id: CategoryType; label: string; icon: string }[] = [
  { id: 'sports', label: 'Sports', icon: '🏆' },
  { id: 'food', label: 'Food & Party', icon: '🥂' },
  { id: 'trips', label: 'Trips', icon: '✈️' },
  { id: 'gifts', label: 'Gifts', icon: '🎁' },
  { id: 'dress', label: 'Dress', icon: '👔' },
];

function StepIndicator({ current, total }: { current: number; total: number }) {
  const { theme } = useStore();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {Array.from({ length: total }).map((_, i) => {
        const isCurrent = i === current;
        const isDone = i < current;
        return (
          <div
            key={i}
            style={{
              height: 6,
              width: isCurrent ? 24 : 8,
              borderRadius: 3,
              background: isCurrent ? theme.primary : isDone ? theme.accent : 'rgba(255,255,255,0.18)',
              transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
              boxShadow: isCurrent ? `0 0 10px ${theme.primary}` : 'none',
            }}
          />
        );
      })}
    </div>
  );
}

export function CategoryModal() {
  const {
    activeCategory, modalOpen, closeModal, resetCategory,
    selectCategory, submitRFP, theme, currentUser, currentCorporateProfile,
  } = useStore();

  const [step, setStep] = useState(0);
  const [categoryDetails, setCategoryDetails] = useState<Partial<CategoryDetails>>({});
  const [universal, setUniversal] = useState<Partial<UniversalFields>>({
    timeSlot: 'Morning Session (08:00 AM – 12:00 PM)',
    timeFlexibility: 'Flexible (±1–2 Hours buffer)',
    urgency: 'Upcoming Month',
  });
  const [submitted, setSubmitted] = useState(false);
  const [direction, setDirection] = useState(1);

  const effectiveCategory: CategoryType = activeCategory || 'food';
  const effectiveTheme = THEMES[effectiveCategory] || theme;
  const isApproved = currentUser?.role === 'corporate' && currentCorporateProfile?.status === 'approved';

  // ─── Clean Exit / Reset Handler ──────────────────
  const handleClose = useCallback(() => {
    closeModal();
    resetCategory();
    setStep(0);
    setCategoryDetails({});
    setUniversal({
      timeSlot: 'Morning Session (08:00 AM – 12:00 PM)',
      timeFlexibility: 'Flexible (±1–2 Hours buffer)',
      urgency: 'Upcoming Month',
    });
    setSubmitted(false);
  }, [closeModal, resetCategory]);

  // Handle ESC key to safely exit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && modalOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalOpen, handleClose]);

  const handleCategorySwitch = (cat: CategoryType) => {
    selectCategory(cat);
    setCategoryDetails({});
  };

  const handleSubmit = () => {
    const state = useStore.getState();
    const user = state.currentUser;
    const corp = state.currentCorporateProfile;

    // Guard 1: Not logged in
    if (!user) {
      state.addToast({
        type: 'error',
        title: '🔒 Sign In Required',
        message: 'Please sign in as a Corporate to publish an RFP.',
      });
      handleClose();
      return;
    }

    // Guard 2: Not a corporate
    if (user.role !== 'corporate') {
      state.addToast({
        type: 'error',
        title: '🚫 Corporate Account Required',
        message: 'Only verified Corporate accounts can post RFPs.',
      });
      handleClose();
      return;
    }

    // Guard 3: Corporate not yet approved by Admin
    if (!corp || corp.status !== 'approved') {
      state.addToast({
        type: 'warning',
        title: '⏳ Verification Pending',
        message: 'Your corporate profile is under review. You can post RFPs once Admin approves your account.',
        duration: 6000,
      });
      handleClose();
      return;
    }

    // All clear — submit
    submitRFP({
      category: effectiveCategory,
      categoryDetails: categoryDetails as CategoryDetails,
      universal: universal as UniversalFields,
    });
    setSubmitted(true);
  };

  const renderStep1 = () => {
    switch (effectiveCategory) {
      case 'sports': return <Step1Sports value={categoryDetails as any} onChange={setCategoryDetails} />;
      case 'food':   return <Step1Food value={categoryDetails as any} onChange={setCategoryDetails} />;
      case 'trips':  return <Step1Trips value={categoryDetails as any} onChange={setCategoryDetails} />;
      case 'gifts':  return <Step1Gifts value={categoryDetails as any} onChange={setCategoryDetails} />;
      case 'dress':  return <Step1Dress value={categoryDetails as any} onChange={setCategoryDetails} />;
      default:       return <Step1Food value={categoryDetails as any} onChange={setCategoryDetails} />;
    }
  };

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
  };

  const goNext = () => {
    setDirection(1);
    setStep((s) => Math.min(2, s + 1));
  };
  const goPrev = () => {
    setDirection(-1);
    setStep((s) => Math.max(0, s - 1));
  };

  return (
    <AnimatePresence>
      {modalOpen && (
        <motion.div
          key="category-modal-overlay"
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={handleClose}
          style={{ zIndex: 100 }}
        >
          <motion.div
            key="category-modal-card"
            initial={{ scale: 0.94, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 680,
              maxHeight: '92vh',
              background: 'rgba(7, 10, 24, 0.94)',
              border: `1px solid ${effectiveTheme.primary}44`,
              borderRadius: 24,
              backdropFilter: 'blur(36px)',
              WebkitBackdropFilter: 'blur(36px)',
              boxShadow: `0 32px 90px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.1) inset`,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '20px 24px 16px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                background: `linear-gradient(135deg, ${effectiveTheme.primary}18 0%, transparent 100%)`,
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, flexShrink: 0 }}>
                    <Category3DIcon category={effectiveCategory} className="w-10 h-10" />
                  </div>
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 11.5,
                        color: effectiveTheme.primary,
                        fontWeight: 800,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        marginBottom: 2,
                      }}
                    >
                      <span>{CATEGORY_LABELS[effectiveCategory]}</span>
                    </div>
                    <h2
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 18,
                        fontWeight: 800,
                        color: '#ffffff',
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {submitted ? 'Procurement Request Live' : STEP_LABELS[step]}
                    </h2>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  {!submitted && <StepIndicator current={step} total={3} />}
                  <button
                    type="button"
                    onClick={handleClose}
                    aria-label="Close modal"
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: 10,
                      width: 32,
                      height: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: 'rgba(255,255,255,0.7)',
                      transition: 'all 0.2s',
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Category Quick Selector Pills (Step 0) */}
              {!submitted && step === 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {CATEGORY_TABS.map((cat) => {
                    const isSelected = effectiveCategory === cat.id;
                    const catTheme = THEMES[cat.id];
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleCategorySwitch(cat.id)}
                        style={{
                          padding: '5px 12px',
                          borderRadius: 999,
                          border: isSelected ? `1.5px solid ${catTheme.primary}` : '1px solid rgba(255,255,255,0.12)',
                          background: isSelected ? `${catTheme.primary}25` : 'rgba(255,255,255,0.05)',
                          color: isSelected ? '#ffffff' : 'rgba(255,255,255,0.65)',
                          fontSize: 12,
                          fontWeight: isSelected ? 800 : 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 5,
                          transition: 'all 0.2s ease',
                          fontFamily: 'var(--font-body)',
                        }}
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Scrollable Form Body */}
            <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1 }}>
              <AnimatePresence mode="wait" custom={direction}>
                {step === 0 && (
                  <motion.div
                    key="step1"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
                  >
                    {renderStep1()}
                  </motion.div>
                )}
                {step === 1 && (
                  <motion.div
                    key="step2"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
                  >
                    <Step2Universal value={universal} onChange={setUniversal} />
                  </motion.div>
                )}
                {step === 2 && (
                  <motion.div
                    key="step3"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
                  >
                    <Step3Confirm
                      category={effectiveCategory}
                      categoryDetails={categoryDetails}
                      universal={universal}
                      submitted={submitted}
                      onSubmit={handleSubmit}
                      onClose={handleClose}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer Navigation Buttons */}
            {!submitted && (
              <div
                style={{
                  padding: '16px 28px',
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(0, 0, 0, 0.25)',
                  flexShrink: 0,
                }}
              >
                {step > 0 ? (
                  <button
                    type="button"
                    onClick={goPrev}
                    className="btn-ghost"
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', fontSize: 13 }}
                  >
                    <ChevronLeft size={16} /> Back
                  </button>
                ) : (
                  <div />
                )}

                {step < 2 ? (
                  <button
                    type="button"
                    onClick={goNext}
                    className="btn-primary"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '10px 22px',
                      fontSize: 13.5,
                      background: effectiveTheme.primary,
                    }}
                  >
                    <span>Continue</span>
                    <ChevronRight size={16} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!isApproved}
                    className="btn-primary"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '10px 24px',
                      fontSize: 13.5,
                      background: isApproved
                        ? `linear-gradient(135deg, ${effectiveTheme.primary} 0%, ${effectiveTheme.accent} 100%)`
                        : 'rgba(255,255,255,0.12)',
                      color: isApproved ? '#ffffff' : 'rgba(255,255,255,0.4)',
                      cursor: isApproved ? 'pointer' : 'not-allowed',
                      boxShadow: isApproved ? `0 0 20px ${effectiveTheme.primary}60` : 'none',
                    }}
                  >
                    <Sparkles size={16} />
                    <span>{isApproved ? 'Publish Corporate RFP' : 'Sign in as Corporate to Publish'}</span>
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
