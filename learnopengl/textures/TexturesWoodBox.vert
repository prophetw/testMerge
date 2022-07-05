
  attribute vec4 a_Position;
  attribute vec4 a_Color;
  attribute vec2 a_TexCoord;
  varying vec2 v_TexCoord;
  varying vec4 v_Color;
  void main() {
    gl_Position = a_Position;
    v_TexCoord = a_TexCoord;
    v_Color = a_Color;
  }
