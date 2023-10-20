module.exports = () => {
  function render (json) {
    this.set('Content-Type', 'application/json')
    this.body = json
  }
  return (context, next) => {
    context.renderJSON = render.bind(context)
    return next()
  }
}
