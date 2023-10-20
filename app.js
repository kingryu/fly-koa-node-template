let http = require('http')
let app = require('./lib/app')
let config = require('./config')

let cloneProject = require('./gitCloneI18n')

let host = app.callback()
let PORT = config.PORT
let HOST_ADDRESS = config.HOST_ADDRESS
http.createServer(host).listen(PORT, HOST_ADDRESS)
console.log('server is runing in '+ HOST_ADDRESS + ':' + PORT)

/*
const runServer = () => {
  cloneProject().then(()=>{
    let app = require('./lib/app')
    let host = app.callback()
    let PORT = config.PORT
    let HOST_ADDRESS = config.HOST_ADDRESS
    http.createServer(host).listen(PORT, HOST_ADDRESS)
    console.log(`node is start at: http://${HOST_ADDRESS}:${PORT}`)
  },(e)=>{console.log(e)})
}

runServer()
*/