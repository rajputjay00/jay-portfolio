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
  const rangeInputRef = useRef<HTMLInputElement>(null);

  const heading = beforeAfterData?.heading || 'What I typed. What I meant.';
  const sub = beforeAfterData?.sub || 'One series. Three pages.';
  const pairs = beforeAfterData?.pairs || [];
  const [selectedPairIndex, setSelectedPairIndex] = useState(0);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  const currentPair = pairs[selectedPairIndex] || pairs[0];

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    setIsReducedMotion(prefersReducedMotion);

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

            // Divider hint animation: 0 -> 45 -> 0
            if (frameRef.current) {
              const obj = { val: 0 };
              gsap.to(obj, {
                val: 45,
                duration: 0.6,
                delay: 0.4,
                ease: 'power2.inOut',
                onUpdate: () => {
                  if (frameRef.current) {
                    frameRef.current.style.setProperty('--divider-pos', `${obj.val.toFixed(1)}%`);
                  }
                  if (rangeInputRef.current) {
                    rangeInputRef.current.value = obj.val.toString();
                  }
                },
                onComplete: () => {
                  gsap.to(obj, {
                    val: 0,
                    duration: 0.6,
                    ease: 'power2.inOut',
                    onUpdate: () => {
                      if (frameRef.current) {
                        frameRef.current.style.setProperty('--divider-pos', `${obj.val.toFixed(1)}%`);
                      }
                      if (rangeInputRef.current) {
                        rangeInputRef.current.value = obj.val.toString();
                      }
                    },
                  });
                },
              });
            }
          },
        });
      }, sectionRef);

      return () => ctx.revert();
    }
  }, []);

  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (frameRef.current) {
      frameRef.current.style.setProperty('--divider-pos', `${val}%`);
    }
  };

  const handleSelectPair = (idx: number) => {
    setSelectedPairIndex(idx);
    if (frameRef.current) {
      frameRef.current.style.setProperty('--divider-pos', '0%');
    }
    if (rangeInputRef.current) {
      rangeInputRef.current.value = '0';
    }
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
                <div
                  ref={frameRef}
                  className="ba-slider-panel"
                  style={{
                    ['--divider-pos' as any]: '0%',
                  }}
                >
                  {/* Layer A (Underneath, Full): What I typed */}
                  <div className="ba-slider-layer ba-layer-typed glass-fake">
                    <div className="ba-layer-content">
                      <span className="ba-text-tag tag-typed">What I typed</span>
                      <p className="ba-text-line line-typed">"{currentPair?.typed}"</p>
                    </div>
                  </div>

                  {/* Layer B (On Top, Revealed by clip-path): What I meant */}
                  <div className="ba-slider-layer ba-layer-meant">
                    <div className="ba-layer-content">
                      <span className="ba-text-tag tag-meant">What I meant</span>
                      <p className="ba-text-line line-meant">"{currentPair?.meant}"</p>
                    </div>
                  </div>

                  {/* Accent Divider Line & Drag Handle */}
                  <div className="ba-divider-line">
                    <div className="ba-handle" aria-hidden="true">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0B0A09" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 21 12 15 6" />
                        <polyline points="9 6 3 12 9 18" />
                      </svg>
                    </div>
                  </div>

                  {/* Range Slider for Accessible Mouse/Touch/Keyboard navigation */}
                  <input
                    ref={rangeInputRef}
                    type="range"
                    min="0"
                    max="100"
                    defaultValue="0"
                    onChange={handleRangeChange}
                    onInput={handleRangeChange}
                    className="ba-range-slider"
                    aria-label="Drag to reveal what I meant"
                  />
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
          padding: 32px 80px;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
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
          margin-bottom: 24px;
          gap: 6px;
        }
        .section-title {
          font-family: var(--font-main);
          font-size: 40px;
          font-weight: 600;
          letter-spacing: -0.03em;
          color: var(--text);
          line-height: 1.1;
          margin: 0;
        }
        .ba-subtitle {
          font-family: var(--font-serif);
          font-style: italic;
          font-size: 22px;
          color: var(--muted);
          line-height: 1.3;
          margin: 0 0 12px 0;
          letter-spacing: -0.01em;
        }
        .ba-pills-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .ba-pill-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          font-family: var(--font-main);
          font-size: 15px;
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
        .ba-slider-panel {
          position: relative;
          height: min(380px, 50vh);
          border-radius: 20px;
          overflow: hidden;
          background: #121214;
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
          user-select: none;
        }
        .ba-slider-layer {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          padding: 32px 36px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          justify-content: center;
          pointer-events: none;
        }
        .ba-layer-typed {
          background: rgba(18, 18, 20, 0.92);
          color: var(--text);
          z-index: 1;
        }
        .ba-layer-meant {
          background: #FF5A2B;
          color: #0B0A09;
          clip-path: inset(0 calc(100% - var(--divider-pos, 0%)) 0 0);
          z-index: 2;
        }
        .ba-layer-content {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-width: 100%;
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
          width: 3px;
          background: #fff;
          transform: translateX(-50%);
          z-index: 4;
          pointer-events: none;
        }
        .ba-handle {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #fff;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ba-range-slider {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: ew-resize;
          z-index: 10;
          margin: 0;
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
          height: min(380px, 50vh);
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
            padding: 48px 24px;
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
            height: 320px;
          }
        }
      `}</style>
    </section>
  );
}

