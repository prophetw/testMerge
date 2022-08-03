import FSHADER_SOURCE from './Circle.frag'
import VSHADER_SOURCE from './Circle.vert'
import * as twgl from 'twgl.js'
import { angleToRads } from '../../lib/utils'

const Matrix4 = twgl.m4
const Vector3 = twgl.v3


let bufferInfo: twgl.BufferInfo
let cameraPos = Vector3.create(0, 0, 5)
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
  enableCamera(canvas, gl, programInfo)
  canvas.addEventListener('mousemove', e=>{
    const {clientX, clientY} = e
    const rect = canvas.getBoundingClientRect()
    const x_in_canvas = clientX - rect.left
    const y_in_canvas = rect.bottom - clientY

    if(gl){
      check(gl, programInfo, x_in_canvas, y_in_canvas)
    }
  })

  canvas.addEventListener('click', e=>{
    const {clientX, clientY} = e
    const rect = canvas.getBoundingClientRect()
    const x_in_canvas = clientX - rect.left
    const y_in_canvas = rect.bottom - clientY
    if(gl){
      const result = check(gl, programInfo, x_in_canvas, y_in_canvas)
      console.log('FaceId is : ', result);
    }
  })

}

function check(gl: WebGLRenderingContext, pInfo: twgl.ProgramInfo, x: number, y: number){
  twgl.setUniforms(pInfo, {
    u_PickedFace: 0
  })
  gl.drawArrays(gl.TRIANGLES, 0, 1800)
  const pix = new Uint8Array(4)

  gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pix)
  const a_Face = pix[3]
  twgl.setUniforms(pInfo, {
    u_PickedFace: a_Face
  })
  gl.drawArrays(gl.TRIANGLES, 0, 1800)
  return a_Face

}
function gCircleVert(){
  // 圆就是多边形 无限个多边形组成
  const r = 0.5
  const n = 100
  const radius = angleToRads(360/n)
  const result = []
  for(let i=0;i<n;i++){
    const pt1 = [0,0,0.5]
    const pt2Radius = i * radius
    const pt3Radius = (i+1) * radius
    const pt2 = [
      r*Math.sin(pt2Radius),
      r*Math.cos(pt2Radius),
      0.5
    ]
    const pt3 = [
      r*Math.sin(pt3Radius),
      r*Math.cos(pt3Radius),
      0.5
    ]
    result.push(...pt1,...pt2, ...pt3)
  }
  return result
}

function gRingVert(){
  // 圆环
  const r = 0.5
  const r2 = 0.55
  const n = 100
  const radius = angleToRads(360/n)
  const result = []
  for(let i=0;i<n;i++){
    const pt1Radius = i * radius
    const pt2Radius = (i+1) * radius
    const pt1 = [
      r*Math.sin(pt1Radius),
      -0.7, // y
      r*Math.cos(pt1Radius),
    ]
    const pt2 = [
      r*Math.sin(pt2Radius),
      -0.7,
      r*Math.cos(pt2Radius),
    ]
    const pt3 = [
      r2*Math.sin(pt1Radius),
      -0.7,
      r2*Math.cos(pt1Radius),
    ]
    const pt4 = [
      r2*Math.sin(pt2Radius),
      -0.7,
      r2*Math.cos(pt2Radius),
    ]
    result.push(...pt1,...pt3, ...pt4)
    result.push(...pt1,...pt4,...pt2)
  }
  console.log(result);
  return result
}

function draw (gl: WebGLRenderingContext,pInfo: twgl.ProgramInfo){
  gl.useProgram(pInfo.program)
  // const a_Position = gCircle2Vert() // 圆环
  const a_Position = gRingVert() // 圆环
  const a_Color = new Array(1800).fill(0.5)
  const a_Face = new Array(1800).fill(1)
  const attr = {
    a_Position: {
      data: a_Position,
      size: 3,
    },
    a_Color: {
      data: a_Color,
      size: 3
    },
    a_Face: {
      data: a_Face,
      size: 1,
    }
  }
  bufferInfo = twgl.createBufferInfoFromArrays(gl, attr)
  twgl.setBuffersAndAttributes(gl, pInfo,  bufferInfo)
  updateMVPMatrix(0)
  const unif = {
    u_MvpMatrix: u_matrix,
    u_PickedFace: -1,
  }
  twgl.setUniforms(pInfo, unif)
  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.drawArrays(gl.TRIANGLES, 0, 1800)
}

function updateMVPMatrix(time: number){
  time *= 0.001
  let modelMatrix = Matrix4.identity(); // Model matrix

  // modelMatrix = Matrix4.rotateX(modelMatrix, angleToRads(30))
  // modelMatrix = Matrix4.rotateY(modelMatrix, angleToRads(30))
  modelMatrix = Matrix4.rotationY(time)
  const eye = cameraPos
  const target = Vector3.create(0, 0, 0)
  const cameraUp = Vector3.create(0, 1, 0)
  const camera = Matrix4.lookAt(eye, target, cameraUp);
  const viewMatrix = Matrix4.inverse(camera)
  const projection = Matrix4.perspective(angleToRads(30), 1, 1, 100);
  // Calculate the model view projection matrix
  const viewProj = Matrix4.multiply(projection, viewMatrix)
  u_matrix = Matrix4.multiply(viewProj, modelMatrix)
}

function enableCamera (
  canvas: HTMLCanvasElement,
  gl: WebGLRenderingContext,
  pInfo: twgl.ProgramInfo
  ) {
  let startMove = false
  let lastX: number
  let lastY: number
  let yaw = -90
  let pitch = 0

  const onMousemove = (e: MouseEvent)=>{
    if(startMove){
      const sensitivity = 0.5
      const {offsetX, offsetY} = e
      const offsetXx = offsetX - lastX
      const offsetYy = -(offsetY - lastY) // 往上是正
      lastX = offsetX
      lastY = offsetY
      const xoffset = offsetXx * sensitivity
      const yoffset = offsetYy * sensitivity
      yaw   += xoffset;
      pitch += yoffset;

      if(pitch > 89)
          pitch = 89;
      if(pitch < -89)
          pitch = -89;

      //  绕圆心
      const frontCamX = Math.cos(angleToRads(yaw)) * Math.cos(angleToRads(pitch)) *5
      const frontCamY = Math.sin(angleToRads(pitch)) * 5
      const frontCamZ = Math.sin(angleToRads(yaw)) * Math.cos(angleToRads(pitch)) * 5

      const cameX = Math.cos(angleToRads(pitch)) * 5 * Math.sin(angleToRads(yaw))
      const cameY = Math.sin(angleToRads(pitch)) * 5
      const cameZ = Math.cos(angleToRads(pitch)) * 5 * Math.cos(angleToRads(yaw))

      const newCamPosi  = Vector3.create(cameX, cameY, cameZ)
      const frontCamVec3 = Vector3.create(frontCamX, frontCamY, frontCamZ)
      // const camFront = Vector3.normalize(frontCamVec3)
      // cameraFront = frontCamVec3
      cameraPos = frontCamVec3
      // draw(gl, pInfo)
      updateMVPMatrix(0)
      twgl.setUniforms(pInfo, {
        u_MvpMatrix: u_matrix,
        u_CameraPos: cameraPos,
        u_PickedFace: -1,
      })
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLES, 0, 1800)
    }else{
      return
    }
  }
  const onMouseUp = (e: MouseEvent)=>{
    startMove = false
    document.removeEventListener('mousemove', onMousemove)
    document.removeEventListener('mouseup', onMouseUp)
  }
  const onMousedown = (e: MouseEvent)=>{
    startMove = true
    const {offsetX, offsetY} = e
    lastX = offsetX
    lastY = offsetY
    document.addEventListener('mousemove', onMousemove)
    document.addEventListener('mouseup', onMouseUp)
  }
  document.addEventListener('mousedown', onMousedown)
}
export default main
