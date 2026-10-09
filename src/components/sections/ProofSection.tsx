'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import resultsData from '@/../content/results.json';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ProofSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const col1Ref = useRef<HTMLDivElement>(null);
  const col2Ref = useRef<HTMLDivElement>(null);
  const col3Ref = useRef<HTMLDivElement>(null);
  const iclRef = useRef<HTMLSpanElement>(null);
  const sfcRef = useRef<HTMLSpanElement>(null);
  const brandsRef = useRef<HTMLSpanElement>(null);
  const ellipseRef = useRef<SVGPathElement>(null);
  const arrowRef = useRef<SVGPathElement>(null);

  const resultsList = resultsData?.results || [];
  const resultsMap: Record<string, { value: string; account?: string; label?: string }> = {};
  resultsList.forEach((item) => {
    resultsMap[item.id] = item;
  });

  const iclData = resultsMap['icl'] || { value: '401K', account: 'Indian Corporate Life' };
  const sfcTopReelData = resultsMap['sfc-top-reel'] || {
    value: '21.2M',
    label: 'views on one Reel',
    account: 'Strictly For Corporate',
  };
  const brandsData = resultsMap['brands'] || {
    value: '5',
    account: 'Flipkart, Realme, Lava, JioHotstar, Wellbeing Nutrition',
  };

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      if (iclRef.current) iclRef.current.innerText = iclData.value;
      if (sfcRef.current) sfcRef.current.innerText = sfcTopReelData.value;
      if (brandsRef.current) brandsRef.current.innerText = brandsData.value;
      if (ellipseRef.current) ellipseRef.current.style.strokeDashoffset = '0';
      if (arrowRef.current) arrowRef.current.style.strokeDashoffset = '0';
      return;
    }

    const iclTarget = parseFloat(iclData.value.replace(/[^0-9.]/g, '')) || 401;
    const sfcTarget = parseFloat(sfcTopReelData.value.replace(/[^0-9.]/g, '')) || 21.2;
    const brandsTarget = parseFloat(brandsData.value.replace(/[^0-9.]/g, '')) || 5;

    const isDesktop = window.innerWidth >= 768;

    const ctx = gsap.context(() => {
      if (isDesktop && sectionRef.current && gridRef.current && col1Ref.current && col2Ref.current && col3Ref.current) {
        // Setup scribble paths
        const ellipseLen = ellipseRef.current?.getTotalLength() || 600;
        const arrowLen = arrowRef.current?.getTotalLength() || 300;
        if (ellipseRef.current) {
          gsap.set(ellipseRef.current, { strokeDasharray: ellipseLen, strokeDashoffset: ellipseLen });
        }
        if (arrowRef.current) {
          gsap.set(arrowRef.current, { strokeDasharray: arrowLen, strokeDashoffset: arrowLen });
        }

        const computePositions = () => {
          if (!gridRef.current || !col1Ref.current || !col2Ref.current || !col3Ref.current) return { deltaX1: 0, deltaX3: 0, scaleVal: 1.9 };
          const gridRect = gridRef.current.getBoundingClientRect();
          const col1Rect = col1Ref.current.getBoundingClientRect();
          const col3Rect = col3Ref.current.getBoundingClientRect();

          const gridCenterX = gridRect.left + gridRect.width / 2;
          const col1CenterX = col1Rect.left + col1Rect.width / 2;
          const col3CenterX = col3Rect.left + col3Rect.width / 2;

          // Target ~26vw font equivalent
          const targetVW = window.innerWidth * 0.22;
          const normalValWidth = col1Ref.current.querySelector('.proof-value')?.clientWidth || 280;
          const scaleVal = Math.min(2.4, Math.max(1.6, targetVW / normalValWidth));

          return {
            deltaX1: gridCenterX - col1CenterX,
            deltaX3: gridCenterX - col3CenterX,
            scaleVal,
          };
        };

        const { deltaX1, deltaX3, scaleVal } = computePositions();

        const counters = { icl: 0, sfc: 0, brands: 0 };

        // Initial state for desktop pinned sequence
        gsap.set('.proof-divider', { opacity: 0 });
        gsap.set('.proof-brands-line', { opacity: 0, y: 20 });
        gsap.set('.proof-notification-wrapper', { opacity: 0, x: 60 });
        gsap.set(col1Ref.current, { x: deltaX1, scale: scaleVal, opacity: 1, transformOrigin: 'center center' });
        gsap.set(col2Ref.current, { x: 0, scale: scaleVal, opacity: 0, transformOrigin: 'center center' });
        gsap.set(col3Ref.current, { x: deltaX3, scale: scaleVal, opacity: 0, transformOrigin: 'center center' });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: '+=200%',
            pin: true,
            pinSpacing: true,
            scrub: 0.5,
            invalidateOnRefresh: true,
          },
        });

        // Step 1: ICL counts up at center (0.0s - 1.4s)
        tl.to(counters, {
          icl: iclTarget,
          duration: 1.4,
          ease: 'power1.out',
          onUpdate: () => {
            if (iclRef.current) iclRef.current.innerText = `${Math.round(counters.icl)}K`;
          },
        }, 0);

        // Step 2: ICL shrinks and moves to left (1.4s - 2.4s)
        tl.to(col1Ref.current, {
          x: 0,
          scale: 1,
          duration: 1.0,
          ease: 'power2.inOut',
        }, 1.4);

        // Step 3: SFC Top Reel fades in at center large, counts up (2.4s - 4.0s)
        tl.to(col2Ref.current, {
          opacity: 1,
          duration: 0.4,
          ease: 'power1.out',
        }, 2.4);

        tl.to(counters, {
          sfc: sfcTarget,
          duration: 1.4,
          ease: 'power1.out',
          onUpdate: () => {
            if (sfcRef.current) {
              const formatted = counters.sfc >= sfcTarget - 0.05 ? sfcTarget.toFixed(1) : counters.sfc.toFixed(1);
              sfcRef.current.innerText = `${formatted}M`;
            }
          },
        }, 2.4);

        // Step 4: SFC shrinks to place (4.0s - 5.0s)
        tl.to(col2Ref.current, {
          scale: 1,
          duration: 1.0,
          ease: 'power2.inOut',
        }, 4.0);

        // Step 5: Brands fades in at center large, counts up (5.0s - 6.4s)
        tl.to(col3Ref.current, {
          opacity: 1,
          duration: 0.4,
          ease: 'power1.out',
        }, 5.0);

        tl.to(counters, {
          brands: brandsTarget,
          duration: 1.2,
          ease: 'power1.out',
          onUpdate: () => {
            if (brandsRef.current) brandsRef.current.innerText = `${Math.round(counters.brands)}`;
          },
        }, 5.0);

        // Step 6: Brands shrinks and moves to right (6.4s - 7.4s)
        tl.to(col3Ref.current, {
          x: 0,
          scale: 1,
          duration: 1.0,
          ease: 'power2.inOut',
        }, 6.4);

        // Step 7: Dividers & brands line fade in (7.4s - 8.2s)
        tl.to('.proof-divider', {
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power2.out',
        }, 7.4);

        tl.to('.proof-brands-line', {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
        }, 7.5);

        // Step 8: Scribbles draw and notification card slides in (8.0s - 9.0s)
        if (ellipseRef.current) {
          tl.to(ellipseRef.current, {
            strokeDashoffset: 0,
            duration: 0.9,
            ease: 'power2.out',
          }, 8.0);
        }

        if (arrowRef.current) {
          tl.to(arrowRef.current, {
            strokeDashoffset: 0,
            duration: 0.9,
            ease: 'power2.out',
          }, 8.1);
        }

        tl.to('.proof-notification-wrapper', {
          x: 0,
          opacity: 1,
          duration: 0.9,
          ease: 'power3.out',
        }, 8.0);

        // Small buffer at the end before unpinning (9.0s - 10.0s)
        tl.to({}, { duration: 1.0 });
      } else {
        // Mobile (< 768px): No pin; each value scales from 1.3 to 1 and fades in as it enters viewport
        const cols = [
          { ref: col1Ref, valRef: iclRef, target: iclTarget, format: (v: number) => `${Math.round(v)}K` },
          { ref: col2Ref, valRef: sfcRef, target: sfcTarget, format: (v: number) => `${v >= sfcTarget - 0.05 ? sfcTarget.toFixed(1) : v.toFixed(1)}M` },
          { ref: col3Ref, valRef: brandsRef, target: brandsTarget, format: (v: number) => `${Math.round(v)}` },
        ];

        cols.forEach(({ ref, valRef, target, format }) => {
          if (!ref.current) return;
          const counterObj = { val: 0 };
          gsap.fromTo(
            ref.current,
            { scale: 1.3, opacity: 0 },
            {
              scale: 1,
              opacity: 1,
              duration: 0.8,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: ref.current,
                start: 'top 85%',
                once: true,
                onEnter: () => {
                  gsap.to(counterObj, {
                    val: target,
                    duration: 1.2,
                    ease: 'power2.out',
                    onUpdate: () => {
                      if (valRef.current) valRef.current.innerText = format(counterObj.val);
                    },
                    onComplete: () => {
                      if (valRef.current) valRef.current.innerText = format(target);
                    },
                  });
                },
              },
            }
          );
        });

        // Scribbles on mobile
        if (ellipseRef.current) {
          const len = ellipseRef.current.getTotalLength() || 600;
          gsap.fromTo(
            ellipseRef.current,
            { strokeDasharray: len, strokeDashoffset: len },
            {
              strokeDashoffset: 0,
              duration: 0.8,
              scrollTrigger: {
                trigger: col2Ref.current,
                start: 'top 75%',
                once: true,
              },
            }
          );
        }
      }
    }, sectionRef);

    const handleResize = () => {
      ScrollTrigger.refresh();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      ctx.revert();
    };
  }, [iclData.value, sfcTopReelData.value, brandsData.value]);

  return (
    <section
      id="proof"
      ref={sectionRef}
      className="proof-section"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        boxSizing: 'border-box',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        backgroundColor: 'var(--bg)',
        color: 'var(--text)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <div ref={containerRef} className="section-container">
        <div className="proof-header-row">
          <div className="title-mask-wrapper">
            <h2 className="section-title proof-title-reveal">Proof</h2>
          </div>

          {/* Desktop Notification Card */}
          <div className="proof-notification-wrapper">
            <div className="proof-notification-shadow" />
            <div className="proof-notification-card">
              <div className="notif-icon-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--bg)">
                  <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
                </svg>
              </div>
              <div className="notif-body">
                <div className="notif-title-row">
                  <span className="notif-title">{iclData.account}</span>
                  <span className="notif-time">now</span>
                </div>
                <div className="notif-subtitle">{iclData.value} followers</div>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Metric Columns */}
        <div ref={gridRef} className="proof-grid">
          {/* 1. ICL */}
          <div ref={col1Ref} className="proof-col">
            <div className="proof-value">
              <span ref={iclRef}>401K</span>
            </div>
            <div className="proof-label">
              followers · {iclData.account}
            </div>
          </div>

          <div className="proof-divider" />

          {/* 2. SFC Top Reel with Hand-drawn Ellipse */}
          <div ref={col2Ref} className="proof-col">
            <div className="proof-value">
              <span className="scribble-target-wrap">
                <span ref={sfcRef}>{sfcTopReelData.value}</span>
                <svg
                  className="scribble-svg scribble-ellipse"
                  viewBox="0 0 260 130"
                  aria-hidden="true"
                >
                  <path
                    ref={ellipseRef}
                    d="M 32 65 C 26 28, 110 12, 210 28 C 248 35, 252 90, 196 110 C 130 126, 36 116, 18 72 C 12 46, 54 18, 114 16"
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>
            <div className="proof-label">
              views on one Reel · {sfcTopReelData.account}
            </div>
          </div>

          <div className="proof-divider" />

          {/* 3. Brands with Hand-drawn Arrow */}
          <div ref={col3Ref} className="proof-col">
            <div className="proof-value">
              <span className="scribble-target-wrap">
                <svg
                  className="scribble-svg scribble-arrow"
                  viewBox="0 0 120 100"
                  aria-hidden="true"
                >
                  <path
                    ref={arrowRef}
                    d="M 12 18 C 45 10, 78 28, 92 64 M 64 56 L 94 66 L 90 34"
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span ref={brandsRef}>5</span>
                <span style={{ color: 'var(--accent)' }}>.</span>
              </span>
            </div>
            <div className="proof-label">brands</div>
          </div>
        </div>

        {/* 5 Brand Names in Instrument Serif italic */}
        <div className="proof-brands-line">
          {brandsData.account}
        </div>
      </div>

      <style jsx>{`
        .proof-section {
          padding: 80px 96px;
        }
        .section-container {
          max-width: 1248px;
          margin: 0 auto;
          width: 100%;
        }
        .proof-header-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 3.5rem;
          position: relative;
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
        .proof-notification-wrapper {
          position: relative;
          width: 320px;
          flex-shrink: 0;
        }
        .proof-notification-shadow {
          position: absolute;
          inset: 0;
          transform: translate(6px, 6px);
          background: rgba(30, 28, 26, 0.45);
          border-radius: 18px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          z-index: 1;
          pointer-events: none;
        }
        .proof-notification-card {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 16px;
          background: rgba(30, 28, 26, 0.94);
          border-radius: 18px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
        }
        .notif-icon-box {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .notif-body {
          flex: 1;
          min-width: 0;
        }
        .notif-title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .notif-title {
          font-family: var(--font-main);
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 170px;
        }
        .notif-time {
          font-family: var(--font-main);
          font-size: 12px;
          color: var(--muted);
        }
        .notif-subtitle {
          font-family: var(--font-main);
          font-size: 13px;
          color: var(--muted);
          margin-top: 2px;
        }
        .proof-grid {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          width: 100%;
          position: relative;
        }
        .proof-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.75rem;
          will-change: transform, opacity;
        }
        .proof-divider {
          width: 1px;
          align-self: stretch;
          background: rgba(255, 255, 255, 0.08);
          margin: 0 2.5rem;
          flex-shrink: 0;
        }
        .proof-value {
          font-family: var(--font-main);
          font-weight: 500;
          font-size: 128px;
          letter-spacing: -0.05em;
          line-height: 1;
          color: var(--text);
          white-space: nowrap;
        }
        .scribble-target-wrap {
          position: relative;
          display: inline-block;
        }
        .scribble-svg {
          position: absolute;
          pointer-events: none;
          overflow: visible;
        }
        .scribble-ellipse {
          top: 50%;
          left: 50%;
          width: 1.32em;
          height: 1.15em;
          transform: translate(-50%, -50%) rotate(-4deg);
        }
        .scribble-arrow {
          top: -0.45em;
          left: -1.05em;
          width: 0.95em;
          height: 0.95em;
          transform: rotate(8deg);
        }
        .proof-label {
          font-family: var(--font-main);
          font-size: 18px;
          font-weight: 400;
          color: var(--muted);
          line-height: 1.35;
        }
        .proof-brands-line {
          font-family: var(--font-serif);
          font-style: italic;
          font-size: 28px;
          color: var(--muted);
          margin-top: 4.5rem;
          line-height: 1.3;
          letter-spacing: -0.01em;
        }

        @media (max-width: 1024px) {
          .proof-notification-wrapper {
            display: none;
          }
          .proof-header-row {
            margin-bottom: 2.5rem;
          }
          .proof-value {
            font-size: 96px;
          }
          .proof-divider {
            margin: 0 1.5rem;
          }
        }

        @media (max-width: 768px) {
          .proof-section {
            padding: 64px 24px;
            min-height: auto;
          }
          .section-title {
            font-size: 32px;
          }
          .proof-grid {
            flex-direction: column;
            gap: 2rem;
          }
          .proof-divider {
            width: 100%;
            height: 1px;
            margin: 0.5rem 0;
          }
          .proof-value {
            font-size: 72px;
          }
          .scribble-arrow {
            display: none;
          }
          .proof-label {
            font-size: 16px;
          }
          .proof-brands-line {
            font-size: 22px;
            margin-top: 3rem;
          }
        }
      `}</style>
    </section>
  );
}
