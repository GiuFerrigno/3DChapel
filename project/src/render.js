"use strict";

let chapelPartsList = null;
let boxBufferInfo = null;

/**
 * Inizializza le parti procedurali della cappella:
 * - panche
 * - colonne
 * - altare
 * - altri elementi generati via codice
 *
 * Crea inoltre il cubo unitario usato come geometria di base
 */
function initProceduralChapelParts(gl) {
  chapelPartsList = buildChapelParts();

  if (!boxBufferInfo) {
    const cubeArrays = createUnitCubeArrays();
    boxBufferInfo = webglUtils.createBufferInfoFromArrays(gl, cubeArrays);
  }
}

/**
 * Inizializza tutta la geometria della scena:
 * - cappella principale (OBJ)
 * - parti procedurali (panche, altare)
 * - colonne (OBJ)
 * - targa con foto (OBJ)
 * - candele (fiamme, stoppini, fumo)
 * - particelle di polvere atmosferica
 */
async function initSceneGeometry(gl) {
  await loadChapelMeshes(gl);        
  initProceduralChapelParts(gl);     
  await initColumnOBJ(gl);           
  await loadPlaqueMeshes(gl);        
  initCandles(gl);                   
  initDust(gl, state.dust.count);    
}
