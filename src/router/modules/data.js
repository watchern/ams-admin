/** When your routing table is too long, you can split it into small modules **/
const dataRouter = {
  path: '/data',
  name: '审计数据管理',
  component: () => import('@/portal/default/index'),
  meta: {
  },
  children: [
    {
      path: 'bizattr',
      name: '业务属性',
      component: () => import('@/views/data/bizattr/index1')
    }, {
      path: 'table',
      name: '表注册',
      component: () => import('@/views/data/table/index')
    }/*, {
      path: 'directory',
      name: '数据资源目录',
      component: () => import('@/views/data/directory/index')
    }, {
      path: 'scene',
      name: '业务场景维护',
      component: () => import('@/views/data/scene/index')
    }, {
      path: 'sceneEdit',
      name: '业务场景详情维护',
      component: () => import('@/views/data/scene/edit')
    }, {
      path: 'resquery',
      name: '用户资源查询',
      component: () => import('@/views/data/resquery/index')
    }, {
      path: 'dict',
      name: '数据字典维护',
      component: () => import('@/views/base/sysDate/index')
    }, {
      path: 'tblrel',
      name: '表关联关系维护',
      component: () => import('@/views/data/tblrel/index')
    }, {
      path: 'role',
      name: '数据角色维护',
      component: () => import('@/views/data/role/index')
    }, {
      path: 'roleRes/:roleUuid',
      name: '数据角色维护-角色资源绑定',
      component: () => import('@/views/data/role-res/index')
    }, {
      path: 'transCode',
      name: '数据转码',
      component: () => import('@/views/data/transCode/index')
    }*/
  ]
}
export default dataRouter
