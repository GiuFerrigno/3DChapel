"use strict";

let dustProgramInfo = null;
let dustBufferInfo = null;

const DUST_CONFIG = {
  count: 70,

  // Volume della polvere nella navata
  minPosition: [-3.5, 0.5, -6.5],
  maxPosition: [3.5, 4.0, 5.5],

  minSize: 1.0,
  maxSize: 3.0,

  color: [0.92, 0.86, 0.72, 0.35],
};

/*
 * Le particelle oscillano leggermente nello shader, evitando di aggiornare i buffer CPU a ogni frame
 */
const dustVS = `
attribute vec3 a_position;
attribute float a_size;

uniform mat4 u_view;
uniform mat4 u_projection;
uniform float u_time;

varying float v_alpha;

void main() {
  vec3 position = a_position;

  position.x += 0.055 * sin(u_time * 0.52 + a_position.y * 2.3);
  position.y += 0.038 * sin(u_time * 0.71 + a_position.x * 1.7);
  position.z += 0.045 * cos(u_time * 0.28 + a_position.z * 1.4);

  gl_Position = u_projection * u_view * vec4(position, 1.0);
  gl_PointSize = a_size * 4.0;

  v_alpha = 0.65;
}
`;

const dustFS = `
precision mediump float;

uniform vec4 u_color;

varying float v_alpha;

void main() {
  // Trasforma il point sprite quadrato in una particella circolare sfumata.
  vec2 pointOffset = gl_PointCoord - 0.5;

  float distanceFromCenter = length(pointOffset);

  float edgeAlpha = 1.0 - smoothstep(0.25, 0.5, distanceFromCenter);

  float alpha = u_color.a * edgeAlpha * v_alpha;

  if (alpha < 0.01) {
    discard;
  }

  gl_FragColor = vec4(u_color.rgb, alpha);
}
`;

/**
 * Restituisce un valore casuale nell'intervallo [min, max]
 */
function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

/**
 * Inizializza il programma e il buffer statico delle particelle
 */
function initDust(gl) {
  dustProgramInfo = webglUtils.createProgramInfo(gl, [dustVS, dustFS]);

  const positions = [];
  const sizes = [];

  for (let index = 0; index < DUST_CONFIG.count; ++index) {
    positions.push(
      randomBetween(DUST_CONFIG.minPosition[0], DUST_CONFIG.maxPosition[0]),
      randomBetween(DUST_CONFIG.minPosition[1], DUST_CONFIG.maxPosition[1]),
      randomBetween(DUST_CONFIG.minPosition[2], DUST_CONFIG.maxPosition[2])
    );

    sizes.push(
      randomBetween(DUST_CONFIG.minSize,DUST_CONFIG.maxSize)
    );
  }

  dustBufferInfo =
    webglUtils.createBufferInfoFromArrays(
      gl,
      {
        position: {
          numComponents: 3,
          data: new Float32Array(positions),
        },
        size: {
          numComponents: 1,
          data: new Float32Array(sizes),
        },
      }
    );
}

/**
 * Renderizza la polvere 
 */
function drawDust(view, projection, time) {
  if (!state.dust?.enabled || !dustProgramInfo || !dustBufferInfo) {
    return;
  }

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  // I punti trasparenti non devono scrivere nel depth buffer
  gl.depthMask(false);

  gl.useProgram(dustProgramInfo.program);

  webglUtils.setBuffersAndAttributes(gl, dustProgramInfo, dustBufferInfo);

  webglUtils.setUniforms(
    dustProgramInfo,
    {
      u_view: view,
      u_projection: projection,
      u_time: time,
      u_color: DUST_CONFIG.color,
    }
  );
  
  webglUtils.drawBufferInfo(gl, dustBufferInfo, gl.POINTS);

  gl.depthMask(true);
  gl.disable(gl.BLEND);
}