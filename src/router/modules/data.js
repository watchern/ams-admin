/** When your routing table is too long, you can split it into small modules **/
const dataRouter = {
  path: '/data',
  name: '审计数据管理',
  component: () => import('@/portal/default/index'),
  meta: {
  },
  children: [
    /* 数据资源管理*/
    {
      path: 'bizattr',
      name: '业务属性',
      component: () => import('@/views/data/bizattr/index1')
    }, {
      path: 'table',
      name: '表注册',
      component: () => import('@/views/data/table/index')
    },
    /* 数据角色管理*/
    {
      path: 'directory',
      name: '数据资源目录',
      component: () => import('@/views/data/directory/index')
    }, {
      path: 'scene',
      name: '业务场景维护',
      component: () => import('@/views/data/scene/index')
    }, {
      path: 'sceneEdit',
      name: '业务场景维护',
      component: () => import('@/views/data/scene/edit')
    }, {
      path: 'resquery',
      name: '用户资源查询',
      component: () => import('@/views/data/resquery/index')
    }, {
      path: 'dict',
      name: '数据字典维护',
<<<<<<< HEAD
      component: () => import('@//views/data/transCode/index')
=======
      component: () => import('@/views/data/transcode/index')
>>>>>>> 25925bad005a0cdf8e737a542ae3165a5c9142de
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
      path: 'roleGrp/:roleUuid',
      name: '数据角色维护-角色用户组绑定',
      component: () => import('@/views/data/role-grp/index')
    }
  ]
}
export default dataRouter
