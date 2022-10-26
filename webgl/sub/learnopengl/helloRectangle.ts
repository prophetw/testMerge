// ClickedPints.js (c) 2012 matsuda
// Vertex shader program
import VSHADER_SOURCE from './helloRectangle.vert.glsl'
import FSHADER_SOURCE from './helloRectangle.frag.glsl'

function main() {
  // Retrieve <canvas> element
  document.title = 'helloRectangle learn opengl '
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

  const vertics = new Float32Array([
    -0.5, -0.5, 0.0, //左下角
     0.5, -0.5, 0.0, // 右下角
     0.5,  0.5, 0.0, // 右上角
     -0.5,  0.5, 0.0, // 左上角
  ])




  const aryBuffer = gl.createBuffer()
  // gl.ELEMENT_ARRAY_BUFFER 元素索引的buffer
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, aryBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, vertics, gl.STATIC_DRAW)

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
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

}

export default main
