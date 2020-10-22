/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


import Permissions from '../permissions'
import config from '../external/config'

const menu = {
  projects: [
    {
      name: '项目首页',
      id: 0,
      path: 'projects-index',
      isOpen: true,
      disabled: true,
      icon: 'ans-icon-home-solid',
      children: []
    },
    {
      name: '工作流',
      id: 1,
      path: '',
      isOpen: true,
      disabled: true,
      icon: 'ans-icon-gear',
      children: [
        {
          name: '工作流定义',
          path: 'definition',
          id: 0,
          disabled: true
        },
        {
          name: '工作流实例',
          path: 'instance',
          id: 1,
          disabled: true
        },
        {
          name: '任务实例',
          path: 'task-instance',
          id: 2,
          disabled: true
        },
        {
          name: '任务记录',
          path: 'task-record',
          id: 3,
          disabled: config.recordSwitch
        },
        {
          name: '历史任务记录',
          path: 'history-task-record',
          id: 4,
          disabled: config.recordSwitch
        }
      ]
    }
  ],

  security: [
    {
      name:  '租户管理',
      id: 0,
      path: 'tenement-manage',
      isOpen: true,
      disabled: true,
      icon: 'ans-icon-user-solid',
      children: []
    },
    {
      name: '用户管理',
      id: 1,
      path: 'users-manage',
      isOpen: true,
      disabled: true,
      icon: 'ans-icon-user-circle-solid',
      children: []
    },
    {
      name: '告警组管理',
      id: 2,
      path: 'warning-groups-manage',
      isOpen: true,
      disabled: true,
      icon: 'ans-icon-danger-solid',
      children: []
    },
    {
      name: 'Worker分组管理',
      id: 4,
      path: 'worker-groups-manage',
      isOpen: true,
      disabled: true,
      icon: 'ans-icon-diary',
      children: []
    },
    {
      name: '队列管理',
      id: 3,
      path: 'queue-manage',
      isOpen: true,
      disabled: true,
      icon: 'ans-icon-recycle',
      children: []
    },
    {
      name: '令牌管理',
      id: 2,
      path: 'token-manage',
      isOpen: true,
      icon: 'ans-icon-document',
      children: [],
      disabled: true
    }
  ],
  resource: [
    {
      name: '文件管理',
      id: 0,
      path: 'file',
      isOpen: true,
      icon: 'ans-icon-documents',
      children: [],
      disabled: true
    },
    {
      name: 'UDF管理',
      id: 1,
      path: '',
      isOpen: true,
      icon: 'ans-icon-document',
      disabled: true,
      children: [
        {
          name: '资源管理',
          path: 'resource-udf',
          id: 0,
          disabled: true
        },
        {
          name: '函数管理',
          path: 'resource-func',
          id: 1,
          disabled: true
        }
      ]
    }
  ],
  user: [
    {
      name: '用户信息',
      id: 0,
      path: 'account',
      isOpen: true,
      icon: 'ans-icon-user-solid',
      children: [],
      disabled: true
    },
    {
      name: '修改密码',
      id: 1,
      path: 'password',
      isOpen: true,
      icon: 'ans-icon-key',
      children: [],
      disabled: true
    },
    {
      name: '令牌管理',
      id: 2,
      path: 'token',
      isOpen: true,
      icon: 'ans-icon-diary',
      children: [],
      disabled: Permissions.getAuth()
    }
  ],
  monitor: [
    {
      name: '服务管理',
      id: 1,
      path: '',
      isOpen: true,
      disabled: true,
      icon: 'ans-icon-menu',
      children: [
        {
          name: 'Master',
          path: 'servers-master',
          id: 0,
          disabled: true
        },
        {
          name: 'Worker',
          path: 'servers-worker',
          id: 1,
          disabled: true
        },
        {
          name: 'Zookeeper',
          path: 'servers-zookeeper',
          id: 4,
          disabled: true
        },
        {
          name: 'DB',
          path: 'servers-db',
          id: 6,
          disabled: true
        }
      ]
    },
    {
      name: '统计管理',
      id: 0,
      path: '',
      isOpen: true,
      disabled: true,
      icon: 'ans-icon-menu',
      children: [
        {
          name: 'Statistics',
          path: 'statistics',
          id: 0,
          disabled: true
        }
      ]
    }
  ]
}

export default type => menu[type]
