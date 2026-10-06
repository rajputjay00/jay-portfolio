'use client';

import React, { useMemo, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { MeshReflectorMaterial, Text } from '@react-three/drei';
import { ZONES } from '@/constants/zones';
import { perfStore, PerfSettings } from '@/store/perfStore';

// Custom Soft Volumetric Light Beam Shader with smooth vertical & radial falloff
const SoftBeamShader = {
  uniforms: {
    uColor: { value: new THREE.Color('#fff2e6') },
    uOpacity: { value: 0.03 },
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 uColor;
    uniform float uOpacity;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      // Smooth vertical fade: bright at the ceiling fixture (uv.y = 1.0), fading softly to zero at the floor (uv.y = 0.0)
      float verticalFade = smoothstep(0.0, 0.95, vUv.y);

      // Radial edge fade to eliminate any hard cone polygon silhouette
      float edgeFade = pow(vUv.y, 0.5);

      float alpha = uOpacity * verticalFade * edgeFade;

      gl_FragColor = vec4(uColor, alpha);
    }
  `,
};

export default function LabArchitecture() {
  const [perfSettings, setPerfSettings] = useState<PerfSettings>(perfStore.getSettings());

  useEffect(() => {
    return perfStore.subscribe((s) => setPerfSettings(s));
  }, []);

  const columnsCount = 28;
  const columnSpacing = 6;
  const startZ = 20;

  // Instanced columns along left and right walls for maximum performance (1 draw call)
  const [instancedLeft, instancedRight] = useMemo(() => {
    const leftMatrices: THREE.Matrix4[] = [];
    const rightMatrices: THREE.Matrix4[] = [];
    const tempObj = new THREE.Object3D();

    for (let i = 0; i < columnsCount; i++) {
      const z = startZ - i * columnSpacing;

      // Left column
      tempObj.position.set(-8.5, 6, z);
      tempObj.scale.set(0.4, 14, 0.8);
      tempObj.updateMatrix();
      leftMatrices.push(tempObj.matrix.clone());

      // Right column
      tempObj.position.set(8.5, 6, z);
      tempObj.scale.set(0.4, 14, 0.8);
      tempObj.updateMatrix();
      rightMatrices.push(tempObj.matrix.clone());
    }

    return [leftMatrices, rightMatrices];
  }, [columnsCount, columnSpacing, startZ]);

  const leftInstancedMeshRef = useRef<THREE.InstancedMesh>(null);
  const rightInstancedMeshRef = useRef<THREE.InstancedMesh>(null);

  React.useEffect(() => {
    if (leftInstancedMeshRef.current) {
      instancedLeft.forEach((mat, idx) => {
        leftInstancedMeshRef.current!.setMatrixAt(idx, mat);
      });
      leftInstancedMeshRef.current.instanceMatrix.needsUpdate = true;
    }
    if (rightInstancedMeshRef.current) {
      instancedRight.forEach((mat, idx) => {
        rightInstancedMeshRef.current!.setMatrixAt(idx, mat);
      });
      rightInstancedMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [instancedLeft, instancedRight]);

  // Light beam positions corresponding to architectural key sections
  const lightBeamPositions: [number, number, number][] = useMemo(() => [
    [0, 11, 8],
    [0, 11, -10],
    [-2, 11, -28],
    [2, 11, -46],
    [-2, 11, -64],
    [2, 11, -82],
    [-2, 11, -100],
    [2, 11, -118],
    [0, 11, -136],
  ], []);

  const softBeamMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color('#fff4e8') },
        uOpacity: { value: 0.028 },
      },
      vertexShader: SoftBeamShader.vertexShader,
      fragmentShader: SoftBeamShader.fragmentShader,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  return (
    <group>
      {/* 1. POLISHED REFLECTIVE FLOOR */}
      <mesh position={[0, -0.01, -70]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 220]} />
        {perfSettings.floorReflection ? (
          <MeshReflectorMaterial
            blur={[0, 0]}
            resolution={256}
            mirror={0.35}
            mixBlur={0.8}
            mixStrength={1.2}
            roughness={0.35}
            metalness={0.7}
            depthScale={1.1}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            color="#08080c"
          />
        ) : (
          <meshStandardMaterial
            color="#08080c"
            roughness={0.4}
            metalness={0.6}
          />
        )}
      </mesh>

      {/* 2. TALL ARCHITECTURAL WALLS (Dark Concrete / Matte Plaster) */}
      {/* Left Wall */}
      <mesh position={[-9, 6.5, -70]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[220, 15]} />
        <meshStandardMaterial
          color="#0b0b10"
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>

      {/* Right Wall */}
      <mesh position={[9, 6.5, -70]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[220, 15]} />
        <meshStandardMaterial
          color="#0b0b10"
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>

      {/* Back / End Wall */}
      <mesh position={[0, 6.5, -170]}>
        <planeGeometry args={[20, 15]} />
        <meshStandardMaterial
          color="#07070a"
          roughness={0.95}
          metalness={0.05}
        />
      </mesh>

      {/* High Ceiling fading into darkness */}
      <mesh position={[0, 13.5, -70]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 220]} />
        <meshStandardMaterial
          color="#040406"
          roughness={0.98}
          metalness={0.0}
        />
      </mesh>

      {/* 3. INSTANCED ARCHITECTURAL COLUMNS (1 draw call per side) */}
      {perfSettings.wallFins && (
        <>
          <instancedMesh
            ref={leftInstancedMeshRef}
            args={[undefined, undefined, columnsCount]}
          >
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial
              color="#111118"
              roughness={0.7}
              metalness={0.2}
            />
          </instancedMesh>

          <instancedMesh
            ref={rightInstancedMeshRef}
            args={[undefined, undefined, columnsCount]}
          >
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial
              color="#111118"
              roughness={0.7}
              metalness={0.2}
            />
          </instancedMesh>
        </>
      )}

      {/* 4. SOFT VOLUMETRIC LIGHT BEAMS & FLOOR LIGHT POOLS */}
      {perfSettings.lightBeams &&
        lightBeamPositions.map((pos, idx) => (
          <group key={`beam-${idx}`} position={pos}>
            {/* Ceiling recessed fixture */}
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.6, 0.6, 0.08, 16]} />
              <meshStandardMaterial
                color="#ffffff"
                emissive="#ffecd9"
                emissiveIntensity={1.4}
                toneMapped={false}
              />
            </mesh>

            {/* Soft volumetric beam with vertical falloff */}
            <mesh position={[0, -5.5, 0]}>
              <cylinderGeometry args={[0.6, 3.2, 11, 24, 1, true]} />
              <primitive object={softBeamMaterial} attach="material" />
            </mesh>

            {/* Soft light pool on the floor beneath the beam */}
            <mesh position={[0, -10.98, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[2.8, 32]} />
              <meshBasicMaterial
                color="#ffecd9"
                transparent
                opacity={0.03}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </mesh>
          </group>
        ))}

      {/* 5. 9 ZONE FLOOR MARKERS */}
      {ZONES.slice(1).map((zone) => {
        const targetZ = zone.targetLookAt[2] + 4;
        const targetX = zone.targetLookAt[0];

        return (
          <group key={zone.id} position={[targetX, 0.02, targetZ]}>
            {/* Outer etched circle */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[2.2, 2.24, 48]} />
              <meshBasicMaterial
                color="#ff4757"
                transparent
                opacity={0.25}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Inner faint accent disc */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[2.2, 32]} />
              <meshBasicMaterial
                color="#ffffff"
                transparent
                opacity={0.015}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Corner alignment crosshairs */}
            <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.8, 0.02]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
            </mesh>
            <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.02, 0.8]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
            </mesh>

            {/* Zone Label Text etched on floor */}
            <Text
              position={[0, 0.01, 1.4]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={0.22}
              letterSpacing={0.12}
              color="#a1a1aa"
              anchorX="center"
              anchorY="middle"
            >
              {zone.label}
            </Text>
          </group>
        );
      })}
    </group>
  );
}
