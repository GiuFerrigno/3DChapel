"use strict";

let candleBufferInfo = null;
let flameBufferInfo = null;
let wickBufferInfo = null;
let smokeBufferInfo = null;

function initCandles(gl) {
  candleBufferInfo = createCylinderBufferInfo(gl, 0.5, 1.0, 20);
  flameBufferInfo = createFlameBufferInfo(gl, 16);
  wickBufferInfo = createCylinderBufferInfo(gl, 0.5, 1.0, 8);
  smokeBufferInfo = createSmokeBufferInfo(gl, 12);
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
    { y: 0.025, radiusX: 0.28, radiusZ: 0.22, offsetX: 0.00 },
    { y: 0.09,  radiusX: 0.46, radiusZ: 0.35, offsetX: 0.00 },
    { y: 0.22,  radiusX: 0.50, radiusZ: 0.38, offsetX: 0.01 },
    { y: 0.45,  radiusX: 0.34, radiusZ: 0.25, offsetX: 0.035 },
    { y: 0.67,  radiusX: 0.20, radiusZ: 0.14, offsetX: 0.07 },
    { y: 0.84,  radiusX: 0.08, radiusZ: 0.05, offsetX: 0.10 },
  ];

  for (let r = 0; r < rings.length; ++r) {
    const ring = rings[r];

    for (let i = 0; i < segments; ++i) {
      const angle = (i / segments) * Math.PI * 2;
      const cosAngle = Math.cos(angle);
      const sinAngle = Math.sin(angle);

      positions.push(
        ring.offsetX + cosAngle * ring.radiusX,
        ring.y,
        sinAngle * ring.radiusZ
      );

      normals.push(cosAngle, 0.5, sinAngle);
      texcoords.push(i / segments, ring.y);
    }
  }

  for (let r = 0; r < rings.length - 1; ++r) {
    for (let i = 0; i < segments; ++i) {
      const next = (i + 1) % segments;
      const a = r * segments + i;
      const b = r * segments + next;
      const c = (r + 1) * segments + i;
      const d = (r + 1) * segments + next;

      indices.push(a, b, c, b, d, c);
    }
  }

  // Base
  const bottomCenter = positions.length / 3;
  positions.push(0.0, 0.0, 0.0);
  normals.push(0.0, -1.0, 0.0);
  texcoords.push(0.5, 0.0);

  const firstRing = 0;
  for (let i = 0; i < segments; ++i) {
    const next = (i + 1) % segments;
    indices.push(bottomCenter, firstRing + next, firstRing + i);
  }

  // Punta
  const tip = positions.length / 3;
  positions.push(0.12, 0.95, 0.0);
  normals.push(0.0, 1.0, 0.0);
  texcoords.push(0.5, 1.0);

  const lastRing = (rings.length - 1) * segments;
  for (let i = 0; i < segments; ++i) {
    const next = (i + 1) % segments;
    indices.push(lastRing + i, lastRing + next, tip);
  }

  return webglUtils.createBufferInfoFromArrays(gl, {
    position: { numComponents: 3, data: new Float32Array(positions) },
    normal: { numComponents: 3, data: new Float32Array(normals) },
    texcoord: { numComponents: 2, data: new Float32Array(texcoords) },
    indices: new Uint16Array(indices),
  });
}

function createSmokeBufferInfo(gl, segments = 16) {
  const positions = [];
  const normals = [];
  const texcoords = [];
  const indices = [];

  const rings = [
    { y: 0.00, rx: 0.10, rz: 0.08, ox: 0.00 },
    { y: 0.08, rx: 0.18, rz: 0.14, ox: 0.01 },
    { y: 0.18, rx: 0.25, rz: 0.20, ox: -0.02 },
    { y: 0.30, rx: 0.30, rz: 0.23, ox: 0.03 },
    { y: 0.42, rx: 0.22, rz: 0.18, ox: 0.06 },
    { y: 0.53, rx: 0.12, rz: 0.10, ox: 0.02 },
  ];

  for (let r = 0; r < rings.length; ++r) {
    const ring = rings[r];

    for (let i = 0; i < segments; ++i) {
      const angle = (i / segments) * Math.PI * 2;
      const x = Math.cos(angle);
      const z = Math.sin(angle);

      positions.push(ring.ox + x * ring.rx, ring.y, z * ring.rz);
      normals.push(x, 0.5, z);
      texcoords.push(i / segments, ring.y);
    }
  }

  for (let r = 0; r < rings.length - 1; ++r) {
    for (let i = 0; i < segments; ++i) {
      const next = (i + 1) % segments;
      const a = r * segments + i;
      const b = r * segments + next;
      const c = (r + 1) * segments + i;
      const d = (r + 1) * segments + next;

      indices.push(a, b, c, b, d, c);
    }
  }

  const bottomCenter = positions.length / 3;
  positions.push(0, 0, 0);
  normals.push(0, -1, 0);
  texcoords.push(0.5, 0.0);

  for (let i = 0; i < segments; ++i) {
    const next = (i + 1) % segments;
    indices.push(bottomCenter, next, i);
  }

  const topCenter = positions.length / 3;
  positions.push(0.04, 0.58, 0);
  normals.push(0, 1, 0);
  texcoords.push(0.5, 1.0);

  const lastRing = (rings.length - 1) * segments;
  for (let i = 0; i < segments; ++i) {
    const next = (i + 1) % segments;
    indices.push(lastRing + i, lastRing + next, topCenter);
  }

  return webglUtils.createBufferInfoFromArrays(gl, {
    position: { numComponents: 3, data: new Float32Array(positions) },
    normal: { numComponents: 3, data: new Float32Array(normals) },
    texcoord: { numComponents: 2, data: new Float32Array(texcoords) },
    indices: new Uint16Array(indices),
  });
}

function drawCandleUnlit(bufferInfo, world, view, projection, color, emissionStrength, light = null) {
  const program = candleProgramInfo;
  gl.useProgram(program.program);
  webglUtils.setBuffersAndAttributes(gl, program, bufferInfo);

  webglUtils.setUniforms(program, {
    u_world: world,
    u_view: view,
    u_projection: projection,
    u_colorMult: color,
    u_texture: window.whiteTexture,
    u_emissionStrength: emissionStrength,
    u_lightView: light ? light.lightView : m4.identity(),
    u_lightProjection: light ? light.lightProjection : m4.identity(),
  });

  webglUtils.drawBufferInfo(gl, bufferInfo);
}

function drawSmokeUnlit(bufferInfo, world, view, projection, color) {
  gl.useProgram(candleProgramInfo.program);
  webglUtils.setBuffersAndAttributes(gl, candleProgramInfo, bufferInfo);

  webglUtils.setUniforms(candleProgramInfo, {
    u_world: world,
    u_view: view,
    u_projection: projection,
    u_colorMult: color,
    u_texture: window.whiteTexture,
    u_emissionStrength: 1.0,
  });

  webglUtils.drawBufferInfo(gl, bufferInfo);
}

function drawFlame(index, candlePosition, candleScale, view, projection) {
  const time = state.candles.time;
  // Fase diversa per ogni candela 
  const phase = index * 1.7;
  // Verticale
  const flicker = state.candles.flicker || 1.0;
  const pulse = flicker + 0.02 * Math.sin(time * 5.0 * state.candles.speed + phase);
  // Orizzontale 
  const sway = 0.035 * Math.sin(time * 3.0 * state.candles.speed + phase);

  const candleTopY = candlePosition[1] + candleScale[1] * 0.5;
  const flameOffsetY = 0.04;

  let flameWorld = m4.identity();
  flameWorld = m4.translate(
    flameWorld,
    candlePosition[0],
    candleTopY + flameOffsetY,
    candlePosition[2]
  );
  flameWorld = m4.zRotate(flameWorld, sway);

  const flameSizeFactor = 0.95;
  flameWorld = m4.scale(
    flameWorld,
    state.candles.flameScale[0] * flameSizeFactor * (2.0 - pulse),
    state.candles.flameScale[1] * flameSizeFactor * pulse,
    state.candles.flameScale[2] * flameSizeFactor
  );

  drawCandleUnlit(
    flameBufferInfo,
    flameWorld,
    view,
    projection,
    [1.0, 0.24, 0.005, 1.0],
    1.2
  );
}

function drawWick(index, candlePosition, candleScale, view, projection, light = null) {
  const wickHeight = state.candles.wickHeight ?? 0.075;
  const wickRadius = state.candles.wickRadius ?? 0.018;

  const candleTopY = candlePosition[1] + candleScale[1] * 0.5;
  const wickCenterY = candleTopY + wickHeight * 0.5 - 0.005;

  let wickWorld = m4.identity();
  wickWorld = m4.translate(
    wickWorld,
    candlePosition[0],
    wickCenterY,
    candlePosition[2]
  );
  wickWorld = m4.scale(
    wickWorld,
    wickRadius / 0.5,
    wickHeight,
    wickRadius / 0.5
  );

  drawCandleUnlit(wickBufferInfo, wickWorld, view, projection, [0.025, 0.012, 0.006, 1.0], 1.0, light);
}

function drawSmoke(index, candlePosition, candleScale, view, projection) {
  if (!state.candles.smoke.enabled) return;

  const smoke = state.candles.smoke;
  const time = state.candles.time;
  const topY = candlePosition[1] + candleScale[1] * 0.5 + 0.14;

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.depthMask(false);

  for (let i = 0; i < smoke.count; ++i) {
    const phase = index * 2.3 + i * 1.8;
    const life = (time * smoke.speed + i * 0.23 + index * 0.11) % 1.0;
    const rise = life * 0.55;
    const swayX = 0.05 * Math.sin(time * 1.2 + phase + life * 4.0);
    const swayZ = 0.025 * Math.cos(time * 1.0 + phase + life * 3.0);
    const size = smoke.size * (0.55 + life * 0.9);
    const alpha = (1.0 - life) * 0.18;

    let smokeWorld = m4.identity();
    smokeWorld = m4.translate(
      smokeWorld,
      candlePosition[0] + swayX,
      topY + rise,
      candlePosition[2] + swayZ
    );
    smokeWorld = m4.scale(smokeWorld, size, size * 1.2, size);

    drawSmokeUnlit(smokeBufferInfo, smokeWorld, view, projection, [smoke.color[0], smoke.color[1], smoke.color[2], alpha]);
  }

  gl.depthMask(true);
  gl.disable(gl.BLEND);
}

function drawCandlesOpaque(view, projection, cameraPosition, light = null) {
  if (!state.candles.enabled) return;

  for (let i = 0; i < state.candles.positions.length; ++i) {
    const p = state.candles.positions[i];
    const isCenter = i === 1;

    const candleScale = isCenter ? [0.12, 0.70, 0.12] : state.candles.candleScale;

    let candleWorld = m4.identity();
    candleWorld = m4.translate(candleWorld, p[0], p[1], p[2]);
    candleWorld = m4.scale(candleWorld, candleScale[0], candleScale[1], candleScale[2]);

    drawCandleUnlit(candleBufferInfo, candleWorld, view, projection, [1.0, 0.78, 0.42, 1.0], 1.0, light);

    drawWick(i, p, candleScale, view, projection, light);
  }
}

function drawCandlesTransparent(view, projection) {
  if (!state.candles.enabled) return;

  for (let i = 0; i < state.candles.positions.length; ++i) {
    const p = state.candles.positions[i];
    const isCenter = i === 1;

    const candleScale = isCenter ? [0.12, 0.70, 0.12] : state.candles.candleScale;

    drawFlame(i, p, candleScale, view, projection);
    drawSmoke(i, p, candleScale, view, projection);
  }
}