import FSHADER_SOURCE from './TexLetter.twgl2.frag'
import VSHADER_SOURCE from './TexLetter.twgl2.vert'
import * as twgl from 'twgl.js'
import { angleToRads } from '../../lib/utils'

type AreaType = [number, number]
type FaceType = 'left' | 'right' | 'top' | 'bottom' | 'front' | 'back'
type Point = [number, number, number]
type XYZArea = {
  x: AreaType   // 范围
  y: AreaType   //
  z: AreaType
}

interface FaceInfo {
  vertex: Point[]
  faceIdAry: number[];
  normal: Point;
  pointOnPlane: Point;
  name: FaceType
  area: XYZArea
  faceArea: XYZArea[]
}

const Matrix4 = twgl.m4
const Vector3 = twgl.v3

let u_matrix = Matrix4.identity() // model view project matrix4
let bufferInfo: twgl.BufferInfo


// 借鉴自 https://webglfundamentals.org/webgl/lessons/webgl-cube-maps.html

// 鼠标点击 可以高亮




async function main() {
  // Retrieve <canvas> element

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
        ctx.clearRect(0,0,128,128)
        ctx.fillStyle = faceColor;
        ctx.fillRect(0,0,128,128)
        ctx.font = `${width * 0.7}px sans-serif`;
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
          // document.body.appendChild(img);
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
      { faceColor: '#F00', textColor: '#FFF', text: '右' },
      { faceColor: '#FF0', textColor: '#FFF', text: '左' },
      { faceColor: '#0F0', textColor: '#FFF', text: '上' },
      { faceColor: '#0FF', textColor: '#FFF', text: '下' },
      { faceColor: '#00F', textColor: '#FFF', text: '前' },
      { faceColor: '#F0F', textColor: '#FFF', text: '后' },
    ];
    const imgAry: {imgElement: HTMLImageElement, imgUrl: string}[] = []
    await Promise.all(faceInfos.map(async (faceInfo) => {
      const ctx = document.createElement("canvas").getContext("2d");
      if(ctx ===null) return []
      ctx.canvas.width = 128;
      ctx.canvas.height = 128;
      const {faceColor, textColor, text} = faceInfo;
      await generateFace(ctx, faceColor, textColor, text, './resources/tex4.jpg');
      // await generateFace(ctx, faceColor, textColor, text);
      // show the result
      const img = await getImgEle(ctx)
      img.imgElement.alt = text
      imgAry.push(img)
    }));
    return imgAry
  }

  const imgAry = await gImg()
  console.log(' cavas', imgAry);

  var canvas = document.getElementById('webgl') as HTMLCanvasElement;
  // Get the rendering context for WebGL
  var gl = canvas.getContext('webgl',  { antialias: false, preserveDrawingBuffer: true});
  if (gl === null) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  const programInfo = twgl.createProgramInfo(gl, [VSHADER_SOURCE, FSHADER_SOURCE])
  console.log(' programInfo ==== ', programInfo);

  // Specify the color for clearing <canvas>
  // window.spector.startCapture(canvas, 200)
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST)
  gl.enable(gl.BLEND)
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

  draw(gl, programInfo, imgAry)

  canvas.addEventListener('click', (e: MouseEvent)=>{
    const {offsetX, offsetY, clientX, clientY} = e
    const rect  = canvas.getBoundingClientRect()
    const x_in_canvas = clientX - rect.left
    // 屏幕坐标系统  左上角 （0,0）  右下角 (x,y)
    // webgl   从左向右  0 => x    从下往上是  0 => y
    // x 轴是同方向的
    // y 轴是相反的 需要对 x 轴做镜像反转
    const y_in_canvas = rect.bottom - clientY
    const pix = new Uint8Array(4)
    if(gl){
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
      gl.disable(gl.BLEND)
      twgl.setUniforms(programInfo, {
        u_SelectFaceId: 0,
        u_highlightFaceId: -1
      })
      twgl.drawBufferInfo(gl, bufferInfo)

      gl.readPixels(x_in_canvas, y_in_canvas, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pix)
      console.log(' pix  ', pix);

      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
      gl.enable(gl.BLEND)
      twgl.setUniforms(programInfo, {
        u_SelectFaceId: -1,
        u_highlightFaceId: pix[3]
      })
      twgl.drawBufferInfo(gl, bufferInfo)
    }
  })

  canvas.addEventListener('mousemove', (e: MouseEvent)=>{
    const {clientX, clientY} = e
    const rect  = canvas.getBoundingClientRect()
    const x_in_canvas = clientX - rect.left
    const y_in_canvas = rect.bottom - clientY
    const pix = new Uint8Array(4)
    if(gl){
      gl.readPixels(x_in_canvas, y_in_canvas, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pix)
      console.log(' pix  ', pix);
    }
  })
  // animate cube
  // const render = (time: number)=>{
  //   updateMVPMatrix(time)
  //   twgl.setUniforms(programInfo, {
  //     u_matrix
  //   })
  //   gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT)
  //   gl.drawArrays(gl.TRIANGLES, 0, 36)
  //   // requestAnimationFrame(render)
  // }
  // render()
  // requestAnimationFrame(render)
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

function draw(
  gl: WebGLRenderingContext, programInfo:
  twgl.ProgramInfo,
  imgAry: {imgElement: HTMLImageElement, imgUrl: string}[]
  ){
  gl.useProgram(programInfo.program)
  function gVertex(leftTopPt: Point, len: number, whichFace: FaceType){
    // len 正方形边长
    let result: Point[] = []
    const [x, y, z] = leftTopPt
    const step = 0.1
    let area: XYZArea[] = [] // 9个正方形 从左往右  从上往下 每个正方形的 xyz 的范围

    if(whichFace === 'top' || whichFace === 'bottom'){
      // y 坐标固定
      // 位于 xz 面  top   那么就从 立方体上方 观察这个面  向右 x+ 下 z+
      // 位于 xz 面  bottom   那么就从 立方体下方 观察这个面 向右 x+ 下 z-
      if(whichFace === 'top'){
        const r0: Point = [x, y, z]
        const r1: Point = [x, y, z+step]
        const r2: Point = [x+step, y, z+step]
        const r3: Point = [x+step, y, z]
        const r14: Point = [x+len, y, z+len]
        const r13: Point = [x+len-step, y, z+len]
        const r15: Point = [x+len, y, z+len-step]
        const r12: Point = [x+len-step, y, z+len-step]
        const r9: Point = [x, y, z+len]
        const r8: Point = [x, y, z+len-step]
        const r10: Point = [x+step, y, z+len]
        const r11: Point = [x+step, y, z+len-step]
        const r7: Point = [x+len, y, z]
        const r4: Point = [x+len-step, y, z]
        const r6: Point = [x+len, y, z+step]
        const r5: Point = [x+len-step, y, z+step]
        result = [r0, r1,r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15]
      }
      if(whichFace === 'bottom'){
        const r0: Point = [x, y, z]
        const r1: Point = [x, y, z-step]
        const r2: Point = [x+step, y, z-step]
        const r3: Point = [x+step, y, z]
        const r14: Point = [x+len, y, z-len]
        const r13: Point = [x+len-step, y, z-len]
        const r15: Point = [x+len, y, z-len+step]
        const r12: Point = [x+len-step, y, z-len+step]
        const r9: Point = [x, y, z-len]
        const r8: Point = [x, y, z-len+step]
        const r10: Point = [x+step, y, z-len]
        const r11: Point = [x+step, y, z-len+step]
        const r7: Point = [x+len, y, z]
        const r4: Point = [x+len-step, y, z]
        const r6: Point = [x+len, y, z-step]
        const r5: Point = [x+len-step, y, z-step]
        result = [r0, r1,r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15]
      }
    }

    if(whichFace === 'front' || whichFace === 'back'){
      // z 坐标固定
      // 位于 xy 面  front   那么就从 立方体前侧 观察这个面  向右 x+ 下 y-
      // 位于 xy 面  back   那么就从 立方体右侧 观察这个面 向右 x- 下 y-
      if(whichFace === 'front'){
        const r0: Point = [x, y, z]
        const r1: Point = [x, y-step, z]
        const r2: Point = [x+step, y-step, z]
        const r3: Point = [x+step, y, z]
        const r14: Point = [x+len, y-len, z]
        const r13: Point = [x+len-step, y-len, z]
        const r15: Point = [x+len, y-len+step, z]
        const r12: Point = [x+len-step, y-len+step, z]
        const r9: Point = [x, y-len, z]
        const r8: Point = [x, y-len+step, z]
        const r10: Point = [x+step, y-len, z]
        const r11: Point = [x+step, y-len+step, z]
        const r7: Point = [x+len, y, z]
        const r4: Point = [x+len-step, y, z]
        const r6: Point = [x+len, y-step, z]
        const r5: Point = [x+len-step, y-step, z]
        result = [r0, r1,r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15]
      }
      if(whichFace === 'back'){
        const r0: Point = [x, y, z]
        const r1: Point = [x, y-step, z]
        const r2: Point = [x-step, y-step, z]
        const r3: Point = [x-step, y, z]
        const r14: Point = [x-len, y-len, z]
        const r13: Point = [x-len+step, y-len, z]
        const r15: Point = [x-len, y-len+step, z]
        const r12: Point = [x-len+step, y-len+step, z]
        const r9: Point = [x, y-len, z]
        const r8: Point = [x, y-len+step, z]
        const r10: Point = [x-step, y-len, z]
        const r11: Point = [x-step, y-len+step, z]
        const r7: Point = [x-len, y, z]
        const r4: Point = [x-len+step, y, z]
        const r6: Point = [x-len, y-step, z]
        const r5: Point = [x-len+step, y-step, z]
        result = [r0, r1,r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15]
      }
    }


    if(whichFace === 'left' || whichFace === 'right'){
      // x 坐标固定
      // 位于 yz 面  left   那么就从 立方体左侧 观察这个面  向右 z+ 下 y-
      // 位于 yz 面  right   那么就从 立方体右侧 观察这个面 向右 z- 下 y-
      if(whichFace === 'right'){
        const r0: Point = [x, y, z]
        const r1: Point = [x, y-step, z]
        const r2: Point = [x, y-step, z-step]
        const r3: Point = [x, y, z-step]
        const r14: Point = [x, y-len, z-len]
        const r13: Point = [x, y-len, z-len+step]
        const r15: Point = [x, y-len+step, z-len]
        const r12: Point = [x, y-len+step, z-len+step]
        const r9: Point = [x, y-len, z]
        const r8: Point = [x, y-len+step, z]
        const r10: Point = [x, y-len, z-step]
        const r11: Point = [x, y-len+step, z-step]
        const r7: Point = [x, y, z-len]
        const r4: Point = [x, y, z-len+step]
        const r6: Point = [x, y-step, z-len]
        const r5: Point = [x, y-step, z-len+step]
        result = [r0, r1,r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15]
      }
      if(whichFace === 'left'){
        const r0: Point = [x, y, z]
        const r1: Point = [x, y-step, z]
        const r2: Point = [x, y-step, z+step]
        const r3: Point = [x, y, z+step]
        const r14: Point = [x, y-len, z+len]
        const r13: Point = [x, y-len, z+len-step]
        const r15: Point = [x, y-len+step, z+len]
        const r12: Point = [x, y-len+step, z+len-step]
        const r9: Point = [x, y-len, z]
        const r8: Point = [x, y-len+step, z]
        const r10: Point = [x, y-len, z+step]
        const r11: Point = [x, y-len+step, z+step]
        const r7: Point = [x, y, z+len]
        const r4: Point = [x, y, z+len-step]
        const r6: Point = [x, y-step, z+len]
        const r5: Point = [x, y-step, z+len-step]
        result = [r0, r1,r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15]
      }
    }

    return {
      result,
      faceArea: area
    }
  }

  const lfaceInfo = gVertex([-0.5, 0.5, -0.5], 1 , 'left')
  const rfaceInfo = gVertex([0.5, 0.5, 0.5], 1 , 'right')
  const bfaceInfo = gVertex([0.5, 0.5, -0.5], 1 , 'back')
  const ffaceInfo = gVertex([-0.5, 0.5, 0.5], 1 , 'front')
  const tfaceInfo = gVertex([-0.5, 0.5, -0.5], 1 , 'top')
  const btmfaceInfo = gVertex([-0.5, -0.5, 0.5], 1 , 'bottom')

  const [l0,l1,l2,l3,l4,l5,l6,l7,l8,l9,l10,l11,l12,l13,l14,l15] = lfaceInfo.result
  const [r0,r1,r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15] = rfaceInfo.result
  const [b0,b1,b2,b3,b4,b5,b6,b7,b8,b9,b10,b11,b12,b13,b14,b15] = bfaceInfo.result
  const [f0,f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f11,f12,f13,f14,f15] = ffaceInfo.result
  const [t0,t1,t2,t3,t4,t5,t6,t7,t8,t9,t10,t11,t12,t13,t14,t15] = tfaceInfo.result
  const [d0,d1,d2,d3,d4,d5,d6,d7,d8,d9,d10,d11,d12,d13,d14,d15] = btmfaceInfo.result

  const lFaceVert = [l0,l1,l2,l3,l4,l5,l6,l7,l8,l9,l10,l11,l12,l13,l14,l15]
  const rFaceVert = [r0,r1,r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15]
  const backFaceVert = [b0,b1,b2,b3,b4,b5,b6,b7,b8,b9,b10,b11,b12,b13,b14,b15]
  const frontFaceVert = [f0,f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f11,f12,f13,f14,f15]
  const topFaceVert = [t0,t1,t2,t3,t4,t5,t6,t7,t8,t9,t10,t11,t12,t13,t14,t15]
  const bottomFaceVert = [d0,d1,d2,d3,d4,d5,d6,d7,d8,d9,d10,d11,d12,d13,d14,d15]

/**
 正方体某一个面的 图形结构
      0 3         4  7
       ______________
     1|_|2_______5|_|6
      | |         | |
      | |         | |
     8|_| 11____12|_| 15
      |_|_________|_|
      9 10       13 14



 */

  const a_Position = [
    ...l0, ...l1, ...l2, ...l3, // l0-l5-l4-l6
    ...l3, ...l2, ...l5, ...l4, // l6-l4-l7-l1
    ...l4, ...l5, ...l6, ...l7,
    ...l1, ...l8, ...l11, ...l2,
    ...l2, ...l11, ...l12, ...l5,
    ...l5, ...l12, ...l15, ...l6,
    ...l8, ...l9, ...l10, ...l11,
    ...l11, ...l10, ...l13, ...l12,
    ...l12, ...l13, ...l14, ...l15,

    ...r0, ...r1, ...r2, ...r3, // r0-r5-r4-r6
    ...r3, ...r2, ...r5, ...r4, // r6-r4-r7-r1
    ...r4, ...r5, ...r6, ...r7,
    ...r1, ...r8, ...r11, ...r2,
    ...r2, ...r11, ...r12, ...r5,
    ...r5, ...r12, ...r15, ...r6,
    ...r8, ...r9, ...r10, ...r11,
    ...r11, ...r10, ...r13, ...r12,
    ...r12, ...r13, ...r14, ...r15,

    ...f0, ...f1, ...f2, ...f3, // f0-f5-f4-f6
    ...f3, ...f2, ...f5, ...f4, // f6-f4-f7-f1
    ...f4, ...f5, ...f6, ...f7,
    ...f1, ...f8, ...f11, ...f2,
    ...f2, ...f11, ...f12, ...f5,
    ...f5, ...f12, ...f15, ...f6,
    ...f8, ...f9, ...f10, ...f11,
    ...f11, ...f10, ...f13, ...f12,
    ...f12, ...f13, ...f14, ...f15,

    ...b0, ...b1, ...b2, ...b3, // b0-b5-b4-b6
    ...b3, ...b2, ...b5, ...b4, // b6-b4-b7-b1
    ...b4, ...b5, ...b6, ...b7,
    ...b1, ...b8, ...b11, ...b2,
    ...b2, ...b11, ...b12, ...b5,
    ...b5, ...b12, ...b15, ...b6,
    ...b8, ...b9, ...b10, ...b11,
    ...b11, ...b10, ...b13, ...b12,
    ...b12, ...b13, ...b14, ...b15,

    ...t0, ...t1, ...t2, ...t3, // t0-t5-t4-t6
    ...t3, ...t2, ...t5, ...t4, // t6-t4-t7-t1
    ...t4, ...t5, ...t6, ...t7,
    ...t1, ...t8, ...t11, ...t2,
    ...t2, ...t11, ...t12, ...t5,
    ...t5, ...t12, ...t15, ...t6,
    ...t8, ...t9, ...t10, ...t11,
    ...t11, ...t10, ...t13, ...t12,
    ...t12, ...t13, ...t14, ...t15,


    ...d0, ...d1, ...d2, ...d3, // d0-d5-d4-d6
    ...d3, ...d2, ...d5, ...d4, // d6-d4-d7-d1
    ...d4, ...d5, ...d6, ...d7,
    ...d1, ...d8, ...d11, ...d2,
    ...d2, ...d11, ...d12, ...d5,
    ...d5, ...d12, ...d15, ...d6,
    ...d8, ...d9, ...d10, ...d11,
    ...d11, ...d10, ...d13, ...d12,
    ...d12, ...d13, ...d14, ...d15,
  ]



/**
 正方体某一个面的 图形结构

       1      2     3
       4      5     6
       7      8     9
       ______________
      |_|_________|_|
      | |         | |
      | |         | |    中心正放心 总共6个   记作31~36
      |_|_________|_|
      |_|_________|_|    角落正方形总共24个 3个面一组 8组   记作 21~28
          中边正方形总共 24个 相邻为一组  12组  记作1~12
 */
  const a_Face = [ // 点所在的面的 索引
    21, 21, 21, 21,   // left
    1, 1, 1, 1,
    23, 23, 23, 23,
    12,12,12,12,
    31,31,31,31,
    9, 9, 9, 9,
    27, 27, 27, 27,
    6, 6, 6, 6,
    25,25,25,25,

    24, 24,24,24,   // right
    4,4,4,4,
    22, 22, 22, 22,
    10, 10,10,10,
    32,32,32,32,
    11,11,11,11,
    26,26,26,26,
    7, 7, 7, 7,
    28, 28, 28, 28,


    23, 23, 23, 23,   // front
    2, 2, 2, 2,
    24, 24,24,24,
    9, 9, 9, 9,
    33,33,33,33,
    10, 10,10,10,
    25,25,25,25,
    5, 5, 5, 5,
    26,26,26,26,

    22, 22, 22, 22,   // back
    3, 3, 3, 3,
    21, 21, 21, 21,
    11,11,11,11,
    34,34,34,34,
    12,12,12,12,
    28, 28, 28, 28,
    8, 8, 8, 8,
    27, 27, 27, 27,

    21, 21, 21, 21,   // top
    3, 3, 3, 3,
    22, 22, 22, 22,
    1, 1, 1, 1,
    35, 35,35,35,
    4,4,4,4,
    23, 23, 23, 23,
    2, 2, 2, 2,
    24, 24,24,24,

    25,25,25,25,   // bottom
    5, 5, 5, 5,
    26,26,26,26,
    6, 6, 6, 6,
    36, 36,36,36,
    7, 7, 7, 7,
    27, 27, 27, 27,
    8, 8, 8, 8,
    28, 28, 28, 28,
  ]
  const a_Color = new Array(216*3).fill(0.2)
  const gIndices = (pointCount: number): number[]=>{
    const result = []
    const rectNum = pointCount / 4
    for(let i=0; i< rectNum; i++){
      const firstIdx = i*4
      result.push(firstIdx, firstIdx+1, firstIdx+2, firstIdx,firstIdx+2, firstIdx+3)
    }
    return result
  }
  // console.log(gIndices(36));
  let indice = gIndices(216)
  const attr = {
    a_position: {
      data: a_Position,
      size: 3,
    },
    a_face: {
      data: a_Face,
      size: 1,
    },
    indices: indice,
  }
  bufferInfo = twgl.createBufferInfoFromArrays(gl, attr)
  // console.log(' bufferInfo ', bufferInfo);
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
      u_texture: textures.tex,
      u_SelectFaceId: -1,
      u_highlightFaceId: -1.0,
    }
    twgl.setUniforms(programInfo, uniformData)
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT)
    twgl.drawBufferInfo(gl, bufferInfo)
  })

}

function updateMVPMatrix(time: number){
  time *= 0.001
  let modelMatrix = Matrix4.identity(); // Model matrix

  // modelMatrix = Matrix4.rotateX(modelMatrix, angleToRads(30))
  // modelMatrix = Matrix4.rotateY(modelMatrix, angleToRads(30))
  modelMatrix = Matrix4.rotationY(time)
  const eye = Vector3.create(3, 3, 5)
  const target = Vector3.create(0, 0, 0)
  const cameraUp = Vector3.create(0, 1, 0)
  const camera = Matrix4.lookAt(eye, target, cameraUp);
  const viewMatrix = Matrix4.inverse(camera)
  const projection = Matrix4.perspective(angleToRads(30), 1, 1, 100);
  // Calculate the model view projection matrix
  const viewProj = Matrix4.multiply(projection, viewMatrix)
  u_matrix = Matrix4.multiply(viewProj, modelMatrix)
}


export default main
