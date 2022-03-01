const fs = require('fs');
const path = require('path')
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
      const regExp = /VSHADER_SOURCE[\w\W]*\\n'/g
      const content = fs.readFileSync(absolutePath, {
        encoding: 'utf8'
      })
      const matchRes = content.match(regExp)
      if (matchRes && matchRes[0] && typeof matchRes[0] === 'string') {
        let codeStr = matchRes[0]
        const vertRegExp = /VSHADER_SOURCE\s*=([\w\W]*?\})/
        const fragRegExp = /FSHADER_SOURCE\s*=([\w\W]*?})/
        const vertCodeStrRes = codeStr.match(vertRegExp)
        let vertCode = vertCodeStrRes && vertCodeStrRes[1] || ''
        const fragCodeStrRes = codeStr.match(fragRegExp)
        let fragCode = fragCodeStrRes && fragCodeStrRes[1] || ''
        vertCode = vertCode.replace(/\\n/g, '')
        vertCode = vertCode.replace(/\'/g, '')
        vertCode = vertCode.replace(/\+/g, '')
        fragCode = fragCode.replace(/\\n/g, '')
        fragCode = fragCode.replace(/\'/g, '')
        fragCode = fragCode.replace(/\+/g, '')
        // console.log(fragCodeStrRes);
        const extName = path.extname(absolutePath)
        const vertglslPath = absolutePath.replace(extName, '.vert.glsl')
        const fragglslPath = absolutePath.replace(extName, '.frag.glsl')
        if (vertCode.trim()) {
          fs.writeFileSync(vertglslPath, vertCode, {
            encoding: 'utf8'
          })
        }
        if (fragCode.trim()) {
          fs.writeFileSync(fragglslPath, fragCode, {
            encoding: 'utf8'
          })
        }
      }
    }
  })

}
extractGLSL('./')