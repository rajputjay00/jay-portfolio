'use client';

import React, { useEffect, useState } from 'react';
import { ZONES } from '@/constants/zones';
import { scrollManager } from '@/store/scrollStore';
import OpeningOverlay from '@/components/ui/OpeningOverlay';
import DevPerfPanel from '@/components/dev/DevPerfPanel';

export default function HomePage() {
  const [currentZoneIdx, setCurrentZoneIdx] = useState(0);
  const isDev = process.env.NODE_ENV === 'development';

  useEffect(() => {
    return scrollManager.subscribe((progress) => {
      let closestIdx = 0;
      let minDiff = Infinity;
      ZONES.forEach((z, idx) => {
        const diff = Math.abs(z.t - progress);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = idx;
        }
      });
      setCurrentZoneIdx(closestIdx);
    });
  }, []);

  const currentZone = ZONES[currentZoneIdx];

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '1000vh' }}>
      {/* Opening Sequence & Clean Identity Layer */}
      <OpeningOverlay />

      {/* Dev-Only Performance Toggle Panel */}
      <DevPerfPanel />

      {/* Minimal Clean HUD Navigation Overlay */}
      <div
        className="interactive"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '2rem 2.5rem',
          pointerEvents: 'none',
          boxSizing: 'border-box',
          zIndex: 20,
        }}
      >
        {/* Top Header */}
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            width: '100%',
            pointerEvents: 'auto',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '0.75rem',
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                fontWeight: 700,
              }}
            >
              The Attention Lab
            </div>
          </div>

          {/* Dev-Only Zone Pill */}
          {isDev && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                background: 'rgba(15, 15, 20, 0.75)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '0.35rem 0.85rem',
                borderRadius: '9999px',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#ff4757',
                  boxShadow: '0 0 6px #ff4757',
                }}
              />
              <span
                style={{
                  fontSize: '0.7rem',
                  color: '#e4e4e7',
                  letterSpacing: '0.08em',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                }}
              >
                {currentZone.label}
              </span>
            </div>
          )}
        </header>

        {/* Footer Info */}
        <footer
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            width: '100%',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            pointerEvents: 'auto',
          }}
        >
          <div />

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>Scroll to explore</span>
            <span style={{ fontSize: '0.9rem' }}>↓</span>
          </div>
        </footer>
      </div>

      {/* Invisible scroll track checkpoints for Lenis scroll */}
      {ZONES.map((zone) => (
        <div
          key={`track-${zone.id}`}
          style={{
            height: '100vh',
            width: '100%',
            pointerEvents: 'none',
          }}
        />
      ))}
    </div>
  );
}
