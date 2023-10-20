const Koaxauth = require('./koa-auth')

module.exports = () => {
  function * handler (next) {
    if(this.state&&this.state.user){
      if(this.state.scope){
        this.state.scope.userInfo = this.state.user
      }else {
        this.state.scope = {userInfo:this.state.user}
      }
    }
    yield next
  }

  return function * (next) {
    let options = {
      nodeLog:false,
    }
    if (!['/favicon.ico','/404','/500'].includes(this.path)) {
      yield Koaxauth(options).call(this, handler.call(this, next))
    }else{
      yield next
    }
  }
}
