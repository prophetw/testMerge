import FSHADER_SOURCE from './Textures10WoodBox3D.frag'
import VSHADER_SOURCE from './Textures10WoodBox3D.vert'
import * as twgl from 'twgl.js'
import { angleToRads } from '../../lib/utils'
const Matrix4 = twgl.m4
const Vector3 = twgl.v3


type AngelType = 'X' | 'Y' | 'Z'
type Angle= number

let dftMixVal = 0.2
let u_MvpMatrix = Matrix4.identity()
const cubePosi: [number,number,number, AngelType, Angle][] = [
  [ 0.0,  0.0,  0.0, 'X', 10],
  [ 2.0,  5.0, -15.0, 'Z', 10],
  [-1.5, -2.2, -2.5, 'Y', 10],
  [-3.8, -2.0, -12.3, 'X', 70],
  [ 2.4, -0.4, -3.5, 'Z', 45],
  [-1.7,  3.0, -7.5, 'Y', 40],
  [ 1.3, -2.0, -2.5, 'X', 20],
  [ 1.5,  2.0, -2.5, 'Y', 10],
  [ 1.5,  0.2, -1.5, 'Z', 60],
  [-1.3,  1.0, -1.5, 'X', 10]
]

function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl') as HTMLCanvasElement;

  // Get the rendering context for WebGL
  var gl = window.getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  const programInfo = twgl.createProgramInfo(gl, [VSHADER_SOURCE, FSHADER_SOURCE])
  console.log(' programInfo ==== ', programInfo);

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST)

  changeMixVal(gl, programInfo)
  draw(gl, programInfo)
}

function changeMixVal(gl: WebGLRenderingContext, programInfo: twgl.ProgramInfo){
  document.addEventListener('keyup', e=>{
    if(e.code === "ArrowUp"){
      dftMixVal+=0.1
      draw(gl, programInfo)
    }
    if(e.code === "ArrowDown"){
      dftMixVal-=0.1
      draw(gl, programInfo)
    }
  })

}

function draw(gl: WebGLRenderingContext, programInfo: twgl.ProgramInfo){
  gl.useProgram(programInfo.program)
  const attribData = {
    a_Position: {
      data: [
        -0.5, -0.5, -0.5,
        0.5, -0.5, -0.5,
        0.5,  0.5, -0.5,
        0.5,  0.5, -0.5,
        -0.5,  0.5, -0.5,
        -0.5, -0.5, -0.5,

        -0.5, -0.5,  0.5,
        0.5, -0.5,  0.5,
        0.5,  0.5,  0.5,
        0.5,  0.5,  0.5,
        -0.5,  0.5,  0.5,
        -0.5, -0.5,  0.5,

        -0.5,  0.5,  0.5,
        -0.5,  0.5, -0.5,
        -0.5, -0.5, -0.5,
        -0.5, -0.5, -0.5,
        -0.5, -0.5,  0.5,
        -0.5,  0.5,  0.5,

        0.5,  0.5,  0.5,
        0.5,  0.5, -0.5,
        0.5, -0.5, -0.5,
        0.5, -0.5, -0.5,
        0.5, -0.5,  0.5,
        0.5,  0.5,  0.5,

        -0.5, -0.5, -0.5,
        0.5, -0.5, -0.5,
        0.5, -0.5,  0.5,
        0.5, -0.5,  0.5,
        -0.5, -0.5,  0.5,
        -0.5, -0.5, -0.5,

        -0.5,  0.5, -0.5,
        0.5,  0.5, -0.5,
        0.5,  0.5,  0.5,
        0.5,  0.5,  0.5,
        -0.5,  0.5,  0.5,
        -0.5,  0.5, -0.5,
      ],
      size: 3
    },
    a_TexCoord: {
      data: [
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        1.0, 1.0,
        0.0, 1.0,
        0.0, 0.0,

        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        1.0, 1.0,
        0.0, 1.0,
      - 0.0, 0.0,

        1.0, 0.0,
        1.0, 1.0,
      - 0.0, 1.0,
      - 0.0, 1.0,
      - 0.0, 0.0,
        1.0, 0.0,

        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        0.0, 1.0,
        0.0, 0.0,
        1.0, 0.0,

        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,
        1.0, 0.0,
        0.0, 0.0,
        0.0, 1.0,

        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,
        1.0, 0.0,
        0.0, 0.0,
        0.0, 1.0
      ],
      size: 2
    }
  }
  const bufferInfo = twgl.createBufferInfoFromArrays(gl, attribData)
  twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo)

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
      throw new Error(' createTextures error ')
    }

    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    for(let i=0; i<cubePosi.length; i++){
      updateMVPMatrix(cubePosi[i])
      const uniformData = {
        u_MixVal: dftMixVal,
        u_Sampler0: textures.wood,
        u_Sampler1: textures.face,
        u_MvpMatrix4: u_MvpMatrix
      }
      twgl.setUniforms(programInfo, uniformData)
      twgl.drawBufferInfo(gl, bufferInfo, gl.TRIANGLES)
    }
  })

}


function updateMVPMatrix(translate: [number,number,number, AngelType, number]){
  var modelMatrix = Matrix4.identity(); // Model matrix
  let viewMatrix = Matrix4.identity();  // View matrix
  var projMatrix = Matrix4.identity();  // Projection matrix

  const [x, y, z, type, angle] = translate
  switch(type){
    case 'X': Matrix4.rotateX(modelMatrix, angleToRads(angle), modelMatrix); break;
    case 'Y': Matrix4.rotateY(modelMatrix, angleToRads(angle), modelMatrix); break;
    case 'Z': Matrix4.rotateY(modelMatrix, angleToRads(angle), modelMatrix); break;
    default: break;
  }
  // Calculate the model, view and projection matrices
  const trans = Vector3.create(x, y, z)
  Matrix4.translate(modelMatrix, trans, modelMatrix);

  const eye = Vector3.create(0, 0, 5)
  const target = Vector3.create(0, 0, -100)
  const cameraUp = Vector3.create(0, 1, 0)

  Matrix4.lookAt(eye, target, cameraUp, viewMatrix);
  viewMatrix = Matrix4.inverse(viewMatrix)
  Matrix4.perspective(angleToRads(45), 1, 1, 100, projMatrix);
  // Calculate the model view projection matrix
  const temp = Matrix4.multiply(projMatrix, viewMatrix)
  u_MvpMatrix = Matrix4.multiply(temp, modelMatrix)
}


export default main
