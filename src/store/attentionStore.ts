'use client';

import { openingStore } from './openingStore';
import { scrollManager } from './scrollStore';

type AttentionTickListener = (seconds: number, formatted: string) => void;

class AttentionStore {
  private seconds: number = 0;
  private timerId: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private maxScrollProgress: number = 0;
  private history: { time: number; unreachedPercent: number }[] = [];
  private listeners: Set<AttentionTickListener> = new Set();
  private frozenMessageTime: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  private init() {
    // Initial data point at 0s
    this.history.push({ time: 0, unreachedPercent: 100 });

    // Track max scroll depth
    scrollManager.subscribe((progress) => {
      if (progress > this.maxScrollProgress) {
        this.maxScrollProgress = progress;
      }
    });

    // Check opening state
    if (openingStore.isSeen() || openingStore.getStep() === 'completed') {
      this.start();
    } else {
      const unsub = openingStore.subscribe((step) => {
        if (step === 'completed') {
          this.start();
          unsub();
        }
      });
    }

    // Visibility change listener
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        if (openingStore.isSeen() || openingStore.getStep() === 'completed') {
          this.start();
        }
      } else {
        this.pause();
      }
    });
  }

  private start() {
    if (this.isRunning) return;
    this.isRunning = true;

    if (this.timerId) clearInterval(this.timerId);
    this.timerId = setInterval(() => {
      this.tick();
    }, 1000);
  }

  private pause() {
    this.isRunning = false;
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  private tick() {
    this.seconds += 1;
    const formatted = this.formatTime(this.seconds);

    // Calculate unreached percentage: (1 - maxProgress) * 100
    const unreached = Math.max(0, Math.min(100, Math.round((1 - this.maxScrollProgress) * 100)));
    this.history.push({ time: this.seconds, unreachedPercent: unreached });

    // Notify listeners for direct DOM updates (no React re-renders)
    this.listeners.forEach((listener) => {
      try {
        listener(this.seconds, formatted);
      } catch (e) {
        // ignore callback errors
      }
    });
  }

  public formatTime(sec: number): string {
    const mins = Math.floor(sec / 60);
    const remainingSecs = sec % 60;
    const paddedSecs = remainingSecs < 10 ? `0${remainingSecs}` : `${remainingSecs}`;
    return `${mins}:${paddedSecs}`;
  }

  public getSeconds(): number {
    return this.seconds;
  }

  public getFormattedTime(): string {
    return this.formatTime(this.seconds);
  }

  public getHistory(): { time: number; unreachedPercent: number }[] {
    return this.history;
  }

  public freezeTimeForMessage(): string {
    if (!this.frozenMessageTime) {
      this.frozenMessageTime = this.formatTime(this.seconds);
    }
    return this.frozenMessageTime;
  }

  public getFrozenMessageTime(): string {
    return this.frozenMessageTime || this.formatTime(this.seconds);
  }

  public subscribeTick(listener: AttentionTickListener): () => void {
    this.listeners.add(listener);
    // Send immediate initial value
    listener(this.seconds, this.formatTime(this.seconds));
    return () => this.listeners.delete(listener);
  }
}

export const attentionStore = new AttentionStore();
