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

/*
// Calcola la posizione della camera orbitale a partire da yaw, pitch, distanza e target
function getCameraPosition() {
  const cp = Math.cos(state.cameraPitch);
  const sp = Math.sin(state.cameraPitch);
  const cy = Math.cos(state.cameraYaw);
  const sy = Math.sin(state.cameraYaw);

  const x = state.target[0] + state.cameraDist * cp * sy;
  const y = state.target[1] + state.cameraDist * sp;
  const z = state.target[2] + state.cameraDist * cp * cy;

  return [x, y, z];
}

// Ripristina la camera ai valori iniziali definiti nei default
function resetCamera() {
  state.cameraYaw = CAMERA_DEFAULTS.yaw;
  state.cameraPitch = CAMERA_DEFAULTS.pitch;
  state.cameraDist = CAMERA_DEFAULTS.dist;
  state.target[0] = CAMERA_DEFAULTS.target[0];
  state.target[1] = CAMERA_DEFAULTS.target[1];
  state.target[2] = CAMERA_DEFAULTS.target[2];
}
*/

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

// Crea cubi ? 
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