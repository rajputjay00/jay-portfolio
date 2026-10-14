'use client';

import React from 'react';
import profileData from '@/../content/profile.json';
import resultsData from '@/../content/results.json';
import OpeningOverlay from '@/components/ui/OpeningOverlay';
import DevPerfPanel from '@/components/dev/DevPerfPanel';
import DevDummyBadge from '@/components/dev/DevDummyBadge';
import ProofSection from '@/components/sections/ProofSection';
import CaseStudiesSection from '@/components/sections/CaseStudiesSection';
import StatementInterlude from '@/components/sections/StatementInterlude';
import RetentionTheatreSection from '@/components/sections/RetentionTheatreSection';
import RangeWallSection from '@/components/sections/RangeWallSection';
import HookMachineSection from '@/components/sections/HookMachineSection';
import WouldYouStopSection from '@/components/sections/WouldYouStopSection';
import BeforeAfterSection from '@/components/sections/BeforeAfterSection';
import AboutAndServicesSection from '@/components/sections/AboutAndServicesSection';
import MessageMeSection from '@/components/sections/MessageMeSection';
import ScrollProgressLine from '@/components/ui/ScrollProgressLine';
import FloatingMenuPill from '@/components/ui/FloatingMenuPill';
import ViewCursor from '@/components/ui/ViewCursor';
import Toast from '@/components/ui/Toast';
import EasterEggHearts from '@/components/ui/EasterEggHearts';
import ExitStopOverlay from '@/components/ui/ExitStopOverlay';
import { openingStore } from '@/store/openingStore';
import { perfStore } from '@/store/perfStore';
import { scrollManager } from '@/store/scrollStore';
import {
  heroScrollProgress,
  feedDragState,
  startFeedDrag,
  updateFeedDrag,
  endFeedDrag,
  subscribeFeedDrag,
} from '@/store/pointerStore';

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
  const [mounted, setMounted] = React.useState(false);
  const [chipVisible, setChipVisible] = React.useState(false);
  const [hasDragged, setHasDragged] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const dragHint = (profileData as any).dragHint || "Drag the feed";

  React.useEffect(() => {
    if (!heroVisible) return;
    const timer = setTimeout(() => {
      setChipVisible(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, [heroVisible]);

  React.useEffect(() => {
    return subscribeFeedDrag(() => {
      if (feedDragState.hasDragged) {
        setHasDragged(true);
      }
      setIsDragging(feedDragState.isDragging);
    });
  }, []);

  const handleDragPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (e.button !== 0) return;

    const target = e.target as HTMLElement;
    if (target.closest('a, button, input, textarea, .hero-numbers-card, .hero-author-block, .hero-headline, .hero-label-pill')) {
      return;
    }

    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    startFeedDrag(e.clientY);
    setIsDragging(true);
    setHasDragged(true);
    document.body.style.userSelect = 'none';
  };

  const handleDragPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!feedDragState.isDragging) return;
    updateFeedDrag(e.clientY, window.innerHeight);
  };

  const handleDragPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!feedDragState.isDragging) return;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    endFeedDrag();
    setIsDragging(false);
    document.body.style.userSelect = '';
  };

  // Extract statement interlude texts from profile.json
  const interlude1Text = profileData.about?.philosophy || "Attention is earned in the first second and kept by every second after.";
  const shortBioSentences = (profileData.shortBio || '').split(/(?<=\.)\s+/);
  const interlude2Text = shortBioSentences[1] || "I turn ideas into content people stop scrolling for.";

  React.useEffect(() => {
    setMounted(true);
    const isIntroRequested = typeof window !== 'undefined'
      ? (new URLSearchParams(window.location.search).get('intro') === '1' || openingStore.isIntro())
      : false;

    if (isIntroRequested && openingStore.getStep() !== 'completed') {
      setHeroVisible(false);
    } else {
      setHeroVisible(true);
    }

    const unsubOpening = openingStore.subscribe((s) => {
      if (s === 'completed') {
        setHeroVisible(true);
      } else if (s === 'screen_1') {
        setHeroVisible(false);
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
        scrub: 0.5,
        onUpdate: (self) => {
          heroScrollProgress.value = self.progress;
          if (!document.querySelector('.hero-content')) return;
          const y = self.progress * -80;
          const op = Math.max(0, 1 - self.progress * 3.0);
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
      {/* 0. Accessible Skip to content link */}
      <a href="#hero" className="skip-to-content-link">
        Skip to content
      </a>

      {/* 1. Scroll Progress Line Fixed at Top */}
      <ScrollProgressLine />

      {/* 2. Floating Menu Pill */}
      <FloatingMenuPill />

      {/* 3. View Cursor on Pointer Devices */}
      <ViewCursor />

      {/* 4. Global Toast Alerts */}
      <Toast />

      {/* 5. Easter Egg Hearts on L Key */}
      <EasterEggHearts />

      {/* 6. Exit Intent Stop Overlay */}
      <ExitStopOverlay />

      {/* Dev-Only Fixed Replay Intro Button at Top Left */}
      {process.env.NODE_ENV === 'development' && mounted && isDebug && (
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
            transition: mounted && openingStore.isIntro() ? 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
            pointerEvents: heroVisible ? 'auto' : 'none',
          }}
        >
          {/* Text Block with Scrim on mobile */}
          <div className="hero-text-block">
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
          </div>

          {/* d. Numbers Card */}
          <div className={`hero-numbers-card ${isGlassBlur && isDesktop ? 'glass-real' : 'glass-fake'}`}>
            <div className="number-col">
              <span className="number-val">{resultsMap.icl?.value || ''}</span>
              <span className="number-lbl">{resultsMap.icl?.account || ''}</span>
            </div>
            <div className="number-divider" />
            <div className="number-col">
              <span className="number-val">{resultsMap['sfc-top-reel']?.value || ''}</span>
              <span className="number-lbl">{resultsMap['sfc-top-reel']?.label || ''}</span>
            </div>
            <div className="number-divider" />
            <div className="number-col">
              <span className="number-val">{resultsMap.brands?.value || ''}</span>
              <span className="number-lbl">{resultsMap.brands?.label || ''}</span>
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

        {/* Draggable Hero Feed overlay zone (desktop fine pointers only) */}
        <div
          className={`hero-feed-drag-zone ${isDragging ? 'is-dragging' : ''}`}
          onPointerDown={handleDragPointerDown}
          onPointerMove={handleDragPointerMove}
          onPointerUp={handleDragPointerUp}
          onPointerCancel={handleDragPointerUp}
          aria-hidden="true"
        />

        {/* Glass chip near the wall: fades in 1.5s after hero is ready, fades out for good after first drag */}
        <div
          className={`hero-drag-chip glass-real ${chipVisible && !hasDragged ? 'chip-visible' : ''}`}
          aria-hidden="true"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.85 }}>
            <polyline points="7 15 12 20 17 15"></polyline>
            <polyline points="7 9 12 4 17 9"></polyline>
          </svg>
          <span>{dragHint}</span>
        </div>
      </section>

      {/* 03: PROOF SECTION */}
      <ProofSection />

      {/* 04: CASE STUDIES SECTION */}
      <CaseStudiesSection />

      {/* SCENE 3: STATEMENT INTERLUDE 1 */}
      <StatementInterlude id="interlude-1" text={interlude1Text} />

      {/* 05: RETENTION THEATRE */}
      <RetentionTheatreSection />

      {/* 06: RANGE WALL */}
      <RangeWallSection />

      {/* SCENE 3: STATEMENT INTERLUDE 2 */}
      <StatementInterlude id="interlude-2" text={interlude2Text} />

      {/* 07: HOOK MACHINE */}
      <HookMachineSection />

      {/* 08: WOULD YOU STOP? */}
      <WouldYouStopSection />

      {/* 09: BEFORE / AFTER */}
      <BeforeAfterSection />

      {/* 10: ABOUT AND SERVICES */}
      <AboutAndServicesSection />

      {/* 11: MESSAGE ME */}
      <MessageMeSection />
    </div>
  );
}
