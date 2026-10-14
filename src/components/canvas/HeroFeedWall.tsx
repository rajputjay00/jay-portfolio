'use client';

import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import reelsData from '@/../content/reels.json';
import { perfStore, PerfSettings } from '@/store/perfStore';
import { openingStore, OpeningStep } from '@/store/openingStore';
import { windowPointerState, heroScrollProgress, feedDragState } from '@/store/pointerStore';

// 1. Black & White Social Post Card Shader with Real Reel Poster Atlas
const FeedShader = {
  uniforms: {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector3(999, 999, 0) },
    uHoverStrength: { value: 1.0 },
    uOpacity: { value: 0.0 }, // Starts at 0.0 for clean 0.6s fade-in
    uExitProgress: { value: 0.0 },
    uStretch: { value: 1.0 },
    uIsMobile: { value: 0.0 },
    uIsTouchOrReduced: { value: 0.0 },
    uAccentColor: { value: new THREE.Color('#FF5A2B') },
    uBgColor: { value: new THREE.Color('#0B0A09') },
    uAtlas: { value: null },
    uAtlasFade: { value: 0.0 },
  },
  vertexShader: `
    attribute float aIsLight;
    attribute vec2 aCellCoord;
    uniform vec3 uMouse;
    uniform float uHoverStrength;
    uniform float uStretch;
    
    varying vec2 vUv;
    varying vec2 vCellCoord;
    varying float vHover;
    varying float vWorldY;
    varying float vLocalX;
    varying float vIsLight;

    void main() {
      vUv = uv;
      vCellCoord = aCellCoord;
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
      vLocalX = localInstancePos.x;

      gl_Position = projectionMatrix * modelViewMatrix * localInstancePos;
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform float uOpacity;
    uniform float uExitProgress;
    uniform float uIsMobile;
    uniform float uIsTouchOrReduced;
    uniform vec3 uAccentColor;
    uniform vec3 uBgColor;
    uniform sampler2D uAtlas;
    uniform float uAtlasFade;

    varying vec2 vUv;
    varying vec2 vCellCoord;
    varying float vHover;
    varying float vWorldY;
    varying float vLocalX;
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

      // 2. Exactly 60% Off-White (#ECE8E1) / 40% Near-Black (#121214) via aIsLight attribute (Placeholder)
      bool isLight = vIsLight > 0.5;
      vec3 cardBg = isLight ? vec3(0.925, 0.910, 0.882) : vec3(0.071, 0.071, 0.078);
      vec3 textBarColor = isLight ? vec3(0.18, 0.18, 0.20) : vec3(0.85, 0.84, 0.82);
      vec3 imageBlockColor = isLight ? vec3(0.68, 0.67, 0.65) : vec3(0.18, 0.18, 0.20);

      vec3 placeholderCol = cardBg;

      // Header row: avatar + handle bar
      vec2 avatarCenter = vec2(0.16, 0.90);
      float avatarDist = length(vec2(vUv.x - avatarCenter.x, (vUv.y - avatarCenter.y) * 1.25));
      if (avatarDist < 0.038) {
        placeholderCol = textBarColor;
      }
      if (vUv.x > 0.24 && vUv.x < 0.55 && abs(vUv.y - 0.90) < 0.012) {
        placeholderCol = textBarColor;
      }

      // Text bars
      float w1 = isLight ? 0.72 : 0.65;
      float w2 = isLight ? 0.48 : 0.56;
      if (vUv.x > 0.10 && vUv.x < (0.10 + w1) && abs(vUv.y - 0.80) < 0.010) {
        placeholderCol = textBarColor;
      }
      if (vUv.x > 0.10 && vUv.x < (0.10 + w2) && abs(vUv.y - 0.74) < 0.010) {
        placeholderCol = textBarColor;
      }

      // Image Block
      if (vUv.x > 0.10 && vUv.x < 0.90 && vUv.y > 0.16 && vUv.y < 0.66) {
        float innerGrain = (hash(vUv * 300.0) - 0.5) * 0.04;
        placeholderCol = imageBlockColor + vec3(innerGrain);
      }

      // Footer interaction dots
      if (vUv.y > 0.06 && vUv.y < 0.11) {
        if (abs(vUv.x - 0.14) < 0.02 || abs(vUv.x - 0.23) < 0.02 || abs(vUv.x - 0.32) < 0.02) {
          placeholderCol = textBarColor;
        }
      }

      // 3. Atlas Poster lookup (9:16 poster mapped onto 4:5 screen, aspect ratio preserved via cover)
      vec2 cellUv = vec2(vUv.x, (vUv.y - 0.5) * 0.703125 + 0.5);
      vec2 atlasUv = vec2((vCellCoord.x + cellUv.x) / 3.0, (2.0 - vCellCoord.y + cellUv.y) / 3.0);
      vec4 posterTex = texture2D(uAtlas, atlasUv);
      vec3 posterCol = posterTex.rgb * 0.95; // Brightness multiplier boosted to 0.95

      // Smooth 400ms fade from placeholder to real atlas poster
      vec3 col = mix(placeholderCol, posterCol, uAtlasFade);

      // 4. Pointer highlight & brightness:
      // Idle sits at 0.90, screen nearest pointer eases to full 1.0 brightness.
      // On touch devices and reduced motion: all screens sit at 0.95.
      float baseIdle = uIsTouchOrReduced > 0.5 ? 0.95 : 0.90;
      float hoverGain = (1.0 - baseIdle) * vHover * (1.0 - smoothstep(0.0, 0.10, uExitProgress));
      float activeBrightness = baseIdle + hoverGain;
      float brightness = mix(activeBrightness, 0.25, smoothstep(0.0, 0.75, uExitProgress));
      if (uIsMobile > 0.5) {
        brightness *= 0.7;
      }
      col *= brightness;

      // 5. Left 15% gradient on wall to preserve high contrast for hero text if screen overlaps
      float leftNorm = clamp((vLocalX - (-1.945)) / 0.58, 0.0, 1.0);
      float leftVignette = mix(0.80, 1.0, smoothstep(0.0, 1.0, leftNorm));
      col *= leftVignette;

      // 6. Hover accent edge glow (#FF5A2B) at top
      float hoverAtTop = vHover * (1.0 - smoothstep(0.0, 0.10, uExitProgress));
      float edgeGlow = smoothstep(0.04, 0.008, edgeDist) * hoverAtTop;
      col = mix(col, uAccentColor, edgeGlow * 0.90);

      // Blend card into background outside bezel
      col = mix(uBgColor, col, cardMask);

      // 7. Light edge vignette at extreme vertical top/bottom + exit fade
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
  const { size, gl } = useThree();

  const isMobile = size.width < 768;
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const [perfSettings, setPerfSettings] = useState<PerfSettings>(perfStore.getSettings());

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__HERO_FEED__ = {
        getScrollOffset: () => scrollOffsetRef.current,
        getCurrentSpeed: () => currentSpeedRef.current,
      };
    }
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

  // 9 cells distributed without neighboring repeats (horizontally, vertically, and wrapping)
  const cellCoordArray = useMemo(() => {
    const arr = new Float32Array(totalCount * 2);
    const pattern = [
      [0, 4, 8, 1, 5, 2, 6, 3, 7, 2], // col 0
      [3, 7, 2, 6, 0, 4, 8, 1, 5, 4], // col 1
      [6, 1, 5, 0, 7, 3, 1, 4, 8, 0], // col 2
    ];
    let idx = 0;
    for (let c = 0; c < cols; c++) {
      const colPattern = pattern[c % 3];
      for (let r = 0; r < rowsPerCol; r++) {
        const cellIndex = colPattern[r % 10];
        const cellX = cellIndex % 3;
        const cellY = Math.floor(cellIndex / 3);
        arr[idx * 2] = cellX;
        arr[idx * 2 + 1] = cellY;
        idx++;
      }
    }
    return arr;
  }, [totalCount, cols, rowsPerCol]);

  const atlasLoadedRef = useRef(false);
  const atlasFadeRef = useRef(0.0);

  const atlasTexture = useMemo(() => {
    const atlasPath = reelsData?.heroAtlas?.path || '/media/reels/hero-atlas.jpg';
    const tex = new THREE.TextureLoader().load(atlasPath, (loadedTex) => {
      loadedTex.colorSpace = THREE.SRGBColorSpace;
      loadedTex.generateMipmaps = true;
      loadedTex.minFilter = THREE.LinearMipmapLinearFilter;
      loadedTex.magFilter = THREE.LinearFilter;
      const maxAnisotropy = gl?.capabilities?.getMaxAnisotropy
        ? Math.min(gl.capabilities.getMaxAnisotropy(), 8)
        : 8;
      loadedTex.anisotropy = maxAnisotropy;
      loadedTex.needsUpdate = true;
      atlasLoadedRef.current = true;
    });
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    if (gl?.capabilities?.getMaxAnisotropy) {
      tex.anisotropy = Math.min(gl.capabilities.getMaxAnisotropy(), 8);
    }
    return tex;
  }, [gl]);

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
        uIsTouchOrReduced: { value: 0.0 },
        uAccentColor: { value: new THREE.Color('#FF5A2B') },
        uBgColor: { value: new THREE.Color('#0B0A09') },
        uAtlas: { value: atlasTexture },
        uAtlasFade: { value: 0.0 },
      },
      vertexShader: FeedShader.vertexShader,
      fragmentShader: FeedShader.fragmentShader,
      transparent: true,
      depthWrite: true,
    });
  }, [isMobile, atlasTexture]);

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

    // Atlas smooth 400ms fade once loaded
    const isAtlasReady =
      atlasLoadedRef.current ||
      Boolean(atlasTexture?.image && (atlasTexture.image as HTMLImageElement).complete);
    if (isAtlasReady && shaderMatRef.current && atlasFadeRef.current < 1.0) {
      atlasFadeRef.current = Math.min(1.0, atlasFadeRef.current + delta / 0.4);
      shaderMatRef.current.uniforms.uAtlasFade.value = atlasFadeRef.current;
    }

    // Touch or reduced motion fallback: all screens sit at 0.95
    const isTouchOrReduced = isMobile || prefersReducedMotion || !windowPointerState.hasPointer;
    shaderMatRef.current.uniforms.uIsTouchOrReduced.value = isTouchOrReduced ? 1.0 : 0.0;
    shaderMatRef.current.uniforms.uIsMobile.value = isMobile ? 1.0 : 0.0;

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

    const normalSpeed = 0.32;
    const baseTargetSpeed = prefersReducedMotion ? normalSpeed : targetExitSpeed;

    if (feedDragState.isDragging) {
      // 1. Direct 1:1 vertical tracking with pointer
      scrollOffsetRef.current += feedDragState.dragDeltaY;
      feedDragState.dragDeltaY = 0;
      currentSpeedRef.current = THREE.MathUtils.clamp(
        Math.abs(feedDragState.trackedVelocity),
        0,
        normalSpeed * 6.0
      );
    } else if (feedDragState.frictionTimeRemaining > 0) {
      // 2. Post-release: keep throw velocity and ease back to normal speed & direction over 1.2s
      feedDragState.frictionElapsed += delta;
      const t = Math.min(1.0, feedDragState.frictionElapsed / 1.2);
      // Cubic ease-out: 1 - (1 - t)^3
      const ease = 1 - Math.pow(1 - t, 3);
      const currentVel = THREE.MathUtils.lerp(feedDragState.throwVelocity, baseTargetSpeed, ease);
      scrollOffsetRef.current += currentVel * delta;
      currentSpeedRef.current = currentVel;
      feedDragState.frictionTimeRemaining -= delta;
      if (feedDragState.frictionTimeRemaining <= 0) {
        feedDragState.frictionTimeRemaining = 0;
      }
    } else {
      // 3. Normal speed damping and continuous upward travel
      currentSpeedRef.current = THREE.MathUtils.damp(
        currentSpeedRef.current,
        baseTargetSpeed,
        3.0,
        delta
      );
      if (currentSpeedRef.current < 0 && prefersReducedMotion) currentSpeedRef.current = 0;
      scrollOffsetRef.current += currentSpeedRef.current * delta;
    }

    // Motion stretch: 1.0 up to 1.25x based on current speed
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
    const baseStartX = isMobile ? 0.0 : 1.80;
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
            <instancedBufferAttribute
              attach="attributes-aCellCoord"
              args={[cellCoordArray, 2]}
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
