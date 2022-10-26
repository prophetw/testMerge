attribute vec4 position;
attribute float a_Face;

uniform mat4 u_matrix;
uniform int u_SelectFace;

varying vec4 v_Color;
varying float v_Select;

void main() {
  gl_Position = u_matrix * position;

  vec3 color = vec3(0.0);
  int face = int(a_Face);
  if(face == u_SelectFace){
    // highlight
    color = vec3(1);
  }
  v_Select = float(u_SelectFace);
  if(u_SelectFace == 0){ // 开启选择 face 把 a_Face 传递给像素
    v_Color = vec4(color.xyz, a_Face / 255.0);
  }else{
    v_Color = vec4(color, 0.5);
  }
}
