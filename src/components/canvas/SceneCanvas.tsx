'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Preload } from '@react-three/drei';
import Experience from './Experience';
import { scrollManager } from '@/store/scrollStore';

export default function SceneCanvas() {
  const isDev = process.env.NODE_ENV === 'development';
  const [isHeroActive, setIsHeroActive] = useState(true);

  useEffect(() => {
    // Observe hero visibility or scroll position to pause frameloop when scrolled away
    const heroEl = document.getElementById('hero');
    if (heroEl && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            setIsHeroActive(entry.isIntersecting);
          });
        },
        { threshold: 0.01 }
      );
      observer.observe(heroEl);
      return () => observer.disconnect();
    } else {
      // Fallback to scroll progress subscription
      return scrollManager.subscribe((progress) => {
        setIsHeroActive(progress < 0.15);
      });
    }
  }, []);

  return (
    <Canvas
      frameloop={isHeroActive ? 'always' : 'never'}
      dpr={[1, 1.5]}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
        stencil: false,
        depth: true,
      }}
      camera={{
        position: [0, 0, 5],
        fov: 45,
        near: 0.1,
        far: 50,
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
