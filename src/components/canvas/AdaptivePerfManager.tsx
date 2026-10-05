'use client';

import React, { useState } from 'react';
import { AdaptiveDpr, AdaptiveEvents, PerformanceMonitor } from '@react-three/drei';

export default function AdaptivePerfManager() {
  const [dpr, setDpr] = useState(1.5);

  return (
    <>
      <PerformanceMonitor
        onIncline={() => setDpr(2)}
        onDecline={() => setDpr(1)}
        flipflops={3}
        onFallback={() => setDpr(0.75)}
      />
      <AdaptiveDpr pixelated={false} />
      <AdaptiveEvents />
    </>
  );
}
