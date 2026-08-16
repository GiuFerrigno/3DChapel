"use strict";

const TEXTURE_PATHS = {
  floor: "../textures/marble.jpg",
  floorTiles: "../textures/floorTiles.jpg",
  wall: "../textures/wall.jpg",
  wood: "../textures/wood.jpg",
  column: "../textures/column.jpg",
  stainedGlass: "../textures/stained-glass.png",
  circularStainedGlass: "../textures/circular-glass.png",
  simpleGlass: "../textures/stained-glass-simple.png", 
  door: "../textures/door.jpg",
  ceiling: "../textures/ceiling.jpg",
  plaque: "../textures/targa.png",
  photo: "../textures/foto_mia.jpg",
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
  window.circularWindowTexture = loadTexturePOT(gl, TEXTURE_PATHS.circularStainedGlass, TEXTURE_DEFAULTS.potSize);
  window.simpleWindowTexture = loadTexturePOT(gl, TEXTURE_PATHS.simpleGlass, TEXTURE_DEFAULTS.potSize);
  window.doorTexture = loadTexturePOT(gl, TEXTURE_PATHS.door, TEXTURE_DEFAULTS.potSize);
  window.ceilingTexture = loadTexturePOT(gl, TEXTURE_PATHS.ceiling, TEXTURE_DEFAULTS.potSize);
  window.plaqueTexture = loadTexturePOT(gl, TEXTURE_PATHS.plaque, TEXTURE_DEFAULTS.potSize);
  window.photoTexture = loadTexturePOT(gl, TEXTURE_PATHS.photo, TEXTURE_DEFAULTS.potSize);

  window.meshTexture = window.wallTexture;



  // Texture cappella
  chapelParts.roofCurved.texture      = window.ceilingTexture;         
  chapelParts.floor.texture           = window.floorTilesTexture;
  chapelParts.walls.texture           = window.wallTexture;         
  chapelParts.roof.texture            = window.wallTexture;         
  chapelParts.door.texture            = window.doorTexture;           
  chapelParts.window.texture          = window.windowTexture;
  chapelParts.windowLeft.texture      = window.simpleWindowTexture;
  chapelParts.windowRight.texture     = window.simpleWindowTexture;
  chapelParts.circWindow.texture      = window.circularWindowTexture;

  // Texture altre parti? 

}