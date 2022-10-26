
type AngelType = 'X' | 'Y' | 'Z'

const angleToRads = (deg: number) => (deg * Math.PI) / 180.0;

const radsToAngle = (rad: number) => rad * 180 / Math.PI;

//  gl.vertexAttribPointer(
  // index, b.numComponents || b.size, b.type || gl.FLOAT, b.normalize || false, b.stride || 0, b.offset || 0)
interface AttribPointerParams {
  numComponents?: number
  size: number // same as numComponents
  buffer: WebGLBuffer // gl.createBuffer
  type?: number // gl data type
  normalize?: boolean //
  stride?: number
  offset?: number
  value?: Float32Array
}
/**
   * Creates setter functions for all attributes of a shader
   * program. You can pass this to {@link module:webgl-utils.setBuffersAndAttributes} to set all your buffers and attributes.
   *
   * @see {@link module:webgl-utils.setAttributes} for example
   * @param {WebGLProgram} program the program to create setters for.
   * @return {Object.<string, function>} an object with a setter for each attribute by name.
   * @memberOf module:webgl-utils
   */
function createAttributeSetters(gl: WebGLRenderingContext, program: WebGLProgram) {
  const attribSetters: {
    [key: string]: (b: AttribPointerParams) => void } = {
  };

  // function createAttribSetter(index: number): (b: {value: Float32Array})=>void;
  function createAttribSetter(index: number): (b: AttribPointerParams)=>void;
  function createAttribSetter(index: number) {
    return function(b: AttribPointerParams) {
        if (b.value) {
          gl.disableVertexAttribArray(index);
          switch (b.value.length) {
            case 4:
              gl.vertexAttrib4fv(index, b.value);
              break;
            case 3:
              gl.vertexAttrib3fv(index, b.value);
              break;
            case 2:
              gl.vertexAttrib2fv(index, b.value);
              break;
            case 1:
              gl.vertexAttrib1fv(index, b.value);
              break;
            default:
              throw new Error('the length of a float constant value must be between 1 and 4!');
          }
        } else {
          b = b as AttribPointerParams
          gl.bindBuffer(gl.ARRAY_BUFFER, b.buffer);
          gl.enableVertexAttribArray(index);
          gl.vertexAttribPointer(
              index, b.numComponents || b.size, b.type || gl.FLOAT, b.normalize || false, b.stride || 0, b.offset || 0);
        }
      };
  }

  const numAttribs = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
  for (let ii = 0; ii < numAttribs; ++ii) {
    const attribInfo = gl.getActiveAttrib(program, ii);
    if (!attribInfo) {
      break;
    }
    const index = gl.getAttribLocation(program, attribInfo.name);
    attribSetters[attribInfo.name] = createAttribSetter(index);
  }

  return attribSetters;
}


 /**
   * Sets attributes and binds buffers (deprecated... use {@link module:webgl-utils.setBuffersAndAttributes})
   *
   * Example:
   *
   *     let program = createProgramFromScripts(
   *         gl, ["some-vs", "some-fs"]);
   *
   *     let attribSetters = createAttributeSetters(program);
   *
   *     let positionBuffer = gl.createBuffer();
   *     let texcoordBuffer = gl.createBuffer();
   *
   *     let attribs = {
   *       a_position: {buffer: positionBuffer, numComponents: 3},
   *       a_texcoord: {buffer: texcoordBuffer, numComponents: 2},
   *     };
   *
   *     gl.useProgram(program);
   *
   * This will automatically bind the buffers AND set the
   * attributes.
   *
   *     setAttributes(attribSetters, attribs);
   *
   * Properties of attribs. For each attrib you can add
   * properties:
   *
   * *   type: the type of data in the buffer. Default = gl.FLOAT
   * *   normalize: whether or not to normalize the data. Default = false
   * *   stride: the stride. Default = 0
   * *   offset: offset into the buffer. Default = 0
   *
   * For example if you had 3 value float positions, 2 value
   * float texcoord and 4 value uint8 colors you'd setup your
   * attribs like this
   *
   *     let attribs = {
   *       a_position: {buffer: positionBuffer, numComponents: 3},
   *       a_texcoord: {buffer: texcoordBuffer, numComponents: 2},
   *       a_color: {
   *         buffer: colorBuffer,
   *         numComponents: 4,
   *         type: gl.UNSIGNED_BYTE,
   *         normalize: true,
   *       },
   *     };
   *
   * @param {Object.<string, function>|model:webgl-utils.ProgramInfo} setters Attribute setters as returned from createAttributeSetters or a ProgramInfo as returned {@link module:webgl-utils.createProgramInfo}
   * @param {Object.<string, module:webgl-utils.AttribInfo>} attribs AttribInfos mapped by attribute name.
   * @memberOf module:webgl-utils
   * @deprecated use {@link module:webgl-utils.setBuffersAndAttributes}
   */
function setAttributes(setters, attribs) {
  setters = setters.attribSetters || setters;
  Object.keys(attribs).forEach(function(name) {
    const setter = setters[name];
    if (setter) {
      setter(attribs[name]);
    }
  });
}

function getBindPointForSamplerType(gl: WebGLRenderingContext, type: number) {
  if (type === gl.SAMPLER_2D)   return gl.TEXTURE_2D;        // eslint-disable-line
  if (type === gl.SAMPLER_CUBE) return gl.TEXTURE_CUBE_MAP;  // eslint-disable-line
  return undefined;
}

function createUniformSetters(gl: WebGLRenderingContext, program: WebGLProgram) {
  let textureUnit = 0;

  /**
   * Creates a setter for a uniform of the given program with it's
   * location embedded in the setter.
   * @param {WebGLProgram} program
   * @param {WebGLUniformInfo} uniformInfo
   * @returns {function} the created setter.
   */
  function createUniformSetter(program: WebGLProgram, uniformInfo: WebGLActiveInfo ) {
    const location = gl.getUniformLocation(program, uniformInfo.name);
    const type = uniformInfo.type;
    // Check if this uniform is an array
    const isArray = (uniformInfo.size > 1 && uniformInfo.name.substr(-3) === '[0]');
    if (type === gl.FLOAT && isArray) {
      return function(v: Float32Array) {
        gl.uniform1fv(location, v);
      };
    }
    if (type === gl.FLOAT) {
      return function(v: Float32Array) {
        gl.uniform1f(location, v);
      };
    }
    if (type === gl.FLOAT_VEC2) {
      return function(v: Float32Array) {
        gl.uniform2fv(location, v);
      };
    }
    if (type === gl.FLOAT_VEC3) {
      return function(v: Float32Array) {
        gl.uniform3fv(location, v);
      };
    }
    if (type === gl.FLOAT_VEC4) {
      return function(v: Float32Array) {
        gl.uniform4fv(location, v);
      };
    }
    if (type === gl.INT && isArray) {
      return function(v) {
        gl.uniform1iv(location, v);
      };
    }
    if (type === gl.INT) {
      return function(v: Float32Array) {
        gl.uniform1i(location, v);
      };
    }
    if (type === gl.INT_VEC2) {
      return function(v: Float32Array) {
        gl.uniform2iv(location, v);
      };
    }
    if (type === gl.INT_VEC3) {
      return function(v: Float32Array) {
        gl.uniform3iv(location, v);
      };
    }
    if (type === gl.INT_VEC4) {
      return function(v: Float32Array) {
        gl.uniform4iv(location, v);
      };
    }
    if (type === gl.BOOL) {
      return function(v: Float32Array) {
        gl.uniform1iv(location, v);
      };
    }
    if (type === gl.BOOL_VEC2) {
      return function(v: Float32Array) {
        gl.uniform2iv(location, v);
      };
    }
    if (type === gl.BOOL_VEC3) {
      return function(v: Float32Array) {
        gl.uniform3iv(location, v);
      };
    }
    if (type === gl.BOOL_VEC4) {
      return function(v: Float32Array) {
        gl.uniform4iv(location, v);
      };
    }
    if (type === gl.FLOAT_MAT2) {
      return function(v: Float32Array) {
        gl.uniformMatrix2fv(location, false, v);
      };
    }
    if (type === gl.FLOAT_MAT3) {
      return function(v: Float32Array) {
        gl.uniformMatrix3fv(location, false, v);
      };
    }
    if (type === gl.FLOAT_MAT4) {
      return function(v: Float32Array) {
        gl.uniformMatrix4fv(location, false, v);
      };
    }
    if ((type === gl.SAMPLER_2D || type === gl.SAMPLER_CUBE) && isArray) {
      const units = [];
      for (let ii = 0; ii < uniformInfo.size; ++ii) {
        units.push(textureUnit++);
      }
      return function(bindPoint: number | undefined, units) {
        return function(textures: WebGLTexture[]) {
          gl.uniform1iv(location, units);
          textures.forEach(function(texture, index) {
            if(!bindPoint) return
            gl.activeTexture(gl.TEXTURE0 + units[index]);
            gl.bindTexture(bindPoint, texture);
          });
        };
      }(getBindPointForSamplerType(gl, type), units);
    }
    if (type === gl.SAMPLER_2D || type === gl.SAMPLER_CUBE) {
      return function(bindPoint: number | undefined, unit) {
        return function(texture: WebGLTexture) {
          if(!bindPoint) return
          gl.uniform1i(location, unit);
          gl.activeTexture(gl.TEXTURE0 + unit);
          gl.bindTexture(bindPoint, texture);
        };
      }(getBindPointForSamplerType(gl, type), textureUnit++);
    }
    throw ('unknown type: 0x' + type.toString(16)); // we should never get here.
  }

  const uniformSetters: {
    [key: string]: (uniformVal: Float32Array) => void
  } = { };
  const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

  for (let ii = 0; ii < numUniforms; ++ii) {
    const uniformInfo = gl.getActiveUniform(program, ii);
    if (!uniformInfo) {
      break;
    }
    let name = uniformInfo.name;
    // remove the array suffix.
    if (name.substr(-3) === '[0]') {
      name = name.substr(0, name.length - 3);
    }
    const setter = createUniformSetter(program, uniformInfo);
    uniformSetters[name] = setter;
  }
  return uniformSetters;
}

 /**
   * Set uniforms and binds related textures.
   *
   * Example:
   *
   *     let programInfo = createProgramInfo(
   *         gl, ["some-vs", "some-fs"]);
   *
   *     let tex1 = gl.createTexture();
   *     let tex2 = gl.createTexture();
   *
   *     ... assume we setup the textures with data ...
   *
   *     let uniforms = {
   *       u_someSampler: tex1,
   *       u_someOtherSampler: tex2,
   *       u_someColor: [1,0,0,1],
   *       u_somePosition: [0,1,1],
   *       u_someMatrix: [
   *         1,0,0,0,
   *         0,1,0,0,
   *         0,0,1,0,
   *         0,0,0,0,
   *       ],
   *     };
   *
   *     gl.useProgram(program);
   *
   * This will automatically bind the textures AND set the
   * uniforms.
   *
   *     setUniforms(programInfo.uniformSetters, uniforms);
   *
   * For the example above it is equivalent to
   *
   *     let texUnit = 0;
   *     gl.activeTexture(gl.TEXTURE0 + texUnit);
   *     gl.bindTexture(gl.TEXTURE_2D, tex1);
   *     gl.uniform1i(u_someSamplerLocation, texUnit++);
   *     gl.activeTexture(gl.TEXTURE0 + texUnit);
   *     gl.bindTexture(gl.TEXTURE_2D, tex2);
   *     gl.uniform1i(u_someSamplerLocation, texUnit++);
   *     gl.uniform4fv(u_someColorLocation, [1, 0, 0, 1]);
   *     gl.uniform3fv(u_somePositionLocation, [0, 1, 1]);
   *     gl.uniformMatrix4fv(u_someMatrix, false, [
   *         1,0,0,0,
   *         0,1,0,0,
   *         0,0,1,0,
   *         0,0,0,0,
   *       ]);
   *
   * Note it is perfectly reasonable to call `setUniforms` multiple times. For example
   *
   *     let uniforms = {
   *       u_someSampler: tex1,
   *       u_someOtherSampler: tex2,
   *     };
   *
   *     let moreUniforms {
   *       u_someColor: [1,0,0,1],
   *       u_somePosition: [0,1,1],
   *       u_someMatrix: [
   *         1,0,0,0,
   *         0,1,0,0,
   *         0,0,1,0,
   *         0,0,0,0,
   *       ],
   *     };
   *
   *     setUniforms(programInfo.uniformSetters, uniforms);
   *     setUniforms(programInfo.uniformSetters, moreUniforms);
   *
   * @param {Object.<string, function>|module:webgl-utils.ProgramInfo} setters the setters returned from
   *        `createUniformSetters` or a ProgramInfo from {@link module:webgl-utils.createProgramInfo}.
   * @param {Object.<string, value>} an object with values for the
   *        uniforms.
   * @memberOf module:webgl-utils
   */

function setUniforms(setters, ...values) {
  setters = setters.uniformSetters || setters;
  for (const uniforms of values) {
    Object.keys(uniforms).forEach(function(name) {
      const setter = setters[name];
      if (setter) {
        setter(uniforms[name]);
      }
    });
  }
}

/**
 * Sets attributes and buffers including the `ELEMENT_ARRAY_BUFFER` if appropriate
 *
 * Example:
 *
 *     let programInfo = createProgramInfo(
 *         gl, ["some-vs", "some-fs"]);
 *
 *     let arrays = {
 *       position: { numComponents: 3, data: [0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0], },
 *       texcoord: { numComponents: 2, data: [0, 0, 0, 1, 1, 0, 1, 1],                 },
 *     };
 *
 *     let bufferInfo = createBufferInfoFromArrays(gl, arrays);
 *
 *     gl.useProgram(programInfo.program);
 *
 * This will automatically bind the buffers AND set the
 * attributes.
 *
 *     setBuffersAndAttributes(programInfo.attribSetters, bufferInfo);
 *
 * For the example above it is equivilent to
 *
 *     gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
 *     gl.enableVertexAttribArray(a_positionLocation);
 *     gl.vertexAttribPointer(a_positionLocation, 3, gl.FLOAT, false, 0, 0);
 *     gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
 *     gl.enableVertexAttribArray(a_texcoordLocation);
 *     gl.vertexAttribPointer(a_texcoordLocation, 4, gl.FLOAT, false, 0, 0);
 *
 * @param {WebGLRenderingContext} gl A WebGLRenderingContext.
 * @param {Object.<string, function>} setters Attribute setters as returned from `createAttributeSetters`
 * @param {module:webgl-utils.BufferInfo} buffers a BufferInfo as returned from `createBufferInfoFromArrays`.
 * @memberOf module:webgl-utils
 */
  function setBuffersAndAttributes(gl: WebGLRenderingContext, setters, buffers) {
  setAttributes(setters, buffers.attribs);
  if (buffers.indices) {
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
  }
}

const printUsedVariables = (gl: WebGLRenderingContext, program: WebGLProgram)=>{
  const varObj: {
    attribute: {
      [key: string]: WebGLActiveInfo | null
    }
    uniform: {
      [key: string]: WebGLActiveInfo | null
    }
  } = {
    attribute: {},
    uniform: {}
  }

  const numAttribs = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
  for (let ii = 0; ii < numAttribs; ++ii) {
    const attribInfo = gl.getActiveAttrib(program, ii);
    if (!attribInfo) {
      break;
    }
    varObj.attribute[attribInfo.name] = attribInfo;
  }

  const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

  for (let ii = 0; ii < numUniforms; ++ii) {
    const uniformInfo = gl.getActiveUniform(program, ii);
    if (!uniformInfo) {
      break;
    }
    let name = uniformInfo.name;
    // remove the array suffix.
    if (name.substr(-3) === '[0]') {
      name = name.substr(0, name.length - 3);
    }
    varObj.uniform[name] = uniformInfo;
  }

  return varObj;

}

export {
  angleToRads,
  radsToAngle,
  createAttributeSetters,
  createUniformSetters,
  setUniforms,
  setAttributes,
  setBuffersAndAttributes,
  printUsedVariables,


  AttribPointerParams,
  AngelType
}
