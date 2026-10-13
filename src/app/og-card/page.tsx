import React from 'react';
import type { Metadata } from 'next';
import shareCardData from '@/../content/share-card.json';
import profileData from '@/../content/profile.json';
import resultsData from '@/../content/results.json';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function OgCardPage() {
  const images = shareCardData.images || [];
  const resultsList = resultsData?.results || [];
  
  // Same three stats the hero card shows: icl, sfc-top-reel, brands
  const resultsMap: Record<string, { value: string; label?: string; account?: string }> = {};
  resultsList.forEach((item) => {
    resultsMap[item.id] = item;
  });

  const stats = [
    {
      value: resultsMap.icl?.value || '401K',
      label: resultsMap.icl?.label || 'followers',
    },
    {
      value: resultsMap['sfc-top-reel']?.value || '21.2M',
      label: resultsMap['sfc-top-reel']?.label || 'views on one Reel',
    },
    {
      value: resultsMap.brands?.value || '5',
      label: resultsMap.brands?.label || 'brand campaigns',
    },
  ];

  // 7 columns, 4 cards per column
  const cols = 7;
  const rows = 4;
  const colStep = 190;
  const rowStep = 232;
  const startX = -40;

  const cardItems: Array<{
    id: string;
    x: number;
    y: number;
    src: string;
  }> = [];

  for (let c = 0; c < cols; c++) {
    const x = startX + c * colStep;
    // Odd columns (1, 3, 5, 7 - 0-indexed: 0, 2, 4, 6) start at y = -120; even columns (2, 4, 6 - indices 1, 3, 5) start at y = -20
    const startY = (c + 1) % 2 !== 0 ? -120 : -20;
    for (let r = 0; r < rows; r++) {
      const y = startY + r * rowStep;
      // Cycle through images so neighbours differ
      const imgIdx = (c * 2 + r) % images.length;
      const imgKey = images[imgIdx];
      cardItems.push({
        id: `card-${c}-${r}`,
        x,
        y,
        src: `/media/images/${imgKey}.jpg`,
      });
    }
  }

  return (
    <div
      style={{
        width: '100vw',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0B0A09',
        margin: 0,
        padding: 0,
      }}
    >
      <style>{`
        /* Hide global overlays on og-card */
        .btn-replay,
        .dev-dummy-badge,
        .dev-fps-counter,
        .floating-menu-pill,
        .view-cursor-dot,
        .scroll-progress-line {
          display: none !important;
        }
      `}</style>

      {/* Fixed 1200x630 Card */}
      <div
        id="og-card"
        style={{
          width: '1200px',
          height: '630px',
          position: 'relative',
          overflow: 'hidden',
          background: '#0B0A09',
          color: '#F5EFE6',
          fontFamily: 'var(--font-inter-tight), sans-serif',
          flexShrink: 0,
        }}
      >
        {/* a) Backdrop Feed: 1200x630 layer filled with cards */}
        <div
          style={{
            position: 'absolute',
            width: '1200px',
            height: '630px',
            left: 0,
            top: 0,
            opacity: 0.8,
            filter: 'blur(2px)',
            transform: 'rotate(-7deg) scale(1.25)',
            transformOrigin: 'center center',
            pointerEvents: 'none',
          }}
        >
          {cardItems.map((item) => (
            <div
              key={item.id}
              style={{
                position: 'absolute',
                left: `${item.x}px`,
                top: `${item.y}px`,
                width: '170px',
                height: '212px',
                borderRadius: '14px',
                overflow: 'hidden',
                background: '#141211',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <img
                src={item.src}
                alt=""
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </div>
          ))}
        </div>

        {/* b) Radial gradient overlay layer */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse at center, rgba(11,10,9,0.35) 0%, rgba(11,10,9,0.78) 80%)',
            pointerEvents: 'none',
          }}
        />

        {/* c) Soft accent glow behind the centre */}
        <div
          style={{
            position: 'absolute',
            left: '250px',
            top: '60px',
            width: '700px',
            height: '500px',
            background:
              'radial-gradient(closest-side, rgba(255,90,43,0.28), rgba(255,90,43,0))',
            pointerEvents: 'none',
          }}
        />

        {/* d) The Notification Panel */}
        <div
          style={{
            position: 'absolute',
            left: '170px',
            top: '112px',
            width: '860px',
            padding: '34px 40px 36px',
            borderRadius: '36px',
            background: 'rgba(20,18,17,0.78)',
            border: '1px solid rgba(255,255,255,0.18)',
            boxShadow:
              'inset 0 1px 0 rgba(255,255,255,0.22), 0 40px 100px rgba(0,0,0,0.6)',
            backdropFilter: 'blur(22px) saturate(150%)',
            WebkitBackdropFilter: 'blur(22px) saturate(150%)',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Top Row: Icon + Label + Time */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: '#FF5A2B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {/* Dark pause icon (two vertical bars) */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#0B0A09">
                  <rect x="6" y="4" width="4" height="16" rx="1.5" />
                  <rect x="14" y="4" width="4" height="16" rx="1.5" />
                </svg>
              </div>
              <span
                style={{
                  fontSize: '17px',
                  fontWeight: 600,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: '#F5EFE6',
                }}
              >
                {shareCardData.label}
              </span>
            </div>
            <span
              style={{
                fontSize: '17px',
                color: '#A8A197',
                fontWeight: 400,
              }}
            >
              {shareCardData.time}
            </span>
          </div>

          {/* Headline: margin-top 26px, two lines, line-height 1 */}
          <div style={{ marginTop: '26px', lineHeight: 1 }}>
            <div
              style={{
                fontFamily: 'var(--font-inter-tight)',
                fontSize: '68px',
                fontWeight: 600,
                letterSpacing: '-0.04em',
                color: '#F5EFE6',
                lineHeight: 1,
              }}
            >
              {shareCardData.headlineTop}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-instrument-serif)',
                fontStyle: 'italic',
                fontSize: '80px',
                fontWeight: 400,
                color: '#F5EFE6',
                lineHeight: 1,
                marginTop: '4px',
              }}
            >
              {shareCardData.headlineBottom}
              <span style={{ color: '#FF5A2B', fontStyle: 'normal' }}>.</span>
            </div>
          </div>

          {/* Subline: margin-top 16px, 26px, colour #D9D2C7 */}
          <div
            style={{
              marginTop: '16px',
              fontSize: '26px',
              color: '#D9D2C7',
              lineHeight: 1.3,
            }}
          >
            {shareCardData.line}{' '}
            <span style={{ fontWeight: 600, color: '#F5EFE6' }}>
              {profileData.name}
            </span>
            , {profileData.title}.
          </div>

          {/* Three Stats: margin-top 28px, padding-top 26px, border-top 1px solid rgba(255,255,255,0.14) */}
          <div
            style={{
              marginTop: '28px',
              paddingTop: '26px',
              borderTop: '1px solid rgba(255,255,255,0.14)',
              display: 'flex',
              alignItems: 'center',
              gap: '34px',
            }}
          >
            {stats.map((stat, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && (
                  <div
                    style={{
                      width: '1px',
                      height: '46px',
                      background: 'rgba(255,255,255,0.14)',
                      flexShrink: 0,
                    }}
                  />
                )}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '44px',
                      fontWeight: 600,
                      letterSpacing: '-0.03em',
                      color: '#F5EFE6',
                      lineHeight: 1,
                    }}
                  >
                    {stat.value}
                  </span>
                  <span
                    style={{
                      fontSize: '17px',
                      color: '#A8A197',
                      fontWeight: 400,
                      lineHeight: 1.2,
                    }}
                  >
                    {stat.label}
                  </span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
