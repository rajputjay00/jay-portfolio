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
  const sfcData = resultsMap['sfc'] || { value: '39.5K', account: 'Strictly For Corporate' };
  const brandsData = resultsMap['brands'] || {
    value: '5',
    account: 'Flipkart, Realme, Lava, Jio Hotstar, Wellbeing Nutrition',
  };

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      if (iclRef.current) iclRef.current.innerText = iclData.value;
      if (sfcRef.current) sfcRef.current.innerText = sfcData.value;
      if (brandsRef.current) brandsRef.current.innerText = brandsData.value;
      return;
    }

    const iclTarget = parseFloat(iclData.value.replace(/[^0-9.]/g, '')) || 401;
    const sfcTarget = parseFloat(sfcData.value.replace(/[^0-9.]/g, '')) || 39.5;
    const brandsTarget = parseFloat(brandsData.value.replace(/[^0-9.]/g, '')) || 5;

    const ctx = gsap.context(() => {
      const counters = { icl: 0, sfc: 0, brands: 0 };

      // Title mask reveal & Proof items
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          gsap.from('.proof-title-reveal', {
            y: '100%',
            duration: 0.7,
            ease: 'power3.out',
          });
          gsap.from('.proof-col', {
            y: 24,
            opacity: 0,
            duration: 0.8,
            stagger: 0.08,
            ease: 'power2.out',
          });

          // Notification card slide-in
          gsap.fromTo(
            '.proof-notification-wrapper',
            { x: 60, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.8, delay: 0.3, ease: 'power3.out' }
          );

          // Counter animation
          gsap.to(counters, {
            icl: iclTarget,
            sfc: sfcTarget,
            brands: brandsTarget,
            duration: 1.2,
            ease: 'power2.out',
            onUpdate: () => {
              if (iclRef.current) {
                iclRef.current.innerText = `${Math.round(counters.icl)}K`;
              }
              if (sfcRef.current) {
                const sfcFormatted =
                  counters.sfc >= sfcTarget - 0.1
                    ? sfcTarget.toString()
                    : counters.sfc.toFixed(1);
                sfcRef.current.innerText = `${sfcFormatted}K`;
              }
              if (brandsRef.current) {
                brandsRef.current.innerText = `${Math.round(counters.brands)}`;
              }
            },
            onComplete: () => {
              if (iclRef.current) iclRef.current.innerText = iclData.value;
              if (sfcRef.current) sfcRef.current.innerText = sfcData.value;
              if (brandsRef.current) brandsRef.current.innerText = brandsData.value;

              // Draw hand-drawn scribbles after counter finishes
              if (ellipseRef.current) {
                const len = ellipseRef.current.getTotalLength() || 600;
                gsap.fromTo(
                  ellipseRef.current,
                  { strokeDasharray: len, strokeDashoffset: len },
                  { strokeDashoffset: 0, duration: 0.8, ease: 'power2.out' }
                );
              }
              if (arrowRef.current) {
                const len = arrowRef.current.getTotalLength() || 300;
                gsap.fromTo(
                  arrowRef.current,
                  { strokeDasharray: len, strokeDashoffset: len },
                  { strokeDashoffset: 0, duration: 0.8, ease: 'power2.out', delay: 0.1 }
                );
              }
            },
          });
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [iclData.value, sfcData.value, brandsData.value]);

  return (
    <section
      id="proof"
      ref={sectionRef}
      className="proof-section"
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
      <div className="section-container">
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
        <div className="proof-grid">
          {/* 1. ICL */}
          <div className="proof-col">
            <div className="proof-value">
              <span ref={iclRef}>401K</span>
            </div>
            <div className="proof-label">
              followers · {iclData.account}
            </div>
          </div>

          <div className="proof-divider" />

          {/* 2. SFC with Hand-drawn Ellipse */}
          <div className="proof-col">
            <div className="proof-value">
              <span className="scribble-target-wrap">
                <span ref={sfcRef}>39.5K</span>
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
              followers · {sfcData.account}
            </div>
          </div>

          <div className="proof-divider" />

          {/* 3. Brands with Hand-drawn Arrow */}
          <div className="proof-col">
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
          padding: 110px 96px;
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
        }
        .proof-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
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
