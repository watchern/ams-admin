/** When your routing table is too long, you can split it into small modules **/

const baseRouter = {
  path: '/base',
  name: '公共管理',
  component: () => import('@/portal/default/index'),
  meta: {
  },
  children: [
    {
      path: 'opLog',
      name: '系统操作日志',
      component: () => import('@/views/base/opLog/index')
    },
    {
      path: 'errorLog',
      name: '系统异常日志',
      component: () => import('@/views/base/errorLog/index')
    },
    {
      path: 'sysdata',
      name: '基础数据',
      component: () => import('@/views/base/sysdata/index')
    },
    {
      path: 'basecodetree',
      name: '基础数据树',
      component: () => import('@/views/base/sysdata/basecodetreeinfo')
    },
    {
      path: 'remind',
      name: '系统提醒',
      component: () => import('@/views/base/remind/index')
    },
    {
      path: 'frameto',
      name: '跳转',
      component: () => import('@/views/base/frameto')
    },
    {
      path: 'querytask',
      name: '跳转',
      component: () => import('@/views/base/systemtask')
    }
  ]
}

export default baseRouter
