'use client';

import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { perfStore, PerfSettings } from '@/store/perfStore';
import { openingStore, OpeningStep } from '@/store/openingStore';
import { windowPointerState, heroScrollProgress } from '@/store/pointerStore';

// 1. Black & White Social Post Card Shader
const FeedShader = {
  uniforms: {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector3(999, 999, 0) },
    uHoverStrength: { value: 1.0 },
    uOpacity: { value: 0.0 }, // Starts at 0.0 for clean 0.6s fade-in
    uExitProgress: { value: 0.0 },
    uStretch: { value: 1.0 },
    uIsMobile: { value: 0.0 },
    uAccentColor: { value: new THREE.Color('#FF5A2B') },
    uBgColor: { value: new THREE.Color('#0B0A09') },
  },
  vertexShader: `
    attribute float aIsLight;
    uniform vec3 uMouse;
    uniform float uHoverStrength;
    uniform float uStretch;
    
    varying vec2 vUv;
    varying float vHover;
    varying float vWorldY;
    varying float vIsLight;

    void main() {
      vUv = uv;
      vIsLight = aIsLight;

      // Extract instance center in model space
      vec4 instPos = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
      
      // Calculate distance between instance center and mouse position in feed plane
      float dist = distance(instPos.xy, uMouse.xy);
      float hoverFactor = smoothstep(1.6, 0.1, dist) * uHoverStrength;
      vHover = hoverFactor;

      // Lift screen forward toward viewer when hovered, stretch vertically with scroll speed
      vec3 pos = position;
      pos.y *= uStretch;
      pos.z += hoverFactor * 0.35;

      vec4 localInstancePos = instanceMatrix * vec4(pos, 1.0);
      vWorldY = localInstancePos.y;

      gl_Position = projectionMatrix * modelViewMatrix * localInstancePos;
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform float uOpacity;
    uniform float uExitProgress;
    uniform float uIsMobile;
    uniform vec3 uAccentColor;
    uniform vec3 uBgColor;

    varying vec2 vUv;
    varying float vHover;
    varying float vWorldY;
    varying float vIsLight;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      // 1. Card boundary
      float edgeX = min(vUv.x, 1.0 - vUv.x);
      float edgeY = min(vUv.y, 1.0 - vUv.y);
      float edgeDist = min(edgeX * 1.25, edgeY);
      float cardMask = smoothstep(0.008, 0.02, edgeDist);

      // 2. Exactly 60% Off-White (#ECE8E1) / 40% Near-Black (#121214) via aIsLight attribute
      bool isLight = vIsLight > 0.5;
      vec3 cardBg = isLight ? vec3(0.925, 0.910, 0.882) : vec3(0.071, 0.071, 0.078);
      vec3 textBarColor = isLight ? vec3(0.18, 0.18, 0.20) : vec3(0.85, 0.84, 0.82);
      vec3 imageBlockColor = isLight ? vec3(0.68, 0.67, 0.65) : vec3(0.18, 0.18, 0.20);

      vec3 col = cardBg;

      // Header row: avatar + handle bar
      vec2 avatarCenter = vec2(0.16, 0.90);
      float avatarDist = length(vec2(vUv.x - avatarCenter.x, (vUv.y - avatarCenter.y) * 1.25));
      if (avatarDist < 0.038) {
        col = textBarColor;
      }
      if (vUv.x > 0.24 && vUv.x < 0.55 && abs(vUv.y - 0.90) < 0.012) {
        col = textBarColor;
      }

      // Text bars
      float w1 = isLight ? 0.72 : 0.65;
      float w2 = isLight ? 0.48 : 0.56;
      if (vUv.x > 0.10 && vUv.x < (0.10 + w1) && abs(vUv.y - 0.80) < 0.010) {
        col = textBarColor;
      }
      if (vUv.x > 0.10 && vUv.x < (0.10 + w2) && abs(vUv.y - 0.74) < 0.010) {
        col = textBarColor;
      }

      // Image Block
      if (vUv.x > 0.10 && vUv.x < 0.90 && vUv.y > 0.16 && vUv.y < 0.66) {
        float innerGrain = (hash(vUv * 300.0) - 0.5) * 0.04;
        col = imageBlockColor + vec3(innerGrain);
      }

      // Footer interaction dots
      if (vUv.y > 0.06 && vUv.y < 0.11) {
        if (abs(vUv.x - 0.14) < 0.02 || abs(vUv.x - 0.23) < 0.02 || abs(vUv.x - 0.32) < 0.02) {
          col = textBarColor;
        }
      }

      // 3. Screen brightness: falls from 0.6 to 0.25 over exit, rises to 1.0 when hovered at top
      float baseBrightness = uIsMobile > 0.5 ? 0.35 : 0.60;
      float exitBrightness = mix(baseBrightness, 0.25, smoothstep(0.0, 0.75, uExitProgress));
      float hoverAtTop = vHover * (1.0 - smoothstep(0.0, 0.10, uExitProgress));
      float brightness = mix(exitBrightness, 1.0, hoverAtTop);
      col *= brightness;

      // 4. Hover accent edge glow (#FF5A2B) at top
      float edgeGlow = smoothstep(0.04, 0.008, edgeDist) * hoverAtTop;
      col = mix(col, uAccentColor, edgeGlow * 0.90);

      // Blend card into background outside bezel
      col = mix(uBgColor, col, cardMask);

      // 5. Vertical fade into background (#0B0A09) at top and bottom + exit fade (0.55 to 0.95)
      float exitFade = 1.0 - smoothstep(0.55, 0.95, uExitProgress);
      float topBottomFade = smoothstep(-4.5, -2.0, vWorldY) * (1.0 - smoothstep(2.0, 4.5, vWorldY));
      topBottomFade = clamp(topBottomFade, 0.0, 1.0) * exitFade;
      col = mix(uBgColor, col, topBottomFade);

      gl_FragColor = vec4(col, uOpacity * topBottomFade);
    }
  `,
};

// 2. Soft Radial Glow Shader behind the wall (Max 0.2 alpha at center)
const SoftGlowShader = {
  uniforms: {
    uColor: { value: new THREE.Color('#FF5A2B') },
    uExitFade: { value: 1.0 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 uColor;
    uniform float uExitFade;
    varying vec2 vUv;
    void main() {
      float d = distance(vUv, vec2(0.5, 0.5));
      float glow = smoothstep(0.5, 0.0, d);
      gl_FragColor = vec4(uColor, glow * 0.10 * uExitFade);
    }
  `,
};

// 3. Fake soft floor reflection shader
const FakeFloorShader = {
  uniforms: {
    uColor: { value: new THREE.Color('#FF5A2B') },
    uBgColor: { value: new THREE.Color('#0B0A09') },
    uExitFade: { value: 1.0 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 uColor;
    uniform vec3 uBgColor;
    uniform float uExitFade;
    varying vec2 vUv;

    void main() {
      float d = distance(vUv, vec2(0.5, 0.5));
      float fade = smoothstep(0.5, 0.0, d);
      vec3 col = mix(uBgColor, vec3(0.08, 0.04, 0.03), fade * 0.35);
      gl_FragColor = vec4(col, fade * 0.35 * uExitFade);
    }
  `,
};

export default function HeroFeedWall() {
  const outerGroupRef = useRef<THREE.Group>(null);
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const shaderMatRef = useRef<THREE.ShaderMaterial>(null);
  const glowMatRef = useRef<THREE.ShaderMaterial>(null);
  const floorMatRef = useRef<THREE.ShaderMaterial>(null);
  const { size } = useThree();

  const isMobile = size.width < 768;
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const [perfSettings, setPerfSettings] = useState<PerfSettings>(perfStore.getSettings());

  useEffect(() => {
    return perfStore.subscribe((s) => setPerfSettings(s));
  }, []);

  // Configuration for 4:5 post screens (10 per column for seamless loop)
  const screenWidth = 1.15;
  const screenHeight = 1.4375; // 4:5 ratio
  const gapX = 0.22;
  const gapY = 0.22;
  const strideY = screenHeight + gapY;

  const cols = isMobile ? 2 : 3;
  const rowsPerCol = 10;
  const totalCount = cols * rowsPerCol;
  const totalSpanY = rowsPerCol * strideY;

  // Scroll state & Mouse smoothing
  const scrollOffsetRef = useRef(0);
  const currentSpeedRef = useRef(0.32);
  const prevProgressRef = useRef(0);
  const mouseLocalRef = useRef(new THREE.Vector3(999, 999, 0));
  const hoverFactorRef = useRef(0);
  const tempMatrix = useMemo(() => new THREE.Matrix4(), []);

  // Deterministic 60% light (#ECE8E1), 40% dark (#121214) evenly distributed across columns
  const isLightArray = useMemo(() => {
    const arr = new Float32Array(totalCount);
    for (let i = 0; i < totalCount; i++) {
      const col = Math.floor(i / rowsPerCol);
      const row = i % rowsPerCol;
      // Pattern produces exactly 60% light cards without clumps in any column
      arr[i] = (col * 2 + row) % 5 < 3 ? 1.0 : 0.0;
    }
    return arr;
  }, [totalCount, rowsPerCol]);

  // Feed Shader Material
  const feedMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector3(999, 999, 0) },
        uHoverStrength: { value: 1.0 },
        uOpacity: { value: 0.0 }, // Starts at 0.0, smoothly fades in over 0.6s
        uExitProgress: { value: 0.0 },
        uStretch: { value: 1.0 },
        uIsMobile: { value: isMobile ? 1.0 : 0.0 },
        uAccentColor: { value: new THREE.Color('#FF5A2B') },
        uBgColor: { value: new THREE.Color('#0B0A09') },
      },
      vertexShader: FeedShader.vertexShader,
      fragmentShader: FeedShader.fragmentShader,
      transparent: true,
      depthWrite: true,
    });
  }, [isMobile]);

  // Soft Radial Glow behind feed (Max 0.20 alpha at center)
  const glowMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color('#FF5A2B') },
        uExitFade: { value: 1.0 },
      },
      vertexShader: SoftGlowShader.vertexShader,
      fragmentShader: SoftGlowShader.fragmentShader,
      transparent: true,
      depthWrite: false,
    });
  }, []);

  // Floor Material
  const fakeFloorMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color('#FF5A2B') },
        uBgColor: { value: new THREE.Color('#0B0A09') },
        uExitFade: { value: 1.0 },
      },
      vertexShader: FakeFloorShader.vertexShader,
      fragmentShader: FakeFloorShader.fragmentShader,
      transparent: true,
      depthWrite: false,
    });
  }, []);

  // Column offsets (middle column offset by half screen)
  const colOffsets = useMemo(() => {
    const colOffs: number[] = [];
    for (let c = 0; c < cols; c++) {
      const middleCol = cols === 3 ? 1 : -1;
      const yOffset = c === middleCol ? strideY * 0.5 : 0;
      colOffs.push(yOffset);
    }
    return colOffs;
  }, [cols, strideY]);

  // Apply initial instance matrices immediately on mount to prevent 1-frame origin pile-up flicker
  useEffect(() => {
    if (!meshRef.current) return;
    let instanceIndex = 0;
    const colSpacing = screenWidth + gapX;
    const xStart = -((cols - 1) * colSpacing) / 2;

    for (let c = 0; c < cols; c++) {
      const colX = xStart + c * colSpacing;
      const colYOffset = colOffsets[c];
      for (let r = 0; r < rowsPerCol; r++) {
        const baseY = (r - rowsPerCol / 2) * strideY + colYOffset;
        tempMatrix.makeTranslation(colX, baseY, 0);
        meshRef.current.setMatrixAt(instanceIndex, tempMatrix);
        instanceIndex++;
      }
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [cols, rowsPerCol, strideY, colOffsets, tempMatrix]);

  // Dynamic frame loop
  useFrame((state, delta) => {
    if (!meshRef.current || !shaderMatRef.current) return;

    // 0. Smoothly fade in opacity over 0.6s
    const targetOpacity = isMobile ? 0.35 : 1.0;
    shaderMatRef.current.uniforms.uOpacity.value = THREE.MathUtils.damp(
      shaderMatRef.current.uniforms.uOpacity.value,
      targetOpacity,
      5.0,
      delta
    );

    // 1. Time uniform update
    shaderMatRef.current.uniforms.uTime.value = state.clock.elapsedTime;

    // 2. Mouse position and feed hover interaction from window-level listener
    const pointerX = windowPointerState.hasPointer ? windowPointerState.x : -999;
    const pointerY = windowPointerState.hasPointer ? windowPointerState.y : -999;

    const exitProgress = prefersReducedMotion ? 0 : heroScrollProgress.value;

    // Track scroll velocity from progress delta
    const deltaProgress = Math.max(0, exitProgress - prevProgressRef.current);
    prevProgressRef.current = exitProgress;
    const scrollVelocity = delta > 0 ? deltaProgress / delta : 0;
    const clampedVelocity = Math.min(scrollVelocity * 0.4, 1.6); // Flick boost

    // Check if mouse is near feed area (ignored once progress > 0.1)
    const isMouseNearFeed =
      !prefersReducedMotion &&
      exitProgress <= 0.1 &&
      windowPointerState.hasPointer &&
      pointerX > -0.15 &&
      perfSettings.feedHover;

    // Upward scroll speed accelerates up to 6x at progress 0.6 (mobile ~3x) + velocity
    const maxMultiplier = isMobile ? 3.0 : 6.0;
    const progressSpeedFactor = Math.sin(Math.min(1.0, exitProgress / 0.6) * (Math.PI / 2));
    const targetExitSpeed = 0.32 * (1.0 + (maxMultiplier - 1.0) * progressSpeedFactor) + clampedVelocity;

    const targetSpeed = prefersReducedMotion
      ? 0.32
      : isMouseNearFeed
      ? 0.0
      : targetExitSpeed;

    // Smooth speed damping: never runs backwards
    currentSpeedRef.current = THREE.MathUtils.damp(
      currentSpeedRef.current,
      targetSpeed,
      isMouseNearFeed ? 5.0 : 3.0,
      delta
    );
    if (currentSpeedRef.current < 0) currentSpeedRef.current = 0;

    // Increment vertical feed scroll
    scrollOffsetRef.current += currentSpeedRef.current * delta;

    // Motion stretch: 1.0 up to 1.25x based on current speed
    const normalSpeed = 0.32;
    const speedRatio = THREE.MathUtils.clamp(currentSpeedRef.current / normalSpeed, 1.0, 6.0);
    const stretch = prefersReducedMotion
      ? 1.0
      : THREE.MathUtils.lerp(1.0, 1.25, (speedRatio - 1.0) / 5.0);

    shaderMatRef.current.uniforms.uStretch.value = stretch;
    shaderMatRef.current.uniforms.uExitProgress.value = exitProgress;

    // Ambient glow & floor exit fade
    const exitFade = 1.0 - THREE.MathUtils.smoothstep(exitProgress, 0.55, 0.95);
    if (glowMatRef.current) {
      glowMatRef.current.uniforms.uExitFade.value = exitFade;
    }
    if (floorMatRef.current) {
      floorMatRef.current.uniforms.uExitFade.value = exitFade;
    }

    // Compute mouse in feed local coordinates
    if (isMouseNearFeed) {
      const localX = (pointerX - (isMobile ? 0.0 : 0.35)) * 3.8;
      const localY = pointerY * 3.2;
      mouseLocalRef.current.x = THREE.MathUtils.damp(
        mouseLocalRef.current.x,
        localX,
        8.0,
        delta
      );
      mouseLocalRef.current.y = THREE.MathUtils.damp(
        mouseLocalRef.current.y,
        localY,
        8.0,
        delta
      );
      hoverFactorRef.current = THREE.MathUtils.damp(
        hoverFactorRef.current,
        1.0,
        4.0,
        delta
      );
    } else {
      mouseLocalRef.current.set(999, 999, 0);
      hoverFactorRef.current = THREE.MathUtils.damp(
        hoverFactorRef.current,
        0.0,
        3.0,
        delta
      );
    }

    shaderMatRef.current.uniforms.uMouse.value.copy(mouseLocalRef.current);
    shaderMatRef.current.uniforms.uHoverStrength.value = hoverFactorRef.current;

    // 3. Update all instance matrices
    let instanceIndex = 0;
    const colSpacing = screenWidth + gapX;
    const xStart = -((cols - 1) * colSpacing) / 2;

    for (let c = 0; c < cols; c++) {
      const colX = xStart + c * colSpacing;
      const colYOffset = colOffsets[c];

      for (let r = 0; r < rowsPerCol; r++) {
        const baseY = (r - rowsPerCol / 2) * strideY + colYOffset;

        // Endless wrapping upward
        const rawY = baseY + scrollOffsetRef.current;
        const wrappedY = (((rawY + totalSpanY * 50) % totalSpanY) - totalSpanY / 2);

        tempMatrix.makeTranslation(colX, wrappedY, 0);
        meshRef.current.setMatrixAt(instanceIndex, tempMatrix);
        instanceIndex++;
      }
    }
    meshRef.current.instanceMatrix.needsUpdate = true;

    // 4. Hero Exit Transformation (Recede, Tilt back ~8°, Drift upward ~15%)
    const baseStartX = isMobile ? 0.0 : 1.75;
    const baseStartY = isMobile ? 0.0 : 0.05;
    const baseStartZ = isMobile ? -1.2 : 0.0;

    const currentX = baseStartX;
    const currentY = baseStartY + (prefersReducedMotion ? 0 : exitProgress * 0.65);
    const currentZ = baseStartZ + (prefersReducedMotion ? 0 : exitProgress * -0.75);

    if (outerGroupRef.current) {
      outerGroupRef.current.position.set(currentX, currentY, currentZ);
      outerGroupRef.current.scale.setScalar(1.0);
    }

    if (groupRef.current) {
      const rotPointerX = windowPointerState.hasPointer ? windowPointerState.x : 0;
      const rotPointerY = windowPointerState.hasPointer ? windowPointerState.y : 0;
      const baseRotY = isMobile ? 0.0 : 0.32;
      const targetRotY = baseRotY + rotPointerX * 0.04 * (1.0 - exitProgress);
      const exitTiltX = prefersReducedMotion ? 0 : -exitProgress * 0.14; // ~8° tilt back
      const targetRotX = -rotPointerY * 0.025 * (1.0 - exitProgress) + exitTiltX;

      groupRef.current.rotation.y = THREE.MathUtils.damp(
        groupRef.current.rotation.y,
        targetRotY,
        3.5,
        delta
      );
      groupRef.current.rotation.x = THREE.MathUtils.damp(
        groupRef.current.rotation.x,
        targetRotX,
        3.5,
        delta
      );
    }
  });

  return (
    <group ref={outerGroupRef}>
      <group ref={groupRef}>
        {/* Soft Radial Glow of Accent Colour behind the Feed Wall */}
        <mesh position={[0, 0, -0.3]}>
          <planeGeometry args={[6.0, 5.5]} />
          <primitive object={glowMaterial} ref={glowMatRef} attach="material" />
        </mesh>

        {/* ONE InstancedMesh for all post screens (1 Draw Call) */}
        <instancedMesh
          ref={meshRef}
          args={[undefined, undefined, totalCount]}
          frustumCulled={false}
        >
          <planeGeometry args={[screenWidth, screenHeight]}>
            <instancedBufferAttribute
              attach="attributes-aIsLight"
              args={[isLightArray, 1]}
            />
          </planeGeometry>
          <primitive object={feedMaterial} ref={shaderMatRef} attach="material" />
        </instancedMesh>

        {/* Soft floor with cheap fake reflection gradient */}
        {perfSettings.fakeReflection && (
          <mesh position={[0, -2.6, 0.8]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[8.0, 6.0]} />
            <primitive object={fakeFloorMaterial} ref={floorMatRef} attach="material" />
          </mesh>
        )}
      </group>
    </group>
  );
}
