/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const etlschedulerRouter = {
  path: '/etlscheduler',
  component: Layout,
  redirect: '/etlscheduler/datasource',
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
      component: () => import('@/views/modules/etlscheduler/resources/index'),
      meta: { title: 'resources' }
    }
  ]
}

export default etlschedulerRouter
