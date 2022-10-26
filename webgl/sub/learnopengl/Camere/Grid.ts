import GRID_VS from './Grid.vert'
import GRID_FS from './Grid.frag'
import Axis_VS from './Axis.vert'
import Axis_FS from './Axis.frag'
import { AttribPointerParams, createAttributeSetters, createUniformSetters, printUsedVariables } from '../../lib/utils';
import { drawAxis, drawFlat } from './Axis';

let program1: WebGLProgram
let program2: WebGLProgram
let buffer1: WebGLBuffer | null
let buffer2: WebGLBuffer | null
function main (){

  document.title = 'axis demo'
  const canvas = document.getElementById('webgl') as HTMLCanvasElement;

  const gl = canvas.getContext('webgl')
  if(!gl){
    console.log(' get context failed ', gl);
    return
  }


  program1 = createProgram(gl, GRID_VS, GRID_FS)

  program2 = createProgram(gl, Axis_VS, Axis_FS)

  gl.clearColor(0.0,0.0,0.0,1.0)
  gl.clear(gl.COLOR_BUFFER_BIT)
  // window.spector.startCapture(canvas, 100)


  const projection = new window.Matrix4()
  projection.perspective(30, 1, 0.1, 100)
  const viewMat4 = new window.Matrix4()
  viewMat4.setLookAt(3.0, 3.0, 5.0, 0.0, 0.0, -1.0, 0.0, 1.0, 0.0)
  projection.multiply(viewMat4)

  window.spector.startCapture(canvas, 200)
  drawGrid(gl, program1, projection.elements);
  console.log(gl.getBufferParameter(gl.ARRAY_BUFFER, gl.BUFFER_SIZE));
  setTimeout(()=>{
    console.log(' time out here ');
    gl.clear(gl.COLOR_BUFFER_BIT)
    console.log(gl.getBufferParameter(gl.ARRAY_BUFFER, gl.BUFFER_SIZE));
    drawFlat(gl, program2, projection.elements)
    setTimeout(()=>{
      gl.clear(gl.COLOR_BUFFER_BIT)

      // NOTE: 切换了 program 之后 需要重新绑定 buffer  gl 的 vertexArray 可以理解是共享区域

      /**
       // 伪代码
const gl = {
  arrayBuffer: null,
  vertexArray: {
    attributes: [
      { enable: ?, type: ?, size: ?, normalize: ?, stride: ?, offset: ?, buffer: ?, divisor: 0, },
      { enable: ?, type: ?, size: ?, normalize: ?, stride: ?, offset: ?, buffer: ?, divisor: 0, },
      { enable: ?, type: ?, size: ?, normalize: ?, stride: ?, offset: ?, buffer: ?, divisor: 0, },
      { enable: ?, type: ?, size: ?, normalize: ?, stride: ?, offset: ?, buffer: ?, divisor: 0, },
      { enable: ?, type: ?, size: ?, normalize: ?, stride: ?, offset: ?, buffer: ?, divisor: 0, },
      { enable: ?, type: ?, size: ?, normalize: ?, stride: ?, offset: ?, buffer: ?, divisor: 0, },
      { enable: ?, type: ?, size: ?, normalize: ?, stride: ?, offset: ?, buffer: ?, divisor: 0, },
      { enable: ?, type: ?, size: ?, normalize: ?, stride: ?, offset: ?, buffer: ?, divisor: 0, },
    ],
    elementArrayBuffer: null,
  },
}

gl.enableVertexAttribArray = (location: number)=>{
  const attrib = gl.vertexArray.attributes[location]
  attrib.enable = true
}

gl.vertexAttribPointer = (
  index: number,
  size: number,
  type: number,
  normalized: boolean,
  stride: number,
  offset: number)=>{
    const attrib = gl.vertexArray.attributes[index]
    attrib.size = size
    attrib.type = type
    attrib.normalized = normalized
    attrib.stride = stride
    attrib.offset = offset

    // 有争议
    attrib.buffer = gl.arrayBuffer;  // !!!! <-----

  }

gl.bindBuffer = (target, buffer)=>{
  if(target === gl.ARRAY_BUFFER){
    gl.arrayBuffer = buffer
  }
  if(target === gl.ELEMENT_ARRAY_BUFFER){
    gl.vertexARRAY.elementArrayBuffer = buffer
  }
}





       */



      gl.useProgram(program1)
      console.log(' drawFlat a_Position: ', gl.getAttribLocation(program1, 'a_Position'));
      console.log(' drawFlat a_Color: ', gl.getAttribLocation(program1, 'a_Color'));

      // empty buf test
      // const buf = gl.createBuffer()

      // gl.bindBuffer(gl.ARRAY_BUFFER, buffer1)
      // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([]), gl.STATIC_DRAW)
      // gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0)
      // gl.bindBuffer(gl.ARRAY_BUFFER, buffer1)
      // gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0)
      gl.drawArrays(gl.LINES, 0, 22)
    }, 1000)

  }, 1000)

  // drawAxis(gl, program, projection.elements)
  // console.log(gl.getBufferParameter(gl.ARRAY_BUFFER, gl.BUFFER_SIZE));
  // drawFlat(gl, program, projection.elements)
  // console.log(gl.getBufferParameter(gl.ARRAY_BUFFER, gl.BUFFER_SIZE));

}

function drawGrid(gl: WebGLRenderingContext, program: WebGLProgram, viewMatrix: Float32Array){
  gl.useProgram(program)
  gl.program = program
  gl.bindAttribLocation(program, 0, 'a_Color')
  gl.bindAttribLocation(program, 1, 'a_Position')
  console.log(' drawGrid a_Position: ', gl.getAttribLocation(program, 'a_Position'));
      console.log(' drawGrid a_Color: ', gl.getAttribLocation(program, 'a_Color'));

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
  buffer1 = gl.createBuffer()
  if(buffer1 === null){
    console.log(' failed axisCoordBuff = gl.createBuffer() ');
    return
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer1)
  gl.bufferData(gl.ARRAY_BUFFER, axisCoord, gl.STATIC_DRAW)

  const a_Position = gl.getAttribLocation(program, 'a_Position')
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0)
  gl.enableVertexAttribArray(a_Position)

  buffer2 = gl.createBuffer()
  if(buffer2 === null){
    console.log(' failed axisColorBuff = gl.createBuffer() ');
    return
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer2)
  gl.bufferData(gl.ARRAY_BUFFER, axisColor, gl.STATIC_DRAW)

  const a_Color = gl.getAttribLocation(program, 'a_Color')
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, 0, 0)
  gl.enableVertexAttribArray(a_Color)


  const viewMat4 = gl.getUniformLocation(program, 'viewMat4')
  gl.uniformMatrix4fv(viewMat4, false, viewMatrix)

  // const attributeData: {
  //   [key: string]: AttribPointerParams
  // } = {
  //   a_Position: {
  //     buffer: axisCoordBuff,
  //     size: 3,
  //   },
  //   a_Color: {
  //     buffer: axisColorBuff,
  //     size: 3,
  //   },
  // }

  // const uniformData: {
  //   [key: string]: Float32Array
  // } = {
  //   viewMat4: viewMatrix
  // }

  // const attribSetter = createAttributeSetters(gl, program)
  // console.log('attribSetter', attribSetter);
  // for(let key in attributeData){
  //   attribSetter[key](attributeData[key])
  // }
  // const uniformSetter = createUniformSetters(gl, program)
  // console.log('attribSetter', uniformSetter);
  // for(let key in uniformData){
  //   uniformSetter[key](uniformData[key])
  // }
  gl.drawArrays(gl.LINES, 0, 22)

}
export {
  drawGrid
}

export default main
