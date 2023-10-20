const Koa = require('koa')
const middleware = require('./middleware')
const koaRouter = require('./middleware/fly-router')
const koaRender = require('./middleware/fly-render')
const app = new Koa()
const path = require('path')
app.on('error', (err, ctx) => {
  console.log('error ',err)
  if (ctx) {
    ctx.status = 500
  }
  if (ctx && ctx.log && ctx.log.error) {
    ctx.status = 500
    if (!ctx.state.logged) {
      ctx.log.error(err.stack)
    }
  }
})
middleware(app)
try{
  app.use(koaRender({
    rootControllerPath: path.resolve(__dirname, '../controllers'),
    viewRootPath: path.resolve(__dirname, '../views')
  }))
}catch(e){
  console.log('error in app ',e)
}

app.use(koaRouter(require('../route')))
module.exports = app
