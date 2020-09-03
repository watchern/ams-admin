/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const dataRouter = {
  path: '/ams-data',
  component: Layout,
  redirect: '/ams-data/role',
  name: 'Table',
  meta: {
    title: 'Role',
    icon: 'table'
  },
  children: [
    {
      path: 'role',
      component: () => import('@/views/charts/keyboard'),
      name: 'role',
      meta: { title: 'role' }
      /*path: 'keyboard',
      component: () => import('@/views/charts/keyboard'),
      name: 'KeyboardChart',
      meta: { title: 'keyboardChart', noCache: true }*/
    }
  ]
}
export default dataRouter
