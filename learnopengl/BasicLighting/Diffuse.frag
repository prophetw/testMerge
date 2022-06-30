// #ifdef GL_ES
precision mediump float;
// #endif
uniform vec3 lightColor;
uniform vec3 objectColor;
uniform float ambientNumber;
uniform vec3 lightPos;

varying vec3 v_Normal;
varying vec3 v_FragPos;

void main()
{
    vec3 norm = normalize(v_Normal); // normalize
    vec3 lightDir = normalize(lightPos - v_FragPos); // normalize

    float ambientStrength = ambientNumber;
    vec3 ambient = ambientStrength * lightColor;

    float diff = max(dot(norm, lightDir), 0.0);

    vec3 result = (ambient + diff) * objectColor;
    gl_FragColor = vec4(result, 1.0);
}
