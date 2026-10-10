'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import retentionData from '@/../content/retention.json';
import reelsData from '@/../content/reels.json';
import { perfStore } from '@/store/perfStore';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function RetentionTheatreSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const [isGlassBlur, setIsGlassBlur] = useState(perfStore.getSettings().glassBlur);
  const [isDesktop, setIsDesktop] = useState(true);

  const duration = retentionData.durationSeconds || 30;
  const curvePoints = retentionData.curve || [];
  const moments = retentionData.moments || [];
  const hasVideo = Boolean(retentionData.file && retentionData.file.trim().length > 0);

  const sfcReel = reelsData.reels?.find((r) => r.id === 'sfc-1');
  const reelUrl = sfcReel?.url || 'https://www.instagram.com/reel/DHVgzLQzNQR/?utm_source=ig_web_copy_link&psln=MzRlODBiNWFlZA==';

  // SVG dimensions
  const svgWidth = 640;
  const svgHeight = 380;
  const marginLeft = 48;
  const marginRight = 32;
  const marginTop = 36;
  const marginBottom = 44;
  const plotWidth = svgWidth - marginLeft - marginRight;
  const plotHeight = svgHeight - marginTop - marginBottom;

  // Track settings and section visibility
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

    if (!prefersReducedMotion && sectionRef.current) {
      const ctx = gsap.context(() => {
        // Title mask reveal & curve draw-in
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top 75%',
          once: true,
          onEnter: () => {
            gsap.from('.retention-title-reveal', {
              y: '100%',
              duration: 0.7,
              ease: 'power3.out',
            });

            if (pathRef.current) {
              const length = pathRef.current.getTotalLength() || 1500;
              gsap.fromTo(
                pathRef.current,
                { strokeDasharray: length, strokeDashoffset: length },
                { strokeDashoffset: 0, duration: 1.2, ease: 'power2.out' }
              );
            }

            gsap.from('.moment-marker', {
              opacity: 0,
              y: -8,
              duration: 0.5,
              stagger: 0.1,
              delay: 0.8,
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
            gsap.set('.retention-glow', { y: yOffset });
          },
        });
      }, sectionRef);

      return () => {
        unsub();
        observer.disconnect();
        window.removeEventListener('resize', checkDesktop);
        ctx.revert();
      };
    }

    return () => {
      unsub();
      observer.disconnect();
      window.removeEventListener('resize', checkDesktop);
    };
  }, []);

  // Autonomous animation loop when no video file exists
  useEffect(() => {
    if (hasVideo || !isInView) return;

    let animFrame: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      setCurrentTime((prev) => {
        const next = prev + dt;
        return next >= duration ? 0 : next;
      });

      animFrame = requestAnimationFrame(loop);
    };

    animFrame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrame);
  }, [hasVideo, isInView, duration]);

  // Video playback time update handler (loop at 8 seconds)
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      if (videoRef.current.currentTime >= 8) {
        videoRef.current.currentTime = 0;
      }
      setCurrentTime(videoRef.current.currentTime);
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

  // Convert (t, pct) to SVG (x, y) coordinates
  const getCoords = useCallback((t: number, pct: number) => {
    const x = marginLeft + (Math.max(0, Math.min(duration, t)) / duration) * plotWidth;
    const y = marginTop + ((100 - Math.max(0, Math.min(100, pct))) / 100) * plotHeight;
    return { x, y };
  }, [duration, marginLeft, marginTop, plotHeight, plotWidth]);

  // Interpolate percentage at current time
  const getPctAtTime = useCallback((t: number) => {
    if (curvePoints.length === 0) return 100;
    if (t <= curvePoints[0].t) return curvePoints[0].pct;
    if (t >= curvePoints[curvePoints.length - 1].t) {
      return curvePoints[curvePoints.length - 1].pct;
    }

    for (let i = 0; i < curvePoints.length - 1; i++) {
      const p1 = curvePoints[i];
      const p2 = curvePoints[i + 1];
      if (t >= p1.t && t <= p2.t) {
        const span = p2.t - p1.t;
        const progress = span === 0 ? 0 : (t - p1.t) / span;
        return p1.pct + progress * (p2.pct - p1.pct);
      }
    }
    return 100;
  }, [curvePoints]);

  // Generate SVG curve path
  const svgPath = React.useMemo(() => {
    if (curvePoints.length === 0) return '';
    const points = curvePoints.map((p) => getCoords(p.t, p.pct));
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  }, [curvePoints, getCoords]);

  // Current dot coordinates
  const currentPct = getPctAtTime(currentTime);
  const dotCoords = getCoords(currentTime, currentPct);

  // Click / Drag to seek
  const handleSeek = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const svgRelX = (clickX / rect.width) * svgWidth;
    const normalizedTime = ((svgRelX - marginLeft) / plotWidth) * duration;
    const targetTime = Math.max(0, Math.min(duration, normalizedTime));

    setCurrentTime(targetTime);
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
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
      {/* Soft Ambient Glow in Background */}
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
        <div className="title-mask-wrapper">
          <h2 className="section-title retention-title-reveal">Retention theatre</h2>
        </div>

        <div className="theatre-layout">
          {/* Left: 9:16 Video Frame */}
          <div className="video-frame-wrap">
            {hasVideo ? (
              <div className="video-container">
                <video
                  ref={videoRef}
                  src={retentionData.file}
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

          {/* Right: Glass Panel with Chart (.glass-real on desktop) */}
          <div className={`chart-panel ${isGlassBlur && isDesktop ? 'glass-real' : 'glass-fake'}`}>
            <div className="chart-header">
              <h3 className="chart-title">Who stayed, second by second</h3>
              <div className="chart-live-metric">
                <span className="live-metric-val">{Math.round(currentPct)}%</span>
                <span className="live-metric-lbl">watching at {currentTime.toFixed(1)}s</span>
              </div>
            </div>

            <div className="svg-wrapper">
              <svg
                ref={svgRef}
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="retention-svg"
                onClick={handleSeek}
              >
                {/* Horizontal grid lines & Y-axis labels */}
                {[100, 75, 50, 25, 0].map((val) => {
                  const { y } = getCoords(0, val);
                  return (
                    <g key={`grid-${val}`}>
                      <line
                        x1={marginLeft}
                        y1={y}
                        x2={marginLeft + plotWidth}
                        y2={y}
                        stroke={val === 0 ? 'rgba(255, 255, 255, 0.16)' : 'rgba(255, 255, 255, 0.06)'}
                        strokeWidth="1"
                      />
                      <text
                        x={marginLeft - 10}
                        y={y + 4}
                        fill="var(--muted)"
                        fontSize="11"
                        fontFamily="var(--font-main)"
                        textAnchor="end"
                      >
                        {val}%
                      </text>
                    </g>
                  );
                })}

                {/* X-axis time marks */}
                {[0, 5, 10, 15, 20, 25, 30].map((t) => {
                  if (t > duration) return null;
                  const { x } = getCoords(t, 0);
                  return (
                    <text
                      key={`time-${t}`}
                      x={x}
                      y={marginTop + plotHeight + 24}
                      fill="var(--muted)"
                      fontSize="11"
                      fontFamily="var(--font-main)"
                      textAnchor="middle"
                    >
                      {t}s
                    </text>
                  );
                })}

                {/* Moment Markers (Hook, Reveal, CTA) */}
                {moments.map((m, idx) => {
                  const { x } = getCoords(m.t, 0);
                  const label =
                    m.type === 'hook'
                      ? 'Hook'
                      : m.type === 'reveal'
                      ? 'Reveal'
                      : m.type === 'cta'
                      ? 'CTA'
                      : m.type;

                  return (
                    <g key={`moment-${idx}`} className="moment-marker">
                      <line
                        x1={x}
                        y1={marginTop}
                        x2={x}
                        y2={marginTop + plotHeight}
                        stroke="rgba(255, 255, 255, 0.25)"
                        strokeDasharray="4 4"
                        strokeWidth="1"
                      />
                      <rect
                        x={x - 24}
                        y={marginTop - 22}
                        width={48}
                        height={18}
                        rx={4}
                        fill="rgba(20, 20, 22, 0.9)"
                        stroke="rgba(255, 255, 255, 0.12)"
                        strokeWidth="1"
                      />
                      <text
                        x={x}
                        y={marginTop - 10}
                        fill="var(--text)"
                        fontSize="11"
                        fontWeight="500"
                        fontFamily="var(--font-main)"
                        textAnchor="middle"
                      >
                        {label}
                      </text>
                    </g>
                  );
                })}

                {/* Main Retention Curve */}
                <path
                  ref={pathRef}
                  d={svgPath}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Current Time Tracking Line */}
                <line
                  x1={dotCoords.x}
                  y1={marginTop}
                  x2={dotCoords.x}
                  y2={marginTop + plotHeight}
                  stroke="var(--accent)"
                  strokeOpacity="0.3"
                  strokeDasharray="2 2"
                  strokeWidth="1"
                />

                {/* Animated Dot on Curve */}
                <circle
                  cx={dotCoords.x}
                  cy={dotCoords.y}
                  r="8"
                  fill="var(--accent)"
                  style={{ filter: 'drop-shadow(0 0 6px rgba(255, 90, 43, 0.8))' }}
                />
                <circle
                  cx={dotCoords.x}
                  cy={dotCoords.y}
                  r="3.5"
                  fill="#FFF"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .retention-section {
          padding: 110px 96px;
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
        .theatre-layout {
          display: flex;
          gap: 32px;
          align-items: stretch;
          width: 100%;
        }
        .video-frame-wrap {
          height: 560px;
          aspect-ratio: 9 / 16;
          width: auto;
          border-radius: 22px;
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
          top: 16px;
          left: 16px;
          display: inline-flex;
          align-items: center;
          text-decoration: none;
          z-index: 4;
          outline: none;
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
          bottom: 20px;
          right: 20px;
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
          font-size: 14px;
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
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.04);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .chart-panel {
          flex: 1;
          height: 560px;
          padding: 32px;
          border-radius: 22px;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
        }
        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-shrink: 0;
        }
        .chart-title {
          font-family: var(--font-main);
          font-weight: 500;
          font-size: 20px;
          color: var(--text);
          margin: 0;
          line-height: 1.2;
        }
        .chart-live-metric {
          display: flex;
          align-items: baseline;
          gap: 8px;
        }
        .live-metric-val {
          font-family: var(--font-main);
          font-weight: 600;
          font-size: 22px;
          color: var(--accent);
        }
        .live-metric-lbl {
          font-family: var(--font-main);
          font-size: 13px;
          color: var(--muted);
        }
        .svg-wrapper {
          flex: 1;
          width: 100%;
          min-height: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .retention-svg {
          width: 100%;
          height: 100%;
          cursor: crosshair;
          user-select: none;
        }

        @media (max-width: 1024px) {
          .retention-section {
            padding: 80px 48px;
          }
          .video-frame-wrap {
            width: 260px;
            height: 462px;
            min-width: 260px;
          }
          .chart-panel {
            height: 462px;
            padding: 24px;
          }
        }

        @media (max-width: 768px) {
          .retention-section {
            padding: 64px 24px;
          }
          .section-title {
            font-size: 32px;
          }
          .theatre-layout {
            flex-direction: column;
            gap: 24px;
          }
          .video-frame-wrap {
            width: 225px;
            height: 400px;
            min-width: 225px;
            margin: 0 auto;
          }
          .chart-panel {
            width: 100%;
            height: 400px;
            padding: 24px 16px;
          }
          .chart-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
        }
      `}</style>
    </section>
  );
}
