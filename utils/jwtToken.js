const request = require('request')
const config = require('../config')

const getData = (url, options, catchError = false) => {
  return new Promise((resolve, reject) => {
    request(url, options, (err, res, body) => {
      if (err) {
        if (catchError) {
          resolve()
        } else {
          reject(err)
        }
      } else {
        if (res.statusCode === 200) {
          resolve(body)
        } else {
          if (catchError) {
            resolve()
          } else {
            reject(body)
          }
        }
      }
    })
  })
}

async function jwtToken (ctx) {
    const token = ctx.headers['Token']
    const flyAuth = ctx.cookies.get('flyAuth')
    let jwtToken;
    let result
    let hasSet = false;

    const checkRes = ()=>{
      if (result) {
        var auth = JSON.parse(result)
        if (auth && auth.data && auth.code == 0) {
          let { jwtToken } = auth.data
          if (jwtToken) {
            let headers = {}
            headers['Jwt-Token'] = jwtToken
            ctx.request.header = { ...ctx.request.header, ...headers }
          } else {
            hasSet = true
            jwtToken = 'fetch jwt with error';
            if (auth ){
              if(auth.code){
                jwtToken += ',code:' + auth.code 
              } 
              if(auth.message) {
                jwtToken += ',message:' + auth.message
              }
            }
            let headers = {}
            headers['jwt_fail'] = jwtToken
            ctx.request.header = { ...ctx.request.header, ...headers }
          }
        } else {
          if (!hasSet) {
            jwtToken = 'fail,get jwt empty'
            let headers = {}
            if (auth && auth.code) {
              jwtToken += ', code:' + auth.code
            }
            headers['jwt_fail'] = jwtToken
            ctx.request.header = { ...ctx.request.header, ...headers }
          }
        }
      } else {
        if (!hasSet) {
          jwtToken = 'fail,not get jwt'
          let headers = {}
          headers['jwt_fail'] = jwtToken
          ctx.request.header = { ...ctx.request.header, ...headers }
        }
      }
      if (!ctx.state) {
        ctx.state = {}
      }
      ctx.state.jwtToken = jwtToken
    }

    const checkFail = ()=>{
      hasSet = true
      jwtToken = 'fail,fetch JWT error '
      let err = e.toString();
      if (err.startsWith('<!DOCTYPE html>')) {
        jwtToken += 'body is html'
        try {
          jwtToken += ',title:' + err.slice(err.indexOf("<title>") + 7, err.indexOf("</title>"))
        } catch (e) { }
      } else {
        if (err.startsWith('{')) {
          try {
            if (e.code) {
              jwtToken += ',code:' + e.code
            }
            if (e.message) {
              jwtToken += ',message:' + e.message
            }
          } catch (error) { }
        } else {
          if (err && err.length > 200) {
            err = err.slice(0, 200)
          }
          jwtToken += ' ' + err;
        }
      }
      let headers = {}
      headers['jwt_fail'] = jwtToken
      ctx.request.header = { ...ctx.request.header, ...headers }
    }
    if (flyAuth || token) {
      try {
        result = await getData( config.account + '/account/token/non-validate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'user-agent': 'fen-fly-node/jwtToken/1.1'
          },
          form: {token:flyAuth||token},
          timeout: 3000
        })
        checkRes()
      } catch (e) {
        checkFail(e)
      }
    } else {
      hasSet = true
      jwtToken = 'empty token or flyAuth'
      let headers = {}
      headers['jwt_fail'] = jwtToken
      ctx.request.header = { ...ctx.request.header, ...headers }
    }
}

module.exports ={
  jwtToken,  
}
