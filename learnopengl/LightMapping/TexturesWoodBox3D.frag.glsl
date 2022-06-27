// #ifdef GL_ES
precision mediump float;
// #endif

uniform sampler2D u_Sampler0;
uniform sampler2D u_Sampler1;
uniform float u_MixVal;

varying vec2 v_TexCoord;
varying float v_MixVal;
void main() {
  // only box
  // gl_FragColor = texture2D(u_Sampler0, v_TexCoord);

  // box with color
  // gl_FragColor = texture2D(u_Sampler, v_TexCoord) * v_Color;

  // second texture
  // vec2 texCood = vec2(-v_TexCoord.x, v_TexCoord.y);
  vec4 color1 = texture2D(u_Sampler0, v_TexCoord);
  vec4 color2 = texture2D(u_Sampler1, v_TexCoord);
  gl_FragColor = color1 * color2;
}
