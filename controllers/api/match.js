const {
  parserServerError,
  setToken,
} = require("utils/common");
var config = require("../../config");

module.exports = {
  *index(scope) {
    let content;
    if (scope.userInfo.uid) {
      try {
        let newUrl = this.req.url.replace("/api/match", "");
        setToken(this);
        content = yield this.proxy({
          url: config.match + newUrl,
        });
      } catch (e) {
        content = parserServerError(e);
      }
    } else {
      content = { code: 401, message: "not login", data: null };
    }
    this.renderJSON(content);
  }
};
