//@ts-check

exports.JSON_TYPES = [
  'application/json',
  'application/json-patch+json',
  'application/vnd.api+json',
  'application/csp-report'
];

exports.PIPE_TIP = 'pipe res';

exports.REQUEST_ID_KEY = 'requestid';

const regUnsafeCookies = /^\s*(clubauth|fly_token)/i;
const unsafeHeaders = ['access_token'];

function maskString(str) {
  const length = str.length;
  const maskLen = Math.floor(length / 2);
  let mask = '*';
  mask = mask.repeat(maskLen);
  return mask + str.substring(maskLen);
}

function removeUnSafeData(optOrHeaders) {
  let headers;
  if (optOrHeaders.headers) {
    headers = Object.assign({}, optOrHeaders.headers);
  } else {
    headers = Object.assign({}, optOrHeaders);
  }
  for (let c of unsafeHeaders) {
    if (headers[c]) {
      headers[c] = maskString(headers[c]);
    }
  }
  if (headers.cookie) {
    const arr = headers.cookie.split(';');
    headers.cookie = arr
      .map(s => {
        const cookieArray = s.split('=');
        if (regUnsafeCookies.test(cookieArray[0])) {
          cookieArray[1] = maskString(cookieArray[1]);
          return cookieArray.join('=');
        }
        return s;
      })
      .join(';');
  }
  if (optOrHeaders.headers) {
    return Object.assign({}, optOrHeaders, { headers });
  } else {
    return headers;
  }
}

function stringify(data = '') {
  if (typeof data === 'string') {
    return data;
  }
  return JSON.stringify(data);
}

exports.before = (ctx, opt) => {
  ctx.tracker && ctx.tracker.api.begin(opt.uri);
  ctx.log && ctx.log.debug && ctx.log.debug(`proxy request info: ${JSON.stringify(removeUnSafeData(opt))}`, 'api');
};

exports.after = (ctx, opt, res, data) => {
  ctx.tracker && ctx.tracker.api.end(opt.uri);
  ctx.log &&
    ctx.log.debug &&
    ctx.log.debug(
      `proxy response url: ${opt.uri}, header: ${JSON.stringify(res.headers)}, text: ${stringify(data)}`,
      'api'
    );
};

exports.handleErr = (ctx, err, { data, uri, requestOpt }) => {
  let errmsg = `proxy response status: ${err.status ? err.status : 'unknown'} url:${uri ? uri : 'unknown'}`;
  ctx.log &&
    ctx.log.error &&
    ctx.log.error(
      err.stack || (data ? `${errmsg} data:${typeof data === 'string' ? data : stringify(data)}` : errmsg),
      'api'
    );
  ctx.log && ctx.log.info && ctx.log.info(JSON.stringify(removeUnSafeData(requestOpt)), 'api');
};
