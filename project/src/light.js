"use strict";

let candleBufferInfo = null;
let flameBufferInfo = null;


function initCandles(gl){
    const cubeArrays = createUnitCubeArrays();
    candleBufferInfo = webglUtils.createBufferInfoFromArrays(gl, cubeArrays);
    flameBufferInfo = candleBufferInfo;
}

function updateCandles(time) {
  if (!state.candles.animate) return;

  const speed = state.candles.speed || 1.0;

  const flameMotion = Math.sin(time * 3.0 * speed);

  const smallVariation = Math.sin(time * 5.0 * speed);

  const flicker = 1.0 + 0.08 * flameMotion + 0.03 * smallVariation;

  state.candles.time = time;

  state.candles.flicker = flicker;

  state.candles.light.intensity = 3.0 * flicker;
}

function getCandleLightUniforms() {
  const light = state.candles.light;
  const position = getCandleWorldPosition(light.localPosition);

  return {
    u_pointLightPosition: position,
    u_pointLightColor: light.color,
    u_pointLightIntensity: light.intensity,
    u_pointLightRadius: light.radius,
    u_ambient: 0.03,
    u_lightIntensity: 0.0,
  };
}


function drawCandles(view, projection, cameraPosition, lightDirection) {
  if (!state.candles.enabled) return;

  for (let i = 0; i < state.candles.positions.length; i++) {
    const p = state.candles.positions[i];

    const isCenter = i === 1;

    const candleScale = isCenter ? [0.12, 0.70, 0.12] : state.candles.candleScale;

    let candleWorld = m4.identity();

    candleWorld = m4.translate(
      candleWorld,
      p[0],
      p[1],
      p[2]
    );

    candleWorld = m4.scale(
      candleWorld,
      candleScale[0],
      candleScale[1],
      candleScale[2]
    );

    const candleInverseTranspose = m4.transpose(
      m4.inverse(candleWorld)
    );

    gl.useProgram(programInfo.program);

    webglUtils.setBuffersAndAttributes(
      gl,
      programInfo,
      candleBufferInfo
    );

    webglUtils.setUniforms(
      programInfo,
      {
        u_world: candleWorld,
        u_view: view,
        u_projection: projection,
        u_worldInverseTranspose: candleInverseTranspose,
        u_viewWorldPosition: cameraPosition,

        u_colorMult: [
          0.95,
          0.85,
          0.65,
          1.0,
        ],

        u_texture: window.whiteTexture,

        u_ambient: 1.0,
        u_lightIntensity: 0.0,
      }
    );

    webglUtils.drawBufferInfo(
      gl,
      candleBufferInfo
    );

    drawFlame(
      i,
      p,
      candleScale,
      view,
      projection,
      cameraPosition,
      lightDirection
    );
  }
}

function drawFlame(index, candlePosition, candleScale, view, projection, cameraPosition, lightDirection) {
  const time = state.candles.time;
  const phase = index * 1.7;

  const flicker = state.candles.flicker || 1.0;

  const pulse = flicker + 0.02 * Math.sin(time * 5.0 * state.candles.speed + phase);

  const sway = 0.035 * Math.sin(time * 3.0 * state.candles.speed + phase);

  let flameWorld = m4.identity();

  flameWorld = m4.translate(
    flameWorld,
    candlePosition[0],
    candlePosition[1] +
      candleScale[1] +
      state.candles.flameScale[1] * 0.5,
    candlePosition[2]
  );

  flameWorld = m4.zRotate(
    flameWorld,
    sway
  );

  flameWorld = m4.scale(
    flameWorld,
    state.candles.flameScale[0] * (2.0 - pulse),
    state.candles.flameScale[1] * pulse,
    state.candles.flameScale[2]
  );

  const flameInverseTranspose = m4.transpose(
    m4.inverse(flameWorld)
  );

  gl.useProgram(programInfo.program);

  webglUtils.setBuffersAndAttributes(
    gl,
    programInfo,
    flameBufferInfo
  );

  webglUtils.setUniforms(
    programInfo,
    {
      u_world: flameWorld,
      u_view: view,
      u_projection: projection,
      u_worldInverseTranspose: flameInverseTranspose,
      u_viewWorldPosition: cameraPosition,

      u_colorMult: [
        1.0,
        0.35,
        0.03,
        1.0,
      ],

      u_texture: window.whiteTexture,

      u_ambient: 1.0,
      u_lightIntensity: 0.0,
    }
  );

  webglUtils.drawBufferInfo(
    gl,
    flameBufferInfo
  );
}