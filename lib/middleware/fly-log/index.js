// @ts-nocheck


const logger = require("../fly-koa-log");
const convert = require("koa-convert");
const ignore = [/^\/do_not_delete\/health_check/]

const checkIgnore = (url, ignores) => {
    return !!ignores.find(ig => {
        return ig.test(url)
    })
}

const detectStatus = (error) => {
    let status = (error && error.status) || 500;
    if (status < 200) {
      status = 500;
    }
    return status;
};


module.exports = (options) => {
    const { warningConfigs = {}, projectName, fileName, appLogLevel, ignores = ignore } = options

    const loggerMiddleware = convert(logger({
        projectName: projectName,
        filename: fileName,
        appLogLevel: appLogLevel
    }))

    const responseHandler = (context) => {
        let responseTime = 0
        let apiTime = 0
        const performances = context.state.performances

        if (performances && performances.request) {
            responseTime = performances.request.time || 0;
        }

        if (performances && performances.api && performances.api.time) {
            apiTime = performances.api.time
        }

        context.log.access({
            responseTime: responseTime,
            apiTime
        });

        if (performances) {
            Object.keys(performances).forEach(function (key) {
                const val = performances[key]
                const warningConfig = warningConfigs[key];

                if (warningConfig) {
                    if (val.detail) {
                        Object.keys(val.detail).forEach(function (dk) {
                            if (val.detail[dk] > warningConfig) {
                                context.log.warn(`the ${key} - ${dk} takes ${val.detail[dk]} ms!`, key);
                            }
                        });
                    } else {
                        if (val.time > warningConfig) {
                            context.log.warn(`the ${key} takes ${val.time} ms!`, key);
                        }
                    }
                }
            });
        }
    };

    return (context, next) => {

        if (checkIgnore(context.url, ignores)) {
            return next()
        }

        return loggerMiddleware(context, next).then(() => {
            // write web access log;
            responseHandler(context);
        }).catch((ex) => {
            const status = detectStatus(ex);

            responseHandler(context);

            if (status >= 500) {
                context.log.error(ex && ex.stack || ex);
            } else {
                context.log.warn(ex && ex.stack || ex);
            }
            
            context.state.logged = true;
            context.throw(status, ex)
        });
    };
};