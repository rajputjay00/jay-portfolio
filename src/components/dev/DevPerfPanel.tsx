'use client';

import React, { useState, useEffect, useRef } from 'react';
import { perfStore, PerfSettings } from '@/store/perfStore';

interface BenchmarkResult {
  name: string;
  avgFps: number;
  avgMs: number;
}

export default function DevPerfPanel() {
  const [settings, setSettings] = useState<PerfSettings>(perfStore.getSettings());
  const [isOpen, setIsOpen] = useState(false);
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [currentBenchStep, setCurrentBenchStep] = useState<string>('');
  const [benchmarkResults, setBenchmarkResults] = useState<BenchmarkResult[] | null>(null);
  const [viewportInfo, setViewportInfo] = useState({ dpr: 1, width: 0, height: 0 });

  useEffect(() => {
    // Detect GPU Renderer Name & Viewport Info
    if (typeof window !== 'undefined') {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (gl) {
          const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
          if (debugInfo) {
            const renderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            if (renderer) {
              perfStore.setGpuName(renderer);
            }
          }
        }
      } catch (e) {
        perfStore.setGpuName('Standard WebGL GPU');
      }

      setViewportInfo({
        dpr: window.devicePixelRatio || 1,
        width: window.innerWidth,
        height: window.innerHeight,
      });

      const handleResize = () => {
        setViewportInfo({
          dpr: window.devicePixelRatio || 1,
          width: window.innerWidth,
          height: window.innerHeight,
        });
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }

    return perfStore.subscribe((s) => setSettings(s));
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const toggle = (key: keyof Omit<PerfSettings, 'gpuName'>) => {
    perfStore.setSetting(key, !settings[key]);
  };

  // Helper to measure FPS accurately over a time duration in ms
  const measureFps = (durationMs: number): Promise<{ avgFps: number; avgMs: number }> => {
    return new Promise((resolve) => {
      let frames = 0;
      let startTime = performance.now();

      const onFrame = (now: number) => {
        frames++;
        const elapsed = now - startTime;
        if (elapsed >= durationMs) {
          const avgFps = Math.round((frames * 1000) / elapsed);
          const avgMs = parseFloat((elapsed / frames).toFixed(1));
          resolve({ avgFps, avgMs });
        } else {
          requestAnimationFrame(onFrame);
        }
      };

      // Allow 1 frame for state/DOM to settle before recording
      requestAnimationFrame(() => {
        startTime = performance.now();
        requestAnimationFrame(onFrame);
      });
    });
  };

  const runBenchmark = async () => {
    if (isBenchmarking) return;
    setIsBenchmarking(true);
    setBenchmarkResults(null);
    setIsOpen(true);

    const testDuration = 2500; // 2.5s per step for high accuracy
    const results: BenchmarkResult[] = [];

    const defaultState: Omit<PerfSettings, 'gpuName'> = {
      floorReflection: true,
      postprocessing: true,
      lightBeams: true,
      fog: true,
      wallFins: true,
      hubText: true,
      profileHub: true,
    };

    const applyState = (overrides: Partial<Omit<PerfSettings, 'gpuName'>>) => {
      const next = { ...defaultState, ...overrides };
      Object.entries(next).forEach(([k, v]) => {
        perfStore.setSetting(k as keyof Omit<PerfSettings, 'gpuName'>, v);
      });
    };

    try {
      // 1. Baseline: Everything ON
      setCurrentBenchStep('1/8: Baseline (All ON)...');
      applyState({});
      const r1 = await measureFps(testDuration);
      results.push({ name: 'Baseline (All ON)', ...r1 });

      // 2. Off: Reflective Floor
      setCurrentBenchStep('2/8: No Reflective Floor...');
      applyState({ floorReflection: false });
      const r2 = await measureFps(testDuration);
      results.push({ name: 'No Floor Reflection', ...r2 });

      // 3. Off: Postprocessing
      setCurrentBenchStep('3/8: No Post-Processing...');
      applyState({ postprocessing: false });
      const r3 = await measureFps(testDuration);
      results.push({ name: 'No Post-Processing', ...r3 });

      // 4. Off: Light Beams
      setCurrentBenchStep('4/8: No Light Beams...');
      applyState({ lightBeams: false });
      const r4 = await measureFps(testDuration);
      results.push({ name: 'No Light Beams', ...r4 });

      // 5. Off: Fog
      setCurrentBenchStep('5/8: No Scene Fog...');
      applyState({ fog: false });
      const r5 = await measureFps(testDuration);
      results.push({ name: 'No Scene Fog', ...r5 });

      // 6. Off: Wall Fins
      setCurrentBenchStep('6/8: No Wall Fins...');
      applyState({ wallFins: false });
      const r6 = await measureFps(testDuration);
      results.push({ name: 'No Wall Fins', ...r6 });

      // 7. Off: Hub Text
      setCurrentBenchStep('7/8: No Hub Text...');
      applyState({ hubText: false });
      const r7 = await measureFps(testDuration);
      results.push({ name: 'No Hub 3D Text', ...r7 });

      // 8. Off: Whole Profile Hub
      setCurrentBenchStep('8/8: No Profile Hub Room...');
      applyState({ profileHub: false });
      const r8 = await measureFps(testDuration);
      results.push({ name: 'No Profile Hub Room', ...r8 });

      // Restore all
      applyState({});
      setBenchmarkResults(results);
    } catch (e) {
      console.error(e);
    } finally {
      applyState({});
      setIsBenchmarking(false);
      setCurrentBenchStep('');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '4.5rem',
        left: '1.25rem',
        zIndex: 99999,
        fontFamily: 'var(--font-display)',
      }}
    >
      <div
        style={{
          background: 'rgba(10, 10, 15, 0.94)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          borderRadius: '12px',
          padding: '0.65rem 0.95rem',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.65)',
          width: isOpen ? '320px' : 'auto',
          maxHeight: '85vh',
          overflowY: 'auto',
          transition: 'width 0.2s ease',
        }}
      >
        {/* Header Toggle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            cursor: 'pointer',
          }}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: isBenchmarking ? '#f59e0b' : '#3b82f6',
                boxShadow: `0 0 6px ${isBenchmarking ? '#f59e0b' : '#3b82f6'}`,
                animation: isBenchmarking ? 'pulse 1s infinite' : 'none',
              }}
            />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff', letterSpacing: '0.05em' }}>
              PERF & BENCHMARK
            </span>
          </div>
          <span style={{ fontSize: '0.7rem', color: '#888' }}>
            {isOpen ? '▲ Hide' : '▼ Expand'}
          </span>
        </div>

        {isOpen && (
          <div style={{ marginTop: '0.75rem', paddingTop: '0.6rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            {/* System Specs (GPU, DPR, Canvas) */}
            <div style={{ marginBottom: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div style={{ fontSize: '0.62rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Hardware Context
              </div>
              <div
                style={{
                  fontSize: '0.7rem',
                  color: '#e4e4e7',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                title={settings.gpuName}
              >
                GPU: <span style={{ color: '#60a5fa' }}>{settings.gpuName}</span>
              </div>
              <div style={{ fontSize: '0.68rem', color: '#a1a1aa' }}>
                DPR: <span style={{ color: '#fff' }}>{viewportInfo.dpr}x</span> · Viewport: <span style={{ color: '#fff' }}>{viewportInfo.width}×{viewportInfo.height}px</span>
              </div>
            </div>

            {/* Run Benchmark Button */}
            <div style={{ marginBottom: '0.85rem' }}>
              <button
                onClick={runBenchmark}
                disabled={isBenchmarking}
                style={{
                  width: '100%',
                  background: isBenchmarking
                    ? 'rgba(245, 158, 11, 0.2)'
                    : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  border: `1px solid ${isBenchmarking ? '#f59e0b' : '#3b82f6'}`,
                  color: '#ffffff',
                  padding: '0.5rem 0.8rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  cursor: isBenchmarking ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s ease',
                }}
              >
                <span>{isBenchmarking ? 'Running Benchmark...' : '▶ Run Benchmark (3s Tests)'}</span>
              </button>

              {isBenchmarking && (
                <div style={{ fontSize: '0.68rem', color: '#f59e0b', marginTop: '0.35rem', textAlign: 'center' }}>
                  {currentBenchStep}
                </div>
              )}
            </div>

            {/* Benchmark Results Table */}
            {benchmarkResults && (
              <div
                style={{
                  marginBottom: '0.85rem',
                  background: 'rgba(0, 0, 0, 0.4)',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <div style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Benchmark Results
                </div>
                <table style={{ width: '100%', fontSize: '0.68rem', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ color: '#888', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <th style={{ textAlign: 'left', paddingBottom: '0.2rem' }}>Config</th>
                      <th style={{ textAlign: 'right', paddingBottom: '0.2rem' }}>FPS</th>
                      <th style={{ textAlign: 'right', paddingBottom: '0.2rem' }}>ms</th>
                    </tr>
                  </thead>
                  <tbody>
                    {benchmarkResults.map((res, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '0.2rem 0', color: idx === 0 ? '#60a5fa' : '#d4d4d8' }}>
                          {res.name}
                        </td>
                        <td
                          style={{
                            textAlign: 'right',
                            fontWeight: 700,
                            color: res.avgFps >= 55 ? '#10b981' : res.avgFps >= 30 ? '#f59e0b' : '#ef4444',
                          }}
                        >
                          {res.avgFps}
                        </td>
                        <td style={{ textAlign: 'right', color: '#888' }}>
                          {res.avgMs}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Manual Feature Toggles */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div style={{ fontSize: '0.62rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Manual Feature Toggles
              </div>

              {[
                { key: 'floorReflection', label: 'Reflective Floor' },
                { key: 'postprocessing', label: 'Post-Processing' },
                { key: 'lightBeams', label: 'Light Beams' },
                { key: 'fog', label: 'Scene Fog' },
                { key: 'wallFins', label: 'Wall Fins (Instanced)' },
                { key: 'hubText', label: 'Hub 3D Text' },
                { key: 'profileHub', label: 'Profile Hub Room' },
              ].map(({ key, label }) => {
                const isEnabled = settings[key as keyof Omit<PerfSettings, 'gpuName'>];
                return (
                  <div
                    key={key}
                    onClick={() => toggle(key as keyof Omit<PerfSettings, 'gpuName'>)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.28rem 0.45rem',
                      background: isEnabled ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${isEnabled ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255, 255, 255, 0.06)'}`,
                      borderRadius: '5px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span style={{ fontSize: '0.7rem', color: isEnabled ? '#fff' : '#888' }}>
                      {label}
                    </span>
                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        color: isEnabled ? '#10b981' : '#ef4444',
                      }}
                    >
                      {isEnabled ? 'ON' : 'OFF'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
