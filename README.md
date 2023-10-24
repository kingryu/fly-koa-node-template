## About 
基于koa搭建的node.js渲染框架  
支持 react.js vue.js等项目的部署，静态资源输出  
支持接口转发，请求合并等  
支持登录态判断，用户信息认证  
支持日志输出  

## 目录结构


|    目录 | 说明  
:--------------------------- | :------------------------------------------- 
assets | 前端资源目录
config | 配置目录，包含了不同环境下变量的配置                               
controllers | controller目录
lib | lib目录，包涵node后端核心部分
log | 日志保存目录，在线上服务器需要将日志保存到制定目录          
views | 同MVC中的view
app.js | 应用主入口文件                                
config.js | 应用配置文件                                  
route.js | 路由文件


## lib/Middleware 中间件主要功能
|    目录 | 说明  
:--------------------------- | :------------------------------------------- 
fly-auth | 用户认证相关   
fly-log | 日志记录相关  
fly-render |  模版渲染相关 页面展示数据，目前采用[Nunjucks](http://mozilla.github.io/nunjucks/)模版引擎，可以替换  
fly-router | 路由相关 主要绑定controller views目录对应关系  
fly-proxy | 代理转发相关  
fly-node-env | node环境定义相关 按大多数公司情况分开发、测试、验证、线上


## 示例
 项目示例使用的是多语言编辑平台

### 多语言翻译编辑平台
公司在线课堂项目需要支持国际化，多个项目android ios web pc/mac客户端  都需要维护国际化文本
翻译同学提供的word 或者excel不方便开发同学使用。为提升开发效率，特开发一个国际化编辑平台。

### 项目架构
项目后端采用基于koa开发的node服务，代码直接保存到公司git仓库，前端react生成国际化编辑界面
node(koa2) + react

### 项目使用
运行node服务后，访问首页，进行国际化文本编辑
