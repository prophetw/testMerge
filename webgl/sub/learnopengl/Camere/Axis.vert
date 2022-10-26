
attribute vec4 a_Position;
attribute vec3 a_Color;


uniform mat4 viewMat4;

varying vec3 v_Color;

void main(){

  gl_Position = viewMat4 * a_Position;
  // gl_Position =  a_Position;
  v_Color = a_Color
}
