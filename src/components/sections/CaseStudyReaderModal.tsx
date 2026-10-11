'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { CaseStudyData } from '@/data/caseStudiesData';
import { scrollManager } from '@/store/scrollStore';
import { perfStore } from '@/store/perfStore';
import profileData from '@/../content/profile.json';
import brandWorkData from '@/../content/brand-work.json';
import caseStudySlidesData from '@/../content/case-study-slides.json';

interface CaseStudyReaderModalProps {
  studies?: CaseStudyData[];
  study?: CaseStudyData | null;
  initialIndex?: number;
  onClose: () => void;
  returnFocusRef?: React.RefObject<HTMLElement> | null;
}

const PART_HEADINGS = [
  'Headline result',
  'Brief & baseline',
  'Insight & idea',
  'Execution & distribution',
  'Results & learning',
];

export default function CaseStudyReaderModal({
  studies,
  study,
  initialIndex = 0,
  onClose,
  returnFocusRef,
}: CaseStudyReaderModalProps) {
  const allStudies: CaseStudyData[] = studies && studies.length > 0 ? studies : study ? [study] : [];
  const [studyIdx, setStudyIdx] = useState(initialIndex);
  const [partIdx, setPartIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isGlassBlur, setIsGlassBlur] = useState(perfStore.getSettings().glassBlur);
  const [isDesktop, setIsDesktop] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const modalRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const activeBarRef = useRef<HTMLDivElement>(null);

  const progressRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);
  const pausedRef = useRef(false);
  const pointerDownRef = useRef<{ time: number; x: number; isButton: boolean } | null>(null);

  const currentStudy = allStudies[studyIdx] || allStudies[0];

  const getStudyExtraSlides = useCallback((studyId?: string) => {
    if (!studyId) return [];
    if (studyId === 'brand-social') {
      return (brandWorkData?.items || []).map((item) => ({
        id: item.id,
        label: item.brand,
        image: item.image,
        alt: item.alt,
      }));
    }
    const extra = (caseStudySlidesData as Record<string, Array<{ id: string; label: string; image: string; alt: string }>>)[studyId];
    return extra || [];
  }, []);

  const extraSlides = getStudyExtraSlides(currentStudy?.id);
  const totalSlides = 5 + extraSlides.length;
  const isExtraSlide = partIdx >= 5;
  const currentExtraSlide = isExtraSlide ? extraSlides[partIdx - 5] : null;

  const initials = profileData?.name
    ? profileData.name
        .split(' ')
        .map((w: string) => w[0])
        .join('')
        .toUpperCase()
    : 'JR';

  // Extract text for 5 parts
  const getPartText = (idx: number, s: CaseStudyData) => {
    if (!s || !s.sections) return '';
    switch (idx) {
      case 0:
        return (
          s.sections.headlineResult ||
          (s.headline?.value ? `${s.headline.value} ${s.headline.label || ''}`.trim() : s.summary)
        );
      case 1:
        return s.sections.brief || s.summary;
      case 2:
        return s.sections.insight || '';
      case 3:
        return s.sections.execution || '';
      case 4:
        return s.sections.results || '';
      default:
        return '';
    }
  };

  const currentPartHeading = PART_HEADINGS[partIdx] || PART_HEADINGS[0];
  const currentPartText = currentStudy ? getPartText(partIdx, currentStudy) : '';

  // Navigation handlers
  const handleNext = useCallback(() => {
    progressRef.current = 0;
    if (activeBarRef.current) {
      activeBarRef.current.style.transform = 'scaleX(0)';
    }
    const currentExtra = getStudyExtraSlides(currentStudy?.id);
    const currentTotal = 5 + currentExtra.length;
    if (partIdx < currentTotal - 1) {
      setPartIdx((prev) => prev + 1);
    } else {
      // Move to next case study
      if (studyIdx + 1 < allStudies.length) {
        setStudyIdx((prev) => prev + 1);
        setPartIdx(0);
      } else {
        // Last case study finished -> close
        onClose();
      }
    }
  }, [partIdx, currentStudy?.id, studyIdx, allStudies.length, onClose, getStudyExtraSlides]);

  const handlePrev = useCallback(() => {
    progressRef.current = 0;
    if (activeBarRef.current) {
      activeBarRef.current.style.transform = 'scaleX(0)';
    }
    if (partIdx > 0) {
      setPartIdx((prev) => prev - 1);
    } else {
      if (studyIdx > 0) {
        const prevStudy = allStudies[studyIdx - 1];
        const prevExtra = getStudyExtraSlides(prevStudy?.id);
        const prevTotal = 5 + prevExtra.length;
        setStudyIdx((prev) => prev - 1);
        setPartIdx(prevTotal - 1);
      } else {
        // First part of first study: reset progress
        progressRef.current = 0;
      }
    }
  }, [partIdx, studyIdx, allStudies, getStudyExtraSlides]);

  // Keep pausedRef in sync with state & tab visibility
  useEffect(() => {
    pausedRef.current = isPaused;
  }, [isPaused]);

  // Handle glass blur and desktop responsive check
  useEffect(() => {
    const unsub = perfStore.subscribe((s) => setIsGlassBlur(s.glassBlur));
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => {
      unsub();
      window.removeEventListener('resize', checkDesktop);
    };
  }, []);

  // Lock scroll, trap focus, return focus on close
  useEffect(() => {
    if (!currentStudy) return;

    scrollManager.lenisInstance?.stop();
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus close button on mount
    setTimeout(() => {
      closeBtnRef.current?.focus({ preventScroll: true });
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        setIsPaused((prev) => !prev);
      } else if (e.key === 'Tab' && modalRef.current) {
        const focusables = modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus({ preventScroll: true });
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus({ preventScroll: true });
        }
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        pausedRef.current = true;
      } else {
        pausedRef.current = isPaused;
        lastTimeRef.current = null;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      scrollManager.lenisInstance?.start();
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (returnFocusRef?.current) {
        returnFocusRef.current.focus({ preventScroll: true });
      }
    };
  }, [currentStudy, handleNext, handlePrev, isPaused, onClose, returnFocusRef]);

  // 8s Auto-advance rAF loop
  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      if (activeBarRef.current) {
        activeBarRef.current.style.transform = 'scaleX(1)';
      }
      return;
    }

    let animationFrameId: number;
    const DURATION = 8000; // 8 seconds per part
    progressRef.current = 0;
    lastTimeRef.current = null;

    const tick = (time: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = time;
      }
      const delta = time - lastTimeRef.current;
      lastTimeRef.current = time;

      if (!pausedRef.current && document.visibilityState !== 'hidden') {
        progressRef.current += delta;
        const fraction = Math.min(1, progressRef.current / DURATION);

        if (activeBarRef.current) {
          activeBarRef.current.style.transform = `scaleX(${fraction})`;
        }

        if (progressRef.current >= DURATION) {
          progressRef.current = 0;
          handleNext();
          return;
        }
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [studyIdx, partIdx, handleNext]);

  // Pointer & Tap handlers (Tap left = prev, right = next; hold = pause)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const isInteractive = !!target.closest('button, .story-close-btn, .nav-arrow-btn, .story-panel-text');
    pointerDownRef.current = {
      time: performance.now(),
      x: e.clientX,
      isButton: isInteractive,
    };
    setIsPaused(true);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsPaused(false);
    if (!pointerDownRef.current) return;

    const { time, isButton } = pointerDownRef.current;
    pointerDownRef.current = null;
    const duration = performance.now() - time;

    // If it was a short tap (< 280ms) and not on a dedicated button
    if (duration < 280 && !isButton) {
      const column = modalRef.current?.querySelector('.story-column');
      if (column) {
        const rect = column.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        if (clickX < rect.width / 2) {
          handlePrev();
        } else {
          handleNext();
        }
      }
    }
  };

  const handlePointerCancel = () => {
    setIsPaused(false);
    pointerDownRef.current = null;
  };

  if (!currentStudy || !mounted) return null;

  return createPortal(
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Case Study: ${currentStudy.title}`}
      className="story-viewer-dialog"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    >
      {/* Desktop Prev Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handlePrev();
        }}
        className="nav-arrow-btn nav-arrow-left glass-fake"
        aria-label="Previous story part"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* Main 9:16 Story Column */}
      <div className="story-column">
        {/* Background Media */}
        <div className="story-media-layer">
          {isExtraSlide && currentExtraSlide ? (
            <img
              src={currentExtraSlide.image}
              alt={currentExtraSlide.alt || currentExtraSlide.label}
              className="story-bg-img"
            />
          ) : currentStudy.heroImage ? (
            <img
              src={currentStudy.heroImage}
              alt={currentStudy.title}
              className="story-bg-img"
            />
          ) : (
            <div className="story-bg-placeholder" />
          )}
          {!isExtraSlide && <div className="story-gradient-overlay" />}
          {isExtraSlide && <div className="story-brand-top-scrim" />}
        </div>

        {/* Top Floating Controls */}
        <div className="story-top-wrapper">
          {/* Progress Bars */}
          <div className="story-progress-row">
            {Array.from({ length: totalSlides }).map((_, idx) => {
              const isCompleted = idx < partIdx;
              const isCurrent = idx === partIdx;
              return (
                <div
                  key={idx}
                  className={`story-bar-track ${isCompleted ? 'bar-completed' : ''}`}
                >
                  {isCurrent && (
                    <div
                      ref={activeBarRef}
                      className="story-bar-fill"
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Under-the-bars Header Row */}
          <div className="story-header-row">
            <div className="story-profile-group">
              <div className="story-avatar-circle">{initials}</div>
              <div className="story-header-meta">
                <div className="story-header-title">{currentStudy.title}</div>
                <div className="story-header-kicker">{currentStudy.kicker}</div>
              </div>
            </div>

            <button
              ref={closeBtnRef}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="story-close-btn"
              aria-label="Close"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Extra Slide Label (small label with only the page/brand name) or Bottom Story Panel */}
        {isExtraSlide && currentExtraSlide ? (
          <div className="story-brand-badge-wrapper">
            <div className="story-brand-label-pill">
              {currentExtraSlide.label}
            </div>
          </div>
        ) : (
          <div
            className={`story-bottom-panel ${isGlassBlur && isDesktop ? 'glass-real' : 'glass-fake'}`}
          >
            <div className="story-panel-step">{partIdx + 1} OF {totalSlides}</div>
            <h2
              className="story-panel-heading"
              aria-live="polite"
            >
              {currentPartHeading}
            </h2>
            <div className="story-panel-text">
              {currentPartText.split('\n\n').map((para, i) => (
                <p key={i} className="story-para">
                  {para}
                </p>
              ))}
            </div>
            <div className="story-panel-hint">Tap to continue · hold to pause</div>
          </div>
        )}
      </div>

      {/* Desktop Next Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleNext();
        }}
        className="nav-arrow-btn nav-arrow-right glass-fake"
        aria-label="Next story part"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      <style jsx>{`
        .story-viewer-dialog {
          position: fixed;
          inset: 0;
          z-index: 100000;
          background: rgba(11, 10, 9, 0.92);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 28px;
          user-select: none;
          -webkit-user-select: none;
          touch-action: manipulation;
          animation: storyFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes storyFadeIn {
          from {
            opacity: 0;
            transform: scale(0.98);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .story-column {
          position: relative;
          height: min(calc(100vh - 48px), 860px);
          width: calc(min(calc(100vh - 48px), 860px) * (9 / 16));
          border-radius: 24px;
          overflow: hidden;
          background: #000;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .story-media-layer {
          position: absolute;
          inset: 0;
          z-index: 0;
          background: #000;
        }
        .story-bg-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          background: #000;
          display: block;
        }
        .story-brand-top-scrim {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 100px;
          background: linear-gradient(180deg, rgba(0, 0, 0, 0.7) 0%, transparent 100%);
          pointer-events: none;
        }
        .story-brand-badge-wrapper {
          position: relative;
          z-index: 2;
          padding: 24px 20px;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          pointer-events: none;
        }
        .story-brand-label-pill {
          display: inline-flex;
          align-items: center;
          padding: 7px 16px;
          background: rgba(18, 18, 20, 0.88);
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 999px;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          color: var(--text, #f5efe6);
          font-family: var(--font-main);
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
        }
        .story-bg-placeholder {
          width: 100%;
          height: 100%;
          background: #181719;
        }
        .story-gradient-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(11, 10, 9, 0.75) 0%,
            rgba(11, 10, 9, 0.2) 22%,
            rgba(11, 10, 9, 0.2) 55%,
            rgba(11, 10, 9, 0.88) 100%
          );
          pointer-events: none;
        }
        .story-top-wrapper {
          position: relative;
          z-index: 2;
          padding: 16px 16px 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .story-progress-row {
          display: flex;
          align-items: center;
          gap: 5px;
          width: 100%;
          height: 3px;
        }
        .story-bar-track {
          flex: 1;
          height: 3px;
          background: rgba(245, 239, 230, 0.3);
          border-radius: 2px;
          overflow: hidden;
          position: relative;
        }
        .story-bar-track.bar-completed {
          background: var(--text);
        }
        .story-bar-fill {
          position: absolute;
          inset: 0;
          background: var(--accent);
          transform-origin: left;
          transform: scaleX(0);
          will-change: transform;
        }
        .story-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }
        .story-profile-group {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }
        .story-avatar-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--accent);
          color: var(--bg);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-main);
          font-size: 15px;
          font-weight: 700;
          flex-shrink: 0;
          letter-spacing: -0.02em;
        }
        .story-header-meta {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .story-header-title {
          font-family: var(--font-main);
          font-size: 15px;
          font-weight: 600;
          color: var(--text);
          line-height: 1.2;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .story-header-kicker {
          font-family: var(--font-main);
          font-size: 12px;
          color: var(--muted);
          line-height: 1.2;
          margin-top: 2px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .story-close-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(30, 28, 26, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: var(--text);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: background 0.2s ease, transform 0.2s ease;
        }
        .story-close-btn:hover {
          background: rgba(30, 28, 26, 0.9);
          transform: scale(1.05);
        }
        .nav-arrow-btn {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(30, 28, 26, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.16);
          color: var(--text);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), background 0.2s ease;
          flex-shrink: 0;
        }
        .nav-arrow-btn:hover {
          background: rgba(45, 42, 39, 0.95);
          transform: scale(1.08);
        }
        .story-bottom-panel {
          position: relative;
          z-index: 2;
          margin: 12px;
          border-radius: 24px;
          background: rgba(11, 10, 9, 0.72);
          padding: 22px 20px 16px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }
        .story-panel-step {
          font-family: var(--font-main);
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 4px;
        }
        .story-panel-heading {
          font-family: var(--font-serif);
          font-style: italic;
          font-size: 40px;
          font-weight: 400;
          color: var(--text);
          line-height: 1.1;
          margin: 0 0 10px 0;
          letter-spacing: -0.01em;
        }
        .story-panel-text {
          font-family: var(--font-main);
          font-size: 16px;
          line-height: 1.45;
          color: #d8d2c8;
          font-weight: 400;
          max-height: min(220px, 28vh);
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
        }
        .story-para {
          margin: 0 0 8px 0;
        }
        .story-para:last-child {
          margin-bottom: 0;
        }
        .story-panel-hint {
          font-family: var(--font-main);
          font-size: 12px;
          color: var(--muted);
          margin-top: 12px;
          opacity: 0.85;
        }

        @media (max-width: 767px) {
          .story-viewer-dialog {
            background: #000;
            padding: 0;
            gap: 0;
          }
          .nav-arrow-btn {
            display: none;
          }
          .story-column {
            width: 100vw;
            height: 100vh;
            border-radius: 0;
            border: none;
          }
          .story-top-wrapper {
            padding: calc(env(safe-area-inset-top, 16px) + 12px) 14px 0;
          }
          .story-bottom-panel {
            margin: 12px 12px calc(env(safe-area-inset-bottom, 12px) + 12px);
            padding: 18px 16px 14px;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            background: rgba(11, 10, 9, 0.88);
          }
          .story-panel-heading {
            font-size: 32px;
          }
          .story-panel-text {
            font-size: 15px;
            max-height: 180px;
          }
        }
      `}</style>
    </div>,
    document.body
  );
}
