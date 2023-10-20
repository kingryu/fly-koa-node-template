const {
  parserServerError,
  setToken,
} = require("utils/common");
var config = require("../../../config");

module.exports = {
  *gameAttr(scope) {
    let gameId = this.params.gameId;
    let cardId = this.query.cardId;
    const data = require("../jsonData/cardgame"+this.params.gameId+".js")
    let content ={code:0, data:data[cardId],message:'success'}
    this.renderJSON(content);
  },

  *card(scope) {
    let content;
    if (scope.userInfo.uid) {
      let gameId = this.query.gameId;
      const data = require("../jsonData/cardgame"+gameId+".js")
      try {
        let newUrl = this.req.url.replace("/api/platform", "");
        setToken(this);
        content = yield this.proxy({
          url: config.platform + newUrl,
        });
        if(content.code===0&&content.data){
          content.data.forEach((item)=>{
            item.gameInfo = data[item.id]
          })
        }
      } catch (e) {
        content = parserServerError(e);
      }
    } else {
      content = { code: 401, message: "not login", data: null };
    }
    this.renderJSON(content);
  }
};
