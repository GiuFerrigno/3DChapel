"use strict";

let plaqueObjBufferInfo = null;
let plaqueObjReady = false;
let plaqueObjBounds = null;

const PLAQUE_OBJ_CONFIG = {
  url: "../models/targa.obj",
  position: [-3.25, -4, 9.6],
  rotationY: Math.PI / 2,
  scale: [1.0, 1.0, 1.0],
  color: [1.0, 1.0, 1.0, 1.0],
  texture: null,
  heightOffset: 1.5,
};

function createPlaqueArraysFromMesh(mesh) {
  const positions = [];
  const normals = [];
  const texcoords = [];

  for (let i = 1; i <= mesh.nface; i++) {
    const face = mesh.face[i];

    if (!face || !face.vert || face.vert.length < 3) {
      continue;
    }

    // Triangolazione a ventaglio delle facce con più di tre vertici.
    for (let k = 1; k < face.vert.length - 1; k++) {
      const triangle = [0, k, k + 1];

      for (const corner of triangle) {
        const vertex = mesh.vert[face.vert[corner]];
        if (!vertex) continue;

        positions.push(vertex.x, vertex.y, vertex.z);

        const normalIndex = face.normalVertexIndex?.[corner];
        const normal =
          normalIndex && mesh.normal?.[normalIndex]
            ? mesh.normal[normalIndex]
            : mesh.facetnorms?.[face.normalFaceIndex];

        if (normal) {
          normals.push(normal.i, normal.j, normal.k);
        } else {
          normals.push(0, 1, 0);
        }

        const uvIndex = face.textCoordsIndex?.[corner];
        const uv =
          uvIndex && mesh.textCoords?.[uvIndex]
            ? mesh.textCoords[uvIndex]
            : null;

        if (uv) {
          texcoords.push(uv.u, uv.v);
        } else {
          texcoords.push(0.5, 0.5);
        }
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

async function initPlaqueOBJ(gl) {
  const response = await fetch(PLAQUE_OBJ_CONFIG.url);

  if (!response.ok) {
    throw new Error(
      `Impossibile caricare ${PLAQUE_OBJ_CONFIG.url}: HTTP ${response.status}`
    );
  }

  const objText = await response.text();
  const mesh = new subd_mesh();

  glmReadOBJ(objText, mesh);

  if (!mesh.normal || mesh.normal.length <= 1) {
    FacetNormals(mesh);
  }

  // Mantiene lo stesso comportamento usato per la colonna.
  Unitize(mesh);

  plaqueObjBounds = computeMeshBounds(mesh);

  if (!plaqueObjBounds || plaqueObjBounds.width <= 0 || plaqueObjBounds.height <= 0 || plaqueObjBounds.depth <= 0) {
    throw new Error("Dimensioni OBJ della targa non valide");
  }

  // Se impostata, ridimensiona la targa a una larghezza specifica.
  if (window.PLAQUE_TARGET_WIDTH !== undefined) {
    const uniformScale = window.PLAQUE_TARGET_WIDTH / plaqueObjBounds.width;

    PLAQUE_OBJ_CONFIG.scale = [
      uniformScale,
      uniformScale,
      uniformScale,
    ];
  }

  // Porta la base della targa a position[1].
  PLAQUE_OBJ_CONFIG.position[1] = -plaqueObjBounds.minY * PLAQUE_OBJ_CONFIG.scale[1] + PLAQUE_OBJ_CONFIG.heightOffset;

  const arrays = createPlaqueArraysFromMesh(mesh);

  plaqueObjBufferInfo = webglUtils.createBufferInfoFromArrays(gl, arrays);

  plaqueObjReady = true;

  console.log("Targa OBJ caricata");
  console.log("Bounds:", plaqueObjBounds);
  console.log("Scala:", PLAQUE_OBJ_CONFIG.scale);
  console.log("Posizione:", PLAQUE_OBJ_CONFIG.position);
}

function drawPlaqueOBJ(view, projection, cameraPosition, lightDirection) {

  if (!plaqueObjReady || !plaqueObjBufferInfo) return;

  let world = m4.identity();

  world = m4.translate(
    world,
    PLAQUE_OBJ_CONFIG.position[0],
    PLAQUE_OBJ_CONFIG.position[1],
    PLAQUE_OBJ_CONFIG.position[2]
  );

  world = m4.yRotate(
    world,
    PLAQUE_OBJ_CONFIG.rotationY
  );

  world = m4.scale(
    world,
    PLAQUE_OBJ_CONFIG.scale[0],
    PLAQUE_OBJ_CONFIG.scale[1],
    PLAQUE_OBJ_CONFIG.scale[2]
  );

  const worldInverseTranspose = m4.transpose(m4.inverse(world));

  gl.useProgram(programInfo.program);

  webglUtils.setBuffersAndAttributes(gl, programInfo, plaqueObjBufferInfo);

  const ambient = state.lightEnabled !== false ? state.ambient : 0.15;

  const lightIntensity = state.lightEnabled !== false ? state.lightIntensity : 0.0;

  PLAQUE_OBJ_CONFIG.texture = window.plaqueTexture

  webglUtils.setUniforms(programInfo, {
    u_world: world,
    u_view: view,
    u_projection: projection,
    u_worldInverseTranspose: worldInverseTranspose,
    u_lightDirection: lightDirection,
    u_viewWorldPosition: cameraPosition,
    u_colorMult: PLAQUE_OBJ_CONFIG.color,
    u_texture: PLAQUE_OBJ_CONFIG.texture || window.whiteTexture,
    u_ambient: ambient,
    u_lightIntensity: lightIntensity,
  });

  gl.disable(gl.CULL_FACE);
  webglUtils.drawBufferInfo(gl, plaqueObjBufferInfo);
  gl.enable(gl.CULL_FACE);
}