import FSHADER_SOURCE from './FirstTriangle.frag'
import VSHADER_SOURCE from './FirstTriangle.vert'
import * as twgl from 'twgl.js'

function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl') as HTMLCanvasElement;
  document.title = 'twgl texture eg'

  // Get the rendering context for WebGL
  var gl = window.getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  const programInfo = twgl.createProgramInfo(gl, [VSHADER_SOURCE, FSHADER_SOURCE])
  console.log(' ===> programInfo ===<', programInfo);

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT)

  drawTriangle(gl, programInfo)

}

function drawTriangle(gl: WebGLRenderingContext, programInfo: twgl.ProgramInfo){

  gl.useProgram(programInfo.program)
  gl.program = programInfo.program

  const attributeData = {
    a_Position: {
      data: [-0.5, -0.5,  0.5, -0.5, 0.0, 0.5],
      size: 2,
    },
    a_TexCoord: {
      data: [
        0.0, 0.0,  // left bottom
        1.0, 0.0,  // right bottom
        0.5, 1.0,  // top middle
      ],
      size: 2
    }
  }
  const bufferInfo = twgl.createBufferInfoFromArrays(gl, attributeData)
  twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo)

  // window.spector.startCapture(document.getElementById('webgl'), 100)
  twgl.createTexture(gl, {
      src: "./resources/wall.jpg",
      min: gl.LINEAR,
      flipY: 1,
  }, (err, texture)=>{
    if(err){
      throw new Error('createTexture error ')
    }
    console.log(' success ');
    const uniformData = {
      u_Sampler: texture
    }
    twgl.setUniforms(programInfo, uniformData)
    twgl.drawBufferInfo(gl, bufferInfo, gl.TRIANGLES)
  })

}


export default main
