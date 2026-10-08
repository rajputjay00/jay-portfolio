'use client';

import React, { useEffect, useRef } from 'react';

export default function ViewCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isPointerCoarse = window.matchMedia('(pointer: coarse)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isPointerCoarse || !cursorRef.current) return;

    let targetX = -200;
    let targetY = -200;
    let currentX = -200;
    let currentY = -200;
    let targetScale = 0.6;
    let currentScale = 0.6;
    let targetOpacity = 0;
    let currentOpacity = 0;
    let isHovering = false;
    let initialized = false;
    let rafId = 0;

    const onMove = (e: MouseEvent | PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;

      if (!initialized) {
        currentX = targetX;
        currentY = targetY;
        initialized = true;
      }

      const target = e.target as HTMLElement | null;
      const card = target && typeof target.closest === 'function' ? target.closest('.case-card, [data-cursor="view"]') : null;
      const isModalOpen = !!document.querySelector('.story-viewer-dialog, .reader-overlay');

      if (card && !isModalOpen) {
        isHovering = true;
        targetScale = 1;
        targetOpacity = 1;
      } else {
        isHovering = false;
        targetScale = 0.6;
        targetOpacity = 0;
      }
    };

    const updateLoop = () => {
      if (prefersReducedMotion) {
        currentX = targetX;
        currentY = targetY;
        currentScale = targetScale;
        currentOpacity = targetOpacity;
      } else {
        // Short lerp ease
        currentX += (targetX - currentX) * 0.25;
        currentY += (targetY - currentY) * 0.25;
        currentScale += (targetScale - currentScale) * 0.25;
        currentOpacity += (targetOpacity - currentOpacity) * 0.3;
      }

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${currentX - 48}px, ${currentY - 48}px, 0) scale(${currentScale.toFixed(3)})`;
        cursorRef.current.style.opacity = currentOpacity.toFixed(3);
      }

      rafId = requestAnimationFrame(updateLoop);
    };

    window.addEventListener('pointermove', onMove, { passive: true, capture: true });
    window.addEventListener('mousemove', onMove, { passive: true, capture: true });
    rafId = requestAnimationFrame(updateLoop);

    return () => {
      window.removeEventListener('pointermove', onMove, { capture: true });
      window.removeEventListener('mousemove', onMove, { capture: true });
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      id="view-cursor"
      ref={cursorRef}
      aria-hidden="true"
      className="view-cursor-follow"
    >
      <span>View</span>

      <style jsx>{`
        .view-cursor-follow {
          position: fixed;
          top: 0;
          left: 0;
          width: 96px;
          height: 96px;
          border-radius: 50%;
          background: var(--accent);
          color: var(--bg);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-main);
          font-weight: 600;
          font-size: 16px;
          letter-spacing: -0.01em;
          pointer-events: none;
          z-index: 9999;
          opacity: 0;
          transform: translate3d(-200px, -200px, 0) scale(0.6);
          will-change: transform, opacity;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
        }

        @media (pointer: coarse) {
          .view-cursor-follow {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
