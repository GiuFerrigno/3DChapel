"use strict";

// DA ELIMINARE

// Crea il buffer del pavimento come piano orizzontale con UV base 0..1
/*
function createFloorBufferInfo(gl) {
  const halfSize = 12;

  const arrays = {
    position: {
      numComponents: 3,
      data: [
        -halfSize, 0, -halfSize,
        -halfSize, 0,  halfSize,
         halfSize, 0, -halfSize,

         halfSize, 0, -halfSize,
        -halfSize, 0,  halfSize,
         halfSize, 0,  halfSize,
      ],
    },
    normal: {
      numComponents: 3,
      data: [
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,

        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
      ],
    },
    texcoord: {
      numComponents: 2,
      data: [
        0, 0,
        0, 1,
        1, 0,

        1, 0,
        0, 1,
        1, 1,
      ],
    },
  };

  return webglUtils.createBufferInfoFromArrays(gl, arrays);
}

*/