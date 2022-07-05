import FSHADER_SOURCE from './Textures10WoodBox3D.frag'
import VSHADER_SOURCE from './Textures10WoodBox3D.vert'

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

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Set texture

  // boxWood and smileface
  const imagesSrcAry = ['./resources/container.jpg', './resources/awesomeface.png']
  // boxWood
  // const imagesSrcAry = ['./resources/container.jpg']
  let dftMixVal = 0.2
  document.addEventListener('keyup', e=>{
    if(e.code === "ArrowUp"){
      //
      var u_MixVal = gl.getUniformLocation(gl.program, 'u_MixVal');
      if (!u_MixVal) {
        console.log('Failed to get the storage location of u_MixVal: ' + u_MixVal);
        return false;
      }
      dftMixVal+=0.1
      console.log( 'texture mix val: ', dftMixVal);
      gl.uniform1f(u_MixVal, dftMixVal)
      startDraw(gl, 36)
    }
    if(e.code === "ArrowDown"){
      //
      var u_MixVal = gl.getUniformLocation(gl.program, 'u_MixVal');
      if (!u_MixVal) {
        console.log('Failed to get the storage location of u_MixVal: ' + u_MixVal);
        return false;
      }
      dftMixVal-=0.1
      console.log( 'texture mix val: ', dftMixVal);
      gl.uniform1f(u_MixVal, dftMixVal)
      startDraw(gl, 36)
    }
  })
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



  // if (!initTextures(gl, n, sr)) {
  //   console.log('Failed to intialize the texture.');
  //   return;
  // }
}

type AngelType = 'X' | 'Y' | 'Z'
function updateMVPMatrix(gl: WebGLRenderingContext, translate: [number,number,number]){

  var modelMatrix = new Matrix4(); // Model matrix
  var viewMatrix = new Matrix4();  // View matrix
  var projMatrix = new Matrix4();  // Projection matrix
  var mvpMatrix = new Matrix4();   // Model view projection matrix
  const angle = Math.floor(Math.random() * 360 )
  const angleType: AngelType = ['X','Y','Z'][Math.floor(Math.random() * 3)]
  console.log(angle, angleType);
  switch(angleType){
    case 'X': modelMatrix.setRotate(angle, 1, 0, 0); break;
    case 'Y': modelMatrix.setRotate(angle, 0, 1, 0); break;
    case 'Z': modelMatrix.setRotate(angle, 0, 0, 1); break;
    default: break;
  }
  // Calculate the model, view and projection matrices
  const [x, y, z] = translate
  modelMatrix.translate(x, y, z);
  console.log(modelMatrix.elements);


  viewMatrix.setLookAt(0, 0, 5, 0, 0, -100, 0, 1, 0);
  projMatrix.setPerspective(45, 1, 1, 100);
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

  const cubePosi: [number,number,number][] = [
    [ 0.0,  0.0,  0.0],
    [ 2.0,  5.0, -15.0],
    [-1.5, -2.2, -2.5],
    [-3.8, -2.0, -12.3],
    [ 2.4, -0.4, -3.5],
    [-1.7,  3.0, -7.5],
    [ 1.3, -2.0, -2.5],
    [ 1.5,  2.0, -2.5],
    [ 1.5,  0.2, -1.5],
    [-1.3,  1.0, -1.5]
  ]
  for(let i=0; i<cubePosi.length; i++){
    updateMVPMatrix(gl, cubePosi[i])
    gl.drawArrays(gl.TRIANGLES, 0, n);
  }

}


export default main
