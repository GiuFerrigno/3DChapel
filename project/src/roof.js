"use strict";

let chapelRoofBufferInfo = null;
let circularWallBufferInfo = null;

const ROOF = {
  outerRadius: 4.10,
  thickness: 0.20,
  length: 14.2,
  arcSteps: 24,
  lenSteps: 24,
  worldY: 4.40,
  color: [0.62, 0.62, 0.66, 1.0],
};

function pushTri(pos, nor, uv, ax, ay, az, bx, by, bz, cx, cy, cz, nx, ny, nz) {
  pos.push(ax, ay, az, bx, by, bz, cx, cy, cz);
  nor.push(nx, ny, nz, nx, ny, nz, nx, ny, nz);
  uv.push(0, 0, 1, 0, 0, 1);
}

function createRoofBufferInfo(gl) {
  const positions = [];
  const normals = [];
  const texcoords = [];

  const innerRadius = ROOF.outerRadius - ROOF.thickness;
  const zMin = -ROOF.length / 2;
  const zMax = ROOF.length / 2;

  for (let iz = 0; iz < ROOF.lenSteps; iz++) {
    const z0 = zMin + (iz / ROOF.lenSteps) * ROOF.length;
    const z1 = zMin + ((iz + 1) / ROOF.lenSteps) * ROOF.length;

    for (let ia = 0; ia < ROOF.arcSteps; ia++) {
      const a0 = Math.PI - (ia / ROOF.arcSteps) * Math.PI;
      const a1 = Math.PI - ((ia + 1) / ROOF.arcSteps) * Math.PI;

      const x00 = Math.cos(a0) * ROOF.outerRadius;
      const y00 = Math.sin(a0) * ROOF.outerRadius;
      const x10 = Math.cos(a1) * ROOF.outerRadius;
      const y10 = Math.sin(a1) * ROOF.outerRadius;

      pushTri(positions, normals, texcoords,
        x00, y00, z0,
        x10, y10, z0,
        x00, y00, z1,
        Math.cos(a0), Math.sin(a0), 0
      );

      pushTri(positions, normals, texcoords,
        x10, y10, z0,
        x10, y10, z1,
        x00, y00, z1,
        Math.cos(a1), Math.sin(a1), 0
      );
    }
  }

  for (let iz = 0; iz < ROOF.lenSteps; iz++) {
    const z0 = zMin + (iz / ROOF.lenSteps) * ROOF.length;
    const z1 = zMin + ((iz + 1) / ROOF.lenSteps) * ROOF.length;

    for (let ia = 0; ia < ROOF.arcSteps; ia++) {
      const a0 = Math.PI - (ia / ROOF.arcSteps) * Math.PI;
      const a1 = Math.PI - ((ia + 1) / ROOF.arcSteps) * Math.PI;

      const x00 = Math.cos(a0) * innerRadius;
      const y00 = Math.sin(a0) * innerRadius;
      const x10 = Math.cos(a1) * innerRadius;
      const y10 = Math.sin(a1) * innerRadius;

      pushTri(positions, normals, texcoords,
        x00, y00, z1,
        x10, y10, z0,
        x00, y00, z0,
        -Math.cos(a0), -Math.sin(a0), 0
      );

      pushTri(positions, normals, texcoords,
        x00, y00, z1,
        x10, y10, z1,
        x10, y10, z0,
        -Math.cos(a1), -Math.sin(a1), 0
      );
    }
  }

  for (let ia = 0; ia < ROOF.arcSteps; ia++) {
    const a0 = Math.PI - (ia / ROOF.arcSteps) * Math.PI;
    const a1 = Math.PI - ((ia + 1) / ROOF.arcSteps) * Math.PI;

    const xo0 = Math.cos(a0) * ROOF.outerRadius;
    const yo0 = Math.sin(a0) * ROOF.outerRadius;
    const xo1 = Math.cos(a1) * ROOF.outerRadius;
    const yo1 = Math.sin(a1) * ROOF.outerRadius;

    const xi0 = Math.cos(a0) * innerRadius;
    const yi0 = Math.sin(a0) * innerRadius;
    const xi1 = Math.cos(a1) * innerRadius;
    const yi1 = Math.sin(a1) * innerRadius;

    pushTri(positions, normals, texcoords,
      xo0, yo0, zMax,
      xo1, yo1, zMax,
      xi0, yi0, zMax,
      0, 0, 1
    );

    pushTri(positions, normals, texcoords,
      xo1, yo1, zMax,
      xi1, yi1, zMax,
      xi0, yi0, zMax,
      0, 0, 1
    );

    pushTri(positions, normals, texcoords,
      xo0, yo0, zMin,
      xi0, yi0, zMin,
      xo1, yo1, zMin,
      0, 0, -1
    );

    pushTri(positions, normals, texcoords,
      xo1, yo1, zMin,
      xi0, yi0, zMin,
      xi1, yi1, zMin,
      0, 0, -1
    );
  }

  return webglUtils.createBufferInfoFromArrays(gl, {
    position: { numComponents: 3, data: new Float32Array(positions) },
    normal: { numComponents: 3, data: new Float32Array(normals) },
    texcoord: { numComponents: 2, data: new Float32Array(texcoords) },
  });
}

function createCircularWallBufferInfo(gl, outerR, innerR, thickness, arcSteps = 64) {
  const positions = [];
  const normals = [];
  const texcoords = [];

  const zFront = CHAPEL_DIMS.frontWallZ;
  const halfThickness = thickness / 2;
  const z0 = zFront - halfThickness;
  const z1 = zFront + halfThickness;

  for (let ia = 0; ia < arcSteps; ia++) {
    const t0 = ia / arcSteps;
    const t1 = (ia + 1) / arcSteps;

    const a0 = Math.PI - t0 * Math.PI;      // da sinistra (pi) a centro
    const a1 = Math.PI - t1 * Math.PI;      // verso destra (0)

    const xOuter0 = Math.cos(a0) * outerR;
    const yOuter0 = Math.sin(a0) * outerR;
    const xOuter1 = Math.cos(a1) * outerR;
    const yOuter1 = Math.sin(a1) * outerR;

    const xInner0 = Math.cos(a0) * innerR;
    const yInner0 = Math.sin(a0) * innerR;
    const xInner1 = Math.cos(a1) * innerR;
    const yInner1 = Math.sin(a1) * innerR;

    // fronte semicircolare (faccia visibile)
    // triangolo 1
    positions.push(
      xOuter0, yOuter0, z1,
      xOuter1, yOuter1, z1,
      xInner0, yInner0, z1
    );
    // triangolo 2
    positions.push(
      xOuter1, yOuter1, z1,
      xInner1, yInner1, z1,
      xInner0, yInner0, z1
    );

    // normali verso l'interno della cappella (grossolanamente +z)
    for (let i = 0; i < 6; i++) {
      normals.push(0, 0, 1);
    }

    // UV semplici (mappatura polare grossolana)
    texcoords.push(
      t0, 1.0,
      t1, 1.0,
      t0, 0.0,

      t1, 1.0,
      t1, 0.0,
      t0, 0.0
    );

    // faccia posteriore (opzionale, se ti serve spessore)
    positions.push(
      xOuter0, yOuter0, z0,
      xInner0, yInner0, z0,
      xOuter1, yOuter1, z0
    );
    positions.push(
      xOuter1, yOuter1, z0,
      xInner0, yInner0, z0,
      xInner1, yInner1, z0
    );
    for (let i = 0; i < 6; i++) {
      normals.push(0, 0, -1);
    }
    texcoords.push(
      t0, 1.0,
      t0, 0.0,
      t1, 1.0,

      t1, 1.0,
      t0, 0.0,
      t1, 0.0
    );
  }

  return webglUtils.createBufferInfoFromArrays(gl, {
    position: { numComponents: 3, data: new Float32Array(positions) },
    normal:   { numComponents: 3, data: new Float32Array(normals) },
    texcoord: { numComponents: 2, data: new Float32Array(texcoords) },
  });
}

function initRoof(gl) {
  chapelRoofBufferInfo = createRoofBufferInfo(gl);
}

function initCircularWall(gl) {
  circularWallBufferInfo = createCircularWallBufferInfo(
    gl,
    CIRCULAR_WALL.outerRadius,
    CIRCULAR_WALL.innerRadius,
    CIRCULAR_WALL.thickness,
    64
  );
}

function drawRoof(view, projection, cameraPosition, lightDirection) {
  if (!chapelRoofBufferInfo) return;

  let world = m4.identity();
  world = m4.translate(world, 0, ROOF.worldY, 0);

  const worldInverseTranspose = m4.transpose(m4.inverse(world));
  const effectiveAmbient = state.lightEnabled ? state.ambient : 0.15;
  const effectiveLightIntensity = state.lightEnabled ? state.lightIntensity : 0.0;

  gl.disable(gl.CULL_FACE);

  gl.useProgram(programInfo.program);
  webglUtils.setBuffersAndAttributes(gl, programInfo, chapelRoofBufferInfo);

  webglUtils.setUniforms(programInfo, {
    u_world: world,
    u_view: view,
    u_projection: projection,
    u_worldInverseTranspose: worldInverseTranspose,
    u_lightDirection: lightDirection,
    u_viewWorldPosition: cameraPosition,
    u_colorMult: ROOF.color,
    u_texture: window.wallTexture,
    u_ambient: effectiveAmbient,
    u_lightIntensity: effectiveLightIntensity,
  });

  webglUtils.drawBufferInfo(gl, chapelRoofBufferInfo);

  gl.enable(gl.CULL_FACE);
}

function drawCircularWall(view, projection, cameraPosition, lightDirection) {
  if (!circularWallBufferInfo) return;

  let world = m4.identity();

  const offsetY = CHAPEL_DIMS.frontWallHeight

  world = m4.translate(world, 0, offsetY, 0);

  const worldInverseTranspose = m4.transpose(m4.inverse(world));

  const effectiveAmbient = state.lightEnabled ? state.ambient : 0.15;
  const effectiveLightIntensity = state.lightEnabled ? state.lightIntensity : 0.0;

  gl.disable(gl.CULL_FACE);
  gl.useProgram(programInfo.program);
  webglUtils.setBuffersAndAttributes(gl, programInfo, circularWallBufferInfo);

  webglUtils.setUniforms(programInfo, {
    u_world: world,
    u_view: view,
    u_projection: projection,
    u_worldInverseTranspose: worldInverseTranspose,
    u_lightDirection: lightDirection,
    u_viewWorldPosition: cameraPosition,
    u_colorMult: COLORS.frontWall,
    u_texture: window.wallTexture,
    u_ambient: effectiveAmbient,
    u_lightIntensity: effectiveLightIntensity,
  });

  webglUtils.drawBufferInfo(gl, circularWallBufferInfo);
  gl.enable(gl.CULL_FACE);
}