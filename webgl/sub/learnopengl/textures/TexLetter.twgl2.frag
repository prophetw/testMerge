precision mediump float;

uniform samplerCube u_texture;

varying vec3 v_normal;
varying vec4 v_FaceColor;
varying float v_Select;

void main() {
  vec4 color = textureCube(u_texture, normalize(v_normal));
  if(v_Select == 0.0){ // for select
    gl_FragColor = v_FaceColor;
  }else{
    gl_FragColor = color + v_FaceColor;
  }
}
