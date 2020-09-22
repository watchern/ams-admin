/** When your routing table is too long, you can split it into small modules **/

const analysisRouter = {
  path: '/analysis',
  name: '审计分析',
  component: () => import('@/views/Ace/home/index'),
  meta: {
  },
  children: [
    {
      path: 'auditModel',
      name: '审计模型',
      component: () => import('@/views/analysis/auditModel/index')
    }
  ]
}

export default analysisRouter
