'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RoundedBox } from '@react-three/drei';
import { openingStore, OpeningStep } from '@/store/openingStore';
import reelsData from '@/../content/reels.json';

// Premium near-black luxury placeholder shader with subtle warm-white grain and sharp #ff4757 accent line
const PremiumClipShader = {
  uniforms: {
    uTime: { value: 0 },
    uFreeze: { value: 0 },
    uSpeed: { value: 0.5 },
    uOpacity: { value: 1.0 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform float uFreeze;
    uniform float uSpeed;
    uniform float uOpacity;
    varying vec2 vUv;

    // Pseudo-random noise for fine warm film grain
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      float t = uFreeze > 0.5 ? 2.5 : uTime * uSpeed;
      vec2 uv = vUv;

      // Base near-black tone
      vec3 bg = vec3(0.045, 0.045, 0.06);

      // Subtle slow ambient luminance drift
      float ambientWave = sin(uv.y * 3.0 + t * 0.8) * cos(uv.x * 2.5 - t * 0.6);
      vec3 tone = mix(bg, vec3(0.08, 0.08, 0.11), smoothstep(-1.0, 1.0, ambientWave));

      // Crisp thin #ff4757 horizontal radar / accent line sweeping slowly down
      float linePos = fract(t * 0.18);
      float lineDist = abs(uv.y - linePos);
      float redLine = smoothstep(0.006, 0.0, lineDist);
      vec3 accentColor = vec3(1.0, 0.278, 0.341); // #ff4757

      tone = mix(tone, accentColor, redLine * 0.85);

      // Subtle warm-white film grain
      float grain = (hash(uv * 500.0 + fract(uTime * 15.0)) - 0.5) * 0.04;
      tone += vec3(grain * 1.0, grain * 0.95, grain * 0.9);

      // Dark edge vignette
      float edgeVignette = smoothstep(0.0, 0.06, uv.x) * smoothstep(1.0, 0.94, uv.x) *
                           smoothstep(0.0, 0.05, uv.y) * smoothstep(1.0, 0.95, uv.y);
      tone *= edgeVignette;

      gl_FragColor = vec4(tone, uOpacity);
    }
  `,
};

interface FloatingScreenProps {
  index: number;
  position: [number, number, number];
  rotation: [number, number, number];
  clipPath?: string;
  visible: boolean;
  isFrozen: boolean;
  opacity: number;
}

function FloatingScreen({
  index,
  position,
  rotation,
  clipPath,
  visible,
  isFrozen,
  opacity,
}: FloatingScreenProps) {
  const meshRef = useRef<THREE.Group>(null);
  const shaderMatRef = useRef<THREE.ShaderMaterial>(null);
  const frozenTimeRef = useRef<number>(0);

  const customMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uFreeze: { value: 0 },
        uSpeed: { value: 0.6 + index * 0.1 },
        uOpacity: { value: 1.0 },
      },
      vertexShader: PremiumClipShader.vertexShader,
      fragmentShader: PremiumClipShader.fragmentShader,
      transparent: true,
    });
  }, [index]);

  useFrame((state) => {
    if (shaderMatRef.current) {
      if (!isFrozen) {
        frozenTimeRef.current = state.clock.elapsedTime;
        shaderMatRef.current.uniforms.uTime.value = state.clock.elapsedTime;
        shaderMatRef.current.uniforms.uFreeze.value = 0;
      } else {
        shaderMatRef.current.uniforms.uFreeze.value = 1;
        shaderMatRef.current.uniforms.uTime.value = frozenTimeRef.current;
      }
      shaderMatRef.current.uniforms.uOpacity.value = opacity;
    }

    if (meshRef.current && !isFrozen) {
      // Gentle calm float
      meshRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime * 1.2 + index) * 0.03;
    }
  });

  if (!visible || opacity <= 0.01) return null;

  return (
    <group ref={meshRef} position={position} rotation={rotation}>
      {/* Phone Bezel Frame */}
      <RoundedBox args={[1.82, 3.24, 0.05]} radius={0.06} smoothness={4}>
        <meshStandardMaterial
          color="#0d0e14"
          metalness={0.9}
          roughness={0.2}
          transparent
          opacity={opacity}
        />
      </RoundedBox>

      {/* Screen Surface with Premium Crisp Material */}
      <mesh position={[0, 0, 0.027]}>
        <planeGeometry args={[1.74, 3.14]} />
        <primitive object={customMaterial} ref={shaderMatRef} attach="material" />
      </mesh>

      {/* Subtle Rim Accent */}
      <mesh position={[0, 0, 0.029]}>
        <ringGeometry args={[0.82, 0.84, 32]} />
        <meshBasicMaterial
          color="#ff4757"
          transparent
          opacity={opacity * 0.2}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

export default function OpeningScreens() {
  const [step, setStep] = useState<OpeningStep>('idle');

  useEffect(() => {
    setStep(openingStore.getStep());
    return openingStore.subscribe((s) => setStep(s));
  }, []);

  // Rule: When opening finishes or is skipped, unmount/hide the screens so they never block Profile Hub
  const isOpeningDone = step === 'pullback' || step === 'identity' || step === 'completed';
  if (isOpeningDone) {
    return null;
  }

  const clips = reelsData?.openingClips?.clips || [];

  const showScreen1 = step !== 'idle';
  const showScreen2 = step === 'screen_2' || step === 'screen_3' || step === 'frozen' || step === 'stop_text' || step === 'you_did_text';
  const showScreen3 = step === 'screen_3' || step === 'frozen' || step === 'stop_text' || step === 'you_did_text';
  const isFrozen = step === 'frozen' || step === 'stop_text' || step === 'you_did_text';

  return (
    <group position={[0, 0, 0]}>
      {/* Screen 1: Front left */}
      <FloatingScreen
        index={0}
        position={[-1.3, 2.1, 10.5]}
        rotation={[0.04, 0.18, -0.02]}
        clipPath={clips[0]}
        visible={showScreen1}
        isFrozen={isFrozen}
        opacity={1.0}
      />

      {/* Screen 2: Mid right */}
      <FloatingScreen
        index={1}
        position={[1.5, 1.9, 7.5]}
        rotation={[-0.03, -0.16, 0.03]}
        clipPath={clips[1]}
        visible={showScreen2}
        isFrozen={isFrozen}
        opacity={1.0}
      />

      {/* Screen 3: Deep center */}
      <FloatingScreen
        index={2}
        position={[0.1, 2.2, 4.2]}
        rotation={[0.01, 0.06, 0.0]}
        clipPath={clips[2]}
        visible={showScreen3}
        isFrozen={isFrozen}
        opacity={1.0}
      />
    </group>
  );
}
