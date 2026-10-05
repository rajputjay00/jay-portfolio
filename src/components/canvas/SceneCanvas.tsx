'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Preload } from '@react-three/drei';
import Experience from './Experience';

export default function SceneCanvas() {
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <Canvas
      dpr={[1, 2]}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
        stencil: false,
        depth: true,
      }}
      camera={{
        position: [0, 1, 5],
        fov: 45,
        near: 0.1,
        far: 100,
      }}
      performance={{ min: 0.5 }}
      style={{
        width: '100%',
        height: '100%',
        pointerEvents: 'auto',
      }}
    >
      <Suspense fallback={null}>
        <Experience isDev={isDev} />
        <Preload all />
      </Suspense>
    </Canvas>
  );
}
