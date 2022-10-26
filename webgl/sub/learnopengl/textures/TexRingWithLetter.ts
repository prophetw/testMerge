import FSHADER_SOURCE from './TexRingWithLetter.frag'
import VSHADER_SOURCE from './TexRingWithLetter.vert'
import * as twgl from 'twgl.js'
import { angleToRads } from '../../lib/utils'

const Matrix4 = twgl.m4
const Vector3 = twgl.v3
const Primitive = twgl.primitives


let bufferInfo: twgl.BufferInfo
let cameraPos = Vector3.create(0, 0, 5)
let u_matrix = Matrix4.identity() // model view project matrix4
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
        console.log(' load ');
        ctx.drawImage(image, 0, 0, width, height);
        ctx.font = `${width * 0.7}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = textColor;
        ctx.fillText(text, width / 2, height / 2);
        resolve(ctx)
      });
    }else{
      ctx.fillStyle = "rgba(0,0,0,0)";
      ctx.globalAlpha = 0.5;
      ctx.fillRect(0,0,128,128);
      ctx.font = `${width * 0.5}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = textColor;
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
    { faceColor: '#F00', textColor: 'rgba(1.0,0,0,0.5)', text: '东' },
    { faceColor: '#FF0', textColor: 'rgba(1.0,0,0,0.5)', text: '南' },
    { faceColor: '#0F0', textColor: 'rgba(1.0,0,0,0.5)', text: '西' },
    { faceColor: '#0FF', textColor: 'rgba(1.0,0,0,0.5)', text: '北' },
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
    console.log(' text ----- ', text);
    const img = await getImgEle(ctx)
    img.imgElement.alt = text
    imgAry.push(img)
  }));
  console.log(' canvas ', imgAry);
  return imgAry
}

function getImgEleBy(imgAry: {imgElement: HTMLImageElement, imgUrl: string}[], alt: string){
  // let targetImg: HTMLImageElement = document.createElement('img')
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
  console.log(' cavas', imgAry);

  var canvas = document.getElementById('webgl') as HTMLCanvasElement;
  // Get the rendering context for WebGL
  var gl = canvas.getContext('webgl',  { antialias: false, preserveDrawingBuffer: true});
  if (gl === null) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  const planeBufferInfo = Primitive.createPlaneBufferInfo(gl, 0.2, 1.0)
  console.log(' ---- planeBufferInfo', planeBufferInfo);

  const programInfo = twgl.createProgramInfo(gl, [VSHADER_SOURCE, FSHADER_SOURCE])
  console.log(' programInfo ==== ', programInfo);

  // Specify the color for clearing <canvas>
  // window.spector.startCapture(canvas, 200)
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST)

  draw(gl, programInfo)

  canvas.addEventListener('click', (e: MouseEvent)=>{
    console.log(' click gl is ', gl);
    const {offsetX, offsetY, clientX, clientY} = e
    console.log(offsetX, offsetY, clientX, clientY);
    const rect  = canvas.getBoundingClientRect()
    const x_in_canvas = clientX - rect.left
    // 屏幕坐标系统  左上角 （0,0）  右下角 (x,y)
    // webgl   从左向右  0 => x    从下往上是  0 => y
    // x 轴是同方向的
    // y 轴是相反的 需要对 x 轴做镜像反转
    const y_in_canvas = rect.bottom - clientY
    console.log(rect);
    const pix = new Uint8Array(4)
    draw(gl, programInfo, imgAry);

    console.log(' [x_in_canvas, y_in_canvas] ', [x_in_canvas, y_in_canvas]);
    gl.readPixels(x_in_canvas, y_in_canvas, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pix)
    console.log(' pix  ', pix);
  })
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

function drawA(
  gl: WebGLRenderingContext, programInfo:
  twgl.ProgramInfo,
  imgAry: {imgElement: HTMLImageElement, imgUrl: string}[]
  ){
  gl.useProgram(programInfo.program)
  const vertics = [
    // vert            // texCoord
    -0.5, -0.5,  -0.5,
    -0.5,  0.5,  -0.5,
     0.5, -0.5,  -0.5,
    -0.5,  0.5,  -0.5,
     0.5,  0.5,  -0.5,
     0.5, -0.5,  -0.5,

    -0.5, -0.5,   0.5,
     0.5, -0.5,   0.5,
    -0.5,  0.5,   0.5,
    -0.5,  0.5,   0.5,
     0.5, -0.5,   0.5,
     0.5,  0.5,   0.5,

    -0.5,   0.5, -0.5,
    -0.5,   0.5,  0.5,
     0.5,   0.5, -0.5,
    -0.5,   0.5,  0.5,
     0.5,   0.5,  0.5,
     0.5,   0.5, -0.5,

    -0.5,  -0.5, -0.5,
     0.5,  -0.5, -0.5,
    -0.5,  -0.5,  0.5,
    -0.5,  -0.5,  0.5,
     0.5,  -0.5, -0.5,
     0.5,  -0.5,  0.5,

    -0.5,  -0.5, -0.5,
    -0.5,  -0.5,  0.5,
    -0.5,   0.5, -0.5,
    -0.5,  -0.5,  0.5,
    -0.5,   0.5,  0.5,
    -0.5,   0.5, -0.5,

     0.5,  -0.5, -0.5,
     0.5,   0.5, -0.5,
     0.5,  -0.5,  0.5,
     0.5,  -0.5,  0.5,
     0.5,   0.5, -0.5,
     0.5,   0.5,  0.5,
  ]
  const attr = {
    a_position: {
      data: vertics,
      size: 3,
    }
  }
  const bufferInfo = twgl.createBufferInfoFromArrays(gl, attr)
  console.log(' bufferInfo ', bufferInfo);
  twgl.setBuffersAndAttributes(gl, programInfo,  bufferInfo)

  const imgNewAry = [
    getImgEleBy(imgAry, '右'),
    getImgEleBy(imgAry, '左'),
    getImgEleBy(imgAry, '上'),
    getImgEleBy(imgAry, '下'),
    getImgEleBy(imgAry, '前'),
    getImgEleBy(imgAry, '后'),
  ]
  twgl.createTextures(gl, {
    tex: {
      target: gl.TEXTURE_CUBE_MAP,
      src: imgNewAry,
    },
  }, (err, textures)=>{
    if(err){
      throw new Error('twgl.createTextures error ')
    }
    updateMVPMatrix(0)
    const uniformData = {
      u_matrix,
      u_texture: textures.tex
    }
    twgl.setUniforms(programInfo, uniformData)
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT)
    twgl.drawBufferInfo(gl, bufferInfo)
  })

}


export default main
