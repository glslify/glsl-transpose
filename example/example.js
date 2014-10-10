var glslify       = require('glslify')
var drawTriangle  = require('a-big-triangle')
var transpose3    = require('gl-mat3/transpose')
var transpose4    = require('gl-mat4/transpose')

var canvas = document.createElement('canvas')
var gl = canvas.getContext('webgl')

var shader = glslify({
  vert: '\
attribute vec2 position;\
void main() {\
  gl_Position = vec4(position,0.0,1.0);\
}',
  frag: '\
precision mediump float;\n\
#pragma glslify: frob = require(glsl-frobenius)\n\
#pragma glslify: transpose = require(../index.glsl)\n\
uniform float m0,t0;\
uniform mat2  m1,t1;\
uniform mat3  m2,t2;\
uniform mat4  m3,t3;\
void main() {\
  gl_FragColor = 100.0*vec4(
    frob(transpose(m0)-t0), 
    frob(transpose(m1)-t1),
    frob(transpose(m2)-t2),
    frob(transpose(m3)-t3));\
}',
  inline: true
})(gl)

function runTest(m0, m1, m2, m3) {
  shader.bind()
  shader.uniforms = {
    t0: m0,
    t1: [m1[0], m1[2], m1[1], m1[3]],
    t2: transpose3(m2, m2),
    t3: transpose4(m3, m3),
    m0: m0,
    m1: m1,
    m2: m2,
    m3: m3
  }
  drawTriangle(gl)

  var result = new Uint8Array(4)
  gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, result)

  if(result[0] > 0 ||
     result[1] > 0 ||
     result[2] > 0 ||
     result[3] > 0) {
    console.log('fail', result[0], result[1], result[2], result[3])
  } else {
    console.log('ok')
  }
}


function randFloat() {
  return (Math.random() - 0.5) * Math.pow(2, 20*(Math.random()-0.5))
}
function randArray(n) {
  var r = new Array(n)
  for(var i=0; i<n; ++i) {
    r[i] = randFloat()
  }
  return r
}

for(var i=0; i<100; ++i) {
  runTest(randFloat(), randArray(4), randArray(9), randArray(16))
}