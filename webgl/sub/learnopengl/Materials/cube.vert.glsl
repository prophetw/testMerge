attribute vec4 a_Position;
attribute vec3 a_Normal;

varying vec3 v_Normal;
varying vec3 v_fragPos;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;

void main() {
  gl_Position = u_projection * u_view * u_model * a_Position;
  v_fragPos = vec3(u_model * a_Position);
  v_Normal = a_Normal;
}
