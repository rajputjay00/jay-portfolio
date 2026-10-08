'use client';

import React, { useEffect, useRef } from 'react';
import { scrollManager } from '@/store/scrollStore';

export default function ScrollProgressLine() {
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = scrollManager.subscribe((progress) => {
      if (lineRef.current) {
        lineRef.current.style.transform = `scaleX(${progress})`;
      }
    });

    return () => unsub();
  }, []);

  return (
    <div
      id="scroll-progress-line"
      ref={lineRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '3px',
        backgroundColor: 'var(--accent)',
        transformOrigin: '0 50%',
        transform: 'scaleX(0)',
        zIndex: 9999,
        pointerEvents: 'none',
        willChange: 'transform',
      }}
    />
  );
}
