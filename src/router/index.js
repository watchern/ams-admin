import Vue from 'vue'
import Router from 'vue-router'

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
  }, {
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
    path: '/graphtool/tooldic',
    name: '图形化工具',
    component: () => import('@/views/graphtool/tooldic/index')
  },
  {
    path: '/graphtool/tooldic/nodeSetting',
    name: '图形化工具节点配置',
    component: () => import('@/views/graphtool/tooldic/page/nodeSetting/nodeSetting')
  },
  {
    path: '/graphtool/tooldic/groupCount',
    name: '图形化工具分组汇总节点配置',
    component: () => import('@/views/graphtool/tooldic/page/nodeSetting/conditionSet/groupCount/groupCount')
  },
  {
    path: '/graphtool/tooldic/relation',
    name: '图形化工具数据关联节点配置',
    component: () => import('@/views/graphtool/tooldic/page/nodeSetting/conditionSet/relation/relation')
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
