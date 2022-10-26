// #ifdef GL_ES
precision mediump float;
// #endif
uniform vec3 lightColor;
uniform vec3 objectColor;
uniform vec3 lightPos;
uniform vec3 viewPos;
uniform float ambientNumber;
uniform float specularStrength;
uniform float shininess;

varying vec3 v_Normal;
varying vec3 v_FragPos;

void main()
{
    vec3 norm = normalize(v_Normal); // normalize
    vec3 lightDir = normalize(lightPos - v_FragPos); // normalize 方向是 片元指向光源

    // ambient
    float ambientStrength = ambientNumber;
    vec3 ambient = ambientStrength * lightColor;

    // diffuse
    float diff = max(dot(norm, lightDir), 0.0);

    // specular
    vec3 lightReflect = reflect(-lightDir, norm); // 光源指向片元 法向量 return 片源发射出去的光线
    vec3 viewDir = normalize(viewPos - v_FragPos);  // 方向片源指向视点
    float spec = pow(max(dot(viewDir, lightReflect), 0.0), shininess); // 视角与反射角度 对高光的影响
    vec3 specular = specularStrength * spec * lightColor;


    vec3 result = (specular + ambient + diff) * objectColor;
    gl_FragColor = vec4(result, 1.0);
}
