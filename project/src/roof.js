"use strict";

/*
let chapelRoofBufferInfo = null;

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

function initRoof(gl) {
  chapelRoofBufferInfo = createRoofBufferInfo(gl);
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

function initCircularWall(gl) {
  circularWallFrontBufferInfo = createCircularWallBufferInfo(
    gl,
    CIRCULAR_WALL.outerRadius,     
    CIRCULAR_WALL.thickness,
    CHAPEL_DIMS.frontWallZ,
    64
  );

  circularWallBackBufferInfo = createCircularWallBufferInfo(
    gl,
    CIRCULAR_WALL.outerRadius,     
    CIRCULAR_WALL.thickness,
    CHAPEL_DIMS.backWallZ,
    64
  );


}

function createCircularWallBufferInfo(gl, radius, thickness, zFront, arcSteps = 64) {
  const positions = [];
  const normals = [];
  const texcoords = [];

  const halfThickness = thickness / 2;
  const z0 = zFront - halfThickness; // retro
  const z1 = zFront + halfThickness; // fronte

  // Centro del semicerchio (in x,y)
  const cx = 0;
  const cy = 0;

  for (let ia = 0; ia < arcSteps; ia++) {
    const t0 = ia / arcSteps;
    const t1 = (ia + 1) / arcSteps;

    // Angoli: da π (sinistra) a 0 (destra)
    const a0 = Math.PI - t0 * Math.PI;
    const a1 = Math.PI - t1 * Math.PI;

    // Punti sul bordo esterno
    const x0 = Math.cos(a0) * radius;
    const y0 = Math.sin(a0) * radius;
    const x1 = Math.cos(a1) * radius;
    const y1 = Math.sin(a1) * radius;

    // --- Faccia frontale (z = z1) ---
    // Un triangolo per "spicchio": centro -> bordo0 -> bordo1
    positions.push(
      cx, cy, z1,       // centro
      x0, y0, z1,       // bordo0
      x1, y1, z1        // bordo1
    );

    // Normali fronte: +z
    normals.push(0, 0, 1, 0, 0, 1, 0, 0, 1);

    // UV: centro (0,0) e bordo (t,1)
    texcoords.push(
      0.0, 0.0,
      t0, 1.0,
      t1, 1.0
    );

    // --- Faccia posteriore (z = z0) ---
    positions.push(
      cx, cy, z0,       // centro
      x1, y1, z0,       // bordo1
      x0, y0, z0        // bordo0
    );

    // Normali retro: -z
    normals.push(0, 0, -1, 0, 0, -1, 0, 0, -1);

    // UV retro
    texcoords.push(
      0.0, 0.0,
      t1, 1.0,
      t0, 1.0
    );
  }

  return webglUtils.createBufferInfoFromArrays(gl, {
    position: { numComponents: 3, data: new Float32Array(positions) },
    normal:   { numComponents: 3, data: new Float32Array(normals) },
    texcoord: { numComponents: 2, data: new Float32Array(texcoords) },
  });
}

function drawCircularWall(view, projection, cameraPosition, lightDirection, bufferInfo) {
  if (!bufferInfo) return;

  let world = m4.identity();

  const offsetY = CHAPEL_DIMS.frontWallHeight

  world = m4.translate(world, 0, offsetY, 0);

  const worldInverseTranspose = m4.transpose(m4.inverse(world));

  const effectiveAmbient = state.lightEnabled ? state.ambient : 0.15;
  const effectiveLightIntensity = state.lightEnabled ? state.lightIntensity : 0.0;

  gl.disable(gl.CULL_FACE);
  gl.useProgram(programInfo.program);
  webglUtils.setBuffersAndAttributes(gl, programInfo, bufferInfo);

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

  webglUtils.drawBufferInfo(gl, bufferInfo);
  gl.enable(gl.CULL_FACE);
}

*/