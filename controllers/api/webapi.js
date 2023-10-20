const { parserServerError } = require('utils/common')
var config = require('../../config')

module.exports = {
  *index(scope) {
    let content
    try {
      content = yield this.proxy({
        url: config.account + this.req.url
      })
    } catch (e) {
      content = parserServerError(e)
    }
    this.renderJSON(content)
  },

}
