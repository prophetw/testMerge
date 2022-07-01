

// #ifdef GL_ES
precision mediump float;
// #endif

uniform vec3 u_test;
uniform sampler2D u_sampler;

varying vec3 v_Color;
void main(){
  gl_FragColor = texture2D(u_sampler, vec2(0.5,0.5)) + vec4(v_Color * u_test, 1.0);
}
