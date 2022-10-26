import FSHADER_SOURCE from './CameraMoving.frag'
import VSHADER_SOURCE from './CameraMoving.vert'
import * as twgl from 'twgl.js'
import { angleToRads } from '../../lib/utils'
const Matrix4 = twgl.m4
const Vector3 = twgl.v3

type AngelType = 'X' | 'Y' | 'Z'
type CubeInfo = [number,number,number, number, AngelType]
// cube transform  [x,y,z,angle,angelType]
const cubePosi: CubeInfo[] = [
  [ 0.0,  0.0,  0.0, 15, 'X'],
  [ 2.0,  5.0, -15.0, 30, 'Y'],
  [-1.5, -2.2, -2.5, 60, 'Z'],
  [-3.8, -2.0, -12.3, 10, 'Y'],
  [ 2.4, -0.4, -3.5, 20, 'X'],
  [-1.7,  3.0, -7.5, 80, 'Y'],
  [ 1.3, -2.0, -2.5, 70, 'Z'],
  [ 1.5,  2.0, -2.5, 0, 'Z'],
  [ 1.5,  0.2, -1.5, 45, 'X'],
  [-1.3,  1.0, -1.5, 45, 'Y']
]
const defaultCameraPosition = {
  x: 0,
  y: 0,
  z: 5
}
// camera look at somePoint
const targetPosition = {
  x: 0,
  y: 0,
  z: -100
}

let cameraFront = Vector3.create(0,0,-1)

const perspectiveOptions = {
  fov: 45,
  aspect: 1,
  near: 0.1,
  far: 100
}

function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl') as HTMLCanvasElement;

  document.title='moving camera twgl '
  // Get the rendering context for WebGL
  var gl = window.getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  const programInfo = twgl.createProgramInfo(gl, [VSHADER_SOURCE, FSHADER_SOURCE])
  console.log(' --- programInfo', programInfo);

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  // depth test
  // gl.enable(gl.DEPTH_TEST)


  draw(gl, programInfo)

  enableCamera(canvas, gl, programInfo)
  injectUI(gl, programInfo)
}

function redraw(gl: WebGLRenderingContext, pInfo: twgl.ProgramInfo){
    gl.enable(gl.DEPTH_TEST)
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    for(let i=0;i<cubePosi.length;i++){
      let cubInfo = cubePosi[i]
      updateMVP(gl, pInfo, cubInfo)
      gl.drawArrays(gl.TRIANGLES, 0, 36)
    }
}

function updateMVP(
  gl: WebGLRenderingContext,
  pInfo: twgl.ProgramInfo,
  cubeInfo: CubeInfo
  ){
  const cameraPos = Vector3.create(defaultCameraPosition.x, defaultCameraPosition.y, defaultCameraPosition.z)
  const cameraUp = Vector3.create(0,1,0)
  const [x,y,z,angle, angleType] = cubeInfo
  const model = Matrix4.setTranslation(Matrix4.identity(), Vector3.create(x,y,z))
  const view = Matrix4.inverse(Matrix4.lookAt(cameraPos, Vector3.add(cameraPos, cameraFront), cameraUp))
  const projection = Matrix4.perspective(angleToRads(perspectiveOptions.fov), perspectiveOptions.aspect, perspectiveOptions.near, perspectiveOptions.far)
  const uniformData = {
    u_MvpMatrix4: Matrix4.multiply(projection,Matrix4.multiply(view, model)),
  }
  twgl.setUniforms(pInfo, uniformData)
}


function draw(gl: WebGLRenderingContext, pInfo: twgl.ProgramInfo){

  gl.useProgram(pInfo.program)
  // gl.clear(gl.COLOR_BUFFER_BIT)

  var verticesTexCoords = [
    //    Vertex,           Color           texture coordinate
   //     ---- 位置 ----       ---- 颜色 ----     - 纹理坐标 -
   -0.5, -0.5, -0.5,  0.0, 0.0,
   0.5, -0.5, -0.5,  1.0, 0.0,
   0.5,  0.5, -0.5,  1.0, 1.0,
   0.5,  0.5, -0.5,  1.0, 1.0,
  -0.5,  0.5, -0.5,  0.0, 1.0,
  -0.5, -0.5, -0.5,  0.0, 0.0,

  -0.5, -0.5,  0.5,  0.0, 0.0,
   0.5, -0.5,  0.5,  1.0, 0.0,
   0.5,  0.5,  0.5,  1.0, 1.0,
   0.5,  0.5,  0.5,  1.0, 1.0,
  -0.5,  0.5,  0.5,  0.0, 1.0,
  -0.5, -0.5,  0.5,  0.0, 0.0,

  -0.5,  0.5,  0.5,  1.0, 0.0,
  -0.5,  0.5, -0.5,  1.0, 1.0,
  -0.5, -0.5, -0.5,  0.0, 1.0,
  -0.5, -0.5, -0.5,  0.0, 1.0,
  -0.5, -0.5,  0.5,  0.0, 0.0,
  -0.5,  0.5,  0.5,  1.0, 0.0,

   0.5,  0.5,  0.5,  1.0, 0.0,
   0.5,  0.5, -0.5,  1.0, 1.0,
   0.5, -0.5, -0.5,  0.0, 1.0,
   0.5, -0.5, -0.5,  0.0, 1.0,
   0.5, -0.5,  0.5,  0.0, 0.0,
   0.5,  0.5,  0.5,  1.0, 0.0,

  -0.5, -0.5, -0.5,  0.0, 1.0,
   0.5, -0.5, -0.5,  1.0, 1.0,
   0.5, -0.5,  0.5,  1.0, 0.0,
   0.5, -0.5,  0.5,  1.0, 0.0,
  -0.5, -0.5,  0.5,  0.0, 0.0,
  -0.5, -0.5, -0.5,  0.0, 1.0,

  -0.5,  0.5, -0.5,  0.0, 1.0,
   0.5,  0.5, -0.5,  1.0, 1.0,
   0.5,  0.5,  0.5,  1.0, 0.0,
   0.5,  0.5,  0.5,  1.0, 0.0,
  -0.5,  0.5,  0.5,  0.0, 0.0,
  -0.5,  0.5, -0.5,  0.0, 1.0
  ];
  var n = 36;
  const elementSize = new Float32Array().BYTES_PER_ELEMENT
  const attrbs: twgl.Arrays = {
    a_Position: {
      data: verticesTexCoords,
      size: 3,
      stride: 5 * elementSize,
      offset: 0
    },
    a_TexCoord: {
      data: verticesTexCoords,
      size: 2,
      stride: 5 * elementSize,
      offset: 3 * elementSize
    }
  }
  const bufferInfo = twgl.createBufferInfoFromArrays(gl, attrbs)
  twgl.setBuffersAndAttributes(gl, pInfo, bufferInfo)

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
      return console.error(err);
    }
    const uniformData = {
      u_MixVal: 0.2,
      u_Sampler0: textures.wood,
      u_Sampler1: textures.face,
    }
    twgl.setUniforms(pInfo, uniformData)
    redraw(gl, pInfo)
    // twgl.drawBufferInfo(gl, bufferInfo, gl.TRIANGLES, 36)
  })

}

function enableCamera (
  canvas: HTMLCanvasElement,
  gl: WebGLRenderingContext,
  pInfo: twgl.ProgramInfo
  ) {
  console.log(' enable came');
  // scroll event   => change camera z
  canvas.addEventListener('wheel', (e)=>{
    const {deltaY} = e
    const step = 5
    if(deltaY>0){
      // zoom out
      // defaultCameraPosition.z += 0.1
      const newFov = perspectiveOptions.fov + step
      perspectiveOptions.fov = Math.min(45, newFov)
      redraw(gl, pInfo)
    }else{
      // zoom in
      // defaultCameraPosition.z -= 0.1
      const newFov = perspectiveOptions.fov-step
      perspectiveOptions.fov = Math.max(1, newFov)
      redraw(gl, pInfo)
    }
  })
  // arrow left right up down
  document.addEventListener('keyup', (e: KeyboardEvent)=>{
    const {key} = e
    switch(key){
      case 'ArrowLeft': defaultCameraPosition.x -= 0.1; redraw(gl, pInfo); break;
      case 'ArrowRight': defaultCameraPosition.x += 0.1; redraw(gl, pInfo); break;
      case 'ArrowUp': defaultCameraPosition.z += 0.1; redraw(gl, pInfo); break;
      case 'ArrowDown': defaultCameraPosition.z -= 0.1; redraw(gl, pInfo); break;
      default: break;
    }
  })
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

      const frontCamX = Math.cos(angleToRads(yaw)) * Math.cos(angleToRads(pitch))
      const frontCamY = Math.sin(angleToRads(pitch))
      const frontCamZ = Math.sin(angleToRads(yaw)) * Math.cos(angleToRads(pitch))

      const frontCamVec3 = Vector3.create(frontCamX, frontCamY, frontCamZ)
      const camFront = Vector3.normalize(frontCamVec3)
      cameraFront = camFront
      redraw(gl, pInfo)
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


function injectUI(gl: WebGLRenderingContext, pInfo: twgl.ProgramInfo){
  const div = document.createElement('div')
  const html = `
    <button id="resetCamera">resetCamera</button>
  `
  div.innerHTML = html
  document.body.appendChild(div)
  document.getElementById('resetCamera')?.addEventListener('click', ()=>{
    resetCameraPosition(gl, pInfo)
  })
}

function resetCameraPosition(gl: WebGLRenderingContext, pInfo: twgl.ProgramInfo){
  defaultCameraPosition.x = 0
  defaultCameraPosition.y = 0
  defaultCameraPosition.z = 5
  perspectiveOptions.fov = 45
  redraw(gl, pInfo);
}


export {
  enableCamera
}

export default main
