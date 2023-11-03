// @ts-check
const uuid = require('uuid/v4')
const url = require('url')
const ip = require('./ip')

module.exports = function (context, message, info, level, category) {
  const req = context.request
  const requestUrl = url.parse('http://' + req.headers.host + req.originalUrl, true, true)
  const serverIp = ip.server()

  if (!context.state.requestId) {
    context.state.requestId = uuid().replace(/-/g, '')
  }

  return JSON.stringify({
    lv: level || 'info',
    href: requestUrl.href,
    m: req.method || '',
    msg: message || '',
    uid: context.state.user ? context.state.user.uid : 0,
    pj: info.project || '',
    ip: serverIp,
    c: category || '',
    t: new Date(),
    id: info.requestId || context.state.requestId || uuid().replace(/-/g, ''),
  })
}
