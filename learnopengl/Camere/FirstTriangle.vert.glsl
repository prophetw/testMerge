
attribute vec4 a_Position;
attribute vec2 a_TexCoord;
uniform mat4 u_ViewMatrix;
varying vec2 v_TexCoord;


void main() {
  gl_Position = u_ViewMatrix * a_Position;
  v_TexCoord = a_TexCoord;
}
