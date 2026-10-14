'use client';

import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { openingStore, OpeningStep } from '@/store/openingStore';
import { windowPointerState } from '@/store/pointerStore';

export default function CameraController() {
  const { camera, size } = useThree();
  const isMobile = size.width < 768;

  const targetCamPosRef = useRef(new THREE.Vector3(0, 0, 5.0));
  const currentCamPosRef = useRef(new THREE.Vector3(0, 0, 5.0));
  const targetLookAtRef = useRef(new THREE.Vector3(0, 0, 0));
  const currentLookAtRef = useRef(new THREE.Vector3(0, 0, 0));
  const mouseOffsetRef = useRef(new THREE.Vector2());
  const openingStepRef = useRef<OpeningStep>(openingStore.getStep());

  useEffect(() => {
    openingStepRef.current = openingStore.getStep();
    const unsub = openingStore.subscribe((s) => {
      openingStepRef.current = s;
    });
    return unsub;
  }, []);

  // Initialize camera position on first load
  useEffect(() => {
    const isIntroRequested = typeof window !== 'undefined'
      ? (new URLSearchParams(window.location.search).get('intro') === '1' || openingStore.isIntro())
      : false;
    const initialCam = !isIntroRequested ? new THREE.Vector3(0, 0, 5.0) : new THREE.Vector3(0, 0.4, 6.5);
    const initialLook = new THREE.Vector3(0, 0, 0);
    camera.position.copy(initialCam);
    camera.lookAt(initialLook);
    currentCamPosRef.current.copy(initialCam);
    currentLookAtRef.current.copy(initialLook);
  }, [camera]);

  useFrame((state, delta) => {
    const currentStep = openingStepRef.current;
    const isOpeningIntro =
      currentStep === 'screen_1' ||
      currentStep === 'screen_2' ||
      currentStep === 'screen_3' ||
      currentStep === 'frozen' ||
      currentStep === 'stop_text' ||
      currentStep === 'you_did_text';

    if (isOpeningIntro) {
      if (currentStep === 'screen_1') {
        targetCamPosRef.current.set(-0.6, 0.2, 5.8);
        targetLookAtRef.current.set(-0.9, 0.1, 0.0);
      } else if (currentStep === 'screen_2') {
        targetCamPosRef.current.set(0.6, 0.0, 5.2);
        targetLookAtRef.current.set(0.9, 0.0, 0.0);
      } else {
        targetCamPosRef.current.set(0.0, 0.1, 4.4);
        targetLookAtRef.current.set(0.0, 0.1, 0.0);
      }
    } else {
      // Hero Framing: desktop camera positioned so left text and right feed wall are in balanced harmony
      if (isMobile) {
        targetCamPosRef.current.set(0, 0, 5.6);
        targetLookAtRef.current.set(0, 0, 0);
      } else {
        targetCamPosRef.current.set(0.0, 0.0, 5.0);
        targetLookAtRef.current.set(0.2, 0.0, 0.0);
      }
    }

    // Subtle mouse parallax + very slow idle breathing
    const idleDriftX = Math.sin(state.clock.elapsedTime * 0.25) * 0.04;
    const idleDriftY = Math.cos(state.clock.elapsedTime * 0.2) * 0.03;

    const pointerX = windowPointerState.hasPointer ? windowPointerState.x : 0;
    const pointerY = windowPointerState.hasPointer ? windowPointerState.y : 0;

    const targetMouseX = isMobile ? 0 : (windowPointerState.hasPointer ? pointerX * 0.18 : 0) + idleDriftX;
    const targetMouseY = isMobile ? 0 : (windowPointerState.hasPointer ? pointerY * 0.12 : 0) + idleDriftY;

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

    const finalCamX = targetCamPosRef.current.x + mouseOffsetRef.current.x;
    const finalCamY = targetCamPosRef.current.y + mouseOffsetRef.current.y;
    const finalCamZ = targetCamPosRef.current.z;

    const finalLookX = targetLookAtRef.current.x + mouseOffsetRef.current.x * 0.3;
    const finalLookY = targetLookAtRef.current.y + mouseOffsetRef.current.y * 0.3;
    const finalLookZ = targetLookAtRef.current.z;

    currentCamPosRef.current.x = THREE.MathUtils.damp(
      currentCamPosRef.current.x,
      finalCamX,
      3.5,
      delta
    );
    currentCamPosRef.current.y = THREE.MathUtils.damp(
      currentCamPosRef.current.y,
      finalCamY,
      3.5,
      delta
    );
    currentCamPosRef.current.z = THREE.MathUtils.damp(
      currentCamPosRef.current.z,
      finalCamZ,
      3.5,
      delta
    );

    currentLookAtRef.current.x = THREE.MathUtils.damp(
      currentLookAtRef.current.x,
      finalLookX,
      3.5,
      delta
    );
    currentLookAtRef.current.y = THREE.MathUtils.damp(
      currentLookAtRef.current.y,
      finalLookY,
      3.5,
      delta
    );
    currentLookAtRef.current.z = THREE.MathUtils.damp(
      currentLookAtRef.current.z,
      finalLookZ,
      3.5,
      delta
    );

    camera.position.copy(currentCamPosRef.current);
    camera.lookAt(currentLookAtRef.current);
  });

  return null;
}
