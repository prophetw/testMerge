import * as twgl from 'twgl.js'
import { LookAtTrianglesWithKeys } from '../../ch07'
import { angleToRads } from '../../lib/utils'
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
    }) {
    this.gl = gl
    this.programInfo = twgl.createProgramInfo(gl, [VShaderSource, FShaderSource])
    this.program = this.programInfo.program
    this.bufferInfo = twgl.createBufferInfoFromArrays(this.gl, vertData)
    this.modelMatrix = options && options.modelMatrix || twgl.m4.identity()
    this.viewMatrix = options && options.viewMatrix || twgl.m4.identity()
    this.projectMatrix = options && options.projectMatrix || twgl.m4.identity()
    this.dftUniform = options && options.uniformData || {}
    this.textureAry = options && options.textureAry || undefined
    this.init()
  }
  setUniform(unif: {
    [key: string]: any;
  }): void {
    // first time set will record dft Uniform
    this.gl.useProgram(this.program)
    this.dftUniform = unif
    twgl.setUniforms(this.programInfo, unif)
  }
  updateUniform(unif: {
    [key: string]: any;
  }) {
    this.gl.useProgram(this.program)
    twgl.setUniforms(this.programInfo, unif)
  }
  reApplyUniform() {
    this.gl.useProgram(this.program)
    twgl.setUniforms(this.programInfo, this.dftUniform)
  }
  updateTexture() {
    if (this.textureAry) {
      twgl.setUniforms(this.programInfo, {
        u_texture: this.textureAry[0]
      })
    }
  }
  draw(beforeDraw = () => {
    //
  }) {
    this.gl.useProgram(this.program)
    beforeDraw()
    this.updateTexture()
    twgl.setBuffersAndAttributes(this.gl, this.programInfo, this.bufferInfo)
    twgl.drawBufferInfo(this.gl, this.bufferInfo)
  }
  updateCamera(cameraPos: twgl.v3.Vec3) {
    const cameraUp = Vector3.create(0, 1, 0)
    const camera = Matrix4.lookAt(cameraPos, Vector3.create(0, 0, 0), cameraUp);
    const viewMatrix = Matrix4.inverse(camera)
    this.updateMVP(undefined, viewMatrix, undefined)
  }
  updateMVP(
    modelMatrix?: twgl.m4.Mat4,
    viewMatrix?: twgl.m4.Mat4,
    projMatrix?: twgl.m4.Mat4
  ) {
    const mvpMatrix = twgl.m4.identity()
    const projMat4 = projMatrix || this.projectMatrix
    const modelMat4 = modelMatrix || this.modelMatrix
    const viewMat4 = viewMatrix || this.viewMatrix
    if (viewMatrix) {
      this.viewMatrix = viewMatrix
    }
    if (modelMatrix) {
      this.viewMatrix = modelMatrix
    }
    if (projMatrix) {
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
  init() {
    //
  }
}

type Num3Ary = [number, number, number]

class Frustum {
  // 截锥体 透视 正交
  fov: number
  near: number
  far: number
  aspect: number
  constructor(
    fov: number, // degree
    near = 0.1,
    far = 100,
    aspect = 1,
    mode = 'perspective'
  ) {
    this.fov = fov
    this.near = near
    this.far = far
    this.aspect = aspect
  }
  radianToDegree(rad: number) {
    // 弧度转角度
    return 180 / Math.PI * rad
  }
  degreeToRadian(deg: number) {
    // 角度转弧度
    // pi = 180
    return Math.PI / 180 * deg
  }
  getVal() {
    const rad = this.degreeToRadian(this.fov)
    // Matrix4.perspective() // 透视
    // Matrix4.ortho() // 正交
    // Matrix4.frustum()
    const res = Matrix4.perspective(rad, this.aspect, this.near, this.far)
    return res
  }
  updateVal(opt: {
    fov?: number, // degree
    near?: number,
    far?: number,
    aspect?: number,
  }) {
    const { fov, near, far, aspect } = opt
    if (fov !== undefined) {
      this.fov = fov
    }
    if (near !== undefined) {
      this.near = near
    }
    if (far !== undefined) {
      this.far = far
    }
    if (aspect !== undefined) {
      this.aspect = aspect
    }
    return this.getVal()
  }
}
class Camera {
  eye: Num3Ary
  target: Num3Ary
  cameraUp: Num3Ary
  camera: twgl.m4.Mat4
  canvas?: HTMLCanvasElement
  frustum?: twgl.m4.Mat4
  constructor(
    cameraOpt: {
      eye: Num3Ary,
      target: Num3Ary,
      cameraUp: Num3Ary,
    },
    canvas?: HTMLCanvasElement) {
    const { eye, target, cameraUp } = cameraOpt
    this.eye = eye
    this.target = target
    this.cameraUp = cameraUp
    this.camera = Matrix4.identity()
    this.canvas = canvas
  }
  getCamera() {
    this.camera = Matrix4.lookAt(this.eye, this.target, this.cameraUp)
  }
  getView() {
    this.getCamera()
    const inverseCamera = Matrix4.inverse(this.camera)
    return inverseCamera
  }
  setFrustum(frustum: twgl.m4.Mat4){
    this.frustum = frustum
  }
  updateView(opt: {
    eye?: Num3Ary
    target?: Num3Ary
    cameraUp?: Num3Ary
  }) {
    const { eye, target, cameraUp } = opt
    if (eye !== undefined) {
      this.eye = eye
    }
    if (target !== undefined) {
      this.target = target
    }
    if (cameraUp !== undefined) {
      this.cameraUp = cameraUp
    }
    return this.getView()
  }
  calcPV(){
    // frag final pos = perspective * view * model * position
    const view = this.getView()
    if(this.frustum!==undefined){
      const pv = Matrix4.multiply(this.frustum, view)
      return pv
    }else{
      throw new Error("frustum can not be undefined")
    }
  }
  enableMove(moveEndCallback = () => {
    //
  }) {
    let startMove = false
    let lastX: number
    let lastY: number
    let yaw = -90
    let pitch = -45
    const dom = this.canvas || document
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
        const frontCamX = Math.cos(angleToRads(yaw)) * Math.cos(angleToRads(pitch)) * 5
        const frontCamY = Math.sin(angleToRads(pitch)) * 5
        const frontCamZ = Math.sin(angleToRads(yaw)) * Math.cos(angleToRads(pitch)) * 5
        // const frontCamVec3 = Vector3.create(frontCamX, frontCamY, frontCamZ)
        this.updateView({
          eye: [frontCamX, frontCamY, frontCamZ]
        })
        moveEndCallback()
      } else {
        return
      }
    }
    const onMouseUp = (e: MouseEvent) => {
      startMove = false
      dom.removeEventListener('mousemove', onMousemove)
      dom.removeEventListener('mouseup', onMouseUp)
    }
    const onMousedown = (e: MouseEvent) => {
      startMove = true
      const { offsetX, offsetY } = e
      lastX = offsetX
      lastY = offsetY
      dom.addEventListener('mousemove', onMousemove)
      dom.addEventListener('mouseup', onMouseUp)
    }
    dom.addEventListener('mousedown', onMousedown)
  }
  destroy() {

  }
}

export {
  GraphicEngine,
  Camera,
  Frustum
}
