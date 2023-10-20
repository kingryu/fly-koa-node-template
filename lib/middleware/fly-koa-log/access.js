// @ts-check

const url = require('url')
const uuid = require('uuid/v4')
const ip = require('./ip')
const os = require('os')

const regUnsafeCookies = /^\s*(clubauth|fly_token)/i
const unsafeHeaders = ['access_token']

function maskString (str) {
  const length = str.length
  const maskLen = Math.floor(length / 2)
  let mask = '*'
  mask = mask.repeat(maskLen)
  return mask + str.substring(maskLen)
}

function removeUnSafeData (headers) {
  for (let c of unsafeHeaders) {
    if (headers[c]) {
      headers[c] = maskString(headers[c])
    }
  }

  if (headers.cookie) {
    const arr = headers.cookie.split(';')
    headers.cookie = arr.map(s => {
      const cookieArray = s.split('=')
      if (regUnsafeCookies.test(cookieArray[0])) {
        cookieArray[1] = maskString(cookieArray[1])
        return cookieArray.join('=')
      }
      return s
    }).join(';')
  }
  return headers
}

module.exports = function (context, info) {
  const req = context.request
  const res = context.response
  const requestUrl = url.parse('http://' + req.headers.host + req.originalUrl, true, true)
  const clientIP = ip.client(req)
  const serverIP = ip.server()
  const resLength = res.get('content-length')
  const reqLength = req.get('content-length')

  info = info || {}

  function $parseInt (num) {
    return num * 1
  }

  const reqHeaders = Object.assign({}, req.headers)
  removeUnSafeData(reqHeaders)
  return JSON.stringify({
    s_name: os.hostname(),
    log_time: new Date(),
    s_ip: serverIP,
    s_headers: JSON.stringify(res.headers),
    c_headers: JSON.stringify(reqHeaders),
    method: req.method,
    host: req.headers.host,
    path: requestUrl.pathname,
    query_string: JSON.stringify(requestUrl.query),
    c_ip: clientIP,
    user_id: info.userId || context.state.user ? context.state.user.user_id : 0,
    useragent: req.headers['user-agent'],
    referer: req.headers.referrer || req.headers.referer || '',
    status: res.status,
    c_bytes: $parseInt(reqLength),
    s_bytes: $parseInt(resLength),
    time_taken: info.responseTime || 0,
    time_third_api: info.apiTime || 0,
    request_id: context.state.requestId || uuid().replace(/-/g, ''),
     timestamp: Date.now(),
  })
}
