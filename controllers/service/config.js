const { get, write } = require("../../lib/middleware/fly-config/index");

module.exports = {
  *index(scope) {
    let content;
    if (scope.userInfo.uid) {
      if ((this.request.body.title = "setconfig")) {
        try {
          let json = JSON.parse(this.request.body.problem);
          write(json);
        } catch (e) {
          console.log(e);
        }
        content = { code: 0, message: "success", data: null };
      }
    } else {
      content = { code: 401, message: "not login", data: null };
    }
    this.renderJSON(content);
  },
  *get(scope) {
    let cfg = get("env");
    this.response.status = 200;
    this.renderJSON({ code: 0, message: "success", data: cfg });
  },
};
