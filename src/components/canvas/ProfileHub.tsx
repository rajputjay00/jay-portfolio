'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { scrollManager } from '@/store/scrollStore';
import profileData from '@/../content/profile.json';
import resultsData from '@/../content/results.json';

// Shared geometry and materials for performance
const tileGeometry = new THREE.PlaneGeometry(2.35, 1.38);
const tileBoxGeometry = new THREE.BoxGeometry(2.4, 1.42, 0.04);

interface GridTileData {
  id: string;
  index: string;
  tag: string;
  title: string;
  metric: string;
  metricLabel: string;
  accentColor: string;
  targetT: number;
}

const TILES: GridTileData[] = [
  {
    id: 'creativefuel',
    index: '01',
    tag: 'CASE STUDY',
    title: 'Creativefuel',
    metric: '401K',
    metricLabel: 'followers · 4 pages managed',
    accentColor: '#ff4757',
    targetT: 0.22,
  },
  {
    id: 'brand-social',
    index: '02',
    tag: 'CASE STUDY',
    title: 'Brand Social',
    metric: '5',
    metricLabel: 'national brands (Flipkart, Realme)',
    accentColor: '#3b82f6',
    targetT: 0.22,
  },
  {
    id: 'strictly-for-corporate',
    index: '03',
    tag: 'CASE STUDY',
    title: 'Strictly For Corporate',
    metric: '39.5K',
    metricLabel: 'followers built from scratch',
    accentColor: '#10b981',
    targetT: 0.22,
  },
  {
    id: 'campus-community',
    index: '04',
    tag: 'CASE STUDY',
    title: 'Campus & Community',
    metric: 'TEDx',
    metricLabel: 'TEDxIPSA Indore & GDGOC',
    accentColor: '#f59e0b',
    targetT: 0.22,
  },
  {
    id: 'retention-theatre',
    index: '05',
    tag: 'SIGNATURE LAB',
    title: 'Retention Theatre',
    metric: 'Curve',
    metricLabel: 'Interactive second-by-second scrubbing',
    accentColor: '#8b5cf6',
    targetT: 0.33,
  },
  {
    id: 'range-wall',
    index: '06',
    tag: 'SIGNATURE LAB',
    title: 'Range Wall',
    metric: '3 Voices',
    metricLabel: 'Community · Character · Brand',
    accentColor: '#ec4899',
    targetT: 0.44,
  },
  {
    id: 'strategy-room',
    index: '07',
    tag: 'SIGNATURE LAB',
    title: 'Strategy Room',
    metric: '7 Blocks',
    metricLabel: 'Live campaign assembly system',
    accentColor: '#06b6d4',
    targetT: 0.55,
  },
  {
    id: 'results-wall',
    index: '08',
    tag: 'METRICS LAB',
    title: 'Results Wall',
    metric: 'Proof',
    metricLabel: 'Verified figures & reach metrics',
    accentColor: '#14b8a6',
    targetT: 0.77,
  },
  {
    id: 'message-jay',
    index: '09',
    tag: 'CONVERSION',
    title: 'Message Jay (DM)',
    metric: 'Chat',
    metricLabel: 'Hiring & project lead inquiry',
    accentColor: '#ff4757',
    targetT: 1.0,
  },
];

interface HighlightRingData {
  id: string;
  name: string;
  targetT: number;
  position: [number, number, number];
}

const HIGHLIGHTS: HighlightRingData[] = [
  { id: 'work', name: 'Work', targetT: 0.22, position: [-3.6, 0.02, -5.5] },
  { id: 'strategy', name: 'Strategy', targetT: 0.55, position: [-1.8, 0.02, -5.5] },
  { id: 'results', name: 'Results', targetT: 0.77, position: [0.0, 0.02, -5.5] },
  { id: 'services', name: 'Services', targetT: 0.88, position: [1.8, 0.02, -5.5] },
  { id: 'about', name: 'About', targetT: 0.88, position: [3.6, 0.02, -5.5] },
];

function GridTile({
  tile,
  position,
}: {
  tile: GridTileData;
  position: [number, number, number];
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const currentRotX = useRef(0);
  const currentRotY = useRef(0);
  const currentEmissive = useRef(0);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Spring-eased tilt towards cursor on hover
    let targetRotX = 0;
    let targetRotY = 0;
    let targetEmissive = 0.08;

    if (hovered) {
      targetRotX = (state.pointer.y * 0.35 - position[1] * 0.05);
      targetRotY = (state.pointer.x * 0.35 - position[0] * 0.05);
      targetEmissive = 0.8;
    }

    currentRotX.current = THREE.MathUtils.damp(currentRotX.current, targetRotX, 8, delta);
    currentRotY.current = THREE.MathUtils.damp(currentRotY.current, targetRotY, 8, delta);
    currentEmissive.current = THREE.MathUtils.damp(currentEmissive.current, targetEmissive, 6, delta);

    groupRef.current.rotation.x = currentRotX.current;
    groupRef.current.rotation.y = currentRotY.current;
    groupRef.current.position.z = THREE.MathUtils.damp(
      groupRef.current.position.z,
      hovered ? position[2] + 0.12 : position[2],
      6,
      delta
    );
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    scrollManager.scrollToProgress(tile.targetT, 1.6);
  };

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
      onClick={handleClick}
    >
      {/* Background Frame / Bezel */}
      <mesh geometry={tileBoxGeometry}>
        <meshStandardMaterial
          color={hovered ? '#161722' : '#0e0f17'}
          roughness={0.2}
          metalness={0.8}
          emissive={tile.accentColor}
          emissiveIntensity={hovered ? 0.25 : 0.02}
        />
      </mesh>

      {/* Screen Face */}
      <mesh position={[0, 0, 0.022]} geometry={tileGeometry}>
        <meshBasicMaterial
          color={hovered ? '#181924' : '#11121b'}
        />
      </mesh>

      {/* Accent Top Border Line */}
      <mesh position={[0, 0.67, 0.024]}>
        <planeGeometry args={[2.25, 0.025]} />
        <meshBasicMaterial
          color={tile.accentColor}
          transparent
          opacity={hovered ? 0.9 : 0.4}
        />
      </mesh>

      {/* Header Tag + Index */}
      <Text
        position={[-1.02, 0.52, 0.025]}
        fontSize={0.075}
        letterSpacing={0.12}
        color={tile.accentColor}
        anchorX="left"
        anchorY="top"
        fontWeight={700}
      >
        {`${tile.index} // ${tile.tag}`}
      </Text>

      {/* Main Tile Title */}
      <Text
        position={[-1.02, 0.32, 0.025]}
        fontSize={0.165}
        letterSpacing={-0.01}
        color="#ffffff"
        anchorX="left"
        anchorY="top"
        fontWeight={700}
        maxWidth={2.1}
      >
        {tile.title}
      </Text>

      {/* Big Headline Metric */}
      <Text
        position={[-1.02, -0.05, 0.025]}
        fontSize={0.28}
        letterSpacing={-0.02}
        color={hovered ? '#ffffff' : '#e4e4e7'}
        anchorX="left"
        anchorY="top"
        fontWeight={800}
      >
        {tile.metric}
      </Text>

      {/* Metric Label / Subtitle */}
      <Text
        position={[-1.02, -0.38, 0.025]}
        fontSize={0.08}
        letterSpacing={0.02}
        color="#8e8ea0"
        anchorX="left"
        anchorY="top"
        maxWidth={2.05}
        lineHeight={1.2}
      >
        {tile.metricLabel}
      </Text>

      {/* Hover prompt */}
      {hovered && (
        <Text
          position={[1.02, -0.52, 0.025]}
          fontSize={0.07}
          letterSpacing={0.08}
          color={tile.accentColor}
          anchorX="right"
          anchorY="bottom"
          fontWeight={600}
        >
          EXPLORE →
        </Text>
      )}
    </group>
  );
}

function HighlightRing({ ring }: { ring: HighlightRingData }) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    meshRef.current.position.y = THREE.MathUtils.damp(
      meshRef.current.position.y,
      hovered ? 0.06 : 0.02,
      8,
      delta
    );
  });

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
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
      onClick={handleClick}
    >
      {/* Outer Lit Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.55, 0.58, 36]} />
        <meshBasicMaterial
          color={hovered ? '#ff4757' : '#ffffff'}
          transparent
          opacity={hovered ? 0.85 : 0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Inner Soft Glow Disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.55, 32]} />
        <meshBasicMaterial
          color={hovered ? '#ff4757' : '#ffffff'}
          transparent
          opacity={hovered ? 0.12 : 0.03}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Ring Label */}
      <Text
        position={[0, 0.01, 0.78]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.16}
        letterSpacing={0.1}
        color={hovered ? '#ffffff' : '#a1a1aa'}
        anchorX="center"
        anchorY="middle"
        fontWeight={600}
      >
        {ring.name.toUpperCase()}
      </Text>
    </group>
  );
}

export default function ProfileHub() {
  const { name, title, shortBio } = profileData;

  // Verified proof numbers from results.json
  const verifiedStats = resultsData.results.filter((r) => r.verified);

  return (
    <group position={[0, 0, -10]}>
      {/* 1. MONUMENTAL MEDIA WALL BACKDROP */}
      <RoundedBox args={[10.8, 8.8, 0.15]} position={[0, 4.4, -0.1]} radius={0.12} smoothness={4}>
        <meshStandardMaterial
          color="#08080c"
          roughness={0.7}
          metalness={0.3}
        />
      </RoundedBox>

      {/* Perimeter Wall Accent Glow Rim */}
      <mesh position={[0, 4.4, -0.01]}>
        <planeGeometry args={[10.82, 8.82]} />
        <meshBasicMaterial
          color="#1a1c29"
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* 2. TOP PROFILE HEADER */}
      <group position={[0, 7.3, 0.02]}>
        {/* Profile Tag */}
        <Text
          position={[-4.7, 0.7, 0]}
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
          position={[-4.7, 0.48, 0]}
          fontSize={0.38}
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
          position={[-4.7, -0.02, 0]}
          fontSize={0.13}
          letterSpacing={0.01}
          color="#9ca3af"
          anchorX="left"
          anchorY="top"
          maxWidth={4.8}
          lineHeight={1.4}
        >
          {shortBio}
        </Text>

        {/* 3 Proof Metric Counters (Right Side of Header) */}
        <group position={[1.4, 0.45, 0]}>
          {verifiedStats.slice(0, 3).map((stat, idx) => {
            const posX = idx * 1.6;
            return (
              <group key={stat.id} position={[posX, 0, 0]}>
                <Text
                  position={[0, 0, 0]}
                  fontSize={0.32}
                  letterSpacing={-0.02}
                  color="#ffffff"
                  anchorX="left"
                  anchorY="top"
                  fontWeight={800}
                >
                  {stat.value}
                </Text>
                <Text
                  position={[0, -0.36, 0]}
                  fontSize={0.09}
                  letterSpacing={0.04}
                  color="#8e8ea0"
                  anchorX="left"
                  anchorY="top"
                  maxWidth={1.4}
                  lineHeight={1.2}
                >
                  {stat.label}
                </Text>
              </group>
            );
          })}
        </group>
      </group>

      {/* Divider Line under Profile Header */}
      <mesh position={[0, 6.2, 0.02]}>
        <planeGeometry args={[9.5, 0.015]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.12} />
      </mesh>

      {/* 3. 9-POST GRID (3x3 Layout) */}
      <group position={[0, 0, 0]}>
        {TILES.map((tile, idx) => {
          const col = idx % 3; // 0, 1, 2
          const row = Math.floor(idx / 3); // 0, 1, 2

          const posX = (col - 1) * 3.1; // -3.1, 0, 3.1
          const posY = 5.2 - row * 1.7; // 5.2, 3.5, 1.8
          const posZ = 0.04;

          return (
            <GridTile
              key={tile.id}
              tile={tile}
              position={[posX, posY, posZ]}
            />
          );
        })}
      </group>

      {/* 4. HIGHLIGHTS FLOOR RINGS */}
      <group position={[0, 0, 0]}>
        {HIGHLIGHTS.map((ring) => (
          <HighlightRing key={ring.id} ring={ring} />
        ))}
      </group>
    </group>
  );
}
