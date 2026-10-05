'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, RoundedBox } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';

interface ExperienceProps {
  isDev?: boolean;
}

export default function Experience({ isDev = false }: ExperienceProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.4;
      meshRef.current.rotation.y += delta * 0.6;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.2;
      ringRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  return (
    <>
      <color attach="background" args={['#070709']} />
      <fog attach="fog" args={['#070709', 5, 20]} />

      {/* Atmospheric lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 5]} intensity={1.5} color="#ffffff" />
      <pointLight position={[-4, 2, -2]} intensity={2.0} color="#ff3366" distance={10} />
      <pointLight position={[4, -2, 2]} intensity={1.5} color="#4f46e5" distance={10} />

      {/* Test 3D Object: Sleek sculpted cube with orbiting accent ring */}
      <group position={[0, 0, 0]}>
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.8}>
          <RoundedBox
            ref={meshRef}
            args={[1.4, 1.4, 1.4]}
            radius={0.15}
            smoothness={4}
          >
            <meshStandardMaterial
              color="#12131a"
              roughness={0.2}
              metalness={0.9}
              emissive="#1a1c29"
              emissiveIntensity={0.2}
            />
          </RoundedBox>

          {/* Accent glowing ring around the test object */}
          <mesh ref={ringRef} rotation={[Math.PI / 3, 0, 0]}>
            <torusGeometry args={[1.8, 0.02, 16, 100]} />
            <meshStandardMaterial
              color="#ff4757"
              emissive="#ff4757"
              emissiveIntensity={2.0}
              toneMapped={false}
            />
          </mesh>
        </Float>
      </group>

      {/* Subtle architectural floor grid */}
      <gridHelper
        args={[30, 30, '#222233', '#111118']}
        position={[0, -2, 0]}
      />

      {/* Subtle Postprocessing */}
      <EffectComposer multisampling={4}>
        <Bloom
          luminanceThreshold={0.8}
          luminanceSmoothing={0.3}
          intensity={0.8}
          mipmapBlur
        />
        <Vignette eskil={false} offset={0.2} darkness={0.8} />
      </EffectComposer>
    </>
  );
}
