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

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 80%',
        once: true,
        onEnter: () => {
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
              // Guarantee exact final text matches results.json
              if (iclRef.current) iclRef.current.innerText = iclData.value;
              if (sfcRef.current) sfcRef.current.innerText = sfcData.value;
              if (brandsRef.current) brandsRef.current.innerText = brandsData.value;
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
      }}
    >
      <div className="section-container">
        <h2 className="section-title">Proof</h2>

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

          {/* 2. SFC */}
          <div className="proof-col">
            <div className="proof-value">
              <span ref={sfcRef}>39.5K</span>
            </div>
            <div className="proof-label">
              followers · {sfcData.account}
            </div>
          </div>

          <div className="proof-divider" />

          {/* 3. Brands */}
          <div className="proof-col">
            <div className="proof-value">
              <span ref={brandsRef}>5</span>
              <span style={{ color: 'var(--accent)' }}>.</span>
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
        .section-title {
          font-family: var(--font-main);
          font-size: 44px;
          font-weight: 600;
          letter-spacing: -0.03em;
          color: var(--text);
          margin-bottom: 3.5rem;
          line-height: 1.1;
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
            margin-bottom: 2.5rem;
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
