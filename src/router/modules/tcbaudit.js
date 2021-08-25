/** When your routing table is too long, you can split it into small modules **/

// import Layout from '@/layout'

const tcbauditRouter = {
  path: '/audit',
  component: (resolve) => require(['@/portal/'+ (process.env.VUE_APP_BASE_MENU === 'withmenu'?'withmenu/' + process.env.VUE_APP_BASE_SKIN:'withoutmenu') + '/index'],resolve),
  // redirect: '/audit/project',
  name: '太仓农商行',
  meta: {
  },
  children: [
    {
      path: 'project',
      name: 'project',
      component: () => import('@TCB/views/audit/project'),
      meta: {
        title: '项目管理'
      }
    },
    {
      path: 'problem',
      name: 'problem',
      component: () => import('@TCB/views/audit/problem'),
      meta: {
        title: '问题管理'
      }
    },
    {
      path: 'audittasknode',
      name: 'audittasknode',
      component: () => import('@/views/tcbaudit/audittasknode'),
      meta: {
        title: '项目资料树'
      }
    }, 
    {
      path: 'personalManage',
      name: 'personalManage',
      component: () => import('@TCB/views/audit/personalManage'),
      meta: {
        title: '人员管理'
      }
    },
    // {
    //   path: 'modelresulthandle',
    //   name: 'modelresulthandle',
    //   component: () => import('@TCB/views/analysis/modelresulthandle'),
    //   meta: {
    //     title: '项目线索核实'
    //   }
    // },
    {
      path: 'riskwarning',
      name: 'riskwarning',
      component: () => import('@TCB/views/audit/riskwarning'),
      meta: {
        title: '风险提示'
      },
      hidden: true
    },
    {
      path: 'manageSuggest',
      name: 'manageSuggest',
      component: () => import('@TCB/views/audit/manageSuggest'),
      meta: {
        title: '管理建议'
      },
      hidden: true
    },
    {
      path: 'statisticsReport',
      name: 'statisticsReport',
      component: () => import('@TCB/views/audit/statisticsReport'),
      meta: {
        title: '报表统计'
      }
    }
  ]
}

export default tcbauditRouter
