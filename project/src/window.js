"use strict";

let windowBufferInfo = null;

const WINDOW_MODEL = {
  objPath: "../models/flatWindow.obj",
  fallbackU: 0.5,
  fallbackV: 0.5,
  rotationY: Math.PI / 2,
};

function buildWindowArrays(mesh) {
  const positions = [];
  const normals = [];
  const texcoords = [];

  for (let i = 1; i <= mesh.nface; i++) {
    const face = mesh.face[i];

    for (let k = 0; k < 3; k++) {
      const vi = face.vert[k];
      const v = mesh.vert[vi];
      positions.push(v.x, v.y, v.z);

      let nx = 0;
      let ny = 0;
      let nz = 1;

      const ni = face.normalVertexIndex && face.normalVertexIndex[k];

      if (ni && mesh.normal[ni]) {
        nx = mesh.normal[ni].i;
        ny = mesh.normal[ni].j;
        nz = mesh.normal[ni].k;
      } else if (mesh.facetnorms && mesh.facetnorms[face.normalFaceIndex]) {
        nx = mesh.facetnorms[face.normalFaceIndex].i;
        ny = mesh.facetnorms[face.normalFaceIndex].j;
        nz = mesh.facetnorms[face.normalFaceIndex].k;
      }

      normals.push(nx, ny, nz);

      const ti = face.textCoordsIndex && face.textCoordsIndex[k];
      if (ti && mesh.textCoords && mesh.textCoords[ti]) {
        texcoords.push(mesh.textCoords[ti].u, mesh.textCoords[ti].v);
      } else {
        texcoords.push(WINDOW_MODEL.fallbackU, WINDOW_MODEL.fallbackV);
      }
    }
  }

  return {
    position: { numComponents: 3, data: new Float32Array(positions) },
    normal: { numComponents: 3, data: new Float32Array(normals) },
    texcoord: { numComponents: 2, data: new Float32Array(texcoords) },
  };
}

async function loadWindowMesh(gl) {
  const response = await fetch(WINDOW_MODEL.objPath);
  if (!response.ok) {
    throw new Error(`Impossibile caricare OBJ: ${WINDOW_MODEL.objPath}`);
  }

  const text = await response.text();

  const mesh = new subd_mesh();
  glmReadOBJ(text, mesh);
  Unitize(mesh);

  const arrays = buildWindowArrays(mesh);
  windowBufferInfo = webglUtils.createBufferInfoFromArrays(gl, arrays);

  state.window3D.ready = true;
}

function getWindowWorld() {
  let world = m4.identity();

  world = m4.translate(
    world,
    state.window3D.position[0],
    state.window3D.position[1],
    state.window3D.position[2]
  );

  world = m4.yRotate(world, WINDOW_MODEL.rotationY);

  world = m4.scale(
    world,
    state.window3D.scale[0],
    state.window3D.scale[1],
    state.window3D.scale[2]
  );

  return world;
}

function drawWindow(view, projection, cameraPosition, lightDirection) {
  if (!state.showWindowEffect) return;
  if (!state.window3D.ready || !windowBufferInfo) return;

  const world = getWindowWorld();
  const worldInverseTranspose = m4.transpose(m4.inverse(world));

  const effectiveAmbient = state.lightEnabled ? state.ambient : 0.15;
  const effectiveLightIntensity = state.lightEnabled ? state.lightIntensity : 0.0;

  gl.disable(gl.CULL_FACE);

  gl.useProgram(programInfo.program);
  webglUtils.setBuffersAndAttributes(gl, programInfo, windowBufferInfo);

  webglUtils.setUniforms(programInfo, {
    u_world: world,
    u_view: view,
    u_projection: projection,
    u_worldInverseTranspose: worldInverseTranspose,
    u_lightDirection: lightDirection,
    u_viewWorldPosition: cameraPosition,
    u_colorMult: state.window3D.color,
    u_texture: window.windowTexture,
    u_ambient: effectiveAmbient,
    u_lightIntensity: effectiveLightIntensity,
  });

  webglUtils.drawBufferInfo(gl, windowBufferInfo);

  gl.enable(gl.CULL_FACE);
}