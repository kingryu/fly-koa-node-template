const uuid = require('uuid/v4')
module.exports = () => {
  return function (context, next) {
    var id = uuid().replace(/-/g, "");
    context.state.scope = {
      __requestId: id
    };
    return next();
  };
};