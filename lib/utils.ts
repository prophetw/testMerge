
type AngelType = 'X' | 'Y' | 'Z'

const angleToRads = (deg: number) => (deg * Math.PI) / 180.0;

const radsToAngle = (rad: number) => rad * 180 / Math.PI;

export {
  angleToRads,
  radsToAngle,

  AngelType}
