// #ifdef GL_ES
precision mediump float;
// #endif
uniform sampler2D u_Sampler0;
uniform sampler2D u_Sampler1;

varying vec2 v_TexCoord;
void main() {
  // only box
  // gl_FragColor = texture2D(u_Sampler0, v_TexCoord);

  // box with color
  // gl_FragColor = texture2D(u_Sampler, v_TexCoord) * v_Color;

  // second texture
  gl_FragColor = mix(texture2D(u_Sampler0, v_TexCoord), texture2D(u_Sampler1, v_TexCoord), 0.2);
}
