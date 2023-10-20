var base = require('./config/base')
var node_env = base.NODE_ENV

module.exports = Object.assign({}, base, require(`./config/${node_env}`))
