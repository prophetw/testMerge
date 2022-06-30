
attribute vec3 a_Position;
attribute vec3 a_Normal; // 法向量

uniform mat4 view;
uniform mat4 model;
uniform mat4 projection;
uniform mat4 normalMat4; // 如果有对模型进行 不等比缩放 normalMat4 = transpose(inverse(model))

varying vec3 v_Normal; // 传给片元的法向量 接受插值
varying vec3 v_FragPos; // 片元位置

void main(){
  gl_Position = vec4(projection * view * model * vec4(a_Position, 1.0));
  v_FragPos = vec3(model * vec4(a_Position, 1.0));
  v_Normal = mat3(normalMat4) * a_Normal;
}
