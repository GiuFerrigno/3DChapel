"use strict";

let columnBufferInfo = null;
let isColumnModelReady = false;

const COLUMN_MODEL = {
  url: "../models/columna.obj",
  scale: [1, 1, 1],
  baseOffsetY: 0,
  color: [1, 1, 1, 1],
};

/**
 * Converte la mesh OBJ
 * Se un vertice non ha normali o UV, applica valori di fallback
 */
function createColumnArrays(mesh) {
  const positions = [];
  const normals = [];
  const texcoords = [];

  for (let faceIndex = 1; faceIndex <= mesh.nface; ++faceIndex) {
    const face = mesh.face[faceIndex];

    if (!face?.vert || face.vert.length < 3) {
      continue;
    }

    for (let vertexIndex = 0; vertexIndex < 3; ++vertexIndex) {
      const vertex = mesh.vert[face.vert[vertexIndex]];

      if (!vertex) {
        continue;
      }

      positions.push(
        vertex.x,
        vertex.y,
        vertex.z
      );

      const normalVertexIndex = face.normalVertexIndex?.[vertexIndex];

      const normal = mesh.normal?.[normalVertexIndex] ?? mesh.facetnorms?.[face.normalFaceIndex];

      normals.push(
        normal?.i ?? 0,
        normal?.j ?? 1,
        normal?.k ?? 0
      );

      const texcoordIndex = face.textCoordsIndex?.[vertexIndex];

      const texcoord = mesh.textCoords?.[texcoordIndex];

      texcoords.push(
        texcoord?.u ?? 0.5,
        texcoord?.v ?? 0.5
      );
    }
  }

  return {
    position: {
      numComponents: 3,
      data: new Float32Array(positions),
    },
    normal: {
      numComponents: 3,
      data: new Float32Array(normals),
    },
    texcoord: {
      numComponents: 2,
      data: new Float32Array(texcoords),
    },
  };
}

/**
 * Carica, normalizza e ridimensiona il modello OBJ della colonna
 * La base viene allineata al pavimento e l'altezza a COLUMN_DIMS.targetHeight
 */
async function initColumnOBJ(gl) {
  const response = await fetch(COLUMN_MODEL.url);

  if (!response.ok) {
    throw new Error(`Impossibile caricare ${COLUMN_MODEL.url}`);
  }

  const objText = await response.text();
  const mesh = new subd_mesh();

  glmReadOBJ(objText, mesh);

  if (!mesh.normal || mesh.normal.length <= 1) {
    FacetNormals(mesh);
  }

  Unitize(mesh);

  const bounds = computeMeshBounds(mesh);

  if (!bounds || bounds.height <= 0) {
    throw new Error("Altezza OBJ della colonna non valida");
  }

  const uniformScale = COLUMN_DIMS.targetHeight / bounds.height;

  COLUMN_MODEL.scale = [
    uniformScale,
    uniformScale,
    uniformScale,
  ];

  // Dopo la scala, il punto più basso coincide con Y = 0
  COLUMN_MODEL.baseOffsetY = -bounds.minY * uniformScale;

  const arrays = createColumnArrays(mesh);

  columnBufferInfo = webglUtils.createBufferInfoFromArrays(gl, arrays);

  isColumnModelReady = true;
}

/**
 * Costruisce la trasformazione di una singola colonna
 */
function getColumnWorldMatrix(x, z, rotationY) {
  let world = m4.identity();

  world = m4.translate(
    world,
    x,
    COLUMN_MODEL.baseOffsetY,
    z
  );

  world = m4.yRotate(
    world,
    rotationY
  );

  return m4.scale(
    world,
    COLUMN_MODEL.scale[0],
    COLUMN_MODEL.scale[1],
    COLUMN_MODEL.scale[2]
  );
}

/**
 * Render delle colonne
 */
function drawColumnsOBJ(view, projection, cameraPosition) {
  if (!isColumnModelReady || !columnBufferInfo) return;

  gl.useProgram(programInfo.program);

  const candleLight = state.candles.light;

  const sharedUniforms = {
    u_view: view,
    u_projection: projection,
    u_viewWorldPosition: cameraPosition,

    u_pointLightPosition: candleLight.position,
    u_pointLightColor: candleLight.color,
    u_pointLightIntensity: candleLight.intensity,
    u_pointLightRadius: candleLight.radius,

    u_colorMult: COLUMN_MODEL.color,
    u_ambient: state.ambient,

    u_shadowEnabled: 0,
    u_shadowFarPlane: SHADOW_FAR,
  };

  const materialTexture = window.columnTexture ?? window.whiteTexture;
  bindLitTextures(materialTexture);

  webglUtils.setBuffersAndAttributes(gl, programInfo, columnBufferInfo);


  for (const z of COLUMN_ROWS_Z) {
    // Le colonne sinistre sono ruotate di 180º 
    drawColumnAt(COLUMN_DIMS.xLeft, z, Math.PI, sharedUniforms);

    // Le colonne destre non necessitano di rotazione
    drawColumnAt(COLUMN_DIMS.xRight, z, 0, sharedUniforms);
  }
}

/**
 * Disegna un'istanza del modello della colonna
 */
function drawColumnAt(x, z, rotationY, sharedUniforms) {
  const world = getColumnWorldMatrix(x, z, rotationY);

  webglUtils.setUniforms(
    programInfo,
    {
      ...sharedUniforms,
      u_world: world,
      u_worldInverseTranspose:
        m4.transpose(m4.inverse(world)),
    }
  );

  webglUtils.drawBufferInfo(gl, columnBufferInfo);
}