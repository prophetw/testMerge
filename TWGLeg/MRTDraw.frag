precision mediump float;

uniform sampler2D tex0;
uniform sampler2D tex1;
uniform sampler2D tex2;
uniform sampler2D tex3;

varying vec2 v_UV;
void main() {
  // gl_FragColor = v_Color;

  // vec3 cc = normalize(gl_FragCoord);
  vec2 v_Texcoord = v_UV;
  vec4 color = texture2D(tex0, v_Texcoord);
  if(v_Texcoord.x<0.5 && v_Texcoord.y<0.5){
    color = texture2D(tex1, v_Texcoord);
  }
  if(v_Texcoord.x>0.5 && v_Texcoord.y>0.5){
    color = texture2D(tex2, v_Texcoord);
  }
  if(v_Texcoord.x>0.5 && v_Texcoord.y<0.5){
    color = texture2D(tex3, v_Texcoord);
  }
  // gl_FragColor = gl_FragCoord;
  gl_FragColor = color;
  // gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
