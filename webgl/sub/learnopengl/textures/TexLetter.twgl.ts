import FSHADER_SOURCE from './TexLetter.frag'
import VSHADER_SOURCE from './TexLetter.vert'
import * as twgl from 'twgl.js'
import { angleToRads } from '../../lib/utils'

const Matrix4 = twgl.m4
const Vector3 = twgl.v3

let u_matrix = Matrix4.identity() // model view project matrix4


// 借鉴自 https://webglfundamentals.org/webgl/lessons/webgl-cube-maps.html

// 鼠标移入 高亮部分


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
    const ctx = document.createElement("canvas").getContext("2d");
    if(ctx ===null) return []
    ctx.canvas.width = 128;
    ctx.canvas.height = 128;
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
      const {faceColor, textColor, text} = faceInfo;
      await generateFace(ctx, faceColor, textColor, text, './resources/tex4.jpg');
      // show the result
      console.log(' text ----- ', text);
      const img = await getImgEle(ctx)
      img.imgElement.alt = text
      imgAry.push(img)
    }));
    console.log(' canvas ', imgAry);
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

  draw(gl, programInfo, imgAry)

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
