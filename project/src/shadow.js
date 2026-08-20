"use strict";

function createShadowFramebuffer(gl) {
  const shadowTexture = gl.createTexture();

  gl.bindTexture(gl.TEXTURE_2D, shadowTexture);

  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.DEPTH_COMPONENT24,
    shadowMapSize,
    shadowMapSize,
    0,
    gl.DEPTH_COMPONENT,
    gl.UNSIGNED_INT,
    null
  );

  gl.texParameteri(
    gl.TEXTURE_2D,
    gl.TEXTURE_MIN_FILTER,
    gl.NEAREST
  );

  gl.texParameteri(
    gl.TEXTURE_2D,
    gl.TEXTURE_MAG_FILTER,
    gl.NEAREST
  );

  gl.texParameteri(
    gl.TEXTURE_2D,
    gl.TEXTURE_WRAP_S,
    gl.CLAMP_TO_EDGE
  );

  gl.texParameteri(
    gl.TEXTURE_2D,
    gl.TEXTURE_WRAP_T,
    gl.CLAMP_TO_EDGE
  );

  const shadowFramebuffer =
    gl.createFramebuffer();

  gl.bindFramebuffer(
    gl.FRAMEBUFFER,
    shadowFramebuffer
  );

  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.DEPTH_ATTACHMENT,
    gl.TEXTURE_2D,
    shadowTexture,
    0
  );

  gl.drawBuffers([gl.NONE]);
  gl.readBuffer(gl.NONE);

  const status =
    gl.checkFramebufferStatus(
      gl.FRAMEBUFFER
    );

  if (
    status !== gl.FRAMEBUFFER_COMPLETE
  ) {
    throw new Error(
      `Shadow framebuffer non completo: ${status}`
    );
  }

  gl.bindTexture(
    gl.TEXTURE_2D,
    null
  );

  gl.bindFramebuffer(
    gl.FRAMEBUFFER,
    null
  );

  return {
    framebuffer: shadowFramebuffer,
    texture: shadowTexture,
  };
}

function getLightMatrices() {
  const lightPosition =
    state.candles.light.position;

  const lightTarget = [
    0.0,
    1.5,
    0.0,
  ];

  const lightView = m4.inverse(
    m4.lookAt(
      lightPosition,
      lightTarget,
      [0, 1, 0]
    )
  );

  const lightProjection =
    m4.perspective(
      Math.PI / 3,
      1.0,
      0.1,
      30.0
    );

  return {
    lightView,
    lightProjection,
    lightPosition,
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


function renderShadowPass(lightView, lightProjection) {

  unbindShadowTextureEverywhere(gl);

  // Importante: la shadow texture non deve essere attiva mentre è attachment del framebuffer
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, null);

  gl.bindFramebuffer(gl.FRAMEBUFFER, shadowFramebuffer);
  gl.viewport(0, 0, shadowMapSize, shadowMapSize);

  gl.enable(gl.DEPTH_TEST);
  gl.disable(gl.BLEND);
  gl.depthMask(true);
  gl.enable(gl.CULL_FACE);

  gl.clearDepth(1.0);
  gl.clear(gl.DEPTH_BUFFER_BIT);

  gl.useProgram(shadowProgramInfo.program);

  drawShadowChapelParts(lightView, lightProjection);

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}


function drawShadowPart(part, world, lightView, lightProjection) {
  if (!part || !part.bufferInfo) return;

  webglUtils.setBuffersAndAttributes(gl, shadowProgramInfo, part.bufferInfo);

  webglUtils.setUniforms(
    shadowProgramInfo,
    {
      u_world: world,
      u_lightView: lightView,
      u_lightProjection: lightProjection,
    }
  );

  webglUtils.drawBufferInfo(gl, part.bufferInfo);
}

function drawShadowChapelParts(lightView, lightProjection) {
  if (!chapelPartsList || !boxBufferInfo) return;

  gl.useProgram(shadowProgramInfo.program);

  for (const part of chapelPartsList) {
    if (part.material !== "wood") continue;

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

    webglUtils.setBuffersAndAttributes(gl, shadowProgramInfo, boxBufferInfo);

    webglUtils.setUniforms(
      shadowProgramInfo,
      {
        u_world: world,
        u_lightView: lightView,
        u_lightProjection:
          lightProjection,
      }
    );

    webglUtils.drawBufferInfo(gl, boxBufferInfo);
  }

}
