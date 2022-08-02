precision mediump float;

// Passed in from the vertex shader.
varying vec3 v_normal;
varying vec4 v_pos;

// The texture.
uniform samplerCube u_texture;

void main() {
  gl_FragColor = textureCube(u_texture, normalize(v_normal));
  // gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
