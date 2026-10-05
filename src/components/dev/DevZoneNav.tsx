'use client';

import React, { useState, useEffect } from 'react';
import { ZONES } from '@/constants/zones';
import { scrollManager } from '@/store/scrollStore';

export default function DevZoneNav() {
  const [activeZone, setActiveZone] = useState<string>('opening');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    return scrollManager.subscribe((progress) => {
      // Find closest zone
      let closest = ZONES[0];
      let minDiff = Infinity;
      ZONES.forEach((z) => {
        const diff = Math.abs(z.t - progress);
        if (diff < minDiff) {
          minDiff = diff;
          closest = z;
        }
      });
      setActiveZone(closest.id);
    });
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const handleJump = (t: number) => {
    scrollManager.scrollToProgress(t, 1.2);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        zIndex: 99999,
        fontFamily: 'var(--font-display)',
      }}
    >
      <div
        style={{
          background: 'rgba(10, 10, 15, 0.85)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '0.5rem 0.75rem',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          maxWidth: '320px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            cursor: 'pointer',
          }}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#ff4757',
                boxShadow: '0 0 6px #ff4757',
              }}
            />
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#fff',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              Dev Nav
            </span>
          </div>
          <span style={{ fontSize: '0.7rem', color: '#888' }}>
            {isOpen ? '▲ Hide' : '▼ Jump to Zone'}
          </span>
        </div>

        {isOpen && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.35rem',
              paddingTop: '0.35rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            {ZONES.map((zone) => {
              const isActive = activeZone === zone.id;
              return (
                <button
                  key={zone.id}
                  onClick={() => handleJump(zone.t)}
                  style={{
                    background: isActive
                      ? 'rgba(255, 71, 87, 0.2)'
                      : 'rgba(255, 255, 255, 0.04)',
                    border: `1px solid ${
                      isActive ? 'rgba(255, 71, 87, 0.6)' : 'rgba(255, 255, 255, 0.08)'
                    }`,
                    borderRadius: '6px',
                    color: isActive ? '#ff4757' : '#d4d4d8',
                    padding: '0.35rem 0.5rem',
                    fontSize: '0.7rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    }
                  }}
                >
                  {zone.name}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
