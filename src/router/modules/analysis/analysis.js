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
      path: 'check',
      name: '审计模型',
      component: () => import('@/views/flowwork/reivewCheck')
      // component: () => import('@/views/analysis/auditmodel/boemodel/modellisttable')
    },
    {
      path: 'auditmodel',
      name: '审计模型',
      component: () => import('@/views/analysis/auditmodel/index'),
      meta: {
        title: '模型管理-模型建模-模型列表'
      }
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
      component: () => import('@/views/analysis/auditmodelresult/index'),
      meta: {
        title: '模型管理-模型结果-模型运行结果'
      }
    },
    {
      path: 'editormodel',
      name: '编辑模型',
      component: () => import('@/views/analysis/auditmodel/editmodel')
    },
    {
      path: 'auditWarning',
      name: '审计预警',
      component: () => import('@/views/analysis/auditwarning/auditwarninglist'),
      meta: {
        title: '模型管理-模型运行-运行设置'
      }

    },
    {
      path: 'modelshoppingcart',
      name: '审计预警',
      component: () => import('@/views/analysis/auditmodel/modelshoppingcart')
    },
    {
      path: 'warningresult',
      name: '审计预警结果',
      component: () => import('@/views/analysis/auditwarningresult/index'),
      meta: {
        title: '模型管理-模型结果-定时运行结果'
      }
    },
    {
      path: 'warningresult/:runTaskUuid',
      name: '审计预警结果',
      component: resolve => require(['@/views/analysis/auditwarningresult/index'], resolve),
      meta: {
        title: '审计预警结果'
      }
    },
    {
      path: 'sqleditor',
      name: 'SQL编辑器',
      component: () => import('@/views/analysis/sqleditor/index'),
      meta: {
        title: '模型管理-模型建模-SQL建模'
      }
      //2021.6.4 太仓需求sql编辑页保留编辑内容
      // meta: {
      //   keepAlive: true
      // },
    },
    {
      path: 'editormodelnew',
      name: '模型编(新)',
      component: () => import('@/views/analysis/auditmodelone/editmodel'),
      meta: {
        title: '模型编辑'
      }
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
      component: () => import('@/views/analysis/thresholdvalue/index'),
      meta: {
        title: '模型管理-模型运行-阈值设置'
      }
    }
    ,
    {
      path: 'parammanagerlist',
      name: '参数管理',
      component: () => import('@/views/analysis/modelparam/paramManager/parammanagerlist'),
      meta: {
        title: '模型管理-模型建模-参数管理'
      }
    }
  ]
}


export default analysisRouter
