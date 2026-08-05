"use strict";

let chapelBoxBufferInfo = null;
//let chapelParts = [];

/*
function getPartWorld(part) {
  let world = m4.identity();
  world = m4.translate(world, part.t[0], part.t[1], part.t[2]);
  world = m4.scale(world, part.s[0], part.s[1], part.s[2]);
  return world;
}

function drawPart(part, view, projection, cameraPosition, lightDirection) {
  const world = getPartWorld(part);
  const worldInverseTranspose = m4.transpose(m4.inverse(world));

  const effectiveAmbient = state.lightEnabled ? state.ambient : 0.15;
  const effectiveLightIntensity = state.lightEnabled ? state.lightIntensity : 0.0;

  let tex = window.wallTexture;
  if (part.material === "floor") tex = window.floorTilesTexture;
  if (part.material === "wood") tex = window.woodTexture;
  if (part.material === "col") tex = window.columnTexture;
  if (part.material === "white") tex = window.whiteTexture;

  gl.useProgram(programInfo.program);
  webglUtils.setBuffersAndAttributes(gl, programInfo, chapelBoxBufferInfo);

  webglUtils.setUniforms(programInfo, {
    u_world: world,
    u_view: view,
    u_projection: projection,
    u_worldInverseTranspose: worldInverseTranspose,
    u_lightDirection: lightDirection,
    u_viewWorldPosition: cameraPosition,
    u_colorMult: part.color,
    u_texture: tex,
    u_useTexture: true,
    u_ambient: effectiveAmbient,
    u_lightIntensity: effectiveLightIntensity,
  });

  webglUtils.drawBufferInfo(gl, chapelBoxBufferInfo);
}
*/ 

/*
async function initSceneGeometry(gl) {
  chapelBoxBufferInfo = createBoxBufferInfo(gl);
  chapelParts = buildChapelParts();
  initRoof(gl);
  initCircularWall(gl);

  // Assegnamento dei parametri iniziali delle finestre
  state.windows = [
    {
      objPath: "../models/flatWindow.obj",
      texture: window.windowTexture,
      position: [0, 3.1, -6.98],
      scale: [1.8, 1.8, 1.5],
      color: [1.0, 1.0, 1.0, 1.0],
      ready: false,
      loading: false,
      bufferInfo: null,
    },
    // LEFT
    {
      objPath: "../models/flatWindow.obj",
      texture: window.simpleWindowTexture,
      position: [-1.96, 3.1, -6.98],
      scale: [1.8, 1.8, 1.5],
      color: [1.0, 1.0, 1.0, 1.0],
      ready: false,
      loading: false,
      bufferInfo: null,
    },
    // RIGHT
    {
      objPath: "../models/flatWindow.obj",
      texture: window.simpleWindowTexture,
      position: [1.96, 3.1, -6.98],
      scale: [1.8, 1.8, 1.5],
      color: [1.0, 1.0, 1.0, 1.0],
      ready: false,
      loading: false,
      bufferInfo: null,
    },
    // BACK
    {
      objPath: "../models/circularWindow.obj",
      texture: window.circularWindowTexture,
      position: [0, 6.6, -6.98],
      scale: [1, 1, 1],
      color: [0.9, 0.9, 1.0, 1.0],
      ready: false,
      loading: false,
      bufferInfo: null,
    },

  ];

  // 3. Carica le mesh delle finestre
  for (const w of state.windows) {
    await loadWindowMesh(gl, w);
  }
}
*/


/*
function drawChapel(view, projection, cameraPosition, lightDirection) {
  
  for (const part of chapelParts) {
    drawPart(part, view, projection, cameraPosition, lightDirection);
  }
    

  drawChapelObj(view, projection, cameraPosition, lightDirection);

 
  for (const w of state.windows) {
    drawWindow(view, projection, cameraPosition, lightDirection, w);
  }

  drawRoof(view, projection, cameraPosition, lightDirection);
  drawCircularWall(view, projection, cameraPosition, lightDirection, circularWallFrontBufferInfo);
  

}
*/ 

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