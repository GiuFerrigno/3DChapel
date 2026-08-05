"use strict";

// DA SISTEMARE 

function makePart(tx, ty, tz, sx, sy, sz, color, material = "white") {
  return {
    t: [tx, ty, tz],
    s: [sx, sy, sz],
    color: color,
    material: material,
  };
}

function buildChapelParts() {
  const parts = [];

  //const wallY = CHAPEL_DIMS.wallHeight / 2;
  //const frontWallY = CHAPEL_DIMS.frontWallHeight / 2;
  const columnY = COLUMN_DIMS.shaftHeight / 2;

  const columnBaseY = COLUMN_DIMS.baseHeight / 2;
  const columnCapY = COLUMN_DIMS.shaftHeight + COLUMN_DIMS.capHeight / 2;

  //const holeLeft = 3 * (WINDOW_OPENING.centerX - WINDOW_OPENING.width / 2);
  //const holeRight = 3 * (WINDOW_OPENING.centerX + WINDOW_OPENING.width / 2);
  //const holeBottom = WINDOW_OPENING.centerY - WINDOW_OPENING.height / 2;
  //const holeTop = WINDOW_OPENING.centerY + WINDOW_OPENING.height / 2;

  // Pavimento
  /*
  parts.push(makePart(
    0,
    CHAPEL_DIMS.floorY,
    0,
    CHAPEL_DIMS.floorWidth,
    CHAPEL_DIMS.floorHeight,
    CHAPEL_DIMS.floorDepth,
    COLORS.floor,
    "floor"
  ));

  // Pareti laterali
  parts.push(makePart(
    CHAPEL_DIMS.leftWallX,
    wallY,
    0,
    CHAPEL_DIMS.wallThickness,
    CHAPEL_DIMS.wallHeight,
    CHAPEL_DIMS.floorDepth,
    COLORS.sideWall,
    "wall"
  ));

  parts.push(makePart(
    CHAPEL_DIMS.rightWallX,
    wallY,
    0,
    CHAPEL_DIMS.wallThickness,
    CHAPEL_DIMS.wallHeight,
    CHAPEL_DIMS.floorDepth,
    COLORS.sideWall,
    "wall"
  ));

    // Facciata frontale
  parts.push(makePart(
    -2.6,
    frontWallY,
    CHAPEL_DIMS.frontWallZ,
    2.8,
    CHAPEL_DIMS.frontWallHeight,
    CHAPEL_DIMS.wallThickness,
    COLORS.frontWall,
    "wall"
  ));

  parts.push(makePart(
    2.6,
    frontWallY,
    CHAPEL_DIMS.frontWallZ,
    2.8,
    CHAPEL_DIMS.frontWallHeight,
    CHAPEL_DIMS.wallThickness,
    COLORS.frontWall,
    "wall"
  ));
  */

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

  // Colonne
  for (const z of COLUMN_ROWS_Z) {
    parts.push(makePart(
      COLUMN_DIMS.xLeft,
      columnY,
      z,
      COLUMN_DIMS.shaftSize,
      COLUMN_DIMS.shaftHeight,
      COLUMN_DIMS.shaftSize,
      COLORS.columnShaft,
      "col"
    ));

    parts.push(makePart(
      COLUMN_DIMS.xRight,
      columnY,
      z,
      COLUMN_DIMS.shaftSize,
      COLUMN_DIMS.shaftHeight,
      COLUMN_DIMS.shaftSize,
      COLORS.columnShaft,
      "col"
    ));

    parts.push(makePart(
      COLUMN_DIMS.xLeft,
      columnBaseY,
      z,
      COLUMN_DIMS.baseSize,
      COLUMN_DIMS.baseHeight,
      COLUMN_DIMS.baseSize,
      COLORS.columnBase,
      "col"
    ));

    parts.push(makePart(
      COLUMN_DIMS.xRight,
      columnBaseY,
      z,
      COLUMN_DIMS.baseSize,
      COLUMN_DIMS.baseHeight,
      COLUMN_DIMS.baseSize,
      COLORS.columnBase,
      "col"
    ));

    parts.push(makePart(
      COLUMN_DIMS.xLeft,
      columnCapY,
      z,
      COLUMN_DIMS.baseSize,
      COLUMN_DIMS.capHeight,
      COLUMN_DIMS.baseSize,
      COLORS.columnBase,
      "col"
    ));

    parts.push(makePart(
      COLUMN_DIMS.xRight,
      columnCapY,
      z,
      COLUMN_DIMS.baseSize,
      COLUMN_DIMS.capHeight,
      COLUMN_DIMS.baseSize,
      COLORS.columnBase,
      "col"
    ));
  }

  return parts;
}
