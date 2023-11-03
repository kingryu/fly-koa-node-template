// @ts-check

const debug = require('debug')('auth')
const request = require('request')
const config = require('../../../config')
const { authKey } = require('../../../utils/common');

const RET_STATUS = {
  SUCCESS: 'success', 
  FAIL: 'fail', 
  NO_COOKIE: 'noCookie' 
}

const getData = (url, options, log) => {
  return new Promise((resolve, reject) => {
    request(url, options, (err, res, body) => {
      if (err) {
        log(`fetch api: ${url} with ${JSON.stringify(options)} with error: ${err}`, 'error')
        log(`fetch api: ${url} with request headers: ${JSON.stringify(options.headers)}`, 'info')
        reject(err)
      } else {
        if (res.statusCode === 200) {
          resolve(body)
        } else {
          log(`fetch api: ${url} with ${JSON.stringify(options)} with body: ${body}, with response headers: ${JSON.stringify(res.headers)}, with statusCode: ${res.statusCode}`, 'error')
          log(`fetch api: ${url} with request headers: ${JSON.stringify(options.headers)}`, 'info')
          reject(body)
        }
      }
    })
  })
}

module.exports = function (options) {
  const logger = (context) => {
    if (context.log && context.log.debug) {
      return (message, level = 'debug') => {
        context.log[level](message, 'hj-auth')
        debug(message)
      }
    } else {
      return (message) => {
        debug(message)
      }
    }
  }

  return function* (next) {
    let result
    const token = this.headers['Token']
    const flyAuth = this.cookies.get(authKey())
    const log = logger(this)
    if (flyAuth || token) {
      let hasToken = false;
      if (options.hasToken) {
        hasToken = true;
      }
      result = yield getData(config.account + '/account/token/non-validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'user-agent': 'fen-i18n-service/jwtToken/1.1'
        },
        form: {token:flyAuth||token},
        timeout: 10000
      }, log)
    }
    if (result) {
      try {
        var auth = JSON.parse(result)
        if (auth) {
          if (auth.data) {
            this.state.user = auth.data
            if(auth.data.jwtToken){
              this.request.header = { ...this.request.header, 'Jwt-Token':auth.data.jwtToken }
            }
          } else {
            if (this.state) {
              this.state.user = { status: RET_STATUS.FAIL }
            }
          }
        } else {
          if (this.state) {
            this.state.user = { status: RET_STATUS.FAIL }
          }
        }
      } catch (e) {
        log(`fetch auth success JSON.parse error `)
      }
    } else {
      this.state.user = { status: RET_STATUS.NO_COOKIE }
    }
    yield next
  }
}