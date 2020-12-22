/** When your routing table is too long, you can split it into small modules **/

const analysisRouter = {
  path: '/analysis',
  name: '审计分析',
  component: () => import('@/portal/default/index'),
  meta: {
  },
  children: [
    {
      path: 'auditmodel',
      name: '审计模型',
      component: () => import('@/views/analysis/auditmodel/index')
    },
    {
      path: 'auditmodelresult',
      name: '模型运行结果',
      component: () => import('@/views/analysis/auditmodelresult/index')
    },
    {
      path: 'auditmodelparam',
      name: '模型参数',
      component: () => import('@/views/analysis/modelparam/index')
    },
    {
      path: 'editormodel',
      name: '编辑模型',
      component: () => import('@/views/analysis/auditmodel/editmodel')
    },
    {
      path: 'auditWarning',
      name: '审计预警',
      component: () => import('@/views/analysis/auditwarning/auditwarninglist')
    },
    {
      path: 'modelshoppingcart',
      name: '审计预警',
      component: () => import('@/views/analysis/auditmodel/modelshoppingcart')
    },
    {
      path: 'warningresult',
      name: '审计预警结果',
      component: () => import('@/views/analysis/auditwarningresult/index')
    },
    {
      path: 'sqleditor',
      name: 'SQL编辑器',
      component: () => import('@/views/analysis/sqleditor/index')
    },
    {
      path: 'modelresulthandle',
      name: '模型结果处理',
      component: () => import('@/views/analysis/modelresulthandle/index')
    },
    {
      path: 'modelresultdetailshow',
      name: '模型详细结果展现',
      component: () => import('@/views/analysis/auditmodelresult/modelresultdetailshow')
    }
  ]
}


export default analysisRouter
