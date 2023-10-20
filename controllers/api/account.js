const {
  parserServerError,
  setToken,
  authKey,
  clearAuth,
} = require("utils/common");
const { jwtToken } = require("utils/jwtToken");
var config = require("../../config");

module.exports = {
  *index(scope) {
    let content;
    if (scope.userInfo.uid) {
      try {
        let newUrl = this.req.url.replace("/api", "");
        setToken(this);
        content = yield this.proxy({
          url: config.account + newUrl,
        });
      } catch (e) {
        content = parserServerError(e);
      }
    } else {
      content = { code: 401, message: "not login", data: null };
    }
    this.renderJSON(content);
  },

  *token(scope) {
    let content;
    if (scope.userInfo.uid) {
      let auth = this.cookies.get(authKey());
      if(auth){
        content = { code: 0, message: "success", data: {token: auth, userInfo: scope.userInfo} };  
      }
    } else {
      content = { code: 401, message: "not login", data: null };
    }
    this.renderJSON(content);
  },

  *logout(scope) {
    if (scope.userInfo.uid) {
      try {
        content = yield this.proxy({
          url: config.account + "/account/user/logout",
          method: "POST",
        });
      } catch (e) {
        content = parserServerError(e);
      }
    } else {
      content = { code: 401, message: "not login", data: null };
    }
    clearAuth(this);
    this.renderJSON(content);
  },
};
