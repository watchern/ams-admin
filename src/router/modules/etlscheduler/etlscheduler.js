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
    }
  ]
}

export default etlschedulerRouter
