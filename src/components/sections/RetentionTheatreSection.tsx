'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import retentionData from '@/../content/retention.json';
import resultsData from '@/../content/results.json';
import reelsData from '@/../content/reels.json';
import { perfStore } from '@/store/perfStore';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

function parseStatValue(raw: string) {
  const hasComma = raw.includes(',');
  const prefixMatch = raw.match(/^[^0-9.]+/);
  const prefix = prefixMatch ? prefixMatch[0] : '';
  const suffixMatch = raw.match(/[^0-9.,]+$/);
  const suffix = suffixMatch ? suffixMatch[0] : '';

  const numClean = raw.replace(/,/g, '').replace(/[^0-9.]/g, '');
  const target = parseFloat(numClean) || 0;
  const hasDecimal = numClean.includes('.');
  const decimalPlaces = hasDecimal ? (numClean.split('.')[1]?.length || 1) : 0;

  const format = (v: number) => {
    let formatted: string;
    if (decimalPlaces > 0) {
      formatted = v >= target - 0.05 ? target.toFixed(decimalPlaces) : v.toFixed(decimalPlaces);
    } else {
      formatted = Math.round(v).toString();
    }
    if (hasComma) {
      const parts = formatted.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      formatted = parts.join('.');
    }
    return `${prefix}${formatted}${suffix}`;
  };

  return { target, format };
}

export default function RetentionTheatreSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroCardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const heroValRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [isGlassBlur, setIsGlassBlur] = useState(perfStore.getSettings().glassBlur);
  const [isDesktop, setIsDesktop] = useState(true);

  const hasVideo = Boolean(retentionData.file && retentionData.file.trim().length > 0);
  const reelId = retentionData.reelId || 'sfc-1';
  const sfcReel = reelsData.reels?.find((r) => r.id === reelId);
  const reelUrl = sfcReel?.url || 'https://www.instagram.com/reel/DHVgzLQzNQR/?utm_source=ig_web_copy_link&psln=MzRlODBiNWFlZA==';
  const reelPoster = sfcReel?.poster || '';

  const heading = retentionData.heading || '';
  const sfcFollowers = resultsData.results?.find((r) => r.id === 'sfc')?.value || '';
  const sub = retentionData.subTemplate && sfcFollowers
    ? retentionData.subTemplate.replace('{followers}', sfcFollowers)
    : (retentionData.sub || '');

  const heroStats = retentionData.heroStats || [];
  const supportingStats = retentionData.supportingStats || [];
  const footnote = retentionData.footnote || '';

  useEffect(() => {
    const unsub = perfStore.subscribe((s) => setIsGlassBlur(s.glassBlur));
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting;
        setIsInView(visible);
        if (!visible && videoRef.current && !videoRef.current.paused) {
          videoRef.current.pause();
          setIsPlaying(false);
        } else if (visible && videoRef.current && !prefersReducedMotion) {
          videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
        }
      },
      { threshold: 0.5 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    if (prefersReducedMotion) {
      heroValRefs.current.forEach((el, idx) => {
        if (el && heroStats[idx]) {
          el.innerText = heroStats[idx].value;
        }
      });
      return () => {
        unsub();
        observer.disconnect();
        window.removeEventListener('resize', checkDesktop);
      };
    }

    let ctx: gsap.Context | null = null;
    if (sectionRef.current) {
      ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top 85%',
          once: true,
          onEnter: () => {
            gsap.from('.retention-title-reveal', {
              y: '100%',
              duration: 0.7,
              ease: 'power3.out',
            });

            gsap.from('.retention-sub-reveal', {
              opacity: 0,
              y: 8,
              duration: 0.6,
              delay: 0.1,
              ease: 'power2.out',
            });

            const cards = heroCardRefs.current.filter(Boolean);
            if (cards.length > 0) {
              gsap.fromTo(
                cards,
                { opacity: 0, y: 16 },
                {
                  opacity: 1,
                  y: 0,
                  duration: 0.6,
                  stagger: 0.12,
                  ease: 'power2.out',
                }
              );
            }

            heroStats.forEach((stat, idx) => {
              const el = heroValRefs.current[idx];
              if (!el) return;
              const { target, format } = parseStatValue(stat.value);
              const counter = { val: 0 };
              el.innerText = format(0);
              gsap.to(counter, {
                val: target,
                duration: 1.2,
                delay: idx * 0.12,
                ease: 'power2.out',
                onUpdate: () => {
                  if (el) el.innerText = format(counter.val);
                },
                onComplete: () => {
                  if (el) el.innerText = stat.value;
                },
              });
            });

            gsap.fromTo(
              '.supporting-stat-card',
              { opacity: 0, y: 12 },
              {
                opacity: 1,
                y: 0,
                duration: 0.5,
                stagger: 0.04,
                delay: 0.36,
                ease: 'power2.out',
              }
            );

            gsap.fromTo(
              '.retention-footnote',
              { opacity: 0 },
              {
                opacity: 1,
                duration: 0.6,
                delay: 0.6,
                ease: 'power2.out',
              }
            );
          },
        });

        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
          onUpdate: (self) => {
            const yOffset = (self.progress - 0.5) * 60;
            gsap.set('.retention-glow', { y: yOffset });
          },
        });
      }, sectionRef);
    }

    return () => {
      unsub();
      observer.disconnect();
      window.removeEventListener('resize', checkDesktop);
      ctx?.revert();
    };
  }, [heroStats]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      if (videoRef.current.currentTime >= 8) {
        videoRef.current.currentTime = 0;
      }
    }
  };

  const toggleVideoPlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <section
      id="retention"
      ref={sectionRef}
      className="retention-section"
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
      <div
        className="ambient-glow drift-1 retention-glow"
        style={{
          top: '15%',
          left: '20%',
          width: '600px',
          height: '600px',
        }}
      />

      <div className="section-container">
        <div className="section-header">
          <div className="title-mask-wrapper">
            <h2 className="section-title retention-title-reveal">{heading}</h2>
          </div>
          <p className="section-sub retention-sub-reveal">{sub}</p>
        </div>

        <div className="theatre-layout">
          <div className="video-frame-wrap">
            {hasVideo ? (
              <div className="video-container">
                <video
                  ref={videoRef}
                  src={isInView ? retentionData.file : undefined}
                  poster={reelPoster || undefined}
                  muted
                  playsInline
                  loop
                  preload="none"
                  onTimeUpdate={handleTimeUpdate}
                  className="reel-video"
                />
                <a
                  href={reelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="retention-ig-badge"
                  aria-label="Watch on Instagram"
                >
                  <span>Watch on Instagram ↗</span>
                </a>
                <button
                  onClick={toggleVideoPlay}
                  className="video-play-btn"
                  aria-label={isPlaying ? 'Pause video' : 'Play video'}
                >
                  {isPlaying ? '❚❚' : '▶'}
                </button>
              </div>
            ) : (
              <div className="empty-video-frame">
                <div className="empty-play-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="var(--muted)" style={{ opacity: 0.6 }}>
                    <polygon points="6 4 20 12 6 20 6 4" />
                  </svg>
                </div>
              </div>
            )}
          </div>

          <div className="insights-panel">
            <div className="hero-stats-row">
              {heroStats.map((stat, idx) => (
                <div
                  key={stat.id || idx}
                  ref={(el) => {
                    heroCardRefs.current[idx] = el;
                  }}
                  className={`hero-stat-card ${isGlassBlur && isDesktop ? 'glass-real' : 'glass-fake'}`}
                >
                  <div className="hero-stat-val">
                    <span
                      ref={(el) => {
                        heroValRefs.current[idx] = el;
                      }}
                    >
                      {stat.value}
                    </span>
                  </div>
                  <div className="hero-stat-lbl">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="supporting-stats-grid">
              {supportingStats.map((stat, idx) => (
                <div key={stat.id || idx} className="supporting-stat-card glass-fake">
                  <div className="supporting-stat-val">{stat.value}</div>
                  <div className="supporting-stat-lbl">{stat.label}</div>
                  {stat.note && <div className="supporting-stat-note">{stat.note}</div>}
                </div>
              ))}
            </div>

            <div className="retention-footnote">{footnote}</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .retention-section {
          padding: 20px 96px;
          scroll-margin-top: 80px;
        }
        .section-container {
          max-width: 1248px;
          margin: 0 auto;
          width: 100%;
          position: relative;
          z-index: 1;
        }
        .section-header {
          margin-bottom: 12px;
        }
        .title-mask-wrapper {
          overflow: hidden;
        }
        .section-title {
          font-family: var(--font-main);
          font-size: 34px;
          font-weight: 600;
          letter-spacing: -0.03em;
          color: var(--text);
          line-height: 1.1;
          margin: 0;
        }
        .section-sub {
          font-family: var(--font-main);
          font-size: 15px;
          color: var(--muted);
          line-height: 1.35;
          margin: 6px 0 0 0;
        }
        .theatre-layout {
          display: flex;
          gap: 24px;
          align-items: stretch;
          width: 100%;
        }
        .video-frame-wrap {
          height: 520px;
          aspect-ratio: 9 / 16;
          width: auto;
          border-radius: 20px;
          overflow: hidden;
          background: #000;
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-sizing: border-box;
          position: relative;
          flex-shrink: 0;
        }
        .video-container {
          width: 100%;
          height: 100%;
          position: relative;
          background: #000;
          overflow: hidden;
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
        .retention-ig-badge {
          position: absolute;
          top: 14px;
          left: 14px;
          display: inline-flex;
          align-items: center;
          min-height: 44px;
          text-decoration: none;
          z-index: 4;
        }
        .retention-ig-badge:focus-visible {
          outline: 2px solid var(--accent);
          outline-offset: 3px;
        }
        .retention-ig-badge span {
          font-family: var(--font-main);
          font-size: 11px;
          font-weight: 600;
          color: #fff;
          background: rgba(18, 18, 20, 0.82);
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 5px 10px;
          border-radius: 999px;
          backdrop-filter: blur(8px);
          transition: background 0.2s ease, transform 0.2s ease;
        }
        .retention-ig-badge:hover span,
        .retention-ig-badge:focus-visible span {
          background: rgba(255, 90, 43, 0.9);
          transform: translateY(-1px);
        }
        .video-play-btn {
          position: absolute;
          bottom: 16px;
          right: 16px;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(11, 10, 9, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: var(--text);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 13px;
          transition: transform 0.2s ease, background 0.2s ease;
        }
        .video-play-btn:hover {
          transform: scale(1.05);
          background: rgba(255, 90, 43, 0.9);
        }
        .empty-video-frame {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at 50% 30%, #1c1b1f 0%, #121214 100%);
        }
        .empty-play-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.04);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .insights-panel {
          flex: 1;
          height: 520px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-width: 0;
          box-sizing: border-box;
        }
        .hero-stats-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          flex-shrink: 0;
        }
        .hero-stat-card {
          padding: 14px 16px;
          border-radius: 14px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          box-sizing: border-box;
          will-change: transform, opacity;
        }
        .hero-stat-val {
          font-family: var(--font-main);
          font-weight: 600;
          font-size: 34px;
          letter-spacing: -0.03em;
          line-height: 1.05;
          color: var(--accent);
          margin-bottom: 4px;
        }
        .hero-stat-lbl {
          font-family: var(--font-main);
          font-size: 13px;
          color: var(--muted);
          line-height: 1.25;
        }
        .supporting-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin: 10px 0;
          flex: 1;
        }
        .supporting-stat-card {
          padding: 8px 12px;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          box-sizing: border-box;
          min-height: 0;
        }
        .supporting-stat-val {
          font-family: var(--font-main);
          font-size: 16px;
          font-weight: 600;
          color: var(--text);
          line-height: 1.15;
          letter-spacing: -0.01em;
        }
        .supporting-stat-lbl {
          font-family: var(--font-main);
          font-size: 11px;
          color: var(--muted);
          line-height: 1.2;
          margin-top: 2px;
        }
        .supporting-stat-note {
          font-family: var(--font-main);
          font-size: 10px;
          color: var(--accent);
          opacity: 0.9;
          margin-top: 2px;
          line-height: 1.15;
        }
        .retention-footnote {
          font-family: var(--font-main);
          font-size: 11px;
          color: var(--muted);
          opacity: 0.75;
          line-height: 1.35;
          flex-shrink: 0;
        }

        @media (max-width: 1024px) {
          .retention-section {
            padding: 32px 48px;
          }
          .video-frame-wrap {
            height: 480px;
          }
          .insights-panel {
            height: 480px;
          }
          .hero-stat-val {
            font-size: 28px;
          }
          .hero-stat-lbl {
            font-size: 12px;
          }
        }

        @media (max-width: 768px) {
          .retention-section {
            padding: 72px 20px 48px;
          }
          .section-title {
            font-size: 26px;
          }
          .section-sub {
            font-size: 14px;
          }
          .theatre-layout {
            flex-direction: column;
            gap: 24px;
          }
          .video-frame-wrap {
            width: 210px;
            height: 373px;
            min-width: 210px;
            margin: 0 auto;
          }
          .insights-panel {
            height: auto;
            gap: 16px;
          }
          .hero-stats-row {
            grid-template-columns: 1fr;
            gap: 10px;
          }
          .hero-stat-val {
            font-size: 28px;
          }
          .supporting-stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
            margin: 0;
          }
          .supporting-stat-card:nth-child(9) {
            grid-column: span 2;
          }
          .retention-footnote {
            font-size: 11px;
            margin-top: 4px;
          }
        }
      `}</style>
    </section>
  );
}

