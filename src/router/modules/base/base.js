/** When your routing table is too long, you can split it into small modules **/

const baseRouter = {
  path: '/base',
  name: '公共管理',
  component: () => import('@/views/Ace/home/index'),
  meta: {
  },
  children: [
    {
      path: 'opLog',
      name: '系统操作日志',
      component: () => import('@/views/base/errorLog/index')
    },
    {
      path: 'errorLog',
      name: '系统异常日志',
      component: () => import('@/views/base/errorLog/index')
    }
  ]
}

export default baseRouter
