declare module '*.glsl'
interface Window {
  getWebGLContext: (htmlDomEle: HTMLCanvasElement)=> WebGLRenderingContext
  initShaders: (gl: WebGLRenderingContext, VSHADER_SOURCE: string, FSHADER_SOURCE: string)=>boolean
  createProgram: (gl: WebGLRenderingContext, VSHADER_SOURCE: string, FSHADER_SOURCE: string)=>WebGLProgram
  Matrix4: new (value?: any) => any
}
interface WebGLRenderingContext{
  program: WebGLProgram
}
interface WebGLProgram{
  a_Position?: number
  a_Normal?: number
  u_MvpMatrix?: WebGLUniformLocation
  u_NormalMatrix?: WebGLUniformLocation
  a_TexCoord?: number
  u_Sampler?: WebGLUniformLocation
}
interface WebGLBuffer{
  num: number
  type: number
}
