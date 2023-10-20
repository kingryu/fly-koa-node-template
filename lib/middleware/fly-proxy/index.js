/**
 * proxy middleware
 */
//@ts-check
'use strict';

const request = require('./request');
const proxy = require('./proxy');
const fetch = require('./fetch');
const agent = require('./agent');
const { before, after, handleErr, REQUEST_ID_KEY } = require('./util');

module.exports = function(options = {}) {
  return function(ctx, next) {
    if (ctx.proxy) return next();

    function sendReq(req, resolvedOptions, requestOpt, optional) {
      let errHandler = getErrHandler(resolvedOptions);
      let okHandler = getOkHandler(resolvedOptions);
      requestOpt.uri = requestOpt.uri || requestOpt.url;
      let traceId;
      let requestId;
      if (ctx.state && (requestId = ctx.state.requestId)) {
        const RequestIdKey = resolvedOptions.requestIdKey || REQUEST_ID_KEY;
        Object.assign(requestOpt.headers, { [RequestIdKey]: requestId });
      }
      const { endPipeRes = true } = resolvedOptions;
      return new Promise((resolve, reject) => {
        req()
          .then(({ res = {}, uri, data, needPipeRes }) => {
            okHandler(ctx, uri, data, resolve, reject);
            if (needPipeRes && endPipeRes) {
              return;
            }
            resolve(data);
          })
          .catch(({ res = {}, uri, data, needPipeRes }) => {
            errHandler(ctx, res, { data, uri, requestOpt, optional });
            if (needPipeRes && endPipeRes) {
              return;
            }
            if (optional || needPipeRes) {
              resolve(data || res);
            }
            reject(res);
          });
      });
    }

    function requestCb(res, uri, data, needPipeRes) {
      if (!needPipeRes) {
        // 设置cookie
        res && setResCookies(ctx, res.headers);
      }
      return { res, uri, data, needPipeRes };
    }

    const args = [ctx, options, { setRequest, request, sendReq, requestCb, before, after }];
    Object.defineProperties(ctx, {
      proxy: {
        get() {
          return proxy(...args);
        },
        configurable: true
      },
      fetch: {
        get() {
          return fetch(...args);
        },
        configurable: true
      },
      agent: {
        get() {
          return agent(...args);
        },
        configurable: true
      }
    });

    return next();
  };

  function getErrHandler(resolvedOptions) {
    return resolvedOptions.handleErr || handleErr;
  }

  function getOkHandler(resolvedOptions) {
    return resolvedOptions.handleStatusOk || (() => {});
  }

  function setRequest(ctx, params, host, resolvedOptions = options) {
    let method = params.method || ctx.method;
    let isPathname = /^\/[^\/]|^\/$/;
    let hasProtocol = /^(\w+)?:?\/\/(.*)/;
    let protocol;
    let result;

    let url = params.uri || params.url || ctx.url;

    if (isPathname.test(url)) {
      let hostMatcher;
      if ((hostMatcher = host.match(hasProtocol))) {
        [protocol, host] = [hostMatcher[1] || ctx.protocol, hostMatcher[2]];
      }
    } else {
      url = url.replace(/^\/\//, ''); // 兼容老版本
      let tempSplit = url.split('://');
      [url, protocol] = tempSplit.length === 2 ? [tempSplit[1], tempSplit[0]] : [tempSplit[0], ctx.protocol];
      host = '';
    }

    if (params.overHeaders) {
      result = Object.assign({}, params.overHeaders);
    } else {
      result = Object.assign({}, ctx.headers, resolvedOptions.headers, params.headers);

      result['user-host'] = result.host;

      result['content-type'] = params.contentType || result['content-type'];
      delete result['content-length'];
      delete result['host'];

      delete result['if-modified-since'];
    }

    let suppressHeaders = [...new Set([...(resolvedOptions.suppressHeaders || []), ...(params.suppressHeaders || [])])];

    if (suppressHeaders.length) {
      for (let header of suppressHeaders) {
        if (Object.keys(result).includes(header)) {
          delete result[header];
        }
      }
    }


    return {
      protocol: params.protocol || options.protocol || protocol || 'http',
      host: host,
      method: method,
      url: url,
      headers: result
    };
  }

  function setResCookies(ctx, headers) {
    if (!headers || !validateCookies(headers['set-cookie'])) {
      return;
    }

    let cookies = headers['set-cookie'];
    ctx.res._headers = ctx.res._headers || {};

    ctx.res.setHeader('set-cookie', (ctx.res._headers['set-cookie'] || []).concat(cookies));
  }

  function validateCookies(cookies) {
    if (!cookies || !cookies.length || 0 >= cookies.length) {
      return false;
    }

    if (!cookies[0]) {
      return false;
    }

    return true;
  }
};
