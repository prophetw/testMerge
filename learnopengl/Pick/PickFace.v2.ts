import FSHADER_SOURCE from './PickFace.frag'
import VSHADER_SOURCE from './PickFace.vert'
import * as twgl from 'twgl.js'
import { angleToRads } from '../../lib/utils'

const Matrix4 = twgl.m4
const Vector3 = twgl.v3

let u_matrix = Matrix4.identity() // model view project matrix4
let bufferInfo: twgl.BufferInfo
// highlight rect v2  5 pts 简介一点的尝试

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
  console.log('  12  3programInfo ==== ', programInfo);
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
  twgl.drawBufferInfo(gl, bufferInfo)
  const pix = new Uint8Array(4)

  gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pix)
  const a_Face = pix[3]
  twgl.setUniforms(pInfo, {
    u_PickedFace: a_Face
  })
  twgl.drawBufferInfo(gl, bufferInfo)
}

function draw (gl: WebGLRenderingContext,pInfo: twgl.ProgramInfo){
  gl.useProgram(pInfo.program)
  /**

  v0    v6    v1
   ___________
  |     |     |
  |     |     |
v5|-----|v4-----|  v7         centerPt is
  |     |     |
  |_____|_____|
  v2    v8   v3

   */

  const v0 = [-0.5, 0.5, -0.5]
  const v1 = [0.5, 0.5, -0.5]
  const v2 = [-0.5, -0.5, -0.5]
  const v3 = [0.5, -0.5, -0.5]
  const v4 = [0.0, 0.0, -0.5]
  const v5 = [-0.5, 0.0, -0.5] // left-mid
  const v6 = [0.0, 0.5, -0.5] // mid-top
  const v7 = [0.5, 0.0, -0.5] // right-mid
  const v8 = [0.0, -0.5, -0.5] // mid-bottom


  const a_Position = [
    ...v0, ...v5, ...v4, ...v6, // v0-v5-v4-v6
    ...v6, ...v4, ...v7, ...v1, // v6-v4-v7-v1
    ...v5, ...v2, ...v8, ...v4,
    ...v4, ...v8, ...v3, ...v7,
  ]

  const a_Face = [ // 点所在的面的 索引
    1, 1, 1,
    1,
    2, 2, 2,
    2,
    3, 3, 3,
    3,
    4, 4, 4,
    4,
  ]
  const a_Color = [
    1.0,0.0,0.0,  1.0,0.0,0.0,   1.0,0.0,0.0,
    1.0,0.0,0.0,
    0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
    0.0, 1.0, 0.0,
    0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0,
    1.0, 1.0, 0.0,
  ]
  const indices = [
    0,1,2,0,2,3,

    4,5,6,4,6,7,

    8,9,10,8,10,11,

    12,13,14,12, 14,15,
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
    indices
  }
  bufferInfo = twgl.createBufferInfoFromArrays(gl, attr)
  // console.log(' bufferInfo ', bufferInfo);
  twgl.setBuffersAndAttributes(gl, pInfo,  bufferInfo)
  updateMVPMatrix(0)
  const unif = {
    u_MvpMatrix: u_matrix,
    u_PickedFace: -1,
  }
  twgl.setUniforms(pInfo, unif)
  gl.clear(gl.COLOR_BUFFER_BIT)
  twgl.drawBufferInfo(gl, bufferInfo)
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
