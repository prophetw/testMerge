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


const ExampleFn = PointLightedCube_perFragment
window.onload = ExampleFn
