import AXIS_VS from './Axis.vert'
import AXIS_FS from './Axis.frag'
import { angleToRads } from '../../lib/utils';
import { drawAxis, drawFlat } from './Axis.twgl';
import * as twgl from 'twgl.js'
const Matrix4 = twgl.m4
const Vector3 = twgl.v3

function main (){

  document.title = 'axis demo'
  const canvas = document.getElementById('webgl') as HTMLCanvasElement;

  const gl = canvas.getContext('webgl')
  if(!gl){
    console.log(' get context failed ', gl);
    return
  }

  const programInfo = twgl.createProgramInfo(gl, [AXIS_VS, AXIS_FS]) // compile link and getAll variables in shader
  console.log(' ===> programInfo: ', programInfo);

  gl.clearColor(0.0,0.0,0.0,1.0)
  gl.clear(gl.COLOR_BUFFER_BIT)
  // window.spector.startCapture(canvas, 100)

  const projection = Matrix4.create()
  Matrix4.perspective(angleToRads(30), 1, 0.1, 100, projection)
  const cameraMatrix = Matrix4.create()
  const eye = Vector3.create(3.0, 3.0, 5.0)
  const target = Vector3.create(0.0, 0.0, -1.0)
  const cameraUp = Vector3.create(0.0, 1.0, 0.0)

  Matrix4.lookAt(eye, target, cameraUp, cameraMatrix)
  // NOTE: https://webglfundamentals.org/webgl/lessons/zh_cn/webgl-3d-camera.html
  // lookAt 和标准库的不一样  inverse 就和标准库相同
  // Computes a 4-by-4 look-at transformation.
  // This is a matrix which positions the camera itself. If you want a view matrix (a matrix which moves things in front of the camera) take the inverse of this.

  const viewMatrix = Matrix4.inverse(cameraMatrix)
  Matrix4.multiply(projection, viewMatrix, projection)

  drawGrid(gl, programInfo, projection);
  drawAxis(gl, programInfo, projection)
  drawFlat(gl, programInfo, projection)

}

function drawGrid(gl: WebGLRenderingContext, programInfo: twgl.ProgramInfo, viewMatrix: twgl.m4.Mat4){
  const {program, attribSetters, uniformSetters} = programInfo
  gl.useProgram(program)
  gl.program = program

  const axisCoord = [
     -1.0, 0.0,  1.0,       // X
     1.0,  0.0,  1.0,
     -1.0, 0.0,  0.8,       // X
     1.0,  0.0,  0.8,
     -1.0, 0.0,  0.6,       // X
     1.0,  0.0,  0.6,
     -1.0, 0.0,  0.4,       // Y
     1.0,  0.0,  0.4,
     -1.0, 0.0,  0.2,       // Y
     1.0,  0.0,  0.2,
     -1.0, 0.0,  0.0,       // Z
     1.0,  0.0,  0.0,
     -1.0,  0.0, -0.2,       // Z
     1.0,   0.0, -0.2,
     -1.0,  0.0, -0.4,       // Z
     1.0,   0.0, -0.4,
     -1.0,  0.0, -0.6,       // Z
     1.0,   0.0, -0.6,
     -1.0,  0.0, -0.8,       // Z
     1.0,   0.0, -0.8,
     -1.0,  0.0, -1.0,       // Z
     1.0,   0.0, -1.0,
  ]

  const axisColor = [
    1.0,  1.0,  1.0,  // X axis
    1.0,  1.0,  1.0,
    0.5,  0.5,  0.5,  // X axis
    0.5,  0.5,  0.5,
    1.0,  1.0,  1.0,  // X axis
    1.0,  1.0,  1.0,
    0.5,  0.5,  0.5,  // X axis
    0.5,  0.5,  0.5,
    1.0,  1.0,  1.0,  // X axis
    1.0,  1.0,  1.0,
    0.5,  0.5,  0.5,  // X axis
    0.5,  0.5,  0.5,
    1.0,  1.0,  1.0,  // X axis
    1.0,  1.0,  1.0,
    0.5,  0.5,  0.5,  // X axis
    0.5,  0.5,  0.5,
    1.0,  1.0,  1.0,  // X axis
    1.0,  1.0,  1.0,
    0.5,  0.5,  0.5,  // X axis
    0.5,  0.5,  0.5,
    1.0,  1.0,  1.0,  // X axis
    1.0,  1.0,  1.0,
  ]

  const attributeData = {
    a_Position: {
      data: axisCoord,
      size: 3,
    },
    a_Color: {
      data: axisColor,
      size: 3,
    },
  }

  const uniformData = {
    viewMat4: viewMatrix
  }

  const bufferInfo = twgl.createBufferInfoFromArrays(gl, attributeData)
  twgl.setBuffersAndAttributes(gl, attribSetters, bufferInfo)
  twgl.setUniforms(uniformSetters, uniformData)
  twgl.drawBufferInfo(gl, bufferInfo, gl.LINES)


}
export {
  drawGrid
}

export default main
