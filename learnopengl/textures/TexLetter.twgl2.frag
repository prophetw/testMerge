precision mediump float;
// Passed in from the vertex shader.


// The texture. 问题在于 是逐片元计算片元颜色的，
// 所以从顶点着色器传过来的值是存在插值的，所以高亮色不准确
uniform samplerCube u_texture;
uniform int u_SelectFaceId;
uniform float u_highlightFaceId;

varying vec3 v_normal;
varying vec4 v_FaceColor;
varying float v_faceid;

void main() {
  vec4 color = textureCube(u_texture, normalize(v_normal));
  if(u_SelectFaceId == 0){
    color = v_FaceColor;
  }
  if(v_faceid == u_highlightFaceId){
    color = vec4(0.1, 0.73, 0.94, 255.0/255.0);
  }
  // gl_FragColor = color;
  gl_FragColor = color;
}
