// #ifdef GL_ES
precision mediump float;
// #endif
varying vec3 TexCoords;

uniform samplerCube skybox;

void main()
{
    gl_FragColor = textureCube(skybox, TexCoords);
}
