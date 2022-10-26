import FSHADER_SOURCE from './TexturesWoodBox.frag'
import VSHADER_SOURCE from './TexturesWoodBox.vert'

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
      gl.uniform1f(u_MixVal, dftMixVal)
      startDraw(gl, 4)
    }
    if(e.code === "ArrowDown"){
      //
      var u_MixVal = gl.getUniformLocation(gl.program, 'u_MixVal');
      if (!u_MixVal) {
        console.log('Failed to get the storage location of u_MixVal: ' + u_MixVal);
        return false;
      }
      dftMixVal-=0.1
      gl.uniform1f(u_MixVal, dftMixVal)
      startDraw(gl, 4)
    }
  })

  imagesSrcAry.map((src, index)=>{
    const initResult = initTextures(gl, index, src, ()=>{
      startDraw(gl, 4)
    })
    return initResult
  })
  // if (!initTextures(gl, n, sr)) {
  //   console.log('Failed to intialize the texture.');
  //   return;
  // }
}

function initVertexBuffers(gl: WebGLRenderingContext) {
  var verticesTexCoords = new Float32Array([
    //    Vertex,           Color           texture coordinate
   //     ---- 位置 ----       ---- 颜色 ----     - 纹理坐标 -
        0.5,  0.5, 0.0,   1.0, 0.0, 0.0,   1.0, 1.0,   // 右上
        0.5, -0.5, 0.0,   0.0, 1.0, 0.0,   1.0, 0.0,   // 右下
        -0.5, -0.5, 0.0,   0.0, 0.0, 1.0,   0.0, 0.0,   // 左下
        -0.5,  0.5, 0.0,   1.0, 1.0, 0.0,   0.0, 1.0,    // 左上
          // 0.5,  0.5, 0.0,   1.0, 0.0, 0.0,   2.0, 2.0,   // 右上  // 缩小两倍
          // 0.5, -0.5, 0.0,   0.0, 1.0, 0.0,   2.0, 0.0,   // 右下
          // -0.5, -0.5, 0.0,   0.0, 0.0, 1.0,   0.0, 0.0,   // 左下
          // -0.5,  0.5, 0.0,   1.0, 1.0, 0.0,   0.0, 2.0,    // 左上
        //   0.5,  0.5, 0.0,   1.0, 0.0, 0.0,   0.55, 0.55, // top right // 0.10 放大到
        //  0.5, -0.5, 0.0,   0.0, 1.0, 0.0,   0.55, 0.45, // bottom right
        // -0.5, -0.5, 0.0,   0.0, 0.0, 1.0,   0.45, 0.45, // bottom let
        // -0.5,  0.5, 0.0,   1.0, 1.0, 0.0,   0.45, 0.55  // top let
  ]);
  var n = 4; // The number of vertices

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
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 8, 0);
  gl.enableVertexAttribArray(a_Position);  // Enable the assignment of the buffer object

  // Get the storage location of a_Color
  var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if (a_Color < 0) {
    console.log('Failed to get the storage location of a_TexCoord');
    return -1;
  }
  // Assign the buffer object to a_Color variable
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 8, FSIZE * 3);
  gl.enableVertexAttribArray(a_Color);  // Enable the assignment of the buffer object

  // Get the storage location of a_TexCoord
  var a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');
  if (a_TexCoord < 0) {
    console.log('Failed to get the storage location of a_TexCoord');
    return -1;
  }
  // Assign the buffer object to a_TexCoord variable
  gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 8, FSIZE * 6);
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
  console.log(' draw ');
  gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>
  gl.drawArrays(gl.TRIANGLE_FAN, 0, n); // Draw the rectangle
}


export default main
