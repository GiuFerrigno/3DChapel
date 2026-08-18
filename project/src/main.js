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

uniform vec4 u_colorMult;
uniform sampler2D u_texture;
uniform float u_ambient;
uniform vec3 u_pointLightPosition;
uniform vec3 u_pointLightColor;
uniform float u_pointLightIntensity;
uniform float u_pointLightRadius;

void main() {
  vec3 normal = normalize(v_normal);

  vec3 toLight = u_pointLightPosition - v_worldPosition;
  float distanceToLight = length(toLight);
  vec3 lightDir = normalize(toLight);
  float diffuse = max(dot(normal, lightDir), 0.0);

  float attenuation = 1.0 / (1.0 + distanceToLight / u_pointLightRadius + 
                      (distanceToLight * distanceToLight) / (u_pointLightRadius * u_pointLightRadius));

  vec3 lightColor = vec3(u_ambient) + u_pointLightColor * diffuse * u_pointLightIntensity * attenuation;

  vec4 baseColor = texture2D(u_texture, v_texcoord) * u_colorMult;

  if (baseColor.a < 0.05) discard;

  gl_FragColor = vec4(baseColor.rgb * lightColor, baseColor.a);
}
`;

const candleVS = `
attribute vec4 a_position;
attribute vec2 a_texcoord;

uniform mat4 u_world;
uniform mat4 u_view;
uniform mat4 u_projection;

varying vec2 v_texcoord;

void main() {
  gl_Position = u_projection * u_view * u_world * a_position;
  v_texcoord = a_texcoord;
}
`;

const candleFS = `
precision mediump float;

uniform vec4 u_colorMult;
uniform sampler2D u_texture;
uniform float u_emissionStrength;

varying vec2 v_texcoord;

void main() {
  vec4 color = texture2D(u_texture, v_texcoord) * u_colorMult;
  if (color.a < 0.05) discard;
  gl_FragColor = vec4(color.rgb * u_emissionStrength, color.a);
}
`;

function setupGUI() {
  gui = new dat.GUI();

  const cameraFolder = gui.addFolder("Camera");
  cameraFolder.add(state, "cameraYaw", -3.14, 3.14, 0.01).name("Yaw");
  cameraFolder.add(state, "cameraPitch", 0.1, 1.2, 0.01).name("Pitch");
  cameraFolder.add(state, "cameraYaw", -Math.PI, Math.PI, 0.01).name("Look left/right");
  cameraFolder.add(state, "cameraPitch", -Math.PI / 2 + 0.05, Math.PI / 2 - 0.05, 0.0).name("Look up/down");
  cameraFolder.add(state.cameraPosition, "1", 0.5, 3.0, 0.05).name("Eye height");
  
  const lightFolder = gui.addFolder("Point light");
  lightFolder.add(state, "ambient", 0.0, 1.0, 0.01).name("Ambient");
  lightFolder.add(state.candles.light, "baseIntensity", 0.0, 8.0, 0.01).name("Intensity");
  lightFolder.add(state.candles.light, "radius", 0.5, 20.0, 0.1).name("Radius");
  lightFolder.add(state.candles, "enabled").name("Candles");

  const effectsFolder = gui.addFolder("Effects");
  effectsFolder.add(state.candles, "animate" ).name("Flames animation");
  effectsFolder.add(state.candles, "speed", 0.2, 3.0, 0.1).name("Speed");

  const guiActions = {
    resetCamera() {
      resetCamera();
    }
  };

  cameraFolder.add(guiActions, "resetCamera").name("Reset camera");
}

function resizeCanvas() {
  webglUtils.resizeCanvasToDisplaySize(gl.canvas, window.devicePixelRatio || 1);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
}

function render(time) {
  time *= 0.001;
  const dt = Math.min(time - lastTime, 0.033);
  lastTime = time;

  updateKeyboardMovement(dt);
  updateCandles(time);          
 
  resizeCanvas();

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);

  gl.clearColor(0.86, 0.92, 0.98, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const projection = m4.perspective(Math.PI / 4, aspect, 0.1, 100.0);

  const cameraPosition = getCameraPosition();
  const cameraTarget = getCameraTarget();
  const camera = m4.lookAt(cameraPosition, cameraTarget, [0, 1, 0]);

  const view = m4.inverse(camera);

  drawChapel(view, projection, cameraPosition);
  drawChapelParts(view, projection, cameraPosition);
  drawCandles(view, projection, cameraPosition);

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
  
  candleProgramInfo = webglUtils.createProgramInfo(gl, [candleVS, candleFS]);

  await loadSceneTextures(gl);

  await initSceneGeometry(gl);

  initPointerControls(canvas);
  initKeyboardControls();
  setupGUI();

  requestAnimationFrame(render);
}

window.addEventListener("load", main);