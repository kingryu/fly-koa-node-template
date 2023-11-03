const ip = require('./ip')

module.exports = function (context, info) {
  const req = context.request
  const ua = req.headers['user-agent']
  const clientIP = ip.client(req)
  const serverIP = ip.server()

  return JSON.stringify({
    load_time: info.loadTime || 0,
    ready_time: info.readyTime || 0,
    browser: info.browser || '',
    s_ip: serverIP || '',
    os: '',
    ua: ua,
    url: context.url,
    proj: info.project,
    business: info.business,
    c_ip: clientIP,
    request_id: info.requestId || ''
  })
}
