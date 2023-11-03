// @ts-check

var log4js = require('log4js')
var path = require('path')
var nodeEnv = require('../fly-node-env')()
var uuid = require('uuid/v4')
const fs = require("fs")
var pattern = '%m'
var opts = {}

function layout (options) {
  return {
    type: 'pattern',
    pattern: pattern
  }
}

function getPattern (type) {
  const filename = opts.filename || 'logs/logstash.log'
  const fileInfo = path.parse(filename)
  return {
    filename: `${fileInfo.dir}/${fileInfo.name}_${type}${fileInfo.ext}-${process.pid}`,
    pattern: '-yyyy-MM-dd'
  }
}

function initAppender (type) {
  const _pattern = getPattern(type)
  const _l = layout(opts)
  const _layout = log4js.layouts.layout(_l.type, _l)

  // log4js.loadAppender('dateFile')
  // log4js.addAppender(log4js.appenders.dateFile(_pattern.filename, _pattern.pattern, false, _layout), type)
}

const makeDir = (dirpath) => {
  if (!fs.existsSync(dirpath)) {
      var pathtmp;
      dirpath.split("/").forEach(function(dirname) {
          if (pathtmp) {
              pathtmp = path.join(pathtmp, dirname);
          }
          else {
              if(dirname){
                  pathtmp = dirname;
              }else{
                  pathtmp = "/"; 
              }
          }
          if (!fs.existsSync(pathtmp)) {
             fs.mkdirSync(pathtmp)
          }
      });
  }
}

var config = function (options) {
  options = options || {}
  opts = options || {}
  var appenders = []

  opts.requestId = options.requestId || uuid().replace(/-/g, '');

  ['web', 'app'].forEach(function (item) {
    var _pattern = getPattern(item)
    appenders.push({
      type: 'console', //'dateFile',
      filename: _pattern.filename,
      pattern: _pattern.pattern,
      layout: layout(options),
      alwaysIncludePattern: false,
      category: item
    })
  })

  // if (nodeEnv === 'dev' || nodeEnv === 'local') {
  //   appenders.push({
  //     type: 'console',
  //     layout: layout(options)
  //   })
  // }

  if (nodeEnv === 'prod' && !opts.appLogLevel) {
    opts.appLogLevel = 'info'
  }

  log4js.configure({
    appenders: appenders
  })
  
  let fileNameArr,filePath, fileName =opts.filename
  try{
    if(fileName&&fileName.length>0){
        fileNameArr = fileName.split('/')
        let file = fileNameArr[fileNameArr.length-1]
        if(file.charAt(file.length - 1) != '/'&&file.indexOf('.')>-1){
            fileNameArr.splice(-1)
            filePath = fileNameArr.join('/')
        }else{
            filePath = fileName
        }
    }
    if(!fs.existsSync(filePath)){
        makeDir(filePath)
    }
  }catch(e){
      console.error(e)
  }
}

var Logger = {
  init: config
}

var appLogger
['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'mark'].forEach(function (item) {
  Logger[item] = function (message) {
    if (!appLogger) {
      appLogger = log4js.getLogger('app')
      if (opts.appLogLevel) {
        appLogger.setLevel(opts.appLogLevel)
      }
    }
    if (appLogger[item]) appLogger[item](message)
  }
})

var accessLogger
Logger.access = function (message) {
  if (!accessLogger) {
    accessLogger = log4js.getLogger('web')
  }
  accessLogger.info(message)
}

var performanceLogger

Logger.performance = function (message) {
  if (!performanceLogger) {
    initAppender('performance')
    performanceLogger = log4js.getLogger('performance')
  }
  performanceLogger.info(message)
}

module.exports = Logger
