
import * as twgl from 'twgl.js'
import FS_Accum from './oitAccum.frag'
import VS_Accum from './oitAccum.vert'
import FS_Draw from './oitDraw.frag'
import VS_Quad from './oitQuad.vert'

function main() {
  const canvas = document.getElementById('webgl') as HTMLCanvasElement;

  // Get the rendering context for WebGL
  const gl = twgl.getContext(canvas, {
    alpha: false,
  });

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.BLEND);
  gl.depthMask(false);

  if (!gl.getExtension("EXT_color_buffer_float")) {
    console.error("FLOAT color buffer not available");
    document.body.innerHTML = "This example requires EXT_color_buffer_float which is unavailable on this system."
  }

  const pAccumInfo = twgl.createProgramInfo(gl, [VS_Accum, FS_Accum])
  const pInfo = twgl.createProgramInfo(gl, [VS_Quad, FS_Draw])
  console.log(pAccumInfo);
  console.log(pInfo);

  const sphVert = twgl.primitives.createSphereVertices(0.5, 100, 100)
  console.log('sphVert', sphVert);
  const accumFbo = twgl.createFramebufferInfo(gl)
  console.log(' accumFbo ', accumFbo);





}

export default main
