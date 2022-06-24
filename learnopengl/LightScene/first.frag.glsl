// #ifdef GL_ES
precision mediump float;
// #endif

uniform vec3 u_objectColor;
uniform vec3 u_lightColor;

void main()
{
    gl_FragColor = vec4(u_lightColor * u_objectColor, 1.0);
}
