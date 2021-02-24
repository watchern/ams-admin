/** When your routing table is too long, you can split it into small modules **/

const etlschedulerRouter = {
  path: '/etlscheduler',
  component: () => import('@/portal/default/index'),
  name: 'Etlscheduler',
  meta: {
  },
  children: [
    // {
    //   path: 'datasource/:id',
    //   name: 'datasource',
    //   component: resolve => require(['@/views/etlscheduler/workflow/details/index'], resolve),
    //   meta: { title: `流程定义详情` }
    // },
    {
      path: 'datasource',
      component: () => import('@ETL/views/etlscheduler/etlconfigure/datasource/index'),
      name: 'datasource',
      meta: {
        title: 'datasource'
      }
    },
    {
      path: 'resources',
      name: 'Resources',
      meta: {
        title: 'resources'
      }
    },
    {
      path: 'paramfield',
      name: 'paramfield',
      component: () => import('@ETL/views/etlscheduler/paramfield/index'),
      meta: {
        title: 'paramfield'
      }
    },
    {
      path: 'dataresource',
      name: 'dataresource',
      component: () => import('@ETL/views/etlscheduler/etlconfigure/dataresource/index'),
      meta: {
        title: 'dataresource'
      }
    },
    {
      path: 'processschedule',
      name: 'processschedule',
      component: () => import('@ETL/views/etlscheduler/processschedule/index'),
      meta: {
        title: 'processschedule'
      }
    },
    {
      path: 'taskinstance',
      name: 'taskinstance',
      component: () => import('@ETL/views/etlscheduler/taskinstance/index'),
      meta: {
        title: 'taskinstance'
      }
    },
    {
      path: 'workflow',
      name: 'workflow',
      component: () => import('@ETL/views/etlscheduler/workflow/index'),
      meta: {
        title: 'workflow'
      }
    },
    {
      path: 'processdefinition',
      name: 'processdefinition',
      component: () => import('@ETL/views/etlscheduler/processdefinition/index'),
      meta: {
        title: 'processdefinition'
      }
    },
    {
      path: 'taskmonitor',
      name: 'taskmonitor',
      component: () => import('@ETL/views/etlscheduler/taskmonitor/index'),
      meta: {
        title: 'taskmonitor'
      }
    },
    {
      path: 'servermonitor',
      name: 'servermonitor',
      component: () => import('@ETL/views/etlscheduler/servermonitor/index'),
      meta: {
        title: 'servermonitor'
      }
    },
    {
      path: 'dbmonitor',
      name: 'dbmonitor',
      component: () => import('@ETL/views/etlscheduler/dbmonitor/index'),
      meta: {
        title: 'dbmonitor'
      }
    },
    {
      path: 'processinstance',
      name: 'processinstance',
      component: () => import('@ETL/views/etlscheduler/processinstance/index'),
      meta: {
        title: 'processinstance'
      }
    },
    {
      path: 'taskinstance',
      name: 'taskinstance',
      component: () => import('@ETL/views/etlscheduler/taskinstance/index'),
      meta: {
        title: 'taskinstance'
      }
    },
    /*    {
      path: 'statistics',
      name: 'statistics',
      component: () => import('@ETL/views/etlscheduler/statistics/index'),
      meta: { title: 'statistics' }
    },*/
    {
      path: 'resourcestatistics',
      name: 'resourcestatistics',
      component: () => import('@ETL/views/etlscheduler/statistics/resourcestatistics/index'),
      meta: {
        title: 'resourcestatistics'
      }
    },
    {
      path: 'etlconfigure',
      name: 'etlconfigure',
      component: () => import('@ETL/views/etlscheduler/etlconfigure/index'),
      meta: {
        title: 'etlconfigure'
      }
    },
    {
      // 传递状态为1为查看，0为编辑
      path: 'definition/:id/:status',
      name: 'projectsdefinitiondetails',
      component: resolve => require(['@ETL/views/etlscheduler/workflow/details/index'], resolve),
      meta: {
        title: `流程定义详情`
      }
    },
    {
      path: 'instance/:id/:status',
      name: 'instancedetails',
      component: resolve => require(['@ETL/views/etlscheduler/processinstance/instance/index'], resolve),
      meta: {
        title: `流程实例详情`
      }
    },
    {
      path: 'resourcemonitor',
      name: 'datafile',
      component: () => import('@ETL/views/etlscheduler/datafile/index'),
      meta: {
        title: 'datafile'
      }
    },
    {
      path: 'fileresource',
      name: 'fileresource',
      component: () => import('@ETL/views/etlscheduler/fileresource/index'),
      meta: {
        title: 'fileresource'
      }
    },
    {
      path: 'filedirectory',
      name: 'filedirectory',
      component: () => import('@ETL/views/etlscheduler/etlconfigure/filedirectory/index'),
      meta: {
        title: 'filedirectory'
      }
    },
    {
      path: '/resource/file/create',
      name: 'resource-file-create',
      component: resolve => require(['@ETL/views/etlscheduler/fileresource/pages/file/pages/create/index'], resolve),
      meta: {
        title: `创建文件`
      }
    },
    {
      path: '/resource/file/createFolder',
      name: 'resource-file-createFolder',
      component: resolve => require(['@ETL/views/etlscheduler/fileresource/pages/file/pages/createFolder/index'], resolve),
      meta: {
        title: `创建文件夹`
      }
    },
    {
      path: '/resource/file/subFileFolder/:id',
      name: 'resource-file-subFileFolder',
      component: resolve => require(['@ETL/views/etlscheduler/fileresource/pages/file/pages/subFileFolder/index'], resolve),
      meta: {
        title: `创建资源`
      }
    },
    {
      path: '/resource/file/subFile/:id',
      name: 'resource-file-subFile',
      component: resolve => require(['@ETL/views/etlscheduler/fileresource/pages/file/pages/subFile/index'], resolve),
      meta: {
        title: `创建资源`
      }
    },
    {
      path: '/resource/file/list/:id',
      name: 'resource-file-details',
      component: resolve => require(['@ETL/views/etlscheduler/fileresource/pages/file/pages/details/index'], resolve),
      meta: {
        title: `文件详情`
      }
    },
    {
      path: '/resource/file/subdirectory/:id',
      name: 'resource-file-subdirectory',
      component: resolve => require(['@ETL/views/etlscheduler/fileresource/pages/file/pages/subdirectory/index'], resolve),
      meta: {
        title: `文件管理`
      }
    },
    {
      path: '/resource/file/edit/:id',
      name: 'resource-file-edit',
      component: resolve => require(['@ETL/views/etlscheduler/fileresource/pages/file/pages/edit/index'], resolve),
      meta: {
        title: `文件编辑`
      }
    }
    /*,
        {
          path: 'datafilestatisticslist',
          name: 'datafilestatisticslist',
          component: () => import('@ETL/views/etlscheduler/statistics/datafilestatistics/datafilestatisticslist'),
          meta: { title: 'datafilestatisticslist' }
        },
        {
          path: 'datafilestatistics',
          name: 'datafilestatistics',
          component: () => import('@ETL/views/etlscheduler/statistics/datafilestatistics/index'),
          meta: { title: 'datafilestatistics' }
        }*/
  ]
}

export default etlschedulerRouter
