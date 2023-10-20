//@ts-check
'use strict';

const Request = require('request');
const typeis = require('type-is').is;
const { JSON_TYPES, PIPE_TIP } = require('./util');

module.exports = function request(ctx, param, options, callback = () => {}) {
  let reqType = options.headers['content-type'];
  let isPipeReq = param.needPipeReq && ctx.req && ctx.req.readable && ctx.method !== 'GET';
  let form, body, json;

  if (typeis(reqType, JSON_TYPES) || !reqType) {
    json = true;
    body = param.data;
  } else {
    json = !param.needPipeRes;
    if (!isPipeReq) form = param.data;
  }

  param.json && (json = param.json);

  if (options.method.toUpperCase() === 'GET') {
    body = undefined;
    form = undefined;
  }

  // 获取request参数
  let opt = Object.assign(
    {
      uri: undefined, // 请求路径
      method: undefined, // method
      headers: undefined, // 头信息
      json: json, // 如果要覆盖写在conf中
      body: body, // post的body参数，默认为undefined
      form: form, // post的form参数，默认为undefined
      gzip: true, // gzip传true才能压缩，具体解法根据response
      forever: true
    },
    options
  );

  function _createReq(resolve, reject) {
    param.before(ctx, opt);

    function handleRes(httpResponse, data) {
      let status = (httpResponse && httpResponse.statusCode) || 'NULL';
      httpResponse.status = status;
      param.after(ctx, opt, httpResponse, data);
      // 是不是2XX开头的结果
      if (!/^2/.test('' + status)) {
        reject(callback(httpResponse, opt.uri, data, param.needPipeRes));
        return;
      }
      resolve(callback(httpResponse, opt.uri, data, param.needPipeRes));
      return;
    }

    if (param.needPipeRes) {
      return Request(opt)
        .on('error', err => {
          param.after(ctx, opt, err, PIPE_TIP);
          reject({ res: err, uri: opt.uri });
        })
        .on('response', response => {
          for (let header of param.suppressResHeaders) {
            if (Object.keys(response.headers).includes(header)) {
              delete response.headers[header];
            }
          }
          // http://stackoverflow.com/questions/35525715/http-get-parse-error-code-hpe-unexpected-content-length
          delete response.headers['transfer-encoding'];
          Object.assign(response.headers, param.resHeaders);
          handleRes(response, PIPE_TIP);
        });
    }

    return Request(opt, (err, httpResponse, data) => {
      // 请求出错
      if (err) {
        param.after(ctx, opt, err, data);
        reject({ res: err, uri: opt.uri });
        return;
      }

      // 没有报错，且有正常的返回数据
      if (!err && data) {
        handleRes(httpResponse, data);
      }
    });
  }

  return new Promise((resolve, reject) => {
    // 发送请求
    let ProxyServer = _createReq(resolve, reject);

    // 如果ctx.req.readable是可读的而且当前请求不为GET
    // 则可以pipe

    if (isPipeReq) {
      ctx.req.pipe(ProxyServer);
    }

    if (param.needPipeRes) {
      ProxyServer.pipe(ctx.res);
    }
  });
};
