'use client';

// Lightweight reactive scroll state manager without external state overhead
type ScrollListener = (progress: number) => void;

class ScrollManager {
  private progress: number = 0;
  private listeners: Set<ScrollListener> = new Set();
  public lenisInstance: any = null;

  getProgress(): number {
    return this.progress;
  }

  setProgress(p: number) {
    this.progress = Math.max(0, Math.min(1, p));
    this.listeners.forEach((listener) => listener(this.progress));
  }

  subscribe(listener: ScrollListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  scrollToProgress(targetProgress: number, duration: number = 1.5) {
    if (this.lenisInstance) {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const targetScroll = targetProgress * scrollHeight;
      this.lenisInstance.scrollTo(targetScroll, { duration });
    } else if (typeof window !== 'undefined') {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo({
        top: targetProgress * scrollHeight,
        behavior: 'smooth',
      });
    }
  }
}

export const scrollManager = new ScrollManager();
