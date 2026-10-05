'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const SceneCanvas = dynamic(() => import('./SceneCanvas'), {
  ssr: false,
});

export default function CanvasContainer() {
  return (
    <div className="webgl-container" aria-hidden="true">
      <SceneCanvas />
    </div>
  );
}
