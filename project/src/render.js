"use strict";

async function initSceneGeometry(gl) {
  // 1. carica la cappella da OBJ
  await loadChapelMeshes(gl);   // la funzione che abbiamo definito prima

  //chapelParts = buildChapelParts();

  // 2. carica le finestre, se le usi ancora come OBJ separati
  //await loadWindowMesh(gl, leftWindow);
  //await loadWindowMesh(gl, rightWindow);
  // ... altri oggetti della scena ...

  // 3. se avevi geometrie “procedurali” (panche, colonne), decidi se tenerle
  //    oppure rimuoverle se le hai già nel modello Blender.
}