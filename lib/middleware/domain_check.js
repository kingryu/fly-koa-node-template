let reg = /\/domain_check(\/)?$/
module.exports = () => {
  return (context, next) => {
    if (reg.test(context.url)) {
      context.status = 200
      context.set('Content-Type', 'text/html')
      context.body = 'ok'
    } else {
      return next()
    }
  }
}
