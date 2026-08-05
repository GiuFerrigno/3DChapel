"use strict";

/*
const WINDOW_DEFAULTS = {
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
        texcoords.push(WINDOW_DEFAULTS.fallbackU, WINDOW_DEFAULTS.fallbackV);
      }
    }
  }

  return {
    position: { numComponents: 3, data: new Float32Array(positions) },
    normal: { numComponents: 3, data: new Float32Array(normals) },
    texcoord: { numComponents: 2, data: new Float32Array(texcoords) },
  };
}

async function loadWindowMesh(gl, win) {
  if (win.loading) return;
  win.loading = true;

  const response = await fetch(win.objPath);
  if (!response.ok) {
    throw new Error(`Impossibile caricare OBJ: ${win.objPath}`);
  }

  const text = await response.text();
  const mesh = new subd_mesh();
  glmReadOBJ(text, mesh);
  Unitize(mesh);

  const arrays = buildWindowArrays(mesh);
  win.bufferInfo = webglUtils.createBufferInfoFromArrays(gl, arrays);
  win.ready = true;
  win.loading = false;
}

function getWindowWorld(win) {
  let world = m4.identity();

  world = m4.translate(
    world,
    win.position[0],
    win.position[1],
    win.position[2]
  );

  world = m4.yRotate(world, WINDOW_DEFAULTS.rotationY);

  world = m4.scale(
    world,
    win.scale[0],
    win.scale[1],
    win.scale[2]
  );

  return world;
}

function drawWindow(view, projection, cameraPosition, lightDirection, win) {
  if (!state.showWindowEffect) return;
  if (!win.ready || !win.bufferInfo) return;

  const world = getWindowWorld(win);
  const worldInverseTranspose = m4.transpose(m4.inverse(world));

  const effectiveAmbient = state.lightEnabled ? state.ambient : 0.15;
  const effectiveLightIntensity = state.lightEnabled ? state.lightIntensity : 0.0;

  gl.disable(gl.CULL_FACE);

  gl.useProgram(programInfo.program);
  webglUtils.setBuffersAndAttributes(gl, programInfo, win.bufferInfo);

  webglUtils.setUniforms(programInfo, {
    u_world: world,
    u_view: view,
    u_projection: projection,
    u_worldInverseTranspose: worldInverseTranspose,
    u_lightDirection: lightDirection,
    u_viewWorldPosition: cameraPosition,
    u_colorMult: win.color,
    u_texture: win.texture,  
    u_ambient: effectiveAmbient,
    u_lightIntensity: effectiveLightIntensity,
  });

  webglUtils.drawBufferInfo(gl, win.bufferInfo);

  gl.enable(gl.CULL_FACE);
}

*/