"use strict";

let chapelBoxBufferInfo = null;
let chapelParts = [];

async function initSceneGeometry(gl) {
  chapelBoxBufferInfo = createBoxBufferInfo(gl);
  chapelParts = buildChapelParts();

  await loadWindowMesh(gl);
  initRoof(gl);
}

function getPartWorld(part) {
  let world = m4.identity();
  world = m4.translate(world, part.t[0], part.t[1], part.t[2]);
  world = m4.scale(world, part.s[0], part.s[1], part.s[2]);
  return world;
}

function drawPart(part, view, projection, cameraPosition, lightDirection) {
  const world = getPartWorld(part);
  const worldInverseTranspose = m4.transpose(m4.inverse(world));

  const effectiveAmbient = state.lightEnabled ? state.ambient : 0.15;
  const effectiveLightIntensity = state.lightEnabled ? state.lightIntensity : 0.0;

  let tex = window.wallTexture;
  if (part.material === "floor") tex = window.floorTilesTexture;
  if (part.material === "wood") tex = window.woodTexture;
  if (part.material === "col") tex = window.columnTexture;
  if (part.material === "white") tex = window.whiteTexture;

  gl.useProgram(programInfo.program);
  webglUtils.setBuffersAndAttributes(gl, programInfo, chapelBoxBufferInfo);

  webglUtils.setUniforms(programInfo, {
    u_world: world,
    u_view: view,
    u_projection: projection,
    u_worldInverseTranspose: worldInverseTranspose,
    u_lightDirection: lightDirection,
    u_viewWorldPosition: cameraPosition,
    u_colorMult: part.color,
    u_texture: tex,
    u_useTexture: true,
    u_ambient: effectiveAmbient,
    u_lightIntensity: effectiveLightIntensity,
  });

  webglUtils.drawBufferInfo(gl, chapelBoxBufferInfo);
}

function drawChapel(view, projection, cameraPosition, lightDirection) {
  for (const part of chapelParts) {
    drawPart(part, view, projection, cameraPosition, lightDirection);
  }

  drawWindow(view, projection, cameraPosition, lightDirection);
  drawRoof(view, projection, cameraPosition, lightDirection);
}