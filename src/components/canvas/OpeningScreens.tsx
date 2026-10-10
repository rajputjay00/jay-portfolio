'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RoundedBox } from '@react-three/drei';
import { openingStore, OpeningStep } from '@/store/openingStore';
import reelsData from '@/../content/reels.json';

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

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      float t = uFreeze > 0.5 ? 2.5 : uTime * uSpeed;
      vec2 uv = vUv;
      vec3 bg = vec3(0.045, 0.045, 0.06);

      float ambientWave = sin(uv.y * 3.0 + t * 0.8) * cos(uv.x * 2.5 - t * 0.6);
      vec3 tone = mix(bg, vec3(0.08, 0.08, 0.11), smoothstep(-1.0, 1.0, ambientWave));

      float linePos = fract(t * 0.18);
      float lineDist = abs(uv.y - linePos);
      float redLine = 1.0 - smoothstep(0.0, 0.006, lineDist);
      vec3 accentColor = vec3(1.0, 0.353, 0.169); // #FF5A2B

      tone = mix(tone, accentColor, redLine * 0.85);

      float grain = (hash(uv * 500.0 + fract(uTime * 15.0)) - 0.5) * 0.04;
      tone += vec3(grain * 1.0, grain * 0.95, grain * 0.9);

      float edgeVignette = smoothstep(0.0, 0.06, uv.x) * smoothstep(1.0, 0.94, uv.x) *
                           smoothstep(0.0, 0.05, uv.y) * smoothstep(1.0, 0.95, uv.y);
      tone *= edgeVignette;

      gl_FragColor = vec4(tone, uOpacity);
    }
  `,
};

interface FloatingScreenProps {
  index: number;
  startPos: [number, number, number];
  endPos: [number, number, number];
  startRot: [number, number, number];
  endRot: [number, number, number];
  visible: boolean;
  isFrozen: boolean;
  isGliding: boolean;
}

function FloatingScreen({
  index,
  startPos,
  endPos,
  startRot,
  endRot,
  visible,
  isFrozen,
  isGliding,
}: FloatingScreenProps) {
  const groupRef = useRef<THREE.Group>(null);
  const shaderMatRef = useRef<THREE.ShaderMaterial>(null);
  const frozenTimeRef = useRef<number>(0);
  const currentPos = useRef(new THREE.Vector3(...startPos));
  const opacityRef = useRef(1.0);
  const [videoTexture, setVideoTexture] = useState<THREE.VideoTexture | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const clip = reelsData.openingClips?.clips?.[index];
    if (!clip?.file) return;

    const vid = document.createElement('video');
    vid.src = clip.file;
    vid.crossOrigin = 'anonymous';
    vid.loop = true;
    vid.muted = true;
    vid.playsInline = true;
    vid.preload = 'auto';
    vid.ontimeupdate = () => {
      if (vid.currentTime >= 8) {
        vid.currentTime = 0;
      }
    };

    videoRef.current = vid;
    const tex = new THREE.VideoTexture(vid);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.format = THREE.RGBAFormat;
    setVideoTexture(tex);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion) {
      vid.play().catch(() => {});
    }

    return () => {
      vid.pause();
      vid.removeAttribute('src');
      vid.load();
      tex.dispose();
    };
  }, [index]);

  useEffect(() => {
    if (isFrozen && videoRef.current) {
      videoRef.current.pause();
    }
  }, [isFrozen]);

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

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    if (!isFrozen) {
      frozenTimeRef.current = state.clock.elapsedTime;
      if (shaderMatRef.current) {
        shaderMatRef.current.uniforms.uTime.value = state.clock.elapsedTime;
        shaderMatRef.current.uniforms.uFreeze.value = 0;
      }
    } else {
      if (shaderMatRef.current) {
        shaderMatRef.current.uniforms.uFreeze.value = 1;
        shaderMatRef.current.uniforms.uTime.value = frozenTimeRef.current;
      }
    }

    if (isGliding) {
      currentPos.current.lerp(new THREE.Vector3(...endPos), delta * 2.5);
      groupRef.current.position.copy(currentPos.current);
      opacityRef.current = THREE.MathUtils.damp(opacityRef.current, 0.0, 2.5, delta);
    } else {
      currentPos.current.set(...startPos);
      if (!isFrozen) {
        currentPos.current.y += Math.sin(state.clock.elapsedTime * 1.2 + index) * 0.03;
      }
      groupRef.current.position.copy(currentPos.current);
      opacityRef.current = THREE.MathUtils.damp(opacityRef.current, 1.0, 3.0, delta);
    }

    if (shaderMatRef.current) {
      shaderMatRef.current.uniforms.uOpacity.value = opacityRef.current;
    }
  });

  if (!visible || opacityRef.current <= 0.01) return null;

  return (
    <group ref={groupRef} position={startPos} rotation={startRot}>
      <RoundedBox args={[1.05, 1.8, 0.04]} radius={0.05} smoothness={4}>
        <meshBasicMaterial color="#0d0e14" transparent opacity={opacityRef.current} />
      </RoundedBox>

      <mesh position={[0, 0, 0.022]}>
        <planeGeometry args={[0.98, 1.74]} />
        {videoTexture ? (
          <meshBasicMaterial map={videoTexture} transparent opacity={opacityRef.current} toneMapped={false} />
        ) : (
          <primitive object={customMaterial} ref={shaderMatRef} attach="material" />
        )}
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

  const isCompleted = step === 'completed' && openingStore.isSeen();
  if (isCompleted) {
    return null;
  }

  const showScreen1 = step !== 'idle';
  const showScreen2 =
    step === 'screen_2' ||
    step === 'screen_3' ||
    step === 'frozen' ||
    step === 'stop_text' ||
    step === 'you_did_text' ||
    step === 'pullback' ||
    step === 'identity';
  const showScreen3 =
    step === 'screen_3' ||
    step === 'frozen' ||
    step === 'stop_text' ||
    step === 'you_did_text' ||
    step === 'pullback' ||
    step === 'identity';

  const isFrozen =
    step === 'frozen' ||
    step === 'stop_text' ||
    step === 'you_did_text' ||
    step === 'pullback' ||
    step === 'identity';

  const isGliding = step === 'pullback' || step === 'identity' || step === 'completed';

  return (
    <group position={[0, 0, 0]}>
      {/* Screen 1 */}
      <FloatingScreen
        index={0}
        startPos={[-0.9, 0.2, 4.2]}
        endPos={[0.8, 0.2, 0.0]}
        startRot={[0.02, 0.15, -0.02]}
        endRot={[0.0, 0.35, 0.0]}
        visible={showScreen1}
        isFrozen={isFrozen}
        isGliding={isGliding}
      />

      {/* Screen 2 */}
      <FloatingScreen
        index={1}
        startPos={[1.0, -0.1, 3.8]}
        endPos={[2.1, -0.2, 0.0]}
        startRot={[-0.02, -0.12, 0.02]}
        endRot={[0.0, 0.35, 0.0]}
        visible={showScreen2}
        isFrozen={isFrozen}
        isGliding={isGliding}
      />

      {/* Screen 3 */}
      <FloatingScreen
        index={2}
        startPos={[0.0, 0.1, 3.2]}
        endPos={[3.4, 0.5, 0.0]}
        startRot={[0.01, 0.04, 0.0]}
        endRot={[0.0, 0.35, 0.0]}
        visible={showScreen3}
        isFrozen={isFrozen}
        isGliding={isGliding}
      />
    </group>
  );
}
