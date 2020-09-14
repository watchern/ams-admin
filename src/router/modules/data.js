/** When your routing table is too long, you can split it into small modules **/


const dataRouter = {
  path: '/data',
  name: '审计数据管理',
  component: () => import('@/views/Ace/home/index'),
  meta: {
  },
  children: [
    {
      path: 'bizattr',
      name: '业务属性',
      component: () => import('@/views/data/bizattr/index')
    },{
      path: 'table',
      name: '表注册',
      component: () => import('@/views/Ace/home/first/index')
    }

  ]
}
export default dataRouter
