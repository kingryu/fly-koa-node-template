var env = process.env
var pkg = require('../package.json')
var NODE_ENV = env.NODE_ENV || 'prod'
//基础配置不需要区分环境的配置
module.exports = {
  'PORT': env.PORT || '5008',
  'HOST_ADDRESS': env.HOST_ADDRESS || '0.0.0.0',
  'NODE_ENV': NODE_ENV || 'prod',
  logFilePath: env.LOG_PATH || './home/logs/' + pkg.name + '/logstash/logstash.log',
  appName: pkg.name,
  loginServer:"http://xxx.example.com",
  account:'http://xxx-account:8080',
  platform:'http://xxx-soa-platform:8080',
  game:'http://xxx-game-api:7271',
  pay:'http://xxx-soa-order:8080',
  task:'http://xxx-soa-event:8080',
  match:'http://xxx.example.com:30009',
}
