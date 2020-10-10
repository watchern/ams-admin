/** When your routing table is too long, you can split it into small modules **/

const etlschedulerRouter = {
  path: '/etlscheduler',
  redirect: '/etlscheduler/datasource',
  component: () => import('@/views/Ace/home/index'),
  name: 'Etlscheduler',
  meta: {
    title: 'etlscheduler',
    icon: 'nested'
  },
  children: [
    {
      path: 'datasource',
      component: () => import('@/views/modules/etlscheduler/datasource/index'),
      name: 'datasource',
      meta: { title: 'datasource' }
    },
    {
      path: 'resources',
      name: 'Resources',
      meta: { title: 'resources' }
    },
    {
      path: 'paramfield',
      name: 'paramfield',
      component: () => import('@/views/modules/etlscheduler/paramfield/index'),
      meta: { title: 'paramfield' }
    },
    {
      path: 'dataresource',
      name: 'dataresource',
      component: () => import('@/views/modules/etlscheduler/dataresource/index'),
      meta: { title: 'dataresource' }
    },
    {
      path: 'processschedule',
      name: 'processschedule',
      component: () => import('@/views/modules/etlscheduler/processschedule/index'),
      meta: { title: 'processschedule' }
    },
    {
      path: 'taskinstance',
      name: 'taskinstance',
      component: () => import('@/views/modules/etlscheduler/taskinstance/index'),
      meta: { title: 'taskinstance' }
    },
    {
      path: 'workflow',
      name: 'workflow',
      component: () => import('@/views/modules/etlscheduler/workflow/index'),
      meta: { title: 'workflow' }
    },
    {
      path: 'processdefinition',
      name: 'processdefinition',
      component: () => import('@/views/modules/etlscheduler/processdefinition/index'),
      meta: { title: 'processdefinition' }
    },
    {
      path: 'taskmonitor',
      name: 'taskmonitor',
      component: () => import('@/views/modules/etlscheduler/taskmonitor/index'),
      meta: { title: 'taskmonitor' }
    },
    {
      path: 'processinstance',
      name: 'processinstance',
      component: () => import('@/views/modules/etlscheduler/processinstance/index'),
      meta: { title: 'processinstance' }
    },
    {
      path: 'definition/:id',
      name: 'projects-definition-details',
      component: resolve => require(['@/views/modules/etlscheduler/workflow/details/index'], resolve),
      meta: { title: `流程定义详情` }
    }
  ]
}

export default etlschedulerRouter
