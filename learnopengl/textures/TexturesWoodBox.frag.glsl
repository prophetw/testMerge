// #ifdef GL_ES
precision mediump float;
// #endif
uniform sampler2D u_Sampler0;
uniform sampler2D u_Sampler1;
uniform float u_MixVal;

varying vec2 v_TexCoord;
void main() {
  // only box
  // gl_FragColor = texture2D(u_Sampler0, v_TexCoord);

  // box with color
  // gl_FragColor = texture2D(u_Sampler, v_TexCoord) * v_Color;

  // second texture
  vec2 texCood = vec2(-v_TexCoord.x, v_TexCoord.y);
  gl_FragColor = mix(texture2D(u_Sampler0, v_TexCoord), texture2D(u_Sampler1, texCood), u_MixVal);
}
