"use strict";


function makePart(tx, ty, tz, sx, sy, sz, color, material = "white",shape = "box", side = null) {
  return {
    t: [tx, ty, tz],
    s: [sx, sy, sz],
    color: color,
    material: material,
  };
}

function buildChapelParts() {
  const parts = [];

  // Pedana altare
  parts.push(makePart(
    0,
    ALTAR_DIMS.platformY,
    ALTAR_DIMS.platformZ,
    ALTAR_DIMS.platformWidth,
    ALTAR_DIMS.platformHeight,
    ALTAR_DIMS.platformDepth,
    COLORS.platform,
    "wall"
  ));

  // Altare
  parts.push(makePart(
    0,
    ALTAR_DIMS.altarBaseY,
    ALTAR_DIMS.platformZ,
    ALTAR_DIMS.altarBaseWidth,
    ALTAR_DIMS.altarBaseHeight,
    ALTAR_DIMS.altarBaseDepth,
    COLORS.altarBase,
    "wall"
  ));

  parts.push(makePart(
    0,
    ALTAR_DIMS.altarTopY,
    ALTAR_DIMS.platformZ,
    ALTAR_DIMS.altarTopWidth,
    ALTAR_DIMS.altarTopHeight,
    ALTAR_DIMS.altarTopDepth,
    COLORS.altarTop,
    "wall"
  ));

  // Panche
  for (const z of BENCH_ROWS_Z) {
    parts.push(makePart(
      BENCH_DIMS.leftX,
      BENCH_DIMS.seatY,
      z,
      BENCH_DIMS.seatWidth,
      BENCH_DIMS.seatHeight,
      BENCH_DIMS.seatDepth,
      COLORS.benchSeat,
      "wood"
    ));

    parts.push(makePart(
      BENCH_DIMS.leftX,
      BENCH_DIMS.backrestY,
      z + BENCH_DIMS.backrestZOffset,
      BENCH_DIMS.backrestWidth,
      BENCH_DIMS.backrestHeight,
      BENCH_DIMS.backrestDepth,
      COLORS.benchBack,
      "wood"
    ));

    parts.push(makePart(
      BENCH_DIMS.legLeftXLeft,
      BENCH_DIMS.legY,
      z,
      BENCH_DIMS.legWidth,
      BENCH_DIMS.legHeight,
      BENCH_DIMS.legDepth,
      COLORS.benchLeg,
      "wood"
    ));

    parts.push(makePart(
      BENCH_DIMS.legRightXLeft,
      BENCH_DIMS.legY,
      z,
      BENCH_DIMS.legWidth,
      BENCH_DIMS.legHeight,
      BENCH_DIMS.legDepth,
      COLORS.benchLeg,
      "wood"
    ));

    parts.push(makePart(
      BENCH_DIMS.rightX,
      BENCH_DIMS.seatY,
      z,
      BENCH_DIMS.seatWidth,
      BENCH_DIMS.seatHeight,
      BENCH_DIMS.seatDepth,
      COLORS.benchSeat,
      "wood"
    ));

    parts.push(makePart(
      BENCH_DIMS.rightX,
      BENCH_DIMS.backrestY,
      z + BENCH_DIMS.backrestZOffset,
      BENCH_DIMS.backrestWidth,
      BENCH_DIMS.backrestHeight,
      BENCH_DIMS.backrestDepth,
      COLORS.benchBack,
      "wood"
    ));

    parts.push(makePart(
      BENCH_DIMS.legLeftXRight,
      BENCH_DIMS.legY,
      z,
      BENCH_DIMS.legWidth,
      BENCH_DIMS.legHeight,
      BENCH_DIMS.legDepth,
      COLORS.benchLeg,
      "wood"
    ));

    parts.push(makePart(
      BENCH_DIMS.legRightXRight,
      BENCH_DIMS.legY,
      z,
      BENCH_DIMS.legWidth,
      BENCH_DIMS.legHeight,
      BENCH_DIMS.legDepth,
      COLORS.benchLeg,
      "wood"
    ));
  }

  return parts;
}

function drawChapelParts(view, projection, cameraPosition, lightDirection) {
  if (!chapelPartsList || !boxBufferInfo) return;

  gl.useProgram(programInfo.program);

  const effectiveAmbient = state.lightEnabled ? state.ambient : 0.15;

  const effectiveLightIntensity = state.lightEnabled ? state.lightIntensity : 0.0;

  const commonUniformsBase = {
    u_view: view,
    u_projection: projection,
    u_lightDirection: lightDirection,
    u_viewWorldPosition: cameraPosition,
    u_ambient: effectiveAmbient,
    u_lightIntensity: effectiveLightIntensity,
  };

  // Disegna panche, altare e altre parti cubiche
  for (const part of chapelPartsList) {
    const bufferInfo = boxBufferInfo;

    webglUtils.setBuffersAndAttributes(gl, programInfo, bufferInfo);

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

    const worldInverseTranspose =
      m4.transpose(m4.inverse(world));

    let texture = window.wallTexture;

    if (part.material === "wood") {
      texture = window.woodTexture;
    } else if (part.material === "white") {
      texture = window.whiteTexture;
    } else if (part.material === "floor") {
      texture = window.floorTilesTexture;
    }

    webglUtils.setUniforms(programInfo, {
      ...commonUniformsBase,
      u_world: world,
      u_worldInverseTranspose:
        worldInverseTranspose,
      u_colorMult: part.color,
      u_texture: texture,
    });

    webglUtils.drawBufferInfo(gl, bufferInfo);
  }

  // Disegna le colonne OBJ
  drawColumnsOBJ(view, projection, cameraPosition, lightDirection );

  // Disegna targa
  drawPlaqueOBJ(view, projection, cameraPosition, lightDirection);
}