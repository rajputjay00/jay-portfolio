'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import rangeData from '@/../content/range-wall.json';
import reelsData from '@/../content/reels.json';
import resultsData from '@/../content/results.json';
import { perfStore } from '@/store/perfStore';
import { triggerHeart } from '@/utils/doubleTapHeart';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface ReelItem {
  id: string;
  slot: number;
  page: string;
  account: string;
  handle?: string;
  file: string;
  poster?: string;
  views: string;
  url: string;
  role?: string;
  hook?: string;
  status?: string;
}

interface VoiceItem {
  id: string;
  name: string;
  page: string;
  handle?: string;
  positioning?: string;
  reels: string[];
  proof?: string[];
  caseStudy?: string;
}

function PhoneMonolith({
  voice,
  voiceReels,
  followerText,
  isSectionInView,
  isGlassBlur,
  isDesktop,
}: {
  voice: VoiceItem;
  voiceReels: ReelItem[];
  followerText: string;
  isSectionInView: boolean;
  isGlassBlur: boolean;
  isDesktop: boolean;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedElapsedRef = useRef<number>(0);

  const activeReel = voiceReels[activeIndex] || voiceReels[0] || {
    id: 'unknown',
    views: '0',
    url: 'https://instagram.com',
    file: '',
    handle: voice.handle,
  };

  const handle = voice.handle || activeReel.handle || 'strictlyforcorporate';

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const isPlaying = isSectionInView && !isHovered && !prefersReducedMotion;

  // Jump to specific reel
  const jumpToReel = (newIdx: number) => {
    if (newIdx === activeIndex) return;
    const prevVideo = videoRefs.current[activeIndex];
    if (prevVideo) {
      prevVideo.pause();
      prevVideo.currentTime = 0;
    }
    pausedElapsedRef.current = 0;
    startTimeRef.current = performance.now();
    setProgress(0);
    setActiveIndex(newIdx);
  };

  // 8-second story timer & progress animation loop
  useEffect(() => {
    if (!isPlaying) {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      startTimeRef.current = null;
      videoRefs.current.forEach((v) => {
        if (v && !v.paused) v.pause();
      });
      return;
    }

    // Play active video, pause others
    videoRefs.current.forEach((v, idx) => {
      if (!v) return;
      if (idx === activeIndex) {
        v.play().catch(() => {});
      } else {
        v.pause();
        v.currentTime = 0;
      }
    });

    const loopDuration = 8000; // 8 seconds
    startTimeRef.current = performance.now() - pausedElapsedRef.current;

    const tick = (now: number) => {
      if (!startTimeRef.current) startTimeRef.current = now;
      const elapsed = now - startTimeRef.current;
      pausedElapsedRef.current = elapsed;

      if (elapsed >= loopDuration) {
        pausedElapsedRef.current = 0;
        startTimeRef.current = now;
        setProgress(0);
        setActiveIndex((prev) => (prev + 1) % voiceReels.length);
      } else {
        setProgress(Math.min(1, elapsed / loopDuration));
        animFrameRef.current = requestAnimationFrame(tick);
      }
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPlaying, activeIndex, voiceReels.length]);

  return (
    <div
      className="voice-column"
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
    >
      <div className={`phone-frame ${isGlassBlur && isDesktop ? 'glass-real' : 'glass-fake'}`}>
        <div className="phone-screen">
          {/* Top Stories Progress Segments */}
          <div className="story-progress-bar" role="tablist" aria-label="Reel story progress">
            {voiceReels.map((_, rIdx) => (
              <button
                key={rIdx}
                type="button"
                role="tab"
                aria-selected={activeIndex === rIdx}
                aria-label={`Jump to ${voice.name} reel ${rIdx + 1}`}
                className="story-segment-track"
                onClick={(e) => {
                  e.stopPropagation();
                  jumpToReel(rIdx);
                }}
              >
                <div
                  className="story-segment-fill"
                  style={{
                    transform:
                      rIdx < activeIndex
                        ? 'scaleX(1)'
                        : rIdx === activeIndex
                        ? `scaleX(${progress})`
                        : 'scaleX(0)',
                  }}
                />
              </button>
            ))}
          </div>

          {/* Top-left handle under progress segments */}
          <div className="phone-handle-pill">
            <span>@{handle.replace(/^@/, '')}</span>
          </div>

          {/* Video stack with 300ms opacity crossfade */}
          <div className="phone-video-layer">
            {voiceReels.map((reelItem, rIdx) => {
              const isCurrent = activeIndex === rIdx;
              return (
                <div
                  key={reelItem.id}
                  className={`reel-slide ${isCurrent ? 'active' : ''}`}
                  style={{
                    opacity: isCurrent ? 1 : 0,
                    pointerEvents: isCurrent ? 'auto' : 'none',
                    transition: 'opacity 300ms ease',
                  }}
                >
                  <video
                    ref={(el) => {
                      videoRefs.current[rIdx] = el;
                    }}
                    src={isSectionInView ? reelItem.file : undefined}
                    poster={reelItem.poster || undefined}
                    muted
                    playsInline
                    loop
                    preload={isSectionInView && isCurrent ? 'auto' : 'none'}
                    className="reel-video"
                  />
                </div>
              );
            })}
          </div>

          {/* Bottom-left Views Pill */}
          <div className="phone-views-pill">
            <span>{activeReel.views} views</span>
          </div>

          {/* Watch on Instagram Link & Hover / Focus Badge */}
          <a
            href={activeReel.url}
            target="_blank"
            rel="noopener noreferrer"
            className="watch-ig-overlay"
            aria-label={`Watch ${voice.name} reel (${activeReel.views} views) on Instagram`}
            onDoubleClick={(e) => {
              e.preventDefault();
              triggerHeart(e.currentTarget, e.clientX, e.clientY);
            }}
          >
            <div className="watch-ig-badge">
              <span>Watch on Instagram ↗</span>
            </div>
          </a>
        </div>
      </div>

      {/* Voice Name and Follower Count */}
      <div className="voice-footer">
        <div className="voice-label">{voice.name}</div>
        <div className="voice-proof">{followerText}</div>
      </div>

      <style jsx>{`
        .voice-column {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          will-change: transform;
        }
        .phone-frame {
          height: min(570px, 58vh);
          width: calc((min(570px, 58vh) - 16px) * (9 / 16) + 16px);
          border-radius: calc(min(570px, 58vh) * (36 / 570));
          padding: 8px;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
          transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.3s ease;
          position: relative;
        }
        @media (pointer: fine) {
          .phone-frame:hover {
            transform: translateY(-8px) scale(1.02);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
          }
        }
        .phone-screen {
          background: #000;
          border-radius: calc(min(570px, 58vh) * (28 / 570));
          height: 100%;
          width: auto;
          aspect-ratio: 9 / 16;
          overflow: hidden;
          position: relative;
          margin: 0 auto;
        }
        .story-progress-bar {
          position: absolute;
          top: 10px;
          left: 10px;
          right: 10px;
          height: 3px;
          display: flex;
          gap: 4px;
          z-index: 12;
        }
        .story-segment-track {
          flex: 1;
          height: 100%;
          background: rgba(255, 255, 255, 0.28);
          border-radius: 2px;
          overflow: hidden;
          border: none;
          padding: 0;
          margin: 0;
          cursor: pointer;
          outline: none;
          position: relative;
        }
        .story-segment-track:focus-visible {
          outline: 2px solid var(--accent, #ffd700);
          outline-offset: 1px;
        }
        .story-segment-fill {
          width: 100%;
          height: 100%;
          background: #ffffff;
          transform-origin: left center;
          will-change: transform;
        }
        .phone-handle-pill {
          position: absolute;
          top: 20px;
          left: 10px;
          z-index: 12;
          pointer-events: none;
        }
        .phone-handle-pill span {
          font-family: var(--font-main);
          font-size: 10.5px;
          font-weight: 600;
          letter-spacing: -0.01em;
          color: rgba(255, 255, 255, 0.95);
          background: rgba(14, 14, 16, 0.72);
          border: 1px solid rgba(255, 255, 255, 0.15);
          padding: 3px 8px;
          border-radius: 999px;
          backdrop-filter: blur(8px);
          display: inline-block;
        }
        .phone-video-layer {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background: #000;
        }
        .reel-slide {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          background: #000;
        }
        .reel-video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: center;
          display: block;
        }
        .phone-views-pill {
          position: absolute;
          bottom: 12px;
          left: 10px;
          z-index: 12;
          pointer-events: none;
        }
        .phone-views-pill span {
          font-family: var(--font-main);
          font-size: 11px;
          font-weight: 600;
          color: #ffffff;
          background: rgba(14, 14, 16, 0.72);
          border: 1px solid rgba(255, 255, 255, 0.15);
          padding: 4px 9px;
          border-radius: 999px;
          backdrop-filter: blur(8px);
          display: inline-block;
        }
        .watch-ig-overlay {
          position: absolute;
          inset: 0;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          outline: none;
          cursor: pointer;
        }
        .watch-ig-overlay:focus-visible {
          outline: 2px solid var(--accent, #ffd700);
          outline-offset: -2px;
        }
        .watch-ig-badge {
          opacity: 0;
          transition: opacity 0.2s ease;
          pointer-events: none;
        }
        .watch-ig-badge span {
          font-family: var(--font-main);
          font-size: 12px;
          font-weight: 600;
          color: #fff;
          background: rgba(18, 18, 20, 0.88);
          border: 1px solid rgba(255, 255, 255, 0.25);
          padding: 6px 12px;
          border-radius: 999px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(8px);
        }
        .watch-ig-overlay:hover .watch-ig-badge,
        .watch-ig-overlay:focus-visible .watch-ig-badge {
          opacity: 1;
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
          .phone-frame {
            height: 500px;
            width: calc((500px - 16px) * (9 / 16) + 16px);
            border-radius: 32px;
          }
          .phone-screen {
            border-radius: 26px;
          }
          .voice-label {
            font-size: 32px;
          }
        }

        @media (max-width: 768px) {
          .voice-column {
            flex: 0 0 calc((460px - 16px) * (9 / 16) + 16px);
            scroll-snap-align: start;
          }
          .phone-frame {
            height: 460px;
            width: calc((460px - 16px) * (9 / 16) + 16px);
            border-radius: 28px;
          }
          .phone-screen {
            border-radius: 22px;
          }
          .voice-label {
            font-size: 30px;
          }
        }
      `}</style>
    </div>
  );
}

export default function RangeWallSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [isGlassBlur, setIsGlassBlur] = useState(perfStore.getSettings().glassBlur);
  const [isDesktop, setIsDesktop] = useState(true);
  const [isInView, setIsInView] = useState(false);

  const voices: VoiceItem[] = rangeData.voices || [];
  const reelsList: ReelItem[] = reelsData.reels || [];

  const reelsMap = useMemo(() => {
    const map: Record<string, ReelItem> = {};
    reelsList.forEach((r) => {
      map[r.id] = r;
    });
    return map;
  }, [reelsList]);

  const followerMap = useMemo(() => {
    const map: Record<string, string> = {};
    resultsData.results?.forEach((r) => {
      if (r.label === 'followers') {
        const text = `${r.value} ${r.label}`;
        if (r.id) map[r.id] = text;
        if (r.handle) map[r.handle] = text;
        if (r.account) map[r.account.toLowerCase()] = text;
      }
    });
    return map;
  }, []);

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
        // Section in-view trigger to pause/play internal videos
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
            const reelIds = voice.reels || [];
            const voiceReels = reelIds
              .map((id: string) => reelsMap[id])
              .filter(Boolean);

            const followerText =
              followerMap[voice.id] ||
              followerMap[voice.handle || ''] ||
              followerMap[voice.name.toLowerCase()] ||
              '';

            return (
              <div
                key={voice.id || idx}
                ref={(el) => {
                  cardsRef.current[idx] = el;
                }}
                style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
              >
                <PhoneMonolith
                  voice={voice}
                  voiceReels={voiceReels}
                  followerText={followerText}
                  isSectionInView={isInView}
                  isGlassBlur={isGlassBlur}
                  isDesktop={isDesktop}
                />
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
        @media (max-width: 1024px) {
          .range-section {
            padding: 48px 48px;
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
        }
      `}</style>
    </section>
  );
}
