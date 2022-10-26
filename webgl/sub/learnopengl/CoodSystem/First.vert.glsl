
attribute vec4 a_Position;
attribute vec2 a_TexCoord;
uniform mat4 u_PersMatrix;
uniform mat4 u_ViewMatrix;
uniform mat4 u_ModelMatrix;
varying vec2 v_TexCoord;


void main() {
  gl_Position = u_ViewMatrix * a_Position;
  v_TexCoord = a_TexCoord;
}
