import FSHADER_SOURCE from './CameraPosition.frag'
import VSHADER_SOURCE from './CameraPosition.vert'
import AXIS_FS from './Axis.frag'
import AXIS_VS from './Axis.vert'

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

  program1 = createProgram(gl, VSHADER_SOURCE, FSHADER_SOURCE)
  if(program1 === null){
    console.log(" Failed to intialize shaders");
    return
  }
  gl.useProgram(program1)
  gl.program = program1

  program2 = createProgram(gl, AXIS_VS, AXIS_FS)
  if(program2 === null){
    console.log(" Failed to intialize shaders");
    return
  }
  console.log(gl, program1, program2);

  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Set the vertex information
  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }
  if (!initTextures(gl, n, program1)) {
    console.log('Failed to intialize the texture.');
    return;
  }

  // Set the vertex information
  var n = initAxisVertBuffers(gl, program2);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }
  injectOptions(gl, n)
}


function redraw(gl:WebGLRenderingContext, n: number){
  gl.clear(gl.COLOR_BUFFER_BIT);
  const programNum = 2
  for(let i=0; i<programNum; i++){
    if(i===0){
      gl.useProgram(program1)
      gl.program = program1
      changeViewModel(gl)
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }else{
      gl.useProgram(program2)
      gl.program = program2
      changeViewModel(gl)
      gl.drawArrays(gl.LINES, 3, 6);
    }
  }
}

function changeViewModel(gl:WebGLRenderingContext){

  // Get the storage location of u_ViewMatrix
  var u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage locations of u_ViewMatrix');
    return;
  }

  // Set the matrix to be used for to set the camera view
  var viewMatrix = new window.Matrix4();
  const {eyeX, eyeY, eyeZ, x,y,z,upX,upY,upZ} = viewModel
  viewMatrix.setLookAt(eyeX, eyeY, eyeZ, x,y,z,upX,upY,upZ);

  // Set the view matrix
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
}


function injectOptions (gl:WebGLRenderingContext, n: number){
  const updateUI = (id: string, text: string)=>{
    const dom = document.getElementById(id)
    if(dom!==null){
      dom.innerHTML = ''+text
    }
  }
  const html = `
      <label for="eyeX" class="form-label">cameraX: <span id="cameraX">${viewModel.eyeX}</span></label>
      <input type="range" class="form-range" value="${viewModel.eyeX}" step="0.1" min="-10" max="10" id="eyeX">
      <label for="eyeY" class="form-label">cameraY: <span id="cameraY">${viewModel.eyeY}</span></label>
      <input type="range" class="form-range" value="${viewModel.eyeY}" step="0.1" min="-10" max="10" id="eyeY">
      <label for="eyeZ" class="form-label">cameraZ: <span id="cameraZ">${viewModel.eyeZ}</span></label>
      <input type="range" class="form-range" value="${viewModel.eyeZ}" step="0.1" min="-10" max="10" id="eyeZ">
  `
  const div = document.createElement('div')
  div.innerHTML = html
  div.style.position = 'absolute'
  div.style.top = '0px'
  div.style.width = '410px'
  div.style.right = '0px'
  document.body.appendChild(div)
  const eyeX = document.getElementById('eyeX')
  if(eyeX){
    eyeX.addEventListener('change', e=>{
      if(e && e.target && e.target.value){
        console.log(e.target.value);
        viewModel.eyeX= e.target.value
        updateUI('cameraX', ''+viewModel.eyeX)
        redraw(gl, n)
      }
    })
  }
  const eyeY = document.getElementById('eyeY')
  if(eyeY){
    eyeY.addEventListener('change', e=>{
      console.log(e.target.value);
        viewModel.eyeY=e.target.value
        updateUI('cameraY', ''+viewModel.eyeY)
        redraw(gl, n)
    })
  }
  const eyeZ = document.getElementById('eyeZ')
  if(eyeZ){
    eyeZ.addEventListener('change', e=>{
      console.log(e.target.value);
        viewModel.eyeZ=e.target.value
        updateUI('cameraZ', ''+viewModel.eyeZ)
        redraw(gl, n)
    })
  }
}


function initAxisVertBuffers(gl: WebGLRenderingContext, program: WebGLProgram){
  gl.useProgram(program)
  gl.program = program
  var verticesTexCoords = new Float32Array([
    // Vertex,         texture    placeholder
    -0.5, -0.5, 0.0,   0.0, 0.0,  0.0, // left bottom
    0.5, -0.5,  0.0,   1.0, 0.0,  0.0,  // right bottom
    0.0, 0.5,   0.0,   0.5, 1.0,  0.0, // top middle
    // axis            color
    0.0,  0.0,   0.0,  1.0,  1.0,  1.0,  // X
    1.0,  0.0,   0.0,  1.0,  0.0,  0.0,
    0.0,  0.0,   0.0,  1.0,  1.0,  1.0,  // Y
    0.0,  1.0,   0.0,  1.0,  0.0,  0.0,
    0.0,  0.0,   0.0,  1.0,  1.0,  1.0,  // Z
    0.0,  0.0,   1.0,  1.0,  0.0,  0.0,
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
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
  gl.enableVertexAttribArray(a_Position);  // Enable the assignment of the buffer object

  var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if (a_Color < 0) {
    console.log('Failed to get the storage location of a_Color');
    return -1;
  }
  // Assign the buffer object to a_TexCoord variable
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
  gl.enableVertexAttribArray(a_Color);  // Enable the assignment of the buffer object

  return n;
}

function initVertexBuffers(gl: WebGLRenderingContext) {
  var verticesTexCoords = new Float32Array([
    // Vertex,         texture    placeholder
    -0.5, -0.5, 0.0,   0.0, 0.0,  0.0, // left bottom
    0.5, -0.5,  0.0,   1.0, 0.0,  0.0,  // right bottom
    0.0, 0.5,   0.0,   0.5, 1.0,  0.0, // top middle
    // axis            color
    0.0,  0.0,   0.0,  1.0,  1.0,  1.0,  // X
    1.0,  0.0,   0.0,  1.0,  0.0,  0.0,
    0.0,  0.0,   0.0,  1.0,  1.0,  1.0,  // Y
    0.0,  1.0,   0.0,  1.0,  0.0,  0.0,
    0.0,  0.0,   0.0,  1.0,  1.0,  1.0,  // Z
    0.0,  0.0,   1.0,  1.0,  0.0,  0.0,
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
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
  gl.enableVertexAttribArray(a_Position);  // Enable the assignment of the buffer object

    // Get the storage location of a_TexCoord
  var a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');
  if (a_TexCoord < 0) {
    console.log('Failed to get the storage location of a_TexCoord');
    return -1;
  }
  // Assign the buffer object to a_TexCoord variable
  gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
  gl.enableVertexAttribArray(a_TexCoord);  // Enable the assignment of the buffer object
  return n;
}

function initTextures(gl: WebGLRenderingContext, n: number, program: WebGLProgram) {
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
  image.onload = function () { loadTexture(gl, n, texture, u_Sampler, image, program); };
  // Tell the browser to load an image
  image.src = './resources/wall.jpg';

  return true;
}
function loadTexture(gl: WebGLRenderingContext, n: number, texture: WebGLTexture | null, u_Sampler: WebGLUniformLocation | null , image: HTMLImageElement, program: WebGLProgram) {
  gl.useProgram(program)
  gl.program = program
  if(gl.program === program1){
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
    console.log(' texture ');
  }
  redraw(gl, n)
  // gl.drawArrays(gl.TRIANGLES, 0, n); // Draw the rectangle
}

export default main
