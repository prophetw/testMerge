precision mediump float;

uniform sampler2D u_texture;

varying vec2 v_texCoord;
varying float v_Select;
varying vec4 v_Color;

void main() {
  vec4 color = texture2D(u_texture, v_texCoord);
  color = vec4(color.x / 2.0, color.y / 2.0, color.z / 2.0, color.a);
  if(v_Select == 0.0){
    gl_FragColor = v_Color;
  }else{
    gl_FragColor = color + v_Color;
  }
}
