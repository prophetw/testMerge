// #ifdef GL_ES
precision mediump float;
// #endif
struct Material {
    sampler2D diffuse;
    vec3 specular;
    float shininess;
};

struct Light {
    vec3 position;

    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};

uniform Material material;
uniform Light light;
uniform vec3 u_viewPos;

varying vec3 v_fragPos; // like "in xxx "  in opengl
varying vec3 v_Normal; // like "in xxx " in opengl
varying vec2 v_TexCoord;

void main()
{
 // ambient
    vec3 ambient = light.ambient * texture2D(material.diffuse, v_TexCoord).rgb;

    // diffuse
    vec3 norm = normalize(v_Normal);
    vec3 lightDir = normalize(light.position - v_fragPos);
    float diff = max(dot(norm, lightDir), 0.0);
    vec3 diffuse = light.diffuse * diff * texture2D(material.diffuse, v_TexCoord).rgb;

    // specular
    vec3 viewDir = normalize(u_viewPos - v_fragPos);
    vec3 reflectDir = reflect(-lightDir, norm);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
    vec3 specular = light.specular * (spec * material.specular);

    vec3 result = ambient + diffuse + specular;
    gl_FragColor = vec4(result, 1.0);

}
