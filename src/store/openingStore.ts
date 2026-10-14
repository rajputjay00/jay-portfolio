'use client';

export type OpeningStep =
  | 'idle'
  | 'screen_1'
  | 'screen_2'
  | 'screen_3'
  | 'frozen'
  | 'stop_text'
  | 'you_did_text'
  | 'pullback'
  | 'identity'
  | 'completed';

type OpeningListener = (step: OpeningStep) => void;

class OpeningStore {
  private step: OpeningStep = 'completed';
  private listeners: Set<OpeningListener> = new Set();
  private hasSeen: boolean = true;
  private isIntroRequested: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        this.isIntroRequested = params.get('intro') === '1';
        if (this.isIntroRequested) {
          this.step = 'idle';
          this.hasSeen = false;
        } else {
          this.step = 'completed';
          this.hasSeen = true;
        }
      } catch (e) {
        this.step = 'completed';
        this.hasSeen = true;
      }
    } else {
      this.step = 'completed';
      this.hasSeen = true;
    }
  }

  isIntro(): boolean {
    return this.isIntroRequested;
  }

  getStep(): OpeningStep {
    return this.step;
  }

  isSeen(): boolean {
    return this.hasSeen;
  }

  setStep(nextStep: OpeningStep) {
    this.step = nextStep;
    if (nextStep === 'identity' || nextStep === 'completed') {
      this.markSeen();
    }
    this.listeners.forEach((listener) => listener(this.step));
  }

  markSeen() {
    this.hasSeen = true;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('attention_lab_opening_seen', 'true');
      } catch (e) {
        // ignore
      }
    }
  }

  resetSeen() {
    this.hasSeen = false;
    this.isIntroRequested = true;
    this.setStep('screen_1');
  }

  subscribe(listener: OpeningListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

export const openingStore = new OpeningStore();
