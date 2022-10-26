attribute vec4 position;
attribute vec4 color;

uniform mat4 u_MvpMatrix;

varying vec4 v_Color;

void main() {
  gl_Position = u_MvpMatrix * position;
  v_Color = color;
}
