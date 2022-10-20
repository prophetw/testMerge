precision mediump float;

varying vec4 v_Color;
varying vec2 v_Texcoord;

uniform sampler2D tex0;
uniform sampler2D tex1;
uniform sampler2D tex2;
uniform sampler2D tex3;

void main() {
  // gl_FragColor = v_Color;

  vec4 color = texture2D(tex0, v_Texcoord);
  if(v_Texcoord.x<0.5 && v_Texcoord.y>0.5){
    color = texture2D(tex1, v_Texcoord);
  }
  if(v_Texcoord.x>0.5 && v_Texcoord.y>0.5){
    color = texture2D(tex2, v_Texcoord);
  }
  if(v_Texcoord.x>0.5 && v_Texcoord.y<0.5){
    color = texture2D(tex3, v_Texcoord);
  }
  // gl_FragColor = v_Color;
  gl_FragColor = color;
}
