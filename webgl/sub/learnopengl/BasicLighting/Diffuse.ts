
import VSHADER_SOURCE from './Diffuse.vert';
import FSHADER_SOURCE from './Diffuse.frag';
import LIGHT_VS_SOURCE from './lightSource.vert';
import LIGHT_FS_SOURCE from './lightSource.frag';

// 漫反射光照(Diffuse Lighting)：模拟光源对物体的方向性影响(Directional Impact)。它是冯氏光照模型中视觉上最显著的分量。物体的某一部分越是正对着光源，它就会越亮。
let ambientNumber = 0.2; // 环境光系数 越大受环境光 影响越大

enum AngelType {
  'X','Y','Z'
}
type Angle = number
type ColorRGB = [number, number, number]
type TranslateXYZ = [number, number, number]
type VertexOptions = [...TranslateXYZ, Angle, AngelType, ...ColorRGB]

// cube transform  [x,y,z,angle,angelType]
const lightColor: ColorRGB = [1.0, 1.0, 1.0]  // white light
const lightPosi: TranslateXYZ = [8.0, -3.0, -20]
const cubeColor: ColorRGB = [0.0, 1.0, 0.0] // cube is green
const cubePosi: VertexOptions[] = [
  [ 0.0,  0.0,  0.0, 0, AngelType.X, ...cubeColor], // this is cube properties
  [...lightPosi, 0, AngelType.X, ...lightColor], // this is the light source
]
const defaultCameraPosition = {
  x: 0.8,
  y: -1.0,
  z: 5
}

// perspective options
const perspectiveOptions = {
  fov: 45,
  aspect: 1,
  near: 0.1,
  far: 100
}


let program1: WebGLProgram // for cube
let program2: WebGLProgram // for point light

function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl') as HTMLCanvasElement;
  document.title = 'diffuse + ambient 漫反射+环境光'

  // Get the rendering context for WebGL
  var gl = window.getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders

  program1 = createProgram(gl, VSHADER_SOURCE, FSHADER_SOURCE);
  if (!program1) {
    console.log('Failed to create program');
    return false;
  }
  gl.useProgram(program1)
  gl.program = program1


  program2 = createProgram(gl, LIGHT_VS_SOURCE, LIGHT_FS_SOURCE);
  if (!program2) {
    console.log('Failed to create program');
    return false;
  }


  // Set the vertex information
  // window.spector.startCapture(canvas, 10)
  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST)

  injectUI(gl)
  redraw(gl, cubePosi)

  enableCameraMoving(canvas,gl, ()=>{
    redraw(gl, cubePosi)
  })

}

function enableCameraMoving(canvas: HTMLCanvasElement, gl: WebGLRenderingContext, callback=()=>{
  // redraw callback
}){
  canvas.addEventListener('wheel', (e)=>{
    const {deltaY} = e
    const step = 1
    if(deltaY>0){
      // zoom out
      // defaultCameraPosition.z += 0.1
      const newFov = perspectiveOptions.fov + step
      perspectiveOptions.fov = Math.min(45, newFov)
      redraw(gl, cubePosi)
    }else{
      // zoom in
      // defaultCameraPosition.z -= 0.1
      const newFov = perspectiveOptions.fov-step
      perspectiveOptions.fov = Math.max(1, newFov)
      redraw(gl, cubePosi)
    }
  })
  // arrow left right up down
  document.addEventListener('keyup', (e: KeyboardEvent)=>{
    const {key} = e
    switch(key){
      case 'ArrowLeft': defaultCameraPosition.x -= 0.1; redraw(gl, cubePosi); break;
      case 'ArrowRight': defaultCameraPosition.x += 0.1; redraw(gl, cubePosi); break;
      case 'ArrowUp': defaultCameraPosition.y += 0.1; redraw(gl, cubePosi); break;
      case 'ArrowDown': defaultCameraPosition.y -= 0.1; redraw(gl, cubePosi); break;
      default: break;
    }
  })
}


function redraw(gl: WebGLRenderingContext, cubePosi: VertexOptions[]){
  gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT)
  for(let i=0; i< cubePosi.length; i++){
    if(i===0){
      gl.useProgram(program1)
      gl.program = program1
    }else{
      gl.useProgram(program2)
      gl.program = program2
    }
    console.log(cubePosi[i]);
    updateMVPMatrix(gl, cubePosi[i], defaultCameraPosition, undefined)
    gl.drawArrays(gl.TRIANGLES, 0, 36);
  }
}

function injectUI(gl: WebGLRenderingContext){
  const updateUI = (id: string, text: string)=>{
    const dom = document.getElementById(id)
    if(dom!==null){
      dom.innerHTML = ''+text
    }
  }
  const html = `
  <label for="ambient" style="width: 410px" class="form-label">current ambient: <span id="ambientNumber">${ambientNumber}</span></label>
  <input type="range" class="form-range" value="${ambientNumber}" step="0.01" min="0" max="1" id="ambient">
  <label for="lightX" style="width: 410px" class="form-label">current lightX: <span id="lightXV">${lightPosi[0]}</span></label>
  <input type="range" class="form-range" value="${lightPosi[0]}" step="1" min="-20" max="20" id="lightX">
  <label for="lightY" style="width: 410px" class="form-label">current lightY: <span id="lightYV">${lightPosi[1]}</span></label>
  <input type="range" class="form-range" value="${lightPosi[1]}" step="1" min="-20" max="20" id="lightY">
  <label for="lightZ" style="width: 410px" class="form-label">current lightZ: <span id="lightZV">${lightPosi[2]}</span></label>
  <input type="range" class="form-range" value="${lightPosi[2]}" step="1" min="-20" max="20" id="lightZ">

  `
  const div = document.createElement('div')
  div.innerHTML = html
  div.style.position = 'absolute'
  div.style.top = '410px'
  div.style.right = '0px'
  document.body.appendChild(div)
  const ambient = document.getElementById('ambient')
  if(ambient){
    ambient.addEventListener('change', (e)=>{
      if(e && e.target && e.target.value){
        console.log(' ambient ', e.target.value);
        ambientNumber = e.target.value
        updateUI('ambientNumber', ''+ambientNumber)
        redraw(gl, cubePosi)
      }
    })
  }
  const lightX = document.getElementById('lightX')
  if(lightX){
    lightX.addEventListener('change', e=>{
      if(e && e.target && e.target.value){
        console.log(' lightX ', e.target.value);
        lightPosi[0] = e.target.value
        cubePosi[1][0]=lightPosi[0]
        updateUI('lightXV', ''+lightPosi[0])
        redraw(gl, cubePosi)
      }
    })
  }
  const lightY = document.getElementById('lightY')
  if(lightY){
    lightY.addEventListener('change', e=>{
      if(e && e.target && e.target.value){
        console.log(' lightY ', e.target.value);
        lightPosi[1] = e.target.value
        cubePosi[1][1]=lightPosi[1]
        updateUI('lightYV', ''+lightPosi[1])
        redraw(gl, cubePosi)
      }
    })
  }
  const lightZ = document.getElementById('lightZ')
  if(lightZ){
    lightZ.addEventListener('change', e=>{
      if(e && e.target && e.target.value){
        console.log(' lightZ ', e.target.value);
        lightPosi[2] = e.target.value
        cubePosi[1][2]=lightPosi[2]
        updateUI('lightZV', ''+lightPosi[2])
        redraw(gl, cubePosi)
      }
    })
  }
}


function initVertexBuffers(gl: WebGLRenderingContext) {
  var verticesTexCoords = new Float32Array([
   //    Vertex,       normal vector
   -0.5, -0.5, -0.5,  0.0,  0.0, -1.0,
   0.5, -0.5, -0.5,  0.0,  0.0, -1.0,
   0.5,  0.5, -0.5,  0.0,  0.0, -1.0,
   0.5,  0.5, -0.5,  0.0,  0.0, -1.0,
  -0.5,  0.5, -0.5,  0.0,  0.0, -1.0,
  -0.5, -0.5, -0.5,  0.0,  0.0, -1.0,

  -0.5, -0.5,  0.5,  0.0,  0.0,  1.0,
   0.5, -0.5,  0.5,  0.0,  0.0,  1.0,
   0.5,  0.5,  0.5,  0.0,  0.0,  1.0,
   0.5,  0.5,  0.5,  0.0,  0.0,  1.0,
  -0.5,  0.5,  0.5,  0.0,  0.0,  1.0,
  -0.5, -0.5,  0.5,  0.0,  0.0,  1.0,

  -0.5,  0.5,  0.5, -1.0,  0.0,  0.0,
  -0.5,  0.5, -0.5, -1.0,  0.0,  0.0,
  -0.5, -0.5, -0.5, -1.0,  0.0,  0.0,
  -0.5, -0.5, -0.5, -1.0,  0.0,  0.0,
  -0.5, -0.5,  0.5, -1.0,  0.0,  0.0,
  -0.5,  0.5,  0.5, -1.0,  0.0,  0.0,

   0.5,  0.5,  0.5,  1.0,  0.0,  0.0,
   0.5,  0.5, -0.5,  1.0,  0.0,  0.0,
   0.5, -0.5, -0.5,  1.0,  0.0,  0.0,
   0.5, -0.5, -0.5,  1.0,  0.0,  0.0,
   0.5, -0.5,  0.5,  1.0,  0.0,  0.0,
   0.5,  0.5,  0.5,  1.0,  0.0,  0.0,

  -0.5, -0.5, -0.5,  0.0, -1.0,  0.0,
   0.5, -0.5, -0.5,  0.0, -1.0,  0.0,
   0.5, -0.5,  0.5,  0.0, -1.0,  0.0,
   0.5, -0.5,  0.5,  0.0, -1.0,  0.0,
  -0.5, -0.5,  0.5,  0.0, -1.0,  0.0,
  -0.5, -0.5, -0.5,  0.0, -1.0,  0.0,

  -0.5,  0.5, -0.5,  0.0,  1.0,  0.0,
   0.5,  0.5, -0.5,  0.0,  1.0,  0.0,
   0.5,  0.5,  0.5,  0.0,  1.0,  0.0,
   0.5,  0.5,  0.5,  0.0,  1.0,  0.0,
  -0.5,  0.5,  0.5,  0.0,  1.0,  0.0,
  -0.5,  0.5, -0.5,  0.0,  1.0,  0.0
  ])
  var n = 36; // The number of vertices

  // Create the buffer object
  var vertexTexCoordBuffer = gl.createBuffer();
  if (!vertexTexCoordBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoords, gl.STATIC_DRAW);

  var FSIZE = verticesTexCoords.BYTES_PER_ELEMENT;
  //Get the storage location of a_Position, assign and enable buffer
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
  gl.enableVertexAttribArray(a_Position);  // Enable the assignment of the buffer object

  //Get the storage location of a_Normal, assign and enable buffer
  var a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if (a_Normal < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
  gl.enableVertexAttribArray(a_Normal);  // Enable the assignment of the buffer object

  return n;
}

function updateMVPMatrix(gl: WebGLRenderingContext,
  translate: VertexOptions,
  cameraPosition={
    x: 0,
    y: 0,
    z: 5
  },
  perspectiveOptions = {
    fov: 45,
    aspect: 1,
    near: 0.1,
    far: 100
  }
  ){

  var modelMatrix = new window.Matrix4(); // Model matrix
  var viewMatrix = new window.Matrix4();  // View matrix
  var projMatrix = new window.Matrix4();  // Projection matrix
  // Calculate the model, view and projection matrices
  const [x, y, z, angle, angleType, r, g, b ] = translate
  switch(angleType){
    case AngelType.X: modelMatrix.rotate(angle, 1, 0, 0); break;
    case AngelType.Y: modelMatrix.rotate(angle, 0, 1, 0); break;
    case AngelType.Z: modelMatrix.rotate(angle, 0, 0, 1); break;
    default: break;
  }
  if(gl.program === program2){
    // scale light
    modelMatrix.scale(0.1,0.1,0.1)
  }
  modelMatrix.translate(x, y, z);
  console.log('cameraPosition', cameraPosition);
  console.log('pers', perspectiveOptions);
  viewMatrix.setLookAt(cameraPosition.x, cameraPosition.y, cameraPosition.z, 0, 0, -100, 0, 1, 0);
  projMatrix.setPerspective(perspectiveOptions.fov, perspectiveOptions.aspect, perspectiveOptions.near, perspectiveOptions.far);
  // Calculate the model view projection matrix
  // mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);

  var u_model = gl.getUniformLocation(gl.program, 'model');
  if (!u_model) {
    console.log('Failed to get the storage location of u_MvpMatrix4', u_model);
    return -1;
  }
  gl.uniformMatrix4fv(u_model, false, modelMatrix.elements)

  var u_view = gl.getUniformLocation(gl.program, 'view');
  if (!u_view) {
    console.log('Failed to get the storage location of u_view', u_view);
    return -1;
  }
  gl.uniformMatrix4fv(u_view, false, viewMatrix.elements)

  var u_projection = gl.getUniformLocation(gl.program, 'projection');
  if (!u_projection) {
    console.log('Failed to get the storage location of u_projection', u_projection);
    return -1;
  }
  gl.uniformMatrix4fv(u_projection, false, projMatrix.elements)

  if(gl.program === program1){
    const normalMatrix4 = new window.Matrix4()
    normalMatrix4.setInverseOf(modelMatrix)
    normalMatrix4.transpose()

    var u_normalMat4 = gl.getUniformLocation(gl.program, 'normalMat4');
    if (!u_normalMat4) {
      console.log('Failed to get the storage location of u_normalMat4', u_normalMat4);
      return -1;
    }
    gl.uniformMatrix4fv(u_normalMat4, false, normalMatrix4.elements)


    var u_objectColor = gl.getUniformLocation(gl.program, 'objectColor');
    if (!u_objectColor) {
      console.log('Failed to get the storage location of objectColor');
      return -1;
    }
    gl.uniform3f(u_objectColor, r, g, b)

    var u_lightColor = gl.getUniformLocation(gl.program, 'lightColor');
    if (!u_lightColor) {
      console.log('Failed to get the storage location of lightColor');
      return -1;
    }
    const [r1,g1,b1] = lightColor
    gl.uniform3f(u_lightColor, r1,g1,b1)

    var u_lightPos = gl.getUniformLocation(gl.program, 'lightPos');
    console.log(u_lightPos);
    if (!u_lightPos) {
      console.log('Failed to get the storage location of lightPos');
      return -1;
    }
    const [lightX, lightY, lightZ] = lightPosi
    gl.uniform3f(u_lightPos, lightX, lightY, lightZ)

    var u_ambientNumber = gl.getUniformLocation(gl.program, 'ambientNumber');
    if (!u_ambientNumber) {
      console.log('Failed to get the storage location of ambientNumber');
      return -1;
    }
    gl.uniform1f(u_ambientNumber, ambientNumber)
  }
}


export default main
