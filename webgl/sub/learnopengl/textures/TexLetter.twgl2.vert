attribute vec4 a_position;
attribute float a_face;

uniform mat4 u_matrix;
uniform int u_SelectFaceId;
uniform int u_highlightFaceId;

varying vec3 v_normal;
varying vec4 v_pos;
varying vec4 v_FaceColor;
varying float v_Select;

void main() {
  // Multiply the position by the matrix.
  gl_Position = u_matrix * a_position;
  v_pos = a_position;
  v_normal = normalize(a_position.xyz);
  int face = int(a_face);  // Convert to int
  vec3 color = vec3(0.0);
  if(
    face == u_SelectFaceId
    ||
    face == u_highlightFaceId
  ){
    color = vec3(0.15, 0.55, 0.93);
  }
  if(u_SelectFaceId == 0) {  // In case of 0, insert the face number into alpha
    v_FaceColor = vec4(color, a_face/255.0);
  }else {
    v_FaceColor = vec4(color, 0.5);
  }
  v_Select = float(u_SelectFaceId);
}
