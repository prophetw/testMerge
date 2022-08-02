
  attribute vec4 a_Position;
  attribute vec4 a_Color;
  attribute float a_Face;    // Surface number (Cannot use int for attribute variable)
  uniform mat4 u_MvpMatrix;
  uniform vec3 u_CameraPos;
  uniform int u_PickedFace;  // Surface number of selected face

  varying vec4 v_Point;
  varying vec4 v_Color;

  void main() {
    v_Point = a_Position;
    float highlightFace = 0.0;
    vec4 point = u_MvpMatrix * a_Position;
    gl_Position = point;
    int face = int(a_Face);  // Convert to int

    vec3 dirCam = normalize(u_CameraPos);
    vec3 dirPt = normalize(vec3(a_Position));
    float cosQ = dot(dirCam, dirPt);
    vec3 color =  a_Color.rgb;

    // vec3 color = (face == u_PickedFace || face == highlightFace) ? vec3(1.0) : a_Color.rgb;
    if(cosQ == 1.0){
      highlightFace = a_Face;
    }
    if(
      face == u_PickedFace
      ||
      face == int(highlightFace)
    ){
      color = vec3(1.0);
    }
    // if(face == 1){
    //   color = vec3(1.0);
    //   highlightFace = a_Face;
    // }
    // v_Color = vec4(1.0, 1.0, 1.0, highlightFace / 255.0);
    if(u_PickedFace == 0) {  // In case of 0, insert the face number into alpha
      v_Color = vec4(color, a_Face/255.0);
    }else {
      v_Color = vec4(color, a_Color.a);
    }
  }
