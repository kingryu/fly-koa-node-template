//@ts-check
const proxy = require('./proxy');

module.exports = (ctx, options, innerFunc) =>

  (params = {}, host = options.apiServer) =>
    proxy(ctx, options, innerFunc)(Object.assign({}, params, { needPipeRes: true }), host);
