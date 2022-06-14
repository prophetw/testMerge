import * as SPECTOR from 'spectorjs/src/spector'
declare global {
  interface Window { spector: SPECTOR.Spector; }
}


export default SPECTOR
