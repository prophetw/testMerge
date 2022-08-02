uniform samplerCube mycubmap_0;
czm_material czm_getMaterial(czm_materialInput materialInput)
{
    czm_material material = czm_getDefaultMaterial(materialInput);
    material.alpha = 1.0;
    material.diffuse = textureCube(mycubmap_0, normalize(materialInput.str)).rgb;
    return material;
}



// #ifdef GL_ES
precision mediump float;
// #endif
varying vec3 v_positionEC;
varying vec3 v_normalEC;
varying vec2 v_st;
varying vec3 v_p;
void main()
{
    vec3 positionToEyeEC = -v_positionEC;
    vec3 normalEC = normalize(v_normalEC);
    czm_materialInput materialInput;
    materialInput.normalEC = normalEC;
    materialInput.positionToEyeEC = positionToEyeEC;
    materialInput.st = v_st;
    materialInput.str = v_p;
    czm_material material = czm_getMaterial(materialInput);
    gl_FragColor = vec4(material.diffuse, 1.0);
}
