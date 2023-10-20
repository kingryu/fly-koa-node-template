// @ts-check
const logger = require('./node-log')

/**
 * @module fly-koa-logger
 */

module.exports = function (options = {}) {
  logger.init(options)
  const commonInfo = {
    project: options.projectName
  }
  const appLogger = require('./app')

  const methods = ['trace', 'debug', 'info', 'warn', 'error', 'fatal']

  return function * (next) {
    const context = this

    const contextLogger = {

      access: function (opts) {
        opts = opts || {}
        Object.assign(opts, commonInfo)
        logger.access(require('./access')(context, opts))
      },

      performance: function (info) {
        info = info || {}
        Object.assign(info, commonInfo)
        logger.performance(require('./client')(context, info))
      }
    }

    const needStackMethods = ['error', 'fatal']
    const checkContainsStack = (message) => {
      const reg = /\n\s*at\s*/ig
      return reg.test(message)
    }

    function toString (message) {
      if (typeof message !== 'string') {
        return JSON.stringify(message)
      }
      return message
    }

    function attachStack (message, fn) {
      message = message.toString()
      const obj = {}
      Error.captureStackTrace(obj, fn)
      const stack = obj.stack
      return message + stack.substring(stack.indexOf('\n'))
    }

    methods.forEach(function (item) {
      if (needStackMethods.indexOf(item) > -1) {
        contextLogger[item] = function $logger (message, category) {
          message = toString(message)
          if (!checkContainsStack(message)) {
            message = attachStack(message, $logger)
          }
          logger[item](appLogger(context, message, commonInfo, item, category))
        }
      } else {
        contextLogger[item] = function $logger (message, category, needStack) {
          message = toString(message)
          if (needStack && !checkContainsStack(message)) {
            message = attachStack(message, $logger)
          }
          logger[item](appLogger(context, message, commonInfo, item, category))
        }
      }
    })

    context.log = contextLogger
    yield next
  }
}