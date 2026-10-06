import * as THREE from 'three';

export interface ZoneInfo {
  id: string;
  name: string;
  label: string;
  t: number; // Progress along spline 0..1
  cameraPos: [number, number, number];
  targetLookAt: [number, number, number];
}

export const ZONES: ZoneInfo[] = [
  {
    id: 'opening',
    name: 'Opening Sequence',
    label: '00 // OPENING',
    t: 0.0,
    cameraPos: [0, 2.0, 16],
    targetLookAt: [0, 2.0, 4],
  },
  {
    id: 'hub',
    name: 'Profile Hub',
    label: '01 // PROFILE HUB',
    t: 0.11,
    cameraPos: [0, 3.4, -2.2],
    targetLookAt: [0, 3.4, -10],
  },
  {
    id: 'case-files',
    name: 'Case Files',
    label: '02 // CASE FILES',
    t: 0.22,
    cameraPos: [-2.5, 2.2, -18],
    targetLookAt: [0, 2.2, -28],
  },
  {
    id: 'retention',
    name: 'Retention Theatre',
    label: '03 // RETENTION THEATRE',
    t: 0.33,
    cameraPos: [3.0, 2.0, -36],
    targetLookAt: [0, 2.0, -46],
  },
  {
    id: 'range',
    name: 'Range Wall',
    label: '04 // RANGE WALL',
    t: 0.44,
    cameraPos: [-3.0, 2.2, -54],
    targetLookAt: [0, 2.2, -64],
  },
  {
    id: 'strategy',
    name: 'Strategy Room',
    label: '05 // STRATEGY ROOM',
    t: 0.55,
    cameraPos: [2.5, 2.4, -72],
    targetLookAt: [0, 2.0, -82],
  },
  {
    id: 'report',
    name: 'Report Room',
    label: '06 // REPORT ROOM',
    t: 0.66,
    cameraPos: [-2.8, 2.2, -90],
    targetLookAt: [0, 2.2, -100],
  },
  {
    id: 'results',
    name: 'Results Wall',
    label: '07 // RESULTS WALL',
    t: 0.77,
    cameraPos: [2.8, 2.2, -108],
    targetLookAt: [0, 2.2, -118],
  },
  {
    id: 'about',
    name: 'About + Services',
    label: '08 // ABOUT + SERVICES',
    t: 0.88,
    cameraPos: [-1.5, 2.0, -126],
    targetLookAt: [0, 2.0, -136],
  },
  {
    id: 'dm',
    name: 'DM Exit',
    label: '09 // DM EXIT',
    t: 1.0,
    cameraPos: [0, 1.8, -144],
    targetLookAt: [0, 1.8, -156],
  },
];

// Construct smooth CatmullRom spline paths for camera position & look-at
const camPoints = ZONES.map((z) => new THREE.Vector3(...z.cameraPos));
const lookPoints = ZONES.map((z) => new THREE.Vector3(...z.targetLookAt));

export const cameraSpline = new THREE.CatmullRomCurve3(camPoints, false, 'catmullrom', 0.5);
export const lookAtSpline = new THREE.CatmullRomCurve3(lookPoints, false, 'catmullrom', 0.5);
