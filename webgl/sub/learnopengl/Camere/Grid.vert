
attribute vec4 a_Position;
attribute vec3 a_Color;

uniform mat4 viewMat4;

varying vec3 v_Color;

void main(){

  gl_Position = viewMat4 * a_Position;
  // gl_Position =  vec4(a_Position, 1.0);
  v_Color = a_Color;
}
