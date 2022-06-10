import { ClickedPoints, ColoredPoint, DrawRectangle, HelloCanvas, HelloPoint1, HelloPoint2 } from "../ch02"
import {
  HelloQuad, HelloQuad_FAN, HelloTriangle,
  HelloTriangle_LINES, HelloTriangle_LINE_LOOP,
  HelloTriangle_LINE_STRIP, MultiPoint, RotatedTriangle,
  RotatedTriangle_Matrix, ScaledTriangle_Matrix, TranslatedTriangle

} from '../ch03'
import {
  RotatedTranslatedTriangle, RotatedTriangle_Matrix4, RotatingTranslatedTriangle,
  RotatingTriangle, RotatingTriangle_withButtons, TranslatedRotatedTriangle
} from '../ch04'
import {
  ColoredTriangle, HelloTriangle_FragCoord,
  MultiAttributeColor, MultiAttributeSize,
  MultiAttributeSize_Interleaved, MultiTexture,
  TexturedQuad, TexturedQuad_Clamp_Mirror, TexturedQuad_Repeat
} from '../ch05'
import {
  ColoredCube, ColoredCube_singleColor,
  DepthBuffer, HelloCube, HelloCube_singleColor,
  LookAtRotatedTriangles, LookAtRotatedTriangles_mvMatrix, LookAtTriangles,
  LookAtTrianglesWithKeys, LookAtTrianglesWithKeys_ViewVolume, OrthoView,
  OrthoView_halfSize, OrthoView_halfWidth, PerspectiveView, PerspectiveView_mvp,
  PerspectiveView_mvpMatrix, Zfighting
} from '../ch07'
import {
  LightedCube,LightedCube_ambient,
  LightedCube_animation,LightedCube_perFragment,LightedTranslatedRotatedCube,
  PointLightedCube,PointLightedCube_animation,PointLightedCube_perFragment,
  PointLightedSphere,PointLightedSphere_perFragment
} from '../ch08'
import {JointModel,MultiJointModel,MultiJointModel_segment} from '../ch09'
import {
  ThreeDoverWeb, BlendedCube, Fog,
  Fog_w, FramebufferObject, HUD, LookAtBlendedTriangles,
   OBJViewer, PickFace, PickObject, Picking,
   ProgramObject, RotateObject, RotatingTriangle_contextLost,
   RoundedPoints, Shadow, Shadow_highp, Shadow_highp_sphere
} from '../ch10'

const ExampleFn = HUD
window.onload = ()=>{
  ExampleFn()
  spector = new window.SPECTOR.Spector();
  spector.spyCanvas();
  spector.fullCapture = true;
  window.spector = spector;
  document.getElementById('spector').addEventListener('click', ()=>{
    window.spector.displayUI()
  })
}
