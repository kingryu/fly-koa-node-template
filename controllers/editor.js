const { domainPrefix, isLogin } = require('utils/common')
 
module.exports = {
  index: function*(scope) {
    let bundle = scope.bundle.files;
    scope.runtime = bundle['runtime-main.js']
    scope.mainCss = bundle['main.css']
    scope.mainJs = bundle['main.js']
    scope.chunk = scope.bundle.entrypoints[1]
    yield this.render('index')
  },
  detail: function*(scope){
    scope.title =   'detail'
    scope.id =   this.params.id
    scope.query =   this.query.url
    scope.body = this.request.body
    yield this.render('detail')
  }
}