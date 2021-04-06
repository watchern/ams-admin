/** When your routing table is too long, you can split it into small modules **/

const graphRouter = {
    path: '/graphtool',
    name: '图形化工具',
    component: (resolve) => require(['@/portal/'+ process.env.VUE_APP_BASE_SKIN + '/index'],resolve),
    meta: {
    },
    children: [
        {
            path: 'graphlist/index',
            name: '图形列表',
            component: () => import('@/views/graphtool/index')
        },
        {
            path: '/graphtool/tooldic',
            name: '图形化工具',
            component: () => import('@/views/graphtool/tooldic/index')
        },
    ]
}

export default graphRouter
