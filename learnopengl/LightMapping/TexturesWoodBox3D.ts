import FSHADER_SOURCE from './TexturesWoodBox3D.frag'
import VSHADER_SOURCE from './TexturesWoodBox3D.vert'

import LightSourceFS from './lightSource.frag'
import LightSourceVS from './lightSource.vert'

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
  const imagesSrcAry = ['./resources/container2.png', './resources/container2_specular.png']
  // const imagesSrcAry = ['./resources/container2_specular.png']
  // boxWood
  // const imagesSrcAry = ['./resources/awesomeface.png']

  let count = 0
  window.spector.startCapture(canvas, 150)
  imagesSrcAry.map((src, index)=>{
    const initResult = initTextures(gl, index, src, ()=>{
      count +=1
      if(count === imagesSrcAry.length){
        startDraw(gl, 36)
      }
    })
    return initResult
  })


  // making box rotating
  // setInterval(()=>{
  //   angleY=angleY+1
  //   updateMVPMatrix(gl)
  //   startDraw(gl, 36)
  // }, 16)
  // if (!initTextures(gl, n, sr)) {
  //   console.log('Failed to intialize the texture.');
  //   return;
  // }
}

var angleY = 0
function updateMVPMatrix(gl: WebGLRenderingContext){

  var modelMatrix = new window.Matrix4(); // Model matrix
  var viewMatrix = new window.Matrix4();  // View matrix
  var projMatrix = new window.Matrix4();  // Projection matrix
  var mvpMatrix = new window.Matrix4();   // Model view projection matrix

  // Calculate the model, view and projection matrices
  modelMatrix.translate(0, 0, 0);
  modelMatrix.rotate(angleY, 0, 1, 0);
  viewMatrix.setLookAt(3, 3, 3, 0, 0, 0, 0, 1, 0);
  projMatrix.setPerspective(30, 1, 0.1, 100);
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

  // var u_MixVal = gl.getUniformLocation(gl.program, 'u_MixVal');
  // if (!u_MixVal) {
  //   console.log('Failed to get the storage location of u_MixVal: ' + u_MixVal);
  //   return false;
  // }
  // gl.uniform1f(u_MixVal, 0.7)

  updateMVPMatrix(gl)

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
function loadTexture(
  gl: WebGLRenderingContext,
  textIndex: number, texture: WebGLTexture | null,
  u_Sampler: WebGLUniformLocation | null ,
  image: HTMLImageElement,
  loadEndCallback=()=>{
  //
}) {
  console.log(' image ', image);
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

// 图片纹理的宽高尺寸必须是 2的幂  不是的话必须用下面的设置
// 否则的话 返回的是纯黑图片纹理 并且多级纹理 不支持 非2的幂

// gl.NEAREST is also allowed, instead of gl.LINEAR, as neither mipmap.
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
// Prevents s-coordinate wrapping (repeating).
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
// Prevents t-coordinate wrapping (repeating).
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  // Set the texture parameters
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  // // s t direction  repeat
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  // Set the texture image

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 500, 500, 0, gl.RGBA, gl.UNSIGNED_BYTE, );
  // gl.generateMipmap(gl.TEXTURE_2D);
  // Set the texture unit 0 to the sampler
  console.log(gl.getError());
  gl.uniform1i(u_Sampler, textIndex);
  console.log(' cool ');
  loadEndCallback()
}

function startDraw(gl: WebGLRenderingContext, n: number){
  console.log(' startDraw =----- ');
  gl.enable(gl.DEPTH_TEST)
  // gl.enable(gl.BLEND)
  // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
  gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);   // Clear <canvas>
  // gl.clear(gl.COLOR_BUFFER_BIT)
  gl.drawArrays(gl.TRIANGLES, 0, n); // Draw the rectangle
}


export default main
