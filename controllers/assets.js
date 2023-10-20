module.exports = {
  index: function * (scope) {
    let arr = this.request.url.split('/static')
    const path = '/static' + arr[1]
    this.redirect(path)
  }
}