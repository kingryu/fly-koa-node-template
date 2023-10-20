const fs = require('fs');
const path = require('path')

const fsOptions = { encoding: 'utf-8' };

const readFile = (file, staticServer = '') => {
  let result = fs.readFileSync(file, fsOptions)
  if (result) {
    result = JSON.parse(result)
  }
  return result
}

module.exports = ({ key = 'bundle' }) => {
  let mapArr = {}

  const getMappingArr = () => {
    return mapArr
  }

  let verArr = []
  const fileUrl = path.resolve(__dirname, "../../assets/static");
  let files = fs.readdirSync(fileUrl);
  files.forEach(function (file) {
    let url = fileUrl + '/' + file;
    if (fs.statSync(url).isDirectory()) {
      if (!file.startsWith('.')) {
        verArr.push(file)
      }
    }
  });


  verArr.forEach((item) => {
    let mapArrPath = path.resolve(__dirname, "../../assets/static/" + item + "/asset-manifest.json");
    if (fs.existsSync(mapArrPath)) {
      let mapping = readFile(mapArrPath)
      if(mapping.entrypoints){
        mapArr[item] = mapping.entrypoints
        mapArr.files = mapping.files
      }
    }
    let mapArrPath2 = path.resolve(__dirname, "../../assets/static/" + item + "/manifest.json");
    if (fs.existsSync(mapArrPath2)) {
      let mapping = readFile(mapArrPath2)
      if(mapping['index.html']){
        mapArr[item] = mapping['index.html']
      }
    }
  })

  return (ctx, next) => {
    let mapArr = getMappingArr();
    ctx.state.scope[key] = mapArr

    return next();
  }
}