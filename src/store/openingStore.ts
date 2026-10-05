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
  private step: OpeningStep = 'idle';
  private listeners: Set<OpeningListener> = new Set();
  private hasSeen: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        this.hasSeen = localStorage.getItem('attention_lab_opening_seen') === 'true';
      } catch (e) {
        this.hasSeen = false;
      }
    }
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
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('attention_lab_opening_seen');
      } catch (e) {
        // ignore
      }
    }
    this.setStep('screen_1');
  }

  subscribe(listener: OpeningListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

export const openingStore = new OpeningStore();
