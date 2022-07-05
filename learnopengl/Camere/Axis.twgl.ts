import AXIS_VS from './Axis.vert'
import AXIS_FS from './Axis.frag'
import * as twgl from 'twgl.js'
import { angleToRads } from '../../lib/utils';
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

  const programInfo = twgl.createProgramInfo(gl, [AXIS_VS, AXIS_FS])

  gl.clearColor(0.0,0.0,0.0,1.0)
  gl.clear(gl.COLOR_BUFFER_BIT)

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
  drawAxis(gl, programInfo, projection)
  drawFlat(gl, programInfo, projection)
}

function drawFlat (gl: WebGLRenderingContext, programInfo: twgl.ProgramInfo, viewMatrix: twgl.m4.Mat4){
// draw xy plant and yz plant
  const {program, attribSetters, uniformSetters} = programInfo
  gl.useProgram(program)
  gl.program = program
  const axios45Coord = [
    // 45 xy            // color
     0.0,  0.0,   0.0,
     1.0,  1.0,   0.0,
     1.0,  1.0,   0.0,
     0.0,  1.0,   0.0,
     1.0,  1.0,   0.0,
     1.0,  0.0,   0.0,
     // 45 yz
     0.0, 0.0,  0.0,
     0.0, 1.0,  1.0,
     0.0, 1.0,  1.0,
     0.0, 0.0,  1.0,
     0.0, 1.0,  1.0,
     0.0, 1.0,  0.0,
  ]
  const axiosColor = [
    1.0,1.0,1.0,
    1.0,1.0,1.0,
    1.0,1.0,1.0,
    1.0,1.0,1.0,
    1.0,1.0,1.0,
    1.0,1.0,1.0,
    1.0,1.0,1.0,
    1.0,1.0,1.0,
    1.0,1.0,1.0,
    1.0,1.0,1.0,
    1.0,1.0,1.0,
    1.0,1.0,1.0,
  ]
  const uniforms = {
    viewMat4: viewMatrix
  }
  const attributeData = {
    a_Position: {
      data: axios45Coord,
      size: 3,
    },
    a_Color: {
      data: axiosColor,
      size: 3,
    },
  }
  const attrBuffer = twgl.createBufferInfoFromArrays(gl, attributeData)
  twgl.setBuffersAndAttributes(gl, attribSetters, attrBuffer)
  twgl.setUniforms(uniformSetters, uniforms)
  twgl.drawBufferInfo(gl, attrBuffer, gl.LINES)
}

function drawAxis(gl: WebGLRenderingContext, programInfo: twgl.ProgramInfo, viewMatrix: twgl.m4.Mat4){

  console.log(' ---- programInfo', programInfo);
  const {program, attribSetters, uniformSetters} = programInfo
  gl.useProgram(program)
  gl.program = program

  // twgl.resizeCanvasToDisplaySize(gl.canvas);
  // gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  const axisCoord = [
     // axis            color
     0.0,  0.0,   0.0,    // X
     1.0,  0.0,   0.0,
     0.0,  0.0,   0.0,    // Y
     0.0,  1.0,   0.0,
     0.0,  0.0,   0.0,    // Z
     0.0,  0.0,   1.0,
  ]
  const axisColor = [
    1.0,  0.0,  0.0,  // X axis
    1.0,  0.0,  0.0,
    0.0,  1.0,  0.0,  // Y axis
    0.0,  1.0,  0.0,
    0.0,  0.0,  1.0,  // Z axis
    0.0,  0.0,  1.0,
  ]
  const uniforms = {
    viewMat4: viewMatrix
  }

  const attribs: twgl.Arrays = {
    a_Position: {
      size: 3, data: axisCoord
    },
    a_Color: {
      size: 3, data: axisColor
    }
  }
  const attrBuffer = twgl.createBufferInfoFromArrays(gl, attribs)
  twgl.setBuffersAndAttributes(gl, attribSetters, attrBuffer)

  twgl.setUniforms(uniformSetters, uniforms)

  twgl.drawBufferInfo(gl, attrBuffer, gl.LINES)


}
export {
  drawAxis,
  drawFlat
}

export default main
