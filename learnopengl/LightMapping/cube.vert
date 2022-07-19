attribute vec3 aPos;
attribute vec3 aNormal;
attribute vec2 aTexCoords;

varying vec3 v_fragPos; // like "in xxx "  in opengl
varying vec3 v_Normal; // like "in xxx " in opengl
varying vec2 v_TexCoord;

uniform mat4 model;
uniform mat4 transposeInversModel;
uniform mat4 view;
uniform mat4 projection;

void main()
{
    v_fragPos = vec3(model * vec4(aPos, 1.0));
    v_Normal = mat3(transposeInversModel) * aNormal;
    v_TexCoord = aTexCoords;

    gl_Position = projection * view * vec4(v_fragPos, 1.0);
}
