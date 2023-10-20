const { parserServerError, setCommonCookie,authKey, getCurDomain,domainPrefix } = require("../utils/common");
var config = require('../config')

function versionCheck(scope, ctx) {
  let version = ctx.path.match(/(?<=^\/)v\d+/);
  let entrypoints, prefix
  if (version && version.length > 0) {
    entrypoints = scope.bundle[version[0]]
    prefix = '/static/' + version[0] + '/'
  } else {
    entrypoints = scope.bundle['v2'];
    prefix = '/static/v2/';
  }
  scope.mainCss = prefix + entrypoints[0]
  scope.mainJs = prefix + entrypoints[1]
  scope.env = domainPrefix() ? domainPrefix() + '/' : '';
  scope.content = {}
}

module.exports = {
  index: function* (scope) {
    versionCheck(scope, this)
    if(this.state?.user?.uid){
      yield this.render('index')
    }else {
      this.redirect(config.loginServer)
      return;

    }
  },
}