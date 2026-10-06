'use client';

import React, { useState, useEffect } from 'react';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { Perf } from 'r3f-perf';
import LabArchitecture from './LabArchitecture';
import CameraController from './CameraController';
import AdaptivePerfManager from './AdaptivePerfManager';
import OpeningScreens from './OpeningScreens';
import ProfileHub from './ProfileHub';
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
      {/* 1. Deep cinematic atmosphere & Fog for depth */}
      <color attach="background" args={['#060608']} />
      {perfSettings.fog && <fog attach="fog" args={['#060608', 8, 65]} />}

      {/* 2. Maximum 2 dynamic lights (Warm white, zero real-time shadows for budget) */}
      <ambientLight intensity={0.45} color="#e5e5f0" />
      <directionalLight
        position={[4, 12, 5]}
        intensity={0.8}
        color="#fff4eb"
        castShadow={false}
      />

      {/* 3. The 3D Lab Architecture (Reflective floor, walls, instanced columns, light beams, zone markers) */}
      <LabArchitecture />

      {/* 4. Opening 3D Floating Screens (unmounts upon sequence completion) */}
      <OpeningScreens />

      {/* 5. Profile Hub Room (Monumental media wall & Highlights rings) */}
      <ProfileHub />

      {/* 6. Smooth Spline Camera Controller with Lenis Scroll & Mouse Parallax */}
      <CameraController />

      {/* 7. Adaptive Performance System */}
      <AdaptivePerfManager />

      {/* 8. In-Canvas Perf Monitor (Development Only) */}
      {isDev && (
        <Perf
          position="bottom-right"
          minimal={false}
          deepAnalyze={false}
          matrixUpdate={false}
          style={{
            zIndex: 99999,
            transform: 'scale(0.85)',
            transformOrigin: 'bottom right',
          }}
        />
      )}

      {/* 9. Subtle High-Performance Post-Processing (No heavy blurs or depth of field) */}
      {perfSettings.postprocessing && (
        <EffectComposer multisampling={0}>
          <Bloom
            luminanceThreshold={0.88}
            luminanceSmoothing={0.2}
            intensity={0.45}
            mipmapBlur
          />
          <Vignette eskil={false} offset={0.25} darkness={0.85} />
        </EffectComposer>
      )}
    </>
  );
}
