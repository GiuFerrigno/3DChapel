"use strict";

let candleBufferInfo = null;
let flameBufferInfo = null;
let wickBufferInfo = null;


function initCandles(gl){

  candleBufferInfo = createCylinderBufferInfo(gl, 0.5, 1.0, 20);
  flameBufferInfo = createFlameBufferInfo(gl, 16);
  wickBufferInfo = createCylinderBufferInfo(gl, 0.5, 1.0, 8);
}

function updateCandles(time) {
  const speed = state.candles.speed || 1.0;
  state.candles.time = time;

  if (!state.candles.animate) {
    state.candles.flicker = 1.0;
    state.candles.light.intensity = state.candles.light.baseIntensity;
    return;
  }

  const flameMotion = Math.sin(time * 3.0 * speed);
  const smallVariation = Math.sin(time * 5.0 * speed);
  const flicker = 1.0 + 0.08 * flameMotion + 0.03 * smallVariation;

  state.candles.flicker = flicker;
  state.candles.light.intensity = state.candles.light.baseIntensity * flicker;
}

function getCandleLightUniforms() {
  const light = state.candles.light;

  return {
    u_pointLightPosition: light.position,
    u_pointLightColor: light.color,
    u_pointLightIntensity: light.intensity,
    u_pointLightRadius: light.radius,
    u_ambient: state.ambient,
  };
}

function createFlameBufferInfo(gl, segments = 16) {
  const positions = [];
  const normals = [];
  const texcoords = [];
  const indices = [];

  const rings = [
    {
      y: 0.025,
      radiusX: 0.28,
      radiusZ: 0.22,
      offsetX: 0.00,
    },

    {
      y: 0.09,
      radiusX: 0.46,
      radiusZ: 0.35,
      offsetX: 0.00,
    },

    {
      y: 0.22,
      radiusX: 0.50,
      radiusZ: 0.38,
      offsetX: 0.01,
    },

    {
      y: 0.45,
      radiusX: 0.34,
      radiusZ: 0.25,
      offsetX: 0.035,
    },

    {
      y: 0.67,
      radiusX: 0.20,
      radiusZ: 0.14,
      offsetX: 0.07,
    },

    {
      y: 0.84,
      radiusX: 0.08,
      radiusZ: 0.05,
      offsetX: 0.10,
    },
  ];

  for (
    let r = 0;
    r < rings.length;
    ++r
  ) {
    const ring =
      rings[r];

    for (
      let i = 0;
      i < segments;
      ++i
    ) {
      const angle =
        i / segments *
        Math.PI * 2;

      const cosAngle =
        Math.cos(angle);

      const sinAngle =
        Math.sin(angle);

      positions.push(
        ring.offsetX +
          cosAngle *
          ring.radiusX,

        ring.y,

        sinAngle *
          ring.radiusZ
      );

      normals.push(
        cosAngle,
        0.5,
        sinAngle
      );

      texcoords.push(
        i / segments,
        ring.y
      );
    }
  }

  for (
    let r = 0;
    r < rings.length - 1;
    ++r
  ) {
    for (
      let i = 0;
      i < segments;
      ++i
    ) {
      const next =
        (i + 1) % segments;

      const a =
        r * segments + i;

      const b =
        r * segments + next;

      const c =
        (r + 1) * segments + i;

      const d =
        (r + 1) * segments + next;

      indices.push(
        a,
        b,
        c
      );

      indices.push(
        b,
        d,
        c
      );
    }
  }

  // Centro della base arrotondata.
  // È leggermente sopra y = 0.
  const bottomCenter =
    positions.length / 3;

  positions.push(
    0.0,
    0.0,
    0.0
  );

  normals.push(
    0.0,
    -1.0,
    0.0
  );

  texcoords.push(
    0.5,
    0.0
  );

  const firstRing =
    0;

  for (
    let i = 0;
    i < segments;
    ++i
  ) {
    const next =
      (i + 1) % segments;

    indices.push(
      bottomCenter,
      firstRing + next,
      firstRing + i
    );
  }

  // Punta della fiamma.
  const tip =
    positions.length / 3;

  positions.push(
    0.12,
    0.95,
    0.0
  );

  normals.push(
    0.0,
    1.0,
    0.0
  );

  texcoords.push(
    0.5,
    1.0
  );

  const lastRing =
    (rings.length - 1) *
    segments;

  for (
    let i = 0;
    i < segments;
    ++i
  ) {
    const next =
      (i + 1) % segments;

    indices.push(
      lastRing + i,
      lastRing + next,
      tip
    );
  }

  return webglUtils.createBufferInfoFromArrays(
    gl,
    {
      position: {
        numComponents: 3,
        data: new Float32Array(
          positions
        ),
      },

      normal: {
        numComponents: 3,
        data: new Float32Array(
          normals
        ),
      },

      texcoord: {
        numComponents: 2,
        data: new Float32Array(
          texcoords
        ),
      },

      indices: new Uint16Array(
        indices
      ),
    }
  );
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

    webglUtils.setUniforms(programInfo, {
      u_world: candleWorld,
      u_view: view,
      u_projection: projection,
      u_worldInverseTranspose: candleInverseTranspose,
      u_viewWorldPosition: cameraPosition,
      u_colorMult: [1.0, 0.78, 0.42, 1.0],
      u_texture: window.whiteTexture,
      u_emissionStrength: 0.12,
      ...getCandleLightUniforms(),
    });

    webglUtils.drawBufferInfo(gl, candleBufferInfo);

    drawWick(i, p, candleScale, view, projection, cameraPosition, lightDirection);
    drawFlame(i, p, candleScale, view, projection, cameraPosition, lightDirection);
  }
}



function drawFlame(index, candlePosition, candleScale, view, projection, cameraPosition, lightDirection) {
  const time = state.candles.time;

  const phase = index * 1.7;

  const flicker = state.candles.flicker || 1.0;

  const pulse = flicker + 0.02 * Math.sin(time * 5.0 * state.candles.speed + phase);

  const sway = 0.035 * Math.sin(time * 3.0 * state.candles.speed + phase);

  const candleTopY = candlePosition[1] + candleScale[1] * 0.5;

  const flameOffsetY = 0.04;

  let flameWorld = m4.identity();

  flameWorld =
    m4.translate(
      flameWorld,
      candlePosition[0],
      candleTopY +
        flameOffsetY,
      candlePosition[2]
    );

  flameWorld =
    m4.zRotate(
      flameWorld,
      sway
    );

  const flameSizeFactor = 0.95;

  flameWorld =
    m4.scale(
      flameWorld,
      state.candles.flameScale[0] *
        flameSizeFactor *
        (2.0 - pulse),

      state.candles.flameScale[1] *
        flameSizeFactor *
        pulse,

      state.candles.flameScale[2] *
        flameSizeFactor
    );

  const flameInverseTranspose =
    m4.transpose(
      m4.inverse(flameWorld)
    );

  gl.useProgram(programInfo.program);

  webglUtils.setBuffersAndAttributes(gl, programInfo, flameBufferInfo);

  webglUtils.setUniforms(programInfo, {
    u_world: flameWorld,
    u_view: view,
    u_projection: projection,
    u_worldInverseTranspose: flameInverseTranspose,
    u_viewWorldPosition: cameraPosition,
    u_colorMult: [1.0, 0.55, 0.08, 1.0],
    u_texture: window.whiteTexture,
    u_emissionStrength: 1.2,
    ...getCandleLightUniforms(),
  });

  webglUtils.drawBufferInfo(gl, flameBufferInfo);
}

function drawWick(index, candlePosition, candleScale, view, projection, cameraPosition, lightDirection) {
  const wickHeight = state.candles.wickHeight ?? 0.075;

  const wickRadius = state.candles.wickRadius ?? 0.018;

  // Il cilindro della candela è centrato
  // su candlePosition[1].
  const candleTopY =
    candlePosition[1] +
    candleScale[1] * 0.5;

  // La mesh della miccia è anch'essa centrata
  // sulla propria origine.
  const wickCenterY =
  candleTopY +
  wickHeight * 0.5 -
  0.005;

  let wickWorld =
    m4.identity();

  wickWorld =
    m4.translate(
      wickWorld,
      candlePosition[0],
      wickCenterY,
      candlePosition[2]
    );

  wickWorld =
    m4.scale(
      wickWorld,
      wickRadius,
      wickHeight,
      wickRadius
    );

  const wickInverseTranspose =
    m4.transpose(
      m4.inverse(wickWorld)
    );

  gl.useProgram(
    programInfo.program
  );

  webglUtils.setBuffersAndAttributes(
    gl,
    programInfo,
    wickBufferInfo
  );

  webglUtils.setUniforms(programInfo, {
    u_world: wickWorld,
    u_view: view,
    u_projection: projection,
    u_worldInverseTranspose: wickInverseTranspose,
    u_colorMult: [0.025, 0.012, 0.006, 1.0],
    u_texture: window.whiteTexture,
    u_emissionStrength: 0.0,
    ...getCandleLightUniforms(),
  });

  webglUtils.drawBufferInfo(gl, wickBufferInfo);
}