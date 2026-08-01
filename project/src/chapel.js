"use strict";

const CHAPEL_DIMS = {
  floorY: -0.05,
  floorWidth: 8.0,
  floorHeight: 0.1,
  floorDepth: 14.0,

  wallHeight: 4.4,
  frontWallHeight: 4.4,
  wallThickness: 0.2,

  leftWallX: -4.0,
  rightWallX: 4.0,
  frontWallZ: 7.0,
  backWallZ: -7.0,
  backWallWidth: 8.0,
};

const WINDOW_OPENING = {
  centerX: 0.0,
  centerY: 3.1,
  width: 2.0,
  height: 3.4,
};

const COLUMN_DIMS = {
  xLeft: -3.0,
  xRight: 3.0,
  shaftHeight: 3.4,
  shaftSize: 0.32,
  baseHeight: 0.16,
  capHeight: 0.16,
  baseSize: 0.46,
};

const ALTAR_DIMS = {
  platformY: 0.15,
  platformZ: -5.4,
  platformWidth: 2.6,
  platformHeight: 0.3,
  platformDepth: 1.8,

  altarBaseY: 0.55,
  altarBaseWidth: 1.6,
  altarBaseHeight: 0.8,
  altarBaseDepth: 0.8,

  altarTopY: 1.05,
  altarTopWidth: 1.2,
  altarTopHeight: 0.2,
  altarTopDepth: 0.7,
};

const BENCH_DIMS = {
  leftX: -1.8,
  rightX: 1.8,

  seatY: 0.22,
  seatWidth: 1.4,
  seatHeight: 0.14,
  seatDepth: 0.45,

  backrestY: 0.55,
  backrestZOffset: 0.18,
  backrestWidth: 1.4,
  backrestHeight: 0.5,
  backrestDepth: 0.12,

  legLeftXLeft: -2.35,
  legRightXLeft: -1.25,
  legLeftXRight: 1.25,
  legRightXRight: 2.35,
  legY: 0.11,
  legWidth: 0.10,
  legHeight: 0.22,
  legDepth: 0.38,
};

const BENCH_ROWS_Z = [3.8, 2.2, 0.6, -1.0, -2.6];
const COLUMN_ROWS_Z = [4.5, 1.5, -1.5, -4.5];

const COLORS = {
  floor: [1, 1, 1, 1],
  sideWall: [0.82, 0.82, 0.84, 1],
  backWall: [0.80, 0.80, 0.83, 1],
  frontWall: [0.84, 0.84, 0.86, 1],
  platform: [0.70, 0.70, 0.72, 1],
  altarBase: [0.88, 0.88, 0.90, 1],
  altarTop: [0.92, 0.92, 0.94, 1],
  benchSeat: [0.45, 0.28, 0.16, 1],
  benchBack: [0.43, 0.26, 0.15, 1],
  benchLeg: [0.36, 0.22, 0.12, 1],
  columnShaft: [0.78, 0.78, 0.80, 1],
  columnBase: [0.68, 0.68, 0.70, 1],
};

function makePart(tx, ty, tz, sx, sy, sz, color, material = "white") {
  return {
    t: [tx, ty, tz],
    s: [sx, sy, sz],
    color: color,
    material: material,
  };
}

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

  const wallY = CHAPEL_DIMS.wallHeight / 2;
  const frontWallY = CHAPEL_DIMS.frontWallHeight / 2;
  const columnY = COLUMN_DIMS.shaftHeight / 2;

  const columnBaseY = COLUMN_DIMS.baseHeight / 2;
  const columnCapY = COLUMN_DIMS.shaftHeight + COLUMN_DIMS.capHeight / 2;

  const holeLeft = WINDOW_OPENING.centerX - WINDOW_OPENING.width / 2;
  const holeRight = WINDOW_OPENING.centerX + WINDOW_OPENING.width / 2;
  const holeBottom = WINDOW_OPENING.centerY - WINDOW_OPENING.height / 2;
  const holeTop = WINDOW_OPENING.centerY + WINDOW_OPENING.height / 2;

  // Pavimento
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

  // Fondo con apertura per la vetrata
  parts.push(makePart(
    0,
    holeBottom / 2,
    CHAPEL_DIMS.backWallZ,
    CHAPEL_DIMS.backWallWidth,
    holeBottom,
    CHAPEL_DIMS.wallThickness,
    COLORS.backWall,
    "wall"
  ));

  parts.push(makePart(
    (CHAPEL_DIMS.leftWallX + holeLeft) / 2,
    WINDOW_OPENING.centerY,
    CHAPEL_DIMS.backWallZ,
    holeLeft - CHAPEL_DIMS.leftWallX,
    WINDOW_OPENING.height,
    CHAPEL_DIMS.wallThickness,
    COLORS.backWall,
    "wall"
  ));

  parts.push(makePart(
    (holeRight + CHAPEL_DIMS.rightWallX) / 2,
    WINDOW_OPENING.centerY,
    CHAPEL_DIMS.backWallZ,
    CHAPEL_DIMS.rightWallX - holeRight,
    WINDOW_OPENING.height,
    CHAPEL_DIMS.wallThickness,
    COLORS.backWall,
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