// @ts-check
let path = require('path')
let fsCache = require('./cache')
let cachePath =  path.resolve(__dirname, '../../../config/configure.json')
let cache = {}

const initConfig = () =>{
  fsCache.read(cachePath).then((res)=>{
    cache = res
  })
}

const writeCache = () => {
  if (cachePath) {
    fsCache.write(cachePath, cache)
  }
}

const get = (key) => {
  return cache[key]
}

const write = (json)=>{
  cache = json;
  writeCache()
}

module.exports = {
  write,
  initConfig,
  get
}
