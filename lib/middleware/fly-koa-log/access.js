// @ts-check

const url = require('url')
const uuid = require('uuid/v4')
const ip = require('./ip')
const { authKey } = require('../../../utils/common')

const unUseHeaders = ['sec-fetch-site','sec-ch-ua','sec-ch-ua-mobile','sec-ch-ua-platform','sec-fetch-site','sec-fetch-dest','sec-fetch-user','sec-fetch-mode', 'connection', 'cache-control','upgrade-insecure-requests','origin','accept-encoding','accept-language']

function maskString (str) {
  const length = str.length
  const maskLen = Math.floor(length / 2)
  let mask = '*'
  mask = mask.repeat(maskLen)
  return mask + str.substring(maskLen)
}

function getCookie(cookies,key) {
  const str = `(^| )${key}=([^;]*)(;|$)`
  const reg = new RegExp(str)
  const arr = cookies.match(reg)
  if (!arr) {
    return null
  }
  return arr[0]
}

function removeUnUseData (headers) {
  for (let c of unUseHeaders) {
    if (headers[c]) {
      headers[c] = maskString(headers[c])
    }
  }
  if (headers.cookie) {
    headers.cookie = getCookie(headers.cookie, authKey())
  }
  return headers
}

module.exports = function (context, info) {
  const req = context.request
  const res = context.response
  const requestUrl = url.parse('http://' + req.headers.host + req.originalUrl, true, true)
  const clientIP = ip.client(req)
  const serverIP = ip.server()

  info = info || {}

  const reqHeaders = Object.assign({}, req.headers)
  removeUnUseData(reqHeaders)

  let resBody = {code: res.body.code, message:res.body.message}
  if(res.status != 200||res.body.code!=0){
    resBody = res.body
  }

  return JSON.stringify({
    t: new Date(),
    path: requestUrl.href,
    m: req.method,
    chead: reqHeaders,
    cBody:req.body,
    uid: info.uid || context.state.user ? context.state.user.uid : 0,
    IP: clientIP + '-' + serverIP,
    status: res.status,
    shead: res.headers,
    sBody: resBody,
    id: context.state.requestId || uuid().replace(/-/g, ''),
  })
}
