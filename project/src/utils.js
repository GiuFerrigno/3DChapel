"use strict";

// Limita un valore tra un minimo e un massimo
function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

// Controlla se un numero è una potenza di 2
function isPowerOf2(value) {
  return (value & (value - 1)) === 0;
}

// Crea una texture 1x1 a tinta unita da usare come placeholder o colore base
function createSolidTexture(gl, rgba) {
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);

  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    1,
    1,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    new Uint8Array(rgba)
  );

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  return tex;
}


// Carica una texture da file e applica i parametri corretti in base alla dimensione
function loadTexture(gl, url) {
  return new Promise((resolve, reject) => {
    const tex = createSolidTexture(gl, [200, 200, 200, 255]);
    const img = new Image();

    img.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        img
      );

      if (isPowerOf2(img.width) && isPowerOf2(img.height)) {
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      } else {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      }

      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      resolve(tex);
    };

    img.onerror = () => reject(new Error("Texture non caricata: " + url));
    img.src = url;
  });
}

function getCameraPosition() {
  return [...state.cameraPosition];
}

function getCameraTarget() {
  const yaw = state.cameraYaw;
  const pitch = state.cameraPitch;

  const direction = [
    Math.sin(yaw) * Math.cos(pitch),
    Math.sin(pitch),
    -Math.cos(yaw) * Math.cos(pitch),
  ];

  return [
    state.cameraPosition[0] + direction[0],
    state.cameraPosition[1] + direction[1],
    state.cameraPosition[2] + direction[2],
  ];
}

function resetCamera() {
  state.cameraPosition[0] = CAMERA_DEFAULTS.position[0];
  state.cameraPosition[1] = CAMERA_DEFAULTS.position[1];
  state.cameraPosition[2] = CAMERA_DEFAULTS.position[2];

  state.cameraYaw = CAMERA_DEFAULTS.yaw;
  state.cameraPitch = CAMERA_DEFAULTS.pitch;

  keepCameraInsideChapel();
}

// Crea cubo
function createUnitCubeArrays() {
  // Cubo unitario centrato in (0,0,0), lati da -0.5 a +0.5
  const positions = [
    // front face
    -0.5, -0.5,  0.5,
     0.5, -0.5,  0.5,
     0.5,  0.5,  0.5,
    -0.5,  0.5,  0.5,

    // back face
    -0.5, -0.5, -0.5,
    -0.5,  0.5, -0.5,
     0.5,  0.5, -0.5,
     0.5, -0.5, -0.5,

    // top
    -0.5,  0.5,  0.5,
     0.5,  0.5,  0.5,
     0.5,  0.5, -0.5,
    -0.5,  0.5, -0.5,

    // bottom
    -0.5, -0.5,  0.5,
    -0.5, -0.5, -0.5,
     0.5, -0.5, -0.5,
     0.5, -0.5,  0.5,

    // right
     0.5, -0.5,  0.5,
     0.5, -0.5, -0.5,
     0.5,  0.5, -0.5,
     0.5,  0.5,  0.5,

    // left
    -0.5, -0.5,  0.5,
    -0.5,  0.5,  0.5,
    -0.5,  0.5, -0.5,
    -0.5, -0.5, -0.5,
  ];

  const normals = [
    // front
    0, 0, 1,  0, 0, 1,  0, 0, 1,  0, 0, 1,
    // back
    0, 0,-1,  0, 0,-1,  0, 0,-1,  0, 0,-1,
    // top
    0, 1, 0,  0, 1, 0,  0, 1, 0,  0, 1, 0,
    // bottom
    0,-1, 0,  0,-1, 0,  0,-1, 0,  0,-1, 0,
    // right
    1, 0, 0,  1, 0, 0,  1, 0, 0,  1, 0, 0,
    // left
   -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
  ];

  const texcoords = [
    // front
    0, 0,  1, 0,  1, 1,  0, 1,
    // back
    0, 0,  0, 1,  1, 1,  1, 0,
    // top
    0, 0,  1, 0,  1, 1,  0, 1,
    // bottom
    0, 0,  0, 1,  1, 1,  1, 0,
    // right
    0, 0,  1, 0,  1, 1,  0, 1,
    // left
    0, 0,  1, 0,  1, 1,  0, 1,
  ];

  const indices = [
     0,  1,  2,   0,  2,  3,   // front
     4,  5,  6,   4,  6,  7,   // back
     8,  9, 10,   8, 10, 11,   // top
    12, 13, 14,  12, 14, 15,   // bottom
    16, 17, 18,  16, 18, 19,   // right
    20, 21, 22,  20, 22, 23,   // left
  ];

  return {
    position: { numComponents: 3, data: new Float32Array(positions) },
    normal:   { numComponents: 3, data: new Float32Array(normals) },
    texcoord: { numComponents: 2, data: new Float32Array(texcoords) },
    indices:  { numComponents: 3, data: new Uint16Array(indices) },
  };
}

// Buffer Info per cilindro 
function createCylinderBufferInfo(gl, radius = 0.5, height = 1.0, segments = 20) {
  const positions = [];
  const normals = [];
  const texcoords = [];
  const indices = [];

  const halfHeight = height * 0.5;

  for (let i = 0; i < segments; ++i) {

    const angle = i / segments * Math.PI * 2;
    const x = Math.cos(angle);
    const z = Math.sin(angle);

    const u = i / segments;

    positions.push(radius * x, -halfHeight, radius * z);
    normals.push(x, 0, z);
    texcoords.push(u, 0);

    positions.push(radius * x, halfHeight, radius * z);
    normals.push(x, 0, z);
    texcoords.push(u, 1);
  }

  for (let i = 0; i < segments; ++i) {
    const next = (i + 1) % segments;

    const bottom = i * 2;
    const top = bottom + 1;

    const nextBottom = next * 2;
    const nextTop = nextBottom + 1;

    indices.push(bottom, nextBottom, top);
    indices.push(nextBottom, nextTop, top);
  }

  const bottomCenter = positions.length / 3;

  positions.push(0, -halfHeight, 0);
  normals.push(0, -1, 0);
  texcoords.push(0.5, 0.5);

  const topCenter = bottomCenter + 1;

  positions.push(0, halfHeight, 0);
  normals.push(0, 1, 0);
  texcoords.push(0.5, 0.5);

  for (let i = 0; i < segments; ++i) {
    const next = (i + 1) % segments;
    const bottom = i * 2;
    const nextBottom = next * 2;

    indices.push(bottomCenter, nextBottom, bottom);

    const top = i * 2 + 1;
    const nextTop = next * 2 + 1;

    indices.push(topCenter, top, nextTop);
  }

  return webglUtils.createBufferInfoFromArrays(
    gl,
    {
      position: {
        numComponents: 3,
        data: new Float32Array(
          positions
        ),
      },

      normal: {
        numComponents: 3,
        data: new Float32Array(
          normals
        ),
      },

      texcoord: {
        numComponents: 2,
        data: new Float32Array(
          texcoords
        ),
      },

      indices: new Uint16Array(
        indices
      ),
    }
  );
}


// Calcola i limiti della geometria di una mesh OBJ.
// Funziona per qualsiasi altra mesh che utilizzi mesh.vert e mesh.nvert.
function computeMeshBounds(mesh) {
  let minX = Infinity;
  let minY = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let maxZ = -Infinity;

  for (let i = 1; i <= mesh.nvert; i++) {
    const vertex = mesh.vert[i];
    if (!vertex) continue;

    minX = Math.min(minX, vertex.x);
    minY = Math.min(minY, vertex.y);
    minZ = Math.min(minZ, vertex.z);
    maxX = Math.max(maxX, vertex.x);
    maxY = Math.max(maxY, vertex.y);
    maxZ = Math.max(maxZ, vertex.z);
  }

  return {
    minX,
    minY,
    minZ,
    maxX,
    maxY,
    maxZ,
    width: maxX - minX,
    height: maxY - minY,
    depth: maxZ - minZ,
  };
}

// Per il caricamento di diverse parti di un obj 
function createBufferForGroup(gl, mesh, groupIndex) {
  const positions = [];
  const normals = [];
  const texcoords = [];

  for (let i = 1; i <= mesh.nface; i++) {
    const face = mesh.face[i];

    if (!face || face.group !== groupIndex) continue;

    if (!face.vert || face.vert.length < 3) continue;

    for (let k = 0; k < 3; k++) {
      const vertexIndex = face.vert[k];
      const vertex = mesh.vert[vertexIndex];

      if (!vertex) continue;

      positions.push(
        vertex.x,
        vertex.y,
        vertex.z
      );

      let nx = 0;
      let ny = 0;
      let nz = 1;

      const normalIndex = face.normalVertexIndex && face.normalVertexIndex[k];

      if (normalIndex && mesh.normal && mesh.normal[normalIndex]) {

        const normal = mesh.normal[normalIndex];
        nx = normal.i;
        ny = normal.j;
        nz = normal.k;
      } else if (mesh.facetnorms && mesh.facetnorms[face.normalFaceIndex]) {

        const normal = mesh.facetnorms[face.normalFaceIndex];
        nx = normal.i;
        ny = normal.j;
        nz = normal.k;
      }

      normals.push(
        nx,
        ny,
        nz
      );

      const textureIndex = face.textCoordsIndex && face.textCoordsIndex[k];

      if (textureIndex && mesh.textCoords && mesh.textCoords[textureIndex]) {
        const uv = mesh.textCoords[textureIndex];
        texcoords.push(uv.u, uv.v);
      } else {
        texcoords.push(0.0, 0.0);
      }
    }
  }

  const positionData = new Float32Array(positions);

  const bufferInfo = webglUtils.createBufferInfoFromArrays(
      gl,
      {
        position: {
          numComponents: 3,
          data: positionData,
        },

        normal: {
          numComponents: 3,
          data: new Float32Array(normals),
        },

        texcoord: {
          numComponents: 2,
          data: new Float32Array(texcoords),
        },
      }
    );

  bufferInfo.positions = positionData;

  return bufferInfo;
}


function beginOpaquePass(gl) {
  gl.disable(gl.BLEND);
  gl.enable(gl.DEPTH_TEST);
  gl.depthMask(true);
}

function beginTransparentPass(gl) {
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.enable(gl.DEPTH_TEST);
  gl.depthMask(false);
}

function endTransparentPass(gl) {
  gl.depthMask(true);
  gl.disable(gl.BLEND);
}