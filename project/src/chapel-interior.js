"use strict";


function makePart(tx, ty, tz, sx, sy, sz, color, material = "white", shape = "box", side = null) {
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

function drawChapelParts(view, projection, cameraPosition, shadowData = null) {
  if (!chapelPartsList || !boxBufferInfo) return;

  gl.useProgram(programInfo.program);

  const candleLight = state.candles.light;
 
  const commonUniformsBase = {
    u_view: view,
    u_projection: projection,
    u_viewWorldPosition: cameraPosition,

    u_pointLightPosition: candleLight.position,
    u_pointLightColor: candleLight.color,
    u_pointLightIntensity: candleLight.intensity,
    u_pointLightRadius: candleLight.radius,

    u_ambient: state.ambient,

    u_shadowCube: shadowTexture,
    u_shadowEnabled: shadowData ? 1 : 0,
    u_shadowFarPlane: SHADOW_FAR,
  };

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

    const worldInverseTranspose = m4.transpose(m4.inverse(world));

    let texture = window.wallTexture;

    if (part.material === "wood") {
      texture = window.woodTexture;
    } else if (part.material === "floor") {
      texture = window.floorTilesTexture;

    //TODO: è una fallback o qualcuno ha effettivamente questa texture?  
    } else if (part.material === "white") {
      texture = window.whiteTexture;
    }

    webglUtils.setUniforms(
      programInfo,
      {
        ...commonUniformsBase,
        u_world: world,
        u_worldInverseTranspose:
          worldInverseTranspose,
        u_colorMult: part.color,
        u_texture: texture,
      }
    );

    webglUtils.drawBufferInfo(gl, bufferInfo);
  }

  drawColumnsOBJ(view, projection, cameraPosition);
  drawPlaqueOBJ(view, projection, cameraPosition);
}