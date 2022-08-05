import FSHADER_SOURCE from './Tex.frag'
import VSHADER_SOURCE from './Tex.vert'
import FSRING from './Ring.frag'
import VSRING from './Ring.vert'
import * as twgl from 'twgl.js'
import { angleToRads } from '../../lib/utils'

const Matrix4 = twgl.m4
const Vector3 = twgl.v3
type DirName = 'E' | 'W' | 'S' | 'N'

let ringBufferInfo: twgl.BufferInfo
let ringPInfo: twgl.ProgramInfo
let dirBufferInfo: {
  [key: string]: {
    bufferInfo?: twgl.BufferInfo,
    texture?: WebGLTexture
  }
} = {
  E: {},
  N: {},
  S: {},
  W: {},
}
let cameraPos = Vector3.create(0, 3, 5)
let u_matrix = Matrix4.identity() // model view project matrix4
let u_ringmatrix = Matrix4.identity() // model view project matrix4
let imgAry: {
  imgElement: HTMLImageElement;
  imgUrl: string;
}[]

// 借鉴自 https://webglfundamentals.org/webgl/lessons/webgl-cube-maps.html

// 鼠标移入 高亮部分
// 圆环 上下左右有文字 并且文字 hover 会有高亮效果

const generateFace = (
  ctx: CanvasRenderingContext2D,
  faceColor: string,
  textColor: string,
  text: string,
  bgImgSrc?: string
) => {
  return new Promise((resolve, reject)=>{
    const {width, height} = ctx.canvas;
    if(bgImgSrc){
      const image = document.createElement('img');
      image.src = bgImgSrc
      image.addEventListener('load', (e) => {
        ctx.drawImage(image, 0, 0, width, height);
        ctx.font = `${width * 0.7}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = textColor;
        ctx.fillText(text, width / 2, height / 2);
        resolve(ctx)
      });
    }else{
      ctx.fillStyle = faceColor;
      ctx.globalAlpha = 1.0;
      ctx.fillRect(0,0,128,128);
      ctx.font = `${width * 0.7}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = "#EEE";
      ctx.fillText(text, width / 2, height / 2);
      resolve(ctx)
    }
  })
}
const getImgEle = async (ctx: CanvasRenderingContext2D): Promise<{imgElement: HTMLImageElement
  imgUrl: string
}> => {
  return new Promise((resolve, reject)=>{
    const imgUrl = ctx.canvas.toDataURL()
    ctx.canvas.toBlob((blob) => {
      if(blob){
        const img = new Image();
        img.src = URL.createObjectURL(blob);
        document.body.appendChild(img);
        img.onload = ()=>{
          resolve({
            imgElement: img,
            imgUrl: imgUrl
          })
        }
      }
    });
  })
}
const gImg = async (): Promise<{imgElement: HTMLImageElement, imgUrl: string}[]>=>{
  const faceInfos = [
    { faceColor: 'rgba(0,0,0,0)', textColor: '#FFF', text: '东' },
    { faceColor: 'rgba(0,0,0,0)', textColor: '#FFF', text: '南' },
    { faceColor: 'rgba(0,0,0,0)', textColor: '#FFF', text: '西' },
    { faceColor: 'rgba(0,0,0,0)', textColor: '#FFF', text: '北' },
  ];
  const imgAry: {imgElement: HTMLImageElement, imgUrl: string}[] = []
  await Promise.all(faceInfos.map(async (faceInfo) => {
    const ctx = document.createElement("canvas").getContext("2d");
    if(ctx ===null) return []
    ctx.canvas.width = 128;
    ctx.canvas.height = 128;

    const {faceColor, textColor, text} = faceInfo;
    // await generateFace(ctx, faceColor, textColor, text, './resources/tex4.jpg');
    await generateFace(ctx, faceColor, textColor, text);
    // show the result
    const img = await getImgEle(ctx)
    img.imgElement.alt = text
    imgAry.push(img)
  }));
  return imgAry
}

function getImgEleBy(imgAry: {imgElement: HTMLImageElement, imgUrl: string}[], alt: string){
  // let targetImg: HTMLImageElement = document.createElement('img')
  if(alt === 'E'){
    alt = '东'
  }
  if(alt === 'W'){
    alt = '西'
  }
  if(alt === 'N'){
    alt = '北'
  }
  if(alt === 'S'){
    alt = '南'
  }
  let url = ''
  imgAry.map(img=>{
    if(img.imgElement.alt === alt){
      url = img.imgUrl
    }
  })
  return url
}


async function main() {
  // Retrieve <canvas> element

  imgAry = await gImg()
  console.log(' img ', imgAry);

  var canvas = document.getElementById('webgl') as HTMLCanvasElement;
  // Get the rendering context for WebGL
  var gl = canvas.getContext('webgl',  { antialias: false, preserveDrawingBuffer: true});
  if (gl === null) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  const programInfo = twgl.createProgramInfo(gl, [VSHADER_SOURCE, FSHADER_SOURCE])


  ringPInfo = twgl.createProgramInfo(gl, [VSRING, FSRING])

  console.log(' tex programInfo ==== ', programInfo);
  console.log(' ring program info ',  ringPInfo);

  // Specify the color for clearing <canvas>
  // window.spector.startCapture(canvas, 200)
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST)
  gl.enable(gl.BLEND)
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    // window.spector.startCapture(canvas, 200)
  drawRing(gl, ringPInfo)
  drawTex(gl, programInfo)
  enableCamera(canvas, gl, programInfo)
  canvas.addEventListener('click', e=>{
    const {offsetX, offsetY, clientX, clientY} = e
    const rect  = canvas.getBoundingClientRect()
    const x_in_canvas = clientX - rect.left
    const y_in_canvas = rect.bottom - clientY
    // const pix = new Uint8Array(4)
    // if(gl){
    //   gl.readPixels(x_in_canvas, y_in_canvas, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pix)
    //   console.log(' pix  ', pix);
    // }
    // if(gl){
    //   gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    //   redraw(gl, programInfo)
    // }
    if(gl){
      check(gl, programInfo, x_in_canvas, y_in_canvas)
    }
  })
}

function redrawTex(gl: WebGLRenderingContext,pInfo: twgl.ProgramInfo){
  const dirAry: DirName[] = ['E', 'N', 'S', 'W']
  dirAry.map(dir=>{
    updateTexMVPMatrix(dir)
    const info = dirBufferInfo[dir]
    twgl.setUniforms(pInfo,{
      u_matrix,
    })
    if(info.texture){
      twgl.setUniforms(pInfo,{
        u_texture: info.texture
      })
    }
    if(info.bufferInfo){
      twgl.setBuffersAndAttributes(gl, pInfo, info.bufferInfo)
      twgl.drawBufferInfo(gl, info.bufferInfo)
    }
  })
}

function redrawRing(gl: WebGLRenderingContext){
  twgl.setBuffersAndAttributes(gl, ringPInfo, ringBufferInfo)
  twgl.drawBufferInfo(gl, ringBufferInfo)
}

function check(gl: WebGLRenderingContext, pInfo: twgl.ProgramInfo, x: number, y: number){
  // redraw tex
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  gl.useProgram(pInfo.program)
  gl.disable(gl.BLEND)
  twgl.setUniforms(pInfo, {
    u_SelectFace: 0
  })
  redrawTex(gl, pInfo)
  // redraw ring
  gl.useProgram(ringPInfo.program)
  twgl.setUniforms(ringPInfo, {
    u_SelectFace: 0
  })
  redrawRing(gl)


  const pix = new Uint8Array(4)
  gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pix)
  const a_Face = pix[3]

  // draw cube
  gl.enable(gl.BLEND)
  gl.useProgram(pInfo.program)
  twgl.setUniforms(pInfo, {
    u_SelectFace: a_Face
  })
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  redrawTex(gl, pInfo)

  // redraw ring
  gl.useProgram(ringPInfo.program)
  twgl.setUniforms(ringPInfo, {
    u_SelectFace: a_Face
  })
  redrawRing(gl)
  console.log(a_Face);

  return a_Face
}

function gRingVert(){
  // 圆环
  const r = 0.85
  const r2 = 0.9
  const n = 100
  const radius = angleToRads(360/n)
  const result = []
  for(let i=0;i<n;i++){
    const pt1Radius = i * radius
    const pt2Radius = (i+1) * radius
    const pt1 = [
      r*Math.sin(pt1Radius),
      -0.0, // y
      r*Math.cos(pt1Radius),
    ]
    const pt2 = [
      r*Math.sin(pt2Radius),
      -0.0,
      r*Math.cos(pt2Radius),
    ]
    const pt3 = [
      r2*Math.sin(pt1Radius),
      -0.0,
      r2*Math.cos(pt1Radius),
    ]
    const pt4 = [
      r2*Math.sin(pt2Radius),
      -0.0,
      r2*Math.cos(pt2Radius),
    ]
    result.push(...pt1,...pt3, ...pt4)
    result.push(...pt1,...pt4,...pt2)
  }
  return result
}


function drawRing(gl: WebGLRenderingContext,pInfo: twgl.ProgramInfo){
  gl.useProgram(pInfo.program)
  const vert = gRingVert()
  const attr = {
    position: {
      data: vert,
      size: 3
    },
    a_Face: {
      data: new Array(vert.length).fill(100),
      size: 1
    }
  }
  ringBufferInfo = twgl.createBufferInfoFromArrays(gl, attr)
  twgl.setBuffersAndAttributes(gl, pInfo, ringBufferInfo)

  updateRingMVPMatrix()
  const uniforms = {
    u_matrix: u_ringmatrix,
    u_SelectFace: -1
  }
  twgl.setUniforms(pInfo, uniforms)
  twgl.drawBufferInfo(gl, ringBufferInfo)
}

function updateRingMVPMatrix(){
  let modelMatrix = Matrix4.identity(); // Model matrix
  // Matrix4.scale(modelMatrix, Vector3.create(0.2,0.2,0.2), modelMatrix)
  const eye = cameraPos
  const target = Vector3.create(0, 0, 0)
  const cameraUp = Vector3.create(0, 1, 0)
  const camera = Matrix4.lookAt(eye, target, cameraUp);
  const viewMatrix = Matrix4.inverse(camera)
  const projection = Matrix4.perspective(angleToRads(30), 1, 1, 100);
  // Calculate the model view projection matrix
  const viewProj = Matrix4.multiply(projection, viewMatrix)
  u_ringmatrix = Matrix4.multiply(viewProj, modelMatrix)
}
function redraw(gl: WebGLRenderingContext,pInfo: twgl.ProgramInfo){
  gl.useProgram(pInfo.program)
  const dirAry: DirName[] = ['E', 'N', 'S', 'W']
  dirAry.map(dir=>{
    updateTexMVPMatrix(dir)
    const info = dirBufferInfo[dir]
    twgl.setUniforms(pInfo,{
      u_matrix,
    })
    if(info.texture){
      twgl.setUniforms(pInfo,{
        u_texture: info.texture
      })
    }
    if(info.bufferInfo){
      twgl.setBuffersAndAttributes(gl, pInfo, info.bufferInfo)
      twgl.drawBufferInfo(gl, info.bufferInfo)
    }
  })

  gl.useProgram(ringPInfo.program)
  twgl.setBuffersAndAttributes(gl, ringPInfo, ringBufferInfo)
  updateRingMVPMatrix()
  twgl.setUniforms(ringPInfo, {
    u_matrix: u_ringmatrix
  })
  twgl.drawBufferInfo(gl, ringBufferInfo)
}

function drawTex (gl: WebGLRenderingContext,pInfo: twgl.ProgramInfo){
  gl.useProgram(pInfo.program)

  const imgUrlAry = [
    getImgEleBy(imgAry, 'S'),
    getImgEleBy(imgAry, 'N'),
    getImgEleBy(imgAry, 'E'),
    getImgEleBy(imgAry, 'W'),
  ]
  twgl.createTextures(gl, {
    S: {
      src: imgUrlAry[0],
    },
    N: {
      src: imgUrlAry[1],
    },
    E: {
      src: imgUrlAry[2],
    },
    W: {
      src: imgUrlAry[3],
    },
  }, (err, textures)=>{
    if(err){
      throw new Error('twgl.createTextures error ')
    }
    const dirAry: DirName[] = ['S','N','E','W']
    dirAry.map((dirName: DirName, index)=>{
      const vert = {
        position: {
          data: [
            -0.5,0,-0.5, -0.5,0,0.5, 0.5,0,0.5,
            -0.5,0,-0.5, 0.5,0,0.5,  0.5,0,-0.5
          ],
          size: 3,
        },
        texcoord: {
          data: [
            0,0, 0,1, 1,1,
            0,0, 1,1, 1,0
          ],
          size: 2
        },
        a_Face: {
          data: new Array(18).fill(40+index)
        }
      }
      const planeBufferInfo = twgl.createBufferInfoFromArrays(gl, vert)
      twgl.setBuffersAndAttributes(gl, pInfo,  planeBufferInfo)
      updateTexMVPMatrix(dirName)
      const unif = {
        u_matrix,
        u_texture: textures[dirName],
        u_SelectFace: -1
      }
      dirBufferInfo[dirName].texture = textures[dirName]
      dirBufferInfo[dirName].bufferInfo = planeBufferInfo
      twgl.setUniforms(pInfo, unif)
      twgl.drawBufferInfo(gl, planeBufferInfo)
    })
  })
}

function updateTexMVPMatrix(direction: DirName){
  let modelMatrix = Matrix4.identity(); // Model matrix
  // 正下
  switch (direction){
    case 'E':
    Matrix4.translate(modelMatrix, Vector3.create(0,0,1), modelMatrix)
    break
    case 'W':
    Matrix4.translate(modelMatrix, Vector3.create(0,0,-1), modelMatrix)
    Matrix4.rotateY(modelMatrix, Math.PI, modelMatrix)
    break
    case 'S':
    Matrix4.translate(modelMatrix, Vector3.create(1,0,0), modelMatrix)
    Matrix4.rotateY(modelMatrix, Math.PI/2, modelMatrix)
    break
    case 'N':
    Matrix4.translate(modelMatrix, Vector3.create(-1,0,0), modelMatrix)
    Matrix4.rotateY(modelMatrix, -Math.PI/2, modelMatrix)
    break
    default:
    break;
  }

  Matrix4.scale(modelMatrix, Vector3.create(0.2,0.2,0.2), modelMatrix)
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

      const frontCamVec3 = Vector3.create(frontCamX, frontCamY, frontCamZ)
      cameraPos = frontCamVec3
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
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

export default main
