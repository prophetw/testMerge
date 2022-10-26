import FSHADER_SOURCE from './TexturesWoodBox.frag'
import VSHADER_SOURCE from './TexturesWoodBox.vert'
import * as twgl from 'twgl.js'

let dftMixVal = 0.2
function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl') as HTMLCanvasElement;

  // Get the rendering context for WebGL
  var gl = window.getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  const programInfo = twgl.createProgramInfo(gl, [VSHADER_SOURCE, FSHADER_SOURCE])
  console.log(' programInfo ==== ', programInfo);

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  changeMixVal(gl, programInfo)
  window.spector.startCapture(canvas, 200)
  draw(gl, programInfo)
}

function changeMixVal(gl: WebGLRenderingContext, programInfo: twgl.ProgramInfo){
  document.addEventListener('keyup', e=>{
    if(e.code === "ArrowUp"){
      //
      dftMixVal+=0.1
      draw(gl, programInfo)
    }
    if(e.code === "ArrowDown"){
      dftMixVal-=0.1
      draw(gl, programInfo)
    }
  })

}

function draw(gl: WebGLRenderingContext, programInfo: twgl.ProgramInfo){
  gl.useProgram(programInfo.program)
  const attribData = {
    a_Color: {
      data: [
        1.0, 0.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 0.0, 1.0,
        1.0, 1.0, 0.0,
      ],
      size: 3
    },
    a_Position: {
      data: [
        0.5,  0.5, 0.0,
        0.5, -0.5, 0.0,
        -0.5, -0.5, 0.0,
        -0.5,  0.5, 0.0,
      ],
      size: 3
    },
    a_TexCoord: {
      data: [
        1.0, 1.0,   // 右上
        1.0, 0.0,   // 右下
         0.0, 0.0,   // 左下
         0.0, 1.0,    // 左上
      ],
      size: 2
    }
  }
  const bufferInfo = twgl.createBufferInfoFromArrays(gl, attribData)
  twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo)

  twgl.createTextures(gl, {
    wood: {
      src: './resources/container.jpg',
      flipY: 1,
      min: gl.LINEAR,
      mag: gl.LINEAR,
      wrapS: gl.REPEAT,
      wrapT: gl.REPEAT,
    },
    face: {
      src: './resources/awesomeface.png',
    }
  }, (err, textures)=>{
    if(err){
      throw new Error(' createTextures error ')
    }
    console.log(textures);
    const uniformData = {
      u_MixVal: dftMixVal,
      u_Sampler0: textures.wood,
      u_Sampler1: textures.face,
    }
    twgl.setUniforms(programInfo, uniformData)
    gl.clear(gl.COLOR_BUFFER_BIT);
    twgl.drawBufferInfo(gl, bufferInfo, gl.TRIANGLE_FAN)
  })

}


export default main
