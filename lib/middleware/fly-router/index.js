const koaRouter = require('koa-router')
const koaCompose = require('koa-compose')
const debug = require('debug')('fly-koa-router')
const routePaths = []

const addPath = (path) => {
  if (routePaths.indexOf(path) === -1) {
    routePaths.push(path)
  }
}

module.exports = (routerConfig) => {
  const router = koaRouter()
  if (routerConfig && routerConfig.length) {
    routerConfig.forEach((routerInfo) => {
      let { match, method = 'get', controller, middlewares } = routerInfo
      let args = [match]
      addPath(match)
      args.push((context, next) => {
        debug(`parse path: ${match} with URL: ${context.url}`)
        context.routerInfo = context.routerInfo || []
        context.routerInfo.push({
          type: 'koa',
          data: {
            controller: controller
          }
        })
        debug(`parsed result: ${JSON.stringify(context.routerInfo)}`)
        context.state.koaRouterMatch = Array.isArray(match) ? match[0] : match
        return next()
      })

      if ((middlewares && middlewares.length)) {
        args = args.concat(middlewares)
      }

      if (router[method] && router[method].apply) {
        router[method].apply(router, args)
      }
    })
  } else {
    throw new Error('the router config should be an Array.')
  }
  return koaCompose([router.routes(), router.allowedMethods()])
}

module.exports.routerPaths = routePaths
