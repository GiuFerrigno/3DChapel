"use strict";

let chapelPartsList = null;
let boxBufferInfo = null;

function initProceduralChapelParts(gl) {
  // 1. costruisci la lista di parti (panche, colonne, altare)
  chapelPartsList = buildChapelParts();

  // 2. crea un box unitario (centarto) una volta sola
  if (!boxBufferInfo) {
    const cubeArrays = createUnitCubeArrays();   // oppure tuo createBox
    boxBufferInfo = webglUtils.createBufferInfoFromArrays(gl, cubeArrays);
  }
}

async function initSceneGeometry(gl) {
  await loadChapelMeshes(gl);   // cappella da OBJ
  initProceduralChapelParts(gl); // panche + colonne procedurali
}

