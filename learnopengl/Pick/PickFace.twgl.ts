import FSHADER_SOURCE from './PickFace.frag'
import VSHADER_SOURCE from './PickFace.v1.vert'
import * as twgl from 'twgl.js'
import { angleToRads } from '../../lib/utils'

const Matrix4 = twgl.m4
const Vector3 = twgl.v3

let u_matrix = Matrix4.identity() // model view project matrix4

// highlight rect

function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl') as HTMLCanvasElement;
  // Get the rendering context for WebGL
  var gl = canvas.getContext('webgl',  { antialias: false, preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  const programInfo = twgl.createProgramInfo(gl, [VSHADER_SOURCE, FSHADER_SOURCE])
  console.log(' programInfo ==== ', programInfo);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  draw(gl, programInfo)
  canvas.addEventListener('mousemove', e=>{
    const {clientX, clientY} = e
    const rect = canvas.getBoundingClientRect()
    const x_in_canvas = clientX - rect.left
    const y_in_canvas = rect.bottom - clientY

    if(gl){
      check(gl, programInfo, x_in_canvas, y_in_canvas)
    }
  })

}

function check(gl: WebGLRenderingContext, pInfo: twgl.ProgramInfo, x: number, y: number){
  twgl.setUniforms(pInfo, {
    u_PickedFace: 0
  })
  gl.drawArrays(gl.TRIANGLES, 0, 24)
  const pix = new Uint8Array(4)

  gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pix)
  const a_Face = pix[3]
  twgl.setUniforms(pInfo, {
    u_PickedFace: a_Face
  })
  gl.drawArrays(gl.TRIANGLES, 0, 24)
}

function draw (gl: WebGLRenderingContext,pInfo: twgl.ProgramInfo){
  gl.useProgram(pInfo.program)
  /**

   ___________
  |     |     |
  |     |     |
  |-----|-----|
  |     |     |
  |_____|_____|
   */
  const a_Position = [
    // left-top    left-middle   middle-middle
    -0.5, 0.5, -0.5,  -0.5, 0.0, -0.5,  0.0, 0.0, -0.5,
    -0.5, 0.5, -0.5,  0.0, 0.5, -0.5,  0.0, 0.0, -0.5,   // top-left-rect
    //
    0.5, 0.5, -0.5,  0.5, 0.0, -0.5,  0.0, 0.0, -0.5,
    0.5, 0.5, -0.5,  0.0, 0.5, -0.5,  0.0, 0.0, -0.5,   // top-right-rect

    //
    -0.5, -0.5, -0.5,  -0.5, 0.0, -0.5,  0.0, 0.0, -0.5,
    -0.5, -0.5, -0.5,  0.0, -0.5, -0.5,  0.0, 0.0, -0.5,   // bottom-left-rect

    //
    0.5, -0.5, -0.5,  0.5, 0.0, -0.5,  0.0, 0.0, -0.5,
    0.5, -0.5, -0.5,  0.0, -0.5, -0.5,  0.0, 0.0, -0.5,   // bottom-right-rect
  ]
  const a_Face = [ // 点所在的面的 索引
    1, 1, 1,
    1, 1, 1,

    2, 2, 2,
    2, 2, 2,

    3, 3, 3,
    3, 3, 3,

    4, 4, 4,
    4, 4, 4,
  ]
  const a_Color = [
    1.0,0.0,0.0,  1.0,0.0,0.0,   1.0,0.0,0.0,
    1.0,0.0,0.0,  1.0,0.0,0.0,   1.0,0.0,0.0,

    0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
    0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,

    0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
    0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,

    1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0,
    1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0,
  ]
  const attr = {
    a_Position: {
      data: a_Position,
      size: 3,
    },
    a_Face: {
      data: a_Face,
      size: 1
    },
    a_Color: {
      data: a_Color,
      size: 3
    },

  }
  const bufferInfo = twgl.createBufferInfoFromArrays(gl, attr)
  // console.log(' bufferInfo ', bufferInfo);
  twgl.setBuffersAndAttributes(gl, pInfo,  bufferInfo)
  updateMVPMatrix(0)
  const unif = {
    u_MvpMatrix: u_matrix,
    u_PickedFace: -1,
  }
  twgl.setUniforms(pInfo, unif)
  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.drawArrays(gl.TRIANGLES, 0, 24)
}

function updateMVPMatrix(time: number){
  time *= 0.001
  let modelMatrix = Matrix4.identity(); // Model matrix

  // modelMatrix = Matrix4.rotateX(modelMatrix, angleToRads(30))
  // modelMatrix = Matrix4.rotateY(modelMatrix, angleToRads(30))
  modelMatrix = Matrix4.rotationY(time)
  const eye = Vector3.create(0, 0, 5)
  const target = Vector3.create(0, 0, 0)
  const cameraUp = Vector3.create(0, 1, 0)
  const camera = Matrix4.lookAt(eye, target, cameraUp);
  const viewMatrix = Matrix4.inverse(camera)
  const projection = Matrix4.perspective(angleToRads(30), 1, 1, 100);
  // Calculate the model view projection matrix
  const viewProj = Matrix4.multiply(projection, viewMatrix)
  u_matrix = Matrix4.multiply(viewProj, modelMatrix)
}

export default main
