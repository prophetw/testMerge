import AXIS_VS from './Axis.vert'
import AXIS_FS from './Axis.frag'
import { AttribPointerParams, createAttributeSetters, createUniformSetters, printUsedVariables } from '../../lib/utils';
import { drawAxis, drawFlat } from './Axis';
import * as twgl from 'twgl.js'

function main (){

  document.title = 'axis demo'
  const canvas = document.getElementById('webgl') as HTMLCanvasElement;

  const gl = canvas.getContext('webgl')
  if(!gl){
    console.log(' get context failed ', gl);
    return
  }


  const program = createProgram(gl, AXIS_VS, AXIS_FS)
  if(!!program === false){
    console.log(' create program failed ');
    return
  }
  gl.clearColor(0.0,0.0,0.0,1.0)


  gl.clear(gl.COLOR_BUFFER_BIT)
  // window.spector.startCapture(canvas, 100)


  const projection = new window.Matrix4()
  projection.perspective(30, 1, 0.1, 100)
  const viewMat4 = new window.Matrix4()
  viewMat4.setLookAt(3.0, 3.0, 5.0, 0.0, 0.0, -1.0, 0.0, 1.0, 0.0)
  projection.multiply(viewMat4)

  drawGrid(gl, program, projection.elements);
  drawAxis(gl, program, projection.elements)
  drawFlat(gl, program, projection.elements)

}

function drawGrid(gl: WebGLRenderingContext, program: WebGLProgram, viewMatrix: Float32Array){
  gl.useProgram(program)
  gl.program = program
  console.table(printUsedVariables(gl, program))

  const axisCoord = new Float32Array([
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
  ])

  const axisColor = new Float32Array([
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
  ])
  const axisCoordBuff = gl.createBuffer()
  if(axisCoordBuff === null){
    console.log(' failed axisCoordBuff = gl.createBuffer() ');
    return
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, axisCoordBuff)
  gl.bufferData(gl.ARRAY_BUFFER, axisCoord, gl.STATIC_DRAW)

  const axisColorBuff = gl.createBuffer()
  if(axisColorBuff === null){
    console.log(' failed axisColorBuff = gl.createBuffer() ');
    return
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, axisColorBuff)
  gl.bufferData(gl.ARRAY_BUFFER, axisColor, gl.STATIC_DRAW)

  const attributeData: {
    [key: string]: AttribPointerParams
  } = {
    a_Position: {
      buffer: axisCoordBuff,
      size: 3,
    },
    a_Color: {
      buffer: axisColorBuff,
      size: 3,
    },
  }

  const uniformData: {
    [key: string]: Float32Array
  } = {
    viewMat4: viewMatrix
  }

  const attribSetter = createAttributeSetters(gl, program)
  console.log('attribSetter', attribSetter);
  for(let key in attributeData){
    attribSetter[key](attributeData[key])
  }
  const uniformSetter = createUniformSetters(gl, program)
  console.log('attribSetter', uniformSetter);
  for(let key in uniformData){
    uniformSetter[key](uniformData[key])
  }
  gl.drawArrays(gl.LINES, 0, 22)

}
export {
  drawGrid
}

export default main
