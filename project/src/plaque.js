"use strict";

const PLAQUE_OBJ_CONFIG = {
  objPath: "../models/targa.obj",
  position: [-3.25, 0, 9.6],
  rotationY: Math.PI / 2,
  scale: [1.0, 1.0, 1.0],
  offsetY: 1.5,
};

const plaqueParts = {
  plaque: {
    objName: "Targa",
    bufferInfo: null,
    texture: null,
    color: [1, 1, 1, 1],
  },
  image: {
    objName: "Immagine",
    bufferInfo: null,
    texture: null,
    color: [1, 1, 1, 1],
  },
};

let plaqueBounds = null;

async function loadPlaqueMeshes(gl) {
  const response = await fetch(PLAQUE_OBJ_CONFIG.objPath);
  const text = await response.text();

  const mesh = new subd_mesh();
  glmReadOBJ(text, mesh);
  Unitize(mesh);

  // Calcola i bounds dopo Unitize(), come per le colonne
  plaqueBounds = computeMeshBounds(mesh);

  if (!plaqueBounds || plaqueBounds.width <= 0 || plaqueBounds.height <= 0 || plaqueBounds.depth <= 0) {
    throw new Error("Dimensioni OBJ della targa non valide");
  }

  // Porta la base della targa a Y = 0 prima di applicare offsetY
  PLAQUE_OBJ_CONFIG.position[1] = -plaqueBounds.minY * PLAQUE_OBJ_CONFIG.scale[1] + PLAQUE_OBJ_CONFIG.offsetY;

  // Gruppi dell'OBJ:
  // 1: Targa
  // 2: Immagine
  plaqueParts.plaque.bufferInfo = createBufferForGroup(gl, mesh, 1);
  plaqueParts.image.bufferInfo = createBufferForGroup(gl, mesh, 2);

  plaqueParts.plaque.texture = window.plaqueTexture;
  plaqueParts.image.texture = window.photoTexture;
}

function getPlaqueWorld() {
  let world = m4.identity();

  world = m4.translate(
    world,
    PLAQUE_OBJ_CONFIG.position[0],
    PLAQUE_OBJ_CONFIG.position[1],
    PLAQUE_OBJ_CONFIG.position[2]
  );

  world = m4.yRotate(world, PLAQUE_OBJ_CONFIG.rotationY);

  world = m4.scale(
    world,
    PLAQUE_OBJ_CONFIG.scale[0],
    PLAQUE_OBJ_CONFIG.scale[1],
    PLAQUE_OBJ_CONFIG.scale[2]
  );

  return world;
}

function drawPlaqueOBJ(view, projection) {
  const world = getPlaqueWorld();

  const worldInverseTranspose = m4.transpose(m4.inverse(world));

  gl.useProgram(programInfo.program);

  const commonUniforms = {
    u_world: world,
    u_view: view,
    u_projection: projection,
    u_worldInverseTranspose: worldInverseTranspose,

    u_ambient: state.ambient,

    u_pointLightPosition: state.candles.light.position,
    u_pointLightIntensity: state.candles.light.intensity,
    u_pointLightRadius: state.candles.light.radius,
  };

  function drawPart(part) {
    if (!part.bufferInfo || !part.texture) return;

    webglUtils.setBuffersAndAttributes(gl, programInfo, part.bufferInfo);

    webglUtils.setUniforms(programInfo, {
      ...commonUniforms,
      u_colorMult: part.color,
      u_texture: part.texture,
    });

    webglUtils.drawBufferInfo(gl, part.bufferInfo);
  }

  drawPart(plaqueParts.plaque);
  drawPart(plaqueParts.image);
}