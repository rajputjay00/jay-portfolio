'use client';

import React, { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { scrollManager } from '@/store/scrollStore';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.8,
      infinite: false,
    });

    scrollManager.lenisInstance = lenis;

    lenis.on('scroll', (e: any) => {
      ScrollTrigger.update();
      if (typeof e.progress === 'number') {
        scrollManager.setProgress(e.progress);
      }
    });

    const updateLenis = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateLenis);
    gsap.ticker.lagSmoothing(0);

    // 1. Pointer highlight on .glass-fake and .glass-real (rAF-throttled, no React state)
    let pointerRaf = 0;
    const onPointerMove = (e: PointerEvent) => {
      cancelAnimationFrame(pointerRaf);
      pointerRaf = requestAnimationFrame(() => {
        const target = (e.target as HTMLElement)?.closest('.glass-fake, .glass-real') as HTMLElement;
        if (target) {
          const rect = target.getBoundingClientRect();
          target.style.setProperty('--mx', `${e.clientX - rect.left}px`);
          target.style.setProperty('--my', `${e.clientY - rect.top}px`);
        }
      });
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    // 2. Magnetic Buttons (max 6px follow, disabled on touch/reduced-motion)
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const buttonCleanups: (() => void)[] = [];

    if (!isTouch && !prefersReduced) {
      const attachMagnetic = () => {
        const buttons = document.querySelectorAll<HTMLElement>('.btn-accent, .btn-glass, .reply-btn, .chat-send-btn');
        buttons.forEach((btn) => {
          let bRaf = 0;
          const onMove = (e: MouseEvent) => {
            cancelAnimationFrame(bRaf);
            bRaf = requestAnimationFrame(() => {
              const rect = btn.getBoundingClientRect();
              const centerX = rect.left + rect.width / 2;
              const centerY = rect.top + rect.height / 2;
              const deltaX = (e.clientX - centerX) / (rect.width / 2);
              const deltaY = (e.clientY - centerY) / (rect.height / 2);
              const moveX = Math.max(-6, Math.min(6, deltaX * 6));
              const moveY = Math.max(-6, Math.min(6, deltaY * 6));
              btn.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
            });
          };
          const onLeave = () => {
            cancelAnimationFrame(bRaf);
            btn.style.transform = 'translate3d(0, 0, 0)';
          };
          btn.addEventListener('mousemove', onMove, { passive: true });
          btn.addEventListener('mouseleave', onLeave, { passive: true });
          buttonCleanups.push(() => {
            btn.removeEventListener('mousemove', onMove);
            btn.removeEventListener('mouseleave', onLeave);
          });
        });
      };
      // Initial attach
      attachMagnetic();
    }

    return () => {
      gsap.ticker.remove(updateLenis);
      cancelAnimationFrame(pointerRaf);
      window.removeEventListener('pointermove', onPointerMove);
      buttonCleanups.forEach((c) => c());
      lenis.destroy();
      scrollManager.lenisInstance = null;
    };
  }, []);

  return <>{children}</>;
}
