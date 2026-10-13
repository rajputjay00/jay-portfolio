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

export interface FeedDragState {
  isDragging: boolean;
  hasDragged: boolean;
  dragDeltaY: number;            // world units to move feed this frame
  throwVelocity: number;         // world units / second at release
  frictionTimeRemaining: number; // remaining seconds of 1.2s friction ease
  frictionElapsed: number;       // elapsed seconds in friction ease
  trackedVelocity: number;       // instantaneous smoothed velocity (world units/s)
  lastClientY: number;
  lastTimestamp: number;
  subscribers: Set<() => void>;
}

export const feedDragState: FeedDragState = {
  isDragging: false,
  hasDragged: false,
  dragDeltaY: 0,
  throwVelocity: 0,
  frictionTimeRemaining: 0,
  frictionElapsed: 0,
  trackedVelocity: 0,
  lastClientY: 0,
  lastTimestamp: 0,
  subscribers: new Set(),
};

export function subscribeFeedDrag(cb: () => void) {
  feedDragState.subscribers.add(cb);
  return () => {
    feedDragState.subscribers.delete(cb);
  };
}

function notifyFeedDrag() {
  feedDragState.subscribers.forEach((cb) => {
    try {
      cb();
    } catch {
      // safe fallback
    }
  });
}

export function startFeedDrag(clientY: number) {
  feedDragState.isDragging = true;
  feedDragState.hasDragged = true;
  feedDragState.frictionTimeRemaining = 0;
  feedDragState.frictionElapsed = 0;
  feedDragState.throwVelocity = 0;
  feedDragState.trackedVelocity = 0;
  feedDragState.dragDeltaY = 0;
  feedDragState.lastClientY = clientY;
  feedDragState.lastTimestamp = typeof performance !== 'undefined' ? performance.now() : Date.now();
  notifyFeedDrag();
}

export function updateFeedDrag(clientY: number, windowHeight: number) {
  if (!feedDragState.isDragging) return;
  const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const dt = Math.max(0.001, (now - feedDragState.lastTimestamp) / 1000);
  const dyPx = clientY - feedDragState.lastClientY;

  // Camera fov 45 deg at z = 5: world height = 2 * tan(22.5 deg) * 5 = 4.14213562
  const worldHeight = 4.14213562;
  const worldUnitsPerPixel = worldHeight / (windowHeight || 705);

  // Vertical movement moves feed 1:1 with pointer
  // Mouse UP (dyPx < 0) -> Feed UP (+world units)
  // Mouse DOWN (dyPx > 0) -> Feed DOWN (-world units)
  const dyWorld = -dyPx * worldUnitsPerPixel;
  feedDragState.dragDeltaY += dyWorld;

  const instantVelocity = dyWorld / dt;
  feedDragState.trackedVelocity =
    feedDragState.trackedVelocity + (instantVelocity - feedDragState.trackedVelocity) * 0.4;

  feedDragState.lastClientY = clientY;
  feedDragState.lastTimestamp = now;
}

export function endFeedDrag() {
  if (!feedDragState.isDragging) return;
  feedDragState.isDragging = false;

  const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const timeSinceLastMove = (now - feedDragState.lastTimestamp) / 1000;

  // If user paused (> 80ms) before release, throw velocity decays to zero
  const releaseVel = timeSinceLastMove > 0.08 ? 0 : feedDragState.trackedVelocity;

  // Clamp throw speed to 6x normal speed (normal = 0.32, so 6x = 1.92)
  const maxThrow = 6 * 0.32;
  const clampedVel = Math.max(-maxThrow, Math.min(maxThrow, releaseVel));

  feedDragState.throwVelocity = clampedVel;
  feedDragState.frictionTimeRemaining = 1.2; // ease back over 1.2s
  feedDragState.frictionElapsed = 0;
  feedDragState.dragDeltaY = 0;

  notifyFeedDrag();
}

export function cancelFeedDragOnWheel() {
  if (feedDragState.isDragging) {
    feedDragState.isDragging = false;
    feedDragState.frictionTimeRemaining = 0;
    feedDragState.frictionElapsed = 0;
    feedDragState.dragDeltaY = 0;
    feedDragState.throwVelocity = 0;
    notifyFeedDrag();
  }
}

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

  const onWheel = () => {
    cancelFeedDragOnWheel();
  };

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  document.addEventListener('mouseleave', onPointerLeave, { passive: true });
  window.addEventListener('touchend', onTouchEnd, { passive: true });
  window.addEventListener('touchcancel', onTouchEnd, { passive: true });
  window.addEventListener('wheel', onWheel, { passive: true });
}

export function setHeroInView(inView: boolean) {
  windowPointerState.isHeroInView = inView;
  if (!inView) {
    windowPointerState.hasPointer = false;
    windowPointerState.x = -999;
    windowPointerState.y = -999;
    cancelFeedDragOnWheel();
  }
}
