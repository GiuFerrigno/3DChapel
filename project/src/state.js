"use strict";

let gl = null;
let programInfo = null;

// Buffer / texture references
let floorBufferInfo = null;
let floorTexture = null;

// Camera defaults
const CAMERA_DEFAULTS = {
  yaw: 0.0,
  pitch: 0.35,
  dist: 12.0,
  target: [0, 1.2, -1.5],
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
  cameraDist: CAMERA_DEFAULTS.dist,
  target: [...CAMERA_DEFAULTS.target],

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
  showWindowEffect: WINDOW_EFFECT_DEFAULTS.visible,
  window3D: {
    ready: false,
    position: [0, 3.1, -6.98],
    scale: [1.8, 1.8, 1.5],
    color: [1.0, 1.0, 1.0, 1.0],
  },
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