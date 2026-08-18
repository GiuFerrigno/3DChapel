"use strict";

let dustProgramInfo = null;
let dustBufferInfo = null;

const dustVS = `
attribute vec3 a_position;
attribute float a_size;

uniform mat4 u_view;
uniform mat4 u_projection;
uniform float u_time;

varying float v_alpha;

void main() {
  vec3 p = a_position;
  p.x += 0.055 * sin(u_time * 0.52 + a_position.y * 2.3);
  p.y += 0.038 * sin(u_time * 0.71 + a_position.x * 1.7);
  p.z += 0.045 * cos(u_time * 0.28 + a_position.z * 1.4);
  gl_Position = u_projection * u_view * vec4(p, 1.0);
  gl_PointSize = a_size * 4.0;
  v_alpha = 0.65;
}
`;

const dustFS = `
precision mediump float;

uniform vec4 u_color;
varying float v_alpha;

void main() {
  vec2 p = gl_PointCoord - 0.5;
  float d = length(p);
  float edge = 1.0 - smoothstep(0.25, 0.5, d);
  float alpha = u_color.a * edge * v_alpha;
  if (alpha < 0.01) discard;
  gl_FragColor = vec4(u_color.rgb, alpha);
}
`;

function initDust(gl, count = 70) {
  dustProgramInfo = webglUtils.createProgramInfo(gl, [dustVS, dustFS]);

  const positions = [];
  const sizes = [];

  for (let i = 0; i < count; ++i) {
    positions.push(
      -3.5 + Math.random() * 7.0,
      0.5 + Math.random() * 3.5,
      -6.5 + Math.random() * 12.0
    );

    sizes.push(1.0 + Math.random() * 2.0);
  }

  dustBufferInfo = webglUtils.createBufferInfoFromArrays(gl, {
    position: { numComponents: 3, data: new Float32Array(positions) },
    size: { numComponents: 1, data: new Float32Array(sizes) },
  });

  dustBufferInfo.numElements = count;
}

function drawDust(view, projection, time) {
  if (!state.dust?.enabled || !dustProgramInfo || !dustBufferInfo) return;

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.depthMask(false);

  gl.useProgram(dustProgramInfo.program);
  webglUtils.setBuffersAndAttributes(gl, dustProgramInfo, dustBufferInfo);

  webglUtils.setUniforms(dustProgramInfo, {
    u_view: view,
    u_projection: projection,
    u_time: time,
    u_color: [0.92, 0.86, 0.72, 0.20],
  });

  gl.drawArrays(gl.POINTS, 0, dustBufferInfo.numElements);

  gl.depthMask(true);
  gl.disable(gl.BLEND);
}