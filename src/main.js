import "@babel/polyfill";

import Vue from 'vue'

import Cookies from 'js-cookie'

// import 'normalize.css/normalize.css' // a modern alternative to CSS resets  ---
import $ from 'jquery'
Vue.prototype.$ = $
import "bootstrap"
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../node_modules/bootstrap/dist/js/bootstrap.min.js';
// import "bootstrap/dist/css/bootstrap.min.css"
// import "bootstrap/dist/js/bootstrap.min.js"
import Element from 'element-ui'
// import Skeleton from 'element-ui'
import './styles/element-variables.scss'
import "./styles/common.scss"
import 'font-awesome/css/font-awesome.min.css'
// Ace start
import tool from '@/styles/js/tool'
Vue.prototype.$tool = tool
import create from '@/styles/js/create'
Vue.prototype.$create = create
import VueAnimateNumber from 'vue-animate-number'
Vue.use(VueAnimateNumber)
// import '@/directive/Ace/scroll.js'
import components from '@/components/public/index'
import DataV from '@jiaminghi/data-view'
Vue.use(DataV)
import { borderBox1 } from '@jiaminghi/data-view'
Vue.use(borderBox1)
// 指标注释
import 'ams-indicator-vue/src/styles/element-variables.scss'
import 'ams-indicator-vue/src/styles/index.scss' // global css
// import '@ag-grid-community/all-modules/dist/styles/ag-grid.css';
// import '@ag-grid-community/all-modules/dist/styles/ag-theme-alpine.css';// global css
Vue.use(components)
// Vue.use(Skeleton)
// Ace end


require(`@/styles/index-${process.env.VUE_APP_BASE_SKIN}.scss`);
import App from './App'
import store from './store'
import router from './router'

import i18n from './lang' // internationalization
import './icons' // icon
import './permission' // permission control
import './utils/error-log' // error log
import CommonUtil from "@/utils/common";

Vue.prototype.CommonUtil = CommonUtil;


import _ from 'lodash'
Vue.use(_);

import * as filters from './filters' // global filters

// etl start
import 'ans-ui/lib/ans-ui.min.css'
import ans from 'ans-ui/lib/ans-ui.min'
// import 'canvg/dist/browser/canvg.min.js'
Vue.use(ans)

// end etl

// file Upload
import uploader from 'vue-simple-uploader'
Vue.use(uploader)
/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online ! ! !
 */
/* if (process.env.NODE_ENV === 'production') {
  const {
    mockXHR
  } = require('../mock')
  mockXHR()
}*/

Vue.use(Element, {
  size: Cookies.get('size') || 'medium', // set element-ui default size
  i18n: (key, value) => i18n.t(key, value)
})

// register global utility filters
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

Vue.config.productionTip = false
//region 图表引用

import VueQriously from 'vue-qriously'
import baseConfig from 'ams-datamax/src/config/config'
import clipboard from 'clipboard'
import axios from 'axios'
import dataV from '@jiaminghi/data-view'
// import dict from "ams-starflow-vue/src/components/common/dict";
import dict from "@/components/starflow/common/dict";
// import common from "ams-starflow-vue/src/components/common/common";
import common from "@/components/starflow/common/common";
//import VueAxios from 'vue-axios'
//Vue.use(VueAxios, axios)
Vue.prototype.$clipboard = clipboard
Vue.prototype.$ajax = axios
Vue.prototype.$axios = axios
Vue.prototype.axios = axios;
Vue.prototype.dict = dict;
Vue.prototype.common = common;

Vue.use(dataV)
Vue.use(VueQriously)
Vue.mixin({
  data () {
    return {
      commonConfig: baseConfig
    }
  }
})
//endregion 图表引用
new Vue({
  el: '#app',
  router,
  store,
  i18n,
  _,
  render: h => h(App)
})


//region 指标
Vue.prototype.log_module = "指标分析";
Vue.prototype.log_add = "新增";
Vue.prototype.log_edit = "编辑";
Vue.prototype.log_del = "删除";
Vue.prototype.log_see = "查看";

/**
 * AMS模块
 * {{ETLSCHEDULER: string, DATA: string, GRAPHTOOL: string, INDICATOR: string, ANALYSIS: string, DATAMAX: string, BASE: string}}
 */
Vue.prototype.AmsModules = {
  ANALYSIS: 'analysis',
  BASE: 'base',
  DATA: 'data',
  ETLSCHEDULER: 'etlscheduler',
  DATAMAX: 'datamax',
  INDICATOR: 'indicator',
  GRAPHTOOL: 'graphtool'
}

/**
 * 获取websocket相关配置与基准路径获取方法
 * @option modules 模块名
 * @option getWSBaseUrl 获取ws基准目录
 * @returns {string}
 */
Vue.prototype.AmsWebsocket = {
  getWSBaseUrl: function (moduleName) {
    moduleName = moduleName ? moduleName : null
    const websockettype = process.env["VUE_APP_WEBSOCKETTYPE"] ? process.env["VUE_APP_WEBSOCKETTYPE"] : "client"
    const appservername = process.env["VUE_APP_SERVERNAME"] ? process.env["VUE_APP_SERVERNAME"] : ""
    if (moduleName == null || websockettype === "client") {
      // 默认读浏览器访问host
      return 'ws://' + window.location.host + appservername + '/websocket?'
    } else {
      // 读env配置
      switch (moduleName.toLowerCase()) {
        case Vue.prototype.AmsModules.ANALYSIS:
          return process.env["VUE_APP_ANALYSIS_WEB_SOCKET"]
        case Vue.prototype.AmsModules.BASE:
          return process.env["VUE_APP_BASE_WEB_SOCKET"]
        case Vue.prototype.AmsModules.GRAPHTOOL:
          return process.env["VUE_APP_GRAPHTOOL_WEB_SOCKET"]
        case Vue.prototype.AmsModules.INDICATOR:
          return process.env["VUE_APP_INDICATOR_WEB_SOCKET"]
        case Vue.prototype.AmsModules.DATA:
          return process.env["VUE_APP_DATA_WEB_SOCKET"]
        default:
          // 默认读浏览器访问host
          return 'ws://' + window.location.host + '/websocket?'
      }
    }
  }
}

Vue.prototype.hasMenu = process.env["VUE_APP_BASE_MENU"] ? process.env["VUE_APP_BASE_MENU"] !== 'withoutmenu' : true
Vue.prototype.contextUrl = "indicator";
Vue.prototype.dataContextUrl = "data";
Vue.prototype.baseContextUrl = "base";
Vue.prototype.getParams = function () {
  var url = window.location.href;
  url = url.split("?")[1];
  if (!url) return "";
  var para = url.split("&");
  var len = para.length;
  var res = {};
  var arr = [];
  for (var i = 0; i < len; i++) {
    arr = para[i].split("=");
    res[arr[0]] = arr[1];
  }
  return res;
}


/**
 * 更改聚合显示的文字
 * @param group 聚合方式
 * @param name 指标名称
 */
Vue.prototype.updateGroupDisplay = function (group, name) {
  if (group == "sum") {
    return "合计(" + name + ")";
  }
  if (group == "count") {
    return "计数(" + name + ")";
  }
  if (group == "max") {
    return "最大值(" + name + ")";
  }
  if (group == "min") {
    return "最小值(" + name + ")";
  }
  if (group == "avg") {
    return "平均值(" + name + ")";
  }
  if (group == "distinct") {
    return "差异计数(" + name + ")";
  }
  return name;
}

/**
 * 生成UUID
 * @returns {string} 返回生成的UUID
 */
Vue.prototype.getuuid = function () {
  var s = [];
  var hexDigits = "0123456789abcdef";
  for (var i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = "-";

  var uuid = s.join("");
  return uuid;
}

/**
 * 封装的一个用来格式化字符串的，拼接老错还不好改   ZhangSiWei囧
 * @param args 要拼接的字符串
 * @returns {String} 返回拼接后的字符串
 */
String.prototype.format = function (args) {
  var result = this;
  if (arguments.length > 0) {
    if (arguments.length == 1 && typeof (args) == "object") {
      for (var key in args) {
        if (args[key] != undefined) {
          var reg = new RegExp("({" + key + "})", "g");
          result = result.replace(reg, args[key]);
        }
      }
    }
    else {
      for (var i = 0; i < arguments.length; i++) {
        if (arguments[i] != undefined) {
          var reg = new RegExp("({)" + i + "(})", "g");
          result = result.replace(reg, arguments[i]);
        }
      }
    }
  }
  return result;
}

/**
 * 根据正则取出俩字符之间的字符
 * @param str
 * @returns {*}
 */
Vue.prototype.getCharBetweenString = function (str) {
  var guuidReg = /\((.+?)\)/g;
  var guuid = str.match(guuidReg);
  guuid = JSON.stringify(guuid).replace("[\"(", "").replace(")\"]", "");
  return guuid;
}

/**
 * 添加操作日志
 * @param module 操作模块
 * @param operaterType 操作类型
 * @param info 信息记录
 */
Vue.prototype.addOperLogByParam = function (module, operaterType, info) {
}
/**
 * 这个方法用来添加消息提醒
 * @param title
 * @param content
 * @param personUuid
 * @param type
 */
Vue.prototype.addMessage = function (title, content, personUuid, type) {
}

//endregion 指标
