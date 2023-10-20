// @ts-check
const uuid = require('uuid/v4')
const url = require('url')
const ip = require('./ip')
const os = require('os')

module.exports = function (context, message, info, level, category) {
  const req = context.request
  const requestUrl = url.parse('http://' + req.headers.host + req.originalUrl, true, true)
  const serverIp = ip.server()

  if (!context.state.requestId) {
    context.state.requestId = uuid().replace(/-/g, '')
  }

  return JSON.stringify({
    s_name: os.hostname(),
    level: level || 'info',
    message: message || '',
    method: req.method || '',
    host: req.headers.host,
    path: requestUrl.pathname,
    query_string: JSON.stringify(requestUrl.query),
    user_id: context.state.user ? context.state.user.user_id : 0,
    proj: info.project || '',
    s_ip: serverIp,
    category: category || '',
    log_time: new Date(),
    request_id: info.requestId || context.state.requestId || uuid().replace(/-/g, ''),
    timestamp: Date.now(),
  })
}
