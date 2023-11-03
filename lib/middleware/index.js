const Path = require("path");
var init = require("./init");
var renderJSON = require("./renderJSON");
var log = require("./fly-log");
var bodyParser = require("koa-bodyparser");
var convert = require("koa-convert");
var pkg = require("../../package.json");
var config = require("../../config");
var favicon = require("./favicon");
var httpError = require("./fly-http-error");
var flyAuth = require("./fly-auth");
var proxy = require("./fly-proxy");
var domainCheck = require("./domain_check");
var cors = require("@koa/cors");
const koastatic = require("koa-static");
const mount = require("koa-mount");
const chunkmap = require("./assetsVersion");
const { initConfig } = require("./fly-config/index")

logCategory = [
  {
    reg: "/api",
    regOption: "i",
    category: "api",
  },
  {
    reg: "/",
    regOption: "",
    category: "web",
  },
];

function getCategory(url) {
  let result;
  logCategory.forEach((item) => {
    let ruleReg = new RegExp(item.reg, item.regOption);
    if (ruleReg.test(url)) {
      result = item.category;
    }
  });
  return result || "gamfipro";
}

module.exports = (app) => {
  app.use(domainCheck());
  app.use(
    mount(
      "/static",
      koastatic(Path.resolve(__dirname, "../../assets/static"), {
        maxage: 15552000000, //six months
        gzip: true,
      })
    )
  );

  // app.use(
  //   mount(
  //     "/share",
  //     koastatic(Path.resolve(__dirname, "../../assets/static/share"), {
  //       maxage: 7200000, //2 hour
  //       gzip: true,
  //     })
  //   )
  // );

  app.use(init());

  app.use(renderJSON());
  app.use(
    cors({
      origin: function (ctx) {
        let host = ctx.request.header.referer;
        if (host) {
          const url = new URL(host);
          return url.origin;
        } else {
          return "http://qatest.flynode.com:3000";
        }
      },
      maxAge: 0,
      credentials: true,
      allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    })
  );
  app.use(
    httpError({httpErrorRedirectConf:{404:'/404',500:'/500',503:'/500'}})
  );

  app.use(
    log({
      warningConfigs: config.warning,
      serverName: config.host,
      projectName: pkg.name,
      fileName: config.logFilePath,
      appLogLevel: "debug",
    })
  );
  app.use(
    proxy({
      apiServer: config.courseUserSoa,
      before: function (ctx, opt) {
        let logdata = {
          url: opt.uri || ctx.url,
          request: {
            header: ctx.headers,
          },
        };
        console.log(logdata.url);
      },
      after: function (ctx, opt, res, data) {
        let resbody = res.body||res.code ||'{}';
        try {
          resbody = JSON.stringify(res.body);
          if (resbody.length > 1200) {
            resbody = resbody.slice(0, 1200) + ".... data is big delete in log";
          }
        } catch (e) {
          console.log(e);
        }
        let logdata = {
          url: opt.uri || ctx.url,
          response: {
            header: res.headers,
            body: resbody,
          },
        };
        console.log(logdata.url);
      },
      handleErr: function (ctx, err, { data, uri, requestOpt, optional }) {
        let errmsg = `proxy response status: ${
          err.status ? err.status : "unknown"
        } url:${uri ? uri : "unknown"}`;
        console.log(err, data, JSON.stringify(requestOpt), optional);
      },
    })
  );
  app.use(convert(bodyParser()));
  app.use(flyAuth());
  app.use(favicon());
  app.use(chunkmap({}));
  initConfig();
};
