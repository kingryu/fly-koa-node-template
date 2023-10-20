//@ts-check
const path = require('path');
module.exports = (ctx, options, innerFunc) => (url, params = {}, host = options.apiServer) => {
  if (typeof params === 'string') {
    host = params;
    params = {};
  }
  if (typeof url !== 'string') {
    params = url;
    url = undefined;
  }
  console.log(url, params, host)
  let requestOpt = Object.assign(
    {},
    options.reqConfig,
    {
      url: url,
      body: undefined,
      form: undefined,
      method: 'GET',
      headers: {},
      json: undefined
    }, // 因为proxy会基本上默认设置，fetch方法不应该添加这种人为处理，所以置为undefined
    params
  );

  // 支持全局host设置,方便使用
  let needPipeRes = requestOpt.needPipeRes || false;
  let resolvedOptions = Object.assign({}, options, requestOpt.options);
  let optional = requestOpt.optional || resolvedOptions.optional || false;
  let resHeaders = requestOpt.resHeaders || resolvedOptions.resHeaders || {};
  let suppressResHeaders = requestOpt.suppressResHeaders || resolvedOptions.suppressResHeaders || [];

  if (!requestOpt.baseUrl) {
    let realReq = innerFunc.setRequest(ctx, params, host, resolvedOptions);
    requestOpt.uri = `${realReq.protocol}://${path.join(realReq.host, realReq.url)}`;
  }

  // delete requestOpt.optional;
  // delete requestOpt.needPipeRes;
  // delete requestOpt.options;
  // delete requestOpt.resHeaders;
  // delete requestOpt.suppressResHeaders;

  let req = () => {
    return innerFunc.request(
      ctx,
      {
        needPipeReq: false,
        needPipeRes: needPipeRes,
        before: resolvedOptions.before || innerFunc.before,
        after: resolvedOptions.after || innerFunc.after,
        resHeaders: resHeaders,
        suppressResHeaders: suppressResHeaders
      },
      requestOpt,
      innerFunc.requestCb
    );
  };

  return innerFunc.sendReq(req, resolvedOptions, requestOpt, optional);
};
