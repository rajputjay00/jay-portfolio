'use client';

import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { cameraSpline, lookAtSpline } from '@/constants/zones';
import { scrollManager } from '@/store/scrollStore';

export default function CameraController() {
  const { camera } = useThree();

  const currentTRef = useRef(0);
  const targetCamPosRef = useRef(new THREE.Vector3());
  const currentCamPosRef = useRef(new THREE.Vector3());
  const targetLookAtRef = useRef(new THREE.Vector3());
  const currentLookAtRef = useRef(new THREE.Vector3());
  const mouseOffsetRef = useRef(new THREE.Vector2());

  // Initialize camera position on first load
  React.useEffect(() => {
    const initialCam = cameraSpline.getPointAt(0);
    const initialLook = lookAtSpline.getPointAt(0);
    camera.position.copy(initialCam);
    camera.lookAt(initialLook);
    currentCamPosRef.current.copy(initialCam);
    currentLookAtRef.current.copy(initialLook);
  }, [camera]);

  useFrame((state, delta) => {
    // 1. Get raw scroll progress (0..1)
    const targetT = scrollManager.getProgress();

    // 2. Smoothly damp progress for buttery eased acceleration and deceleration
    // Using a delta-aware damping factor
    currentTRef.current = THREE.MathUtils.damp(
      currentTRef.current,
      targetT,
      3.2,
      delta
    );

    const clampedT = Math.max(0, Math.min(0.9999, currentTRef.current));

    // 3. Compute spline points for camera and look-at
    cameraSpline.getPointAt(clampedT, targetCamPosRef.current);
    lookAtSpline.getPointAt(clampedT, targetLookAtRef.current);

    // 4. Subtle mouse parallax: drifts gently with cursor
    const targetMouseX = state.pointer.x * 0.45;
    const targetMouseY = state.pointer.y * 0.25;

    mouseOffsetRef.current.x = THREE.MathUtils.damp(
      mouseOffsetRef.current.x,
      targetMouseX,
      2.5,
      delta
    );
    mouseOffsetRef.current.y = THREE.MathUtils.damp(
      mouseOffsetRef.current.y,
      targetMouseY,
      2.5,
      delta
    );

    // Apply mouse parallax to camera position and target
    const finalCamPos = targetCamPosRef.current.clone();
    finalCamPos.x += mouseOffsetRef.current.x;
    finalCamPos.y += mouseOffsetRef.current.y;

    const finalLookAt = targetLookAtRef.current.clone();
    finalLookAt.x += mouseOffsetRef.current.x * 0.3;
    finalLookAt.y += mouseOffsetRef.current.y * 0.3;

    // 5. Smoothly damp current camera coordinates
    currentCamPosRef.current.x = THREE.MathUtils.damp(
      currentCamPosRef.current.x,
      finalCamPos.x,
      4.5,
      delta
    );
    currentCamPosRef.current.y = THREE.MathUtils.damp(
      currentCamPosRef.current.y,
      finalCamPos.y,
      4.5,
      delta
    );
    currentCamPosRef.current.z = THREE.MathUtils.damp(
      currentCamPosRef.current.z,
      finalCamPos.z,
      4.5,
      delta
    );

    currentLookAtRef.current.x = THREE.MathUtils.damp(
      currentLookAtRef.current.x,
      finalLookAt.x,
      4.5,
      delta
    );
    currentLookAtRef.current.y = THREE.MathUtils.damp(
      currentLookAtRef.current.y,
      finalLookAt.y,
      4.5,
      delta
    );
    currentLookAtRef.current.z = THREE.MathUtils.damp(
      currentLookAtRef.current.z,
      finalLookAt.z,
      4.5,
      delta
    );

    camera.position.copy(currentCamPosRef.current);
    camera.lookAt(currentLookAtRef.current);
  });

  return null;
}
