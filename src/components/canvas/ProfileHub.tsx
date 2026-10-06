'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { scrollManager } from '@/store/scrollStore';
import { perfStore, PerfSettings } from '@/store/perfStore';
import profileData from '@/../content/profile.json';
import resultsData from '@/../content/results.json';

// Shared geometries for performance
const tileBoxGeometry = new THREE.BoxGeometry(2.54, 1.52, 0.08);
const tileScreenGeometry = new THREE.PlaneGeometry(2.46, 1.44);

interface GridTileData {
  id: string;
  index: string;
  category: string; // 'Case study' | 'Explore' | 'Contact'
  title: string;
  metric: string;
  metricLabel: string;
  isDm?: boolean;
  targetT: number;
}

const TILES: GridTileData[] = [
  {
    id: 'creativefuel',
    index: '01',
    category: 'Case study',
    title: 'Creativefuel',
    metric: '401K',
    metricLabel: 'followers · 4 pages managed',
    targetT: 0.22,
  },
  {
    id: 'brand-social',
    index: '02',
    category: 'Case study',
    title: 'Brand Social',
    metric: '5',
    metricLabel: 'national brands (Flipkart, Realme)',
    targetT: 0.22,
  },
  {
    id: 'strictly-for-corporate',
    index: '03',
    category: 'Case study',
    title: 'Strictly For Corporate',
    metric: '39.5K',
    metricLabel: 'followers built from scratch',
    targetT: 0.22,
  },
  {
    id: 'campus-community',
    index: '04',
    category: 'Case study',
    title: 'Campus & Community',
    metric: 'TEDx',
    metricLabel: 'TEDxIPSA Indore & GDGOC',
    targetT: 0.22,
  },
  {
    id: 'retention-theatre',
    index: '05',
    category: 'Explore',
    title: 'Retention Theatre',
    metric: 'Curve',
    metricLabel: 'interactive retention scrub',
    targetT: 0.33,
  },
  {
    id: 'range-wall',
    index: '06',
    category: 'Explore',
    title: 'Range Wall',
    metric: '3 Voices',
    metricLabel: 'Community · Character · Brand',
    targetT: 0.44,
  },
  {
    id: 'strategy-room',
    index: '07',
    category: 'Explore',
    title: 'Strategy Room',
    metric: '7 Blocks',
    metricLabel: 'live campaign assembly system',
    targetT: 0.55,
  },
  {
    id: 'results-wall',
    index: '08',
    category: 'Explore',
    title: 'Results Wall',
    metric: 'Proof',
    metricLabel: 'verified metrics & reach stats',
    targetT: 0.77,
  },
  {
    id: 'message-jay',
    index: '09',
    category: 'Contact',
    title: 'Message Jay (DM)',
    metric: 'Chat',
    metricLabel: 'hiring & project lead inquiry',
    isDm: true,
    targetT: 1.0,
  },
];

interface HighlightRingData {
  id: string;
  name: string;
  targetT: number;
  position: [number, number, number];
}

// Five highlight rings laid completely flat on the floor in front of the wall
const HIGHLIGHTS: HighlightRingData[] = [
  { id: 'work', name: 'Work', targetT: 0.22, position: [-3.8, 0.02, -6.5] },
  { id: 'strategy', name: 'Strategy', targetT: 0.55, position: [-1.9, 0.02, -6.5] },
  { id: 'results', name: 'Results', targetT: 0.77, position: [0.0, 0.02, -6.5] },
  { id: 'services', name: 'Services', targetT: 0.88, position: [1.9, 0.02, -6.5] },
  { id: 'about', name: 'About', targetT: 0.88, position: [3.8, 0.02, -6.5] },
];

function GridTile({
  tile,
  position,
  showText,
}: {
  tile: GridTileData;
  position: [number, number, number];
  showText: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const meshFaceRef = useRef<THREE.Mesh>(null);
  const hoveredRef = useRef(false);
  const currentRotX = useRef(0);
  const currentRotY = useRef(0);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    let targetRotX = 0;
    let targetRotY = 0;

    if (hoveredRef.current) {
      targetRotX = (state.pointer.y * 0.25 - position[1] * 0.03);
      targetRotY = (state.pointer.x * 0.25 - position[0] * 0.03);
    }

    currentRotX.current = THREE.MathUtils.damp(currentRotX.current, targetRotX, 7, delta);
    currentRotY.current = THREE.MathUtils.damp(currentRotY.current, targetRotY, 7, delta);

    groupRef.current.rotation.x = currentRotX.current;
    groupRef.current.rotation.y = currentRotY.current;
    groupRef.current.position.z = THREE.MathUtils.damp(
      groupRef.current.position.z,
      hoveredRef.current ? position[2] + 0.16 : position[2],
      6,
      delta
    );
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    scrollManager.scrollToProgress(tile.targetT, 1.6);
  };

  const isDm = tile.isDm;

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        hoveredRef.current = true;
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        hoveredRef.current = false;
        document.body.style.cursor = 'auto';
      }}
      onClick={handleClick}
    >
      {/* 1. Real Physical Thickness Bezel (Near-Black Glass Frame) */}
      <mesh geometry={tileBoxGeometry}>
        <meshStandardMaterial
          color="#0c0d14"
          roughness={0.25}
          metalness={0.85}
          emissive={isDm ? '#ff4757' : '#1a1c26'}
          emissiveIntensity={isDm ? 0.25 : 0.06}
        />
      </mesh>

      {/* 2. Screen Surface with subtle warm glass tone */}
      <mesh ref={meshFaceRef} position={[0, 0, 0.042]} geometry={tileScreenGeometry}>
        <meshStandardMaterial
          color="#0e0f17"
          roughness={0.2}
          metalness={0.7}
          emissive={isDm ? '#ff4757' : '#141620'}
          emissiveIntensity={isDm ? 0.15 : 0.05}
        />
      </mesh>

      {/* 3. Subtle Top Accent Line (Neutral warm-white by default, #ff4757 on hover or DM tile) */}
      <mesh position={[0, 0.71, 0.044]}>
        <planeGeometry args={[2.42, 0.02]} />
        <meshBasicMaterial
          color={isDm ? '#ff4757' : '#ffffff'}
          transparent
          opacity={isDm ? 0.8 : 0.2}
        />
      </mesh>

      {/* 4. Tile Content (Unified warm-white typography) */}
      {showText && (
        <>
          {/* Small Category Label: "Case study" | "Explore" | "Contact" */}
          <Text
            position={[-1.08, 0.54, 0.046]}
            fontSize={0.09}
            letterSpacing={0.08}
            color={isDm ? '#ff4757' : '#a1a1aa'}
            anchorX="left"
            anchorY="top"
            fontWeight={600}
          >
            {tile.category}
          </Text>

          {/* Main Title */}
          <Text
            position={[-1.08, 0.34, 0.046]}
            fontSize={0.18}
            letterSpacing={-0.01}
            color="#ffffff"
            anchorX="left"
            anchorY="top"
            fontWeight={700}
            maxWidth={2.2}
          >
            {tile.title}
          </Text>

          {/* Big Headline Metric */}
          <Text
            position={[-1.08, -0.04, 0.046]}
            fontSize={0.32}
            letterSpacing={-0.02}
            color="#f4f4f6"
            anchorX="left"
            anchorY="top"
            fontWeight={800}
          >
            {tile.metric}
          </Text>

          {/* Metric Description */}
          <Text
            position={[-1.08, -0.42, 0.046]}
            fontSize={0.092}
            letterSpacing={0.02}
            color="#8e8ea0"
            anchorX="left"
            anchorY="top"
            maxWidth={2.2}
            lineHeight={1.2}
          >
            {tile.metricLabel}
          </Text>
        </>
      )}
    </group>
  );
}

function HighlightRing({
  ring,
  showText,
}: {
  ring: HighlightRingData;
  showText: boolean;
}) {
  const hoveredRef = useRef(false);
  const meshRef = useRef<THREE.Group>(null);

  const handleClick = (e: any) => {
    e.stopPropagation();
    scrollManager.scrollToProgress(ring.targetT, 1.6);
  };

  return (
    <group
      ref={meshRef}
      position={ring.position}
      onPointerOver={(e) => {
        e.stopPropagation();
        hoveredRef.current = true;
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        hoveredRef.current = false;
        document.body.style.cursor = 'auto';
      }}
      onClick={handleClick}
    >
      {/* Outer Lit Ring (Completely flat on the floor) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <ringGeometry args={[0.55, 0.58, 36]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.35}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Inner Soft Glow Disc (Completely flat on the floor) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <circleGeometry args={[0.55, 32]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.03}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Ring Label lying flat on the floor */}
      {showText && (
        <Text
          position={[0, 0.01, 0.85]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.16}
          letterSpacing={0.1}
          color="#a1a1aa"
          anchorX="center"
          anchorY="middle"
          fontWeight={600}
        >
          {ring.name.toUpperCase()}
        </Text>
      )}
    </group>
  );
}

export default function ProfileHub() {
  const { camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const [perfSettings, setPerfSettings] = useState<PerfSettings>(perfStore.getSettings());

  useEffect(() => {
    return perfStore.subscribe((s) => setPerfSettings(s));
  }, []);

  useFrame(() => {
    if (!groupRef.current) return;
    // Distance culling: hide if camera has traveled far down the corridor
    const camZ = camera.position.z;
    const isVisible = camZ > -32 && camZ < 22;
    groupRef.current.visible = isVisible && perfSettings.profileHub;
  });

  const { name, title, shortBio } = profileData;
  const verifiedStats = resultsData.results.filter((r) => r.verified);
  const showText = perfSettings.hubText;

  return (
    <group ref={groupRef} position={[0, 0, -10]}>
      {/* 1. MONUMENTAL MEDIA WALL BACKDROP */}
      <RoundedBox args={[11.4, 9.4, 0.16]} position={[0, 4.6, -0.1]} radius={0.12} smoothness={4}>
        <meshStandardMaterial
          color="#08080c"
          roughness={0.7}
          metalness={0.3}
        />
      </RoundedBox>

      {/* Perimeter Wall Rim */}
      <mesh position={[0, 4.6, -0.01]}>
        <planeGeometry args={[11.42, 9.42]} />
        <meshBasicMaterial color="#1a1c29" transparent opacity={0.35} />
      </mesh>

      {/* 2. TOP PROFILE HEADER (Fully visible at the top of the wall) */}
      <group position={[0, 7.6, 0.03]}>
        {showText && (
          <>
            {/* Identity Tag */}
            <Text
              position={[-5.0, 0.72, 0]}
              fontSize={0.11}
              letterSpacing={0.18}
              color="#ff4757"
              anchorX="left"
              anchorY="top"
              fontWeight={700}
            >
              {`IDENTITY // ${title.toUpperCase()}`}
            </Text>

            {/* Profile Name */}
            <Text
              position={[-5.0, 0.48, 0]}
              fontSize={0.42}
              letterSpacing={-0.03}
              color="#ffffff"
              anchorX="left"
              anchorY="top"
              fontWeight={800}
            >
              {name}
            </Text>

            {/* Short Bio */}
            <Text
              position={[-5.0, -0.06, 0]}
              fontSize={0.14}
              letterSpacing={0.01}
              color="#9ca3af"
              anchorX="left"
              anchorY="top"
              maxWidth={5.1}
              lineHeight={1.4}
            >
              {shortBio}
            </Text>

            {/* 3 Proof Metric Counters */}
            <group position={[1.4, 0.46, 0]}>
              {verifiedStats.slice(0, 3).map((stat, idx) => {
                const posX = idx * 1.7;
                return (
                  <group key={stat.id} position={[posX, 0, 0]}>
                    <Text
                      position={[0, 0, 0]}
                      fontSize={0.36}
                      letterSpacing={-0.02}
                      color="#ffffff"
                      anchorX="left"
                      anchorY="top"
                      fontWeight={800}
                    >
                      {stat.value}
                    </Text>
                    <Text
                      position={[0, -0.4, 0]}
                      fontSize={0.095}
                      letterSpacing={0.04}
                      color="#8e8ea0"
                      anchorX="left"
                      anchorY="top"
                      maxWidth={1.5}
                      lineHeight={1.2}
                    >
                      {stat.label}
                    </Text>
                  </group>
                );
              })}
            </group>
          </>
        )}
      </group>

      {/* Divider Line under Profile Header */}
      <mesh position={[0, 6.35, 0.02]}>
        <planeGeometry args={[10.2, 0.015]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.12} />
      </mesh>

      {/* 3. 9-POST GRID (3x3 Layout with tactile micro-depth variations) */}
      <group position={[0, 0, 0]}>
        {TILES.map((tile, idx) => {
          const col = idx % 3; // 0, 1, 2
          const row = Math.floor(idx / 3); // 0, 1, 2

          const posX = (col - 1) * 3.35; // -3.35, 0, 3.35
          const posY = 5.25 - row * 1.82; // 5.25, 3.43, 1.61

          // Tiny staggered depth offsets so the grid has real physical depth
          const posZ = 0.04 + ((row + col) % 2) * 0.03;

          return (
            <GridTile
              key={tile.id}
              tile={tile}
              position={[posX, posY, posZ]}
              showText={showText}
            />
          );
        })}
      </group>

      {/* 4. HIGHLIGHTS FLOOR RINGS (Lying flat on the floor) */}
      <group position={[0, 0, 0]}>
        {HIGHLIGHTS.map((ring) => (
          <HighlightRing key={ring.id} ring={ring} showText={showText} />
        ))}
      </group>
    </group>
  );
}
