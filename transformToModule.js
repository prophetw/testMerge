const fs = require('fs');
const path = require('path')
const gIndexJs = (rootFolderName) => {
  const rootPath = path.resolve(rootFolderName)
  const dirAry = fs.readdirSync(rootPath);
  const indexJsFilePath = path.resolve(rootFolderName + '/index.js')
  const exportsAry = dirAry.map(fileName => {
    if (fileName.indexOf('.js') > -1) {
      const fileNameWithExt = fileName.slice(0, -3)
      return fileNameWithExt
    } else {
      return ''
    }
  }).filter(n => n !== '')
  let indexJsStr = ``
  exportsAry.map((moduleName) => {
    const str = `import ${moduleName} from './${moduleName}'\n`
    indexJsStr += str
  })
  const exportsStr = `export {${exportsAry.join(',')}}`
  indexJsStr = indexJsStr + exportsStr
  console.log(indexJsStr);
  fs.writeFileSync(indexJsFilePath, indexJsStr, {
    encoding: 'utf-8'
  })
}
const extractGLSL = (rootFolderName) => {
  const rootPath = path.resolve(rootFolderName)
  const dirAry = fs.readdirSync(rootPath);
  dirAry.map((fileName) => {
    const relativePath = path.join(rootFolderName, fileName)
    const absolutePath = path.resolve(relativePath)
    const stat = fs.statSync(absolutePath)
    if (stat.isDirectory()) {
      //
      return extractGLSL(absolutePath)
    } else {
      if (fileName.indexOf('.js') > -1) {
        const content = fs.readFileSync(absolutePath, {
          encoding: 'utf8'
        })
        const fileNameWithExt = fileName.slice(0, -3)
        let newContent = content
        if (content.indexOf('VSHADER_SOURCE') > -1 && content.indexOf('import VSHADER_SOURCE') === -1) {
          const str = `import VSHADER_SOURCE from './${fileNameWithExt}.vert.glsl'`
          newContent = str + '\n' + newContent
        }
        if (content.indexOf('FSHADER_SOURCE') > -1 && content.indexOf('import FSHADER_SOURCE') === -1) {
          const str = `import FSHADER_SOURCE from './${fileNameWithExt}.vert.glsl'`
          newContent = str + '\n' + newContent
        }
        if (content.indexOf('export default') === -1) {
          newContent += '\nexport default main'
        }
        fs.writeFileSync(absolutePath, newContent, {
          encoding: 'utf8'
        })
      }
    }
  })
}
extractGLSL('./ch10')
gIndexJs('./ch10')
