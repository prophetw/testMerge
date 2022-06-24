// #ifdef GL_ES
precision mediump float;
// #endif

uniform vec3 u_objectColor;
uniform vec3 u_lightColor;
uniform vec3 u_lightPos;
uniform vec3 u_viewPos;

varying vec3 v_fragPos;
varying vec3 v_Normal;

void main()
{

    // ambient
    float ambientStrength = 0.6;
    vec3 ambient = ambientStrength * u_lightColor;

    // diffuse
    vec3 norm = normalize(v_Normal);
    vec3 lightDir = normalize(u_lightPos - v_fragPos);
    float diff = max(dot(norm, lightDir), 0.0);
    vec3 diffuse = diff * u_lightColor;

    // // specular
    float specularStrength = 0.5;
    vec3 viewDir = normalize(u_viewPos - v_fragPos);
    vec3 reflectDir = reflect(-lightDir, norm);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
    vec3 specular = specularStrength * spec * u_lightColor;


    vec3 result = (ambient + diffuse + specular) * u_objectColor;
    gl_FragColor = vec4(result, 1.0);
    // gl_FragColor = vec4(1.0);

}
