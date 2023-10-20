//接口转发路由
const apiRoutes = [
  {
    match: '/api/read/',
    controller: 'api.index.read'
  },
  {
    match: '/api/wirte/',
    controller: 'api.index.wirte',
    method: 'all'
  },
  {
    match: '/api/get/',
    controller: 'api.index.getJSON'
  },
  {
    match: '/api/getAndroid/',
    controller: 'api.index.getXML'
  },
  {
    match: '/api/getxml/',
    controller: 'api.index.getXML'
  },
  {
    match: '/api/push',
    controller: 'api.git.push',
  },
  {
    match: '/api/pull',
    controller: 'api.git.pull',
  },
  {
    match: '/api/reset',
    controller: 'api.git.reset',
  },
  {
    match: '/api/projlist',
    controller: 'api.index.getProjectList',
  },
  //----------------------------
  {
    match: "/api/account/*",
    controller: "api.account.index",
    method: "all",
  },
  {
    match: "/api/platform/*",
    controller: "api.platform.index",
    method: "all",
  },
  {
    match: "/api/pay/*",
    controller: "api.pay.index",
    method: "all",
  },
  {
    match: "/api/service/cardattr/:gameId",
    controller: "api.services.index.gameAttr",
    method: "get",
  },
  {
    match: "/api/task/*", 
    controller: "api.task.index",
    method: "all",
  },
  {
    match: "/api/match/*", 
    controller: "api.match.index",
    method: "all",
  },
  {
    match: "/api/logout",
    controller: "api.account.logout",
    method: "all",
  },
  {
    match: "/api/token",
    controller: "api.account.token",
    method: "all",
  },
  {
    match: "/api/service/report",
    controller: "service.config.index",
    method: "all",
  },
  {
    match: "/api/service/get",
    controller: "service.config.get",
    method: "all",
  },
];

const pageRoutes = [
  {
    match: "*/static/*",
    controller: "assets.index",
  },
  {
    match: "/share*",
    controller: "share.index",
  },
  {
    match: '/',
    controller: 'editor.index'
  },
  {
    match: "/*",
    controller: "index.index",
  },
];

module.exports = [...apiRoutes, ...pageRoutes];
