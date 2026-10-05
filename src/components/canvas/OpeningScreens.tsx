'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RoundedBox } from '@react-three/drei';
import { openingStore, OpeningStep } from '@/store/openingStore';
import reelsData from '@/../content/reels.json';

// Shader for procedural high-end social media gradient when video is TODO / missing
const ProceduralClipShader = {
  uniforms: {
    uTime: { value: 0 },
    uFreeze: { value: 0 }, // 1 = frozen
    uHue: { value: 0.0 },
    uSpeed: { value: 1.0 },
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
    uniform float uHue;
    uniform float uSpeed;
    uniform float uOpacity;
    varying vec2 vUv;

    void main() {
      float t = uFreeze > 0.5 ? 4.2 : uTime * uSpeed;
      vec2 uv = vUv;
      
      // Moving dynamic social wave pattern
      float wave1 = sin(uv.y * 6.0 + t * 1.5 + sin(uv.x * 4.0 + t));
      float wave2 = cos(uv.x * 5.0 - t * 1.2 + cos(uv.y * 3.0));
      float pattern = (wave1 + wave2) * 0.5;

      // Dark luxury editorial color scheme with vibrant neon core
      vec3 col1 = vec3(0.08, 0.08, 0.12);
      vec3 col2 = vec3(0.95, 0.15, 0.35); // Instagram-inspired vibrant punch
      vec3 col3 = vec3(0.35, 0.10, 0.85); // Deep violet
      vec3 col4 = vec3(1.00, 0.55, 0.20); // Warm amber highlight

      vec3 color = mix(col1, col3, smoothstep(-0.6, 0.6, pattern));
      color = mix(color, col2, smoothstep(0.2, 0.9, sin(uv.y * 4.0 + t * 0.8)));
      color = mix(color, col4, smoothstep(0.7, 1.0, wave1 * wave2));

      // Subtle scanline / social interface vignette
      float scanline = sin(uv.y * 400.0) * 0.03;
      color -= scanline;

      // Dark border vignette
      float edgeVignette = smoothstep(0.0, 0.1, uv.x) * smoothstep(1.0, 0.9, uv.x) *
                           smoothstep(0.0, 0.08, uv.y) * smoothstep(1.0, 0.92, uv.y);
      color *= edgeVignette;

      gl_FragColor = vec4(color, uOpacity);
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

  const isVideoTodo = !clipPath || clipPath.includes('TODO');

  const customMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uFreeze: { value: 0 },
        uHue: { value: index * 0.3 },
        uSpeed: { value: 1.0 + index * 0.2 },
        uOpacity: { value: 1.0 },
      },
      vertexShader: ProceduralClipShader.vertexShader,
      fragmentShader: ProceduralClipShader.fragmentShader,
      transparent: true,
    });
  }, [index]);

  useFrame((state, delta) => {
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
      // Subtle float
      meshRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime * 1.5 + index) * 0.04;
    }
  });

  if (!visible && opacity <= 0.01) return null;

  return (
    <group ref={meshRef} position={position} rotation={rotation}>
      {/* Phone Body Frame */}
      <RoundedBox args={[1.82, 3.24, 0.06]} radius={0.08} smoothness={4}>
        <meshStandardMaterial
          color="#0c0d12"
          metalness={0.9}
          roughness={0.2}
          transparent
          opacity={opacity}
        />
      </RoundedBox>

      {/* Screen Surface */}
      <mesh position={[0, 0, 0.032]}>
        <planeGeometry args={[1.74, 3.12]} />
        <primitive object={customMaterial} ref={shaderMatRef} attach="material" />
      </mesh>

      {/* Screen Glow Rim */}
      <mesh position={[0, 0, 0.035]}>
        <ringGeometry args={[0.85, 0.88, 32]} />
        <meshBasicMaterial
          color="#ff4757"
          transparent
          opacity={opacity * 0.3}
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

  const clips = reelsData?.openingClips?.clips || [];

  // Determine visibility and frozen state based on sequence step
  const showScreen1 =
    step !== 'idle';
  const showScreen2 =
    step === 'screen_2' ||
    step === 'screen_3' ||
    step === 'frozen' ||
    step === 'stop_text' ||
    step === 'you_did_text' ||
    step === 'pullback' ||
    step === 'identity' ||
    step === 'completed';
  const showScreen3 =
    step === 'screen_3' ||
    step === 'frozen' ||
    step === 'stop_text' ||
    step === 'you_did_text' ||
    step === 'pullback' ||
    step === 'identity' ||
    step === 'completed';

  const isFrozen =
    step === 'frozen' ||
    step === 'stop_text' ||
    step === 'you_did_text' ||
    step === 'pullback' ||
    step === 'identity' ||
    step === 'completed';

  // Fade out screens slightly during step 5 / after pull back so they stay as architectural elements
  const opacity = step === 'pullback' || step === 'identity' || step === 'completed' ? 0.45 : 1.0;

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
        opacity={opacity}
      />

      {/* Screen 2: Mid right */}
      <FloatingScreen
        index={1}
        position={[1.5, 1.9, 7.5]}
        rotation={[-0.03, -0.16, 0.03]}
        clipPath={clips[1]}
        visible={showScreen2}
        isFrozen={isFrozen}
        opacity={opacity}
      />

      {/* Screen 3: Deep center */}
      <FloatingScreen
        index={2}
        position={[0.1, 2.2, 4.2]}
        rotation={[0.01, 0.06, 0.0]}
        clipPath={clips[2]}
        visible={showScreen3}
        isFrozen={isFrozen}
        opacity={opacity}
      />
    </group>
  );
}
