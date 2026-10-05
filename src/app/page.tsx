'use client';

import React, { useEffect, useState } from 'react';
import { ZONES } from '@/constants/zones';
import { scrollManager } from '@/store/scrollStore';

export default function HomePage() {
  const [currentZoneIdx, setCurrentZoneIdx] = useState(0);

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
      {/* Fixed HUD Navigation Overlay */}
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
                marginBottom: '0.25rem',
                fontWeight: 600,
              }}
            >
              The Attention Lab
            </div>
            <h1
              style={{
                fontSize: '1.2rem',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: '#ffffff',
              }}
            >
              Jay Rajput
            </h1>
          </div>

          {/* Current Zone Tag */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              background: 'rgba(15, 15, 20, 0.7)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '0.4rem 0.9rem',
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
                boxShadow: '0 0 8px #ff4757',
              }}
            />
            <span
              style={{
                fontSize: '0.75rem',
                color: '#e4e4e7',
                letterSpacing: '0.08em',
                fontWeight: 600,
                textTransform: 'uppercase',
              }}
            >
              {currentZone.label}
            </span>
          </div>
        </header>

        {/* Center Guide / Scroll hint */}
        <div
          style={{
            maxWidth: '520px',
            margin: 'auto 0',
            opacity: currentZoneIdx === 0 ? 1 : 0.4,
            transition: 'opacity 0.4s ease',
            pointerEvents: 'auto',
          }}
        >
          {currentZoneIdx === 0 ? (
            <div>
              <div
                style={{
                  display: 'inline-block',
                  padding: '0.3rem 0.75rem',
                  borderRadius: '4px',
                  background: 'rgba(255, 71, 87, 0.1)',
                  border: '1px solid rgba(255, 71, 87, 0.3)',
                  color: '#ff4757',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: '1rem',
                }}
              >
                Lab Architecture & Camera Path Active
              </div>
              <h2
                style={{
                  fontSize: 'clamp(2rem, 4vw, 3rem)',
                  fontWeight: 800,
                  lineHeight: 1.1,
                  letterSpacing: '-0.03em',
                  marginBottom: '1rem',
                  color: '#ffffff',
                }}
              >
                The Attention Lab
              </h2>
              <p
                style={{
                  color: 'var(--text-muted)',
                  fontSize: '1rem',
                  lineHeight: 1.6,
                }}
              >
                Scroll down to glide through the architectural gallery and explore the 9 marked room zones along the CatmullRom spline path.
              </p>
            </div>
          ) : (
            <div style={{ background: 'rgba(10, 10, 15, 0.6)', backdropFilter: 'blur(8px)', padding: '1rem 1.25rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ fontSize: '0.75rem', color: '#ff4757', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                Zone {currentZoneIdx} of 9
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
                {currentZone.name}
              </div>
            </div>
          )}
        </div>

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
          <div>
            <span>Architectural Studio · 9 Zones Marked</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>Scroll to glide</span>
            <span style={{ fontSize: '0.9rem' }}>↓</span>
          </div>
        </footer>
      </div>

      {/* Invisible scroll track checkpoints for Lenis scroll */}
      {ZONES.map((zone, idx) => (
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
