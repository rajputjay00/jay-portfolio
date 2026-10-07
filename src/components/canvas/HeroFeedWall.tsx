'use client';

import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { perfStore } from '@/store/perfStore';
import { openingStore, OpeningStep } from '@/store/openingStore';

// Feed Screen Shader: Dark matte, warm grain, vertex lift & soft #FF4757 edge glow on hover
const FeedShader = {
  uniforms: {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector3(999, 999, 0) },
    uHoverStrength: { value: 1.0 },
    uOpacity: { value: 1.0 },
    uAccentColor: { value: new THREE.Color('#ff4757') },
    uBgColor: { value: new THREE.Color('#08090c') },
  },
  vertexShader: `
    uniform vec3 uMouse;
    uniform float uHoverStrength;
    
    varying vec2 vUv;
    varying float vHover;
    varying float vWorldY;
    varying float vSeed;

    void main() {
      vUv = uv;

      // Extract instance center in model space
      vec4 instPos = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
      vSeed = fract(sin(dot(instPos.xy, vec2(12.9898, 78.233))) * 43758.5453);
      
      // Calculate distance between instance center and mouse position in local feed plane
      float dist = distance(instPos.xy, uMouse.xy);
      float hoverFactor = smoothstep(1.7, 0.1, dist) * uHoverStrength;
      vHover = hoverFactor;

      // Lift screen forward toward viewer when hovered
      vec3 pos = position;
      pos.z += hoverFactor * 0.28;

      vec4 localInstancePos = instanceMatrix * vec4(pos, 1.0);
      vWorldY = localInstancePos.y;

      gl_Position = projectionMatrix * modelViewMatrix * localInstancePos;
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform float uOpacity;
    uniform vec3 uAccentColor;
    uniform vec3 uBgColor;

    varying vec2 vUv;
    varying float vHover;
    varying float vWorldY;
    varying float vSeed;

    // Fast pseudo-random warm film grain hash
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    float uvEdge(vec2 uv) {
      return min(min(uv.x, 1.0 - uv.x), min(uv.y, 1.0 - uv.y));
    }

    void main() {
      // 1. Sleek card surface with subtle per-instance tonal variation
      vec3 cardSurface = vec3(0.085, 0.09, 0.115) + vec3(vSeed * 0.025);
      
      // Card edge boundary
      float edgeX = min(vUv.x, 1.0 - vUv.x);
      float edgeY = min(vUv.y, 1.0 - vUv.y);
      float edgeDist = min(edgeX * 1.25, edgeY);
      
      // Thin inner border line (1px subtle grey outline)
      float borderLine = smoothstep(0.02, 0.012, edgeDist) * smoothstep(0.005, 0.012, edgeDist);
      vec3 baseColor = mix(cardSurface, vec3(0.22, 0.23, 0.28), borderLine * 0.7);

      // Brighten slightly on hover
      baseColor += vec3(0.06, 0.06, 0.08) * vHover;

      // 2. Subtle warm grain
      float grain = (hash(vUv * 450.0 + fract(uTime * 10.0)) - 0.5) * 0.035;
      baseColor += vec3(grain * 1.05, grain * 0.98, grain * 0.90);

      // 3. Subtle soft #FF4757 edge glow on hover
      float hoverGlow = smoothstep(0.065, 0.008, edgeDist) * vHover;
      vec3 finalColor = mix(baseColor, uAccentColor, hoverGlow * 0.75);

      // Outer bezel darkness
      float outerBezel = smoothstep(0.0, 0.015, edgeDist);
      finalColor = mix(vec3(0.03, 0.035, 0.045), finalColor, outerBezel);

      // 4. Vertical fade into background (#08090C) at top and bottom
      float topBottomFade = smoothstep(-3.8, -1.8, vWorldY) * (1.0 - smoothstep(1.8, 3.8, vWorldY));
      topBottomFade = clamp(topBottomFade, 0.0, 1.0);
      finalColor = mix(uBgColor, finalColor, topBottomFade);

      gl_FragColor = vec4(finalColor, uOpacity * topBottomFade);
    }
  `,
};

// Fake soft floor reflection shader
const FakeFloorShader = {
  uniforms: {
    uColor: { value: new THREE.Color('#ff4757') },
    uBgColor: { value: new THREE.Color('#08090c') },
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
    varying vec2 vUv;

    void main() {
      // Soft radial gradient fade on the floor
      float d = distance(vUv, vec2(0.5, 0.5));
      float fade = smoothstep(0.5, 0.0, d);
      vec3 col = mix(uBgColor, vec3(0.07, 0.04, 0.05), fade * 0.35);
      gl_FragColor = vec4(col, fade * 0.4);
    }
  `,
};

export default function HeroFeedWall() {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const shaderMatRef = useRef<THREE.ShaderMaterial>(null);
  const floorMatRef = useRef<THREE.ShaderMaterial>(null);
  const { viewport, size } = useThree();

  const isMobile = size.width < 768;
  const prefersReducedMotion = typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const [openingStep, setOpeningStep] = useState<OpeningStep>(openingStore.getStep());
  const [perfSettings, setPerfSettings] = useState(perfStore.getSettings());

  useEffect(() => {
    const unsubOpening = openingStore.subscribe((s) => setOpeningStep(s));
    const unsubPerf = perfStore.subscribe((s) => setPerfSettings(s));
    return () => {
      unsubOpening();
      unsubPerf();
    };
  }, []);

  // Configuration for 4:5 post screens
  const screenWidth = 1.15;
  const screenHeight = 1.4375; // 4:5 ratio
  const gapX = 0.22;
  const gapY = 0.22;
  const strideY = screenHeight + gapY;

  const cols = isMobile ? 2 : 3;
  const rowsPerCol = isMobile ? 5 : 7;
  const totalCount = cols * rowsPerCol;
  const totalSpanY = rowsPerCol * strideY;

  // Scroll state & Mouse smoothing
  const scrollOffsetRef = useRef(0);
  const currentSpeedRef = useRef(0.35);
  const mouseLocalRef = useRef(new THREE.Vector3(999, 999, 0));
  const hoverFactorRef = useRef(0);
  const tempMatrix = useMemo(() => new THREE.Matrix4(), []);

  // Build shader material
  const feedMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector3(999, 999, 0) },
        uHoverStrength: { value: 1.0 },
        uOpacity: { value: isMobile ? 0.35 : 1.0 },
        uAccentColor: { value: new THREE.Color('#ff4757') },
        uBgColor: { value: new THREE.Color('#08090c') },
      },
      vertexShader: FeedShader.vertexShader,
      fragmentShader: FeedShader.fragmentShader,
      transparent: true,
      depthWrite: true,
    });
  }, [isMobile]);

  const fakeFloorMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color('#ff4757') },
        uBgColor: { value: new THREE.Color('#08090c') },
      },
      vertexShader: FakeFloorShader.vertexShader,
      fragmentShader: FakeFloorShader.fragmentShader,
      transparent: true,
      depthWrite: false,
    });
  }, []);

  // Setup per-instance attribute seeds
  const { colOffsets, seeds } = useMemo(() => {
    const colOffs: number[] = [];
    const s: number[] = [];

    for (let c = 0; c < cols; c++) {
      // Middle column is vertically offset by half a screen
      const middleCol = cols === 3 ? 1 : -1;
      const yOffset = c === middleCol ? strideY * 0.5 : 0;
      colOffs.push(yOffset);
    }

    for (let i = 0; i < totalCount; i++) {
      s.push((i * 1.618) % 1.0);
    }

    return { colOffsets: colOffs, seeds: new Float32Array(s) };
  }, [cols, totalCount, strideY]);

  // Dynamic frame loop
  useFrame((state, delta) => {
    if (!meshRef.current || !shaderMatRef.current) return;

    // 1. Time uniform update
    shaderMatRef.current.uniforms.uTime.value = state.clock.elapsedTime;

    // 2. Mouse position and feed hover interaction
    const pointerX = state.pointer.x; // -1 to +1
    const pointerY = state.pointer.y; // -1 to +1

    // Check if mouse is on the right feed side on desktop (pointer.x > -0.15)
    const isMouseNearFeed = !isMobile && !prefersReducedMotion && pointerX > -0.15 && perfSettings.feedHover;
    const targetSpeed = isMouseNearFeed || prefersReducedMotion ? 0.0 : 0.35;

    // Spring / Eased deceleration when hovering feed
    currentSpeedRef.current = THREE.MathUtils.damp(
      currentSpeedRef.current,
      targetSpeed,
      isMouseNearFeed ? 5.0 : 2.0,
      delta
    );

    // Increment vertical feed scroll
    scrollOffsetRef.current += currentSpeedRef.current * delta;

    // Compute mouse in feed local coordinates
    if (isMouseNearFeed) {
      // Convert screen pointer into local wall space
      const localX = (pointerX - (isMobile ? 0.0 : 0.35)) * 3.8;
      const localY = pointerY * 3.2;
      mouseLocalRef.current.x = THREE.MathUtils.damp(mouseLocalRef.current.x, localX, 8.0, delta);
      mouseLocalRef.current.y = THREE.MathUtils.damp(mouseLocalRef.current.y, localY, 8.0, delta);
      hoverFactorRef.current = THREE.MathUtils.damp(hoverFactorRef.current, 1.0, 4.0, delta);
    } else {
      mouseLocalRef.current.set(999, 999, 0);
      hoverFactorRef.current = THREE.MathUtils.damp(hoverFactorRef.current, 0.0, 3.0, delta);
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
        const wrappedY = ((((rawY + totalSpanY * 50) % totalSpanY) - totalSpanY / 2));

        tempMatrix.makeTranslation(colX, wrappedY, 0);
        meshRef.current.setMatrixAt(instanceIndex, tempMatrix);
        instanceIndex++;
      }
    }
    meshRef.current.instanceMatrix.needsUpdate = true;

    // 4. Subtle mouse parallax on the whole wall
    if (groupRef.current) {
      const targetRotY = (isMobile ? 0 : 0.35) + (pointerX * 0.05); // ~20 deg rotated toward text
      const targetRotX = -pointerY * 0.03;
      groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, targetRotY, 3.0, delta);
      groupRef.current.rotation.x = THREE.MathUtils.damp(groupRef.current.rotation.x, targetRotX, 3.0, delta);
    }
  });

  // Position: desktop places wall on the right 55% (~x = 1.6..1.9), mobile centers it behind text
  const groupPosition: [number, number, number] = isMobile ? [0, 0, -1.2] : [1.75, 0.05, 0.0];

  return (
    <group position={groupPosition}>
      <group ref={groupRef}>
        {/* ONE InstancedMesh for all post screens (1 Draw Call) */}
        <instancedMesh
          ref={meshRef}
          args={[undefined, undefined, totalCount]}
          frustumCulled={false}
        >
          <planeGeometry args={[screenWidth, screenHeight]} />
          <primitive object={feedMaterial} ref={shaderMatRef} attach="material" />
        </instancedMesh>

        {/* Soft floor with cheap fake reflection gradient (Zero real-time reflector overhead) */}
        {perfSettings.fakeReflection && (
          <mesh position={[0, -2.4, 0.8]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[8.0, 6.0]} />
            <primitive object={fakeFloorMaterial} ref={floorMatRef} attach="material" />
          </mesh>
        )}
      </group>
    </group>
  );
}
