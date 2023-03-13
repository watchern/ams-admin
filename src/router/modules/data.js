/** When your routing table is too long, you can split it into small modules **/
const dataRouter = {
  path: "/data",
  name: "审计数据管理",
  component: (resolve) =>
    require([
      "@/portal/" +
      (process.env.VUE_APP_BASE_MENU === "withmenu"
        ? "withmenu/" + process.env.VUE_APP_BASE_SKIN
        : "withoutmenu") +
      "/index",
    ], resolve),
  meta: {},
  children: [
    /* 数据资源管理*/
    {
      path: "bizattr",
      name: "业务属性",
      component: () => import("@/views/data/bizattr/index"),
    },
    {
      path: "table",
      name: "表注册",
      component: () => import("@/views/data/table/index"),
      meta: {
        title: "数据管理-数据准备-数据表管理",
      },
    },
    {
      path: "table/detail",
      name: "表详情",
      component: () => import("@/views/data/table/detailfores"),
      meta: {
        title: "数据管理-数据准备-数据表管理",
      },
    },
    {
      path: "datapermission",
      name: "数据使用权限申请",
      component: () => import("@/views/data/dataPermission/index"),
      meta: {
        title: "数据管理-数据准备-数据使用权限申请",
      },
    },
    {
      path: "sensitivedata",
      name: "敏感数据识别",
      component: () => import("@/views/data/sensitiveData/index"),
      meta: {
        title: "数据管理-数据安全-敏感数据识别",
      },
    },
    /* 数据角色管理*/
    {
      path: "directory",
      name: "数据资源目录",
      component: () => import("@/views/data/directory/index"),
      meta: {
        title: "数据管理-数据字典",
      },
    },
    {
      path: "scene",
      name: "业务场景维护",
      component: () => import("@/views/data/scene/index"),
    },
    {
      path: "sceneEdit",
      name: "业务场景维护",
      component: () => import("@/views/data/scene/edit"),
    },
    {
      path: "resquery",
      name: "用户资源查询",
      component: () => import("@/views/data/resquery/index"),
    },
    {
      path: "transcode",
      name: "数据转码维护",
      component: () => import("@/views/data/transcode/index"),
      meta: {
        title: "数据管理-数据准备-数据转码",
      },
    },
    {
      path: "dataResManagement",
      name: "数据资源管理",
      component: () => import("@/views/data/dataResManagement/index"),
    },
    {
      path: 'dataloadapply',
      name: '数据装载与下线',
      component: () => import("@/views/data/dataLoadApply/index"),
      meta: {
        title: '数据管理-数据资源展示-数据装载与下线'
      }
    },
    {
      path: 'dataResManagement',
      name: '数据资源管理',
      component: () => import('@/views/data/dataResManagement/index'),
      meta: {
        title: "数据管理-数据准备-数据资源管理",
      },
    },
    {
      path: "dataAccreditationManagement",
      name: "数据认权管理",
      component: () =>
        import("@/views/data/dataAccreditationManagement/index"),
      meta: {
        title: "数据管理-数据准备-数据认权管理",
      },
    },

    {
      path: "data_resource_analysis",
      name: "数据资源分析",
      component: () => import("@/views/data/data_resource_analysis/index"),
      meta: {
        title: "数据管理-数据准备-数据资源分析",
      },
    },
    {
      path: "data_resource_preview",
      name: "数据资源预览",
      component: () => import("@/views/data/data_resource_preview/index"),
      meta: {
        title: "数据管理-数据准备-数据资源预览",
      },
    },

    {
      path: "dataResMap",
      name: "数据资源地图",
      component: () => import("@/views/data/dataResMap/index"),
      meta: {
        title: "数据管理-数据准备-数据资源地图",
      },
    },
    {
      path: "dict",
      name: "数据字典维护",
      component: () => import("@/views/data/dict/index"),
      meta: {
        title: "数据管理-数据字典",
      },
    },
    {
      path: "tblrel",
      name: "表关联关系维护",
      component: () => import("@/views/data/tblrel/index"),
      meta: {
        title: "数据管理-数据准备-表关系管理",
      },
    },
    {
      path: "role/:sceneCode",
      name: "数据角色维护",
      component: () => import("@/views/data/role/index"),
      meta: {
        title: "数据管理-数据授权",
      },
    },
    {
      path: "role/auditor",
      name: "数据授权",
      component: () => import("@/views/data/role/index"),
      meta: {
        title: "数据管理-数据授权",
      },
    },
    {
      path: "roleRes/:roleUuid",
      name: "数据角色维护-角色资源绑定",
      component: () => import("@/views/data/role-res/indexnew"),
    },
    {
      path: "roleGrp/:roleUuid/:sceneCode",
      name: "数据角色维护-角色用户组绑定",
      component: () => import("@/views/data/role-grp/index"),
    },
    {
      path: "formula",
      name: "指标计算公式维护",
      component: () => import("@/views/data/formula/index"),
    },
    {
      path: "workspace/:sceneCode",
      name: "项目空间",
      component: () => import("@/views/data/project/index"),
    },
    {
      path: "config",
      name: "运维操作",
      component: () => import("@/views/data/config/index"),
    },
    {
      path: "expansion",
      name: "扩容",
      component: () => import("@/views/data/expansion/index"),
      meta: {
        title: "数据管理-扩容",
      },
    },
    {
      path: "personalSpaceManage",
      name: "扩容",
      component: () => import("@/views/data/personalSpaceManage/index"),
      meta: {
        title: "数据管理-管理",
      },
    },
    {
      path: 'dataOamResource',
      name: '数据质量规则管理维护',
      component: () => import('@/views/data/dataOamResource/index'),
      meta: {
        title: "数据管理-数据准备-数据质量规则管理维护"
      }
    },
    {
      path: 'datapermissionsquery',
      name: '数据权限查询',
      component: () => import('@/views/data/dataPermissionsQuery/index')
    },
    {
      path: 'exportapproval',
      name: '导出数据审批流程',
      component: () => import('@/views/data/exportApproval/index')
    },
    {
      path: 'dataaccessrequest',
      name: '数据接入申请',
      component: () => import('@/views/data/dataAccessRequest/index')
    },
    {
      path: 'databrowsing',
      name: '数据资源浏览',
      component: () => import('@/views/data/dataBrowsing/index')
    },
    {
      path: 'databromanage',
      name: '数据资源管理',
      component: () => import('@/views/data/dataBroManage/index')
    },
  ],
};
export default dataRouter;
