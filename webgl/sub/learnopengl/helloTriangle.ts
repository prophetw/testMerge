// ClickedPints.js (c) 2012 matsuda
// Vertex shader program
import VSHADER_SOURCE from './helloTriangle.vert.glsl'
import FSHADER_SOURCE from './helloTriangle.frag.glsl'
import VSHADER_SOURCE2 from './helloTriangle.vert2.glsl'
import FSHADER_SOURCE2 from './helloTriangle.frag2.glsl'

function main() {
  // Retrieve <canvas> element
  document.title = 'helloTriangle learn opengl '
  var canvas = document.getElementById('webgl') as HTMLCanvasElement;

  // Get the rendering context for WebGL
  var gl = window.getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  if (!initShaders(gl, VSHADER_SOURCE2, FSHADER_SOURCE2)) {
    console.log('Failed to intialize shaders.');
    return;
  }


  //  两个 三角形
  const vertics = new Float32Array([
    -0.5, -0.5, 0.0,
     0.5, -0.5, 0.0,
     0.0,  0.5, 0.0,
     0.0,  0.5, 0.0,
     -0.5, 0.5, 0.0,
     -0.5, -0.5, 0.0,
  ])
  // 3个点
  // const vertics = new Float32Array([
  //   -0.5, -0.5, 0.0,
  //    0.5, -0.5, 0.0,
  //    0.0,  0.5, 0.0,
  // ])
  const vertics1 = new Float32Array([
    -0.5, -0.5, 0.0,
     0.5, -0.5, 0.0,
     0.0,  0.5, 0.0,
  ])
  const vertics2 = new Float32Array([
     0.0,  0.5, 0.0,
     -0.5, 0.5, 0.0,
     -0.5, -0.5, 0.0,
  ])

  // const aryBuffer = gl.createBuffer()
  // // gl.ARRAY_BUFFER 代表顶点数据
  // gl.bindBuffer(gl.ARRAY_BUFFER, aryBuffer)
  // gl.bufferData(gl.ARRAY_BUFFER, vertics, gl.STATIC_DRAW)

  const firstTri = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, firstTri)
  gl.bufferData(gl.ARRAY_BUFFER, vertics1, gl.STATIC_DRAW)
  const secondTri = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, secondTri)
  gl.bufferData(gl.ARRAY_BUFFER, vertics2, gl.STATIC_DRAW)

  const aPos = gl.getAttribLocation(gl.program, 'a_Position')
  if(aPos<0){
    console.error('未找到 a_Position 变量');
    return
  }
  console.log(aPos);
  gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0)
  gl.enableVertexAttribArray(aPos)

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  // gl.drawArrays(gl.POINTS, 0, 3);
  gl.drawArrays(gl.TRIANGLES, 0, 6);

}

export default main
