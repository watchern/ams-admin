'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  this.AmsWebsocket.getWSBaseUrl(this.AmsModules.INDICATOR): '"ws://localhost:8090/indicator/websocket?"'
})
