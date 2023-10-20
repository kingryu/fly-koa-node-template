//@ts-check
const path = require('path');
module.exports = (ctx, options, innerFunc) =>
  
  (params = {}, host = options.apiServer) => {
    if (typeof params == 'string') [params, host] = [host, params];
    let resolvedOptions = Object.assign({}, options, params.options);
    let optional = params.optional || resolvedOptions.optional || false;

    let realReq = innerFunc.setRequest(ctx, params, host, resolvedOptions);

    let requestOpt = Object.assign(
      {},
      options.reqConfig,
      {
        uri: `${realReq.protocol}://${path.join(realReq.host, realReq.url)}`,
        method: realReq.method,
        headers: realReq.headers,
        qs: params.qs
      },
      params.conf
    );

    let req = () => {
      return innerFunc.request(
        ctx,
        {
          json: params.json,
          data: params.body || params.form || ctx.request.body,
          needPipeReq: params.needPipeReq ? params.needPipeReq : true,
          needPipeRes: params.needPipeRes || false,
          before: resolvedOptions.before || innerFunc.before,
          after: resolvedOptions.after || innerFunc.after,
          resHeaders: params.resHeaders || resolvedOptions.resHeaders || {},
          suppressResHeaders: params.suppressResHeaders || resolvedOptions.suppressResHeaders || []
        },
        requestOpt,
        innerFunc.requestCb
      );
    };

    return innerFunc.sendReq(req, resolvedOptions, requestOpt, optional);
  };
