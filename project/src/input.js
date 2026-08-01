"use strict";

const pointerState = {
  active: false,
  pointerId: null,
  lastX: 0,
  lastY: 0,
};

const POINTER_SENSITIVITY = 0.01;
const ZOOM_SENSITIVITY = 0.01;
const MIN_CAMERA_PITCH = 0.1;
const MAX_CAMERA_PITCH = 1.2;
const MIN_CAMERA_DIST = 3.5;
const MAX_CAMERA_DIST = 20.0;
const BASE_MOVE_SPEED = 3.0;
const FAST_MOVE_SPEED = 5.5;
const VERTICAL_MOVE_SPEED = 2.5;
const MIN_TARGET_Y = 0.3;
const MAX_TARGET_Y = 8.0;

function resetPointerState(canvas) {
  if (
    pointerState.pointerId !== null &&
    canvas.hasPointerCapture(pointerState.pointerId)
  ) {
    canvas.releasePointerCapture(pointerState.pointerId);
  }

  pointerState.active = false;
  pointerState.pointerId = null;
}

function initPointerControls(canvas) {
  canvas.addEventListener("pointerdown", (e) => {
    pointerState.active = true;
    pointerState.pointerId = e.pointerId;
    pointerState.lastX = e.clientX;
    pointerState.lastY = e.clientY;

    canvas.setPointerCapture(e.pointerId);
    e.preventDefault();
  });

  canvas.addEventListener("pointermove", (e) => {
    if (!pointerState.active) return;
    if (e.pointerId !== pointerState.pointerId) return;

    const dx = e.clientX - pointerState.lastX;
    const dy = e.clientY - pointerState.lastY;

    state.cameraYaw += dx * POINTER_SENSITIVITY;
    state.cameraPitch += dy * POINTER_SENSITIVITY;
    state.cameraPitch = clamp(state.cameraPitch, MIN_CAMERA_PITCH, MAX_CAMERA_PITCH);

    pointerState.lastX = e.clientX;
    pointerState.lastY = e.clientY;

    e.preventDefault();
  });

  canvas.addEventListener("pointerup", (e) => {
    if (e.pointerId === pointerState.pointerId) {
      resetPointerState(canvas);
    }
    e.preventDefault();
  });

  canvas.addEventListener("pointercancel", (e) => {
    if (e.pointerId === pointerState.pointerId) {
      resetPointerState(canvas);
    }
    e.preventDefault();
  });

  canvas.addEventListener("wheel", (e) => {
    state.cameraDist += e.deltaY * ZOOM_SENSITIVITY;
    state.cameraDist = clamp(state.cameraDist, MIN_CAMERA_DIST, MAX_CAMERA_DIST);
    e.preventDefault();
  }, { passive: false });

  canvas.addEventListener("contextmenu", (e) => {
    e.preventDefault();
  });
}

function initKeyboardControls() {
  window.addEventListener("keydown", (e) => {
    if (e.code in keys) {
      keys[e.code] = true;
      e.preventDefault();
    }
  });

  window.addEventListener("keyup", (e) => {
    if (e.code in keys) {
      keys[e.code] = false;
      e.preventDefault();
    }
  });

  window.addEventListener("blur", () => {
    for (const key in keys) {
      keys[key] = false;
    }
  });
}

function updateKeyboardMovement(dt) {
  
  const speed = (keys.ShiftLeft || keys.ShiftRight) ? FAST_MOVE_SPEED : BASE_MOVE_SPEED;
  const step = speed * dt;
  const verticalStep = VERTICAL_MOVE_SPEED * dt;

  const forward = [
    -Math.sin(state.cameraYaw),
    0,
    -Math.cos(state.cameraYaw),
  ];

  const right = [
    Math.cos(state.cameraYaw),
    0,
    -Math.sin(state.cameraYaw),
  ];

  if (keys.KeyW || keys.ArrowUp) {
    state.target[0] += forward[0] * step;
    state.target[2] += forward[2] * step;
  }

  if (keys.KeyS || keys.ArrowDown) {
    state.target[0] -= forward[0] * step;
    state.target[2] -= forward[2] * step;
  }

  if (keys.KeyA || keys.ArrowLeft) {
    state.target[0] -= right[0] * step;
    state.target[2] -= right[2] * step;
  }

  if (keys.KeyD || keys.ArrowRight) {
    state.target[0] += right[0] * step;
    state.target[2] += right[2] * step;
  }

  if (keys.KeyQ) {
    state.target[1] += verticalStep;
  }

  if (keys.KeyE) {
    state.target[1] -= verticalStep;
  }

  state.target[1] = clamp(state.target[1], MIN_TARGET_Y, MAX_TARGET_Y);
}