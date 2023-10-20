module.exports = () => {
  return async function (context, next) {
    await next()
    if (context.url.endsWith('.js')) {
      context.type = 'application/x-javascript; charset=utf-8';
    }
  }
}
