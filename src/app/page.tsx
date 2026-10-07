'use client';

import React from 'react';
import profileData from '@/../content/profile.json';
import resultsData from '@/../content/results.json';
import OpeningOverlay from '@/components/ui/OpeningOverlay';
import DevPerfPanel from '@/components/dev/DevPerfPanel';
import { openingStore } from '@/store/openingStore';

export default function HomePage() {
  const { name, title, tags, hero, shortBio } = profileData;
  const [heroVisible, setHeroVisible] = React.useState(true);

  React.useEffect(() => {
    setHeroVisible(openingStore.isSeen());
    const unsub = openingStore.subscribe((s) => {
      if (s === 'completed') {
        setHeroVisible(true);
      } else if (s === 'screen_1') {
        setHeroVisible(false);
      }
    });
    return unsub;
  }, []);

  // First sentence of short bio from profile.json
  const bioFirstSentence = shortBio
    ? shortBio.split('.')[0] + '.'
    : 'Social Media Manager focused on Instagram, content, strategy and growth.';

  // Only entries with verified: true in results.json
  const verifiedResults = (resultsData?.results || []).filter(
    (item) => item.verified === true
  );

  const handleSmoothScroll = (targetId: string) => {
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', background: 'transparent' }}>
      {/* Opening Sequence Overlay */}
      <OpeningOverlay />

      {/* Dev-Only Performance Toggle & Benchmark Panel */}
      {heroVisible && <DevPerfPanel />}

      {/* 01 & 02: HERO SECTION ("THE FEED THAT STOPS") */}
      <section id="hero" className="hero-section">
        {/* Left Block (HTML ~45% width, non-overlapping with 3D Feed on the right) */}
        <div
          className="hero-content"
          style={{
            opacity: heroVisible ? 1 : 0,
            transition: 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            pointerEvents: heroVisible ? 'auto' : 'none',
          }}
        >
          <div className="hero-label">The Attention Lab</div>

          <h1 className="hero-headline">{hero}</h1>

          <div className="hero-author-row">
            <span className="hero-name">{name}</span>
            <span style={{ color: 'var(--text-muted)' }}>—</span>
            <span className="hero-title">{title}</span>
          </div>

          <div className="hero-roles">{tags.join(' · ')}</div>

          <p className="hero-bio">{bioFirstSentence}</p>

          {/* Proof Row: Verified metrics only from results.json */}
          <div className="hero-proof-row">
            {verifiedResults.map((result) => (
              <div key={result.id} className="hero-proof-item">
                <span className="hero-proof-value">{result.value}</span>
                <span className="hero-proof-label">{result.label}</span>
              </div>
            ))}
          </div>

          {/* Action CTAs */}
          <div className="hero-actions">
            <a
              href="#case-studies"
              onClick={(e) => {
                e.preventDefault();
                handleSmoothScroll('case-studies');
              }}
              className="btn-primary"
            >
              <span>See my work</span>
              <span style={{ fontSize: '1.1rem' }}>↓</span>
            </a>

            <a
              href="#dm"
              onClick={(e) => {
                e.preventDefault();
                handleSmoothScroll('dm');
              }}
              className="btn-secondary"
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
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#71717a',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '9999px',
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  marginLeft: '0.5rem',
                }}
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
