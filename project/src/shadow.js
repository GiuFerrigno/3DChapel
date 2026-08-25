"use strict";

const CUBE_FACE_COUNT = 6;
const SHADOW_CUBE_FACE_SIZE = Math.PI / 2;

/**
 * Crea una depth cubemap e il framebuffer usato per le ombre
 * omnidirezionali della luce puntiforme
 */
function createShadowFramebuffer(gl) {
  const shadowCube = gl.createTexture();

  gl.bindTexture(gl.TEXTURE_CUBE_MAP, shadowCube);

  // Ogni faccia conserva la profondità vista dalla luce in una direzione
  for (let face = 0; face < CUBE_FACE_COUNT; ++face) {
    gl.texImage2D(
      gl.TEXTURE_CUBE_MAP_POSITIVE_X + face,
      0,
      gl.DEPTH_COMPONENT24,
      shadowMapSize,
      shadowMapSize,
      0,
      gl.DEPTH_COMPONENT,
      gl.UNSIGNED_INT,
      null
    );
  }

  gl.texParameteri(
    gl.TEXTURE_CUBE_MAP,
    gl.TEXTURE_MIN_FILTER,
    gl.NEAREST
  );

  gl.texParameteri(
    gl.TEXTURE_CUBE_MAP,
    gl.TEXTURE_MAG_FILTER,
    gl.NEAREST
  );

  gl.texParameteri(
    gl.TEXTURE_CUBE_MAP,
    gl.TEXTURE_WRAP_S,
    gl.CLAMP_TO_EDGE
  );

  gl.texParameteri(
    gl.TEXTURE_CUBE_MAP,
    gl.TEXTURE_WRAP_T,
    gl.CLAMP_TO_EDGE
  );

  gl.texParameteri(
    gl.TEXTURE_CUBE_MAP,
    gl.TEXTURE_WRAP_R,
    gl.CLAMP_TO_EDGE
  );

  // La cubemap viene letta manualmente come profondità nello shader
  gl.texParameteri(
    gl.TEXTURE_CUBE_MAP,
    gl.TEXTURE_COMPARE_MODE,
    gl.NONE
  );

  const framebuffer = gl.createFramebuffer();

  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

  // Un attachment temporaneo serve per verificare che il framebuffer sia valido
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.DEPTH_ATTACHMENT,
    gl.TEXTURE_CUBE_MAP_POSITIVE_X,
    shadowCube,
    0
  );

  gl.drawBuffers([gl.NONE]);
  gl.readBuffer(gl.NONE);

  const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);

  if (status !== gl.FRAMEBUFFER_COMPLETE) {
    throw new Error(`Depth cubemap framebuffer non completo: ${status}`);
  }

  gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  return {
    framebuffer,
    texture: shadowCube,
  };
}

/**
 * Calcola le sei viste per la shadow cubemap di una point light
 * Ogni faccia ha FOV di 90°
 */
function getPointLightShadowMatrices() {
  const lightPosition = state.candles.light.position;

  const projection = m4.perspective(
    SHADOW_CUBE_FACE_SIZE,
    1.0,
    SHADOW_NEAR,
    SHADOW_FAR
  );

  const faceDirections = [
    { direction: [1, 0, 0], up: [0, -1, 0] },
    { direction: [-1, 0, 0], up: [0, -1, 0] },
    { direction: [0, 1, 0], up: [0, 0, 1] },
    { direction: [0, -1, 0], up: [0, 0, -1] },
    { direction: [0, 0, 1], up: [0, -1, 0] },
    { direction: [0, 0, -1], up: [0, -1, 0] },
  ];

  const lightViews = faceDirections.map(({ direction, up }) => {
    const target = [
      lightPosition[0] + direction[0],
      lightPosition[1] + direction[1],
      lightPosition[2] + direction[2],
    ];

    const lightCamera = m4.lookAt(
      lightPosition,
      target,
      up
    );

    return m4.inverse(lightCamera);
  });

  return {
    lightPosition,
    lightProjection: projection,
    lightViews,
  };
}

/**
 * Aggiorna le sei facce della depth cubemap
 * Polygon offset limita l'auto-ombreggiamento causato dalla precisione depth
 */
function renderShadowPass(shadowData) {
  gl.bindFramebuffer(gl.FRAMEBUFFER, shadowFramebuffer);

  gl.viewport(
    0,
    0,
    shadowMapSize,
    shadowMapSize
  );

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.disable(gl.BLEND);
  gl.depthMask(true);

  gl.enable(gl.POLYGON_OFFSET_FILL);
  gl.polygonOffset(1.0, 1.0);

  gl.useProgram(shadowProgramInfo.program);

  for (let face = 0; face < CUBE_FACE_COUNT; ++face) {
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.DEPTH_ATTACHMENT,
      gl.TEXTURE_CUBE_MAP_POSITIVE_X + face,
      shadowTexture,
      0
    );

    gl.clearDepth(1.0);
    gl.clear(gl.DEPTH_BUFFER_BIT);

    drawShadowChapelParts(
      shadowData.lightViews[face],
      shadowData.lightProjection,
      shadowData.lightPosition
    );
  }

  gl.disable(gl.POLYGON_OFFSET_FILL);

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

/**
 * Renderizza gli elementi cuboidali della cappella nel pass di profondità
 */
function drawShadowChapelParts(lightView, lightProjection, lightPosition) {
  if (!chapelPartsList || !boxBufferInfo) return;

  gl.useProgram(shadowProgramInfo.program);

  for (const part of chapelPartsList) {
    let world = m4.identity();

    world = m4.translate(
      world,
      part.position[0],
      part.position[1],
      part.position[2]
    );

    world = m4.scale(
      world,
      part.scale[0],
      part.scale[1],
      part.scale[2]
    );

    webglUtils.setBuffersAndAttributes(gl, shadowProgramInfo, boxBufferInfo);

    webglUtils.setUniforms(
      shadowProgramInfo,
      {
        u_world: world,
        u_lightView: lightView,
        u_lightProjection: lightProjection,
        u_lightPosition: lightPosition,
        u_shadowFarPlane: SHADOW_FAR,
      }
    );

    webglUtils.drawBufferInfo(gl, boxBufferInfo);
  }
}