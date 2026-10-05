'use client';

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { MeshReflectorMaterial, Text } from '@react-three/drei';
import { ZONES } from '@/constants/zones';

export default function LabArchitecture() {
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

  return (
    <group>
      {/* 1. POLISHED REFLECTIVE FLOOR */}
      <mesh position={[0, -0.01, -70]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 220]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={512}
          mirror={0.4}
          mixBlur={0.85}
          mixStrength={1.5}
          roughness={0.3}
          metalness={0.75}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#0a0a0e"
        />
      </mesh>

      {/* 2. TALL ARCHITECTURAL WALLS (Dark Concrete / Matte Plaster) */}
      {/* Left Wall */}
      <mesh position={[-9, 6.5, -70]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[220, 15]} />
        <meshStandardMaterial
          color="#0d0d12"
          roughness={0.85}
          metalness={0.1}
        />
      </mesh>

      {/* Right Wall */}
      <mesh position={[9, 6.5, -70]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[220, 15]} />
        <meshStandardMaterial
          color="#0d0d12"
          roughness={0.85}
          metalness={0.1}
        />
      </mesh>

      {/* Back / End Wall */}
      <mesh position={[0, 6.5, -170]}>
        <planeGeometry args={[20, 15]} />
        <meshStandardMaterial
          color="#09090d"
          roughness={0.9}
          metalness={0.05}
        />
      </mesh>

      {/* High Ceiling fading into darkness */}
      <mesh position={[0, 13.5, -70]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 220]} />
        <meshStandardMaterial
          color="#050508"
          roughness={0.95}
          metalness={0.0}
        />
      </mesh>

      {/* 3. INSTANCED ARCHITECTURAL COLUMNS (1 draw call per side) */}
      <instancedMesh
        ref={leftInstancedMeshRef}
        args={[undefined, undefined, columnsCount]}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#13131b"
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
          color="#13131b"
          roughness={0.7}
          metalness={0.2}
        />
      </instancedMesh>

      {/* 4. SOFT VOLUMETRIC LIGHT BEAMS */}
      {lightBeamPositions.map((pos, idx) => (
        <group key={`beam-${idx}`} position={pos}>
          {/* Ceiling recessed light fixture */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.7, 0.7, 0.1, 16]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffeedd"
              emissiveIntensity={1.8}
              toneMapped={false}
            />
          </mesh>

          {/* Soft volumetric conical beam */}
          <mesh position={[0, -5.5, 0]}>
            <coneGeometry args={[2.5, 11, 16, 1, true]} />
            <meshBasicMaterial
              color="#ffeedd"
              transparent
              opacity={0.035}
              depthWrite={false}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </group>
      ))}

      {/* 5. 9 ZONE FLOOR MARKERS */}
      {ZONES.slice(1).map((zone, idx) => {
        const targetZ = zone.targetLookAt[2] + 4; // Position marker on floor in zone
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
