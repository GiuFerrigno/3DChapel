"use strict";

const chapel = {
  objPath: '../models/chapel.obj',
  position: [0, 0, 0],
  scale:    [10, 10, 10],
};

const chapelParts = {
  walls: {
    objName: 'Walls',
    bufferInfo: null,
    texture: null,
    color: [1, 1, 1, 1],    // muro
  },
  roof: {
    objName: 'Roof',
    bufferInfo: null,
    texture: null,
    color: [1, 1, 1, 1],    // tetto
  },
  floor: {
    objName: 'Floor',
    bufferInfo: null,
    texture: null,
    color: [1, 1, 1, 1],    // pavimento
  },
  door: {
    objName: 'Door',
    bufferInfo: null,
    texture: null,
    color: [1, 1, 1, 1],    // legno porta
  },
  window: {
    objName: 'Window',
    bufferInfo: null,
    texture: null,
    color: [1, 1, 1, 1],    // vetro finestra centrale
  },
  windowLeft: {
    objName: 'WindowLeft',
    bufferInfo: null,
    texture: null,
    color: [1, 1, 1, 1],    // vetro finestra sinistra
  },
  windowRight: {
    objName: 'WindowRight',
    bufferInfo: null,
    texture: null,
    color: [1, 1, 1, 1],    // vetro finestra destra
  },
  circWindow: {
    objName: 'CircWindow',
    bufferInfo: null,
    texture: null,
    color: [1, 1, 1, 1],    // vetro finestra circolare
  },
  roofCurved: {
    objName: 'Cupola',
    bufferInfo: null,
    texture: null,
    color: [1, 1, 1, 1],    // materiale tetto/cupola
  },
};

/*
function buildChapelArrays(mesh) {
  const positions = [];
  const normals = [];
  const texcoords = [];

  for (let i = 1; i <= mesh.nface; i++) {
    const face = mesh.face[i];

    for (let k = 0; k < 3; k++) {
      const vi = face.vert[k];
      const v = mesh.vert[vi];
      positions.push(v.x, v.y, v.z);

      let nx = 0, ny = 0, nz = 1;
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
        texcoords.push(0.0, 0.0); // fallback per la cappella
      }
    }
  }

  return {
    position: { numComponents: 3, data: new Float32Array(positions) },
    normal:   { numComponents: 3, data: new Float32Array(normals) },
    texcoord: { numComponents: 2, data: new Float32Array(texcoords) },
  };
}
*/


async function loadChapelMeshes(gl) {
  const response = await fetch(chapel.objPath);
  if (!response.ok) {
    throw new Error(`Impossibile caricare OBJ: chapel.obj`);
  }

  const text = await response.text();

  const mesh = new subd_mesh();
  glmReadOBJ(text, mesh);
  Unitize(mesh);

  // Mappa dei group (in base alle righe g ... ):
  // 1: RoofCurved_Mesh
  // 2: Floor_Mesh
  // 3: Roof_Mesh
  // 4: Walls_Mesh
  // 5: Door_Mesh
  // 6: CircWindow_Mesh
  // 7: Window_Mesh
  // 8: WindowLeft_Mesh
  // 9: WindowRIght_Mesh

  chapelParts.roofCurved.bufferInfo  = createBufferForGroup(gl, mesh, 1);
  chapelParts.floor.bufferInfo       = createBufferForGroup(gl, mesh, 2);
  chapelParts.roof.bufferInfo        = createBufferForGroup(gl, mesh, 3);
  chapelParts.walls.bufferInfo       = createBufferForGroup(gl, mesh, 4);
  chapelParts.door.bufferInfo        = createBufferForGroup(gl, mesh, 5);
  chapelParts.circWindow.bufferInfo  = createBufferForGroup(gl, mesh, 6);
  chapelParts.window.bufferInfo= createBufferForGroup(gl, mesh, 7);
  chapelParts.windowLeft.bufferInfo  = createBufferForGroup(gl, mesh, 8);
  chapelParts.windowRight.bufferInfo = createBufferForGroup(gl, mesh, 9);
}

function createBufferForGroup(gl, mesh, groupIndex) {
  const positions = [];
  const normals   = [];
  const texcoords = [];

  for (let i = 1; i <= mesh.nface; i++) {
    const face = mesh.face[i];

    if (face.group !== groupIndex) continue;

    for (let k = 0; k < 3; k++) {
      const vi = face.vert[k];
      const v  = mesh.vert[vi];
      positions.push(v.x, v.y, v.z);

      let nx = 0, ny = 0, nz = 1;
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
        texcoords.push(0.0, 0.0);
      }
    }
  }

  const arrays = {
    position: { numComponents: 3, data: new Float32Array(positions) },
    normal:   { numComponents: 3, data: new Float32Array(normals) },
    texcoord: { numComponents: 2, data: new Float32Array(texcoords) },
  };

  return webglUtils.createBufferInfoFromArrays(gl, arrays);
}

function getChapelWorld() {
  let world = m4.identity();

  world = m4.translate(
    world,
    chapel.position[0],
    chapel.position[1],
    chapel.position[2]
  );

  // se vuoi ruotare la cappella, aggiungi qui m4.yRotate / m4.xRotate
  const rotationY = Math.PI;   // 180 gradi in radianti
  world = m4.yRotate(world, rotationY);

  world = m4.scale(
    world,
    chapel.scale[0],
    chapel.scale[1],
    chapel.scale[2]
  );

  return world;
}

function drawChapel(view, projection, cameraPosition, lightDirection) {
  const world = getChapelWorld();
  const worldInverseTranspose = m4.transpose(m4.inverse(world));

  const effectiveAmbient = state.lightEnabled ? state.ambient : 0.15;
  const effectiveLightIntensity = state.lightEnabled ? state.lightIntensity : 0.0;

  gl.useProgram(programInfo.program);

  const commonUniforms = {
    u_world: world,
    u_view: view,
    u_projection: projection,
    u_worldInverseTranspose: worldInverseTranspose,
    u_lightDirection: lightDirection,
    u_viewWorldPosition: cameraPosition,
    u_ambient: effectiveAmbient,
    u_lightIntensity: effectiveLightIntensity,
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

  drawPart(chapelParts.floor);
  drawPart(chapelParts.walls);
  drawPart(chapelParts.roof);
  drawPart(chapelParts.roofCurved);
  drawPart(chapelParts.door);
  drawPart(chapelParts.window);
  drawPart(chapelParts.windowLeft);
  drawPart(chapelParts.windowRight);
  drawPart(chapelParts.circWindow);
}