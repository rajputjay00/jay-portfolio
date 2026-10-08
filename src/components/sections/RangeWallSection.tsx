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
        // Title mask reveal & Phone entrance rise
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
        <div className="title-mask-wrapper" style={{ marginBottom: '2rem' }}>
          <h2 className="section-title range-title-reveal">Range wall</h2>
        </div>

        <div className="range-grid">
          {voices.map((voice, idx) => {
            const sampleImg = voice.samples?.[0] || '';
            const caption = cleanText(voice.captionSamples?.[0] || '');
            const proofText = voice.proof?.join(' · ') || '';

            return (
              <div
                key={voice.id || idx}
                ref={(el) => {
                  cardsRef.current[idx] = el;
                }}
                className="voice-column"
              >
                {/* 1. Phone Monolith Frame First with Glass Real */}
                <div className={`phone-frame ${isGlassBlur && isDesktop ? 'glass-real' : 'glass-fake'}`}>
                  <div className="phone-screen">
                    {/* Top Notch / Island Indicator */}
                    <div className="phone-notch-bar">
                      <div className="phone-notch" />
                    </div>

                    {/* 4:5 Sample Image */}
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
                      {sampleImg ? (
                        <img
                          src={sampleImg}
                          alt={`${voice.name} sample`}
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

                    {/* Caption Beneath (Max 3 lines, 14px) */}
                    <div className="sample-caption-wrap">
                      <p className="sample-caption">
                        {caption || <span className="muted-caption">No caption available</span>}
                      </p>
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
          padding: 48px 96px;
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
        }
        .phone-frame {
          width: 280px;
          height: 570px;
          border-radius: 40px;
          padding: 10px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          margin-bottom: 16px;
          transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.3s ease;
        }
        @media (pointer: fine) {
          .phone-frame:hover {
            transform: translateY(-10px) rotate(3deg);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
          }
        }
        .phone-screen {
          background: #121214;
          border-radius: 30px;
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
        }
        .phone-notch {
          width: 54px;
          height: 4px;
          border-radius: 2px;
          background: rgba(255, 255, 255, 0.12);
        }
        .sample-media-wrap {
          width: 100%;
          aspect-ratio: 4 / 5;
          position: relative;
          overflow: hidden;
          background: #1a1a1e;
          flex-shrink: 0;
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
          padding: 14px;
          flex: 1;
          display: flex;
          align-items: flex-start;
          background: #121214;
        }
        .sample-caption {
          font-family: var(--font-main);
          font-size: 14px;
          line-height: 1.45;
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
            flex: 0 0 230px;
            scroll-snap-align: start;
          }
          .voice-label {
            font-size: 30px;
          }
          .phone-frame {
            width: 230px;
            height: 480px;
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
