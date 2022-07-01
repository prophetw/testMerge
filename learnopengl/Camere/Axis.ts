import AXIS_VS from './Axis.vert'
import AXIS_FS from './Axis.frag'

function main (){

  document.title = 'axis demo'
  const canvas = document.getElementById('webgl') as HTMLCanvasElement;

  const gl = canvas.getContext('webgl')
  if(!gl){
    console.log(' get context failed ', gl);
    return
  }

  const program = createProgram(gl, AXIS_VS, AXIS_FS)
  if(!!program === false){
    console.log(' create program failed ');
    return
  }


  drawAxis(gl, program);

}

function logShaderVariable(gl: WebGLRenderingContext, program: WebGLProgram){
  const attrb:{
    [key: string]: any
  } = {
  }
  const total = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
  if(typeof total === 'number'){
    for(let i=0;i<total;++i){
      const attribInfo =  gl.getActiveAttrib(program, i)
      if(!attribInfo){
        break
      }
      attrb[attribInfo.name] = i
    }
  }
  // gl.createTexture()
  console.log(gl.getUniformLocation(program, 'u_sampler'));
  console.log(gl.getUniformLocation(program, 'u_test'));
  const totalUniform = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  if(typeof totalUniform === 'number'){
    for(let i=0;i<total;++i){
      const attribInfo =  gl.getActiveUniform(program, i)
      console.log(attribInfo);
      if(!attribInfo){
        break
      }
      attrb[attribInfo.name] = i
    }
  }
  console.log(' all shader attrb: ', attrb);

}

function drawAxis(gl: WebGLRenderingContext, program: WebGLProgram){

  gl.useProgram(program)
  gl.program = program
  logShaderVariable(gl, program)
  const axisVertics = [
     // axis            color
     0.0,  0.0,   0.0,  1.0,  1.0,  1.0,  // X
     1.0,  0.0,   0.0,  1.0,  0.0,  0.0,
     0.0,  0.0,   0.0,  1.0,  1.0,  1.0,  // Y
     0.0,  1.0,   0.0,  1.0,  0.0,  0.0,
     0.0,  0.0,   0.0,  1.0,  1.0,  1.0,  // Z
     0.0,  0.0,   1.0,  1.0,  0.0,  0.0,
  ]
  const axisBuff = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, axisBuff)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(axisVertics), gl.STATIC_DRAW)

  const aVertInfo = {
    a_Position: {},
    a_Color: {},
  }

  const uniformInfo = {
    u_ViewMatrix: {}
  }

}
export {
  drawAxis
}

export default main
