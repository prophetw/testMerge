attribute vec4 a_position;
attribute float a_face;

uniform mat4 u_matrix;

varying vec3 v_normal;
varying vec4 v_pos;
varying vec4 v_FaceColor;
varying float v_faceid;

void main() {
  // Multiply the position by the matrix.
  gl_Position = u_matrix * a_position;
  v_pos = a_position;
  v_normal = normalize(a_position.xyz);
  v_FaceColor = vec4(1.0,1.0,1.0, a_face/255.0);
  v_faceid = a_face;
}
