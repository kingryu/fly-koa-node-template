const { parserServerError, setCommonCookie,authKey, getCurDomain,domainPrefix } = require("../utils/common");
var config = require('../config')

function setAssets(scope, ctx) {
  let main = scope.bundle['share'];
  // let prefix = '/static/share/'
  let prefix = '/'
  scope.mainCss =prefix +  main.css[0];
  scope.mainJs = prefix + main.file;
  scope.env = domainPrefix() ? domainPrefix() + '/' : '';
  scope.content = {}
}

module.exports = {
  index: function* (scope) {
    setAssets(scope, this)
    yield this.render('index')
  },
}