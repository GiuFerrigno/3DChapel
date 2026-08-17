"use strict";

const chapel = {
  objPath: '../models/chapel.obj',
  position: [0, 0, 0],
  scale:    [10, 10, 10],
};

const chapelParts = {
  walls: {
    objName: 'Walls',
    bufferInfo: null,
    texture: null,
    color: [1, 1, 1, 1],    // muro
  },
  roof: {
    objName: 'Roof',
    bufferInfo: null,
    texture: null,
    color: [1, 1, 1, 1],    // tetto
  },
  floor: {
    objName: 'Floor',
    bufferInfo: null,
    texture: null,
    color: [1, 1, 1, 1],    // pavimento
  },
  door: {
    objName: 'Door',
    bufferInfo: null,
    texture: null,
    color: [1, 1, 1, 1],    // legno porta
  },
  window: {
    objName: 'Window',
    bufferInfo: null,
    texture: null,
    color: [1, 1, 1, 1],    // vetro finestra centrale
  },
  windowLeft: {
    objName: 'WindowLeft',
    bufferInfo: null,
    texture: null,
    color: [1, 1, 1, 1],    // vetro finestra sinistra
  },
  windowRight: {
    objName: 'WindowRight',
    bufferInfo: null,
    texture: null,
    color: [1, 1, 1, 1],    // vetro finestra destra
  },
  circWindow: {
    objName: 'CircWindow',
    bufferInfo: null,
    texture: null,
    color: [1, 1, 1, 1],    // vetro finestra circolare
  },
  roofCurved: {
    objName: 'Cupola',
    bufferInfo: null,
    texture: null,
    color: [1, 1, 1, 1],    // materiale tetto/cupola
  },
};

async function loadChapelMeshes(gl) {
  const response = await fetch(chapel.objPath);
  if (!response.ok) {
    throw new Error(`Impossibile caricare OBJ: chapel.obj`);
  }

  const text = await response.text();

  const mesh = new subd_mesh();
  glmReadOBJ(text, mesh);
  Unitize(mesh);

  // Mappa dei group (in base alle righe g ... ):
  // 1: RoofCurved_Mesh
  // 2: Floor_Mesh
  // 3: Roof_Mesh
  // 4: Walls_Mesh
  // 5: Door_Mesh
  // 6: CircWindow_Mesh
  // 7: Window_Mesh
  // 8: WindowLeft_Mesh
  // 9: WindowRIght_Mesh

  chapelParts.roofCurved.bufferInfo  = createBufferForGroup(gl, mesh, 1);
  chapelParts.floor.bufferInfo       = createBufferForGroup(gl, mesh, 2);
  chapelParts.roof.bufferInfo        = createBufferForGroup(gl, mesh, 3);
  chapelParts.walls.bufferInfo       = createBufferForGroup(gl, mesh, 4);
  chapelParts.door.bufferInfo        = createBufferForGroup(gl, mesh, 5);
  chapelParts.circWindow.bufferInfo  = createBufferForGroup(gl, mesh, 6);
  chapelParts.window.bufferInfo      = createBufferForGroup(gl, mesh, 7);
  chapelParts.windowLeft.bufferInfo  = createBufferForGroup(gl, mesh, 8);
  chapelParts.windowRight.bufferInfo = createBufferForGroup(gl, mesh, 9);
}

function getChapelWorld() {
  const offsetY = 5.1;
  let world = m4.identity();

  world = m4.translate(
    world,
    chapel.position[0],
    chapel.position[1] + offsetY,
    chapel.position[2]
  );

  const rotationY = Math.PI;   
  world = m4.yRotate(world, rotationY);

  world = m4.scale(
    world,
    chapel.scale[0],
    chapel.scale[1],
    chapel.scale[2]
  );

  return world;
}

function drawChapel(view, projection, cameraPosition) {
  const world = getChapelWorld();
  const worldInverseTranspose = m4.transpose(m4.inverse(world));
  const candleLight = state.candles.light;

  gl.useProgram(programInfo.program);

  const commonUniforms = {
    u_world: world,
    u_view: view,
    u_projection: projection,
    u_worldInverseTranspose: worldInverseTranspose,
    u_viewWorldPosition: cameraPosition,
    u_pointLightPosition: candleLight.position,
    u_pointLightColor: candleLight.color,
    u_pointLightIntensity: candleLight.intensity,
    u_pointLightRadius: candleLight.radius,
    u_ambient: 0.03,
    u_lightIntensity: 0.0,
  };

  function drawPart(part) {
    if (!part.bufferInfo || !part.texture) {
      return;
    }

    webglUtils.setBuffersAndAttributes(
      gl,
      programInfo,
      part.bufferInfo
    );

    webglUtils.setUniforms(
      programInfo,
      {
        ...commonUniforms,
        u_colorMult: part.color,
        u_texture: part.texture,
      }
    );

    webglUtils.drawBufferInfo(
      gl,
      part.bufferInfo
    );
  }

  drawPart(chapelParts.floor);
  drawPart(chapelParts.walls);
  drawPart(chapelParts.roof);
  drawPart(chapelParts.roofCurved);
  drawPart(chapelParts.door);

// TODO: Capire questa cosa della trasparenza
  /*
  gl.enable(gl.BLEND);
  gl.blendFunc(
    gl.SRC_ALPHA,
    gl.ONE_MINUS_SRC_ALPHA
  );
  gl.depthMask(false);
  gl.disable(gl.CULL_FACE);
  */

  drawPart(chapelParts.window);
  drawPart(chapelParts.windowLeft);
  drawPart(chapelParts.windowRight);
  drawPart(chapelParts.circWindow);

  /*
  gl.enable(gl.CULL_FACE);
  gl.depthMask(true);
  gl.disable(gl.BLEND);
  */
}