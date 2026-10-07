import React, { useState, useEffect } from 'react';
import { AdaptiveDpr, AdaptiveEvents, PerformanceMonitor } from '@react-three/drei';

export default function AdaptivePerfManager() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setEnabled(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!enabled) return null;

  return (
    <>
      <PerformanceMonitor
        flipflops={3}
        iterations={8}
      />
      <AdaptiveDpr pixelated={false} />
      <AdaptiveEvents />
    </>
  );
}
