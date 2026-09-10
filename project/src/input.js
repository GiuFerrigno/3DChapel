"use strict";

const pointerState = {
  mouse: {
    active: false,
    pointerId: null,
    lastX: 0,
    lastY: 0,
  },

  look: {
    pointerId: null,
    lastX: 0,
    lastY: 0,
  },

  movement: {
    pointerId: null,
    startX: 0,
    startY: 0,
    x: 0,
    y: 0,
  },
};

const POINTER_SENSITIVITY = 0.01;
const TOUCH_LOOK_SENSITIVITY = 0.008;

const MIN_CAMERA_PITCH = -Math.PI / 2 + 0.05;
const MAX_CAMERA_PITCH = Math.PI / 2 - 0.05;

const BASE_MOVE_SPEED = 2.5;
const FAST_MOVE_SPEED = 5.0;

const JOYSTICK_RADIUS = 60;
const JOYSTICK_DEAD_ZONE = 0.15;

// Limiti della camera nella cappella
const CAMERA_MARGIN = 0.15;

const CAMERA_BOUNDS = {
  minX: -4.0 + CAMERA_MARGIN,
  maxX: 4.0 - CAMERA_MARGIN,
  minY: 0.8,
  maxY: 3.0,
  minZ: -7.0 + CAMERA_MARGIN,
  maxZ: 7.0 - CAMERA_MARGIN,
};

/**
 * Mantiene la camera all'interno della cappella
 */
function keepCameraInsideChapel() {
  const position = state.cameraPosition;

  position[0] = clamp(
    position[0],
    CAMERA_BOUNDS.minX,
    CAMERA_BOUNDS.maxX
  );

  position[1] = clamp(
    position[1],
    CAMERA_BOUNDS.minY,
    CAMERA_BOUNDS.maxY
  );

  position[2] = clamp(
    position[2],
    CAMERA_BOUNDS.minZ,
    CAMERA_BOUNDS.maxZ
  );
}

/**
 * Aggiorna l'orientamento della camera
 */
function updateCameraLook(dx, dy, sensitivity) {
  state.cameraYaw += dx * sensitivity;

  state.cameraPitch = clamp(
    state.cameraPitch - dy * sensitivity,
    MIN_CAMERA_PITCH,
    MAX_CAMERA_PITCH
  );
}

/**
 * Restituisce le direzioni orizzontali della camera
 */
function getCameraMovementDirections() {
  const yaw = state.cameraYaw;

  return {
    forward: [
      Math.sin(yaw),
      0,
      -Math.cos(yaw),
    ],

    right: [
      Math.cos(yaw),
      0,
      Math.sin(yaw),
    ],
  };
}

/**
 * Resetta joystick touch e ne nasconde la grafica
 */
function resetMoveJoystick(joystick, knob) {
  const movement = pointerState.movement;

  movement.pointerId = null;
  movement.x = 0;
  movement.y = 0;

  joystick.classList.add("hidden");

  knob.style.left = "50%";
  knob.style.top = "50%";
}

/**
 * Aggiorna la posizione del joystick e il suo vettore di movimento
 */
function updateMoveJoystick(clientX, clientY, knob) {
  const movement = pointerState.movement;

  let dx = clientX - movement.startX;
  let dy = clientY - movement.startY;

  const distance = Math.hypot(dx, dy);

  // Limita il cursore all'area visiva del joystick
  if (distance > JOYSTICK_RADIUS) {
    const scale = JOYSTICK_RADIUS / distance;

    dx *= scale;
    dy *= scale;
  }

  movement.x = dx / JOYSTICK_RADIUS;
  movement.y = dy / JOYSTICK_RADIUS;

  knob.style.left = `${50 + movement.x * 50}%`;
  knob.style.top = `${50 + movement.y * 50}%`;
}

/**
 * Chiude mouse drag, look touch o joystick quando un pointer viene rilasciato
 */
function releasePointer(canvas, event, joystick, knob) {
  const { mouse, look, movement } = pointerState;

  if (event.pointerType === "mouse" && event.pointerId === mouse.pointerId) {
    mouse.active = false;
    mouse.pointerId = null;
  }

  if (event.pointerId === movement.pointerId) {
    resetMoveJoystick(joystick, knob);
  }

  if (event.pointerId === look.pointerId) {
    look.pointerId = null;
  }

  if (canvas.hasPointerCapture(event.pointerId)) {
    canvas.releasePointerCapture(event.pointerId);
  }

  event.preventDefault();
}

/**
 * Mouse: drag visuale e rotella per avanzare/indietreggiare
 * Touch: metà sinistra per joystick; metà destra per visuale.
 */
function initPointerControls(canvas) {
  const joystick = document.getElementById("moveJoystick");
  const knob = document.getElementById("moveJoystickKnob");

  if (!joystick || !knob) {
    throw new Error(
      "Joystick mobile mancante: #moveJoystick o #moveJoystickKnob."
    );
  }

  canvas.addEventListener("pointerdown", (event) => {
    const { mouse, look, movement } = pointerState;

    if (event.pointerType === "mouse") {
      mouse.active = true;
      mouse.pointerId = event.pointerId;
      mouse.lastX = event.clientX;
      mouse.lastY = event.clientY;

      canvas.setPointerCapture(event.pointerId);
      event.preventDefault();
      return;
    }

    if (event.pointerType !== "touch") {
      return;
    }

    const isLeftHalf = event.clientX < window.innerWidth * 0.5;

    if (isLeftHalf && movement.pointerId === null) {
      movement.pointerId = event.pointerId;
      movement.startX = event.clientX;
      movement.startY = event.clientY;
      movement.x = 0;
      movement.y = 0;

      joystick.style.left = `${event.clientX}px`;
      joystick.style.top = `${event.clientY}px`;

      knob.style.left = "50%";
      knob.style.top = "50%";

      joystick.classList.remove("hidden");

      canvas.setPointerCapture(event.pointerId);
      event.preventDefault();
      return;
    }

    if (look.pointerId === null) {
      look.pointerId = event.pointerId;
      look.lastX = event.clientX;
      look.lastY = event.clientY;

      canvas.setPointerCapture(event.pointerId);
      event.preventDefault();
    }
  });

  canvas.addEventListener("pointermove", (event) => {
    const { mouse, look, movement } = pointerState;

    if (event.pointerType === "mouse" && mouse.active && event.pointerId === mouse.pointerId) {
      updateCameraLook(
        event.clientX - mouse.lastX,
        event.clientY - mouse.lastY,
        POINTER_SENSITIVITY
      );

      mouse.lastX = event.clientX;
      mouse.lastY = event.clientY;

      event.preventDefault();
      return;
    }

    if (event.pointerId === movement.pointerId) {
      updateMoveJoystick(
        event.clientX,
        event.clientY,
        knob
      );

      event.preventDefault();
      return;
    }

    if (event.pointerId === look.pointerId) {
      updateCameraLook(
        event.clientX - look.lastX,
        event.clientY - look.lastY,
        TOUCH_LOOK_SENSITIVITY
      );

      look.lastX = event.clientX;
      look.lastY = event.clientY;

      event.preventDefault();
    }
  });

  canvas.addEventListener("pointerup", (event) => {
    releasePointer(
      canvas,
      event,
      joystick,
      knob
    );
  });

  canvas.addEventListener("pointercancel", (event) => {
    releasePointer(
      canvas,
      event,
      joystick,
      knob
    );
  });

  canvas.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });
}

/**
 * Inizializza WASD, frecce e Shift
 * Lo stato viene azzerato quando la finestra perde il focus
 */
function initKeyboardControls() {
  window.addEventListener("keydown", (event) => {
    if (!(event.code in keys)) {
      return;
    }

    keys[event.code] = true;
    event.preventDefault();
  });

  window.addEventListener("keyup", (event) => {
    if (!(event.code in keys)) {
      return;
    }

    keys[event.code] = false;
    event.preventDefault();
  });

  window.addEventListener("blur", () => {
    for (const keyCode in keys) {
      keys[keyCode] = false;
    }
  });
}

/**
 * Applica il movimento di tastiera e joystick alla camera
 */
function updateKeyboardMovement(dt) {
  const { forward, right } = getCameraMovementDirections();

  const keyboardSpeed = (keys.ShiftLeft || keys.ShiftRight) ? FAST_MOVE_SPEED : BASE_MOVE_SPEED;
  const keyboardStep = keyboardSpeed * dt;

  // Desktop: avanti / indietro
  if (keys.KeyW || keys.ArrowUp) {
    state.cameraPosition[0] +=
      forward[0] * keyboardStep;

    state.cameraPosition[2] +=
      forward[2] * keyboardStep;
  }

  if (keys.KeyS || keys.ArrowDown) {
    state.cameraPosition[0] -=
      forward[0] * keyboardStep;

    state.cameraPosition[2] -=
      forward[2] * keyboardStep;
  }

  // Desktop: movimento laterale
  if (keys.KeyA || keys.ArrowLeft) {
    state.cameraPosition[0] -=
      right[0] * keyboardStep;

    state.cameraPosition[2] -=
      right[2] * keyboardStep;
  }

  if (keys.KeyD || keys.ArrowRight) {
    state.cameraPosition[0] +=
      right[0] * keyboardStep;

    state.cameraPosition[2] +=
      right[2] * keyboardStep;
  }

  // Mobile: il vettore conserva l'intensità in base
  // alla distanza del dito dal centro del joystick
  const movement = pointerState.movement;

  if (Math.hypot(movement.x, movement.y) > JOYSTICK_DEAD_ZONE) { 
    state.cameraPosition[0] +=
      forward[0] *
      (-movement.y) *
      BASE_MOVE_SPEED *
      dt;

    state.cameraPosition[2] +=
      forward[2] *
      (-movement.y) *
      BASE_MOVE_SPEED *
      dt;

    state.cameraPosition[0] +=
      right[0] *
      movement.x *
      BASE_MOVE_SPEED *
      dt;

    state.cameraPosition[2] +=
      right[2] *
      movement.x *
      BASE_MOVE_SPEED *
      dt;
  }

  keepCameraInsideChapel();
}