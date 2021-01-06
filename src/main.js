import Vue from 'vue'

import Cookies from 'js-cookie'

import 'normalize.css/normalize.css' // a modern alternative to CSS resets

import Element from 'element-ui'
import './styles/element-variables.scss'

// Ace start
import tool from '@/assets/Ace/js/tool'
Vue.prototype.$tool = tool
import create from '@/assets/Ace/js/create'
Vue.prototype.$create = create
import VueAnimateNumber from 'vue-animate-number'
Vue.use(VueAnimateNumber)
import '@/directive/Ace/scroll.js'
import components from '@/components/Ace/index'
Vue.use(components)
// Ace end

import '@/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'

import i18n from './lang' // internationalization
import './icons' // icon
import './permission' // permission control
import './utils/error-log' // error log

import * as filters from './filters' // global filters

// dolphin start

// import i18n1 from '@/components/Dolphin/i18n'
// import en_US from 'ans-ui/lib/locale/en' // eslint-disable-line
import 'ans-ui/lib/ans-ui.min.css'
import ans from 'ans-ui/lib/ans-ui.min'
// Vue.use(ans)
import 'canvg/dist/browser/canvg.min.js'
// Component internationalization
// const useOpt = i18n1.globalScope.LOCALE === 'en' || i18n1.globalScope.LOCALE === 'en_US' ? {
//   locale: en_US
// } : {}
// const useOpt = {}
const useOpt = {
  // locale: en_US
}

// Vue.use(ans)
Vue.use(ans, useOpt)

// end dolphin

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
import iview from 'iview'

import VueQriously from 'vue-qriously'
import baseConfig from 'ams-datamax/src/config/config'
import clipboard from 'clipboard'
import axios from 'axios'
import dataV from '@jiaminghi/data-view'
import VueAxios from 'vue-axios'
Vue.use(VueAxios, axios)
Vue.prototype.$clipboard = clipboard
Vue.prototype.$ajax = axios
Vue.use(iview)
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
  render: h => h(App)
})
