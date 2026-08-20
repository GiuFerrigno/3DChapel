"use strict";

let gui = null;
let lastTime = 0;

const SHADOW_TEXTURE_UNIT = 7;

const vs = `
attribute vec4 a_position;
attribute vec3 a_normal;
attribute vec2 a_texcoord;

uniform mat4 u_world;
uniform mat4 u_view;
uniform mat4 u_projection;
uniform mat4 u_worldInverseTranspose;

uniform mat4 u_lightView;
uniform mat4 u_lightProjection;

varying vec3 v_normal;
varying vec3 v_worldPosition;
varying vec2 v_texcoord;
varying vec4 v_shadowPosition;

void main() {
  vec4 worldPosition = u_world * a_position;
  gl_Position = u_projection * u_view * worldPosition;

  v_worldPosition = worldPosition.xyz;
  v_normal = mat3(u_worldInverseTranspose) * a_normal;
  v_texcoord = a_texcoord;
  v_shadowPosition = u_lightProjection * u_lightView * worldPosition;
}
`;

const fs = `
precision mediump float;

varying vec3 v_normal;
varying vec3 v_worldPosition;
varying vec2 v_texcoord;
varying vec4 v_shadowPosition;

uniform vec4 u_colorMult;
uniform sampler2D u_texture;

uniform sampler2D u_shadowMap;
uniform int u_shadowEnabled;

uniform float u_ambient;
uniform vec3 u_pointLightPosition;
uniform vec3 u_pointLightColor;
uniform float u_pointLightIntensity;
uniform float u_pointLightRadius;

float calculateShadow() {
  vec3 shadowCoords = v_shadowPosition.xyz / v_shadowPosition.w;
  shadowCoords = shadowCoords * 0.5 + 0.5;

  if ( shadowCoords.x < 0.0 || shadowCoords.x > 1.0 || 
       shadowCoords.y < 0.0 || shadowCoords.y > 1.0 || 
       shadowCoords.z < 0.0 || shadowCoords.z > 1.0) {
    return 1.0;
  }

  float storedDepth = texture2D(u_shadowMap, shadowCoords.xy).r;
  float currentDepth = shadowCoords.z;

  float bias = 0.005;

  if (currentDepth - bias > storedDepth) {
    return 0.35;
  }

  return 1.0;
}

void main() {
  vec3 normal = normalize(v_normal);

  vec3 toLight = u_pointLightPosition - v_worldPosition;
  float distanceToLight = length(toLight);
  vec3 lightDir = normalize(toLight);

  float diffuse = max(dot(normal, lightDir), 0.0);

  float attenuation = 1.0 / (1.0 + distanceToLight / u_pointLightRadius +
                              (distanceToLight * distanceToLight) /
                                (u_pointLightRadius * u_pointLightRadius));

  float shadow = 1.0;

  if (u_shadowEnabled == 1) {
    shadow = calculateShadow();
  }

  vec3 lightColor = vec3(u_ambient) + u_pointLightColor * diffuse * u_pointLightIntensity * attenuation * shadow;
  vec4 baseColor = texture2D(u_texture, v_texcoord) * u_colorMult;

  if (baseColor.a < 0.05) {
    discard;
  }

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

let shadowProgramInfo;
let shadowFramebuffer;
let shadowTexture;
const shadowMapSize = 1024;

const shadowVS = `#version 300 es
in vec4 a_position;

uniform mat4 u_world;
uniform mat4 u_lightView;
uniform mat4 u_lightProjection;

void main() {
  gl_Position = u_lightProjection * u_lightView * u_world * a_position;
}
`;

const shadowFS = `#version 300 es
precision highp float;

void main() {
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

  const effectsFolder = gui.addFolder("Effects");
  effectsFolder.add(state.candles, "speed", 0.2, 3.0, 0.1).name("Speed");
  effectsFolder.add(state.advancedRendering, "shadowMapping").name("Shadows");

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

  const canvasWidth = gl.canvas.width;
  const canvasHeight = gl.canvas.height;
  const aspect = canvasWidth / canvasHeight;

  const projection = m4.perspective(
    Math.PI / 4,
    aspect,
    0.1,
    100.0
  );

  const cameraPosition = getCameraPosition();
  const cameraTarget = getCameraTarget();

  const camera = m4.lookAt(
    cameraPosition,
    cameraTarget,
    [0, 1, 0]
  );

  const view = m4.inverse(camera);

  // ----------------------------------------
  // PASS 1: shadow map
  // ----------------------------------------

  const shadowEnabled = state.advancedRendering.shadowMapping;
  const light = shadowEnabled ? getLightMatrices() : null;


  if (shadowEnabled && shadowFramebuffer && shadowTexture){
    renderShadowPass(light.lightView, light.lightProjection);

    // Ora siamo tornati al framebuffer principale
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, shadowTexture);
  } else {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  // ----------------------------------------
  // PASS 2: rendering principale
  // ----------------------------------------

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  gl.viewport(0, 0, canvasWidth, canvasHeight);

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.disable(gl.BLEND);
  gl.depthMask(true);

  gl.clearColor(0.86, 0.92, 0.98, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // TODO: controllare se quelli prima servono
  // Pass opaco
  beginOpaquePass(gl);

  drawChapelOpaque(view, projection, cameraPosition, light);
  drawChapelParts(view, projection, cameraPosition, light);
  drawCandlesOpaque(view, projection, cameraPosition, light);

  // Pass trasparente
  beginTransparentPass(gl);

  drawChapelTransparent(view, projection, cameraPosition);
  drawCandlesTransparent(view, projection, cameraPosition);
  drawDust(view, projection, time);

  endTransparentPass(gl);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, null);

  requestAnimationFrame(render);
}

async function main() {
  const canvas = document.getElementById("canvas");
  gl = canvas.getContext("webgl2");

  if (!gl) { throw new Error("WebGL 2 non supportato"); }

  programInfo = webglUtils.createProgramInfo(gl, [vs, fs]);
  candleProgramInfo = webglUtils.createProgramInfo(gl, [candleVS, candleFS]);
  shadowProgramInfo = webglUtils.createProgramInfo(gl, [shadowVS, shadowFS]);

  const shadow = createShadowFramebuffer(gl);
  shadowFramebuffer = shadow.framebuffer;
  shadowTexture = shadow.texture;

  await loadSceneTextures(gl);
  await initSceneGeometry(gl);

  initPointerControls(canvas);
  initKeyboardControls();
  setupGUI();

  requestAnimationFrame(render);
}

window.addEventListener("load", main);