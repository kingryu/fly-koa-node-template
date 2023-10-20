const parser = require('ua-parser-js');

function domainPrefix () {
  const prefixs = {
    'prod': '',
    'qa': 'qa',
    'yz': 'yz',
    'dev': 'dev'
  }
  return prefixs[getNodeEnv()]
}

function isMobile (ctx) {
  const reg = /iPhone|iPad|Android|SymbianOS|htc|IEMobile/
  let result = reg.test(ctx.header['user-agent'])
  return result
}

function isNullOrEmpty (str) {
  return typeof str === 'undefined' || str.trim().length === 0
}

function getNodeEnv () {
  const env = process.env
  return env.NODE_ENV || 'prod'
}

function apiCheck (ctx) {
  //浏览器直接访问接口地址时返回403
  let referer = ctx.header['referer']||'';
  if(referer&&!referer.startsWith('http://')){
    ctx.query.debug&&console.log('has referer:'+ctx.header['referer'])
    return false
  }
  if((ctx.query.isDev&&ctx.query.isDev=='1')||(referer&&(referer.indexOf('http://qa.d.')>-1||referer.indexOf('http://yz.d.')>-1))){
    //support debug for developer
    ctx.query.debug&&console.log('isDev')
    return false
  }
  ctx.status = 403;
  return true;
}

function isLogin (scope) {
  const {userInfo} = scope
  let result = !!userInfo && userInfo.user_id && userInfo.user_id.length > 0
  return result
}

function isBrowserObsolete(ctx) {
  const userAgent = ctx.headers['user-agent'];
  const {name, version} = parser(userAgent).browser;
  switch (name) {
    case 'IE':
      return +version < 9;
    case 'Edge':
      return +version < 6;
    case 'Chrome':
      return +version < 4.10;
    case 'Firefox':
      return +version < 19.5;
    default:
      return false;
  }
}

function isNullOrEmpty (str) {
  return typeof str === 'undefined' || str.trim().length === 0
}

function urlCheck(url){
  if (!isNullOrEmpty(url)) {
    url = url.split("'")[0]
    url = url.split("%27")[0]
    url = url.split('"')[0]
    url = url.split('%22')[0]
    url = url.replace('/(document|javascript|;|%3B|atob|script|location(.|%3F|\[|%5B))+/','')
    return url
  } else {
    return ''
  }
}

function queryReturnUrl (ctx) {
  let result
  let {query} = ctx
  result = query.url || query.returnurl || query.returnUrl || ''
  result = urlCheck(result)
  return result
}

function getCurDomain (ctx) {
  let reg = /(.*?)\.(.*?)\.(.*?)$/g
  let hostName = ctx.request.hostname

  if (reg.test(hostName)) {
    return `.${RegExp.$2}.${RegExp.$3}`
  }
}

function parserServerError(data){
  console.log('server Error',data)
  if(data.body){
    data = data.body
  }
  let message = data && data.message||JSON.stringify(data)
  let code = data && data.code||data && data.status||40500
  if(message.length>20&&domainPrefix()===''){
    message = 'server error! please try again later'
  }
  return {code,message,data:null}
}

function authKey () {
  if (['dev', 'qa'].includes(getNodeEnv())) {
    return 'flyauthdev'
  } else {
    return 'flyauth'
  }
}

function clearAuth (ctx) {
  { // 清除Auth 
    const name =  authKey();
    const domain = getCurDomain(ctx)
    const options = { domain };
    //const useragent = ctx.get('User-Agent');
    // const includeSamaSiteNone = useragent && !isSameSiteNoneIncompatible(useragent);
    // if (includeSamaSiteNone) {
    //   ctx.cookies.secure = true;
    //   Object.assign(options, {
    //     secure: true,
    //     sameSite: 'none'
    //   });
    // }
    ctx.cookies.set(name, null, options);
  }
}

function setToken(ctx) {
  const token = ctx.headers['Token']
  if(!token){
    const flyAuth = ctx.cookies.get(authKey())
    if(flyAuth){
      let headers = {}
      headers['Token'] = flyAuth
      ctx.request.header = { ...ctx.request.header, ...headers }
    }
  }
}

module.exports = {
  domainPrefix,
  isMobile,
  clearAuth,
  isNullOrEmpty,
  getNodeEnv,
  getCurDomain,
  isLogin,
  queryReturnUrl,
  parserServerError,
  isBrowserObsolete,
  apiCheck,
  authKey,
  setToken
}
