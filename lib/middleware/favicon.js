const Path = require('path')
const fs = require('fs')



module.exports = () => {
  return function (context, next) {
    if (context.path === '/favicon.ico') {
      const cacheControl = `public, max-age=${86400000 / 1000 | 0}`
      if (context.method !== 'GET' && context.method !== 'HEAD') {
        context.status = context.method === 'OPTIONS' ? 200 : 405
        context.set('Allow', 'GET, HEAD, OPTIONS')
      } else {
        let faviconPath = Path.join(__dirname, '../../favicon.ico')
        let icon = fs.readFileSync(faviconPath)
        context.set('Cache-Control', cacheControl)
        context.type = 'image/x-icon'
        context.body = icon
      }
    } else {
      return next()
    }
  }
}
