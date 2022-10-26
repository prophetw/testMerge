import AXIS_VS from './Axis.vert'
import AXIS_FS from './Axis.frag'
import * as twgl from 'twgl.js'
import { AttribPointerParams, createAttributeSetters, createUniformSetters, printUsedVariables } from '../../lib/utils';

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
  projection.perspective(30, 1, 1, 100)
  const viewMat4 = new window.Matrix4()
  viewMat4.setLookAt(3.0, 3.0, 5.0, 0.0, 0.0, -1.0, 0.0, 1.0, 0.0)
  projection.multiply(viewMat4)


  drawAxis(gl, program, projection.elements);
  drawFlat(gl, program, projection.elements)

}

function drawFlat (gl: WebGLRenderingContext, program: WebGLProgram, viewMatrix: twgl.m4.Mat4){
// draw xy plant and yz plant

  gl.useProgram(program)
  gl.program = program
  console.log(' drawFlat a_Position: ', gl.getAttribLocation(program, 'a_Position'));
  console.log(' drawFlat a_Color: ', gl.getAttribLocation(program, 'a_Color'));


  console.table(printUsedVariables(gl, program))

  const axios45Coord = new Float32Array([
    // 45 xy            // color
     0.0,  0.0,   0.0,   1.0,1.0,1.0,
     1.0,  1.0,   0.0,   1.0,1.0,1.0,
     1.0,  1.0,   0.0,   1.0,1.0,1.0,
     0.0,  1.0,   0.0,   1.0,1.0,1.0,
     1.0,  1.0,   0.0,   1.0,1.0,1.0,
     1.0,  0.0,   0.0,   1.0,1.0,1.0,
     // 45 yz
     0.0, 0.0,  0.0,   1.0,1.0,1.0,
     0.0, 1.0,  1.0,   1.0,1.0,1.0,
     0.0, 1.0,  1.0,   1.0,1.0,1.0,
     0.0, 0.0,  1.0,   1.0,1.0,1.0,
     0.0, 1.0,  1.0,   1.0,1.0,1.0,
     0.0, 1.0,  0.0,   1.0,1.0,1.0,
  ])
  const axisCoord45Buff = gl.createBuffer()
  if(axisCoord45Buff === null){
    console.error('axisCoord45Buff = gl.createBuffer() failed');
    return
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, axisCoord45Buff)
  gl.bufferData(gl.ARRAY_BUFFER, axios45Coord, gl.STATIC_DRAW)


  const attributeData2 : {
    [key: string]: AttribPointerParams
  }  = {
    a_Position: {
      buffer: axisCoord45Buff,
      size: 3,
      stride: axios45Coord.BYTES_PER_ELEMENT * 6,
      offset: axios45Coord.BYTES_PER_ELEMENT * 0,
    },
    a_Color: {
      buffer: axisCoord45Buff,
      size: 3,
      stride: axios45Coord.BYTES_PER_ELEMENT * 6,
      offset: axios45Coord.BYTES_PER_ELEMENT * 3,
    },
  }

  const attribSetter = createAttributeSetters(gl, program)
  for(let key in attributeData2){
    if(!attributeData2[key]){
      console.error(' attributeData key not exist ', attributeData2, key);
    }
    attribSetter[key](attributeData2[key])
  }
  gl.drawArrays(gl.LINES, 0, 12)
}

function drawAxis(gl: WebGLRenderingContext, program: WebGLProgram, viewMatrix: twgl.m4.Mat4){

  gl.useProgram(program)
  gl.program = program


  const axisCoord = new Float32Array([
     // axis            color
     0.0,  0.0,   0.0,    // X
     1.0,  0.0,   0.0,
     0.0,  0.0,   0.0,    // Y
     0.0,  1.0,   0.0,
     0.0,  0.0,   0.0,    // Z
     0.0,  0.0,   1.0,
  ])
  const axisColor = new Float32Array([
    1.0,  0.0,  0.0,  // X axis
    1.0,  0.0,  0.0,
    0.0,  1.0,  0.0,  // Y axis
    0.0,  1.0,  0.0,
    0.0,  0.0,  1.0,  // Z axis
    0.0,  0.0,  1.0,
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
    [key: string]: Float32Array | twgl.m4.Mat4
  } = {
    viewMat4: viewMatrix
  }

  const attribSetter = createAttributeSetters(gl, program)
  console.log('attribSetter', attribSetter);
  for(let key in attributeData){
    if(!attributeData[key]){
      console.error(' attributeData key not exist ', attributeData, key);
    }
    attribSetter[key](attributeData[key])
  }
  const uniformSetter = createUniformSetters(gl, program)
  for(let key in uniformData){
    if(!uniformData[key]){
      console.error(' attributeData key not exist ', uniformData, key);
    }

    uniformSetter[key](uniformData[key])
  }
  gl.drawArrays(gl.LINES, 0, 6)


}
export {
  drawAxis,
  drawFlat
}

export default main
