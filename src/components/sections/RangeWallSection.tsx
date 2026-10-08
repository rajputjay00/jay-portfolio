'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import rangeData from '@/../content/range-wall.json';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

function cleanText(text: string): string {
  return text.replace(/\[DUMMY\]\s*/g, '').trim();
}

export default function RangeWallSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  const voices = rangeData.voices || [];

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 75%',
        once: true,
        onEnter: () => {
          gsap.from(cardsRef.current, {
            y: 24,
            opacity: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power2.out',
          });
        },
      });
    }, sectionRef);

    return () => ctx.revert();
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
      }}
    >
      <div className="section-container">
        <h2 className="section-title">Range wall</h2>

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
                {/* Voice Header */}
                <div className="voice-header">
                  <div className="voice-label">{voice.name}</div>
                  <div className="voice-proof">{proofText}</div>
                </div>

                {/* Phone Monolith Frame */}
                <div className="phone-frame glass-fake">
                  <div className="phone-screen">
                    {/* Top Notch / Island Indicator */}
                    <div className="phone-notch-bar">
                      <div className="phone-notch" />
                    </div>

                    {/* 4:5 Sample Image */}
                    <div className="sample-media-wrap">
                      {sampleImg ? (
                        <img
                          src={sampleImg}
                          alt={`${voice.name} sample`}
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
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .range-section {
          padding: 110px 96px;
        }
        .section-container {
          max-width: 1248px;
          margin: 0 auto;
          width: 100%;
        }
        .section-title {
          font-family: var(--font-main);
          font-size: 44px;
          font-weight: 600;
          letter-spacing: -0.03em;
          color: var(--text);
          margin-bottom: 3.5rem;
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
        .voice-header {
          text-align: center;
          margin-bottom: 28px;
          width: 100%;
        }
        .voice-label {
          font-family: var(--font-serif);
          font-style: italic;
          font-size: 36px;
          color: var(--text);
          line-height: 1.2;
          margin-bottom: 6px;
        }
        .voice-proof {
          font-family: var(--font-main);
          font-size: 14px;
          color: var(--muted);
          line-height: 1.4;
          min-height: 20px;
        }
        .phone-frame {
          width: 280px;
          height: 570px;
          border-radius: 40px;
          padding: 10px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
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
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .phone-notch {
          width: 60px;
          height: 5px;
          border-radius: 3px;
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

        @media (max-width: 1024px) {
          .range-section {
            padding: 80px 48px;
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
            margin-bottom: 2.5rem;
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
