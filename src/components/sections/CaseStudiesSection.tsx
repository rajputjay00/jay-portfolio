'use client';

import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { caseStudiesList, CaseStudyData } from '@/data/caseStudiesData';
import resultsData from '@/../content/results.json';
import CaseStudyReaderModal from './CaseStudyReaderModal';
import { perfStore } from '@/store/perfStore';
import { scrollManager } from '@/store/scrollStore';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function CaseStudiesSection() {
  const [selectedStudyIndex, setSelectedStudyIndex] = useState<number | null>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [isGlassBlur, setIsGlassBlur] = useState(perfStore.getSettings().glassBlur);
  const [isDesktop, setIsDesktop] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = perfStore.subscribe((s) => setIsGlassBlur(s.glassBlur));
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkDesktop();

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let triggerInstance: ScrollTrigger | null = null;

    const ctx = gsap.context(() => {
      if (!prefersReducedMotion && window.innerWidth >= 1024 && sectionRef.current && trackRef.current) {
        // Title mask reveal
        gsap.from('.cases-title-reveal', {
          y: '100%',
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            once: true,
          },
        });

        const getPad = () => Math.max(48, Math.round((window.innerWidth - 1248) / 2));

        const getScrollDistance = () => {
          if (!trackRef.current) return window.innerWidth * 2;
          const pad = getPad();
          return Math.max(0, trackRef.current.scrollWidth + 2 * pad - window.innerWidth);
        };

        const totalDist = getScrollDistance();

        const tween = gsap.to(trackRef.current, {
          x: () => -getScrollDistance(),
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: () => `+=${getScrollDistance()}`,
            pin: true,
            pinSpacing: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const count = caseStudiesList.length;
              const bestIndex = Math.min(count - 1, Math.max(0, Math.round(self.progress * (count - 1))));
              if (counterRef.current) {
                counterRef.current.innerText = `${bestIndex + 1} / ${count}`;
              }
            },
          },
        });

        triggerInstance = tween.scrollTrigger || null;

        // Ambient glow subtle scroll scrub
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
          onUpdate: (self) => {
            const yOffset = (self.progress - 0.5) * 60;
            gsap.set('.cases-glow', { y: yOffset });
          },
        });
      } else if (!prefersReducedMotion && gridRef.current) {
        // Tablet / Mobile vertical grid entrance
        const cards = gridRef.current.querySelectorAll('.case-card');
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top 80%',
          once: true,
          onEnter: () => {
            gsap.from('.cases-title-reveal', {
              y: '100%',
              duration: 0.7,
              ease: 'power3.out',
            });
            gsap.from(cards, {
              y: 32,
              opacity: 0,
              duration: 0.8,
              stagger: 0.12,
              ease: 'power2.out',
            });
          },
        });
      }
    }, sectionRef);

    const handleResize = () => {
      checkDesktop();
      ScrollTrigger.refresh();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      unsub();
      window.removeEventListener('resize', handleResize);
      ctx.revert();
    };
  }, []);

  const handleCardFocus = (index: number) => {
    if (window.innerWidth >= 1024 && sectionRef.current) {
      const totalDist = trackRef.current ? trackRef.current.scrollWidth - window.innerWidth + 160 : 1500;
      const progress = index / (caseStudiesList.length - 1);
      const startPos = sectionRef.current.offsetTop;
      const targetScroll = startPos + progress * totalDist;

      if (scrollManager.lenisInstance) {
        scrollManager.lenisInstance.scrollTo(targetScroll);
      } else {
        window.scrollTo({ top: targetScroll, behavior: 'smooth' });
      }
    }
  };

  return (
    <section
      id="work"
      ref={sectionRef}
      className="case-studies-section"
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
      {/* Soft Ambient Glows behind Content */}
      <div
        className="ambient-glow drift-1 cases-glow"
        style={{
          top: '5%',
          right: '-10%',
          width: '650px',
          height: '650px',
        }}
      />
      <div
        className="ambient-glow drift-2 cases-glow"
        style={{
          bottom: '10%',
          left: '-15%',
          width: '550px',
          height: '550px',
        }}
      />

      {/* Desktop Horizontal Sideways Pinned Layout (>= 1024px) */}
      <div className="desktop-sideways-container">
        <div className="sideways-header">
          <div className="title-mask-wrapper">
            <h2 className="section-title cases-title-reveal">Case studies</h2>
          </div>
          <span ref={counterRef} className="sideways-counter">
            1 / {caseStudiesList.length}
          </span>
        </div>

        <div className="sideways-track-wrapper">
          <div ref={trackRef} className="sideways-track">
            {caseStudiesList.map((study, index) => (
              <div key={study.id} className="sideways-card-item">
                <CaseStudyCard
                  study={study}
                  index={index}
                  isGlassBlur={isGlassBlur && isDesktop}
                  onSelect={() => setSelectedStudyIndex(index)}
                  onFocus={() => handleCardFocus(index)}
                  refSetter={(el) => {
                    cardRefs.current[index] = el;
                  }}
                  isSideways={true}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile / Tablet Vertical Grid Layout (< 1024px) */}
      <div className="mobile-grid-container">
        <div className="section-container">
          <div className="title-mask-wrapper" style={{ marginBottom: '2.5rem' }}>
            <h2 className="section-title cases-title-reveal">Case studies</h2>
          </div>

          <div ref={gridRef} className="cases-grid">
            {caseStudiesList.map((study, index) => (
              <CaseStudyCard
                key={study.id}
                study={study}
                index={index}
                isGlassBlur={isGlassBlur && isDesktop}
                onSelect={() => setSelectedStudyIndex(index)}
                refSetter={(el) => {
                  cardRefs.current[index] = el;
                }}
                isSideways={false}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Full Screen Story Reader Modal */}
      {selectedStudyIndex !== null && (
        <CaseStudyReaderModal
          studies={caseStudiesList}
          initialIndex={selectedStudyIndex}
          onClose={() => {
            const lastIdx = selectedStudyIndex;
            setSelectedStudyIndex(null);
            setTimeout(() => {
              if (lastIdx !== null && cardRefs.current[lastIdx]) {
                cardRefs.current[lastIdx]?.focus({ preventScroll: true });
              }
            }, 50);
          }}
        />
      )}

      <style jsx>{`
        .case-studies-section {
          width: 100%;
          min-height: 100vh;
        }
        .desktop-sideways-container {
          --side-pad: max(48px, calc((100vw - 1248px) / 2));
          display: flex;
          flex-direction: column;
          justify-content: center;
          width: 100%;
          height: 100vh;
          padding: 40px 0;
          box-sizing: border-box;
          position: relative;
        }
        .sideways-header {
          position: absolute;
          top: 48px;
          left: var(--side-pad);
          display: flex;
          align-items: baseline;
          gap: 24px;
          z-index: 10;
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
        .sideways-counter {
          font-family: var(--font-main);
          font-size: 16px;
          font-weight: 500;
          color: var(--muted);
          letter-spacing: 0.05em;
        }
        .sideways-track-wrapper {
          width: 100%;
          overflow: visible;
          padding-left: var(--side-pad);
          padding-right: var(--side-pad);
          box-sizing: border-box;
          margin-top: 60px;
        }
        .sideways-track {
          display: flex;
          gap: 32px;
          width: max-content;
          will-change: transform;
        }
        .sideways-card-item {
          width: 44vw;
          min-width: 420px;
          max-width: 620px;
          flex-shrink: 0;
        }
        .mobile-grid-container {
          display: none;
          padding: 80px 24px;
        }
        .section-container {
          max-width: 1248px;
          margin: 0 auto;
          width: 100%;
          position: relative;
          z-index: 1;
        }
        .cases-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
          width: 100%;
        }

        @media (max-width: 1023px) {
          .desktop-sideways-container {
            display: none;
          }
          .mobile-grid-container {
            display: block;
          }
        }

        @media (max-width: 900px) {
          .cases-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .mobile-grid-container {
            padding: 64px 24px;
          }
          .section-title {
            font-size: 32px;
          }
          .cases-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }
      `}</style>
    </section>
  );
}

function CaseStudyCard({
  study,
  index,
  isGlassBlur,
  onSelect,
  onFocus,
  refSetter,
  isSideways,
}: {
  study: CaseStudyData;
  index: number;
  isGlassBlur: boolean;
  onSelect: () => void;
  onFocus?: () => void;
  refSetter?: (el: HTMLButtonElement | null) => void;
  isSideways?: boolean;
}) {
  const cardRef = useRef<HTMLButtonElement>(null);
  const [transformStyle, setTransformStyle] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((centerY - y) / centerY) * 3;
    const rotateY = ((x - centerX) / centerX) * 3;

    setTransformStyle(`perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.01, 1.01, 1.01)`);
  };

  const handleMouseLeave = () => {
    setTransformStyle('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  };

  const resultsList = resultsData?.results || [];
  let metricText = '';

  if (study.id === 'brand-social') {
    const r = resultsList.find((item) => item.id === 'brands' || item.caseStudy === 'brand-social');
    if (r) {
      metricText = `${r.value} ${r.label}`; // "5 brand campaigns"
    }
  } else if (study.id === 'creativefuel') {
    const r = resultsList.find((item) => item.id === 'icl' || item.caseStudy === 'creativefuel');
    if (r) {
      metricText = r.value; // "401K"
    }
  } else if (study.id === 'strictly-for-corporate') {
    const r = resultsList.find((item) => item.id === 'sfc' || item.caseStudy === 'strictly-for-corporate');
    if (r) {
      metricText = r.value; // "35.3K"
    }
  }

  const baseTitle = study.title.split(' — ')[0];

  return (
    <button
      ref={(el) => {
        (cardRef as any).current = el;
        if (refSetter) refSetter(el);
      }}
      onClick={onSelect}
      onFocus={onFocus}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="case-card glass-fake"
      style={{
        transform: transformStyle,
        height: isSideways ? 'min(68vh, 560px)' : undefined,
      }}
      aria-label={`Open case study: ${study.title}`}
    >
      {/* 1. Top Image Area: Takes remaining height, object-fit contain, #000 behind */}
      <div className="card-image-area">
        {study.heroImage ? (
          <img
            src={study.heroImage}
            alt={study.title}
            loading="lazy"
            decoding="async"
            className="card-contained-img"
          />
        ) : (
          <div className="card-plain-dark-cover">
            <span className="card-plain-title">{baseTitle}</span>
          </div>
        )}
        <div className="card-sheen" />
      </div>

      {/* 2. Bottom Text Panel: Stacked underneath, no overlap */}
      <div className="card-text-panel">
        <div className="card-kicker">{study.kicker}</div>

        <h3 className={`card-title ${study.id === 'brand-social' ? 'card-title-brand' : ''}`}>
          {baseTitle}
          {metricText ? (
            <> · <span className="accent-metric">{metricText}</span></>
          ) : null}
        </h3>

        <p className="card-summary">{study.summary}</p>
      </div>

      <style jsx>{`
        .case-card {
          position: relative;
          width: 100%;
          height: 480px;
          border-radius: 22px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          text-align: left;
          cursor: pointer;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: #0B0A09;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
          transition: transform 0.15s cubic-bezier(0.2, 0, 0.38, 0.9), border-color 0.2s ease, box-shadow 0.2s ease;
          padding: 0;
          outline: none;
          color: inherit;
        }
        .case-card:hover {
          border-color: rgba(255, 255, 255, 0.22);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5);
        }
        .card-image-area {
          position: relative;
          flex: 1;
          min-height: 0;
          width: 100%;
          background: #000;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .card-contained-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: center;
          background: #000;
          display: block;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .case-card:hover .card-contained-img {
          transform: scale(1.03);
        }
        .card-plain-dark-cover {
          width: 100%;
          height: 100%;
          background: #0B0A09;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px;
          text-align: center;
        }
        .card-plain-title {
          font-family: var(--font-main);
          font-size: 24px;
          font-weight: 600;
          letter-spacing: -0.02em;
          color: var(--text);
        }
        .card-sheen {
          position: absolute;
          top: 0;
          left: -120%;
          width: 100%;
          height: 100%;
          background: linear-gradient(120deg, transparent 20%, rgba(255, 255, 255, 0.08) 50%, transparent 80%);
          pointer-events: none;
          z-index: 1;
          transition: transform 0.6s ease;
        }
        .case-card:hover .card-sheen {
          transform: translateX(240%);
        }
        .card-text-panel {
          position: relative;
          width: 100%;
          flex-shrink: 0;
          padding: 18px 24px 20px;
          box-sizing: border-box;
          background: rgba(14, 13, 12, 0.96);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          flex-direction: column;
          gap: 6px;
          z-index: 2;
        }
        .card-kicker {
          font-family: var(--font-main);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--muted);
        }
        .card-title {
          font-family: var(--font-main);
          font-size: 23px;
          font-weight: 500;
          letter-spacing: -0.02em;
          color: var(--text);
          line-height: 1.2;
          margin: 0;
          white-space: nowrap;
          overflow: visible;
        }
        .card-title-brand {
          font-size: 20px;
        }
        .accent-metric {
          color: var(--accent);
          font-weight: 600;
        }
        .card-summary {
          font-family: var(--font-main);
          font-size: 14px;
          color: var(--muted);
          line-height: 1.4;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        @media (max-width: 768px) {
          .case-card {
            height: 380px;
          }
          .card-text-panel {
            padding: 16px 18px 18px;
            gap: 4px;
          }
          .card-title {
            font-size: 19px;
            white-space: normal;
          }
          .card-title-brand {
            font-size: 17px;
          }
          .card-summary {
            font-size: 13px;
          }
        }
      `}</style>
    </button>
  );
}
