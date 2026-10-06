'use client';

import React, { useEffect, useState, useRef } from 'react';
import { perfStore } from '@/store/perfStore';

export default function DevFpsCounter() {
  const [fps, setFps] = useState<number>(60);
  const [frameTime, setFrameTime] = useState<number>(16.6);
  const [gpuName, setGpuName] = useState<string>('');
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    let lastTime = performance.now();
    let frames = 0;

    const loop = (now: number) => {
      frames++;
      const delta = now - lastTime;

      if (delta >= 500) {
        const currentFps = Math.round((frames * 1000) / delta);
        const avgFrameTime = (delta / frames).toFixed(1);
        setFps(currentFps);
        setFrameTime(parseFloat(avgFrameTime));
        frames = 0;
        lastTime = now;
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    const unsub = perfStore.subscribe((s) => {
      setGpuName(s.gpuName);
    });

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      unsub();
    };
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const getStatusColor = (val: number) => {
    if (val >= 55) return '#10b981'; // Green
    if (val >= 30) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  return (
    <div
      className="fps-indicator-badge"
      style={{
        color: getStatusColor(fps),
        borderColor: `${getStatusColor(fps)}40`,
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
      }}
      title={`Live WebGL & DOM Render Performance | GPU: ${gpuName || 'Detecting...'}`}
    >
      <span
        className="fps-dot"
        style={{
          background: getStatusColor(fps),
          boxShadow: `0 0 8px ${getStatusColor(fps)}`,
        }}
      />
      <span style={{ fontWeight: 700 }}>{fps} FPS</span>
      <span style={{ color: '#888', fontSize: '0.7rem' }}>({frameTime}ms)</span>
      {gpuName && (
        <span
          style={{
            color: '#71717a',
            fontSize: '0.65rem',
            maxWidth: '120px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            borderLeft: '1px solid rgba(255,255,255,0.1)',
            paddingLeft: '0.5rem',
          }}
          title={gpuName}
        >
          {gpuName}
        </span>
      )}
      <span style={{ color: '#555', fontSize: '0.65rem' }}>DEV</span>
    </div>
  );
}
