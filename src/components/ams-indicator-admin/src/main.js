// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import Element from 'element-ui'
// import { Loading } from 'element-ui';
import './styles/element-variables.scss'
import './styles/index.scss' // global css
Vue.use(Element)
// Vue.use(Loading, {zIndex: 1998})
Vue.config.productionTip = false

//region 日志公共参数
Vue.prototype.log_module = "指标分析";
Vue.prototype.log_add = "新增";
Vue.prototype.log_edit = "编辑";
Vue.prototype.log_del = "删除";
Vue.prototype.log_see = "查看";

//endregion 日志公共参数
Vue.prototype.contextUrl = "indicator";
Vue.prototype.dataContextUrl = "data";
Vue.prototype.baseContextUrl = "base";
Vue.prototype.getParams = function(){
    var url = window.location.href;
    url = url.split("?")[1];
    if(!url) return "";
    var para = url.split("&");
    var len = para.length;
    var res = {};
    var arr = [];
    for(var i=0;i<len;i++){
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
Vue.prototype.updateGroupDisplay = function(group,name) {
    if(group == "sum"){
        return "合计(" + name + ")";
    }
    if(group == "count"){
        return "计数(" + name + ")";
    }
    if(group == "max"){
        return "最大值(" + name + ")";
    }
    if(group == "min"){
        return "最小值(" + name + ")";
    }
    if(group == "avg"){
        return "平均值(" + name + ")";
    }
    if(group == "distinct"){
        return "差异计数(" + name + ")";
    }
    return name;
}

/**
 * 生成UUID
 * @returns {string} 返回生成的UUID
 */
Vue.prototype.getuuid = function (){
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
String.prototype.format = function(args) {
    var result = this;
    if (arguments.length > 0) {
        if (arguments.length == 1 && typeof (args) == "object") {
            for (var key in args) {
                if(args[key]!=undefined){
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
Vue.prototype.getCharBetweenString = function(str) {
    var guuidReg = /\((.+?)\)/g;
    var guuid = str.match(guuidReg);
    guuid = JSON.stringify(guuid).replace("[\"(","").replace(")\"]","");
    //alert(JSON.stringify(guuid));
    return guuid;
}

/**
 * 添加操作日志
 * @param module 操作模块
 * @param operaterType 操作类型
 * @param info 信息记录
 */
Vue.prototype.addOperLogByParam = function(module,operaterType,info) {
}
/**
 * 这个方法用来添加消息提醒
 * @param title
 * @param content
 * @param personUuid
 * @param type
 */
Vue.prototype.addMessage = function(title,content,personUuid,type){
}

/* eslint-disable no-new */
var indicatrixAnalysis = new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})

import iview from 'iview'

import VueQriously from 'vue-qriously'
import baseConfig from 'ams-datamax/src/config/config'
import clipboard from 'clipboard'
Vue.prototype.$clipboard = clipboard
Vue.use(iview)
Vue.use(VueQriously)
Vue.mixin({
  data () {
    return {
      commonConfig: baseConfig
    }
  }
})
