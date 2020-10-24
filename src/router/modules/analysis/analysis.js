/** When your routing table is too long, you can split it into small modules **/

const analysisRouter = {
  path: '/analysis',
  name: '审计分析',
  component: () => import('@/portal/default/index'),
  meta: {
  },
  children: [
    {
      path: 'auditModel',
      name: '审计模型',
      component: () => import('@/views/analysis/auditModel/index')
    },
    {
      path: 'auditModelResult',
      name: '模型运行结果',
      component: () => import('@/views/analysis/auditModelResult/index')
    },
    {
      path: 'auditModelParam',
      name: '模型参数',
      component: () => import('@/views/analysis/modelParam/index')
    }
  ]
}

export default analysisRouter
