import FSHADER_SOURCE from './cube.frag.glsl'
import VSHADER_SOURCE from './cube.vert.glsl'

import LightSourceFS from './lightSource.frag.glsl'
import LightSourceVS from './lightSource.vert.glsl'



enum AngelType {
  'X','Y','Z'
}
type Angle = number
type ColorRGB = [number, number, number]
type TranslateXYZ = [number, number, number]
type VertexOptions = [...TranslateXYZ, Angle, AngelType, ...ColorRGB]

// cube transform  [x,y,z,angle,angelType]
const lightColor: ColorRGB = [0.0, 1.0, 0.0]
const lightPosi: TranslateXYZ = [-1.5, -2.2, -20]
const cubeColor: ColorRGB = [1.0, 0.5, 1.0]
const cubePosi: VertexOptions[] = [
  [ 0.0,  0.0,  0.0, 0, AngelType.X, ...cubeColor],
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


let program1: WebGLProgram
let program2: WebGLProgram

function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl') as HTMLCanvasElement;

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


  program2 = createProgram(gl, LightSourceVS, LightSourceFS);
  if (!program2) {
    console.log('Failed to create program');
    return false;
  }

  // if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
  //   console.log('Failed to intialize shaders.');
  //   return;
  // }

  // Set the vertex information
  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  gl.clearColor(0.1, 0.1, 0.15, 1.0);
  gl.enable(gl.DEPTH_TEST)

  // scroll event   => change camera z
  canvas.addEventListener('wheel', (e)=>{
    const {deltaY} = e
    const step = 1
    if(deltaY>0){
      // zoom out
      // defaultCameraPosition.z += 0.1
      const newFov = perspectiveOptions.fov + step
      perspectiveOptions.fov = Math.min(45, newFov)
      updateAll(gl, cubePosi, defaultCameraPosition, perspectiveOptions)
    }else{
      // zoom in
      // defaultCameraPosition.z -= 0.1
      const newFov = perspectiveOptions.fov-step
      perspectiveOptions.fov = Math.max(1, newFov)
      updateAll(gl, cubePosi, defaultCameraPosition, perspectiveOptions)
    }
  })
  // arrow left right up down
  document.addEventListener('keyup', (e: KeyboardEvent)=>{
    const {key} = e
    switch(key){
      case 'ArrowLeft': defaultCameraPosition.x -= 0.1; updateAll(gl, cubePosi, defaultCameraPosition, perspectiveOptions); break;
      case 'ArrowRight': defaultCameraPosition.x += 0.1; updateAll(gl, cubePosi, defaultCameraPosition, perspectiveOptions); break;
      case 'ArrowUp': defaultCameraPosition.y += 0.1; updateAll(gl, cubePosi, defaultCameraPosition, perspectiveOptions); break;
      case 'ArrowDown': defaultCameraPosition.y -= 0.1; updateAll(gl, cubePosi, defaultCameraPosition, perspectiveOptions); break;
      default: break;
    }
  })

  // if (!initTextures(gl, n, sr)) {
  //   console.log('Failed to intialize the texture.');
  //   return;
  // }
  injectUI(gl)
  resetCameraPosition(gl, cubePosi)

}


function resetCameraPosition(gl: WebGLRenderingContext, cubePosi: VertexOptions[]){
  defaultCameraPosition.x = 0.8
  defaultCameraPosition.y = -1.0
  defaultCameraPosition.z = 5
  perspectiveOptions.fov = 45
  gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT)
  for(let i=0; i<cubePosi.length; i++){
    if(i===0){
      gl.useProgram(program1)
      gl.program = program1
    }else{
      gl.useProgram(program2)
      gl.program = program2
    }
    updateMVPMatrix(gl, cubePosi[i], defaultCameraPosition, undefined, i)
    gl.drawArrays(gl.TRIANGLES, 0, 36);
  }
}
function updateAll(gl: WebGLRenderingContext,
  cubePosi: VertexOptions[],
  cameraPosition: {x: number,y: number,z: number}, perspectiveOptions: {
  fov: number;
  aspect: number;
  near: number;
  far: number;
}){
  gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT)
  for(let i=0; i<cubePosi.length; i++){
    if(i===0){
      gl.useProgram(program1)
      gl.program = program1
    }else{
      gl.useProgram(program2)
      gl.program = program2
    }
    updateMVPMatrix(gl, cubePosi[i], cameraPosition, perspectiveOptions)
    gl.drawArrays(gl.TRIANGLES, 0, 36);
  }
}

function injectUI(gl: WebGLRenderingContext){
  const div = document.createElement('div')
  const html = `
    <button id="resetCamera">resetCamera</button>
  `
  div.innerHTML = html
  document.body.appendChild(div)
  document.getElementById('resetCamera')?.addEventListener('click', ()=>{
    resetCameraPosition(gl, cubePosi)
  })
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
  ]);
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

  if(gl.program === program1){
    var a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
    if (a_Normal < 0) {
      console.log('Failed to get the storage location of a_Position');
      return -1;
    }
    gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
    gl.enableVertexAttribArray(a_Normal);  // Enable the assignment of the buffer object

  }


  // gl.enableVertexAttribArray(a_LightColor);
  // Get the storage location of a_Color
  // var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  // if (a_Color < 0) {
  //   console.log('Failed to get the storage location of a_TexCoord');
  //   return -1;
  // }
  // // Assign the buffer object to a_Color variable
  // gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 8, FSIZE * 3);
  // gl.enableVertexAttribArray(a_Color);  // Enable the assignment of the buffer object

  return n;
}

function startDraw(gl: WebGLRenderingContext, n: number){
  console.log(' draw ');
  gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>
  gl.drawArrays(gl.TRIANGLES, 0, n); // Draw the rectangle
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

  var modelMatrix = new Matrix4(); // Model matrix
  var viewMatrix = new Matrix4();  // View matrix
  var projMatrix = new Matrix4();  // Projection matrix
  // Calculate the model, view and projection matrices
  const [x, y, z, angle, angleType, r, g, b ] = translate
  switch(angleType){
    case 'X': modelMatrix.rotate(angle, 1, 0, 0); break;
    case 'Y': modelMatrix.rotate(angle, 0, 1, 0); break;
    case 'Z': modelMatrix.rotate(angle, 0, 0, 1); break;
    default: break;
  }
  modelMatrix.translate(x, y, z);
  console.log('cameraPosition', cameraPosition);
  console.log('pers', perspectiveOptions);
  viewMatrix.setLookAt(cameraPosition.x, cameraPosition.y, cameraPosition.z, 0, 0, -100, 0, 1, 0);
  projMatrix.setPerspective(perspectiveOptions.fov, perspectiveOptions.aspect, perspectiveOptions.near, perspectiveOptions.far);
  // Calculate the model view projection matrix
  // mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);

  var u_model = gl.getUniformLocation(gl.program, 'u_model');
  if (!u_model) {
    console.log('Failed to get the storage location of u_MvpMatrix4', u_model);
    return -1;
  }
  gl.uniformMatrix4fv(u_model, false, modelMatrix.elements)

  var u_view = gl.getUniformLocation(gl.program, 'u_view');
  if (!u_view) {
    console.log('Failed to get the storage location of u_view', u_view);
    return -1;
  }
  gl.uniformMatrix4fv(u_view, false, viewMatrix.elements)

  var u_projection = gl.getUniformLocation(gl.program, 'u_projection');
  if (!u_projection) {
    console.log('Failed to get the storage location of u_projection', u_projection);
    return -1;
  }
  gl.uniformMatrix4fv(u_projection, false, projMatrix.elements)

  if(gl.program === program1){

    var u_objectColor = gl.getUniformLocation(gl.program, 'u_objectColor');
    if (!u_objectColor) {
      console.log('Failed to get the storage location of u_objectColor');
      return -1;
    }
    gl.uniform3f(u_objectColor, r, g, b)

    var u_lightColor = gl.getUniformLocation(gl.program, 'u_lightColor');
    if (!u_lightColor) {
      console.log('Failed to get the storage location of u_lightColor');
      return -1;
    }
    const [r1,g1,b1] = lightColor
    gl.uniform3f(u_lightColor, r1,g1,b1)


    var u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
    if (!u_lightPos) {
      console.log('Failed to get the storage location of u_lightPos');
      return -1;
    }
    const [x,y,z] = lightPosi
    gl.uniform3f(u_lightPos, x,y,z)


    var u_viewPos = gl.getUniformLocation(gl.program, 'u_viewPos');
    if (!u_viewPos) {
      console.log('Failed to get the storage location of u_viewPos');
      return -1;
    }
    gl.uniform3f(u_viewPos, cameraPosition.x, cameraPosition.y, cameraPosition.z)

  }
  //Get the storage location of a_Position, assign and enable buffer
}


export default main
