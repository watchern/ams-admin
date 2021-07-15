/** When your routing table is too long, you can split it into small modules **/
const analysisRouter = {
  path: '/analysis',
  name: '审计分析',
  component: (resolve) => require(['@/portal/' + (process.env.VUE_APP_BASE_MENU === 'withmenu'?'withmenu/' + process.env.VUE_APP_BASE_SKIN:'withoutmenu') + '/index'], resolve),
  meta: {
    // keepAlive: true
  },
  children: [
    {
      path: 'auditmodel',
      name: '审计模型',
      component: () => import('@/views/analysis/auditmodel/index')
      // component: () => import('@/views/analysis/auditmodel/boemodel/modellisttable')
    },
    //ps:京东方-新需求路由
    {
      path: 'boeauditmodel',
      name: '京东方审计模型',
      component: () => import('@/views/analysis/auditmodel/boemodel/modellisttable')
    },
    {
      path: 'auditmodelresult',
      name: '模型运行结果',
      component: () => import('@/views/analysis/auditmodelresult/index')
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
      component: () => import('@/views/analysis/sqleditor/index'),
      //2021.6.4 太仓需求sql编辑页保留编辑内容
      // meta: {
      //   keepAlive: true
      // },
    },
    {
      path: 'editormodelnew',
      name: '模型编(新)',
      component: () => import('@/views/analysis/auditmodelone/editmodel')
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
    },
    {
      path: 'screenList',
      name: '主题展示配置',
      component: () => import('ams-datamax/src/components/screenList')
    },
    {
      path: 'publicScreenList',
      name: '主题展示',
      component: () => import('ams-datamax/src/components/bigScreen/admin/publicScreenList')
    },
    {
      path: 'indicatoranalysis',
      name: '指标分析',
      component: () => import('@/views/analysis/indicatoranalysis/index')
    }
    ,
    {
      path: 'threadoldvalue',
      name: '阈值管理',
      component: () => import('@/views/analysis/thresholdvalue/index')
    }
    ,
    {
      path: 'parammanagerlist',
      name: '参数管理',
      component: () => import('@/views/analysis/modelparam/paramManager/parammanagerlist')
    }
  ]
}


export default analysisRouter
