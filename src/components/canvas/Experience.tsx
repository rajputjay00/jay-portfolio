'use client';

import React, { useState, useEffect } from 'react';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { Perf } from 'r3f-perf';
import CameraController from './CameraController';
import AdaptivePerfManager from './AdaptivePerfManager';
import OpeningScreens from './OpeningScreens';
import HeroFeedWall from './HeroFeedWall';
import { perfStore, PerfSettings } from '@/store/perfStore';

interface ExperienceProps {
  isDev?: boolean;
}

export default function Experience({ isDev = false }: ExperienceProps) {
  const [perfSettings, setPerfSettings] = useState<PerfSettings>(perfStore.getSettings());

  useEffect(() => {
    return perfStore.subscribe((s) => setPerfSettings(s));
  }, []);

  return (
    <>
      {/* 1. Deep cinematic background (#0B0A09) */}
      <color attach="background" args={['#0B0A09']} />

      {/* 2. Opening Floating Screens */}
      <OpeningScreens />

      {/* 3. Path B Hero 3D Feed Wall (ONE InstancedMesh, ONE Shader Material, 1 Draw Call) */}
      <HeroFeedWall />

      {/* 4. Smooth Camera Controller & Parallax */}
      <CameraController />

      {/* 5. Adaptive Performance System */}
      <AdaptivePerfManager />

      {/* 7. Post-Processing (Off by default for zero-lag 60fps budget) */}
      {perfSettings.postprocessing && (
        <EffectComposer multisampling={0}>
          <Bloom
            luminanceThreshold={0.85}
            luminanceSmoothing={0.2}
            intensity={0.4}
            mipmapBlur
          />
          <Vignette eskil={false} offset={0.2} darkness={0.8} />
        </EffectComposer>
      )}
    </>
  );
}
