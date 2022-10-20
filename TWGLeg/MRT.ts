
import FSMRT from './MRT.frag'
import VSMRT from './MRT.vert'
import FSMRTDraw from './MRTDraw.frag'
import VSMRTDraw from './MRTDraw.vert'



import * as twgl from 'twgl.js';
import { angleToRads } from '../lib/utils';
import { Camera, Frustum } from '../src/utils/utils';
const Matrix4 = twgl.m4
const Vector3 = twgl.v3

const dftPos = Vector3.normalize(Vector3.create(1, 1, 1))
let cameraPos = Vector3.create(dftPos[0] * 5, dftPos[1] * 5, dftPos[2] * 5)
console.log(cameraPos);

function main() {
  const canvas = document.getElementById('webgl') as HTMLCanvasElement;

  // Get the rendering context for WebGL
  const gl = twgl.getContext(canvas, {
    alpha: false,
  });
  const ext = gl.getExtension("ANGLE_instanced_arrays");
  const m4 = twgl.m4;
  twgl.addExtensionsToContext(gl);
  if (ext !== null) {
    // @ts-ignore
    gl.drawArraysInstanced = ext?.drawArraysInstancedANGLE
  }
  const drawBuffers = gl.getExtension("WEBGL_draw_buffers");
  console.log(' --- drawBuffers', drawBuffers);
  if (drawBuffers !== null) {
    // @ts-ignore
    gl.drawBuffers = drawBuffers.drawBuffersWEBGL
  }
  // @ts-ignore
  if (!gl.drawArraysInstanced || !gl.createVertexArray) {
    alert("need drawArraysInstanced and createVertexArray"); // eslint-disable-line
    return;
  }
  const MRTInfo = twgl.createProgramInfo(gl, [VSMRT, FSMRT]);
  const MRTDrawpInfo = twgl.createProgramInfo(gl, [VSMRTDraw, FSMRTDraw]);
  console.log(' MRT ', MRTInfo);
  console.log(" draw ", MRTDrawpInfo);
  window.spector.startCapture(canvas, 1000)
  const arrays = twgl.primitives.createPlaneVertices()
  console.log('plane vertics ', arrays);


  const perspective = new Frustum(30, 0.01, 100, 1).getVal()
  const cameraObj = new Camera({
    eye: [1, 1, 1], target: [0, 0, 0], cameraUp: [0, 1, 0]
  }, canvas)

  cameraObj.enableMove(() => {
    // const pv = cameraObj.calcPV()
  })
  cameraObj.setFrustum(perspective)
  const pv = cameraObj.calcPV()
  const modelMat4 = Matrix4.identity()
  const u_MvpMatrix = Matrix4.multiply(pv, modelMat4)
  const uniforms = {
    u_MvpMatrix
  }

  Object.assign(arrays, {
    color: {
      data: [
        1.0, 0.0, 0.0,
      ],
      numComponents: 3,
      divisor: 1
    }
  })
  const bInfo = twgl.createBufferInfoFromArrays(gl, arrays)
  twgl.createTextures(gl, {
    face: { src: 'https://th.bing.com/th/id/OIP.Russj_ScHRzeGEodKscxEgHaEo?pid=ImgDet&rs=1' }
  }, (err, data) => {
    console.log(' data ', data);

    //===============
    // draw in framebuffer
    //===============
    const { RGBA, UNSIGNED_BYTE, LINEAR,NEAREST, DEPTH_STENCIL, CLAMP_TO_EDGE } = gl
    const attachments = [
      { format: gl.RGBA, type: UNSIGNED_BYTE, min: NEAREST, wrap: gl.CLAMP_TO_EDGE },
      { format: RGBA, type: UNSIGNED_BYTE, min: NEAREST, wrap: CLAMP_TO_EDGE },
      { format: RGBA, type: UNSIGNED_BYTE, min: NEAREST, wrap: CLAMP_TO_EDGE },
      { format: RGBA, type: UNSIGNED_BYTE, min: NEAREST, wrap: CLAMP_TO_EDGE },
      { format: DEPTH_STENCIL, },
    ];
    const fbi = twgl.createFramebufferInfo(gl, attachments);
    // 写入到 fragshader gl_FragData[0,1,2,3]
    gl.drawBuffers([
      gl.COLOR_ATTACHMENT0,
      gl.COLOR_ATTACHMENT1,
      gl.COLOR_ATTACHMENT2,
      gl.COLOR_ATTACHMENT3,
    ]);
    twgl.resizeCanvasToDisplaySize(canvas)
    console.log(' fbi ', fbi);
    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    twgl.setBuffersAndAttributes(gl, MRTInfo, bInfo)
    gl.useProgram(MRTInfo.program)
    uniforms.texture0 = data.face
    twgl.setUniforms(MRTInfo, uniforms)
    gl.clear(gl.COLOR_BUFFER_BIT)
    twgl.drawBufferInfo(gl, bInfo, gl.TRIANGLES, bInfo.numElements, undefined, 1)
    // gl.drawBuffers([

    // ])


    //===============
    // draw in canvas
    //===============
    const vertexArrayInfo = twgl.createVertexArrayInfo(gl, MRTDrawpInfo, bInfo);
    console.log('vertexArrayInfo', vertexArrayInfo);

    twgl.bindFramebufferInfo(gl, null)
    twgl.resizeCanvasToDisplaySize(canvas)

    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.enable(gl.DEPTH_TEST)

    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, fbi.attachments[0]); // frameBuffer COLOR_ATTACHMENT0)
    gl.activeTexture(gl.TEXTURE2)
    gl.bindTexture(gl.TEXTURE_2D, fbi.attachments[1]); // frameBuffer COLOR_ATTACHMENT0)
    gl.activeTexture(gl.TEXTURE3)
    gl.bindTexture(gl.TEXTURE_2D, fbi.attachments[2]); // frameBuffer COLOR_ATTACHMENT0)
    gl.activeTexture(gl.TEXTURE4)
    gl.bindTexture(gl.TEXTURE_2D, fbi.attachments[3]); // frameBuffer COLOR_ATTACHMENT0)

    uniforms.tex0 = fbi.attachments[0]
    uniforms.tex1 = fbi.attachments[1]
    // uniforms.tex2 = fbi.attachments[2]
    // uniforms.tex3 = fbi.attachments[3]
    // gl.useProgram(MRTDrawpInfo.program)
    twgl.setBuffersAndAttributes(gl, MRTDrawpInfo, bInfo)
    gl.useProgram(MRTDrawpInfo.program)
    twgl.setUniforms(MRTDrawpInfo, uniforms)
    gl.clear(gl.COLOR_BUFFER_BIT)
    twgl.drawBufferInfo(gl, vertexArrayInfo, gl.TRIANGLES, vertexArrayInfo.numElements, undefined, 1)

  })
  // const vertBufferInf = twgl.createBu



}
export default main
