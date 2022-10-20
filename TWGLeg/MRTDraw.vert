attribute vec4 position;
attribute vec4 color;
attribute vec2 texcoord;

uniform mat4 u_MvpMatrix;

varying vec4 v_Color;
varying vec2 v_Texcoord;

void main() {
  gl_Position = u_MvpMatrix * position;
  v_Color = color;
  v_Texcoord = texcoord;
}
