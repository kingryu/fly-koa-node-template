const path = require('path')
const fs = require('fs')
var config = require('../../config')

const fsOptions = { encoding: 'utf-8' }

function findFiles(basePath){
  let cnFileArr = []
  function mapDir(dir, relPath, lv) {
    try{
      files = fs.readdirSync(dir)
      if(files&&files.length>0){
        files.forEach((filename) => {
          let pathname = path.join(dir, filename)
          let stats = fs.statSync(pathname)
          if(stats){
            if (stats.isDirectory()) {
              let ret = mapDir(pathname, relPath + filename + '/', lv+1)
              if(ret&&ret.length>0){
                cnFileArr = cnFileArr.concat(ret)
              }
              
            } else if (stats.isFile()) {
              if (['index.js', 'index.ts'].includes(filename)) {  // 过滤文件
                return
              }
              cnFileArr.push(relPath + filename)
            }
          }
        })
      }
    }catch(e){
      console.log('read dir error',e)
    }
  }
  
  mapDir(basePath,'',0)
  return cnFileArr
}

const readFile = (file) => {
  let result = ''
  try{
    if (fs.existsSync(file)) {
      result = fs.readFileSync(file, fsOptions)
    }
  }catch(err){
    result = err.message
  }
  return result
}

const wirteFile = (file, content) => {
  let filePath = path.resolve(__dirname +  '../../../git/' + file)
  console.log('wirteFile',filePath)
  try{
    return fs.writeFileSync(filePath, parseJSON2JS(content))
  }catch(err){
    return err.message
  }
}

const parseJSON2JS = (str) =>{
  // str = str.replace(/"/g,"'")
  return 'export default '.concat(str ,';')
}

const parseJS2JSON = (text) =>{
  text = text.replace('export default','')
  text = text.trim()
  var obj = eval('js =' + text)
  return obj
}

const parseJS2XML = (str) =>{
  str = str.replace('export default {','<?xml version="1.0" encoding="UTF-8"?>\n<resources>')
  str = str.replace('};','</resources>')
  str = str.replace(/\n\s+"/g,'\n <string name="')
  str = str.replace(/":\s?"/g,'">')
  str = str.replace(/",/g,'</string>')
  str = str.replace(/\\"/g,'"')
  str = str.replace(/"\s?\n?<\/resources>/,'</string>\n</resources>')
  return str
}


module.exports = {
  index: async function  (scope) {

  },

  read: async function  (scope) {
    if(!this.query||!this.query.project){
      this.renderJSON({code:1, message:'no project'})
      return
    }
    let project = config.projectList[this.query.project]
    if(!project){
      this.renderJSON({code:1, message:'project error'})
      return
    }
    let pathName = project.folder + project.path
    let pathCn = findFiles(path.resolve(__dirname, '../../git/'+ pathName+'/zh-CN/'))
    
    let mapping = {'zh-CN':{},'en-US':{}}
    for(let i=0;i<pathCn.length;i++){
      let filePathCn = path.resolve(__dirname, '../../git/'+ pathName+'/zh-CN/'+pathCn[i])
      let filePathEn = path.resolve(__dirname, '../../git/'+ pathName +'/en-US/'+ pathCn[i])
      try{
        mapping['zh-CN'][pathCn[i]] = parseJS2JSON(readFile(filePathCn))
        mapping['en-US'][pathCn[i]] = parseJS2JSON(readFile(filePathEn))
      }catch(e){
        console.log(e)
        console.log('文件:'+filePathCn+'读取转化失败')
      }
    }
    this.renderJSON({[pathName]:mapping})
  },

  wirte: async function (scope) {
    if(!this.query||!this.query.project){
      this.renderJSON({code:1, message:'no project'})
      return
    }
    let project = config.projectList[this.query.project]
    if(!project){
      this.renderJSON({code:1, message:'project error'})
      return
    }

    let data = this.request.body
    let ret = {}
    let pathName = project.folder + project.path 
 
    let cnPath,enPath
    if(Object.keys(data)[0] == pathName){
      cnPath = data[pathName]['zh-CN']
      enPath = data[pathName]['en-US']
    }
    let cnFileArr = Object.keys(cnPath)
    let enFileArr = Object.keys(enPath)
    for(let i=0;i<cnFileArr.length;i++){
      let content = JSON.stringify(cnPath[cnFileArr[i]],null,2)
      let filePath = pathName+'/zh-CN/'+cnFileArr[i]
      ret[filePath] =  wirteFile(filePath,content)
    }
    for(let i=0;i<enFileArr.length;i++){
      let content = JSON.stringify(enPath[enFileArr[i]],null,2)
      let filePath = pathName+'/en-US/'+cnFileArr[i]
      ret[filePath] = wirteFile(filePath,content)
    }
    this.renderJSON({'data':ret,'code':0})
  },

  getJSON: async function (scope){
    if(!this.query||!this.query.project){
      this.renderJSON({code:1, message:'no project'})
      return
    }
    let project = config.projectList[this.query.project]
    if(!project){
      this.renderJSON({code:1, message:'project error'})
      return
    }
    let pathName = project.folder + project.path
    let pathCn = findFiles(path.resolve(__dirname, '../../git/'+ pathName+'/zh-CN/'))
    
    let mapping = {'zh-Hans':{},'en':{}}
    for(let i=0;i<pathCn.length;i++){
      let filePathCn = path.resolve(__dirname, '../../git/'+ pathName+'/zh-CN/'+pathCn[i])
      let filePathEn = path.resolve(__dirname, '../../git/'+ pathName +'/en-US/'+ pathCn[i])
      try{
        mapping['zh-Hans'] = parseJS2JSON(readFile(filePathCn))
        mapping['en'] = parseJS2JSON(readFile(filePathEn))
      }catch(e){
        console.log(e)
        console.log('文件:'+filePathCn+'读取转化失败')
      }
    }
    this.renderJSON({'locales':mapping})
  },

  getXML: async function (scope){
    if(!this.query||!this.query.project){
      this.renderJSON({code:1, message:'no project'})
      return
    }
    let project = config.projectList[this.query.project]
    if(!project){
      this.renderJSON({code:1, message:'project error'})
      return
    }
    let language = 'cn'
    if(this.query && this.query.language){
      if(this.query.language.indexOf('en')>-1){
        language = 'en'
      }
    }
    let pathName = project.folder + project.path
    let pathCn = findFiles(path.resolve(__dirname, '../../git/'+ pathName+'/zh-CN/'))
    let mapping
    for(let i=0;i<pathCn.length;i++){
      try{
        if(language == 'cn'){
          let filePathCn = path.resolve(__dirname, '../../git/'+ pathName+'/zh-CN/'+pathCn[i])
          mapping = parseJS2XML(readFile(filePathCn))
        }else{
          let filePathEn = path.resolve(__dirname, '../../git/'+ pathName +'/en-US/'+ pathCn[i])
          mapping = parseJS2XML(readFile(filePathEn))
        }
      }catch(e){
        console.log(e)
        console.log('文件:'+filePathCn+'读取转化失败')
      }
    }
    this.set('Content-Type', 'text/xml')
    this.body = mapping
  },
  getProjectList: async function (scope){
    this.renderJSON({code:0, message:'suc',data:config.projectList})
  }
}
