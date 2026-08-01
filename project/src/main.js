"use strict";

let gui = null;
let lastTime = 0;

const vs = `
attribute vec4 a_position;
attribute vec3 a_normal;
attribute vec2 a_texcoord;

uniform mat4 u_world;
uniform mat4 u_view;
uniform mat4 u_projection;
uniform mat4 u_worldInverseTranspose;

varying vec3 v_normal;
varying vec3 v_worldPosition;
varying vec2 v_texcoord;

void main() {
  vec4 worldPosition = u_world * a_position;
  gl_Position = u_projection * u_view * worldPosition;

  v_worldPosition = worldPosition.xyz;
  v_normal = mat3(u_worldInverseTranspose) * a_normal;
  v_texcoord = a_texcoord;
}
`;

const fs = `
precision mediump float;

varying vec3 v_normal;
varying vec3 v_worldPosition;
varying vec2 v_texcoord;

uniform vec3 u_lightDirection;
uniform vec3 u_viewWorldPosition;
uniform vec4 u_colorMult;
uniform sampler2D u_texture;
uniform float u_ambient;
uniform float u_lightIntensity;

void main() {
  vec3 normal = normalize(v_normal);
  vec3 lightDir = normalize(-u_lightDirection);
  vec3 viewDir = normalize(u_viewWorldPosition - v_worldPosition);
  vec3 halfVec = normalize(lightDir + viewDir);

  float diffuse = max(dot(normal, lightDir), 0.0);
  float spec = pow(max(dot(normal, halfVec), 0.0), 24.0) * 0.18;

  float light = u_ambient + diffuse * u_lightIntensity;
  light = clamp(light, 0.0, 1.0);

  vec4 texColor = texture2D(u_texture, v_texcoord);
  vec4 baseColor = texColor * u_colorMult;

  vec3 finalColor = baseColor.rgb * light + spec;
  gl_FragColor = vec4(finalColor, baseColor.a);
}
`;

function setupGUI() {
  gui = new dat.GUI();

  const cameraFolder = gui.addFolder("Camera");
  cameraFolder.add(state, "cameraYaw", -3.14, 3.14, 0.01).name("Yaw");
  cameraFolder.add(state, "cameraPitch", 0.1, 1.2, 0.01).name("Pitch");
  cameraFolder.add(state, "cameraDist", 4.0, 20.0, 0.1).name("Zoom");
  cameraFolder.add(state.target, "0", -5, 5, 0.1).name("Target X");
  cameraFolder.add(state.target, "1", 0, 4, 0.1).name("Target Y");
  cameraFolder.add(state.target, "2", -8, 8, 0.1).name("Target Z");

  const lightFolder = gui.addFolder("Light");
  lightFolder.add(state, "sunAngle", 0.0, 6.28, 0.01).name("Sun angle");
  lightFolder.add(state, "ambient", 0.0, 1.0, 0.01).name("Ambient");
  lightFolder.add(state, "lightIntensity", 0.0, 2.0, 0.01).name("Diffuse");
  lightFolder.add(state, "animateSun").name("Sun animation");
  lightFolder.add(state, "lightEnabled").name("Light enabled");

  const effectsFolder = gui.addFolder("Effects");
  effectsFolder.add(state, "showWindowEffect").name("Show window effect");

  const guiActions = {
    resetCamera() {
      resetCamera();
      gui.updateDisplay();
    }
  };

  cameraFolder.add(guiActions, "resetCamera").name("Reset camera");
}

function resizeCanvas() {
  webglUtils.resizeCanvasToDisplaySize(gl.canvas, window.devicePixelRatio || 1);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
}

function getLightDirection() {
  const x = Math.cos(state.sunAngle);
  const y = 1.0;
  const z = Math.sin(state.sunAngle);
  return m4.normalize([x, y, z]);
}

function render(time) {
  time *= 0.001;
  const dt = Math.min(time - lastTime, 0.033);
  lastTime = time;

  if (state.animateSun) {
    state.sunAngle = time * 0.25;
  }

  updateKeyboardMovement(dt);

  resizeCanvas();

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);

  gl.clearColor(0.86, 0.92, 0.98, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const projection = m4.perspective(Math.PI / 4, aspect, 0.1, 100.0);

  const cameraPosition = getCameraPosition();
  const camera = m4.lookAt(cameraPosition, state.target, [0, 1, 0]);
  const view = m4.inverse(camera);

  const lightDirection = getLightDirection();

  drawChapel(view, projection, cameraPosition, lightDirection);

  requestAnimationFrame(render);
}

async function main() {
  const canvas = document.getElementById("canvas");
  gl = canvas.getContext("webgl");

  if (!gl) {
    alert("WebGL non supportato");
    return;
  }

  programInfo = webglUtils.createProgramInfo(gl, [vs, fs]);

  await loadSceneTextures(gl);

  await initSceneGeometry(gl);

  initPointerControls(canvas);
  initKeyboardControls();
  setupGUI();

  requestAnimationFrame(render);
}

window.addEventListener("load", main);