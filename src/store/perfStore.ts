'use client';

export interface PerfSettings {
  postprocessing: boolean;
  fakeReflection: boolean;
  feedHover: boolean;
  glassBlur: boolean;
  dprMax: number;
  gpuName: string;
}

type PerfListener = (settings: PerfSettings) => void;

class PerfStore {
  private settings: PerfSettings = {
    postprocessing: false, // Off by default for 60fps zero-lag budget
    fakeReflection: true,
    feedHover: true,
    glassBlur: true,
    dprMax: 1.5,
    gpuName: 'Detecting GPU...',
  };

  private listeners: Set<PerfListener> = new Set();

  getSettings(): PerfSettings {
    return this.settings;
  }

  setSetting<K extends keyof PerfSettings>(key: K, value: PerfSettings[K]) {
    this.settings = { ...this.settings, [key]: value };
    this.listeners.forEach((listener) => listener(this.settings));
  }

  setGpuName(name: string) {
    this.settings.gpuName = name;
    this.listeners.forEach((listener) => listener(this.settings));
  }

  subscribe(listener: PerfListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

export const perfStore = new PerfStore();
