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