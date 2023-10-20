const { parserServerError, setToken } = require("utils/common");
var config = require("../../config");

module.exports = {
  *index(scope) {
    let content;
    if (scope.userInfo.uid) {
      try {
        let newUrl = this.req.url.replace("/api/game", "");
        if (this.request.method == "POST") {
          if(!this.request.body.uid){
            this.request.body.uid = scope.userInfo.uid;
          }
        } else if (this.request.method == "GET") {
          if (!this.querystring.uid) {
            if (newUrl.indexOf("?") > -1) {
              newUrl += "&uid=" + scope.userInfo.uid;
            } else {
              newUrl += "?uid=" + scope.userInfo.uid;
            }
          }
        }
        setToken(this);
        content = yield this.proxy({
          url: config.game + newUrl,
        });
      } catch (e) {
        content = parserServerError(e);
      }
    } else {
      content = { code: 401, message: "not login", data: null };
    }
    this.renderJSON(content);
  },
};
