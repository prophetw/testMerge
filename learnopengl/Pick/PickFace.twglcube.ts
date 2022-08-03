import FSHADER_SOURCE from './PickFace.frag'
import VSHADER_SOURCE from './PickFace.vert'
import * as twgl from 'twgl.js'
import { angleToRads } from '../../lib/utils'

const Matrix4 = twgl.m4
const Vector3 = twgl.v3

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

let u_matrix = Matrix4.identity() // model view project matrix4
let bufferInfo: twgl.BufferInfo
// highlight rect v2  5 pts 简介一点的尝试
let leftFaceInfo: FaceInfo, rightFaceInfo: FaceInfo, topFaceInfo: FaceInfo, backFaceInfo: FaceInfo, frontFaceInfo: FaceInfo, bottomFaceInfo: FaceInfo;
let cameraPos = Vector3.create(5, 6, 5)

function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl') as HTMLCanvasElement;
  // Get the rendering context for WebGL
  var gl = canvas.getContext('webgl',  { antialias: false, preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  const programInfo = twgl.createProgramInfo(gl, [VSHADER_SOURCE, FSHADER_SOURCE])
  console.log(' programInfo ==== ', programInfo);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST)
  // gl.enable(gl.BLEND)
  // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
  // window.spector.startCapture(canvas, 100)
  draw(gl, programInfo)
  enableCamera(canvas, gl, programInfo)
  canvas.addEventListener('mousemove', e=>{
    const {clientX, clientY} = e
    const rect = canvas.getBoundingClientRect()
    const x_in_canvas = clientX - rect.left
    const y_in_canvas = rect.bottom - clientY

    if(gl){
      check(gl, programInfo, x_in_canvas, y_in_canvas)
    }
  })

  canvas.addEventListener('click', e=>{
    const {clientX, clientY} = e
    const rect = canvas.getBoundingClientRect()
    const x_in_canvas = clientX - rect.left
    const y_in_canvas = rect.bottom - clientY
    if(gl){
      const result = check(gl, programInfo, x_in_canvas, y_in_canvas)
      console.log('FaceId is : ', result);
    }
  })
}

function check(gl: WebGLRenderingContext, pInfo: twgl.ProgramInfo, x: number, y: number){
  twgl.setUniforms(pInfo, {
    u_PickedFace: 0
  })
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  twgl.drawBufferInfo(gl, bufferInfo)
  const pix = new Uint8Array(4)

  gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pix)
  const a_Face = pix[3]
  twgl.setUniforms(pInfo, {
    u_PickedFace: a_Face
  })
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  twgl.drawBufferInfo(gl, bufferInfo)
  return a_Face
}

function draw (gl: WebGLRenderingContext,pInfo: twgl.ProgramInfo){
  gl.useProgram(pInfo.program)
  /**
  //  l0~l15 16 left
  //  r0~r15 16 right
  //  u0~u15 16 up
  //  d0~d15 16 down
  //  f0~f15 16 front
  //  b0~b15 16 back
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

    area.push(
      getArea([result[0], result[1], result[2], result[3]]),
      getArea([result[3], result[2], result[5], result[4]]),
      getArea([result[4], result[5], result[6], result[7]]),

      getArea([result[1], result[2], result[8], result[11]]),
      getArea([result[2], result[11], result[12], result[5]]),
      getArea([result[5], result[12], result[15], result[6]]),

      getArea([result[8], result[9], result[10], result[11]]),
      getArea([result[11], result[10], result[13], result[12]]),
      getArea([result[12], result[13], result[14], result[15]]),
    )


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

  // const r0 = [-0.5, 0.5, -0.5]
  // const r1 = [0.5, 0.5, -0.5]
  // const r2 = [-0.5, -0.5, -0.5]
  // const r3 = [0.5, -0.5, -0.5]
  // const r4 = [0.0, 0.0, -0.5]
  // const r5 = [-0.5, 0.0, -0.5] // reft-mid
  // const r6 = [0.0, 0.5, -0.5] // mid-top
  // const r7 = [0.5, 0.0, -0.5] // right-mid
  // const r8 = [0.0, -0.5, -0.5] // mid-bottom
  // const r9 = [-0.5, 0.5, -0.5]
  // const r10 = [0.5, 0.5, -0.5]
  // const r11 = [0.5, 0.5, -0.5]
  // const r12 = [-0.5, -0.5, -0.5]
  // const r13 = [0.5, -0.5, -0.5]
  // const r14 = [0.0, 0.0, -0.5]
  // const r15 = [-0.5, 0.0, -0.5] // reft-mid


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

  const mid1 = 31
  const mid2 = 32
  const mid3 = 33
  const mid4 = 34
  const mid5 = 35
  const mid6 = 36
  const corner1 = 21
  const corner2 = 22
  const corner3 = 23
  const corner4 = 24
  const corner5 = 25
  const corner6 = 26
  const corner7 = 27
  const corner8 = 28
  const midcorner1 = 1
  const midcorner2 = 2
  const midcorner3 = 3
  const midcorner4 = 4
  const midcorner5 = 5
  const midcorner6 = 6
  const midcorner7 = 7
  const midcorner8 = 8
  const midcorner9 = 9
  const midcorner10 = 10
  const midcorner11 = 11
  const midcorner12 = 12
  leftFaceInfo  = {
    vertex: lFaceVert,
    faceIdAry: [
      corner1,midcorner1,corner3,
      midcorner12,mid1,midcorner9,
      corner7,midcorner6,corner5,
    ],
    normal: [-1,0,0],
    pointOnPlane: [-0.5,0,0], // pointOnPlane
    name: 'left',
    area: getArea(lFaceVert),
    faceArea: lfaceInfo.faceArea
  }
  rightFaceInfo = {
    vertex: rFaceVert,
    faceIdAry: [
      corner4,midcorner4, corner2,
      midcorner10, mid2,midcorner11,
      corner6,midcorner7,corner8,
    ],
    normal: [1,0,0],
    pointOnPlane: [0.5,0,0],
    name: 'right',
    area: getArea(rFaceVert),
    faceArea: rfaceInfo.faceArea
  }
  topFaceInfo = {
    vertex: topFaceVert,
    faceIdAry: [
      corner1,midcorner3,corner2,
      midcorner1,mid5,midcorner4,
      corner3,midcorner2,corner4,
    ],
    normal: [0,1,0],
    pointOnPlane: [0,0.5,0],
    name: 'top',
    area: getArea(topFaceVert),
    faceArea: tfaceInfo.faceArea
  }
  bottomFaceInfo = {
    vertex: bottomFaceVert,
    faceIdAry: [
      corner5,midcorner5,corner6,
      midcorner6,mid6,midcorner7,
      corner7,midcorner8,corner8,
    ],
    normal: [0,-1,0],
    pointOnPlane: [0,-0.5,0],
    name: 'bottom',
    area: getArea(bottomFaceVert),
    faceArea: btmfaceInfo.faceArea
  }
  frontFaceInfo = {
    vertex: frontFaceVert,
    faceIdAry: [
      corner3, midcorner2, corner4,
      midcorner9, mid3, midcorner10,
      corner5, midcorner5, corner6
    ],
    normal: [0,0,1],
    pointOnPlane: [0,0,0.5],
    name: 'front',
    area: getArea(frontFaceVert),
    faceArea: ffaceInfo.faceArea
  }
  backFaceInfo = {
    vertex: backFaceVert,
    faceIdAry: [
      corner2, midcorner3, corner1,
      midcorner11, mid4, midcorner12,
      corner8, midcorner8, corner7
    ],
    normal: [0,0,-1],
    pointOnPlane: [0,0,-0.5],
    name: 'back',
    area: getArea(backFaceVert),
    faceArea: bfaceInfo.faceArea
  }
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
  const a_Color = new Array(216*3).fill(0.5)
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
  const indices = new Float32Array(indice)
  const attr = {
    a_Position: {
      data: a_Position,
      size: 3,
    },
    a_Face: {
      data: a_Face,
      size: 1
    },
    a_Color: {
      data: a_Color,
      size: 3
    },
    indices: indice,
  }
  bufferInfo = twgl.createBufferInfoFromArrays(gl, attr)
  // console.log(' bufferInfo ', bufferInfo);
  twgl.setBuffersAndAttributes(gl, pInfo,  bufferInfo)
  updateMVPMatrix(0)
  const highlightFaceId = updateHighlightFaceId()
  const unif = {
    u_MvpMatrix: u_matrix,
    u_CameraPos: cameraPos,
    u_PickedFace: -1,
    u_HighlightFace: highlightFaceId
  }
  twgl.setUniforms(pInfo, unif)
  // const indexBuffer = gl.createBuffer()
  // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  // gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  // gl.drawElements(gl.TRIANGLES, 324, gl.UNSIGNED_BYTE,0)
  twgl.drawBufferInfo(gl, bufferInfo)
}

function updateHighlightFaceId(){
  let faceid = -1
  const face = getFace([cameraPos[0],cameraPos[1],cameraPos[2]], [leftFaceInfo, rightFaceInfo, topFaceInfo, backFaceInfo, frontFaceInfo, bottomFaceInfo])
  if(face){
    const crossPt = calcPlaneLineCrossPoint(
    [cameraPos[0],cameraPos[1],cameraPos[2]],
    [cameraPos[0],cameraPos[1],cameraPos[2]], face.pointOnPlane, face.normal)
    if(crossPt){
      const faceIndex = getFaceId(crossPt, face)
      const faceId = face.faceIdAry[faceIndex]
      faceid = faceId
    }
  }
  return faceid
}


/**
 正方体某一个面的 图形结构

       1      2     3
       4      5     6
       7      8     9
       ______________
      |_|_________|_|
      | |         | |
      | |         | |    中心正放心 总共6个 记作31~36
      |_|_________|_|
      |_|_________|_|    角落正方形总共24个 3个面一组 8组   记作 21~28
          中边正方形总共 24个 相邻为一组  12组  记作1~12
 */
function getFaceId (crossPtOnFace: Point, faceInfo: FaceInfo): number{
  let result = -1
  const [x,y,z] = crossPtOnFace
  faceInfo.faceArea.map((area: XYZArea, index: number)=>{
    if(
      (area.x[0]<=x && x<=area.x[1]) &&
      (area.y[0]<=y && y<=area.y[1]) &&
      (area.z[0]<=z && z<=area.z[1])
      ){
        console.log(' index here ', index);
        result = index
      }
  })

  return result
}

function getFace(position: Point, faceInfoAry: FaceInfo[]): FaceInfo | undefined{
  let face = undefined
  faceInfoAry.map((faceInfo)=>{
    const crosPt = calcPlaneLineCrossPoint(position, position, faceInfo.pointOnPlane, faceInfo.normal)
    if(crosPt){
      const [x1, y1, z1] = position
      const [x,y,z] = crosPt
      if(x1*x>=0 && y1*y>=0&&z1*z>=0){
        const area = faceInfo.area
        if(
          (area.x[0]<=x && x<=area.x[1]) &&
          (area.y[0]<=y && y<=area.y[1]) &&
          (area.z[0]<=z && z<=area.z[1])
          ){
            face = faceInfo
          }
      }
    }
  })
  return face
}
type AreaType = [number, number]
function getArea(pointAry: Point[]): {
  x: AreaType
  y: AreaType
  z: AreaType
}{
  let minX = +Infinity
  let maxX = -Infinity
  let minY = +Infinity
  let maxY = -Infinity
  let minZ = +Infinity
  let maxZ = -Infinity
  pointAry.map(pt=>{
    const [x,y,z] = pt
    minX = Math.min(x, minX)
    maxX = Math.max(x, maxX)
    minY = Math.min(y, minY)
    maxY = Math.max(y, maxY)
    minZ = Math.min(z, minZ)
    maxZ = Math.max(z, maxZ)
  })
  return {
    x: [minX, maxX],
    y: [minY, maxY],
    z: [minZ, maxZ]
  }
}

function updateMVPMatrix(time: number){
  time *= 0.001
  let modelMatrix = Matrix4.identity(); // Model matrix

  // modelMatrix = Matrix4.rotateX(modelMatrix, angleToRads(30))
  // modelMatrix = Matrix4.rotateY(modelMatrix, angleToRads(30))
  modelMatrix = Matrix4.rotationY(time)
  const target = Vector3.create(0,0,0)
  const cameraUp = Vector3.create(0, 1, 0)
  const camera = Matrix4.lookAt(cameraPos, target, cameraUp);
  const viewMatrix = Matrix4.inverse(camera)

  const projection = Matrix4.perspective(angleToRads(30), 1, 1, 100);
  // Calculate the model view projection matrix
  const viewProj = Matrix4.multiply(projection, viewMatrix)
  u_matrix = Matrix4.multiply(viewProj, modelMatrix)
}


function calcPlaneLineCrossPoint (
  pointOnLine: Point,
  lineDirection: Point,
  pointOnPlane: Point,
  planeNormalDirection: Point): false | Point{
  // 求线面交点
  const P1 = Vector3.create(...pointOnPlane)
  const P = Vector3.create(...pointOnLine)
  const lineDirVec3 = Vector3.create(...lineDirection)
  const planeNormalVec3 = Vector3.create(...planeNormalDirection)
  const D = lineDirVec3
  const D1 = planeNormalVec3
  if(Vector3.dot(lineDirVec3, planeNormalVec3) === 1){
    // 线面平行
    return false
  }
  const m = ((P1[0] - P[0]) * D1[0] +
                       (P1[1] - P[1]) * D1[1] +
                       (P1[2] - P[2]) * D1[2]) /
                      (D1[0] * D[0] + D1[1] * D[1] + D1[2] * D[2]);
  return [P[0] + D[0] * m, P[1] + D[1] * m, P[2] + D[2] * m]
}

function enableCamera (
  canvas: HTMLCanvasElement,
  gl: WebGLRenderingContext,
  pInfo: twgl.ProgramInfo
  ) {
  console.log(' enable came');
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
      const faceid = updateHighlightFaceId()
      twgl.setUniforms(pInfo, {
        u_MvpMatrix: u_matrix,
        u_CameraPos: cameraPos,
        u_PickedFace: -1,
        u_HighlightFace: faceid
      })
      twgl.drawBufferInfo(gl, bufferInfo)
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
