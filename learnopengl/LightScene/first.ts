import FSHADER_SOURCE from './first.frag.glsl'
import VSHADER_SOURCE from './first.vert.glsl'



type AngelType = 'X' | 'Y' | 'Z'
type VertexOptions = [number,number,number, number, AngelType, number,number, number]

// cube transform  [x,y,z,angle,angelType]
const lightColor = [1.0, 1.0, 1.0]
const cubePosi: VertexOptions[] = [
  [ 0.0,  0.0,  0.0, 0, 'X', 1.0, 0.5, 1.0],
  // [ 2.0,  5.0, -15.0, 30, 'Y'],
  [-1.5, -2.2, -2.5, 60, 'Z', 1.0, 0.5, 0.0],
  // [-3.8, -2.0, -12.3, 10, 'Y'],
  // [ 2.4, -0.4, -3.5, 20, 'X'],
  // [-1.7,  3.0, -7.5, 80, 'Y'],
  // [ 1.3, -2.0, -2.5, 70, 'Z'],
  // [ 1.5,  2.0, -2.5, 0, 'Z'],
  // [ 1.5,  0.2, -1.5, 45, 'X'],
  // [-1.3,  1.0, -1.5, 45, 'Y']
]
const defaultCameraPosition = {
  x: 0,
  y: 0,
  z: 5
}
// 单位向量 表示方向 方便计算
const cameraUp = [0,1,0]
const cameraFront = [0,0,-1]

// camera look at somePoint 视点 viewPoint
const viewPoint = {
  x: 0,
  y: 0,
  z: -100
}

// perspective options
const perspectiveOptions = {
  fov: 45,
  aspect: 1,
  near: 0.1,
  far: 100
}



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
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Set the vertex information
  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  gl.clearColor(0.0, 0.0, 0.0, 1.0);

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
  defaultCameraPosition.x = 0
  defaultCameraPosition.y = 0
  defaultCameraPosition.z = 5
  perspectiveOptions.fov = 45
  gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT)
  for(let i=0; i<cubePosi.length; i++){
    updateMVPMatrix(gl, cubePosi[i], defaultCameraPosition)
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
    //    Vertex,           Color           texture coordinate
   //     ---- 位置 ----       ---- 颜色 ----     - 纹理坐标 -
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
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 3, 0);
  gl.enableVertexAttribArray(a_Position);  // Enable the assignment of the buffer object

  //Get the storage location of a_Position, assign and enable buffer
  var u_lightColor = gl.getUniformLocation(gl.program, 'u_lightColor');
  if (!u_lightColor) {
    console.log('Failed to get the storage location of u_lightColor');
    return -1;
  }
  const [r,g,b] = lightColor
  gl.uniform3f(u_lightColor, r,g,b)
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
  var mvpMatrix = new Matrix4();   // Model view projection matrix
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
  mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
  var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix4');
  if (!u_MvpMatrix) {
    console.log('Failed to get the storage location of u_MvpMatrix4', u_MvpMatrix);
    return -1;
  }
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements)


  //Get the storage location of a_Position, assign and enable buffer
  var u_objectColor = gl.getUniformLocation(gl.program, 'u_objectColor');
  if (!u_objectColor) {
    console.log('Failed to get the storage location of u_objectColor');
    return -1;
  }
  gl.uniform3f(u_objectColor, r, g, b)
}


export default main
