// @ts-check

const path = require('path')
const controllerCache = new Map()
const co = require('co')
const minifier = require('html-minifier').minify
const statuses = require('statuses')

const nunjucks = require('nunjucks')

const getController = (rootControllerPath, controllerPath) => {
  if (controllerCache.has(controllerPath)) {
    return Promise.resolve(controllerCache.get(controllerPath))
  } else {
    return findController(rootControllerPath, controllerPath)
  }
}

const findController = (rootControllerPath, controllerPath) => {
  return new Promise((resolve, reject) => {
    let array = controllerPath.split('.')
    let cPath
    if (array.length < 2) {
      reject(new Error(`The controller with path ${rootControllerPath} should like 'xxx.xxx'`))
    } else {
      let controllerName = array.slice(0, array.length - 1).join('/')
      cPath = path.join(rootControllerPath, controllerName)
      let controller = require(cPath)
      let action = controller[array[array.length - 1]]
      if (action) {
        let data = {
          action,
          controller: controllerName
        }
        controllerCache.set(controllerPath, data)
        resolve(data)
      } else {
        reject(new Error(`The action with path ${controllerPath} not found`))
      }
    }
  })
}



module.exports = (options = {}) => {
  options.renderConfig = Object.assign({
    ext: '.html',
    renderFn: null
  }, options.renderConfig)

  options.minifyHTMLConfig = Object.assign({ enable: false }, options.minifyHTMLConfig)

  options.minifyHTMLConfig.options = Object.assign({
    removeComments: true,
    removeEmptyAttributes: true,
    removeEmptyElements: true,
    removeTagWhitespace: true,
    removeAttributeQuotes: true,
    collapseWhitespace: true
  }, options.minifyHTMLConfig.options)

  const { rootControllerPath, viewRootPath, minifyHTMLConfig, renderConfig } = options
  const { ext, renderFn } = renderConfig

  if (!rootControllerPath || !viewRootPath) {
    throw new Error("The options argument should like options:{rootControllerPath:'',viewRootPath:''}")
  }

  const defaultViews = (viewRootPath, renderConfig) => {
    const env = new nunjucks.Environment(new nunjucks.FileSystemLoader(viewRootPath, renderConfig))
    return (viewname, data) => {
      return new Promise((resolve, reject) => {
        env.render(viewname + ext, data, (err, res) => {
          if (err) {
            reject(err)
          } else {
            resolve(res)
          }
        })
      })
    }
  }

  let render
  if (renderFn) {
    render = renderFn(viewRootPath, renderConfig)
  } else {
    render = defaultViews(viewRootPath, renderConfig)
  }

  const renderString = (viewPath, context, data) => {
    return render(path.join(context.state.controller, viewPath), data).then(html => {
      if (minifyHTMLConfig.enable) {
        html = minifier(html, minifyHTMLConfig.options)
      }
      return html
    },(err) =>{
      console.error('fly-koa-render renderString error',err);
    })
  }

  const view = function (viewPath) {
    this.state.scope.__renderTime = new Date()
    return renderString(viewPath, this, this.state.scope).then(html => {
      this.body = html
      this.state.scope = null
    },(err) =>{
      console.error('fly-koa-render renderString error',err);
    })
  }

  return (context, next) => {
    Object.defineProperties(context, {


      render: {
        get () {
          return view.bind(context)
        }
      },

      renderString: {
        get () {
          return (viewPath, data) => {
            return renderString(viewPath, context, data)
          }
        }
      }
    })

    return next().then(() => {
      if (context.body) {
        return
      }

      // if has been redirect, do't need render.
      if(statuses.redirect[context.status]){
        return
      }

      if (context.routerInfo && context.routerInfo.length) {
        let koaRouter = context.routerInfo.filter((item) => {
          return item.type === 'koa'
        })[0]
        if (koaRouter) {
          let controllerPath = koaRouter.data.controller
          return getController(rootControllerPath, controllerPath).then((actionData) => {
            let { action, controller } = actionData
            context.state.controller = controller
            let fn = co.wrap(action).bind(context)
            return fn(context.state.scope)
          },(err) =>{
            console.error('fly-koa-render getController error',err);
          })
        }
      }
    })
  }
}
