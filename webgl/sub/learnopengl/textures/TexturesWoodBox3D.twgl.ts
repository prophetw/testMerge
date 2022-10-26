import FSHADER_SOURCE from './TexturesWoodBox3D.frag'
import VSHADER_SOURCE from './TexturesWoodBox3D.vert'
import * as twgl from 'twgl.js'
import { angleToRads } from '../../lib/utils'

const Matrix4 = twgl.m4
const Vector3 = twgl.v3

let u_MvpMatrix4 = Matrix4.identity() // model view project matrix4

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

  draw(gl, programInfo)

  const render = (time: number)=>{
    updateMVPMatrix(time)
    twgl.setUniforms(programInfo, {
      u_MvpMatrix4
    })
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT)
    gl.drawArrays(gl.TRIANGLES, 0, 36)
    requestAnimationFrame(render)
  }
  requestAnimationFrame(render)
}

function draw(gl: WebGLRenderingContext, programInfo: twgl.ProgramInfo, mvp?: twgl.m4.Mat4){
  gl.useProgram(programInfo.program)
  const vertics = [
    // vert            // texCoord
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
  ]
  const texCoord = [
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
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    0.0, 1.0,
    0.0, 0.0,
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
  ]
  const attr = {
    a_Position: {
      data: vertics,
      size: 3,
    },
    a_TexCoord: {
      data: texCoord,
      size: 2,
    }
  }
  const bufferInfo = twgl.createBufferInfoFromArrays(gl, attr)
  console.log(' bufferInfo ', bufferInfo);
  twgl.setBuffersAndAttributes(gl, programInfo,  bufferInfo)

  twgl.createTextures(gl, {
    woodbox: {
      src: './resources/container.jpg',
      flipY: 1,
      min: gl.LINEAR,
      mag: gl.LINEAR,
      wrapS: gl.REPEAT,
      wrapT: gl.REPEAT,
    },
    face: {
      src: './resources/awesomeface.png',
    },
  }, (err, textures)=>{
    if(err){
      throw new Error('twgl.createTextures error ')
    }
    updateMVPMatrix(0)
    const uniformData = {
      u_MvpMatrix4: mvp ? mvp : u_MvpMatrix4,
      u_Sampler0: textures.woodbox,
      u_Sampler1: textures.face
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
  u_MvpMatrix4 = Matrix4.multiply(viewProj, modelMatrix)
}


export default main
