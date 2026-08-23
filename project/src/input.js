"use strict";

const pointerState = {
  mouseActive: false,
  mousePointerId: null,
  mouseLastX: 0,
  mouseLastY: 0,

  lookPointerId: null,
  lookLastX: 0,
  lookLastY: 0,

  movePointerId: null,
  moveStartX: 0,
  moveStartY: 0,
  moveX: 0,
  moveY: 0,
};

const POINTER_SENSITIVITY = 0.01;
const TOUCH_LOOK_SENSITIVITY = 0.008;
const ZOOM_SENSITIVITY = 0.01;

const MIN_CAMERA_PITCH = -Math.PI / 2 + 0.05;
const MAX_CAMERA_PITCH = Math.PI / 2 - 0.05;

const BASE_MOVE_SPEED = 2.5;
const FAST_MOVE_SPEED = 5.0;

const JOYSTICK_RADIUS = 60;
const JOYSTICK_DEAD_ZONE = 0.15;

// Margine dai muri, per impedire alla camera di uscire dalla cappella.
const CAMERA_MARGIN = 0.15;

const CHAPEL_MIN_X = -4.0 + CAMERA_MARGIN;
const CHAPEL_MAX_X = 4.0 - CAMERA_MARGIN;

const CHAPEL_MIN_Z = -7.0 + CAMERA_MARGIN;
const CHAPEL_MAX_Z = 7.0 - CAMERA_MARGIN;

const CAMERA_MIN_Y = 0.8;
const CAMERA_MAX_Y = 3.0;

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

function updateCameraLook(dx, dy, sensitivity) {
  state.cameraYaw += dx * sensitivity;
  state.cameraPitch -= dy * sensitivity;

  state.cameraPitch = clamp(
    state.cameraPitch,
    MIN_CAMERA_PITCH,
    MAX_CAMERA_PITCH
  );
}

function resetMoveJoystick(joystick, joystickKnob) {
  pointerState.movePointerId = null;
  pointerState.moveX = 0;
  pointerState.moveY = 0;

  joystick.classList.add("hidden");

  joystickKnob.style.left = "50%";
  joystickKnob.style.top = "50%";
}

function updateMoveJoystick(clientX, clientY, joystickKnob) {
  let dx = clientX - pointerState.moveStartX;
  let dy = clientY - pointerState.moveStartY;

  const distance = Math.hypot(dx, dy);

  if (distance > JOYSTICK_RADIUS) {
    const scale = JOYSTICK_RADIUS / distance;

    dx *= scale;
    dy *= scale;
  }

  pointerState.moveX = dx / JOYSTICK_RADIUS;
  pointerState.moveY = dy / JOYSTICK_RADIUS;

  joystickKnob.style.left =
    `${50 + pointerState.moveX * 50}%`;

  joystickKnob.style.top =
    `${50 + pointerState.moveY * 50}%`;
}

function initPointerControls(canvas) {
  const joystick = document.getElementById("moveJoystick");

  const joystickKnob = document.getElementById(
    "moveJoystickKnob"
  );

  if (!joystick || !joystickKnob) {
    console.warn("Joystick mobile non trovato: controlla #moveJoystick e #moveJoystickKnob.");
  }

  canvas.addEventListener("pointerdown", (e) => {
    // Desktop: il mouse controlla sempre lo sguardo
    if (e.pointerType === "mouse") {
      pointerState.mouseActive = true;
      pointerState.mousePointerId = e.pointerId;
      pointerState.mouseLastX = e.clientX;
      pointerState.mouseLastY = e.clientY;

      canvas.setPointerCapture(e.pointerId);
      e.preventDefault();
      return;
    }

    // Mobile: primo touch nella metà sinistra = movimento
    if (e.clientX < window.innerWidth * 0.5 && pointerState.movePointerId === null) {
      pointerState.movePointerId = e.pointerId;
      pointerState.moveStartX = e.clientX;
      pointerState.moveStartY = e.clientY;

      pointerState.moveX = 0;
      pointerState.moveY = 0;

      if (joystick && joystickKnob) {
        joystick.style.left = `${e.clientX}px`;
        joystick.style.top = `${e.clientY}px`;

        joystickKnob.style.left = "50%";
        joystickKnob.style.top = "50%";

        joystick.classList.remove("hidden");
      }

      canvas.setPointerCapture(e.pointerId);
      e.preventDefault();
      return;
    }

    // Mobile: touch nella metà destra = visuale
    if (pointerState.lookPointerId === null) {
      pointerState.lookPointerId = e.pointerId;
      pointerState.lookLastX = e.clientX;
      pointerState.lookLastY = e.clientY;

      canvas.setPointerCapture(e.pointerId);
      e.preventDefault();
    }
  });

  canvas.addEventListener("pointermove", (e) => {
    // Mouse desktop: visuale
    if (e.pointerType === "mouse" && pointerState.mouseActive && e.pointerId === pointerState.mousePointerId) {
      const dx = e.clientX - pointerState.mouseLastX;
      const dy = e.clientY - pointerState.mouseLastY;

      updateCameraLook(
        dx,
        dy,
        POINTER_SENSITIVITY
      );

      pointerState.mouseLastX = e.clientX;
      pointerState.mouseLastY = e.clientY;

      e.preventDefault();
      return;
    }

    // Touch sinistro: joystick
    if (e.pointerId === pointerState.movePointerId) {
      if (joystickKnob) {
        updateMoveJoystick(
          e.clientX,
          e.clientY,
          joystickKnob
        );
      }

      e.preventDefault();
      return;
    }

    // Touch destro: visuale
    if (e.pointerId === pointerState.lookPointerId) {
      const dx = e.clientX - pointerState.lookLastX;
      const dy = e.clientY - pointerState.lookLastY;

      updateCameraLook(
        dx,
        dy,
        TOUCH_LOOK_SENSITIVITY
      );

      pointerState.lookLastX = e.clientX;
      pointerState.lookLastY = e.clientY;

      e.preventDefault();
    }
  });

  function releasePointer(e) {
    if (e.pointerType === "mouse" && e.pointerId === pointerState.mousePointerId) {
      pointerState.mouseActive = false;
      pointerState.mousePointerId = null;
    }

    if (e.pointerId === pointerState.movePointerId) {
      if (joystick && joystickKnob) {
        resetMoveJoystick(
          joystick,
          joystickKnob
        );
      } else {
        pointerState.movePointerId = null;
        pointerState.moveX = 0;
        pointerState.moveY = 0;
      }
    }

    if (e.pointerId === pointerState.lookPointerId) {
      pointerState.lookPointerId = null;
    }

    if (canvas.hasPointerCapture(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId);
    }

    e.preventDefault();
  }

  canvas.addEventListener("pointerup", releasePointer);
  canvas.addEventListener("pointercancel", releasePointer);

  canvas.addEventListener(
    "wheel",
    (e) => {
      const amount = e.deltaY * ZOOM_SENSITIVITY;

      const forward = [
        Math.sin(state.cameraYaw),
        0,
        -Math.cos(state.cameraYaw),
      ];

      state.cameraPosition[0] += forward[0] * amount;
      state.cameraPosition[2] += forward[2] * amount;

      keepCameraInsideChapel();
      e.preventDefault();
    },
    { passive: false }
  );

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

  // Desktop: WASD oppure frecce
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

  // Mobile: joystick nella metà sinistra
  const joystickMagnitude = Math.hypot(
    pointerState.moveX,
    pointerState.moveY
  );

  if (joystickMagnitude > JOYSTICK_DEAD_ZONE) {
    // Joystick in alto = avanti
    state.cameraPosition[0] += forward[0] * (-pointerState.moveY) * BASE_MOVE_SPEED * dt;
    state.cameraPosition[2] += forward[2] * (-pointerState.moveY) * BASE_MOVE_SPEED * dt;

    // Joystick a destra/sinistra = movimento laterale
    state.cameraPosition[0] += right[0] * pointerState.moveX * BASE_MOVE_SPEED * dt;
    state.cameraPosition[2] += right[2] * pointerState.moveX * BASE_MOVE_SPEED * dt;
  }

  keepCameraInsideChapel();
}