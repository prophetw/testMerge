import FSHADER_SOURCE from './CameraPosition.frag'
import VSHADER_SOURCE from './CameraPosition.vert'
import AXIS_FS from './Axis.frag'
import AXIS_VS from './Axis.vert'
import * as twgl from 'twgl.js'
import { angleToRads } from '../../lib/utils';
import { drawAxis } from './Axis.twgl'
const Matrix4 = twgl.m4
const Vector3 = twgl.v3

const mvpMat = Matrix4.identity()

const viewModel = {
  eyeX: 3.0,
  eyeY: 3.0,
  eyeZ: 5.0,
  x: 0,
  y: 0,
  z: -1,
  upX: 0,
  upY: 1,
  upZ: 0,
}
let redraw: ()=>any
function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl') as HTMLCanvasElement;
  document.title = 'Camera/View Space'

  // Get the rendering context for WebGL
  var gl = window.getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  const programInfo = twgl.createProgramInfo(gl, [VSHADER_SOURCE, FSHADER_SOURCE])
  console.log(' ---- programInfo ---- ', programInfo );

  gl.clearColor(0.0,0.0,0.0,1.0)


  const programAxisInfo = twgl.createProgramInfo(gl, [AXIS_VS, AXIS_FS])
  gl.clear(gl.COLOR_BUFFER_BIT)
  const newMvpMat = changeViewModel()
  draw(gl, programInfo, newMvpMat, ()=>{
    // drawAxis(gl, programAxisInfo, newMvpMat)
  })
  redraw = ()=>{
    const newMvp = changeViewModel()
    gl.clear(gl.COLOR_BUFFER_BIT)
    const uniform = {
      u_ViewMatrix: newMvp
    }
    twgl.setUniforms(programInfo, uniform)
    gl.useProgram(programInfo.program)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    drawAxis(gl, programAxisInfo, newMvpMat)
  }

  injectOptions(gl, 3)
}

function draw (gl: WebGLRenderingContext, programInfo: twgl.ProgramInfo, mvp = Matrix4.identity(), afterDraw= ()=>{
  //
}){
  // draw xy plant and yz plant
    const {program, attribSetters, uniformSetters} = programInfo
    gl.useProgram(program)

    const vertics = [
       // Vertex,         texture    placeholder
    -0.5, -0.5, 0.0,   // left bottom
    0.5, -0.5,  0.0,    // right bottom
    0.0, 0.5,   0.0,   // top middle
    // axis            color
    0.0,  0.0,   0.0,    // X
    1.0,  0.0,   0.0,
    0.0,  0.0,   0.0,    // Y
    0.0,  1.0,   0.0,
    0.0,  0.0,   0.0,    // Z
    0.0,  0.0,   1.0,
    ]
    const texCoord = [
      0.0, 0.0,
      1.0, 0.0,
      0.5, 1.0,
      1.0,  1.0,
      1.0,  0.0,
      1.0,  1.0,
      1.0,  0.0,
      1.0,  1.0,
      1.0,  0.0,
    ]
    const attrData = {
      a_Position: {
        data: vertics, size: 3
      },
      a_TexCoord: {
        data: texCoord, size: 2
      }
    }
    const bufferInfo = twgl.createBufferInfoFromArrays(gl, attrData)
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo)

    twgl.createTexture(gl, {
      src: './resources/wall.jpg',
    }, (err, texture)=>{
      if(err){
        throw new Error(' twgl.createTexture ')
      }
      const uniformData = {
        u_Sampler: texture,
        u_ViewMatrix: mvp
      }
      twgl.setUniforms(programInfo, uniformData)
      gl.clear(gl.COLOR_BUFFER_BIT)
      twgl.drawBufferInfo(gl, bufferInfo)
      afterDraw()
    })
}


function changeViewModel(){
  const {eyeX, eyeY, eyeZ, x,y,z,upX,upY,upZ} = viewModel
  const eye = Vector3.create(eyeX, eyeY, eyeZ)
  const target = Vector3.create(x,y,z)
  const cameraUp = Vector3.create(upX,upY,upZ)
  const camera = Matrix4.lookAt(eye, target, cameraUp)
  const projection = Matrix4.perspective(angleToRads(30), 1, 1, 100)
  const viewMat = Matrix4.inverse(camera)
  const pv = Matrix4.multiply(projection, viewMat)
  return pv
}


function injectOptions (gl:WebGLRenderingContext, n: number){
  const updateUI = (id: string, text: string)=>{
    const dom = document.getElementById(id)
    if(dom!==null){
      dom.innerHTML = ''+text
    }
  }
  const html = `
      <label for="eyeX" class="form-label">cameraX: <span id="cameraX">${viewModel.eyeX}</span></label>
      <input type="range" class="form-range" value="${viewModel.eyeX}" step="0.1" min="-10" max="10" id="eyeX">
      <label for="eyeY" class="form-label">cameraY: <span id="cameraY">${viewModel.eyeY}</span></label>
      <input type="range" class="form-range" value="${viewModel.eyeY}" step="0.1" min="-10" max="10" id="eyeY">
      <label for="eyeZ" class="form-label">cameraZ: <span id="cameraZ">${viewModel.eyeZ}</span></label>
      <input type="range" class="form-range" value="${viewModel.eyeZ}" step="0.1" min="-10" max="10" id="eyeZ">
  `
  const div = document.createElement('div')
  div.innerHTML = html
  div.style.position = 'absolute'
  div.style.top = '0px'
  div.style.width = '410px'
  div.style.right = '0px'
  document.body.appendChild(div)
  const eyeX = document.getElementById('eyeX')
  if(eyeX){
    eyeX.addEventListener('change', e=>{
      if(e && e.target && e.target.value){
        console.log(e.target.value);
        viewModel.eyeX= e.target.value
        updateUI('cameraX', ''+viewModel.eyeX)
        redraw()
      }
    })
  }
  const eyeY = document.getElementById('eyeY')
  if(eyeY){
    eyeY.addEventListener('change', e=>{
      console.log(e.target.value);
        viewModel.eyeY=e.target.value
        updateUI('cameraY', ''+viewModel.eyeY)
        redraw()
    })
  }
  const eyeZ = document.getElementById('eyeZ')
  if(eyeZ){
    eyeZ.addEventListener('change', e=>{
      console.log(e.target.value);
        viewModel.eyeZ=e.target.value
        updateUI('cameraZ', ''+viewModel.eyeZ)
        redraw()
    })
  }
}



export default main
