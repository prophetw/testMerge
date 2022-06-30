
attribute vec3 a_Position;
attribute vec3 a_Normal; // 法向量

uniform mat4 view;
uniform mat4 model;
uniform mat4 projection;

varying vec3 v_Normal; // 传给片元的法向量 接受插值
varying vec3 v_FragPos; // 片元位置

void main(){
  gl_Position = vec4(projection * view * model * vec4(a_Position, 1.0));
  v_FragPos = vec3(model * vec4(a_Position, 1.0));
  v_Normal = a_Normal;
}
