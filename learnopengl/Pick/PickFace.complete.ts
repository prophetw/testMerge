import FSHADER_SOURCE from './PickFace.complete.Tex.frag'
import VSHADER_SOURCE from './PickFace.complete.Tex.vert'
import FSRING from './Circle.frag'
import VSRING from './Circle.vert'
import FSTEX from './PickFace.c.Tex.frag'
import VSTEX from './PickFace.c.Tex.vert'
import * as twgl from 'twgl.js'
import { angleToRads } from '../../lib/utils'
import { GraphicEngine } from '../../src/utils/utils'

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

let imgAry: {
  imgElement: HTMLImageElement;
  imgUrl: string;
}[]
// highlight rect v2  5 pts 简介一点的尝试
let leftFaceInfo: FaceInfo, rightFaceInfo: FaceInfo, topFaceInfo: FaceInfo, backFaceInfo: FaceInfo, frontFaceInfo: FaceInfo, bottomFaceInfo: FaceInfo;
const dftPos = Vector3.normalize(Vector3.create(5, 5, 5))
let cameraPos = Vector3.create(dftPos[0] * 5, dftPos[1] * 5, dftPos[2] * 5)

const generateFace = (
  ctx: CanvasRenderingContext2D,
  faceColor: string,
  textColor: string,
  text: string,
  bgImgSrc?: string
) => {
  return new Promise((resolve, reject) => {
    const { width, height } = ctx.canvas;
    if (bgImgSrc) {
      const image = document.createElement('img');
      image.src = bgImgSrc
      image.addEventListener('load', (e) => {
        ctx.drawImage(image, 0, 0, width, height);
        ctx.font = `${width * 0.5}px sans-serif`;
        ctx.globalAlpha = 0.7;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = textColor;
        ctx.fillText(text, width / 2, height / 2);
        resolve(ctx)
      });
    } else {
      ctx.clearRect(0, 0, 128, 128);
      ctx.fillStyle = "rgba(100, 100, 100, 0.0)";
      ctx.globalAlpha = 0.5;
      ctx.fillRect(0, 0, 128, 128);
      ctx.font = `${width * 0.5}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = textColor;
      ctx.fillText(text, width / 2, height / 2);
      resolve(ctx)
    }
  })
}
const getImgEle = async (ctx: CanvasRenderingContext2D): Promise<{
  imgElement: HTMLImageElement
  imgUrl: string
}> => {
  return new Promise((resolve, reject) => {
    const imgUrl = ctx.canvas.toDataURL()
    ctx.canvas.toBlob((blob) => {
      if (blob) {
        const img = new Image();
        img.src = URL.createObjectURL(blob);
        // document.body.appendChild(img); // debug generated img
        img.onload = () => {
          resolve({
            imgElement: img,
            imgUrl: imgUrl
          })
        }
      }
    });
  })
}
const gImg = async (): Promise<{ imgElement: HTMLImageElement, imgUrl: string }[]> => {

  const faceInfos = [
    { faceColor: '#F00', textColor: '#FFF', text: '右' },
    { faceColor: '#FF0', textColor: '#FFF', text: '左' },
    { faceColor: '#0F0', textColor: '#FFF', text: '上' },
    { faceColor: '#0FF', textColor: '#FFF', text: '下' },
    { faceColor: '#00F', textColor: '#FFF', text: '前' },
    { faceColor: '#F0F', textColor: '#FFF', text: '后' },
    { faceColor: '#F00', textColor: '#FFF', text: '东' },
    { faceColor: '#FF0', textColor: '#FFF', text: '南' },
    { faceColor: '#0F0', textColor: '#FFF', text: '西' },
    { faceColor: '#0FF', textColor: '#FFF', text: '北' },
  ];
  const imgAry: { imgElement: HTMLImageElement, imgUrl: string }[] = []
  await Promise.all(faceInfos.map(async (faceInfo) => {
    const ctx = document.createElement("canvas").getContext("2d");
    if (ctx === null) return []
    ctx.canvas.width = 128;
    ctx.canvas.height = 128;
    const { faceColor, textColor, text } = faceInfo;
    // await generateFace(ctx, faceColor, textColor, text, './resources/tex4.jpg');
    await generateFace(ctx, faceColor, textColor, text);
    // show the result
    const img = await getImgEle(ctx)
    img.imgElement.alt = text
    imgAry.push(img)
  }));
  return imgAry
}

function getImgEleBy(imgAry: { imgElement: HTMLImageElement, imgUrl: string }[], alt: string) {
  // let targetImg: HTMLImageElement = document.createElement('img')
  let url = ''
  imgAry.map(img => {
    if (img.imgElement.alt === alt) {
      url = img.imgUrl
    }
  })
  return url
}

async function initTextureImg(
  gl: WebGLRenderingContext,
  imgCubeAry: string[],
  imgDirAry: string[]
): Promise<{
  [key: string]: WebGLTexture;
}> {
  return new Promise((resolve, reject) => {
    twgl.createTextures(gl, {
      cube: {
        target: gl.TEXTURE_CUBE_MAP,
        src: imgCubeAry
      },
      East: {
        src: imgDirAry[0]
      },
      South: {
        src: imgDirAry[1]
      },
      West: {
        src: imgDirAry[2]
      },
      North: {
        src: imgDirAry[3]
      },
    }, (err, texs) => {
      if (err) {
        console.error(err);
        reject(' initTextureImg fail')
      } else {
        resolve(texs)
      }
    })
  })
}


async function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl') as HTMLCanvasElement;
  // Get the rendering context for WebGL
  // var gl = canvas.getContext('webgl',  { antialias: false, preserveDrawingBuffer: true});
  var gl = canvas.getContext('webgl', {
    alpha: true,
    // powerPreference: "high-performance",
    // stencil: true
  })
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  imgAry = await gImg()
  console.log(' imgAry ', imgAry);

  const imgCubeAry = [
    getImgEleBy(imgAry, '右'),
    getImgEleBy(imgAry, '左'),
    getImgEleBy(imgAry, '上'),
    getImgEleBy(imgAry, '下'),
    getImgEleBy(imgAry, '前'),
    getImgEleBy(imgAry, '后'),
  ]
  const imgDirAry = [
    getImgEleBy(imgAry, '南'),
    getImgEleBy(imgAry, '东'),
    getImgEleBy(imgAry, '北'),
    getImgEleBy(imgAry, '西'),
  ]


  const cameraUp = Vector3.create(0, 1, 0)
  const camera = Matrix4.lookAt(cameraPos, Vector3.create(0, 0, 0), cameraUp);
  const viewMatrix = Matrix4.inverse(camera)
  // const projection = Matrix4.perspective(angleToRads(30), 1, 1, 100);
  const projection = Matrix4.ortho(-1.0, 1.0, -1.0, 1.0, 1, 100);

  const texs = await initTextureImg(gl, imgCubeAry, imgDirAry)
  console.log(' texs ---- ', texs);

  const cubeVertData = initCubeVert()
  const cubeEng = new GraphicEngine(gl, cubeVertData, VSHADER_SOURCE, FSHADER_SOURCE)
  const highlightFaceId = updateHighlightFaceId()

  cubeEng.updateMVP(undefined, viewMatrix, projection)
  cubeEng.setUniform({
    u_texture: texs.cube,
    u_PickedFace: -1,
    u_HighlightFace: highlightFaceId
  })

  console.log(' cubeEngine ', cubeEng);
  const ringVertData = initRingVert()
  const ringEng = new GraphicEngine(gl, ringVertData, VSRING, FSRING, {
    modelMatrix: Matrix4.translate(Matrix4.identity(), Vector3.create(0, -0.7, 0))
  })
  ringEng.updateMVP(undefined, viewMatrix, projection)
  ringEng.setUniform({
    u_PickedFace: -1,
  })

  // 东
  const tex1VertData = initTexVert(1)
  const tex1Eng = new GraphicEngine(gl, tex1VertData, VSTEX, FSTEX, {
    modelMatrix: Matrix4.scale(
      Matrix4.translate(
        Matrix4.rotateY(Matrix4.identity(), angleToRads(0)),
        Vector3.create(0, -0.7, 1.0)),
      Vector3.create(0.3, 0.3, 0.3)
    ),
    textureAry: [texs.East]
  })
  tex1Eng.updateMVP(undefined, viewMatrix, projection)
  tex1Eng.setUniform({
    u_texture: texs.East,
    u_PickedFace: -1,
    u_HighlightFace: -1
  })

  // 西
  const tex2VertData = initTexVert(2)
  const tex2Eng = new GraphicEngine(gl, tex2VertData, VSTEX, FSTEX, {
    modelMatrix: Matrix4.scale(
      Matrix4.translate(
        Matrix4.rotateY(Matrix4.identity(), angleToRads(180)),
        Vector3.create(0, -0.7, 1.0)),
      Vector3.create(0.3, 0.3, 0.3)
    ),
    textureAry: [texs.West]
  })
  tex2Eng.updateMVP(undefined, viewMatrix, projection)
  tex2Eng.setUniform({
    u_texture: texs.West,
    u_PickedFace: -1,
    u_HighlightFace: -1
  })
  // 南
  const tex3VertData = initTexVert(3)
  const tex3Eng = new GraphicEngine(gl, tex3VertData, VSTEX, FSTEX, {
    modelMatrix: Matrix4.scale(
      Matrix4.translate(
        Matrix4.rotateY(Matrix4.identity(), angleToRads(90)),
        Vector3.create(0, -0.7, 1.0)),
      Vector3.create(0.3, 0.3, 0.3)
    ),
    textureAry: [texs.South]
  })
  tex3Eng.updateMVP(undefined, viewMatrix, projection)
  tex3Eng.setUniform({
    u_PickedFace: -1,
    u_HighlightFace: -1
  })

  // 北
  const tex4VertData = initTexVert(4)
  const tex4Eng = new GraphicEngine(gl, tex4VertData, VSTEX, FSTEX, {
    modelMatrix: Matrix4.scale(
      Matrix4.translate(
        Matrix4.rotateY(Matrix4.identity(), angleToRads(-90)),
        Vector3.create(0, -0.7, 1.0)),
      Vector3.create(0.3, 0.3, 0.3)
    ),
    textureAry: [texs.North]
  })
  tex4Eng.updateMVP(undefined, viewMatrix, projection)
  tex4Eng.setUniform({
    u_texture: texs.North,
    u_PickedFace: -1,
    u_HighlightFace: -1
  })

  gl.clearColor(1.0, 0.0, 1.0, 1.0);
  gl.enable(gl.DEPTH_TEST)
  gl.enable(gl.BLEND)
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  // gl.clear(gl.COLOR_BUFFER_BIT )

  const drawAll = () => {
    cubeEng.draw()
    ringEng.draw()
    tex1Eng.draw()
    tex2Eng.draw()
    tex3Eng.draw()
    tex4Eng.draw()
  }
  // drawAll()
  const updatePickFaceId = (faceid: number) => {
    cubeEng.updateUniform({ u_PickedFace: faceid })
    cubeEng.draw()
    ringEng.updateUniform({ u_PickedFace: faceid })
    ringEng.draw()
    tex1Eng.updateUniform({ u_PickedFace: faceid })
    tex1Eng.draw()
    tex2Eng.updateUniform({ u_PickedFace: faceid })
    tex2Eng.draw()
    tex3Eng.updateUniform({ u_PickedFace: faceid })
    tex3Eng.draw()
    tex4Eng.updateUniform({ u_PickedFace: faceid })
    tex4Eng.draw()
  }
  enableCamera(canvas, gl, (cameraPos, faceid) => {
    cubeEng.updateCamera(cameraPos)
    cubeEng.setUniform({
      u_PickedFace: -1,
      u_HighlightFace: faceid
    })
    ringEng.updateCamera(cameraPos)
    tex1Eng.updateCamera(cameraPos)
    tex2Eng.updateCamera(cameraPos)
    tex3Eng.updateCamera(cameraPos)
    tex4Eng.updateCamera(cameraPos)
    if (gl) {
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    }
    drawAll()
  })
  const onPickFace = (e: MouseEvent) => {
    const { clientX, clientY } = e
    const rect = canvas.getBoundingClientRect()
    const x_in_canvas = clientX - rect.left
    const y_in_canvas = rect.bottom - clientY
    if (gl) {
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
      gl.disable(gl.BLEND)
      updatePickFaceId(0)
      const pix = new Uint8Array(4)
      gl.readPixels(x_in_canvas, y_in_canvas, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pix)
      const a_Face = pix[3]

      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
      gl.enable(gl.BLEND)
      updatePickFaceId(a_Face)
      return a_Face
    }
  }
  canvas.addEventListener('mousemove', e => {
    onPickFace(e)
  })

  canvas.addEventListener('click', e => {
    const pickedFace = onPickFace(e)
    console.log(' picked face is: ', pickedFace);
  })
}

function gRingVert() {
  // 圆环
  const r = 0.8
  const r2 = 0.85
  const n = 100
  const radius = angleToRads(360 / n)
  const result = []
  for (let i = 0; i < n; i++) {
    const pt1Radius = i * radius
    const pt2Radius = (i + 1) * radius
    const pt1 = [
      r * Math.sin(pt1Radius),
      0, // y
      r * Math.cos(pt1Radius),
    ]
    const pt2 = [
      r * Math.sin(pt2Radius),
      0,
      r * Math.cos(pt2Radius),
    ]
    const pt3 = [
      r2 * Math.sin(pt1Radius),
      0,
      r2 * Math.cos(pt1Radius),
    ]
    const pt4 = [
      r2 * Math.sin(pt2Radius),
      0,
      r2 * Math.cos(pt2Radius),
    ]
    result.push(...pt1, ...pt3, ...pt4)
    result.push(...pt1, ...pt4, ...pt2)
  }
  return result
}
function initRingVert() {
  const a_Position = gRingVert() // 圆环
  const a_Color = new Array(1800).fill(0.3)
  const a_Face = new Array(1800).fill(100)
  const attr = {
    a_Position: {
      data: a_Position,
      size: 3,
    },
    a_color: {
      data: a_Color,
      size: 3
    },
    a_Face: {
      data: a_Face,
      size: 1,
    }
  }
  // ringBufferInfo = twgl.createBufferInfoFromArrays(gl, attr)
  // twgl.setBuffersAndAttributes(gl, ringPinfo,  ringBufferInfo)
  // updateRingMVP(0)
  // const unif = {
  //   u_MvpMatrix: u_matrix,
  //   u_PickedFace: -1,
  // }
  // twgl.setUniforms(ringPinfo, unif)
  // gl.drawArrays(gl.TRIANGLES, 0, 1800)
  return attr
}

function initCubeVert() {
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
  function gVertex(leftTopPt: Point, len: number, whichFace: FaceType) {
    // len 正方形边长
    let result: Point[] = []
    const [x, y, z] = leftTopPt
    const step = 0.18
    let area: XYZArea[] = [] // 9个正方形 从左往右  从上往下 每个正方形的 xyz 的范围

    if (whichFace === 'top' || whichFace === 'bottom') {
      // y 坐标固定
      // 位于 xz 面  top   那么就从 立方体上方 观察这个面  向右 x+ 下 z+
      // 位于 xz 面  bottom   那么就从 立方体下方 观察这个面 向右 x+ 下 z-
      if (whichFace === 'top') {
        const r0: Point = [x, y, z]
        const r1: Point = [x, y, z + step]
        const r2: Point = [x + step, y, z + step]
        const r3: Point = [x + step, y, z]
        const r14: Point = [x + len, y, z + len]
        const r13: Point = [x + len - step, y, z + len]
        const r15: Point = [x + len, y, z + len - step]
        const r12: Point = [x + len - step, y, z + len - step]
        const r9: Point = [x, y, z + len]
        const r8: Point = [x, y, z + len - step]
        const r10: Point = [x + step, y, z + len]
        const r11: Point = [x + step, y, z + len - step]
        const r7: Point = [x + len, y, z]
        const r4: Point = [x + len - step, y, z]
        const r6: Point = [x + len, y, z + step]
        const r5: Point = [x + len - step, y, z + step]
        result = [r0, r1, r2, r3, r4, r5, r6, r7, r8, r9, r10, r11, r12, r13, r14, r15]
      }
      if (whichFace === 'bottom') {
        const r0: Point = [x, y, z]
        const r1: Point = [x, y, z - step]
        const r2: Point = [x + step, y, z - step]
        const r3: Point = [x + step, y, z]
        const r14: Point = [x + len, y, z - len]
        const r13: Point = [x + len - step, y, z - len]
        const r15: Point = [x + len, y, z - len + step]
        const r12: Point = [x + len - step, y, z - len + step]
        const r9: Point = [x, y, z - len]
        const r8: Point = [x, y, z - len + step]
        const r10: Point = [x + step, y, z - len]
        const r11: Point = [x + step, y, z - len + step]
        const r7: Point = [x + len, y, z]
        const r4: Point = [x + len - step, y, z]
        const r6: Point = [x + len, y, z - step]
        const r5: Point = [x + len - step, y, z - step]
        result = [r0, r1, r2, r3, r4, r5, r6, r7, r8, r9, r10, r11, r12, r13, r14, r15]
      }
    }

    if (whichFace === 'front' || whichFace === 'back') {
      // z 坐标固定
      // 位于 xy 面  front   那么就从 立方体前侧 观察这个面  向右 x+ 下 y-
      // 位于 xy 面  back   那么就从 立方体右侧 观察这个面 向右 x- 下 y-
      if (whichFace === 'front') {
        const r0: Point = [x, y, z]
        const r1: Point = [x, y - step, z]
        const r2: Point = [x + step, y - step, z]
        const r3: Point = [x + step, y, z]
        const r14: Point = [x + len, y - len, z]
        const r13: Point = [x + len - step, y - len, z]
        const r15: Point = [x + len, y - len + step, z]
        const r12: Point = [x + len - step, y - len + step, z]
        const r9: Point = [x, y - len, z]
        const r8: Point = [x, y - len + step, z]
        const r10: Point = [x + step, y - len, z]
        const r11: Point = [x + step, y - len + step, z]
        const r7: Point = [x + len, y, z]
        const r4: Point = [x + len - step, y, z]
        const r6: Point = [x + len, y - step, z]
        const r5: Point = [x + len - step, y - step, z]
        result = [r0, r1, r2, r3, r4, r5, r6, r7, r8, r9, r10, r11, r12, r13, r14, r15]
      }
      if (whichFace === 'back') {
        const r0: Point = [x, y, z]
        const r1: Point = [x, y - step, z]
        const r2: Point = [x - step, y - step, z]
        const r3: Point = [x - step, y, z]
        const r14: Point = [x - len, y - len, z]
        const r13: Point = [x - len + step, y - len, z]
        const r15: Point = [x - len, y - len + step, z]
        const r12: Point = [x - len + step, y - len + step, z]
        const r9: Point = [x, y - len, z]
        const r8: Point = [x, y - len + step, z]
        const r10: Point = [x - step, y - len, z]
        const r11: Point = [x - step, y - len + step, z]
        const r7: Point = [x - len, y, z]
        const r4: Point = [x - len + step, y, z]
        const r6: Point = [x - len, y - step, z]
        const r5: Point = [x - len + step, y - step, z]
        result = [r0, r1, r2, r3, r4, r5, r6, r7, r8, r9, r10, r11, r12, r13, r14, r15]
      }
    }


    if (whichFace === 'left' || whichFace === 'right') {
      // x 坐标固定
      // 位于 yz 面  left   那么就从 立方体左侧 观察这个面  向右 z+ 下 y-
      // 位于 yz 面  right   那么就从 立方体右侧 观察这个面 向右 z- 下 y-
      if (whichFace === 'right') {
        const r0: Point = [x, y, z]
        const r1: Point = [x, y - step, z]
        const r2: Point = [x, y - step, z - step]
        const r3: Point = [x, y, z - step]
        const r14: Point = [x, y - len, z - len]
        const r13: Point = [x, y - len, z - len + step]
        const r15: Point = [x, y - len + step, z - len]
        const r12: Point = [x, y - len + step, z - len + step]
        const r9: Point = [x, y - len, z]
        const r8: Point = [x, y - len + step, z]
        const r10: Point = [x, y - len, z - step]
        const r11: Point = [x, y - len + step, z - step]
        const r7: Point = [x, y, z - len]
        const r4: Point = [x, y, z - len + step]
        const r6: Point = [x, y - step, z - len]
        const r5: Point = [x, y - step, z - len + step]
        result = [r0, r1, r2, r3, r4, r5, r6, r7, r8, r9, r10, r11, r12, r13, r14, r15]
      }
      if (whichFace === 'left') {
        const r0: Point = [x, y, z]
        const r1: Point = [x, y - step, z]
        const r2: Point = [x, y - step, z + step]
        const r3: Point = [x, y, z + step]
        const r14: Point = [x, y - len, z + len]
        const r13: Point = [x, y - len, z + len - step]
        const r15: Point = [x, y - len + step, z + len]
        const r12: Point = [x, y - len + step, z + len - step]
        const r9: Point = [x, y - len, z]
        const r8: Point = [x, y - len + step, z]
        const r10: Point = [x, y - len, z + step]
        const r11: Point = [x, y - len + step, z + step]
        const r7: Point = [x, y, z + len]
        const r4: Point = [x, y, z + len - step]
        const r6: Point = [x, y - step, z + len]
        const r5: Point = [x, y - step, z + len - step]
        result = [r0, r1, r2, r3, r4, r5, r6, r7, r8, r9, r10, r11, r12, r13, r14, r15]
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

  const lfaceInfo = gVertex([-0.5, 0.5, -0.5], 1, 'left')
  const rfaceInfo = gVertex([0.5, 0.5, 0.5], 1, 'right')
  const bfaceInfo = gVertex([0.5, 0.5, -0.5], 1, 'back')
  const ffaceInfo = gVertex([-0.5, 0.5, 0.5], 1, 'front')
  const tfaceInfo = gVertex([-0.5, 0.5, -0.5], 1, 'top')
  const btmfaceInfo = gVertex([-0.5, -0.5, 0.5], 1, 'bottom')

  const [l0, l1, l2, l3, l4, l5, l6, l7, l8, l9, l10, l11, l12, l13, l14, l15] = lfaceInfo.result
  const [r0, r1, r2, r3, r4, r5, r6, r7, r8, r9, r10, r11, r12, r13, r14, r15] = rfaceInfo.result
  const [b0, b1, b2, b3, b4, b5, b6, b7, b8, b9, b10, b11, b12, b13, b14, b15] = bfaceInfo.result
  const [f0, f1, f2, f3, f4, f5, f6, f7, f8, f9, f10, f11, f12, f13, f14, f15] = ffaceInfo.result
  const [t0, t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11, t12, t13, t14, t15] = tfaceInfo.result
  const [d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15] = btmfaceInfo.result

  const lFaceVert = [l0, l1, l2, l3, l4, l5, l6, l7, l8, l9, l10, l11, l12, l13, l14, l15]
  const rFaceVert = [r0, r1, r2, r3, r4, r5, r6, r7, r8, r9, r10, r11, r12, r13, r14, r15]
  const backFaceVert = [b0, b1, b2, b3, b4, b5, b6, b7, b8, b9, b10, b11, b12, b13, b14, b15]
  const frontFaceVert = [f0, f1, f2, f3, f4, f5, f6, f7, f8, f9, f10, f11, f12, f13, f14, f15]
  const topFaceVert = [t0, t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11, t12, t13, t14, t15]
  const bottomFaceVert = [d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15]

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
  leftFaceInfo = {
    vertex: lFaceVert,
    faceIdAry: [
      corner1, midcorner1, corner3,
      midcorner12, mid1, midcorner9,
      corner7, midcorner6, corner5,
    ],
    normal: [-1, 0, 0],
    pointOnPlane: [-0.5, 0, 0], // pointOnPlane
    name: 'left',
    area: getArea(lFaceVert),
    faceArea: lfaceInfo.faceArea
  }
  rightFaceInfo = {
    vertex: rFaceVert,
    faceIdAry: [
      corner4, midcorner4, corner2,
      midcorner10, mid2, midcorner11,
      corner6, midcorner7, corner8,
    ],
    normal: [1, 0, 0],
    pointOnPlane: [0.5, 0, 0],
    name: 'right',
    area: getArea(rFaceVert),
    faceArea: rfaceInfo.faceArea
  }
  topFaceInfo = {
    vertex: topFaceVert,
    faceIdAry: [
      corner1, midcorner3, corner2,
      midcorner1, mid5, midcorner4,
      corner3, midcorner2, corner4,
    ],
    normal: [0, 1, 0],
    pointOnPlane: [0, 0.5, 0],
    name: 'top',
    area: getArea(topFaceVert),
    faceArea: tfaceInfo.faceArea
  }
  bottomFaceInfo = {
    vertex: bottomFaceVert,
    faceIdAry: [
      corner5, midcorner5, corner6,
      midcorner6, mid6, midcorner7,
      corner7, midcorner8, corner8,
    ],
    normal: [0, -1, 0],
    pointOnPlane: [0, -0.5, 0],
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
    normal: [0, 0, 1],
    pointOnPlane: [0, 0, 0.5],
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
    normal: [0, 0, -1],
    pointOnPlane: [0, 0, -0.5],
    name: 'back',
    area: getArea(backFaceVert),
    faceArea: bfaceInfo.faceArea
  }
  const a_Face = [ // 点所在的面的 索引
    21, 21, 21, 21,   // left
    1, 1, 1, 1,
    23, 23, 23, 23,
    12, 12, 12, 12,
    31, 31, 31, 31,
    9, 9, 9, 9,
    27, 27, 27, 27,
    6, 6, 6, 6,
    25, 25, 25, 25,

    24, 24, 24, 24,   // right
    4, 4, 4, 4,
    22, 22, 22, 22,
    10, 10, 10, 10,
    32, 32, 32, 32,
    11, 11, 11, 11,
    26, 26, 26, 26,
    7, 7, 7, 7,
    28, 28, 28, 28,


    23, 23, 23, 23,   // front
    2, 2, 2, 2,
    24, 24, 24, 24,
    9, 9, 9, 9,
    33, 33, 33, 33,
    10, 10, 10, 10,
    25, 25, 25, 25,
    5, 5, 5, 5,
    26, 26, 26, 26,

    22, 22, 22, 22,   // back
    3, 3, 3, 3,
    21, 21, 21, 21,
    11, 11, 11, 11,
    34, 34, 34, 34,
    12, 12, 12, 12,
    28, 28, 28, 28,
    8, 8, 8, 8,
    27, 27, 27, 27,

    21, 21, 21, 21,   // top
    3, 3, 3, 3,
    22, 22, 22, 22,
    1, 1, 1, 1,
    35, 35, 35, 35,
    4, 4, 4, 4,
    23, 23, 23, 23,
    2, 2, 2, 2,
    24, 24, 24, 24,

    25, 25, 25, 25,   // bottom
    5, 5, 5, 5,
    26, 26, 26, 26,
    6, 6, 6, 6,
    36, 36, 36, 36,
    7, 7, 7, 7,
    27, 27, 27, 27,
    8, 8, 8, 8,
    28, 28, 28, 28,
  ]
  const a_Color = new Array(216 * 3).fill(0.2)
  const gIndices = (pointCount: number): number[] => {
    const result = []
    const rectNum = pointCount / 4
    for (let i = 0; i < rectNum; i++) {
      const firstIdx = i * 4
      result.push(firstIdx, firstIdx + 1, firstIdx + 2, firstIdx, firstIdx + 2, firstIdx + 3)
    }
    return result
  }
  let indice = gIndices(216)
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
  return attr
}
function initTexVert(index: number) {
  // test
  const vert = {
    position: {
      data: [
        -0.5, 0, -0.5, -0.5, 0, 0.5, 0.5, 0, 0.5,
        -0.5, 0, -0.5, 0.5, 0, 0.5, 0.5, 0, -0.5
      ],
      size: 3,
    },
    texcoord: {
      data: [
        0, 0, 0, 1, 1, 1,
        0, 0, 1, 1, 1, 0
      ],
      size: 2
    },
    a_Face: {
      data: new Array(18).fill(40 + index)
    }
  }
  return vert
}
function updateHighlightFaceId() {
  let faceid = -1
  const face = getFace([cameraPos[0], cameraPos[1], cameraPos[2]], [leftFaceInfo, rightFaceInfo, topFaceInfo, backFaceInfo, frontFaceInfo, bottomFaceInfo])
  if (face) {
    const crossPt = calcPlaneLineCrossPoint(
      [cameraPos[0], cameraPos[1], cameraPos[2]],
      [cameraPos[0], cameraPos[1], cameraPos[2]], face.pointOnPlane, face.normal)
    if (crossPt) {
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
function getFaceId(crossPtOnFace: Point, faceInfo: FaceInfo): number {
  let result = -1
  const [x, y, z] = crossPtOnFace
  faceInfo.faceArea.map((area: XYZArea, index: number) => {
    if (
      (area.x[0] <= x && x <= area.x[1]) &&
      (area.y[0] <= y && y <= area.y[1]) &&
      (area.z[0] <= z && z <= area.z[1])
    ) {
      result = index
    }
  })

  return result
}

function getFace(position: Point, faceInfoAry: FaceInfo[]): FaceInfo | undefined {
  let face = undefined
  faceInfoAry.map((faceInfo) => {
    const crosPt = calcPlaneLineCrossPoint(position, position, faceInfo.pointOnPlane, faceInfo.normal)
    if (crosPt) {
      const [x1, y1, z1] = position
      const [x, y, z] = crosPt
      if (x1 * x >= 0 && y1 * y >= 0 && z1 * z >= 0) {
        const area = faceInfo.area
        if (
          (area.x[0] <= x && x <= area.x[1]) &&
          (area.y[0] <= y && y <= area.y[1]) &&
          (area.z[0] <= z && z <= area.z[1])
        ) {
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
} {
  let minX = +Infinity
  let maxX = -Infinity
  let minY = +Infinity
  let maxY = -Infinity
  let minZ = +Infinity
  let maxZ = -Infinity
  pointAry.map(pt => {
    const [x, y, z] = pt
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

function calcPlaneLineCrossPoint(
  pointOnLine: Point,
  lineDirection: Point,
  pointOnPlane: Point,
  planeNormalDirection: Point): false | Point {
  // 求线面交点
  const P1 = Vector3.create(...pointOnPlane)
  const P = Vector3.create(...pointOnLine)
  const lineDirVec3 = Vector3.create(...lineDirection)
  const planeNormalVec3 = Vector3.create(...planeNormalDirection)
  const D = lineDirVec3
  const D1 = planeNormalVec3
  if (Vector3.dot(lineDirVec3, planeNormalVec3) === 1) {
    // 线面平行
    return false
  }
  const m = ((P1[0] - P[0]) * D1[0] +
    (P1[1] - P[1]) * D1[1] +
    (P1[2] - P[2]) * D1[2]) /
    (D1[0] * D[0] + D1[1] * D[1] + D1[2] * D[2]);
  return [P[0] + D[0] * m, P[1] + D[1] * m, P[2] + D[2] * m]
}

function enableCamera(
  canvas: HTMLCanvasElement,
  gl: WebGLRenderingContext,
  callback = (camPos: twgl.v3.Vec3, faceId: number) => {
    //
  }
) {
  console.log(' enable came');
  let startMove = false
  let lastX: number
  let lastY: number
  let yaw = -90
  let pitch = -45

  const onMousemove = (e: MouseEvent) => {
    if (startMove) {
      const sensitivity = 0.5
      const { offsetX, offsetY } = e
      const offsetXx = (offsetX - lastX)
      const offsetYy = (offsetY - lastY) // 往上是正
      lastX = offsetX
      lastY = offsetY
      const xoffset = offsetXx * sensitivity
      const yoffset = offsetYy * sensitivity
      yaw += xoffset;
      pitch += yoffset;
      // NOTE: 仅绕圆环平面旋转
      // pitch += 0;

      if (pitch > 89)
        pitch = 89;
      if (pitch < -89)
        pitch = -89;

      //  绕圆心
      console.log(' newPitch ', pitch);
      const frontCamX = Math.cos(angleToRads(yaw)) * Math.cos(angleToRads(pitch)) * 5
      const frontCamY = Math.sin(angleToRads(pitch)) * 5
      const frontCamZ = Math.sin(angleToRads(yaw)) * Math.cos(angleToRads(pitch)) * 5

      const frontCamVec3 = Vector3.create(frontCamX, frontCamY, frontCamZ)
      cameraPos = frontCamVec3
      const faceid = updateHighlightFaceId()
      callback(cameraPos, faceid)
    } else {
      return
    }
  }
  const onMouseUp = (e: MouseEvent) => {
    startMove = false
    document.removeEventListener('mousemove', onMousemove)
    document.removeEventListener('mouseup', onMouseUp)
  }
  const onMousedown = (e: MouseEvent) => {
    startMove = true
    const { offsetX, offsetY } = e
    lastX = offsetX
    lastY = offsetY
    document.addEventListener('mousemove', onMousemove)
    document.addEventListener('mouseup', onMouseUp)
  }
  document.addEventListener('mousedown', onMousedown)
}
export default main
