"use strict";

function createShadowFramebuffer(gl) {
  const shadowCube = gl.createTexture();

  gl.bindTexture(gl.TEXTURE_CUBE_MAP, shadowCube);

  for (let face = 0; face < 6; ++face) {
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

  gl.texParameteri(
    gl.TEXTURE_CUBE_MAP,
    gl.TEXTURE_COMPARE_MODE,
    gl.NONE
  );

  const framebuffer =
    gl.createFramebuffer();

  gl.bindFramebuffer(
    gl.FRAMEBUFFER,
    framebuffer
  );

  // Attacchiamo provvisoriamente una faccia per verificare l'FBO.
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.DEPTH_ATTACHMENT,
    gl.TEXTURE_CUBE_MAP_POSITIVE_X,
    shadowCube,
    0
  );

  gl.drawBuffers([gl.NONE]);
  gl.readBuffer(gl.NONE);

  const status =
    gl.checkFramebufferStatus(
      gl.FRAMEBUFFER
    );

  if (status !== gl.FRAMEBUFFER_COMPLETE) {
    throw new Error(
      `Depth cubemap framebuffer non completo: ${status}`
    );
  }

  gl.bindTexture(
    gl.TEXTURE_CUBE_MAP,
    null
  );

  gl.bindFramebuffer(
    gl.FRAMEBUFFER,
    null
  );

  return {
    framebuffer,
    texture: shadowCube,
  };
}

function getPointLightShadowMatrices() {
  const position =
    state.candles.light.position;

  const projection = m4.perspective(
    Math.PI / 2.0,
    1.0,
    SHADOW_NEAR,
    SHADOW_FAR
  );

  const faces = [
    {
      target: [position[0] + 1, position[1], position[2]],
      up: [0, -1, 0],
    },
    {
      target: [position[0] - 1, position[1], position[2]],
      up: [0, -1, 0],
    },
    {
      target: [position[0], position[1] + 1, position[2]],
      up: [0, 0, 1],
    },
    {
      target: [position[0], position[1] - 1, position[2]],
      up: [0, 0, -1],
    },
    {
      target: [position[0], position[1], position[2] + 1],
      up: [0, -1, 0],
    },
    {
      target: [position[0], position[1], position[2] - 1],
      up: [0, -1, 0],
    },
  ];

  const lightViews = faces.map((face) => {
    const lightCamera = m4.lookAt(
      position,
      face.target,
      face.up
    );

    return m4.inverse(lightCamera);
  });

  return {
    lightPosition: position,
    lightProjection: projection,
    lightViews,
  };
}

function unbindShadowTextureEverywhere(gl) {
  const maxUnits =
    gl.getParameter(
      gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS
    );

  for (
    let i = 0;
    i < maxUnits;
    ++i
  ) {
    gl.activeTexture(
      gl.TEXTURE0 + i
    );

    gl.bindTexture(
      gl.TEXTURE_2D,
      null
    );
  }

  gl.activeTexture(gl.TEXTURE0);
}


function renderShadowPass(shadowData) {
  unbindShadowTextureEverywhere(gl);

  gl.bindFramebuffer(
    gl.FRAMEBUFFER,
    shadowFramebuffer
  );

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

  gl.useProgram(
    shadowProgramInfo.program
  );

  // Renderizza una faccia alla volta.
  for (let face = 0; face < 6; ++face) {
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

  gl.bindFramebuffer(
    gl.FRAMEBUFFER,
    null
  );
}

function drawShadowChapelParts(
  lightView,
  lightProjection,
  lightPosition
) {
  if (!chapelPartsList || !boxBufferInfo) {
    return;
  }

  gl.useProgram(
    shadowProgramInfo.program
  );

  for (const part of chapelPartsList) {
    let world = m4.identity();

    world = m4.translate(
      world,
      part.t[0],
      part.t[1],
      part.t[2]
    );

    world = m4.scale(
      world,
      part.s[0],
      part.s[1],
      part.s[2]
    );

    webglUtils.setBuffersAndAttributes(
      gl,
      shadowProgramInfo,
      boxBufferInfo
    );

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

    webglUtils.drawBufferInfo(
      gl,
      boxBufferInfo
    );
  }
}
