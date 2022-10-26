// #ifdef GL_ES
precision mediump float;
// #endif
struct Material {
    sampler2D diffuse;
    sampler2D specular;
    float shininess;
};

// point light prop
struct Light {
    vec3 position;
    vec3 direction;
    float cutOff;
    float outerCutOff;


    vec3 ambient;
    vec3 diffuse;
    vec3 specular;

    float constant;
    float linear;
    float quadratic;
};

uniform Material material;
uniform Light light;
uniform vec3 u_viewPos;

varying vec3 v_fragPos; // like "in xxx "  in opengl
varying vec3 v_Normal; // like "in xxx " in opengl
varying vec2 v_TexCoord;

void main()
{

    // without blur
    // vec3 lightDir = normalize(light.position - v_fragPos);
    // // check if lighting is inside the spotlight cone
    // float theta = dot(lightDir, normalize(-light.direction));
    // if(theta > light.cutOff){
    //   // ambient
    //   vec3 ambient  = light.ambient  * vec3(texture2D(material.diffuse, v_TexCoord));

    //   // diffuse
    //   vec3 norm = normalize(v_Normal);
    //   float diff = max(dot(norm, lightDir), 0.0);
    //   vec3 diffuse  = light.diffuse  * diff * vec3(texture2D(material.diffuse, v_TexCoord));

    //   // specular
    //   vec3 viewDir = normalize(u_viewPos - v_fragPos);
    //   vec3 reflectDir = reflect(-lightDir, norm);
    //   float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
    //   vec3 specular = light.specular * spec * vec3(texture2D(material.specular, v_TexCoord));

    //   // attenuation
    //   float distance    = length(light.position - v_fragPos);
    //   float attenuation = 1.0 / (light.constant + light.linear * distance +
    //               light.quadratic * (distance * distance)); // 光衰减计算

    //   // 光衰系数应用到 环境光 + 漫反射 + 高光
    //   // ambient  *= attenuation; // remove attenuation from ambient, as otherwise at large distances the light would be darker inside than outside the spotlight due the ambient term in the else branche
    //   diffuse*=attenuation;
    //   specular*=attenuation;
    //   gl_FragColor = vec4(ambient + diffuse + specular, 1.0);
    // }else{
    //   // else, use ambient light so scene isn't completely dark outside the spotlight.
    //   gl_FragColor = vec4(light.ambient * texture2D(material.diffuse, v_TexCoord).rgb, 1.0);
    // }



    // with blur
    vec3 lightDir = normalize(light.position - v_fragPos);
    float theta     = dot(lightDir, normalize(-light.direction));
    float epsilon   = light.cutOff - light.outerCutOff;
    float intensity = clamp((theta - light.outerCutOff) / epsilon, 0.0, 1.0);

      // ambient
      vec3 ambient  = light.ambient  * vec3(texture2D(material.diffuse, v_TexCoord));

      // diffuse
      vec3 norm = normalize(v_Normal);
      float diff = max(dot(norm, lightDir), 0.0);
      vec3 diffuse  = light.diffuse  * diff * vec3(texture2D(material.diffuse, v_TexCoord));

      // specular
      vec3 viewDir = normalize(u_viewPos - v_fragPos);
      vec3 reflectDir = reflect(-lightDir, norm);
      float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
      vec3 specular = light.specular * spec * vec3(texture2D(material.specular, v_TexCoord));

      // attenuation
      float distance    = length(light.position - v_fragPos);
      float attenuation = 1.0 / (light.constant + light.linear * distance +
                  light.quadratic * (distance * distance)); // 光衰减计算

      // 光衰系数应用到 环境光 + 漫反射 + 高光
      // ambient  *= attenuation; // remove attenuation from ambient, as otherwise at large distances the light would be darker inside than outside the spotlight due the ambient term in the else branche
      diffuse*=intensity;
      specular*=intensity;
      gl_FragColor = vec4(ambient + diffuse + specular, 1.0);




}
