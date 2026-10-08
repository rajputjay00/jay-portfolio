'use client';

import React from 'react';
import profileData from '@/../content/profile.json';
import resultsData from '@/../content/results.json';
import OpeningOverlay from '@/components/ui/OpeningOverlay';
import DevPerfPanel from '@/components/dev/DevPerfPanel';
import DevDummyBadge from '@/components/dev/DevDummyBadge';
import ProofSection from '@/components/sections/ProofSection';
import CaseStudiesSection from '@/components/sections/CaseStudiesSection';
import RetentionTheatreSection from '@/components/sections/RetentionTheatreSection';
import RangeWallSection from '@/components/sections/RangeWallSection';
import AboutAndServicesSection from '@/components/sections/AboutAndServicesSection';
import MessageMeSection from '@/components/sections/MessageMeSection';
import { openingStore } from '@/store/openingStore';
import { perfStore } from '@/store/perfStore';
import { scrollManager } from '@/store/scrollStore';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function HomePage() {
  const { name, title, tags } = profileData;
  const [isGlassBlur, setIsGlassBlur] = React.useState(perfStore.getSettings().glassBlur);
  const [isDebug, setIsDebug] = React.useState(perfStore.getSettings().debug);
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
      setIsDebug(s.debug);
    });

    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let heroTrigger: ScrollTrigger | null = null;
    if (!prefersReducedMotion) {
      heroTrigger = ScrollTrigger.create({
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
        onUpdate: (self) => {
          if (!document.querySelector('.hero-content')) return;
          const y = self.progress * -36;
          const op = Math.max(0, 1 - self.progress * 1.4);
          gsap.set('.hero-content', { y, opacity: op });
        },
      });
    }

    return () => {
      unsubOpening();
      unsubPerf();
      clearTimeout(fallbackTimer);
      window.removeEventListener('resize', checkDesktop);
      heroTrigger?.kill();
    };
  }, []);

  const resultsList = resultsData?.results || [];
  const resultsMap: Record<string, { value: string; account?: string; label?: string }> = {};
  resultsList.forEach((item) => {
    resultsMap[item.id] = item;
  });

  const handleSmoothScroll = (targetId: string) => {
    if (scrollManager.lenisInstance) {
      scrollManager.lenisInstance.scrollTo(`#${targetId}`);
    } else {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', background: 'transparent' }}>
      {/* Dev-Only Fixed Replay Intro Button at Top Left */}
      {process.env.NODE_ENV === 'development' && isDebug && (
        <button
          onClick={() => {
            openingStore.resetSeen();
          }}
          title="Replay opening sequence"
          style={{
            position: 'fixed',
            top: '1.25rem',
            left: '1.25rem',
            zIndex: 99999,
            cursor: 'pointer',
          }}
          className="btn-replay glass-fake"
        >
          ↻ Replay Intro
        </button>
      )}

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
              href="#work"
              onClick={(e) => {
                e.preventDefault();
                handleSmoothScroll('work');
              }}
              className="btn-accent"
            >
              See my work
            </a>

            <a
              href="#message"
              onClick={(e) => {
                e.preventDefault();
                handleSmoothScroll('message');
              }}
              className="btn-glass glass-fake"
            >
              Message me
            </a>
          </div>
        </div>
      </section>

      {/* 03: PROOF SECTION */}
      <ProofSection />

      {/* 04: CASE STUDIES SECTION */}
      <CaseStudiesSection />

      {/* 05: RETENTION THEATRE */}
      <RetentionTheatreSection />

      {/* 06: RANGE WALL */}
      <RangeWallSection />

      {/* 07: ABOUT AND SERVICES */}
      <AboutAndServicesSection />

      {/* 08: MESSAGE ME */}
      <MessageMeSection />
    </div>
  );
}
