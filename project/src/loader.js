"use strict";

const OBJ_PATHS = {
  mainAltar: "../models/altar2.obj",
};

const TEXTURE_PATHS = {
  floor: "../textures/floor.jpg",
  floorTiles: "../textures/floor2.jpg",
  wall: "../textures/wall.jpg",
  wood: "../textures/wood.jpg",
  column: "../textures/column.jpg",
  stainedGlass: "../models/stained-glass.png",
};

const TEXTURE_DEFAULTS = {
  potSize: 1024,
  placeholderPixel: [255, 255, 255, 255],
  whitePixel: [255, 255, 255, 255],
  defaultMeshPixel: [220, 220, 220, 255],
};

const UV_DEFAULTS = {
  offset: 1.0,
  scale: 0.5,
};

const FALLBACK_NORMAL = {
  x: 0,
  y: 1,
  z: 0,
};

function loadTexturePOT(gl, url, size = TEXTURE_DEFAULTS.potSize) {
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
    new Uint8Array(TEXTURE_DEFAULTS.placeholderPixel)
  );

  const image = new Image();
  image.src = url;

  image.onload = function () {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0, size, size);

    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);

    gl.generateMipmap(gl.TEXTURE_2D);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  };

  return tex;
}

async function loadSceneTextures(gl) {
  window.whiteTexture = createSolidTexture(gl, TEXTURE_DEFAULTS.whitePixel);

  window.floorTexture = loadTexturePOT(gl, TEXTURE_PATHS.floor, TEXTURE_DEFAULTS.potSize);
  window.floorTilesTexture = loadTexturePOT(gl, TEXTURE_PATHS.floorTiles, TEXTURE_DEFAULTS.potSize);
  window.wallTexture = loadTexturePOT(gl, TEXTURE_PATHS.wall, TEXTURE_DEFAULTS.potSize);
  window.woodTexture = loadTexturePOT(gl, TEXTURE_PATHS.wood, TEXTURE_DEFAULTS.potSize);
  window.columnTexture = loadTexturePOT(gl, TEXTURE_PATHS.column, TEXTURE_DEFAULTS.potSize);
  window.windowTexture = loadTexturePOT(gl, TEXTURE_PATHS.stainedGlass, TEXTURE_DEFAULTS.potSize);

  window.meshTexture = window.wallTexture;
}