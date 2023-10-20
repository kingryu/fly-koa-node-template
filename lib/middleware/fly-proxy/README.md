# aconite-proxy

### 全局配置

```javascript
app.use(proxy({
	apiServer: config.apiServer
}))

```

全局配置一个后端host，host例如：http://my.hujiang.com/profile (后端接口推荐使用http)，在上下文上会配置一个proxy方法，用来代理。

| Param          | Type     | Description                              | Default |
| :------------- | :------- | :--------------------------------------- | ------- |
| apiServer      | String   | 代理到的后端host                               |         |
| before         | Function | 请求调用的方法（同步）                              | 见下      |
| after          | Function | 请求后调用的方法（同步）                             | 见下      |
| handleErr      | Function | 处理异常的方法（同步）                              | 见下      |
| handleStatusOk | Function | 处理200请求请求自定义需求（同步）                       |         |
| reqConfig      | Function | reqConfig为request的配置参数，详细参见https://github.com/request/request |         |
| headers        | Object   | 请求头（会合并到上下文请求头）                 |       |
| optional       | Boolean  | 请求默认reject,如果不想返回500,则使用optional,全局optional不能改变fetch            |       |
| endPipeRes     | Boolean  | 默认设置为true，当使用needPipeRes后不resolve，防止后面因为设置头而报错  |     |

**befere**: 传入一个方法，默认方法为：

```javascript
  function before(ctx, opt) {
    ctx.tracker && ctx.tracker.api.begin(opt.uri);
    ctx.log && ctx.log.debug && ctx.log.debug(`proxy request info: ${JSON.stringify(opt)}`, 'api');
  }
```

接收两个参数ctx为上下文，opt为调用返回的内容，before会在请求发出前调用，默认用来追踪请求时间和接口信息用来debug

**after**: 传入一个方法， 默认方法为(res为httpstatus或者err，可以根据里面的status判断，data为返回的数据)：

```javascript
  function after(ctx, opt, res, data) {
    ctx.tracker && ctx.tracker.api.end(opt.uri);
    ctx.log &&
      ctx.log.debug &&
      ctx.log.debug(
        `proxy response url: ${opt.uri}, header: ${JSON.stringify(res.headers)}, text: ${JSON.stringify(
          data
        )}`, 'api'
      );
  }
```

after会在请求结束调用，用来记录时间和错误和response信息用来debug

**handleErr**: 用来处理请求结束的错误和记录，默认方法为：

```javascript
function handleErr(ctx, err, { data, uri, requestOpt, optional }) {
    let errmsg = `proxy response status: ${
      err.status ? err.status : 'unknown'
    } url:${uri ? uri : 'unknown'}`;
    ctx.log &&
      ctx.log.error &&
      ctx.log.error(
        err.stack || (data ? `${errmsg} data:${data}` : errmsg),
        'api'
      );

    ctx.log && ctx.log.info && ctx.log.info(JSON.stringify(requestOpt), 'api');
  }
```

**handleStatusOk**: 用来处理正常请求的处理，默认方法为空，提供三个参数: ctx(即上下文)，uri，data，resolve(可以直接rosolve请求promise), reject（可以reject请求promise）, 可以处理200请求，下面是一个参考例子(具体请根据业务处理)：

```javascript
function handleStatusOk(ctx, uri, data, resolve, reject) {
  if (data.status !== 0) {
    ctx.log.error(data.data, 'api');
    reject(data);
  }
}
```

**reqConfig**： reqConfig为request的配置参数，详细参见https://github.com/request/request

example：一般来说，你的node层到后端的问题你是不能直接看到包的，可以在全局配置一个代理到你的抓包工具上，比如：

```javascript
app.use(proxy({
    apiServer: config.apiServer,
 	reqConfig: {
    	proxy: 'http://192.168.156.29:8888'
    }
}))
```

然后你就可以愉快的抓包了。

*charles代理的话可能会篡改header头，会与实际情况有一些区别，需要注意*

### 接口配置

首先推荐跟后端商定一个api开头的路径，这个路径下全部转发给后端，方便配置。在具体的controller里只需要

```javascript
  	let content = yield this.proxy();
    this.renderJSON(content);`
```

***需要注意的是*** proxy的会reject错误,所有错误都会500,如果不想返回500,需要自己catch处理

***0.5.0增加了纯转发API agent, 推荐转发使用***

使用方法:

```javascript
  await this.agent()
```

注意agent是纯转发,也可以配置url等,但是不要render或者renderJSON

agent可以使用resHeaders(数组对象)或者suppressResHeaders(数组字符串)改变response的头,改变request头使用headers, suppressHeaders和overHeaders

改变response头需要注意安全!

改变response演示,比如你不想要给用户展示返回的api服务器的server-id,就可以用:

```javascript
  await this.agent({suppressResHeaders: ['server-id']})
```

如果非转发,而是请求,请使用fetch,fetch不包含上下文,使用参考request库 (如果传入pathname, fetch也会使用全局的host,需要注意)
>>>>>>> v0.5.0

```javascript
  let content;
  try {
    content = yield this.fetch({url: xxx});
  } catch(err) {
    content = {...}       // 错误处理
  }
  this.renderJSON(content);
```

***注意*** 因为是pipe,不需要render或者renderJSON

this.renderJSON只是在aconite框架下推荐用法，如果你覆盖了全局的after或者before，在具体controller中也可以进行具体处理，拿到的content可以通过判断下面的status判断是err或者正常的data，再做具体处理

**proxy**接受具体接口配置，接受两个参数，proxy实现参数如下

```javascript
proxy: function(params = {}, host = options.apiServer) {}
```

params（非转发才写，用于处理node层发起请求）:

| Param       | Type    | Description                              |
| ----------- | ------- | ---------------------------------------- |
| url         | String  | 请求地址（请求地址如果是带有host的，则会忽略全局的host）         |
| method      | String  | 请求方法                                     |
| headers     | Object  | 请求头（会合并到上下文请求头）                          |
| overHeaders | Object  | 请求头（会取代上下文请求头）                           |
| form        | Object  | 请求body                            |
| body        | Object  | 请求body                                   |
| json        | boolean | 一般会设置为true，request和response的body会json化，且用application/json提交 |
| conf        | Object  | 可以覆盖全局的reqConfig                         |
| options     | Object  | 可以覆盖全局的所有配置（注意是浅拷贝）                      |
| optional    | Boolean | 并发出现错误后是否reject，默认是false，传true则resolve     |

参数1为Object对象接受url，method，headers，form, 用来进行node层发起的请求，参数2为字符串接受host，比如你全局配置了host1，具体接口可以接受其它host，如果只传入了一个参数且为字符串，默认为host参数。

**0.2.0开始body(form)也能处理get请求，form参数以后会改成body参数来统一request库，现在都兼容**

如果需要发送多个对后端的请求在一个controller中，推荐使用：

```javascript
  let content = yield [this.proxy({url: xxx}), this.proxy(url: xxx)];
```
或者：
```javascript
  let content = yield {one: this.proxy({url: xxx}), two: this.proxy(url: xxx)};
```
content会是一个数组或者对象，根据数组或者对象进行具体的数据拼接操作，这样你发出的请求是并行的，aconite不推荐使用串行即：

```javascript
  // 不推荐！
  let contentOne = yield this.proxy({url: xxx});
  let contentTwo = yield this.proxy({url: xxx});
```
这么做的话，你的每个请求需要等上个请求完成，这只有在需要后端返回数据前后依赖的情况下才会这么做，而前后依赖意味着有业务，不推荐这么做。

**在0.2.0中如果后端返回404或者500，会直接抛出，而不再返回200，但是需要注意，如果你希望某一个请求的失败不会阻止别的请求的发送，你需要把请求放入try...catch中处理，在0.2.3，提供了一个optional参数，默认为false，如果传true，则请求失败也会保持resolve（保持200），这种情况可以处理多个并行请求中，不想因为某个请求失败而整个失败的情况，但需要调用者自己做判断**

具体路由中可以在到达proxy方法前篡改上下文，比如一个后端接口接受请求中加入一个userId，而不需要传cookie，那么可以在controller中获取headers删除cookie，然后在header中加入userId，方法比较灵活，不一定要通过传参的形式解决，传参比较适合node层发出的独立请求而非接口转发。

***现在json也从参数1的Object对象中迁移到了conf对象下***

####返回结果整体pipe

如果需要将response头全部代理回来，直接使用

```javascript
  yield this.proxy({needPipeRes: true})
```
注意不需要赋值和renderJSON

*纯转发推荐使用这种方式，但可能会和etag中间件有冲突，需要在中间件里进行路由配置
*jsonp因为请求头不带content-type，response回来后需要设置content-type为application/x-javascript，如果proxy处理可能有副作用，所以推荐也使用needPipeRes来处理

**fetch**: 0.3以上版本增加fetch来代替proxy用来发起node层请求，现在proxy依然支持，但推荐纯node请求可以考虑使用fetch方法

## update

### 0.6.0
+ 修改request库依赖，修复post请求无body体报错问题
### 0.5.14

+ 修改Object.defineProperties的configurable为true，允许delete重新设置属性

### 0.5.13

+ fetch可以一参只传url字符串
+ 兼容aconite-core修改d.ts

### 0.5.12

+ 修改request-id为requestid，保证前后端统一

### 0.5.11
+ 保留 headers 中的敏感信息，但对敏感信息采用mask掩码的方式处理

### 0.5.10

+ 调整到正确的reject内容（需要配合error升级）

### 0.5.9

+ 增加d.ts文件支持ts

### 0.5.8

+ 优化日志记录的格式和性能

### 0.5.7

+ 给log增加category方便查询

### 0.5.6

+ before和after增加了debug级别的log

### 0.5.5

+ 移除了一些不必要的delete操作

### 0.5.4

+ 增加了对agent的后续处理

### 0.5.3

+ 修复了一个参数错误

### 0.5.1

+ 修改suppressHeaders

+ 优化代码结构

### 0.5.0

+ 兼容node8的cookie

+ 增加agent方法

### 0.4.5

+ 合并了optional和rejectErr到optional(不再提供rejectErr)

+ 更新了文档

### 0.4.4

+ 修复了ctx.throw不能被外部捕获的问题(不再throw,默认reject利用http-error中间件处理问题)

+ 调试了框架,错误默认reject,因为resolve如果不处理也没有意义

### 0.4.3

+ 保证对fetch方法uri和url的兼容

### 0.4.2

+ 修复了一个错误记录requestId的问题

### 0.4.1

+ 改进了一个一些文档修改和优化，修改了上下文有content-type，node层发请求的兼容问题

### 0.4.0

+ 增加`request`的`forever`默认配置，在Node端发起请求时，采用keep alive的方式，提升连接复用率

+ 修复了一个比较复杂场景下的问题，如果在未设置content-type的场景下（一般是跳转页面的get请求），使用proxy从node发起post请求（非代理，是发新请求），使用form或body字段后，会默认设置content-type为application/x-www-form-urlencoded，form没有问题（老版本默认使用了body，也有问题，只是一般我们都需要application/json，所以没有暴露问题），但body字段作用和form字段相同，与request库的做法不一致。

  目前考虑我们的主要业务场景，0.4.1修改为仍然默认使用application/json，如果需要发送application/x-www-form-urlencoded，可以设置参数contentType，现在也提供了在proxy发起请求设置json的能力。未来推荐node层发起请求使用下面提供的fetch方法。

+ handleStatusOk方法不在handleErr方法里了，现在为并列关系，如果请求的http状态码为500，则使用handleErr方法，200使用handleStatusOk方法，handleStatusOk默认会空方法，可以自定义用来处理业务错误或者业务log。

+ 增加全链路监控支持

### 0.3.7

+ 修改了json的适用范围，现在除了needPipeRes都会使用json

### 0.3.6

+  500请求会增加info记录requestOpt

### 0.3.4

+ 更新文档，增强兼容性

### 0.3.2

+ 增加了fetch，重构了部分内部逻辑，添加了handleStatusOk，增加了测试

### 0.2.2

+ 增加optional属性用于判断是否是可选接口

### 0.2.0

+ 原来如果后端返回404或者500，proxy仍会返回200，现在会正确的处理这种情况

### 0.1.5

+ 增加了对压缩内容的处理

### API


<a name="module_@hujiang/aconite-proxy"></a>

## @hujiang/aconite-proxy

* [@hujiang/aconite-proxy](#module_@hujiang/aconite-proxy)
    * [module.exports(options, apiServer)](#exp_module_@hujiang/aconite-proxy--module.exports) ⏏
        * [~statusOKCallback](#module_@hujiang/aconite-proxy--module.exports..statusOKCallback) : <code>function</code>
        * [~errorCallback](#module_@hujiang/aconite-proxy--module.exports..errorCallback) : <code>function</code>
        * [~beforeCallback](#module_@hujiang/aconite-proxy--module.exports..beforeCallback) : <code>function</code>
        * [~afterCallback](#module_@hujiang/aconite-proxy--module.exports..afterCallback) : <code>function</code>

<a name="exp_module_@hujiang/aconite-proxy--module.exports"></a>

### module.exports(options, apiServer) ⏏
**Kind**: Exported function  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | 初始化中间件参数 |
| apiServer | <code>String</code> | 后端服务器的Host |
| options.before | [<code>beforeCallback</code>](#module_@hujiang/aconite-proxy--module.exports..beforeCallback) | 请求调用前执行的回调(同步) |
| options.after | [<code>afterCallback</code>](#module_@hujiang/aconite-proxy--module.exports..afterCallback) | 请求调用完成后执行的回调(同步) |
| options.handleErr | [<code>errorCallback</code>](#module_@hujiang/aconite-proxy--module.exports..errorCallback) | 处理异常点方法（同步） |
| options.handleStatusOK | [<code>statusOKCallback</code>](#module_@hujiang/aconite-proxy--module.exports..statusOKCallback) | 处理状态码为200的请求的处理方法（同步） |
| options.reqConfig | <code>Object</code> | request组件的配置参数，具体见 @see @link{https://github.com/request/request}, 默认启用了forever |
| options.headers | <code>Object</code> | HTTP请求头，合并到`context`的请求头 |
| options.overHeaders | <code>Object</code> | 请求头（会取代上下文请求头） |
| options.suppressHeaders | <code>Array.&lt;string&gt;</code> | 删除的请求头 |
| options.suppressResHeaders | <code>Array.&lt;string&gt;</code> | 需要删除的response header, 仅用于needPipeRes |
| options.resHeaders | <code>Array.&lt;Object&gt;</code> | 需要添加或者覆盖的response header |
| options.endPipeRes | <code>boolean</code> | 默认设置为true，当使用needPipeRes后不resolve，防止后面因为设置头而报错 |
| options.requestIdKey | <code>boolean</code> | 默认为requestid |

<a name="module_@hujiang/aconite-proxy--module.exports..statusOKCallback"></a>

#### module.exports~statusOKCallback : <code>function</code>
一般不需要使用

**Kind**: inner typedef of [<code>module.exports</code>](#exp_module_@hujiang/aconite-proxy--module.exports)  

| Param | Type | Description |
| --- | --- | --- |
| ctx | <code>Object</code> | 请求上下文 |
| uri | <code>String</code> | 请求URI对象 |
| data | <code>Object</code> | 请求响应的data |
| resolve | <code>function</code> | 执行该方法，resolve `Promise` |
| reject | <code>function</code> | 执行该方法，reject `Promise` |

<a name="module_@hujiang/aconite-proxy--module.exports..errorCallback"></a>

#### module.exports~errorCallback : <code>function</code>
一般不需要使用，不管是否成功，都会调用该回调

**Kind**: inner typedef of [<code>module.exports</code>](#exp_module_@hujiang/aconite-proxy--module.exports)  

| Param | Type | Description |
| --- | --- | --- |
| ctx | <code>Object</code> | 请求上下文 |
| res | <code>Object</code> | `request` 的 `response` 对象 |
| obj | <code>Object</code> | - |
| obj.data | <code>Object</code> | 请求响应返回数据 |
| obj.uri | <code>String</code> | 请求URI |
| obj.okHandler | [<code>statusOKCallback</code>](#module_@hujiang/aconite-proxy--module.exports..statusOKCallback) |  |
| obj.requestOpt | <code>Object</code> | request请求的参数 |
| obj.resolve | <code>function</code> | 执行该方法，resolve `Promise` |
| obj.reject | <code>function</code> | 执行该方法，reject `Promise` |

<a name="module_@hujiang/aconite-proxy--module.exports..beforeCallback"></a>

#### module.exports~beforeCallback : <code>function</code>
**Kind**: inner typedef of [<code>module.exports</code>](#exp_module_@hujiang/aconite-proxy--module.exports)  

| Param | Type | Description |
| --- | --- | --- |
| ctx | <code>Object</code> | 请求上下文 |
| opt | <code>Object</code> | 请求传给 `request` 的options |

<a name="module_@hujiang/aconite-proxy--module.exports..afterCallback"></a>

#### module.exports~afterCallback : <code>function</code>
**Kind**: inner typedef of [<code>module.exports</code>](#exp_module_@hujiang/aconite-proxy--module.exports)  

| Param | Type | Description |
| --- | --- | --- |
| ctx | <code>Object</code> | 请求的上下文 |
| opt | <code>Object</code> | 请求传给 `request` 的options |
| res | <code>Object</code> | `request` 的 `response` 对象 |
| data | <code>Object</code> | 请求返回的结果 |

