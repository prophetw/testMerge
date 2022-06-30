// #ifdef GL_ES
precision mediump float;
// #endif
uniform vec3 lightColor;
uniform vec3 objectColor;
uniform float ambientNumber;

void main()
{
    float ambientStrength = ambientNumber;
    vec3 ambient = ambientStrength * lightColor;

    vec3 result = ambient * objectColor;
    gl_FragColor = vec4(result, 1.0);
}
