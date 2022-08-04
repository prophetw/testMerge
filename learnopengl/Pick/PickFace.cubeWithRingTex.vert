
attribute vec4 a_Position;
// attribute vec4 a_Color;
attribute float a_Face;    // Surface number (Cannot use int for attribute variable)
uniform mat4 u_MvpMatrix;
uniform int u_PickedFace;  // Surface number of selected face
uniform int u_HighlightFace;  // Surface number of highlight face

varying vec4 v_Point;
varying vec4 v_Color;
varying float v_Select;
varying vec3 v_Normal;



void main() {
  v_Point = a_Position;
  vec4 point = u_MvpMatrix * a_Position;
  gl_Position = point;
  v_Normal = normalize(a_Position.xyz);
  int face = int(a_Face);  // Convert to int
  // vec3 color = a_Color.rgb;
  vec3 color = vec3(0.0);
  if(
    face == u_PickedFace
    ||
    face == u_HighlightFace
  ){
    color = vec3(0.04, 0.29, 0.99);
  }
  v_Select = float(u_PickedFace);
  if(u_PickedFace == 0) {  // In case of 0, insert the face number into alpha
    v_Color = vec4(color, a_Face/255.0);
  }else {
    // v_Color = vec4(color, a_Color.a);
    v_Color = vec4(color, 0.5);
  }
}
