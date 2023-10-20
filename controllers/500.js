const {isMobile} = require("../utils/common");
module.exports = {
  index: function * (scope) {
    if(!scope){
      this.state.scope = scope = {}
    }
    scope.title = 'page not found'
    scope.platform = isMobile(this) ? 'm' : 'pc'
    yield this.render('index')
  }
}
