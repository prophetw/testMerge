attribute vec4 position;
attribute vec2 texcoord;
attribute float a_Face;

uniform int u_PickedFace;
uniform int u_HighlightFace;
uniform mat4 u_MvpMatrix;

varying vec2 v_texCoord;
varying vec4 v_Color;
varying float v_Select;

void main() {
  gl_Position = u_MvpMatrix * position;
  v_texCoord = texcoord;

  vec3 color = vec3(0.0);
  int face = int(a_Face);
  if(face == u_PickedFace || face == u_HighlightFace){
    // highlight
    color = vec3(0.12, 0.23, 0.92);
  }
  v_Select = float(u_PickedFace);
  if(u_PickedFace == 0){ // 开启选择 face 把 a_Face 传递给像素
    v_Color = vec4(color, a_Face / 255.0);
  }else{
    v_Color = vec4(color, 0.0);
  }
}
