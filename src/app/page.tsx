'use client';

import React from 'react';
import profileData from '@/../content/profile.json';
import resultsData from '@/../content/results.json';
import OpeningOverlay from '@/components/ui/OpeningOverlay';
import DevPerfPanel from '@/components/dev/DevPerfPanel';
import DevDummyBadge from '@/components/dev/DevDummyBadge';
import { openingStore } from '@/store/openingStore';
import { perfStore } from '@/store/perfStore';

export default function HomePage() {
  const { name, title, tags } = profileData;
  const [isGlassBlur, setIsGlassBlur] = React.useState(perfStore.getSettings().glassBlur);
  const [isDesktop, setIsDesktop] = React.useState(true);
  const [heroVisible, setHeroVisible] = React.useState(true);

  React.useEffect(() => {
    if (!openingStore.isSeen()) {
      setHeroVisible(false);
    }

    const unsubOpening = openingStore.subscribe((s) => {
      if (s === 'completed') {
        setHeroVisible(true);
      }
    });

    const fallbackTimer = setTimeout(() => {
      setHeroVisible(true);
    }, 9000);

    const unsubPerf = perfStore.subscribe((s) => {
      setIsGlassBlur(s.glassBlur);
    });

    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);

    return () => {
      unsubOpening();
      unsubPerf();
      clearTimeout(fallbackTimer);
      window.removeEventListener('resize', checkDesktop);
    };
  }, []);

  const resultsList = resultsData?.results || [];
  const resultsMap: Record<string, { value: string; account?: string; label?: string }> = {};
  resultsList.forEach((item) => {
    resultsMap[item.id] = item;
  });

  const handleSmoothScroll = (targetId: string) => {
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', background: 'transparent' }}>
      {/* Dev-Only Dummy Content Badge */}
      <DevDummyBadge />

      {/* Opening Sequence Overlay */}
      <OpeningOverlay />

      {/* Dev-Only Performance Toggle & Benchmark Panel */}
      <DevPerfPanel />

      {/* 01 & 02: HERO SECTION ("THE FEED THAT STOPS") */}
      <section id="hero" className="hero-section">
        {/* Left Block (HTML ~48% width, non-overlapping with 3D Feed on the right) */}
        <div
          className="hero-content"
          style={{
            opacity: heroVisible ? 1 : 0,
            transition: 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            pointerEvents: heroVisible ? 'auto' : 'none',
          }}
        >
          {/* a. Label pill */}
          <div className="hero-label-pill glass-fake">
            THE ATTENTION LAB
          </div>

          {/* b. Headline */}
          <h1 className="hero-headline">
            <span className="headline-line-1">I make people</span>
            <span className="headline-line-2">
              stop scrolling<span style={{ color: 'var(--accent)' }}>.</span>
            </span>
          </h1>

          {/* c. Name & Roles */}
          <div className="hero-author-block">
            <div className="hero-name">{name}</div>
            <div className="hero-roles-line">
              {title} · {tags.join(' · ')}
            </div>
          </div>

          {/* d. Numbers Card */}
          <div className={`hero-numbers-card ${isGlassBlur && isDesktop ? 'glass-real' : 'glass-fake'}`}>
            <div className="number-col">
              <span className="number-val">{resultsMap.icl?.value || '401K'}</span>
              <span className="number-lbl">{resultsMap.icl?.account || 'Indian Corporate Life'}</span>
            </div>
            <div className="number-divider" />
            <div className="number-col">
              <span className="number-val">{resultsMap.sfc?.value || '39.5K'}</span>
              <span className="number-lbl">{resultsMap.sfc?.account || 'Strictly For Corporate'}</span>
            </div>
            <div className="number-divider" />
            <div className="number-col">
              <span className="number-val">{resultsMap.brands?.value || '5'}</span>
              <span className="number-lbl">brands</span>
            </div>
          </div>

          {/* e. Buttons */}
          <div className="hero-actions">
            <a
              href="#case-studies"
              onClick={(e) => {
                e.preventDefault();
                handleSmoothScroll('case-studies');
              }}
              className="btn-accent"
            >
              See my work
            </a>

            <a
              href="#dm"
              onClick={(e) => {
                e.preventDefault();
                handleSmoothScroll('dm');
              }}
              className="btn-glass glass-fake"
            >
              Message me
            </a>

            {/* Dev Intro Replay button */}
            {process.env.NODE_ENV === 'development' && (
              <button
                onClick={() => {
                  openingStore.resetSeen();
                }}
                title="Replay opening sequence"
                className="btn-replay glass-fake"
              >
                ↻ Replay Intro
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 03: PROOF */}
      <section id="proof" className="skeleton-section">
        <div className="skeleton-header">
          <h2 className="skeleton-title">Proof</h2>
        </div>
      </section>

      {/* 04: CASE STUDIES */}
      <section id="case-studies" className="skeleton-section">
        <div className="skeleton-header">
          <h2 className="skeleton-title">Case studies</h2>
        </div>
      </section>

      {/* 05: RETENTION THEATRE */}
      <section id="retention" className="skeleton-section">
        <div className="skeleton-header">
          <h2 className="skeleton-title">Retention theatre</h2>
        </div>
      </section>

      {/* 06: RANGE WALL */}
      <section id="range" className="skeleton-section">
        <div className="skeleton-header">
          <h2 className="skeleton-title">Range wall</h2>
        </div>
      </section>

      {/* 07: ABOUT AND SERVICES */}
      <section id="about" className="skeleton-section">
        <div className="skeleton-header">
          <h2 className="skeleton-title">About and services</h2>
        </div>
      </section>

      {/* 08: DM ENDING */}
      <section id="dm" className="skeleton-section">
        <div className="skeleton-header">
          <h2 className="skeleton-title">Message me</h2>
        </div>
      </section>
    </div>
  );
}
