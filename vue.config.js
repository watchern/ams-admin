'use strict'
const path = require('path')
const defaultSettings = require('./src/settings.js')
const Timestamp = new Date().getTime();
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

// const port = process.env.port || 9527 // dev port
const port = process.env.port || 8070 // dev port

const CompressionWebpackPlugin = require('compression-webpack-plugin')
// // 代码压缩优化
// const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
require('events').EventEmitter.defaultMaxListeners = 0

// All configuration item explanations can be find in https://cli.vuejs.org/config/
module.exports = {
  /**
   * You will need to set publicPath if you plan to deploy your site under a sub path,
   * for example GitHub Pages. If you plan to deploy your site to https://foo.github.io/bar/,
   * then publicPath should be set to "/bar/".
   * In most cases please use '/' !!!
   * Detail: https://cli.vuejs.org/config/#publicpath
   */
  publicPath: './',
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
    open: true, // 配置自动启动浏览器
    proxy: {
      '/r1/': {
        target: process.env.R1_LOCATION,
        changeOrigin: true,
        pathRewrite: {
          '^/r1/': '/'
        }
      },
      '/data/': {
        target: process.env.AMSDATA_API,
        changeOrigin: true,
        pathRewrite: {
          '^/data/': '/'
        }
      },
      '/base/': {
        timeout: 1800000,
        target: process.env.AMSBASE_API,
        changeOrigin: true,
        pathRewrite: {
          '^/base/': '/'
        }
      },
      '/analysis/': {
        target: process.env.AMSANALYSIS_API,
        changeOrigin: true,
        pathRewrite: {
          '^/analysis/': '/'
        }
      },
      '/indicator/': {
        target: process.env.AMSINDICATOR_API,
        changeOrigin: true,
        pathRewrite: {
          '^/indicator/': '/'
        }
      },
      '/graphtool/': {
        timeout: 1111800000,
        target: process.env.AMSGRAPHTOOL_API,
        changeOrigin: true,
        pathRewrite: {
          '^/graphtool/': '/'
        }
      },
      // etl调度模块调用的地址
      '/etlscheduler/': {
        timeout: 1800000,
        target: process.env.AMSETLSCHEDULER_API,
        changeOrigin: true,
        pathRewrite: {
          '^/etlscheduler/': '/'
        }
      },
      '/AuditAnalysis': {
        timeout: 1800000,
        target: process.env.EXTENDAPP_API,
        changeOrigin: true,
        pathRewrite: {
          '^/AuditAnalysis/': '/AuditAnalysis/'
        }
      },
      '/rone/': {
        timeout: 1800000,
        target: process.env.EXTENDAPP_API,
        changeOrigin: true,
        pathRewrite: {
          '^/rone/': '/rone/'
        }
      },
      '/psbcaudit/': {
        timeout: 1800000,
        target: process.env.EXTENDAPP_API,
        changeOrigin: true,
        pathRewrite: {
          '^/psbcaudit/': '/psbcaudit/'
        }
      },
      '/psbcaudit_pmrs/': {
        timeout: 1800000,
        target: process.env.EXTENDAPP_API,
        changeOrigin: true,
        pathRewrite: {
          '^/psbcaudit_pmrs/': '/psbcaudit_pmrs/'
        }
      },
      '/psbcaudit_kn/': {
        timeout: 1800000,
        target: process.env.EXTENDAPP_API,
        changeOrigin: true,
        pathRewrite: {
          '^/psbcaudit_kn/': '/psbcaudit_kn/'
        }
      },
      '/psbcaudit_auditobj/': {
        timeout: 1800000,
        target: process.env.EXTENDAPP_API,
        changeOrigin: true,
        pathRewrite: {
          '^/psbcaudit_auditobj/': '/psbcaudit_auditobj/'
        }
      },
      '/datamax-server/': {
        timeout: 1800000,
        target: process.env.AMSDATAMAX_API,
        changeOrigin: true,
        pathRewrite: {
          '^/datamax-server/': '/'
        }
      },
      '/starflow/': {
        timeout: 1800000,
        target: process.env.AMSSTARFLOW_API,
        changeOrigin: true,
        pathRewrite: {
          '^/starflow/': '/'
        }
      },
      '/ams-clue': {
        timeout: 1800000,
        target: process.env.AMSCLUE_API,
        changeOrigin: true,
        pathRewrite: {
          '^/ams-clue/': '/'
        }
      }
      // ,
      // '/sess': {
      //   timeout: 1800000,
      //   target: process.env.AMSSESS_API,
      //   changeOrigin: true,
      //   pathRewrite: {
      //     '^/sess/': '/'
      //   }
      // },
    }
  },
  configureWebpack: config => {
    // provide the app's title in webpack's name field, so that
    // it can be accessed in index.html to inject the correct title.
    // Object.assign(config, {
    config.entry.app = ["@babel/polyfill", "./src/main.js"]
    return{
      output: { // 输出重构  打包编译后的 文件名称  【模块名称.版本号.时间戳】
        filename: `static/js/[name].${Timestamp}.js`,
        chunkFilename: `static/js/[name].${Timestamp}.js`
      },
    name: name,
    resolve: {
      alias: {
        '@': resolve('src'),
        '@ETL': 'ams-etlscheduler-ui-hsfs/src',
        '@MAX': 'ams-datamax/src'
      }
    },
    // gzip压缩
    plugins: [
      // const productionGzipExtensions = /\.(js|css|json|txt|html|ico|svg)(\?.*)?$/i
      // config.resolve.alias.set('@', resolve('src'))
      // config.plugin('compressionPlugin')
      //   .use(new CompressionPlugin({
      //     filename: '[path].gz[query]',
      //     algorithm: 'gzip',
      //     test: productionGzipExtensions,
      //     threshold: 10240,
      //     minRatio: 0.8,
      //     deleteOriginalAssets: false
      //   }))
      new CompressionWebpackPlugin({
        filename: '[path].gz[query]',
        algorithm: 'gzip',
        test: /\.(js|css|json|txt|html|ico|svg)(\?.*)?$/i,
        threshold: 10240, // 对超过10k的数据进行压缩
        minRatio: 0.8, // 只有压缩率小于这个值的资源才会被处理
        deleteOriginalAssets: false // 删除原文件
        // deleteOriginalAssets: process.env.NODE_ENV !== 'development' // 删除原文件
      })
      // ,
      // new ProvidePlugin({
      //   _: 'lodash'
      // })
      // ,
      // new UglifyJsPlugin({
      //     uglifyOptions: {
      //       //生产环境自动删除console
      //       compress: {
      //         // warnings: false, // 若打包错误，则注释这行
      //         drop_debugger: true,
      //         drop_console: true,
      //         pure_funcs: ['console.log']
      //       }
      //     },
      //     sourceMap: false,
      //     parallel: true
      //   })
    ]
    }
  },
  chainWebpack:config =>{
    // it can improve the speed of the first screen, it is recommended to turn on preload
    // it can improve the speed of the first screen, it is recommended to turn on preload
    //兼容ie11
    config.module
        .rule('view-design')
        .test(/view-design.src.*?js$/)
        .use('babel')
        .loader('babel-loader')
        .end()
    config.plugin('preload').tap(() => [{
      rel: 'preload',
      // to ignore runtime.js
      // https://github.com/vuejs/vue-cli/blob/dev/packages/@vue/cli-service/lib/config/app.js#L171
      fileBlacklist: [/\.map$/, /hot-update\.js$/, /runtime\..*\.js$/],
      include: 'initial'
    }])

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
  },
  css: {
    loaderOptions: {
      sass: {
        data: `@import "ams-datamax/src/assets/styles/index.scss";`
      },
      css: {
        // 这里的选项会传递给 css-loader
        importLoaders: 1,
      },
      less: {
        // 这里的选项会传递给 postcss-loader
        importLoaders: 1,
      }
    }
  }
}
