'use client';

export interface PointerState {
  hasPointer: boolean;
  x: number; // normalized -1 to +1
  y: number; // normalized -1 to +1
  isTouch: boolean;
  isHeroInView: boolean;
}

export const windowPointerState: PointerState = {
  hasPointer: false,
  x: -999,
  y: -999,
  isTouch: false,
  isHeroInView: true,
};

export const heroScrollProgress = {
  value: 0,
};

let isInitialized = false;

export function initWindowPointerListener() {
  if (typeof window === 'undefined' || isInitialized) return;
  isInitialized = true;

  const onPointerMove = (e: PointerEvent) => {
    if (!windowPointerState.isHeroInView) return;
    windowPointerState.hasPointer = true;
    windowPointerState.isTouch = e.pointerType === 'touch';
    windowPointerState.x = (e.clientX / window.innerWidth) * 2 - 1;
    windowPointerState.y = -(e.clientY / window.innerHeight) * 2 + 1;
  };

  const onPointerLeave = () => {
    windowPointerState.hasPointer = false;
    windowPointerState.x = -999;
    windowPointerState.y = -999;
  };

  const onTouchEnd = () => {
    windowPointerState.hasPointer = false;
    windowPointerState.x = -999;
    windowPointerState.y = -999;
  };

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  document.addEventListener('mouseleave', onPointerLeave, { passive: true });
  window.addEventListener('touchend', onTouchEnd, { passive: true });
  window.addEventListener('touchcancel', onTouchEnd, { passive: true });
}

export function setHeroInView(inView: boolean) {
  windowPointerState.isHeroInView = inView;
  if (!inView) {
    windowPointerState.hasPointer = false;
    windowPointerState.x = -999;
    windowPointerState.y = -999;
  }
}
