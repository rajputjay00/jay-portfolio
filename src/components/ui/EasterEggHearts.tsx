'use client';

import { useEffect } from 'react';

export default function EasterEggHearts() {
  useEffect(() => {
    let lastTriggerTime = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== 'l') return;

      const activeTag = document.activeElement?.tagName || '';
      if (['INPUT', 'TEXTAREA', 'BUTTON'].includes(activeTag)) return;

      // Check if any modal is active
      if (
        document.querySelector('.reader-modal-backdrop') ||
        document.querySelector('.exit-stop-overlay')
      ) {
        return;
      }

      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) return;

      const now = Date.now();
      if (now - lastTriggerTime < 3000) return;
      lastTriggerTime = now;

      // Spawn ~24 hearts falling from top
      const container = document.createElement('div');
      container.className = 'easter-egg-hearts-layer';
      container.style.cssText = `
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 99998;
        overflow: hidden;
      `;
      document.body.appendChild(container);

      const count = 24;
      for (let i = 0; i < count; i++) {
        const heart = document.createElement('div');
        const size = Math.floor(Math.random() * (56 - 18 + 1)) + 18;
        const leftPercent = Math.random() * 100;
        const delay = Math.random() * 0.4;
        const duration = 1.6 + Math.random() * 0.8;
        const rotation = (Math.random() - 0.5) * 50;

        heart.style.cssText = `
          position: absolute;
          top: -60px;
          left: ${leftPercent}vw;
          width: ${size}px;
          height: ${size}px;
          opacity: 0.9;
          transform: rotate(${rotation}deg);
          animation: heartFall ${duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}s forwards;
        `;
        heart.innerHTML = `
          <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="var(--accent)" stroke="none" style="filter: drop-shadow(0 4px 10px rgba(0,0,0,0.4));">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        `;
        container.appendChild(heart);
      }

      setTimeout(() => {
        container.remove();
      }, 3200);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return null;
}
