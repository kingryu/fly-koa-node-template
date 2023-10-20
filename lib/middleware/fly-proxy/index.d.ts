import { Middleware } from 'koa';
import { CoreOptions } from 'request';

type anyObject = { [key: string]: any };

interface InjectOptions {
  /**
   * 请求调用前执行的回调(同步)
   */
  before?: (ctx: any, opt: CoreOptions) => void;
  /**
   * 请求调用完成后执行的回调(同步)
   */
  after?: (ctx: any, opt: CoreOptions, res: anyObject, data: any) => void;
  /**
   * 处理异常点方法（同步）
   */
  handleErr?: (
    ctx: any,
    err: { status?: number; stack?: string },
    { data, uri, requestOpt }: { data: any; uri: string; requestOpt: CoreOptions }
  ) => void;
  /**
   * 处理状态码为200的请求的处理方法（同步）
   */
  handleStatusOk?: (ctx: any, uri: string, data: any, resolve: Function, reject: Function) => void;
}

interface GlobalOptions extends InjectOptions {
  /**
   * 后端服务器的Host
   */
  apiServer?: string;
  /**
   * request组件的配置参数，具体见 @see @link{https://github.com/request/request}, 默认启用了forever
   */
  reqConfig?: CoreOptions;
  /**
   * HTTP请求头，合并到`context`的请求头
   */
  headers?: anyObject;
  /**
   * 请求头（会取代上下文请求头）
   */
  overHeaders?: anyObject;
  /**
   * 删除的请求头
   */
  suppressHeaders?: string[];
  /**
   * 需要删除的response header, 仅用于needPipeRes
   */
  suppressResHeaders?: string[];
  /**
   * 需要添加或者覆盖的response header, 仅用于needPipeRes
   */
  resHeaders?: anyObject;
  /**
   * 默认设置为true，当使用needPipeRes后不resolve，防止后面因为设置头而报错
   */
  endPipeRes?: boolean;
  /**
   * 默认为requestid
   */
  requestIdKey?: string;
}

interface ProxyOptions extends InjectOptions {
  /**
   * 请求地址（请求地址如果是带有host的，则会忽略全局的host)
   */
  url?: string;
  /**
   * 请求方法
   */
  method?: string;
  /**
   * 当前请求的header，会和初始化中间件的 `headers`合并
   */
  headers?: anyObject;
  /**
   * 请求头（会取代上下文请求头）
   */
  overHeaders?: anyObject;
  /**
   * 请求体
   */
  form?: anyObject | string;
  /**
   * 请求体
   */
  body?: anyObject | string;
  /**
   * 是否需要resolve结果，不抛出异常
   */
  optional?: boolean;
  /**
   * 覆盖初始化中间件的 `reqConfig`
   */
  conf?: CoreOptions;
  /**
   * 是否json化body，参考request文档
   */
  json?: boolean;
  /**
   * 请求的querystring
   */
  qs?: any;
  /**
   * 可读body的请求是否需要pipe req, 默认true
   */
  needPipeReq?: boolean;
  /**
   * 是否pipe res, 默认为false
   */
  needPipeRes?: boolean;
  /**
   * params的options, 可以覆盖全局的options
   */
  options?: any;
  /**
   * 覆盖初始化中间件的 `before`
   */
  before?: () => void;
  /**
   * 覆盖初始化中间件的 `after`
   */
  after?: () => void;
}

interface AgentOptions extends ProxyOptions {
	/**
   * 需要添加或者覆盖的response header, 仅用于needPipeRes
   */
  resHeaders?: anyObject;
  /**
   * 需要删除的response header, 仅用于needPipeRes
   */
  suppressResHeaders?: string[];
}

interface FetchOptions extends CoreOptions {
  /**
   * 是否pipe res, 默认为false
   */
  needPipeRes?: boolean;
  /**
   * 是否需要resolve结果，不抛出异常
   */
  optional?: boolean;
  /**
   * 需要添加或者覆盖的response header, 仅用于needPipeRes
   */
  resHeaders?: anyObject;
  /**
   * 需要删除的response header, 仅用于needPipeRes
   */
  suppressResHeaders?: string[];
}

declare module 'fly-core' {
  export interface Context {
    proxy: (param?: ProxyOptions, host?: string) => Promise<any>|void;
    agent: (param?: AgentOptions, host?: string) => void;
    fetch: (url?: string, fetchOptions?: FetchOptions, host?: string) => Promise<any>|void;
  }
}

declare function proxy(options: GlobalOptions): Middleware;

export = proxy;
