attribute vec4 position;
attribute vec2 uv;

varying vec2 v_UV;
void main() {
  gl_Position = position;
  v_UV = uv;
}
