import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '../components/HelloWorld'
import Login from '../views/login/login'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/login',//登录页
      name: 'Login',
      component: Login
    },
    {
      path: '/',//首页
      name: 'helloWorld',
      component: HelloWorld,
      meta: {
        requireAuth: true,  // 添加该字段，表示进入这个路由是需要登录的
      },
    }
  ]
})
