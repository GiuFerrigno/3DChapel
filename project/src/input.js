"use strict";

const pointerState = {
  active: false,
  pointerId: null,
  lastX: 0,
  lastY: 0,
};

const POINTER_SENSITIVITY = 0.01;
const ZOOM_SENSITIVITY = 0.01;
const MIN_CAMERA_PITCH = -Math.PI / 2 + 0.05;
const MAX_CAMERA_PITCH = Math.PI / 2 - 0.05;
const MIN_CAMERA_DIST = 3.5;
const MAX_CAMERA_DIST = 20.0;
const BASE_MOVE_SPEED = 3.0;
const FAST_MOVE_SPEED = 5.5;
const VERTICAL_MOVE_SPEED = 2.5;
const MIN_CAMERA_HEIGHT = 0.5;
const MAX_CAMERA_HEIGHT = 3.0;

// Per evitare che la camera esca dalla cappella
const CAMERA_MARGIN = 0.15;
const CHAPEL_MIN_X = -4.0 + CAMERA_MARGIN;
const CHAPEL_MAX_X =  4.0 - CAMERA_MARGIN;
const CHAPEL_MIN_Z = -7.0 + CAMERA_MARGIN;
const CHAPEL_MAX_Z =  7.0 - CAMERA_MARGIN;
const CAMERA_MIN_Y = 0.8;
const CAMERA_MAX_Y = 3.8;

function keepCameraInsideChapel() {
  state.cameraPosition[0] = clamp(
    state.cameraPosition[0],
    CHAPEL_MIN_X,
    CHAPEL_MAX_X
  );

  state.cameraPosition[1] = clamp(
    state.cameraPosition[1],
    CAMERA_MIN_Y,
    CAMERA_MAX_Y
  );

  state.cameraPosition[2] = clamp(
    state.cameraPosition[2],
    CHAPEL_MIN_Z,
    CHAPEL_MAX_Z
  );
}

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
    state.cameraPitch -= dy * POINTER_SENSITIVITY;
    state.cameraPitch = clamp(state.cameraPitch, -Math.PI / 2 + 0.05, Math.PI / 2 - 0.05);

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
    const amount = e.deltaY * 0.01;

    const forward = [
      Math.sin(state.cameraYaw),
      0,
      -Math.cos(state.cameraYaw),
    ];

    state.cameraPosition[0] += forward[0] * amount;
    state.cameraPosition[2] += forward[2] * amount;

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
  const speed =
    (keys.ShiftLeft || keys.ShiftRight)
      ? FAST_MOVE_SPEED
      : BASE_MOVE_SPEED;

  const step = speed * dt;
  const verticalStep = VERTICAL_MOVE_SPEED * dt;

  const forward = [
    Math.sin(state.cameraYaw),
    0,
    -Math.cos(state.cameraYaw),
  ];

  const right = [
    Math.cos(state.cameraYaw),
    0,
    Math.sin(state.cameraYaw),
  ];

  if (keys.KeyW || keys.ArrowUp) {
    state.cameraPosition[0] += forward[0] * step;
    state.cameraPosition[2] += forward[2] * step;
  }

  if (keys.KeyS || keys.ArrowDown) {
    state.cameraPosition[0] -= forward[0] * step;
    state.cameraPosition[2] -= forward[2] * step;
  }

  if (keys.KeyA || keys.ArrowLeft) {
    state.cameraPosition[0] -= right[0] * step;
    state.cameraPosition[2] -= right[2] * step;
  }

  if (keys.KeyD || keys.ArrowRight) {
    state.cameraPosition[0] += right[0] * step;
    state.cameraPosition[2] += right[2] * step;
  }
  
  state.cameraPosition[1] = clamp(
    state.cameraPosition[1],
    MIN_CAMERA_HEIGHT,
    MAX_CAMERA_HEIGHT
  );

  keepCameraInsideChapel();
}