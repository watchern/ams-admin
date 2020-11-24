'use strict'
const path = require('path')
const defaultSettings = require('./src/settings.js')

function resolve(dir) {
  return path.join(__dirname, dir)
}

const name = defaultSettings.title || 'Audit Manage System' // page title

// If your port is set to 80,
// use administrator privileges to execute the command line.
// For example, Mac: sudo npm run
// You can change the port by the following method:
// port = 9527 npm run dev OR npm run dev --port = 9527
// const port = process.env.port || process.env.npm_config_port || 9527 // dev port

const port = process.env.port || 9527 // dev port

// All configuration item explanations can be find in https://cli.vuejs.org/config/
module.exports = {
  /**
   * You will need to set publicPath if you plan to deploy your site under a sub path,
   * for example GitHub Pages. If you plan to deploy your site to https://foo.github.io/bar/,
   * then publicPath should be set to "/bar/".
   * In most cases please use '/' !!!
   * Detail: https://cli.vuejs.org/config/#publicpath
   */
  publicPath: '/',
  outputDir: 'dist',
  assetsDir: 'static',
  lintOnSave: false,
  // lintOnSave: process.env.NODE_ENV === 'development',
  runtimeCompiler: true,
  productionSourceMap: false,
  devServer: {
    // ignore eslint
    overlay: {
      warnings: false,
      errors: false
    },
    disableHostCheck: true,
    port: port, // 端口号
    host: 'localhost',
    // host: '192.168.80.142',
    https: false, // https:{type:Boolean}
    open: true, //配置自动启动浏览器
    //proxy: 'http://172.20.10.9:8080', // 配置跨域处理,只有一个代理 //192.168.43.43
    //before: require('./mock/mock-server.js'),
    proxy: {
      '/r1': {
        target: process.env.R1_LOCATION
      },
      '/data': {
        target: 'http://localhost:8081'
        // target: 'http://139.159.246.94:1093'  //远程测试环境
      },
      '/base': {
        target: 'http://localhost:8085'
      },
      '/analysis':{
        target:'http://localhost:8086'
      },
      '/graphtool':{
        target:'http://localhost:8087'
      },
      // etl调度模块调用的地址
      '/etlscheduler': {
        // target: 'http://192.168.80.155:8080'
        target: 'http://localhost:8082/amsetlscheduler',
        // target: process.env.ETL_API_LOCATION,
        changeOrigin: true,
        pathRewrite: {
          '^/etlscheduler': ''
        }
        // target: process.env.ETL_API_TEST_LOCATION
      },
      '/dolphinscheduler': {
        timeout: 1800000,
        // target: 'http://192.168.80.183:12345',
        target: 'http://localhost:8082/amsetlscheduler',
        changeOrigin: true
        // ,
        // pathRewrite: {
        //   '^/dolphinscheduler': ''
        // }
      },
      '/AuditAnalysis': {
        timeout: 1800000,
        target: 'http://localhost:8080',
        changeOrigin: true
        // ,
        // pathRewrite: {
        //   '^/dolphinscheduler': ''
        // }
      },
      '/rone': {
        timeout: 1800000,
        target: 'http://localhost:8088',
        changeOrigin: true
        // ,
        // pathRewrite: {
        //   '^/dolphinscheduler': ''
        // }
      },
      '/psbcaudit': {
        timeout: 1800000,
        target: 'http://localhost:8088',
        changeOrigin: true
        // ,
        // pathRewrite: {
        //   '^/dolphinscheduler': ''
        // }
      },
      '/psbcaudit_pmrs': {
        timeout: 1800000,
        target: 'http://localhost:8088',
        changeOrigin: true
        // ,
        // pathRewrite: {
        //   '^/dolphinscheduler': ''
        // }
      },
      '/psbcaudit_kn': {
        timeout: 1800000,
        target: 'http://localhost:8088',
        changeOrigin: true
        // ,
        // pathRewrite: {
        //   '^/dolphinscheduler': ''
        // }
      },
      '/psbcaudit_auditobj': {
        timeout: 1800000,
        target: 'http://localhost:8088',
        changeOrigin: true
        // ,
        // pathRewrite: {
        //   '^/dolphinscheduler': ''
        // }
      }
    }
  },
  configureWebpack: {
    // provide the app's title in webpack's name field, so that
    // it can be accessed in index.html to inject the correct title.
    name: name,
    resolve: {
      alias: {
        '@': resolve('src')
      }
    }
  },
  chainWebpack(config) {
    // it can improve the speed of the first screen, it is recommended to turn on preload
    // it can improve the speed of the first screen, it is recommended to turn on preload
    config.plugin('preload').tap(() => [
      {
        rel: 'preload',
        // to ignore runtime.js
        // https://github.com/vuejs/vue-cli/blob/dev/packages/@vue/cli-service/lib/config/app.js#L171
        fileBlacklist: [/\.map$/, /hot-update\.js$/, /runtime\..*\.js$/],
        include: 'initial'
      }
    ])

    // when there are many pages, it will cause too many meaningless requests
    config.plugins.delete('prefetch')

    // set svg-sprite-loader
    config.module
      .rule('svg')
      .exclude.add(resolve('src/icons'))
      .end()
    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/icons'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })
      .end()

    config
      .when(process.env.NODE_ENV !== 'development',
        config => {
          config
            .plugin('ScriptExtHtmlWebpackPlugin')
            .after('html')
            .use('script-ext-html-webpack-plugin', [{
            // `runtime` must same as runtimeChunk name. default is `runtime`
              inline: /runtime\..*\.js$/
            }])
            .end()
          config
            .optimization.splitChunks({
              chunks: 'all',
              cacheGroups: {
                libs: {
                  name: 'chunk-libs',
                  test: /[\\/]node_modules[\\/]/,
                  priority: 10,
                  chunks: 'initial' // only package third parties that are initially dependent
                },
                elementUI: {
                  name: 'chunk-elementUI', // split elementUI into a single package
                  priority: 20, // the weight needs to be larger than libs and app or it will be packaged into libs or app
                  test: /[\\/]node_modules[\\/]_?element-ui(.*)/ // in order to adapt to cnpm
                },
                commons: {
                  name: 'chunk-commons',
                  test: resolve('src/components'), // can customize your rules
                  minChunks: 3, //  minimum common number
                  priority: 5,
                  reuseExistingChunk: true
                }
              }
            })
          // https:// webpack.js.org/configuration/optimization/#optimizationruntimechunk
          config.optimization.runtimeChunk('single')
        }
      )
  }
}
