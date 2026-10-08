'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import rangeData from '@/../content/range-wall.json';
import { perfStore } from '@/store/perfStore';
import { triggerHeart } from '@/utils/doubleTapHeart';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

function cleanText(text: string): string {
  return text.replace(/\[DUMMY\]\s*/g, '').trim();
}

export default function RangeWallSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [isGlassBlur, setIsGlassBlur] = useState(perfStore.getSettings().glassBlur);
  const [isDesktop, setIsDesktop] = useState(true);
  const [isInView, setIsInView] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const voices = rangeData.voices || [];

  useEffect(() => {
    const unsub = perfStore.subscribe((s) => setIsGlassBlur(s.glassBlur));
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion && sectionRef.current) {
      const ctx = gsap.context(() => {
        // Section in-view trigger to pause/play internal auto-scroll
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          onToggle: (self) => {
            setIsInView(self.isActive);
          },
        });

        // Title mask reveal
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top 75%',
          once: true,
          onEnter: () => {
            gsap.from('.range-title-reveal', {
              y: '100%',
              duration: 0.7,
              ease: 'power3.out',
            });
            gsap.from(cardsRef.current, {
              y: 24,
              opacity: 0,
              duration: 0.8,
              stagger: 0.1,
              ease: 'power2.out',
            });
          },
        });

        // Phone drift parallax scrub: middle phone moves ~40px more than outer two
        if (window.innerWidth >= 768) {
          ScrollTrigger.create({
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
            onUpdate: (self) => {
              const p = self.progress - 0.5; // -0.5 to +0.5
              const outerDrift = p * -30;
              const middleDrift = p * -70; // 40px more drift

              if (cardsRef.current[0]) gsap.set(cardsRef.current[0], { y: outerDrift });
              if (cardsRef.current[1]) gsap.set(cardsRef.current[1], { y: middleDrift });
              if (cardsRef.current[2]) gsap.set(cardsRef.current[2], { y: outerDrift });
            },
          });
        }

        // Ambient glow scroll scrub
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
          onUpdate: (self) => {
            const yOffset = (self.progress - 0.5) * 60;
            gsap.set('.range-glow', { y: yOffset });
          },
        });
      }, sectionRef);

      return () => {
        unsub();
        window.removeEventListener('resize', checkDesktop);
        ctx.revert();
      };
    }

    return () => {
      unsub();
      window.removeEventListener('resize', checkDesktop);
    };
  }, []);

  return (
    <section
      id="range"
      ref={sectionRef}
      className="range-section"
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
      {/* Soft Ambient Glows in Background */}
      <div
        className="ambient-glow drift-2 range-glow"
        style={{
          top: '20%',
          right: '-5%',
          width: '600px',
          height: '600px',
        }}
      />
      <div
        className="ambient-glow drift-1 range-glow"
        style={{
          bottom: '15%',
          left: '-10%',
          width: '500px',
          height: '500px',
        }}
      />

      <div className="section-container">
        <div className="title-mask-wrapper" style={{ marginBottom: '2.5rem' }}>
          <h2 className="section-title range-title-reveal">Range wall</h2>
        </div>

        <div className="range-grid">
          {voices.map((voice, idx) => {
            const samples = voice.samples || ['/media/images/dummy-01.jpg'];
            const captions = (voice.captionSamples || []).map((c) => cleanText(c));
            const proofText = voice.proof?.join(' · ') || '';

            // Feed items stacked: pair each sample with a caption
            const feedItems = samples.map((img, i) => ({
              img,
              caption: captions[i % captions.length] || '',
            }));

            // Duplicate feed for seamless continuous 14s loop
            const duplicatedFeed = [...feedItems, ...feedItems];
            const isPaused = !isInView || hoveredIndex === idx;

            return (
              <div
                key={voice.id || idx}
                ref={(el) => {
                  cardsRef.current[idx] = el;
                }}
                className="voice-column"
                onPointerEnter={() => setHoveredIndex(idx)}
                onPointerLeave={() => setHoveredIndex(null)}
              >
                {/* 1. Phone Monolith Frame */}
                <div className={`phone-frame ${isGlassBlur && isDesktop ? 'glass-real' : 'glass-fake'}`}>
                  <div className="phone-screen">
                    {/* Top Notch / Island Indicator */}
                    <div className="phone-notch-bar">
                      <div className="phone-notch" />
                    </div>

                    {/* Auto-scrolling seamless Feed Track */}
                    <div className="phone-feed-viewport">
                      <div
                        className="phone-feed-track"
                        style={{
                          animationPlayState: isPaused ? 'paused' : 'running',
                        }}
                      >
                        {duplicatedFeed.map((item, itemIdx) => (
                          <div key={itemIdx} className="phone-feed-card">
                            <div
                              className="sample-media-wrap"
                              onDoubleClick={(e) => triggerHeart(e.currentTarget, e.clientX, e.clientY)}
                              onTouchEnd={(e) => {
                                const target = e.currentTarget;
                                const touch = e.changedTouches[0];
                                if (!touch) return;
                                const now = Date.now();
                                const lastTime = (target as any)._lastTap || 0;
                                if (now - lastTime < 350) {
                                  triggerHeart(target, touch.clientX, touch.clientY);
                                  (target as any)._lastTap = 0;
                                } else {
                                  (target as any)._lastTap = now;
                                }
                              }}
                            >
                              {item.img ? (
                                <img
                                  src={item.img}
                                  alt={`${voice.name} sample ${itemIdx + 1}`}
                                  loading="lazy"
                                  decoding="async"
                                  className="sample-img"
                                />
                              ) : (
                                <div className="empty-sample-placeholder">
                                  <span className="placeholder-text">Sample Post</span>
                                </div>
                              )}
                            </div>

                            <div className="sample-caption-wrap">
                              <p className="sample-caption">
                                {item.caption || <span className="muted-caption">No caption available</span>}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Voice Label & Proof Beneath Phone */}
                <div className="voice-footer">
                  <div className="voice-label">{voice.name}</div>
                  <div className="voice-proof">{proofText}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .range-section {
          padding: 60px 96px;
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
        .section-title {
          font-family: var(--font-main);
          font-size: 44px;
          font-weight: 600;
          letter-spacing: -0.03em;
          color: var(--text);
          line-height: 1.1;
        }
        .range-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
          align-items: start;
        }
        .voice-column {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          will-change: transform;
        }
        .phone-frame {
          height: min(570px, 58vh);
          width: calc(min(570px, 58vh) * (280 / 570));
          border-radius: calc(min(570px, 58vh) * (40 / 570));
          padding: calc(min(570px, 58vh) * (10 / 570));
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          margin-bottom: 12px;
          transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.3s ease;
        }
        @media (pointer: fine) {
          .phone-frame:hover {
            transform: translateY(-8px) scale(1.02);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
          }
        }
        .phone-screen {
          background: #121214;
          border-radius: calc(min(570px, 58vh) * (30 / 570));
          width: 100%;
          height: 100%;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          position: relative;
        }
        .phone-notch-bar {
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          z-index: 5;
          background: #121214;
        }
        .phone-notch {
          width: 54px;
          height: 4px;
          border-radius: 2px;
          background: rgba(255, 255, 255, 0.12);
        }
        .phone-feed-viewport {
          flex: 1;
          width: 100%;
          overflow: hidden;
          position: relative;
        }
        .phone-feed-track {
          display: flex;
          flex-direction: column;
          width: 100%;
          animation: feedScrollLoop 14s linear infinite;
        }
        @keyframes feedScrollLoop {
          0% {
            transform: translateY(0%);
          }
          100% {
            transform: translateY(-50%);
          }
        }
        .phone-feed-card {
          width: 100%;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          margin-bottom: 10px;
        }
        .sample-media-wrap {
          width: 100%;
          aspect-ratio: 4 / 5;
          position: relative;
          overflow: hidden;
          background: #1a1a1e;
          flex-shrink: 0;
          cursor: pointer;
        }
        .sample-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .empty-sample-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #1a1a1e;
        }
        .placeholder-text {
          font-family: var(--font-main);
          font-size: 13px;
          color: var(--muted);
        }
        .sample-caption-wrap {
          padding: 12px 14px 16px;
          background: #121214;
        }
        .sample-caption {
          font-family: var(--font-main);
          font-size: 13px;
          line-height: 1.4;
          color: var(--text);
          text-align: left;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .muted-caption {
          color: var(--muted);
          font-style: italic;
        }
        .voice-footer {
          text-align: center;
          width: 100%;
        }
        .voice-label {
          font-family: var(--font-serif);
          font-style: italic;
          font-size: 36px;
          color: var(--text);
          line-height: 1.1;
          margin-bottom: 6px;
        }
        .voice-proof {
          font-family: var(--font-main);
          font-size: 14px;
          color: var(--muted);
          line-height: 1.35;
          min-height: 20px;
        }

        @media (max-width: 1024px) {
          .range-section {
            padding: 48px 48px;
          }
          .phone-frame {
            width: 250px;
            height: 520px;
            border-radius: 36px;
            padding: 8px;
          }
          .phone-screen {
            border-radius: 28px;
          }
          .voice-label {
            font-size: 32px;
          }
        }

        @media (max-width: 768px) {
          .range-section {
            padding: 64px 24px;
          }
          .section-title {
            font-size: 32px;
          }
          .range-grid {
            display: flex;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            gap: 20px;
            padding-bottom: 16px;
            margin: 0 -24px;
            padding-left: 24px;
            padding-right: 24px;
            -webkit-overflow-scrolling: touch;
          }
          .voice-column {
            flex: 0 0 240px;
            scroll-snap-align: start;
          }
          .voice-label {
            font-size: 30px;
          }
          .phone-frame {
            width: 240px;
            height: 500px;
            border-radius: 32px;
            padding: 8px;
          }
          .phone-screen {
            border-radius: 24px;
          }
          .sample-caption {
            font-size: 13px;
          }
        }
      `}</style>
    </section>
  );
}
