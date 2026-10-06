'use client';

import React, { useState, useEffect } from 'react';
import { perfStore, PerfSettings } from '@/store/perfStore';

export default function DevPerfPanel() {
  const [settings, setSettings] = useState<PerfSettings>(perfStore.getSettings());
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Detect GPU Renderer Name
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
    }

    return perfStore.subscribe((s) => setSettings(s));
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const toggle = (key: keyof Omit<PerfSettings, 'gpuName'>) => {
    perfStore.setSetting(key, !settings[key]);
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
          background: 'rgba(10, 10, 15, 0.92)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '12px',
          padding: '0.6rem 0.9rem',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6)',
          width: isOpen ? '280px' : 'auto',
          transition: 'width 0.2s ease',
        }}
      >
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
                background: '#3b82f6',
                boxShadow: '0 0 6px #3b82f6',
              }}
            />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff', letterSpacing: '0.05em' }}>
              PERF PANEL
            </span>
          </div>
          <span style={{ fontSize: '0.7rem', color: '#888' }}>
            {isOpen ? '▲ Hide' : '▼ Toggles & GPU'}
          </span>
        </div>

        {isOpen && (
          <div style={{ marginTop: '0.75rem', paddingTop: '0.6rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            {/* GPU Info */}
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.65rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Active GPU
              </div>
              <div
                style={{
                  fontSize: '0.7rem',
                  color: '#e4e4e7',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginTop: '0.15rem',
                }}
                title={settings.gpuName}
              >
                {settings.gpuName}
              </div>
            </div>

            {/* Performance Toggles */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ fontSize: '0.65rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.1rem' }}>
                Feature Toggles
              </div>

              {[
                { key: 'floorReflection', label: 'Reflective Floor' },
                { key: 'postprocessing', label: 'Post-Processing' },
                { key: 'lightBeams', label: 'Light Beams' },
                { key: 'fog', label: 'Scene Fog' },
                { key: 'wallFins', label: 'Wall Fins (Instanced)' },
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
                      padding: '0.3rem 0.5rem',
                      background: isEnabled ? 'rgba(59, 130, 246, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${isEnabled ? 'rgba(59, 130, 246, 0.35)' : 'rgba(255, 255, 255, 0.06)'}`,
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span style={{ fontSize: '0.72rem', color: isEnabled ? '#fff' : '#888' }}>
                      {label}
                    </span>
                    <span
                      style={{
                        fontSize: '0.68rem',
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
