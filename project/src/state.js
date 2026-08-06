"use strict";

let gl = null;
let programInfo = null;

// Camera defaults
const CAMERA_DEFAULTS = {
  yaw: 0.0,            
  pitch: 0.1,            
  position: [0, 1.6, 9], 
};

// Light defaults
const LIGHT_DEFAULTS = {
  sunAngle: 0.9,
  ambient: 0.60,
  intensity: 0.85,
  enabled: true,
};

// Window effect defaults
const WINDOW_EFFECT_DEFAULTS = {
  visible: true,
};

// Global scene state
const state = {
  // Camera
  cameraYaw: CAMERA_DEFAULTS.yaw,
  cameraPitch: CAMERA_DEFAULTS.pitch,
  cameraPosition: [...CAMERA_DEFAULTS.position],

  // Scene / animation
  meshYaw: 0,
  animateSun: true,
  useTexture: true,

  // Light
  sunAngle: LIGHT_DEFAULTS.sunAngle,
  ambient: LIGHT_DEFAULTS.ambient,
  lightIntensity: LIGHT_DEFAULTS.intensity,
  lightEnabled: LIGHT_DEFAULTS.enabled,

  // Window effect
  // Non usato al momento 
  showWindowEffect: WINDOW_EFFECT_DEFAULTS.visible,

};

// Input state
let keys = {
  KeyW: false,
  KeyA: false,
  KeyS: false,
  KeyD: false,
  KeyQ: false,
  KeyE: false,
  ArrowUp: false,
  ArrowLeft: false,
  ArrowDown: false,
  ArrowRight: false,
  ShiftLeft: false,
  ShiftRight: false,
};

// Furniture constants? 
const COLUMN_DIMS = {
  xLeft: -3.0,
  xRight: 3.0,
  shaftHeight: 3.4,
  shaftSize: 0.32,
  baseHeight: 0.16,
  capHeight: 0.16,
  baseSize: 0.46,
};

const ALTAR_DIMS = {
  platformY: 0.15,
  platformZ: -5.4,
  platformWidth: 2.6,
  platformHeight: 0.3,
  platformDepth: 1.8,

  altarBaseY: 0.55,
  altarBaseWidth: 1.6,
  altarBaseHeight: 0.8,
  altarBaseDepth: 0.8,

  altarTopY: 1.05,
  altarTopWidth: 1.2,
  altarTopHeight: 0.2,
  altarTopDepth: 0.7,
};

const BENCH_DIMS = {
  leftX: -1.8,
  rightX: 1.8,

  seatY: 0.22,
  seatWidth: 1.4,
  seatHeight: 0.14,
  seatDepth: 0.45,

  backrestY: 0.55,
  backrestZOffset: 0.18,
  backrestWidth: 1.4,
  backrestHeight: 0.5,
  backrestDepth: 0.12,

  legLeftXLeft: -2.35,
  legRightXLeft: -1.25,
  legLeftXRight: 1.25,
  legRightXRight: 2.35,
  legY: 0.11,
  legWidth: 0.10,
  legHeight: 0.22,
  legDepth: 0.38,
};

const BENCH_ROWS_Z = [3.8, 2.2, 0.6, -1.0, -2.6];
const COLUMN_ROWS_Z = [4.5, 1.5, -1.5, -4.5];

const COLORS = {
  floor: [1, 1, 1, 1],
  sideWall: [0.82, 0.82, 0.84, 1],
  backWall: [0.80, 0.80, 0.83, 1],
  frontWall: [0.84, 0.84, 0.86, 1],
  platform: [0.70, 0.70, 0.72, 1],
  altarBase: [0.88, 0.88, 0.90, 1],
  altarTop: [0.92, 0.92, 0.94, 1],
  benchSeat: [0.45, 0.28, 0.16, 1],
  benchBack: [0.43, 0.26, 0.15, 1],
  benchLeg: [0.36, 0.22, 0.12, 1],
  columnShaft: [0.78, 0.78, 0.80, 1],
  columnBase: [0.68, 0.68, 0.70, 1],
};
