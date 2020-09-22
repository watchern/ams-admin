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
      path: 'taskinstance',
      name: 'taskinstance',
      component: () => import('@/views/modules/etlscheduler/taskinstance/index'),
      meta: { title: 'taskinstance' }
    },
    {
      path: 'processinstance',
      name: 'processinstance',
      component: () => import('@/views/modules/etlscheduler/processinstance/index'),
      meta: { title: 'processinstance' }
    }
  ]
}

export default etlschedulerRouter
