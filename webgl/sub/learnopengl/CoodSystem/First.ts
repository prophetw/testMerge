import FSHADER_SOURCE from './First.frag.glsl'
import VSHADER_SOURCE from './First.vert.glsl'

const viewModel = {
  eyeX: 0.2,
  eyeY: 0.25,
  eyeZ: 0.25,
  x: 0,
  y: 0,
  z: 0,
  upX: 0,
  upY: 1,
  upZ: 0,
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



  // Get the storage location of u_ViewMatrix
  var u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage locations of u_ViewMatrix');
    return;
  }

  // Set the matrix to be used for to set the camera view
  var viewMatrix = new Matrix4();

  // default view
  // viewMatrix.setLookAt(0, 0, -1, 0, 0, 0, 0, 1, 0);

  // 从 (0.25, 0.25, 0.25) 这个位置观察 (0, 0, 0)  正上方为 Y 正方向 (默认)
  viewMatrix.setLookAt(0.25, 0.25, 0.25, 0, 0, 0, 0, 1, 0);

  // Set the view matrix
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);




  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Set texture

  if (!initTextures(gl, n)) {
    console.log('Failed to intialize the texture.');
    return;
  }
  injectOptions(gl, n)
}


function redraw  (gl:WebGLRenderingContext, n: number){

  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, n);
}

function changeViewModel(gl:WebGLRenderingContext){

  // Get the storage location of u_ViewMatrix
  var u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage locations of u_ViewMatrix');
    return;
  }

  // Set the matrix to be used for to set the camera view
  var viewMatrix = new Matrix4();
  const {eyeX, eyeY, eyeZ, x,y,z,upX,upY,upZ} = viewModel
  viewMatrix.setLookAt(eyeX, eyeY, eyeZ, x,y,z,upX,upY,upZ);

  // Set the view matrix
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
}


function injectOptions (gl:WebGLRenderingContext, n: number){
  const html = `
      <label for="eyeX" class="form-label">eyeX click to active then use arrowup arrowdown to adjust</label>
      <input type="range" class="form-range" value="0.2" step="0.1" min="-10" max="10" id="eyeX">
      <label for="eyeY" class="form-label">eyeY</label>
      <input type="range" class="form-range" value="0.25" step="0.1" min="-10" max="10" id="eyeY">
      <label for="eyeZ" class="form-label">eyeZ</label>
      <input type="range" class="form-range" value="0.25" step="0.1" min="-10" max="10" id="eyeZ">
  `
  const div = document.createElement('div')
  div.innerHTML = html
  div.style.position = 'absolute'
  div.style.top = '410px'
  div.style.right = '0px'
  document.body.appendChild(div)
  const eyeX = document.getElementById('eyeX')
  if(eyeX){
    eyeX.addEventListener('change', e=>{
      if(e && e.target && e.target.value){
        console.log(e.target.value);
        viewModel.eyeX=e.target.value
        changeViewModel(gl)
        redraw(gl, n)
      }
    })
  }
  const eyeY = document.getElementById('eyeY')
  if(eyeY){
    eyeY.addEventListener('change', e=>{
      console.log(e.target.value);
        viewModel.eyeY=e.target.value
        changeViewModel(gl)
        redraw(gl, n)
    })
  }
  const eyeZ = document.getElementById('eyeZ')
  if(eyeZ){
    eyeZ.addEventListener('change', e=>{
      console.log(e.target.value);
        viewModel.eyeZ=e.target.value
        changeViewModel(gl)
        redraw(gl, n)
    })
  }
}



function initVertexBuffers(gl: WebGLRenderingContext) {
  var verticesTexCoords = new Float32Array([
    // Vertex,    texture coordinate
    -0.5, -0.5,   0.0, 0.0,  // left bottom
    0.5, -0.5,    1.0, 0.0,  // right bottom
    0.0, 0.5,     0.5, 1.0,  // top middle
  ]);
  var n = 3; // The number of vertices

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
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 4, 0);
  gl.enableVertexAttribArray(a_Position);  // Enable the assignment of the buffer object

  // Get the storage location of a_TexCoord
  var a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');
  if (a_TexCoord < 0) {
    console.log('Failed to get the storage location of a_TexCoord');
    return -1;
  }
  // Assign the buffer object to a_TexCoord variable
  gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2);
  gl.enableVertexAttribArray(a_TexCoord);  // Enable the assignment of the buffer object

  return n;
}

function initTextures(gl: WebGLRenderingContext, n: number) {
  var texture = gl.createTexture();   // Create a texture object
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  // Get the storage location of u_Sampler
  var u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
  if (!u_Sampler) {
    console.log('Failed to get the storage location of u_Sampler');
    return false;
  }
  var image = new Image();  // Create the image object
  if (!image) {
    console.log('Failed to create the image object');
    return false;
  }
  // Register the event handler to be called on loading an image
  image.onload = function () { loadTexture(gl, n, texture, u_Sampler, image); };
  // Tell the browser to load an image
  image.src = './resources/wall.jpg';

  return true;
}
function loadTexture(gl: WebGLRenderingContext, n: number, texture: WebGLTexture | null, u_Sampler: WebGLUniformLocation | null , image: HTMLImageElement) {
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE0);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>

  gl.drawArrays(gl.TRIANGLES, 0, n); // Draw the rectangle
}

export default main
