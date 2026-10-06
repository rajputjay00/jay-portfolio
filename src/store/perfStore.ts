'use client';

export interface PerfSettings {
  floorReflection: boolean;
  postprocessing: boolean;
  lightBeams: boolean;
  fog: boolean;
  wallFins: boolean;
  profileHub: boolean;
  gpuName: string;
}

type PerfListener = (settings: PerfSettings) => void;

class PerfStore {
  private settings: PerfSettings = {
    floorReflection: true,
    postprocessing: true,
    lightBeams: true,
    fog: true,
    wallFins: true,
    profileHub: true,
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
