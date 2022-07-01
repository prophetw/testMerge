import FSHADER_SOURCE from './CameraMoving.frag'
import VSHADER_SOURCE from './CameraMoving.vert'

type AngelType = 'X' | 'Y' | 'Z'
// cube transform  [x,y,z,angle,angelType]
const cubePosi: [number,number,number, number, AngelType][] = [
  [ 0.0,  0.0,  0.0, 15, 'X'],
  [ 2.0,  5.0, -15.0, 30, 'Y'],
  [-1.5, -2.2, -2.5, 60, 'Z'],
  [-3.8, -2.0, -12.3, 10, 'Y'],
  [ 2.4, -0.4, -3.5, 20, 'X'],
  [-1.7,  3.0, -7.5, 80, 'Y'],
  [ 1.3, -2.0, -2.5, 70, 'Z'],
  [ 1.5,  2.0, -2.5, 0, 'Z'],
  [ 1.5,  0.2, -1.5, 45, 'X'],
  [-1.3,  1.0, -1.5, 45, 'Y']
]
const defaultCameraPosition = {
  x: 0,
  y: 0,
  z: 5
}
// camera look at somePoint
const targetPosition = {
  x: 0,
  y: 0,
  z: -100
}

const perspectiveOptions = {
  fov: 45,
  aspect: 1,
  near: 0.1,
  far: 100
}

function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl') as HTMLCanvasElement;

  document.title='moving camera'
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

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Set texture

  // boxWood and smileface
  const imagesSrcAry = ['./resources/container.jpg', './resources/awesomeface.png']
  // boxWood
  // const imagesSrcAry = ['./resources/container.jpg']
  let count = 0
  imagesSrcAry.map((src, index)=>{
    const initResult = initTextures(gl, index, src, ()=>{
      count++
      if(count===2){
        startDraw(gl, 36)
      }
    })
    return initResult
  })


  // scroll event   => change camera z
  canvas.addEventListener('wheel', (e)=>{
    const {deltaY} = e
    const step = 5
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

function resetCameraPosition(gl: WebGLRenderingContext, cubePosi: [number,number,number, number, AngelType][]){
  defaultCameraPosition.x = 0
  defaultCameraPosition.y = 0
  defaultCameraPosition.z = 5
  perspectiveOptions.near = 30
  gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT)
  for(let i=0; i<cubePosi.length; i++){
    updateMVPMatrix(gl, cubePosi[i], defaultCameraPosition)
    gl.drawArrays(gl.TRIANGLES, 0, 36);
  }
}
function updateAll(gl: WebGLRenderingContext,
  cubePosi: [number,number,number, number, AngelType][],
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

function updateMVPMatrix(gl: WebGLRenderingContext,
  translate: [number,number,number, number, AngelType],
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
  var mvpMatrix = new window.Matrix4();   // Model view projection matrix
  // Calculate the model, view and projection matrices
  const [x, y, z, angle, angleType] = translate
  switch(angleType){
    case 'X': modelMatrix.rotate(angle, 1, 0, 0); break;
    case 'Y': modelMatrix.rotate(angle, 0, 1, 0); break;
    case 'Z': modelMatrix.rotate(angle, 0, 0, 1); break;
    default: break;
  }
  modelMatrix.translate(x, y, z);
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
}

function initVertexBuffers(gl: WebGLRenderingContext) {
  var verticesTexCoords = new Float32Array([
    //    Vertex,           Color           texture coordinate
   //     ---- 位置 ----       ---- 颜色 ----     - 纹理坐标 -
   -0.5, -0.5, -0.5,  0.0, 0.0,
   0.5, -0.5, -0.5,  1.0, 0.0,
   0.5,  0.5, -0.5,  1.0, 1.0,
   0.5,  0.5, -0.5,  1.0, 1.0,
  -0.5,  0.5, -0.5,  0.0, 1.0,
  -0.5, -0.5, -0.5,  0.0, 0.0,

  -0.5, -0.5,  0.5,  0.0, 0.0,
   0.5, -0.5,  0.5,  1.0, 0.0,
   0.5,  0.5,  0.5,  1.0, 1.0,
   0.5,  0.5,  0.5,  1.0, 1.0,
  -0.5,  0.5,  0.5,  0.0, 1.0,
  -0.5, -0.5,  0.5,  0.0, 0.0,

  -0.5,  0.5,  0.5,  1.0, 0.0,
  -0.5,  0.5, -0.5,  1.0, 1.0,
  -0.5, -0.5, -0.5,  0.0, 1.0,
  -0.5, -0.5, -0.5,  0.0, 1.0,
  -0.5, -0.5,  0.5,  0.0, 0.0,
  -0.5,  0.5,  0.5,  1.0, 0.0,

   0.5,  0.5,  0.5,  1.0, 0.0,
   0.5,  0.5, -0.5,  1.0, 1.0,
   0.5, -0.5, -0.5,  0.0, 1.0,
   0.5, -0.5, -0.5,  0.0, 1.0,
   0.5, -0.5,  0.5,  0.0, 0.0,
   0.5,  0.5,  0.5,  1.0, 0.0,

  -0.5, -0.5, -0.5,  0.0, 1.0,
   0.5, -0.5, -0.5,  1.0, 1.0,
   0.5, -0.5,  0.5,  1.0, 0.0,
   0.5, -0.5,  0.5,  1.0, 0.0,
  -0.5, -0.5,  0.5,  0.0, 0.0,
  -0.5, -0.5, -0.5,  0.0, 1.0,

  -0.5,  0.5, -0.5,  0.0, 1.0,
   0.5,  0.5, -0.5,  1.0, 1.0,
   0.5,  0.5,  0.5,  1.0, 0.0,
   0.5,  0.5,  0.5,  1.0, 0.0,
  -0.5,  0.5,  0.5,  0.0, 0.0,
  -0.5,  0.5, -0.5,  0.0, 1.0
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
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 5, 0);
  gl.enableVertexAttribArray(a_Position);  // Enable the assignment of the buffer object

  // Get the storage location of a_TexCoord
  var a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');
  if (a_TexCoord < 0) {
    console.log('Failed to get the storage location of a_TexCoord');
    return -1;
  }
  // Assign the buffer object to a_TexCoord variable
  gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 5, FSIZE * 3);
  gl.enableVertexAttribArray(a_TexCoord);  // Enable the assignment of the buffer object

  var u_MixVal = gl.getUniformLocation(gl.program, 'u_MixVal');
  if (!u_MixVal) {
    console.log('Failed to get the storage location of u_Sampler: ' + u_MixVal);
    return false;
  }
  gl.uniform1f(u_MixVal, 0.2)


  return n;
}

function initTextures(gl: WebGLRenderingContext, textIndex: number, src: string, loadEndCallback = ()=>{
  //
}) {
  var texture = gl.createTexture();   // Create a texture object
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  const uniform_Sampler = 'u_Sampler' + textIndex
  // Get the storage location of u_Sampler
  var u_Sampler = gl.getUniformLocation(gl.program, uniform_Sampler);
  if (!u_Sampler) {
    console.log('Failed to get the storage location of u_Sampler: ' + uniform_Sampler);
    return false;
  }
  var image = new Image();  // Create the image object
  if (!image) {
    console.log('Failed to create the image object');
    return false;
  }
  // Register the event handler to be called on loading an image
  image.onload = function () { loadTexture(gl, textIndex, texture, u_Sampler, image, loadEndCallback); };
  // Tell the browser to load an image
  image.src = src;

  return true;
}

function loadTexture(gl: WebGLRenderingContext, textIndex: number, texture: WebGLTexture | null, u_Sampler: WebGLUniformLocation | null , image: HTMLImageElement, loadEndCallback=()=>{
  //
}) {
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE0 + textIndex);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);
  /** second texture
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, texture1);
   * */

//
//  // set the texture wrapping parameters
//  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); // note that we set the container wrapping method to gl.CLAMP_TO_EDGE
//  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
//  // set texture filtering parameters
//  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); // set texture filtering to nearest neighbor to clearly see the texels/pixels
//  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);


  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  // s t direction  repeat
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler, textIndex);
  loadEndCallback()
}

function startDraw(gl: WebGLRenderingContext, n: number){
  console.log(' draw');

  gl.enable(gl.DEPTH_TEST)
  gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);   // Clear <canvas>
  // gl.drawArrays(gl.TRIANGLES, 0, n); // Draw the rectangle

  for(let i=0; i<cubePosi.length; i++){
    updateMVPMatrix(gl, cubePosi[i], defaultCameraPosition)
    gl.drawArrays(gl.TRIANGLES, 0, n);
  }

}


export default main
