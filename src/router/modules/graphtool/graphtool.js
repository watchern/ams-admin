/** When your routing table is too long, you can split it into small modules **/

const graphRouter = {
  path: '/graphtool',
  name: '图形化工具',
  component: () => import('@/portal/default/index'),
  meta: {
  },
  children: [
    {
      path: 'graphlist/index',
      name: '图形列表',
      component: () => import('@/views/graphtool/index')
    }
  ]
}

export default graphRouter
