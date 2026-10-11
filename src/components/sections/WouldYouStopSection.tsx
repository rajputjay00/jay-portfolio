'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import swipeData from '@/../content/swipe.json';
import { scrollManager } from '@/store/scrollStore';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function WouldYouStopSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const stopStampRef = useRef<HTMLDivElement>(null);
  const scrollStampRef = useRef<HTMLDivElement>(null);

  const posts = swipeData?.posts || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stopCount, setStopCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const indexRef = useRef(0);
  const isFinishedRef = useRef(false);
  const isAnimatingRef = useRef(false);

  // Pointer drag state
  const isDraggingRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  const currentDeltaRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    indexRef.current = currentIndex;
    isFinishedRef.current = isFinished;
  }, [currentIndex, isFinished]);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion && sectionRef.current) {
      const ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top 80%',
          once: true,
          onEnter: () => {
            gsap.from('.swipe-title-reveal', {
              y: '100%',
              duration: 0.7,
              ease: 'power3.out',
            });
            gsap.from('.swipe-game-container', {
              y: 24,
              opacity: 0,
              duration: 0.8,
              ease: 'power2.out',
            });
          },
        });
      }, sectionRef);

      return () => ctx.revert();
    }
  }, []);

  const handleSwipe = useCallback(
    (direction: 'left' | 'right') => {
      if (isFinishedRef.current || isAnimatingRef.current || indexRef.current >= posts.length) {
        return;
      }

      isAnimatingRef.current = true;
      const isStop = direction === 'right';
      const targetX = isStop ? 600 : -600;
      const targetRotate = isStop ? 25 : -25;

      if (cardRef.current) {
        gsap.to(cardRef.current, {
          x: targetX,
          y: 30,
          rotation: targetRotate,
          opacity: 0,
          duration: 0.3,
          ease: 'power2.in',
          onComplete: () => {
            if (isStop) {
              setStopCount((c) => c + 1);
            }
            const nextIdx = indexRef.current + 1;
            indexRef.current = nextIdx;
            if (nextIdx >= posts.length) {
              setIsFinished(true);
              isFinishedRef.current = true;
            } else {
              setCurrentIndex(nextIdx);
            }

            // Reset card position for the next element
            if (cardRef.current) {
              gsap.set(cardRef.current, { x: 0, y: 0, rotation: -2, opacity: 1 });
            }
            if (stopStampRef.current) stopStampRef.current.style.opacity = '0';
            if (scrollStampRef.current) scrollStampRef.current.style.opacity = '0';
            isAnimatingRef.current = false;
          },
        });
      } else {
        if (isStop) setStopCount((c) => c + 1);
        const nextIdx = indexRef.current + 1;
        indexRef.current = nextIdx;
        if (nextIdx >= posts.length) {
          setIsFinished(true);
          isFinishedRef.current = true;
        } else {
          setCurrentIndex(nextIdx);
        }
        isAnimatingRef.current = false;
      }
    },
    [posts.length]
  );

  const resetGame = () => {
    setCurrentIndex(0);
    indexRef.current = 0;
    setStopCount(0);
    setIsFinished(false);
    isFinishedRef.current = false;
    isAnimatingRef.current = false;
    if (cardRef.current) {
      gsap.set(cardRef.current, { x: 0, y: 0, rotation: -2, opacity: 1 });
    }
  };

  // Keyboard navigation when section in view
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName || '';
      if (['INPUT', 'TEXTAREA'].includes(activeTag)) return;
      if (document.querySelector('.story-viewer-dialog, .exit-stop-overlay')) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleSwipe('right');
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleSwipe('left');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSwipe]);

  // Pointer drag handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (isFinished || isAnimatingRef.current) return;
    isDraggingRef.current = true;
    startPosRef.current = { x: e.clientX, y: e.clientY };
    currentDeltaRef.current = { x: 0, y: 0 };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !cardRef.current) return;
    const dx = e.clientX - startPosRef.current.x;
    const dy = e.clientY - startPosRef.current.y;
    currentDeltaRef.current = { x: dx, y: dy };

    const rotate = (dx / 300) * 15;
    gsap.set(cardRef.current, { x: dx, y: dy, rotation: rotate });

    // Stamps opacity
    if (dx > 20) {
      const op = Math.min(1, (dx - 20) / 80);
      if (stopStampRef.current) stopStampRef.current.style.opacity = op.toFixed(2);
      if (scrollStampRef.current) scrollStampRef.current.style.opacity = '0';
    } else if (dx < -20) {
      const op = Math.min(1, (-dx - 20) / 80);
      if (scrollStampRef.current) scrollStampRef.current.style.opacity = op.toFixed(2);
      if (stopStampRef.current) stopStampRef.current.style.opacity = '0';
    } else {
      if (stopStampRef.current) stopStampRef.current.style.opacity = '0';
      if (scrollStampRef.current) scrollStampRef.current.style.opacity = '0';
    }
  };

  const handlePointerUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    const dx = currentDeltaRef.current.x;

    if (dx > 100) {
      handleSwipe('right');
    } else if (dx < -100) {
      handleSwipe('left');
    } else {
      // Spring back
      if (cardRef.current) {
        gsap.to(cardRef.current, {
          x: 0,
          y: 0,
          rotation: -2,
          duration: 0.3,
          ease: 'power2.out',
        });
      }
      if (stopStampRef.current) stopStampRef.current.style.opacity = '0';
      if (scrollStampRef.current) scrollStampRef.current.style.opacity = '0';
    }
  };

  const handleMessageMe = () => {
    if (scrollManager.lenisInstance) {
      scrollManager.lenisInstance.scrollTo('#message');
    } else {
      document.getElementById('message')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const currentPost = posts[currentIndex] || posts[0];

  return (
    <section
      id="swipe"
      ref={sectionRef}
      className="swipe-section"
      tabIndex={0}
      aria-label="Would you stop? interactive card swipe section"
      style={{
        position: 'relative',
        width: '100%',
        boxSizing: 'border-box',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        backgroundColor: 'var(--bg)',
        color: 'var(--text)',
        overflow: 'hidden',
      }}
    >
      {/* Ambient Glows */}
      <div
        className="ambient-glow drift-2"
        style={{
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '600px',
        }}
      />

      <div className="section-container">
        {/* Title & Progress dashes */}
        <div className="swipe-header">
          <div className="title-mask-wrapper">
            <h2 className="section-title swipe-title-reveal">Would you stop?</h2>
          </div>

          <div className="swipe-dashes-row" aria-hidden="true">
            {posts.map((_, idx) => {
              const isCompleted = isFinished || idx < currentIndex;
              const isCurrent = !isFinished && idx === currentIndex;
              return (
                <div
                  key={idx}
                  className={`swipe-dash ${
                    isCompleted ? 'dash-done' : isCurrent ? 'dash-current' : 'dash-upcoming'
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Game Container */}
        <div className="swipe-game-container">
          {!isFinished ? (
            <div className="swipe-interactive-stage">
              {/* Left Scroll Button (Desktop) */}
              <button
                type="button"
                onClick={() => handleSwipe('left')}
                className="swipe-action-btn btn-scroll glass-fake desktop-btn"
                aria-label="Scroll past"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                <span className="btn-label">Scroll</span>
              </button>

              {/* Card Stack */}
              <div className="card-stack-wrap">
                {/* Third card edge */}
                <div className="peeking-card card-layer-3" />
                {/* Second card edge */}
                <div className="peeking-card card-layer-2" />

                {/* Top Interactive Card */}
                <div
                  ref={cardRef}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  className="swipe-main-card glass-fake"
                >
                  <img
                    src={currentPost?.image || ''}
                    alt={(currentPost as any)?.alt || currentPost?.id || 'Brand post'}
                    className="swipe-card-img"
                    draggable={false}
                  />

                  {(currentPost as any)?.hook ? (
                    <div className="swipe-card-hook">{(currentPost as any).hook}</div>
                  ) : null}
                  {(currentPost as any)?.result ? (
                    <div className="swipe-card-result">{(currentPost as any).result}</div>
                  ) : null}
                  {(currentPost as any)?.reason ? (
                    <div className="swipe-card-reason">{(currentPost as any).reason}</div>
                  ) : null}

                  {/* Stamps */}
                  <div ref={stopStampRef} className="stamp stamp-stop">
                    STOP
                  </div>
                  <div ref={scrollStampRef} className="stamp stamp-scroll">
                    SCROLL
                  </div>
                </div>
              </div>

              {/* Right Stop Button (Desktop) */}
              <button
                type="button"
                onClick={() => handleSwipe('right')}
                className="swipe-action-btn btn-stop btn-accent desktop-btn"
                aria-label="Stop and watch"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--bg)">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                <span className="btn-label" style={{ color: 'var(--bg)' }}>Stop</span>
              </button>

              {/* Mobile Buttons Row (Sitting under the stack) */}
              <div className="mobile-buttons-row">
                <button
                  type="button"
                  onClick={() => handleSwipe('left')}
                  className="swipe-action-btn btn-scroll glass-fake"
                  aria-label="Scroll past"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  <span className="btn-label">Scroll</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSwipe('right')}
                  className="swipe-action-btn btn-stop btn-accent"
                  aria-label="Stop and watch"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="var(--bg)">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  <span className="btn-label" style={{ color: 'var(--bg)' }}>Stop</span>
                </button>
              </div>
            </div>
          ) : (
            /* Result End State */
            <div className="swipe-result-box" aria-live="polite">
              <h3 className="swipe-result-text">
                {stopCount > 0 ? (
                  <>
                    You stopped for <span style={{ color: 'var(--accent)' }}>{stopCount}</span> of 5. Now imagine your customers.
                  </>
                ) : (
                  <>
                    You stopped for 0 of 5. Tough crowd. Message me anyway.
                  </>
                )}
              </h3>
              <div className="swipe-result-actions">
                <button
                  type="button"
                  onClick={resetGame}
                  className="btn-glass glass-fake result-btn"
                >
                  Play again
                </button>
                <button
                  type="button"
                  onClick={handleMessageMe}
                  className="btn-accent result-btn"
                >
                  Message me
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .swipe-section {
          padding: 24px 96px;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          outline: none;
        }
        .section-container {
          max-width: 1248px;
          margin: 0 auto;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          z-index: 1;
        }
        .swipe-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          margin-bottom: 1.5rem;
          text-align: center;
        }
        .section-title {
          font-family: var(--font-main);
          font-size: 44px;
          font-weight: 600;
          letter-spacing: -0.03em;
          color: var(--text);
          line-height: 1.1;
          margin: 0;
        }
        .swipe-dashes-row {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .swipe-dash {
          width: 24px;
          height: 3px;
          border-radius: 2px;
          transition: background 0.3s ease;
        }
        .dash-done {
          background: var(--text);
        }
        .dash-current {
          background: var(--accent);
        }
        .dash-upcoming {
          background: rgba(245, 239, 230, 0.25);
        }
        .swipe-game-container {
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 420px;
        }
        .swipe-interactive-stage {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 40px;
          position: relative;
        }
        .card-stack-wrap {
          position: relative;
          width: 320px;
          height: 400px;
          user-select: none;
          touch-action: none;
        }
        .peeking-card {
          position: absolute;
          inset: 0;
          border-radius: 22px;
          background: #181719;
          border: 1px solid rgba(255, 255, 255, 0.08);
          pointer-events: none;
        }
        .card-layer-3 {
          transform: scale(0.92) translateY(12px) rotate(4deg);
          opacity: 0.4;
          z-index: 1;
        }
        .card-layer-2 {
          transform: scale(0.96) translateY(6px) rotate(-3deg);
          opacity: 0.7;
          z-index: 2;
        }
        .swipe-main-card {
          position: absolute;
          inset: 0;
          border-radius: 22px;
          overflow: hidden;
          background: #000;
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
          cursor: grab;
          z-index: 3;
          transform: rotate(-2deg);
          will-change: transform;
        }
        .swipe-main-card:active {
          cursor: grabbing;
        }
        .swipe-card-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          background: #000;
          display: block;
          pointer-events: none;
        }
        .stamp {
          position: absolute;
          top: 28px;
          font-family: var(--font-main);
          font-size: 28px;
          font-weight: 800;
          letter-spacing: 0.05em;
          border-width: 3px;
          border-style: solid;
          border-radius: 8px;
          padding: 4px 14px;
          opacity: 0;
          pointer-events: none;
          will-change: opacity, transform;
        }
        .stamp-stop {
          right: 20px;
          color: var(--accent);
          border-color: var(--accent);
          transform: rotate(15deg);
        }
        .stamp-scroll {
          left: 20px;
          color: #fff;
          border-color: #fff;
          transform: rotate(-15deg);
        }
        .swipe-action-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          width: 72px;
          height: 72px;
          border-radius: 50%;
          cursor: pointer;
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease;
        }
        .swipe-action-btn:hover {
          transform: scale(1.08);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
        }
        .btn-scroll {
          background: rgba(30, 28, 26, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.16);
          color: var(--text);
        }
        .btn-label {
          font-family: var(--font-main);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .mobile-buttons-row {
          display: none;
        }
        .swipe-result-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
          text-align: center;
          max-width: 640px;
          animation: resultFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes resultFadeIn {
          from {
            opacity: 0;
            transform: scale(0.96);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .swipe-result-text {
          font-family: var(--font-serif);
          font-style: italic;
          font-size: 38px;
          color: var(--text);
          line-height: 1.25;
          margin: 0;
        }
        .swipe-result-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .result-btn {
          min-width: 140px;
          height: 48px;
          border-radius: 999px;
          font-family: var(--font-main);
          font-size: 15px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        @media (max-width: 768px) {
          .swipe-section {
            padding: 64px 24px;
          }
          .section-title {
            font-size: 32px;
          }
          .desktop-btn {
            display: none;
          }
          .swipe-interactive-stage {
            flex-direction: column;
            gap: 20px;
          }
          .card-stack-wrap {
            width: 260px;
            height: 325px;
          }
          .mobile-buttons-row {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 32px;
            width: 100%;
          }
          .swipe-action-btn {
            width: 64px;
            height: 64px;
          }
          .swipe-result-text {
            font-size: 28px;
          }
        }
      `}</style>
    </section>
  );
}
