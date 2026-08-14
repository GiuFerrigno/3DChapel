"use strict";

let chapelPartsList = null;
let boxBufferInfo = null;

function initProceduralChapelParts(gl) {
  // 1. Costruisce la lista delle parti:
  // panche, colonne, altare, ecc.
  chapelPartsList = buildChapelParts();

  // 2. Crea il cubo unitario una sola volta
  if (!boxBufferInfo) {
    const cubeArrays = createUnitCubeArrays();

    boxBufferInfo = webglUtils.createBufferInfoFromArrays(gl, cubeArrays);
  }

}

async function initSceneGeometry(gl) {
  await loadChapelMeshes(gl);    // cappella da OBJ
  initProceduralChapelParts(gl); // parti procedurali
  await initColumnOBJ(gl);       // colonne da OBJ
  await loadPlaqueMeshes(gl);    // targa da OBJ
}
