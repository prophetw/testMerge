import * as twgl from 'twgl.js'
const Vector3 = twgl.v3
const Matrix4 = twgl.m4

class GraphicEngine {
  bufferInfo: twgl.BufferInfo
  gl: WebGLRenderingContext
  programInfo: twgl.ProgramInfo
  program: WebGLProgram
  modelMatrix: twgl.m4.Mat4
  viewMatrix: twgl.m4.Mat4
  projectMatrix: twgl.m4.Mat4
  textureAry?: WebGLTexture[]
  dftUniform: {
    [key: string]: any;
  }
  constructor(
    gl: WebGLRenderingContext,
    vertData: twgl.Arrays,
    VShaderSource: string,
    FShaderSource: string,
    options?: {
      modelMatrix?: twgl.m4.Mat4
      viewMatrix?: twgl.m4.Mat4
      projectMatrix?: twgl.m4.Mat4
      uniformData?: {
        [key: string]: any;
      },
      textureAry?: WebGLTexture[]
    }){
    this.gl = gl
    this.programInfo = twgl.createProgramInfo(gl, [VShaderSource, FShaderSource])
    this.program = this.programInfo.program
    this.bufferInfo = twgl.createBufferInfoFromArrays(this.gl, vertData)
    this.modelMatrix = options && options.modelMatrix ||  twgl.m4.identity()
    this.viewMatrix = options && options.viewMatrix || twgl.m4.identity()
    this.projectMatrix = options && options.projectMatrix || twgl.m4.identity()
    this.dftUniform = options && options.uniformData || {}
    this.textureAry = options && options.textureAry || undefined
    this.init()
  }
  setUniform(unif: {
    [key: string]: any;
  }): void{
    // first time set will record dft Uniform
    this.gl.useProgram(this.program)
    this.dftUniform = unif
    twgl.setUniforms(this.programInfo, unif)
  }
  updateUniform(unif: {
    [key: string]: any;
  }){
    this.gl.useProgram(this.program)
    twgl.setUniforms(this.programInfo, unif)
  }
  reApplyUniform(){
    this.gl.useProgram(this.program)
    twgl.setUniforms(this.programInfo, this.dftUniform)
  }
  updateTexture(){
    if(this.textureAry){
      twgl.setUniforms(this.programInfo, {
        u_texture: this.textureAry[0]
      })
    }
  }
  draw(beforeDraw=()=>{
    //
  }){
    this.gl.useProgram(this.program)
    beforeDraw()
    this.updateTexture()
    twgl.setBuffersAndAttributes(this.gl, this.programInfo, this.bufferInfo)
    twgl.drawBufferInfo(this.gl, this.bufferInfo)
  }
  updateCamera(cameraPos: twgl.v3.Vec3){
    const cameraUp = Vector3.create(0, 1, 0)
    const camera = Matrix4.lookAt(cameraPos, Vector3.create(0,0,0), cameraUp);
    const viewMatrix = Matrix4.inverse(camera)
    this.updateMVP(undefined,viewMatrix, undefined)
  }
  updateMVP(
    modelMatrix?: twgl.m4.Mat4,
    viewMatrix?: twgl.m4.Mat4,
    projMatrix?: twgl.m4.Mat4
  ){
    const mvpMatrix = twgl.m4.identity()
    const projMat4 = projMatrix || this.projectMatrix
    const modelMat4 = modelMatrix || this.modelMatrix
    const viewMat4 = viewMatrix || this.viewMatrix
    if(viewMatrix){
      this.viewMatrix = viewMatrix
    }
    if(modelMatrix){
      this.viewMatrix = modelMatrix
    }
    if(projMatrix){
      this.projectMatrix = projMatrix
    }
    twgl.m4.multiply(viewMat4, modelMat4, mvpMatrix)
    twgl.m4.multiply(projMat4, mvpMatrix, mvpMatrix)
    // console.log('viewMat4, modelMat4, mvpMatrix');
    // console.log(viewMat4, modelMat4, mvpMatrix);
    this.setUniform({
      model: modelMat4,
      view: viewMat4,
      project: projMat4,
      u_MvpMatrix: mvpMatrix
    })
  }
  init(){
    //
  }
}

export {
  GraphicEngine
}
