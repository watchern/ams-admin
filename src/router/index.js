import Vue from 'vue'
import Router from 'vue-router'
<<<<<<< HEAD
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
=======

Vue.use(Router)

/* Router Modules */
import dataRouter from './modules/data'
import baseRouter from './modules/base/base'
import etlschedulerRouter from './modules/etlscheduler/etlscheduler'
import analysisRouter from './modules/analysis/analysis'
import graphRouter from './modules/graphtool/graphtool'
const AmsRoutes = [
  {
    path: '/',
    redirect: '/ams/first'
  },
  {
    path: '/screenList',
    component: () => import('ams-datamax/src/components/screenList')
  },
  {
    path: 'publicScreenList',
    component: () => import('ams-datamax/src/components/bigScreen/admin/publicScreenList')
  },
  {
    path: '/screenEditor',
    component: () => import('ams-datamax/src/components/screenEditor')
  },
  {
    path: '/modelresulthandle',
    name: '模型结果处理',
    component: () => import('@/views/analysis/modelresulthandle/index')
  },
  {
    name: 'canvasPreview',
    path: '/canvasPreview',
    component: () => import('ams-datamax/src/components/canvasPreview')
  },
  {
    path: '/screenOp',
    component: () => import('ams-datamax/src/components/screenOp')
  }
  , {
    path: '/ams/assembly',
    component: () => import('@/views/ams/assembly/index')
  },
  {
    path: '/ams',
    name: 'ams',
    component: () => import('@/portal/default/index'),
    children: [
      {
        path: '',
        redirect: '/ams/first'
      },
      {
        path: 'first',
        name: 'amsFirst',
        component: () => import('@/views/ams/home/first/index')
      },
      {
        path: 'main',
        name: 'amsMain',
        meta: {
          isShowRightFooter: true
        },
        component: () => import('@/views/ams/home/main/index')
      }
    ]
  },
  {
    path: '/frameto',
    name: 'frameto',
    component: () => import('@/views/base/frameto')
  },
  {
    path: '/datamining',
    name: '数据挖掘',
    component: () => import('@/portal/default/index'),
    children: [{
      path: '/datamining/index',
      name: '数据挖掘',
      component: () => import('@/views/datamining/index')
    }]
  },
  dataRouter,
  baseRouter,
  analysisRouter,
  etlschedulerRouter,
  graphRouter
]

export const constantRoutes = [
  {
    path: '/redirect',
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/auth-redirect',
    component: () => import('@/views/login/auth-redirect'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error-page/401'),
    hidden: true
  }
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
export const asyncRoutes = [
  {
    path: '/permission',
    redirect: '/permission/page',
    alwaysShow: true, // will always show the root menu
    name: 'Permission',
    meta: {
      title: 'permission',
      icon: 'lock',
      roles: ['admin', 'editor'] // you can set roles in root nav
    },
    children: [
      {
        path: 'page',
        component: () => import('@/views/permission/page'),
        name: 'PagePermission',
        meta: {
          title: 'pagePermission',
          roles: ['admin'] // or you can only set roles in sub nav
        }
      },
      {
        path: 'directive',
        component: () => import('@/views/permission/directive'),
        name: 'DirectivePermission',
        meta: {
          title: 'directivePermission'
          // if do not set roles, means: this page does not require permission
        }
      },
      {
        path: 'role',
        component: () => import('@/views/permission/role'),
        name: 'RolePermission',
        meta: {
          title: 'rolePermission',
          roles: ['admin']
        }
      }
    ]
  },
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  scrollBehavior: () => ({ y: 0 }),
  routes: [...AmsRoutes, ...constantRoutes, ...asyncRoutes]
})

const router = createRouter()
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher
}
export default router
>>>>>>> f50f6d123e4736d2ced8b9459fadb87b9ff7a95d
