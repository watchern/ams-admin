import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: '指标分析',
      component: () => import('@/views/index')
    }
  ]
})
 