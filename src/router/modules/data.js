/** When your routing table is too long, you can split it into small modules **/
<<<<<<< HEAD
=======

>>>>>>> dev-etl
const dataRouter = {
  path: '/data',
  name: '审计数据管理',
  component: () => import('@/portal/default/index'),
  meta: {
  },
  children: [
    {
      path: 'bizattr',
      name: '业务属性',
      component: () => import('@/views/data/bizattr/index1')
    }, {
      path: 'table',
      name: '表注册',
      component: () => import('@/views/data/table/index')
    }

  ]
}
export default dataRouter
