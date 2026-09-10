"use strict";

const CHAPEL_MODEL = {
  objPath: "../models/chapel.obj",
  position: [0, 0, 0],
  scale: [10, 10, 10],
  yOffset: 5.1,
  yRotation: Math.PI,
};

const DEFAULT_COLOR = [1, 1, 1, 1];

/*
 * Indici dei gruppi nell'OBJ, definiti dall'ordine delle righe `g`
 * Se l'export di Blender cambia, bisogna aggiornare questa mappa
 */
const CHAPEL_GROUP_INDICES = {
  roofCurved: 1,
  floor: 2,
  walls: 3,
  door: 4,
  circWindow: 5,
  window: 6,
  windowLeft: 7,
  windowRight: 8,
  roof: 9,
};

function createChapelMeshPart() {
  return {
    bufferInfo: null,
    texture: null,
    color: DEFAULT_COLOR,
  };
}

/*
 * Parti dell'OBJ, opache e trasparenti sono separate al draw time
 */
const chapelParts = {
  walls: createChapelMeshPart(),
  roof: createChapelMeshPart(),
  floor: createChapelMeshPart(),
  door: createChapelMeshPart(),

  window: createChapelMeshPart(),
  windowLeft: createChapelMeshPart(),
  windowRight: createChapelMeshPart(),
  circWindow: createChapelMeshPart(),

  roofCurved: createChapelMeshPart(),
};

/**
 * Carica l'OBJ della struttura e crea un buffer WebGL per ogni gruppo
 */
async function loadChapelMeshes(gl) {
  const response = await fetch(CHAPEL_MODEL.objPath);

  if (!response.ok) {
    throw new Error(`Impossibile caricare OBJ: ${CHAPEL_MODEL.objPath}`);
  }

  const objText = await response.text();

  const mesh = new subd_mesh();

  glmReadOBJ(objText, mesh);
  Unitize(mesh);

  for (const [partName, groupIndex] of Object.entries(CHAPEL_GROUP_INDICES)) {
    chapelParts[partName].bufferInfo = createBufferForGroup(gl, mesh, groupIndex);
  }
}

/**
 * Trasformazione comune all'intera mesh OBJ della cappella
 */
function getChapelWorld() {
  let world = m4.identity();

  world = m4.translate(
    world,
    CHAPEL_MODEL.position[0],
    CHAPEL_MODEL.position[1] + CHAPEL_MODEL.yOffset,
    CHAPEL_MODEL.position[2]
  );

  world = m4.yRotate(
    world,
    CHAPEL_MODEL.yRotation
  );

  return m4.scale(
    world,
    CHAPEL_MODEL.scale[0],
    CHAPEL_MODEL.scale[1],
    CHAPEL_MODEL.scale[2]
  );
}

/**
 * Crea le uniform condivise dai gruppi della mesh principale
 */
function getChapelUniforms(view, projection, cameraPosition, shadowData
) {
  const world = getChapelWorld();
  const candleLight = state.candles.light;

  return {
    u_world: world,
    u_view: view,
    u_projection: projection,
    u_worldInverseTranspose:
      m4.transpose(m4.inverse(world)),

    u_viewWorldPosition: cameraPosition,

    u_pointLightPosition: candleLight.position,
    u_pointLightColor: candleLight.color,
    u_pointLightIntensity: candleLight.intensity,
    u_pointLightRadius: candleLight.radius,

    u_ambient: state.ambient,

    u_shadowEnabled: shadowData ? 1 : 0,
    u_shadowFarPlane: SHADOW_FAR,
  };
}

/**
 * Disegna una parte della mesh della cappella
 */
function drawChapelPart(part, commonUniforms) {
  if (!part?.bufferInfo || !part.texture) return;

  webglUtils.setBuffersAndAttributes(gl, programInfo, part.bufferInfo);

  webglUtils.setUniforms(
    programInfo,
    {
      ...commonUniforms,
      u_colorMult: part.color,
    }
  );

  bindLitTextures(part.texture);
  webglUtils.drawBufferInfo(gl, part.bufferInfo);
}

/**
 * Renderizza struttura opaca: pavimento, muri, coperture e porta.
 */
function drawChapelOpaque(view, projection, cameraPosition, shadowData = null) {
  gl.useProgram(programInfo.program);

  const commonUniforms = getChapelUniforms(view, projection, cameraPosition, shadowData);

  const opaqueParts = [
    chapelParts.floor,
    chapelParts.walls,
    chapelParts.roof,
    chapelParts.roofCurved,
    chapelParts.door,
  ];

  for (const part of opaqueParts) {
    drawChapelPart(part, commonUniforms);
  }
}

/**
 * Renderizza le vetrate nel pass trasparente
 */
function drawChapelTransparent(view, projection, cameraPosition) {
  gl.useProgram(programInfo.program);

  const commonUniforms = getChapelUniforms(view, projection, cameraPosition, null);

  const transparentParts = [
    chapelParts.window,
    chapelParts.windowLeft,
    chapelParts.windowRight,
    chapelParts.circWindow,
  ];

  for (const part of transparentParts) {
    drawChapelPart(part, commonUniforms);
  }
}