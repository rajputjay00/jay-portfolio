'use client';

import React, { useEffect, useState } from 'react';
import { perfStore } from '@/store/perfStore';

export default function DevDummyBadge() {
  const [mounted, setMounted] = useState(false);
  const [isDebug, setIsDebug] = useState(perfStore.getSettings().debug);

  useEffect(() => {
    setMounted(true);
    return perfStore.subscribe((s) => setIsDebug(s.debug));
  }, []);

  if (!mounted || !isDebug || process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div
      className="dev-dummy-badge"
      style={{
        position: 'fixed',
        top: '1.25rem',
        right: '1.25rem',
        zIndex: 99999,
        background: 'rgba(255, 90, 43, 0.12)',
        border: '1px solid rgba(255, 90, 43, 0.4)',
        backdropFilter: 'blur(8px)',
        color: '#FF5A2B',
        fontFamily: 'var(--font-main)',
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        padding: '0.35rem 0.75rem',
        borderRadius: '9999px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
        pointerEvents: 'none',
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: '#FF5A2B',
          display: 'inline-block',
          boxShadow: '0 0 6px #FF5A2B',
        }}
      />
      DUMMY CONTENT
    </div>
  );
}
