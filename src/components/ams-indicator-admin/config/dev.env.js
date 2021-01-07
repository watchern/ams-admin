'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  VUE_APP_INDICATOR_WEB_SOCKET: '"ws://localhost:8090/indicator/websocket?"'
})
