//@ts-check

const fs = require("fs");
const Path = require("path");
const cache = require("memory-cache");
const env = require('../fly-node-env')();
const DebugEnv = ['dev', 'qa'];

const outPutLog = (str) => {
    if(str){
        console.log('handle error in fly-http-error:', str);
    }
}

const detectStatus = (error) => {
    let status = (error && error.status) || 500;
    if (status < 200) {
      status = 500;
    }
    return status;
};

const getContent = (path, errorPagesFolder) => {
    if (cache.get(path)) {
        return Promise.resolve(cache.get(path));
    } else {
        return new Promise(function (resolve, reject) {
            fs.readFile(Path.join(errorPagesFolder, path), { encoding: 'utf-8' }, function (err, data) {
                if (err) {
                    reject(err);
                } else {
                    cache.put(path, data, 60000);
                    resolve(data);
                }
            });
        });
    }
};


module.exports = (options) => {
    options = options || {};
    let errorPagesFolder = options.path || Path.resolve(__dirname, "../../errorPages")
    let httpErrorRedirectConf = options.httpErrorRedirectConf

    let handler = (context, ex) => {
        outPutLog(ex)
        var status = parseInt(context.status);
        if (status >= 400) {
            var fileName = "";
            switch (status) {
                case 404:
                case 500:
                case 503:
                    fileName = status + ".htm";
                    break;
                default:
                    fileName = "other.htm";
                    break;
            }
            return getContent(fileName, errorPagesFolder).then((html) => {
                context.body = html;
                context.status = status;
            });
        }
    }

    if (httpErrorRedirectConf) {
        handler = (context, ex) => {
            outPutLog(ex)
            let status = parseInt(context.status)
            if (status >= 400) {
                if (httpErrorRedirectConf[status]) {
                    context.redirect(httpErrorRedirectConf[status])
                } else if (httpErrorRedirectConf.default) {
                    context.redirect(httpErrorRedirectConf.default)
                }
            }
            return Promise.resolve()
        }
    }

    if (options.renderInfo) {
        const { errorPageFolder, errorPageMapping, scope } = options.renderInfo
        const renderJSON = (context, ex) => {
            if (!DebugEnv.includes(env)) return Promise.resolve()
            context.body = {
                status: context.status,
                message: ex ? (ex.stack || ex) : ''
            }
            return Promise.resolve()
        }

        if (errorPageFolder && errorPageMapping) {
            handler = (context, ex) => {
                outPutLog(ex)
                const status = parseInt(context.status)
                if (status >= 400) {
                    if (context.render) {
                        context.state.controller = options.renderInfo.errorPageFolder
                        let viewPath = errorPageMapping[status]
                        if (!viewPath) {
                            viewPath = errorPageMapping.default
                        }
                        if (viewPath) {
                            let _scope = Object.assign({
                                status: status,
                                message: ex ? (ex.stack || ex) : ''
                            }, scope)
                            if (typeof viewPath === 'object') {
                                _scope = Object.assign(_scope, viewPath.scope)
                                viewPath = viewPath.viewName
                            }
                            context.state.scope = Object.assign({}, context.state.scope, _scope)
                            return context.render(viewPath).then(() => {
                                context.state.scope = null
                            })
                        } else {
                            return renderJSON(context, ex)
                        }
                    } else {
                      return renderJSON(context, ex)
                    }
                }
            }
        }
    }

    return (context, next) => {
        return next().then(() => {
            return handler(context);
        }).catch((ex) => {
            context.status = detectStatus(ex);
            return handler(context, ex);
        });
    };
};