'use client';

export function createDoubleTapHandler(onTrigger: (e: { clientX: number; clientY: number; target: HTMLElement }) => void) {
  let lastTapTime = 0;
  let lastTapX = 0;
  let lastTapY = 0;

  return {
    onDoubleClick: (e: React.MouseEvent<HTMLElement>) => {
      onTrigger({ clientX: e.clientX, clientY: e.clientY, target: e.currentTarget });
    },
    onTouchEnd: (e: React.TouchEvent<HTMLElement>) => {
      const now = Date.now();
      const touch = e.changedTouches[0];
      if (!touch) return;

      const distX = Math.abs(touch.clientX - lastTapX);
      const distY = Math.abs(touch.clientY - lastTapY);

      if (now - lastTapTime < 350 && distX < 30 && distY < 30) {
        onTrigger({ clientX: touch.clientX, clientY: touch.clientY, target: e.currentTarget });
        lastTapTime = 0; // reset
      } else {
        lastTapTime = now;
        lastTapX = touch.clientX;
        lastTapY = touch.clientY;
      }
    },
  };
}

export function triggerHeart(container: HTMLElement, clientX: number, clientY: number) {
  const rect = container.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;

  const heart = document.createElement('div');
  heart.className = 'double-tap-heart-anim';
  heart.style.left = `${x}px`;
  heart.style.top = `${y}px`;
  heart.innerHTML = `<svg width="72" height="72" viewBox="0 0 24 24" fill="var(--accent)" stroke="none" style="filter: drop-shadow(0 4px 12px rgba(0,0,0,0.5));"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;

  container.style.position = container.style.position || 'relative';
  container.appendChild(heart);

  setTimeout(() => {
    heart.remove();
  }, 850);
}
