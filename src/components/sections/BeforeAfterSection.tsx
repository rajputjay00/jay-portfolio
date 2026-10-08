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

  const pairs = beforeAfterData?.pairs || [];
  const [selectedPairIndex, setSelectedPairIndex] = useState(0);

  const currentPair = pairs[selectedPairIndex] || pairs[0];

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
            gsap.from('.ba-title-reveal', {
              y: '100%',
              duration: 0.7,
              ease: 'power3.out',
            });
            gsap.from('.ba-frame-wrap', {
              y: 24,
              opacity: 0,
              duration: 0.8,
              ease: 'power2.out',
            });

            // Divider hint animation: 50 -> 70 -> 50
            if (frameRef.current) {
              const obj = { val: 50 };
              gsap.to(obj, {
                val: 70,
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
                    val: 50,
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
        <div className="ba-grid">
          {/* Left Column: Title, Subtitle, Post switcher pills */}
          <div className="ba-left-col">
            <div className="title-mask-wrapper">
              <h2 className="section-title ba-title-reveal">Before / after</h2>
            </div>
            <p className="ba-subtitle">
              Same brief. One of them gets scrolled past.
            </p>

            <div className="ba-pills-row" role="tablist" aria-label="Select post pair">
              {pairs.map((pair, idx) => {
                const isSelected = idx === selectedPairIndex;
                return (
                  <button
                    key={pair.id || idx}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => setSelectedPairIndex(idx)}
                    className={`ba-pill-btn ${isSelected ? 'btn-accent' : 'glass-fake'}`}
                  >
                    {pair.label || `Post ${idx + 1}`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Comparison Frame */}
          <div className="ba-right-col">
            <div
              ref={frameRef}
              className="ba-frame-wrap"
              style={{
                ['--divider-pos' as any]: '50%',
              }}
            >
              {/* Before Layer (Underneath, Full) */}
              <div className="ba-layer ba-layer-before">
                <img
                  src={currentPair?.before || '/media/images/dummy-02.jpg'}
                  alt="Before post"
                  className="ba-image"
                />
                <span className="ba-tag tag-before glass-fake">Before</span>
              </div>

              {/* After Layer (On Top, Revealed from divider to right edge) */}
              <div className="ba-layer ba-layer-after">
                <img
                  src={currentPair?.after || '/media/images/dummy-01.jpg'}
                  alt="After post"
                  className="ba-image"
                />
                <span className="ba-tag tag-after glass-fake">After</span>
              </div>

              {/* Accent Divider Line & Handle */}
              <div className="ba-divider-line">
                <div className="ba-handle">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--bg)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 21 12 15 6" />
                    <polyline points="9 6 3 12 9 18" />
                  </svg>
                </div>
              </div>

              {/* Real Transparent HTML Range Input for complete keyboard/mouse/touch support */}
              <input
                ref={rangeInputRef}
                type="range"
                min="0"
                max="100"
                defaultValue="50"
                onChange={handleRangeChange}
                className="ba-range-slider"
                aria-label="Compare before and after"
              />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .ba-section {
          padding: 48px 96px;
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
        .ba-grid {
          display: grid;
          grid-template-columns: 1fr 1.15fr;
          gap: 56px;
          align-items: center;
        }
        .ba-left-col {
          display: flex;
          flex-direction: column;
          gap: 16px;
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
        .ba-subtitle {
          font-family: var(--font-serif);
          font-style: italic;
          font-size: 26px;
          color: var(--muted);
          line-height: 1.3;
          margin: 0 0 20px 0;
          letter-spacing: -0.01em;
        }
        .ba-pills-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .ba-pill-btn {
          height: 44px;
          padding: 0 24px;
          border-radius: 999px;
          font-family: var(--font-main);
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), background 0.2s ease, border-color 0.2s ease;
        }
        .ba-pill-btn:hover {
          transform: translateY(-2px);
        }
        .ba-right-col {
          display: flex;
          justify-content: center;
          width: 100%;
        }
        .ba-frame-wrap {
          position: relative;
          height: min(580px, 62vh);
          aspect-ratio: 4 / 5;
          border-radius: 22px;
          overflow: hidden;
          background: #121214;
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
          user-select: none;
        }
        .ba-layer {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        .ba-layer-after {
          clip-path: inset(0 0 0 var(--divider-pos, 50%));
          z-index: 2;
        }
        .ba-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .ba-tag {
          position: absolute;
          top: 16px;
          font-family: var(--font-main);
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 6px 14px;
          border-radius: 999px;
          z-index: 3;
        }
        .tag-before {
          left: 16px;
        }
        .tag-after {
          right: 16px;
          background: rgba(30, 28, 26, 0.85);
          color: var(--text);
        }
        .ba-divider-line {
          position: absolute;
          top: 0;
          bottom: 0;
          left: var(--divider-pos, 50%);
          width: 4px;
          background: var(--accent);
          transform: translateX(-50%);
          z-index: 4;
          pointer-events: none;
        }
        .ba-handle {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: var(--accent);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
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

        @media (max-width: 1024px) {
          .ba-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .ba-frame-wrap {
            height: 480px;
          }
        }

        @media (max-width: 768px) {
          .ba-section {
            padding: 64px 24px;
          }
          .section-title {
            font-size: 32px;
          }
          .ba-subtitle {
            font-size: 20px;
          }
          .ba-grid {
            display: flex;
            flex-direction: column;
            gap: 28px;
          }
          .ba-frame-wrap {
            width: 100%;
            max-width: 340px;
            height: auto;
            aspect-ratio: 4 / 5;
          }
          .ba-pills-row {
            justify-content: center;
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
}
