
#ifdef GL_ES
precision mediump float;
#endif
uniform samplerCube u_texture;

varying vec4 v_Color;
varying float v_Select;
varying vec3 v_Normal;

void main() {
  vec4 color = textureCube(u_texture, v_Normal);
  if(v_Select == 0.0){
    gl_FragColor = v_Color;
  }else{
    gl_FragColor = v_Color + color;
  }
}
