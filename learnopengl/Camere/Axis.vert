
attribute vec3 a_Position;
attribute vec3 a_Color;

uniform mat4 u_ViewMatrix;

varying vec3 v_Color;

void main(){

  gl_Position = u_ViewMatrix * vec4(a_Position, 1.0);
  v_Color = a_Color;
}
