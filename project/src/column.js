"use strict";

let columnObjBufferInfo = null;
let columnObjReady = false;

let columnObjBounds = null;

const COLUMN_OBJ_CONFIG = {
  url: "../models/columna.obj",
  scale: [3.0, 3.2, 3.0],
  positionY: 0.0,
  color: [1.0, 1.0, 1.0, 1.0],
};

function getColumnPosition(x, z) {
  return [
    x,
    COLUMN_OBJ_CONFIG.positionY,
    z,
  ];
}

// Converte la mesh OBJ nei buffer utilizzabili da WebGL
function createColumnArraysFromMesh(mesh) {
  const positions = [];
  const normals = [];
  const texcoords = [];

  for (let i = 1; i <= mesh.nface; i++) {
    const face = mesh.face[i];

    if (
      !face ||
      !face.vert ||
      face.vert.length < 3
    ) {
      continue;
    }

    for (let k = 0; k < 3; k++) {
      const vertex =
        mesh.vert[face.vert[k]];

      if (!vertex) continue;

      positions.push(
        vertex.x,
        vertex.y,
        vertex.z
      );

      const normalIndex =
        face.normalVertexIndex?.[k];

      const normal =
        normalIndex &&
        mesh.normal?.[normalIndex]
          ? mesh.normal[normalIndex]
          : mesh.facetnorms?.[
              face.normalFaceIndex
            ];

      if (normal) {
        normals.push(
          normal.i,
          normal.j,
          normal.k
        );
      } else {
        normals.push(0, 1, 0);
      }

      const uvIndex =
        face.textCoordsIndex?.[k];

      const uv =
        uvIndex &&
        mesh.textCoords?.[uvIndex]
          ? mesh.textCoords[uvIndex]
          : null;

      if (uv) {
        texcoords.push(uv.u, uv.v);
      } else {
        texcoords.push(0.5, 0.5);
      }
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

// Carica il file OBJ della colonna
async function initColumnOBJ(gl) {
  const response = await fetch(COLUMN_OBJ_CONFIG.url);

  if (!response.ok) {
    throw new Error(
      `Impossibile caricare ${COLUMN_OBJ_CONFIG.url}: HTTP ${response.status}`
    );
  }

  const objText = await response.text();

  const mesh = new subd_mesh();

  glmReadOBJ(
    objText,
    mesh
  );

  if (
    !mesh.normal ||
    mesh.normal.length <= 1
  ) {
    FacetNormals(mesh);
  }

  // Centra e normalizza il modello
  Unitize(mesh);

  // Calcola le dimensioni reali dopo Unitize
  columnObjBounds = computeMeshBounds(mesh);

  if (!columnObjBounds || columnObjBounds.height <= 0) {
    throw new Error(
      "Altezza OBJ non valida"
    );
  }

  // Altezza desiderata: uguale alla parete
  const targetHeight =
    COLUMN_DIMS.targetHeight;

  // Scala uniforme per mantenere le proporzioni
  const uniformScale =
    targetHeight /
    columnObjBounds.height;

  COLUMN_OBJ_CONFIG.scale = [
    uniformScale,
    uniformScale,
    uniformScale,
  ];

  // Porta il punto più basso dell'OBJ a Y = 0
  COLUMN_OBJ_CONFIG.positionY = -columnObjBounds.minY * uniformScale;

  const arrays =
    createColumnArraysFromMesh(mesh);

  columnObjBufferInfo = webglUtils.createBufferInfoFromArrays(gl, arrays);

  columnObjReady = true;

  console.log("Colonna OBJ caricata");
  console.log("Bounds:", columnObjBounds);
  console.log("Scala:", uniformScale);
  console.log(
    "Posizione Y:",
    COLUMN_OBJ_CONFIG.positionY
  );
}


// Disegna le colonne nella scena
function drawColumnsOBJ(view, projection, cameraPosition, lightDirection) {
  if (!columnObjReady || !columnObjBufferInfo) return; 

  for (const z of COLUMN_ROWS_Z) {
    //Colonne sinistre
    drawColumnOBJAt(
      getColumnPosition(COLUMN_DIMS.xLeft, z), Math.PI, view, projection, cameraPosition, lightDirection);

    //Colonne destre
    drawColumnOBJAt(
      getColumnPosition(COLUMN_DIMS.xRight, z), 0.0, view, projection, cameraPosition, lightDirection);
  }
}


//OBJ 
function drawColumnOBJAt(position, rotationY, view, projection, cameraPosition, lightDirection) {
  if (!columnObjReady || !columnObjBufferInfo) return;

  let world = m4.identity();

  world = m4.translate(
    world,
    position[0],
    position[1],
    position[2]
  );

  world = m4.yRotate(
    world,
    rotationY
  );

  world = m4.scale(
    world,
    COLUMN_OBJ_CONFIG.scale[0],
    COLUMN_OBJ_CONFIG.scale[1],
    COLUMN_OBJ_CONFIG.scale[2]
  );

  const worldInverseTranspose =
    m4.transpose(
      m4.inverse(world)
    );

  gl.useProgram(programInfo.program);

  webglUtils.setBuffersAndAttributes(gl, programInfo, columnObjBufferInfo);

  const ambient = state.lightEnabled !== false ? state.ambient : 0.15;

  const lightIntensity = state.lightEnabled !== false ? state.lightIntensity : 0.0;

  webglUtils.setUniforms(
    programInfo,
    {
      u_world: world,
      u_view: view,
      u_projection: projection,
      u_worldInverseTranspose:
        worldInverseTranspose,

      u_lightDirection: lightDirection,
      u_viewWorldPosition: cameraPosition,

      u_colorMult:
        COLUMN_OBJ_CONFIG.color,

      u_texture:
        window.columnTexture ||
        window.whiteTexture,

      u_ambient: ambient,
      u_lightIntensity: lightIntensity,
    }
  );

  gl.disable(gl.CULL_FACE);

  webglUtils.drawBufferInfo(gl, columnObjBufferInfo);

  gl.enable(gl.CULL_FACE);
}