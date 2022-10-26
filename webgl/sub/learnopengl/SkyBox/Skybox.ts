import FSHADER_SOURCE from './Skybox.frag'
import VSHADER_SOURCE from './Skybox.vert'
import * as twgl from 'twgl.js'
import { angleToRads } from '../../lib/utils'
const Matrix4 = twgl.m4
const Vector3 = twgl.v3


type ColorRGB = [number, number, number]
type TranslateXYZ = [number, number, number]
type AngelType = 'X' | 'Y' | 'Z'
type CubeInfo = [number,number,number, number, AngelType]
// cube transform  [x,y,z,angle,angelType]
const cubePosi: CubeInfo[] = [
  // [ 0.0,  0.0,  0.0, 15, 'X'],
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
  z: 0
}
// camera look at somePoint
const targetPosition = {
  x: 0,
  y: 0,
  z: -100
}

const cameraFrontVec = [0,0,-1]
let cameraFront = Vector3.create(...cameraFrontVec)

const perspectiveOptions = {
  fov: 45,
  aspect: 1,
  near: 0.1,
  far: 100
}

const lightColor: ColorRGB = [1.0, 1.0,1.0]
const lightDiffuse: ColorRGB = [lightColor[0]*0.8,lightColor[1]*0.8,lightColor[2]*0.8]
const lightAmbient: ColorRGB = [lightColor[0]*0.1,lightColor[1]*0.1,lightColor[2]*0.1]
const lightPosi: TranslateXYZ = [defaultCameraPosition.x, defaultCameraPosition.y, defaultCameraPosition.z]
const lightDir = cameraFront

let programInfo: twgl.ProgramInfo
let glBufferInfo: twgl.BufferInfo

function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl') as HTMLCanvasElement;

  document.title='Spot Light'
  // Get the rendering context for WebGL
  var gl = window .getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  programInfo = twgl.createProgramInfo(gl, [VSHADER_SOURCE, FSHADER_SOURCE])
  console.log(' --- programInfo', programInfo);

  // Specify the color for clearing <canvas>
  gl.clearColor(0.1, 0.1, 0.1, 1.0);
  // depth test
  // gl.enable(gl.DEPTH_TEST)


  gl.depthMask(false)
  draw(gl, programInfo)
  gl.depthMask(true)
  // window.spector.startCapture(canvas, 100)
  // drawLightCube(gl, programInfo2)

  enableCamera(canvas, gl, programInfo)
  injectUI(gl, programInfo)
}

function redraw(gl: WebGLRenderingContext, pInfo: twgl.ProgramInfo){
    gl.enable(gl.DEPTH_TEST)
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.useProgram(pInfo.program)
    twgl.setBuffersAndAttributes(gl, pInfo, glBufferInfo)
    // for(let i=0;i<cubePosi.length;i++){
      let cubInfo = cubePosi[0]
      updateMVP(gl, pInfo, cubInfo)
      gl.drawArrays(gl.TRIANGLES, 0, 36)
    // }
}

function updateMVP(
  gl: WebGLRenderingContext,
  pInfo: twgl.ProgramInfo,
  cubeInfo: CubeInfo
  ){
  const cameraPos = Vector3.create(defaultCameraPosition.x, defaultCameraPosition.y, defaultCameraPosition.z)
  const cameraUp = Vector3.create(0,1,0)
  const [x,y,z,angle, angleType] = cubeInfo
  const view = Matrix4.inverse(Matrix4.lookAt(cameraPos, Vector3.add(cameraPos, cameraFront), cameraUp))
  const projection = Matrix4.perspective(angleToRads(perspectiveOptions.fov), perspectiveOptions.aspect, perspectiveOptions.near, perspectiveOptions.far)
  const model = Matrix4.identity()

  const uniformData = {
    model,
    view,
    projection,
  }
  twgl.setUniforms(pInfo, uniformData)
}

function draw(gl: WebGLRenderingContext, pInfo: twgl.ProgramInfo){
  gl.useProgram(pInfo.program)
  var verticesTexCoords = [
   // Vertex
   -1.0,  1.0, -1.0,
    -1.0, -1.0, -1.0,
     1.0, -1.0, -1.0,
     1.0, -1.0, -1.0,
     1.0,  1.0, -1.0,
    -1.0,  1.0, -1.0,

    -1.0, -1.0,  1.0,
    -1.0, -1.0, -1.0,
    -1.0,  1.0, -1.0,
    -1.0,  1.0, -1.0,
    -1.0,  1.0,  1.0,
    -1.0, -1.0,  1.0,

     1.0, -1.0, -1.0,
     1.0, -1.0,  1.0,
     1.0,  1.0,  1.0,
     1.0,  1.0,  1.0,
     1.0,  1.0, -1.0,
     1.0, -1.0, -1.0,

    -1.0, -1.0,  1.0,
    -1.0,  1.0,  1.0,
     1.0,  1.0,  1.0,
     1.0,  1.0,  1.0,
     1.0, -1.0,  1.0,
    -1.0, -1.0,  1.0,

    -1.0,  1.0, -1.0,
     1.0,  1.0, -1.0,
     1.0,  1.0,  1.0,
     1.0,  1.0,  1.0,
    -1.0,  1.0,  1.0,
    -1.0,  1.0, -1.0,

    -1.0, -1.0, -1.0,
    -1.0, -1.0,  1.0,
     1.0, -1.0, -1.0,
     1.0, -1.0, -1.0,
    -1.0, -1.0,  1.0,
     1.0, -1.0,  1.0
  ];

  const attrbs: twgl.Arrays = {
    aPos: {
      data: verticesTexCoords,
      size: 3,
    }
  }
  glBufferInfo = twgl.createBufferInfoFromArrays(gl, attrbs)
  twgl.setBuffersAndAttributes(gl, pInfo, glBufferInfo)

  // loads a cubemap texture from 6 individual texture faces
  // order:
  // +X (right)
  // -X (left)
  // +Y (top)
  // -Y (bottom)
  // +Z (front)
  // -Z (back)

  twgl.createTextures(gl, {
    skybox: {
      src: [
        './resources/skybox/posx.jpg',
        './resources/skybox/negx.jpg',
        './resources/skybox/posy.jpg',
        './resources/skybox/negy.jpg',
        './resources/skybox/negz.jpg',
        './resources/skybox/posz.jpg',
      ],
      // flipY: 1,
      target: gl.TEXTURE_CUBE_MAP,
      min: gl.LINEAR,
      mag: gl.LINEAR,
      // wrapS: gl.CLAMP_TO_EDGE,
      // wrapT: gl.CLAMP_TO_EDGE,
      // wrapR: gl.CLAMP_TO_EDGE,
    },

  }, (err, textures)=>{
    if(err){
      return console.error(err);
    }
    const uniformData = {
      skybox: textures.skybox
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
  defaultCameraPosition.z = 0
  perspectiveOptions.fov = 45
  redraw(gl, pInfo);
}


export default main
