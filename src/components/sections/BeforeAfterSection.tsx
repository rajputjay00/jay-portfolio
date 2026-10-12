'use client';

import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import beforeAfterData from '@/../content/before-after.json';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function BeforeAfterSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const typedBlockRef = useRef<HTMLDivElement>(null);
  const meantBlockRef = useRef<HTMLDivElement>(null);
  const rangeInputRef = useRef<HTMLInputElement>(null);

  const currentP = useRef(0);
  const isDragging = useRef(false);
  const [hasDragged, setHasDragged] = useState(false);

  const heading = beforeAfterData?.heading || '';
  const sub = beforeAfterData?.sub || '';
  const hint = beforeAfterData?.hint || '';
  const pairs = beforeAfterData?.pairs || [];
  const [selectedPairIndex, setSelectedPairIndex] = useState(0);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  const currentPair = pairs[selectedPairIndex] || pairs[0];

  const updateHandle = (pVal: number) => {
    const p = Math.max(0, Math.min(1, pVal));
    currentP.current = p;

    // typed block opacity = clamp(1 - p / 0.4, 0, 1)
    // meant block opacity = clamp((p - 0.6) / 0.4, 0, 1)
    const typedOpacity = Math.max(0, Math.min(1, 1 - p / 0.4));
    const meantOpacity = Math.max(0, Math.min(1, (p - 0.6) / 0.4));

    if (typedBlockRef.current) {
      typedBlockRef.current.style.opacity = typedOpacity.toString();
    }
    if (meantBlockRef.current) {
      meantBlockRef.current.style.opacity = meantOpacity.toString();
    }

    if (frameRef.current) {
      frameRef.current.style.setProperty('--divider-pos', `${(p * 100).toFixed(2)}%`);
      frameRef.current.style.setProperty('--handle-pos', `clamp(24px, ${(p * 100).toFixed(2)}%, calc(100% - 24px))`);
    }

    if (rangeInputRef.current) {
      rangeInputRef.current.value = (p * 100).toString();
      rangeInputRef.current.setAttribute('aria-valuenow', p.toFixed(2));
    }
  };

  const easeTo = (targetP: number) => {
    const startP = currentP.current;
    const startTime = performance.now();
    const duration = 250; // 250ms ease on release

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Power2 out easing
      const eased = 1 - Math.pow(1 - progress, 2);
      const p = startP + (targetP - startP) * eased;
      updateHandle(p);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        updateHandle(targetP);
      }
    };
    requestAnimationFrame(animate);
  };

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    setIsReducedMotion(prefersReducedMotion);

    // Initial handle state: p = 0 with typed fully visible
    updateHandle(0);

    if (!prefersReducedMotion && sectionRef.current) {
      const ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top 80%',
          once: true,
          onEnter: () => {
            gsap.from('.ba-title-reveal', {
              y: '100%',
              duration: 0.7,
              ease: 'power3.out',
            });
            gsap.from('.ba-content-wrap', {
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

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDragging.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setHasDragged(true);

    if (frameRef.current) {
      const rect = frameRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const p = Math.max(0, Math.min(1, x / rect.width));
      updateHandle(p);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current || !frameRef.current) return;
    const rect = frameRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const p = Math.max(0, Math.min(1, x / rect.width));
    updateHandle(p);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}

    const snapTarget = currentP.current < 0.5 ? 0 : 1;
    easeTo(snapTarget);
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}

    const snapTarget = currentP.current < 0.5 ? 0 : 1;
    easeTo(snapTarget);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      setHasDragged(true);
      const newP = Math.max(0, parseFloat((currentP.current - 0.1).toFixed(2)));
      updateHandle(newP);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      setHasDragged(true);
      const newP = Math.min(1, parseFloat((currentP.current + 0.1).toFixed(2)));
      updateHandle(newP);
    } else if (e.key === 'Home') {
      e.preventDefault();
      setHasDragged(true);
      easeTo(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setHasDragged(true);
      easeTo(1);
    }
  };

  const handleSelectPair = (idx: number) => {
    setSelectedPairIndex(idx);
    updateHandle(0);
  };

  return (
    <section
      id="before-after"
      ref={sectionRef}
      className="ba-section"
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
        className="ambient-glow drift-1"
        style={{
          top: '20%',
          right: '-5%',
          width: '550px',
          height: '550px',
        }}
      />
      <div
        className="ambient-glow drift-2"
        style={{
          bottom: '15%',
          left: '-10%',
          width: '500px',
          height: '500px',
        }}
      />

      <div className="section-container">
        {/* Section Header */}
        <div className="ba-header">
          <div className="title-mask-wrapper">
            <h2 className="section-title ba-title-reveal">{heading}</h2>
          </div>
          <p className="ba-subtitle">{sub}</p>

          {/* Pair Switcher: buttons 1 to 6 */}
          <div className="ba-pills-row" role="tablist" aria-label="Select post pair">
            {pairs.map((pair: any, idx: number) => {
              const isSelected = idx === selectedPairIndex;
              return (
                <button
                  key={pair.id || idx}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => handleSelectPair(idx)}
                  className={`ba-pill-btn ${isSelected ? 'btn-accent' : 'glass-fake'}`}
                  aria-label={`Pair ${idx + 1}: ${pair.page}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Wrap: Left Slider Panel + Right Post Image */}
        <div className="ba-content-wrap">
          <div className="ba-grid">
            {/* Left Column: Text-Only Comparison Slider Panel */}
            <div className="ba-left-col">
              {isReducedMotion ? (
                /* Reduced Motion Fallback: stacked text blocks */
                <div className="ba-reduced-stack">
                  <div className="ba-reduced-block glass-fake">
                    <span className="ba-text-tag tag-typed">What I typed</span>
                    <p className="ba-text-line line-typed">"{currentPair?.typed}"</p>
                  </div>
                  <div className="ba-reduced-block block-meant">
                    <span className="ba-text-tag tag-meant">What I meant</span>
                    <p className="ba-text-line line-meant">"{currentPair?.meant}"</p>
                  </div>
                </div>
              ) : (
                <div className="ba-slider-container">
                  <div
                    ref={frameRef}
                    role="slider"
                    tabIndex={0}
                    aria-label="What I typed vs what I meant comparison"
                    aria-valuenow={0}
                    aria-valuemin={0}
                    aria-valuemax={1}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerCancel}
                    onKeyDown={handleKeyDown}
                    className="ba-slider-panel"
                    style={{
                      ['--divider-pos' as any]: '0%',
                      ['--handle-pos' as any]: '24px',
                    }}
                  >
                    {/* Layer A (Underneath, Full): Dark panel background */}
                    <div className="ba-slider-layer ba-layer-typed" />

                    {/* Layer B (On Top, Revealed by clip-path): Accent color wipe */}
                    <div className="ba-slider-layer ba-layer-meant" />

                    {/* Text Block: What I typed (Driven by opacity directly) */}
                    <div
                      ref={typedBlockRef}
                      className="ba-text-block ba-block-typed"
                      style={{ opacity: 1 }}
                    >
                      <span className="ba-text-tag tag-typed">What I typed</span>
                      <p className="ba-text-line line-typed">"{currentPair?.typed}"</p>
                    </div>

                    {/* Text Block: What I meant (Driven by opacity directly) */}
                    <div
                      ref={meantBlockRef}
                      className="ba-text-block ba-block-meant"
                      style={{ opacity: 0 }}
                    >
                      <span className="ba-text-tag tag-meant">What I meant</span>
                      <p className="ba-text-line line-meant">"{currentPair?.meant}"</p>
                    </div>

                    {/* Accent Divider Line */}
                    <div className="ba-divider-line" />

                    {/* Drag Handle: Kept fully inside panel at both ends */}
                    <div className="ba-handle" aria-hidden="true">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0B0A09" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 21 12 15 6" />
                        <polyline points="9 6 3 12 9 18" />
                      </svg>
                    </div>
                  </div>

                  {/* Hint under the panel from content */}
                  <div className="ba-hint-row">
                    <span className={`ba-hint-text ${hasDragged ? 'hint-hidden' : ''}`}>
                      {hint}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Real Post Image + Page Name */}
            <div className="ba-right-col">
              <div className="ba-post-wrap">
                <div className="ba-post-frame">
                  {currentPair?.image ? (
                    <img
                      src={currentPair.image}
                      alt={currentPair.typed || 'Post image'}
                      className="ba-post-img"
                    />
                  ) : null}
                </div>
                <div className="ba-post-page">{currentPair?.page}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .ba-section {
          padding: 104px 40px 32px;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
        }
        .section-container {
          max-width: 1248px;
          margin: 0 auto;
          width: 100%;
          position: relative;
          z-index: 1;
        }
        .ba-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-bottom: 16px;
          gap: 4px;
        }
        .section-title {
          font-family: var(--font-main);
          font-size: 36px;
          font-weight: 600;
          letter-spacing: -0.03em;
          color: var(--text);
          line-height: 1.1;
          margin: 0;
        }
        .ba-subtitle {
          font-family: var(--font-serif);
          font-style: italic;
          font-size: 20px;
          color: var(--muted);
          line-height: 1.2;
          margin: 0 0 8px 0;
          letter-spacing: -0.01em;
        }
        .ba-pills-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .ba-pill-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          font-family: var(--font-main);
          font-size: 14px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), background 0.2s ease, border-color 0.2s ease;
        }
        .ba-pill-btn:hover {
          transform: translateY(-2px);
        }
        .ba-content-wrap {
          width: 100%;
        }
        .ba-grid {
          display: grid;
          grid-template-columns: 1.25fr 0.85fr;
          gap: 40px;
          align-items: center;
          width: 100%;
        }
        .ba-left-col {
          width: 100%;
          min-width: 0;
        }
        .ba-slider-container {
          width: 100%;
          display: flex;
          flex-direction: column;
        }
        .ba-slider-panel {
          position: relative;
          height: min(340px, 44vh);
          border-radius: 20px;
          overflow: hidden;
          background: #121214;
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
          user-select: none;
          cursor: ew-resize;
          touch-action: none;
          outline: none;
        }
        .ba-slider-panel:focus-visible {
          box-shadow: 0 0 0 2px var(--accent), 0 20px 50px rgba(0, 0, 0, 0.6);
        }
        .ba-slider-layer {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        .ba-layer-typed {
          background: #121214;
          z-index: 1;
        }
        .ba-layer-meant {
          background: #FF5A2B;
          clip-path: inset(0 calc(100% - var(--divider-pos, 0%)) 0 0);
          z-index: 2;
        }
        .ba-text-block {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          padding: 32px 36px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-start;
          text-align: left;
          pointer-events: none;
          gap: 12px;
        }
        .ba-block-typed {
          z-index: 3;
          color: var(--text);
        }
        .ba-block-meant {
          z-index: 4;
          color: #0B0A09;
        }
        .ba-text-tag {
          font-family: var(--font-main);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        .tag-typed {
          color: var(--accent);
        }
        .tag-meant {
          color: rgba(11, 10, 9, 0.7);
        }
        .ba-text-line {
          font-family: var(--font-serif);
          font-style: italic;
          font-size: clamp(20px, 2.2vw, 30px);
          line-height: 1.35;
          margin: 0;
          word-break: break-word;
          overflow-wrap: break-word;
          white-space: normal;
        }
        .line-typed {
          color: var(--text);
        }
        .line-meant {
          color: #0B0A09;
        }
        .ba-reduced-stack {
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 100%;
        }
        .ba-reduced-block {
          padding: 24px 28px;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .block-meant {
          background: #FF5A2B;
          color: #0B0A09;
        }
        .ba-divider-line {
          position: absolute;
          top: 0;
          bottom: 0;
          left: var(--divider-pos, 0%);
          width: 2px;
          background: rgba(255, 255, 255, 0.85);
          transform: translateX(-50%);
          z-index: 5;
          pointer-events: none;
        }
        .ba-handle {
          position: absolute;
          top: 50%;
          left: var(--handle-pos, 24px);
          transform: translate(-50%, -50%);
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #fff;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 6;
          pointer-events: none;
        }
        .ba-hint-row {
          display: flex;
          justify-content: center;
          margin-top: 10px;
          width: 100%;
        }
        .ba-hint-text {
          font-family: var(--font-main);
          font-size: 13px;
          color: var(--muted);
          opacity: 0.8;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }
        .ba-hint-text.hint-hidden {
          opacity: 0;
        }
        .ba-right-col {
          display: flex;
          justify-content: center;
          width: 100%;
        }
        .ba-post-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          width: 100%;
        }
        .ba-post-frame {
          height: min(340px, 44vh);
          aspect-ratio: 4 / 5;
          border-radius: 20px;
          overflow: hidden;
          background: #000;
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ba-post-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          background: #000;
          display: block;
        }
        .ba-post-page {
          font-family: var(--font-main);
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--muted);
          text-align: center;
        }

        @media (max-width: 900px) {
          .ba-section {
            padding: 96px 24px 32px;
          }
          .section-title {
            font-size: 30px;
          }
          .ba-subtitle {
            font-size: 18px;
          }
          .ba-grid {
            grid-template-columns: 1fr;
            gap: 28px;
          }
          .ba-slider-panel {
            height: 240px;
          }
          .ba-post-frame {
            height: 300px;
          }
        }
      `}</style>
    </section>
  );
}

