
attribute vec3 a_Position;

uniform mat4 view;
uniform mat4 model;
uniform mat4 projection;

void main(){
  gl_Position = vec4(projection * view * model * vec4(a_Position, 1.0));
}
