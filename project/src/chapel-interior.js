"use strict";

/**
 * Crea un elemento cuboidale della scena
 * position e scale vengono applicati alla mesh box condivisa
 */
function createChapelPart(x, y, z, width, height, depth, color, material = "white") {
  return {
    position: [x, y, z],
    scale: [width, height, depth],
    color,
    material,
  };
}

/**
 * Genera la pedana, l'altare e tutte le panche.
 * Ogni elemento usa la stessa box mesh e differisce per trasformazione/materiale.
 */
function buildChapelParts() {
  const parts = [];

  // Pedana e altare
  parts.push(
    createChapelPart(
      0,
      ALTAR_DIMS.platformY,
      ALTAR_DIMS.platformZ,
      ALTAR_DIMS.platformWidth,
      ALTAR_DIMS.platformHeight,
      ALTAR_DIMS.platformDepth,
      COLORS.platform,
      "wall"
    ),
    createChapelPart(
      0,
      ALTAR_DIMS.altarBaseY,
      ALTAR_DIMS.platformZ,
      ALTAR_DIMS.altarBaseWidth,
      ALTAR_DIMS.altarBaseHeight,
      ALTAR_DIMS.altarBaseDepth,
      COLORS.altarBase,
      "wall"
    ),
    createChapelPart(
      0,
      ALTAR_DIMS.altarTopY,
      ALTAR_DIMS.platformZ,
      ALTAR_DIMS.altarTopWidth,
      ALTAR_DIMS.altarTopHeight,
      ALTAR_DIMS.altarTopDepth,
      COLORS.altarTop,
      "wall"
    )
  );

  // Ogni fila contiene una panca a sinistra e una a destra
  for (const z of BENCH_ROWS_Z) {
    addBench(parts, BENCH_DIMS.leftX, z, "left");
    addBench(parts, BENCH_DIMS.rightX, z, "right");
  }

  return parts;
}

/**
 * Aggiunge seduta, schienale e due gambe di una panca.
 * Il lato determina le coordinate X delle rispettive gambe.
 */
function addBench(parts, benchX, z, side) {
  const legLeftX = side === "left" ? BENCH_DIMS.legLeftXLeft : BENCH_DIMS.legLeftXRight;
  const legRightX = side === "left" ? BENCH_DIMS.legRightXLeft : BENCH_DIMS.legRightXRight;

  parts.push(
    createChapelPart(
      benchX,
      BENCH_DIMS.seatY,
      z,
      BENCH_DIMS.seatWidth,
      BENCH_DIMS.seatHeight,
      BENCH_DIMS.seatDepth,
      COLORS.benchSeat,
      "wood"
    ),
    createChapelPart(
      benchX,
      BENCH_DIMS.backrestY,
      z + BENCH_DIMS.backrestZOffset,
      BENCH_DIMS.backrestWidth,
      BENCH_DIMS.backrestHeight,
      BENCH_DIMS.backrestDepth,
      COLORS.benchBack,
      "wood"
    ),
    createChapelPart(
      legLeftX,
      BENCH_DIMS.legY,
      z,
      BENCH_DIMS.legWidth,
      BENCH_DIMS.legHeight,
      BENCH_DIMS.legDepth,
      COLORS.benchLeg,
      "wood"
    ),
    createChapelPart(
      legRightX,
      BENCH_DIMS.legY,
      z,
      BENCH_DIMS.legWidth,
      BENCH_DIMS.legHeight,
      BENCH_DIMS.legDepth,
      COLORS.benchLeg,
      "wood"
    )
  );
}

/**
 * Costruisce la matrice model di un cubo scalato e traslato
 */
function createPartWorldMatrix(part) {
  let world = m4.identity();

  world = m4.translate(
    world,
    part.position[0],
    part.position[1],
    part.position[2]
  );

  return m4.scale(
    world,
    part.scale[0],
    part.scale[1],
    part.scale[2]
  );
}

/**
 * Restituisce la texture 2D associata al materiale della parte
 */
function getPartTexture(material) {
  switch (material) {
    case "wood":
      return window.woodTexture;

    case "floor":
      return window.floorTilesTexture;

    case "wall":
      return window.wallTexture;

    case "white":
    default:
      return window.whiteTexture;
  }
}

/**
 * Renderizza pedana, altare e panche con illuminazione point light
 * e shadow cubemap opzionale.
 */
function drawChapelParts(view, projection, cameraPosition, shadowData = null) {
  if (!chapelPartsList || !boxBufferInfo) return;

  gl.useProgram(programInfo.program);

  const candleLight = state.candles.light;

  const sharedUniforms = {
    u_view: view,
    u_projection: projection,
    u_viewWorldPosition: cameraPosition,

    u_pointLightPosition: candleLight.position,
    u_pointLightColor: candleLight.color,
    u_pointLightIntensity: candleLight.intensity,
    u_pointLightRadius: candleLight.radius,

    u_ambient: state.ambient,

    u_shadowEnabled: shadowData ? 1 : 0,
    u_shadowFarPlane: SHADOW_FAR,
  };

  for (const part of chapelPartsList) {
    const world = createPartWorldMatrix(part);

    webglUtils.setBuffersAndAttributes(gl, programInfo, boxBufferInfo);

    webglUtils.setUniforms(
      programInfo,
      {
        ...sharedUniforms,
        u_world: world,
        u_worldInverseTranspose:
          m4.transpose(m4.inverse(world)),
        u_colorMult: part.color,
      }
    );

    
    bindLitTextures(getPartTexture(part.material));
    webglUtils.drawBufferInfo(gl, boxBufferInfo);
  }

  // Modelli OBJ che fanno parte dell'interno
  drawColumnsOBJ(view, projection, cameraPosition);
  drawPlaqueOBJ(view, projection, cameraPosition);
}